import { Vec3 } from "../lib/TSM.js";
import { CubeCollider } from "./Colliders.js";
import { Noise } from "./Noise.js";
import { print } from "./Utils.js";
export class noise_map_data {
    constructor(_seed = '42', _scale = 75, _height = 16, _freq = 1, _octs = 4, _pers = 0.1, _lacu = 5) {
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
        //console.log('chunk coords: ' + print.v2(_coord))
        this.x = centerX;
        this.y = centerY;
        this.size = size;
        this.cubes = size * size;
        this.cube_colliders = new Array();
        this.noise_data = _noise_data;
        this.coord = _coord;
        this.pos = _coord.copy().scale(size);
        console.log('chunk pos: ' + print.v2(this.pos));
        this.generateCubes();
    }
    generateCubes() {
        const topleftx = this.x - this.size / 2;
        const toplefty = this.y - this.size / 2;
        // The real landscape-generation logic. The example code below shows you how to use the pseudorandom number generator to create a few cubes.
        this.cubes = this.size * this.size;
        this.cubePositionsF32 = new Float32Array(4 * this.cubes);
        let height_map = Noise.generate_noise_map(this.size, this.noise_data.seed, this.noise_data.scale, this.noise_data.freq, this.noise_data.octs, this.noise_data.pers, this.noise_data.lacu, this.pos.copy(), true);
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const height = height_map[i][j] * this.noise_data.height;
                const idx = this.size * i + j;
                const x = topleftx + j;
                const z = toplefty + i;
                this.cubePositionsF32[4 * idx + 0] = x;
                this.cubePositionsF32[4 * idx + 1] = Math.floor(height);
                this.cubePositionsF32[4 * idx + 2] = z;
                this.cubePositionsF32[4 * idx + 3] = 0;
                //console.log('cube: ' + idx + ', a: ' + x + ', b: ' + z + ', height: ' + height)
                // create cube collider for block
                this.cube_colliders.push(new CubeCollider(new Vec3([x, height, z])));
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