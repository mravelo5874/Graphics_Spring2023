import { Vec3 } from "../lib/TSM.js";
import { CubeCollider } from "./Colliders.js";
import { Noise } from "./Noise.js";
import { Utils } from "./Utils.js";
export class noise_map_data {
    constructor(
    // default terrain values
    _seed = '42', _scale = 75, _height = 24, _freq = 1, _octs = 4, _pers = 0.1, _lacu = 5) {
        this.seed = _seed;
        this.scale = _scale;
        this.height = _height;
        this.freq = _freq;
        this.octs = _octs;
        this.pers = _pers;
        this.lacu = _lacu;
    }
}
export class Chunk {
    constructor(centerX, centerY, size, _noise_data, _coord) {
        this.x = centerX;
        this.y = centerY;
        this.size = size;
        this.cubes = size * size; // height cubes
        this.cube_pos = new Array();
        this.cube_colliders = new Array();
        this.noise_data = _noise_data;
        this.pos = _coord.copy().scale(size);
        // generate cubes in chunk
        this.generate_height_cubes();
        this.generate_fill_cubes();
        // create array f32 array
        this.cubePositionsF32 = new Float32Array(4 * this.cube_pos.length);
        for (let i = 0; i < this.cube_pos.length; i++) {
            this.cubePositionsF32[(4 * i) + 0] = this.cube_pos[i].x;
            this.cubePositionsF32[(4 * i) + 1] = this.cube_pos[i].y;
            this.cubePositionsF32[(4 * i) + 2] = this.cube_pos[i].z;
            this.cubePositionsF32[(4 * i) + 3] = 0;
        }
    }
    generate_height_cubes() {
        const topleftx = this.x - this.size / 2;
        const toplefty = this.y - this.size / 2;
        this.cubes = this.size * this.size;
        this.cubePositionsF32 = new Float32Array(4 * this.cubes);
        // generate noise map from terrain data
        let height_map = Noise.generate_noise_map(this.size, this.noise_data.seed, this.noise_data.scale, this.noise_data.freq, this.noise_data.octs, this.noise_data.pers, this.noise_data.lacu, this.pos.copy(), true);
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const height = height_map[j][i] * this.noise_data.height;
                const x = topleftx + j;
                const y = Math.floor(height);
                const z = toplefty + i;
                // add cubes to f32 array for generate_fill_cubes()
                const idx = this.size * j + i;
                this.cubePositionsF32[4 * idx + 0] = x;
                this.cubePositionsF32[4 * idx + 1] = y;
                this.cubePositionsF32[4 * idx + 2] = z;
                this.cubePositionsF32[4 * idx + 3] = 0;
                // add cube to pos and collider arrays
                this.cube_pos.push(new Vec3([x, y, z]));
                this.cube_colliders.push(new CubeCollider(new Vec3([x, y, z])));
            }
        }
    }
    generate_fill_cubes() {
        const num_height_cubes = this.cubePositionsF32.length;
        // for every cube (excluding all edge blocks)
        for (let i = 0; i < this.size; i++) // z-direction
         {
            for (let j = 0; j < this.size; j++) // x-direction
             {
                // get cube position values
                const idx = this.size * j + i;
                const my_x = this.cubePositionsF32[4 * idx + 0];
                const my_y = this.cubePositionsF32[4 * idx + 1];
                const my_z = this.cubePositionsF32[4 * idx + 2];
                // do something different for edge cubes 
                if (i == 0 || i == Utils.CHUNK_SIZE - 1 || j == 0 || j == Utils.CHUNK_SIZE - 1) {
                    const fill_cubes = 4;
                    for (let i = 1; i < fill_cubes; i++) {
                        // add cube to pos and collider arrays
                        this.cubes++;
                        this.cube_pos.push(new Vec3([my_x, my_y - i, my_z]));
                        this.cube_colliders.push(new CubeCollider(new Vec3([my_x, my_y - i, my_z])));
                    }
                    continue;
                }
                // get 8 neighbor cube heights
                const n_idx = this.size * j + (i + 1);
                const ne_idx = this.size * (j + 1) + (i + 1);
                const e_idx = this.size * (j + 1) + i;
                const se_idx = this.size * (j + 1) + (i - 1);
                const s_idx = this.size * j + (i - 1);
                const sw_idx = this.size * (j - 1) + (i - 1);
                const w_idx = this.size * (j - 1) + i;
                const nw_idx = this.size * (j - 1) + (i + 1);
                // find min height of neightbooring cubes
                let min_height = my_y;
                // make sure neighbor indexes are valid before checking!
                // north
                if (n_idx >= 0 && n_idx < num_height_cubes) {
                    const y = this.cubePositionsF32[4 * n_idx + 1];
                    if (y < min_height)
                        min_height = y;
                }
                // north-east
                if (ne_idx >= 0 && ne_idx < num_height_cubes) {
                    const y = this.cubePositionsF32[4 * ne_idx + 1];
                    if (y < min_height)
                        min_height = y;
                }
                // east
                if (e_idx >= 0 && e_idx < num_height_cubes) {
                    const y = this.cubePositionsF32[4 * e_idx + 1];
                    if (y < min_height)
                        min_height = y;
                }
                // south-east
                if (se_idx >= 0 && se_idx < num_height_cubes) {
                    const y = this.cubePositionsF32[4 * se_idx + 1];
                    if (y < min_height)
                        min_height = y;
                }
                // south
                if (s_idx >= 0 && s_idx < num_height_cubes) {
                    const y = this.cubePositionsF32[4 * s_idx + 1];
                    if (y < min_height)
                        min_height = y;
                }
                // south-west
                if (sw_idx >= 0 && sw_idx < num_height_cubes) {
                    const y = this.cubePositionsF32[4 * sw_idx + 1];
                    if (y < min_height)
                        min_height = y;
                }
                // west
                if (w_idx >= 0 && w_idx < num_height_cubes) {
                    const y = this.cubePositionsF32[4 * w_idx + 1];
                    if (y < min_height)
                        min_height = y;
                }
                // north-west
                if (nw_idx >= 0 && nw_idx < num_height_cubes) {
                    const y = this.cubePositionsF32[4 * nw_idx + 1];
                    if (y < min_height)
                        min_height = y;
                }
                if (i == 0 || i == Utils.CHUNK_SIZE - 1 || j == 0 || j == Utils.CHUNK_SIZE - 1) {
                    if (my_y - min_height > 4)
                        console.log('pos: ' + j + ', ' + i + ', cube_y: ' + my_y + ', min_y: ' + min_height);
                }
                // add fill cubes if needed
                if (min_height < my_y) {
                    const fill_cubes = my_y - min_height;
                    for (let i = 1; i < fill_cubes; i++) {
                        // add cube to pos and collider arrays
                        this.cubes++;
                        this.cube_pos.push(new Vec3([my_x, my_y - i, my_z]));
                        this.cube_colliders.push(new CubeCollider(new Vec3([my_x, my_y - i, my_z])));
                    }
                }
            }
        }
    }
    get_cube_colliders() {
        return this.cube_colliders;
    }
    cubePositions() {
        return this.cubePositionsF32;
    }
    numCubes() {
        return this.cubes;
    }
}
//# sourceMappingURL=Chunk.js.map