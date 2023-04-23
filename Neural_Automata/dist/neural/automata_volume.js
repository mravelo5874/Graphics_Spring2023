import Rand from "../lib/rand-seed/Rand.js";
export class automata_volume {
    constructor(_size) {
        this.size = _size;
        this.volume = [];
        for (let x = 0; x < this.size; x++) {
            this.volume[x] = [];
            for (let y = 0; y < this.size; y++) {
                this.volume[x][y] = [];
                for (let z = 0; z < this.size; z++) {
                    this.volume[x][y][z] = 0;
                }
            }
        }
        this.create_uint8();
    }
    get_size() { return this.size; }
    get_volume() { return this.volume_uint8; }
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