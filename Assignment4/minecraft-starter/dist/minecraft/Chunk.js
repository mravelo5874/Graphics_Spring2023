import { Vec3 } from "../lib/TSM.js";
import { CubeCollider } from "./Colliders.js";
import { Noise } from "./Noise.js";
export class noise_map_data {
    constructor(_seed = '42', _scale = 64, _freq = 1, _octs = 4, _pers = 0.5, _lacu = 2) {
        this.seed = _seed;
        this.scale = _scale;
        this.freq = _freq;
        this.octs = _octs;
        this.pers = _pers;
        this.lacu = _lacu;
    }
}
export class Chunk {
    constructor(centerX, centerY, size, _noise_data) {
        this.x = centerX;
        this.y = centerY;
        this.size = size;
        this.cubes = size * size;
        this.cube_colliders = new Array();
        this.noise_data = _noise_data;
        this.generateCubes();
    }
    generateCubes() {
        const topleftx = this.x - this.size / 2;
        const toplefty = this.y - this.size / 2;
        // The real landscape-generation logic. The example code below shows you how to use the pseudorandom number generator to create a few cubes.
        this.cubes = this.size * this.size;
        this.cubePositionsF32 = new Float32Array(4 * this.cubes);
        let height_map = Noise.generate_noise_map(this.size, this.noise_data.seed, this.noise_data.scale, this.noise_data.freq, this.noise_data.octs, this.noise_data.pers, this.noise_data.lacu);
        //console.log('height map: ' + height_map)
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const height = height_map[i][j] * 24;
                const idx = this.size * i + j;
                const x = topleftx + j;
                const z = toplefty + i;
                this.cubePositionsF32[4 * idx + 0] = x;
                this.cubePositionsF32[4 * idx + 1] = height;
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