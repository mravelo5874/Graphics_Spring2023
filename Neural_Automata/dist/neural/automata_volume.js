import { Vec3 } from "../lib/TSM.js";
import Rand from "../lib/rand-seed/Rand.js";
import { activation_3d } from "./activations_3d.js";
import { noise, noise_map_data } from "./noise.js";
import { utils } from "./utils.js";
export class automata_volume {
    constructor(_size, _kernel, _activation) {
        this.size = _size;
        this.kernel = _kernel;
        this.activation = _activation;
        this.volume = this.create_empty_volume(_size);
        this.map_data = new noise_map_data();
        this.create_uint8();
    }
    get_size() { return this.size; }
    get_volume() { return this.volume_uint8; }
    apply_convolutiuon_update() {
        let v = this.create_empty_volume(this.size);
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                for (let z = 0; z < this.size; z++) {
                    v[x][y][z] = this.calculate_convolution(new Vec3([x, y, z]));
                }
            }
        }
        // update volume arrays
        this.volume = v;
        this.create_uint8();
    }
    calculate_convolution(pos) {
        let sum = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                for (let k = -1; k <= 1; k++) {
                    // get offset positions
                    let x = pos.x + i;
                    let y = pos.x + j;
                    let z = pos.x + k;
                    // make sure to wrap volume if out of bounds
                    if (x > this.size - 1)
                        x = 0;
                    if (x < 0)
                        x = this.size - 1;
                    if (y > this.size - 1)
                        y = 0;
                    if (y < 0)
                        y = this.size - 1;
                    if (z > this.size - 1)
                        z = 0;
                    if (z < 0)
                        z = this.size - 1;
                    sum += this.volume[x][y][z] * this.kernel[i + 1][j + 1][k + 1];
                }
            }
        }
        return activation_3d.perfrom_activation(sum, this.activation);
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
    randomize_volume(seed) {
        console.log('seed: ' + seed);
        let rng = new Rand(seed);
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                for (let z = 0; z < this.size; z++) {
                    let val = 0;
                    const r = rng.next();
                    if (r >= 0.95) {
                        val = 1;
                    }
                    this.volume[x][y][z] = val;
                }
            }
        }
        this.create_uint8();
    }
    perlin_volume(seed, offset) {
        const perlin_data = noise.generate_perlin_volume(this.size, this.map_data, offset, true);
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                for (let z = 0; z < this.size; z++) {
                    this.volume[x][y][z] = perlin_data[x][y][z];
                }
            }
        }
        this.create_uint8();
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