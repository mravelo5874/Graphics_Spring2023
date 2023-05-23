import { Vec3 } from "../lib/TSM.js";
import Rand from "../lib/rand-seed/Rand.js";
import noise from "./noise.js";
import noise_map_data from "./map_data.js";
import { utils } from "./utils.js";
import { neural_type } from "./app3D.js";
import { kernels_3d } from "./kernels_3d.js";
export class automata_volume {
    size;
    volume;
    cells;
    map_data;
    volume_uint8;
    my_rule;
    pause = false;
    // perlin stuff
    perlin_worker;
    perlin_offset;
    perlin_running = false;
    // rules stuff
    rule_worker;
    rule_running = false;
    // neural stuff
    neural_worker;
    neural_running = false;
    my_neural;
    kernel;
    constructor(_size, _rule) {
        this.size = _size;
        this.my_rule = _rule;
        this.volume = this.create_empty_volume(_size);
        this.cells = this.create_empty_volume(_size);
        this.map_data = new noise_map_data(Date.now.toString(), 16.0, // scale
        0.0, // height
        1.0, //freq
        1.0, // oct
        0.1, // pers
        5.0);
        this.create_uint8();
    }
    get_size() { return this.size; }
    get_volume() { return this.volume_uint8; }
    set_rule(_rule) { this.my_rule = _rule; }
    destroy() {
        if (this.neural_worker)
            this.neural_worker.terminate();
        if (this.rule_worker)
            this.rule_worker.terminate();
        if (this.perlin_worker)
            this.perlin_worker.terminate();
    }
    create_empty_volume(_size) {
        let v = [];
        for (let x = 0; x < _size; x++) {
            v[x] = [];
            for (let y = 0; y < _size; y++) {
                v[x][y] = [];
                for (let z = 0; z < _size; z++) {
                    v[x][y][z] = 0;
                }
            }
        }
        return v;
    }
    pause_neural() {
        this.neural_running = false;
    }
    resume_neural() {
        this.neural_running = true;
        this.neural_loop();
    }
    set_neural(type) {
        if (this.my_neural == type)
            return;
        this.my_neural = type;
        switch (type) {
            default:
            case neural_type.worms:
                this.kernel = kernels_3d.get_kernel(type);
            case neural_type.stars:
            case neural_type.waves:
                this.randomize_volume(Date.now().toString());
                break;
        }
    }
    neural_loop() {
        if (!this.neural_running)
            return;
        this.neural_worker.postMessage([this.size, this.my_neural, this.volume, this.kernel]);
        this.neural_worker.onmessage = (event) => {
            if (this.neural_running) {
                // recieve message from worker and update volume
                this.volume = event.data[0];
                this.create_uint8();
                // start again
                this.neural_loop();
            }
        };
    }
    start_neural() {
        if (!this.neural_running) {
            this.init_neural_cells();
            if (this.neural_worker)
                this.neural_worker.terminate();
            this.neural_worker = new Worker('neural/workers/neural_worker.js', { type: 'module' });
            this.neural_running = true;
            this.neural_loop();
        }
    }
    stop_neural() {
        if (this.neural_running) {
            this.neural_running = false;
            this.neural_worker.terminate();
            // clear volume and cells
            this.volume = this.create_empty_volume(this.size);
            this.cells = this.create_empty_volume(this.size);
        }
    }
    update_kernel(_k) {
        // stop running if currently running
        if (this.neural_running) {
            this.neural_running = false;
            this.neural_worker.terminate();
        }
        // reset volume and start neural worker with new kernel
        this.kernel = _k;
        this.randomize_volume(Date.now().toString());
        this.start_neural();
    }
    init_neural_cells() {
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                for (let z = 0; z < this.size; z++) {
                    this.cells[x][y][z] = this.volume[x][y][z];
                }
            }
        }
    }
    sphere_volume(radius = Math.floor(this.size / 2)) {
        if (radius < 2)
            radius = 2;
        let x = Math.floor(this.size / 2);
        const center = new Vec3([x, x, x]);
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                for (let z = 0; z < this.size; z++) {
                    let v = 0;
                    if (Vec3.distance(center, new Vec3([x, y, z])) < radius - 1) {
                        v = 1;
                    }
                    this.volume[x][y][z] = v;
                }
            }
        }
        this.create_uint8();
    }
    organize_volume() {
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                for (let z = 0; z < this.size; z++) {
                    this.volume[x][y][z] = utils.inverse_lerp(0, this.size * this.size * this.size, x * y * z);
                }
            }
        }
        this.create_uint8();
    }
    binary_randomize_volume(seed, thresh) {
        let rng = new Rand(seed);
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                for (let z = 0; z < this.size; z++) {
                    let v = 0;
                    if (rng.next() > thresh) {
                        v = 1;
                    }
                    this.volume[x][y][z] = v;
                }
            }
        }
        this.create_uint8();
    }
    randomize_volume(seed) {
        let rng = new Rand(seed);
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                for (let z = 0; z < this.size; z++) {
                    this.volume[x][y][z] = rng.next();
                }
            }
        }
        this.create_uint8();
    }
    pause_perlin() {
        this.perlin_running = false;
    }
    resume_perlin() {
        this.perlin_running = true;
        this.perlin_loop();
    }
    start_perlin() {
        if (!this.perlin_running) {
            if (this.perlin_worker)
                this.perlin_worker.terminate();
            this.perlin_worker = new Worker('neural/workers/perlin_worker.js', { type: 'module' });
            this.perlin_running = true;
            this.perlin_offset = Vec3.zero.copy();
            this.perlin_loop();
        }
    }
    perlin_loop() {
        if (!this.perlin_running)
            return;
        const o = this.perlin_offset;
        this.perlin_worker.postMessage([this.size, o.x, o.y, o.z, this.map_data]);
        this.perlin_worker.onmessage = (event) => {
            if (this.perlin_running) {
                // recieve message from worker and update volume
                this.volume = event.data;
                this.create_uint8();
                let x = this.perlin_offset.x + 0.2;
                this.perlin_offset = new Vec3([x, x, x]);
                // start again
                this.perlin_loop();
            }
        };
    }
    stop_perlin() {
        if (this.perlin_running) {
            this.perlin_running = false;
            this.perlin_worker.terminate();
            this.volume = this.create_empty_volume(this.size);
            this.cells = this.create_empty_volume(this.size);
        }
    }
    perlin_volume(seed, offset) {
        const perlin_data = noise.generate_perlin_volume(this.size, this.map_data, offset, true);
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                for (let z = 0; z < this.size; z++) {
                    let p = 0;
                    if (perlin_data[x][y][z] > 0.1) {
                        p = 1;
                    }
                    this.volume[x][y][z] = p;
                }
            }
        }
        this.create_uint8();
    }
    init_rule_cells() {
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                for (let z = 0; z < this.size; z++) {
                    if (this.volume[x][y][z] > 0) {
                        this.cells[x][y][z] = this.my_rule.init_states;
                    }
                }
            }
        }
    }
    pause_rule() {
        this.rule_running = false;
    }
    resume_rule() {
        this.rule_running = true;
        this.rule_loop();
    }
    start_rule() {
        if (!this.rule_running) {
            this.init_rule_cells();
            if (this.rule_worker)
                this.rule_worker.terminate();
            this.rule_worker = new Worker('neural/workers/rule_worker.js', { type: 'module' });
            this.rule_running = true;
            this.rule_loop();
        }
    }
    rule_loop() {
        if (!this.rule_running)
            return;
        this.rule_worker.postMessage([this.size, this.cells, this.my_rule, this.volume]);
        this.rule_worker.onmessage = (event) => {
            if (this.rule_running) {
                // recieve message from worker and update volume
                this.cells = event.data[0];
                this.volume = event.data[1];
                this.create_uint8();
                // start again
                this.rule_loop();
            }
        };
    }
    stop_rule() {
        if (this.rule_running) {
            this.rule_running = false;
            this.rule_worker.terminate();
            // clear volume and cells
            this.volume = this.create_empty_volume(this.size);
            this.cells = this.create_empty_volume(this.size);
        }
    }
    create_uint8() {
        this.volume_uint8 = new Uint8Array(this.size * this.size * this.size);
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                for (let z = 0; z < this.size; z++) {
                    this.volume_uint8[z + (y * this.size) + (x * this.size * this.size)] = Math.floor(this.volume[x][y][z] * 255);
                }
            }
        }
    }
}
//# sourceMappingURL=automata_volume.js.map