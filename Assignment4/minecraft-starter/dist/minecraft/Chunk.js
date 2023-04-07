import { Vec3 } from "../lib/TSM.js";
import { CubeCollider } from "./Colliders.js";
import { Noise } from "./Noise.js";
import { CubeFace, Utils } from "./Utils.js";
export class chunk_data {
    get_id() { return this.id.copy(); }
    get_cubes() {
        let cubes_copy = new Array();
        for (let i = 0; i < this.cubes.length; i++) {
            cubes_copy.push(this.cubes[i].copy());
        }
        return cubes_copy;
    }
    constructor(_id, _cubes) {
        this.id = _id;
        this.cubes = new Array();
        for (let i = 0; i < _cubes.length; i++) {
            this.cubes.push(_cubes[i].copy());
        }
    }
    update(_cubes) {
        this.cubes = new Array();
        for (let i = 0; i < _cubes.length; i++) {
            this.cubes.push(_cubes[i].copy());
        }
    }
}
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
    constructor(centerX, centerY, size, _coord) {
        this.x = centerX;
        this.y = centerY;
        this.size = size;
        this.id = _coord.copy();
        this.pos = _coord.copy().scale(size);
    }
    load_chunk(cubes) {
        this.cubes = cubes.length;
        this.cube_pos = new Array();
        this.cube_colliders = new Array();
        this.edge_colliders = new Array();
        // add all cubes
        for (let i = 0; i < cubes.length; i++) {
            const pos = cubes[i].copy();
            this.cube_pos.push(pos);
            this.cube_colliders.push(new CubeCollider(pos));
            // add to edge colliders if at chunk edge
            if (pos.x == 0 || pos.x == Utils.CHUNK_SIZE - 1 || pos.z == 0 || pos.z == Utils.CHUNK_SIZE - 1) {
                this.edge_colliders.push(new CubeCollider(pos));
            }
        }
        // create array f32 array
        this.cubePositionsF32 = new Float32Array(4 * this.cube_pos.length);
        for (let i = 0; i < this.cube_pos.length; i++) {
            this.cubePositionsF32[(4 * i) + 0] = this.cube_pos[i].x;
            this.cubePositionsF32[(4 * i) + 1] = this.cube_pos[i].y;
            this.cubePositionsF32[(4 * i) + 2] = this.cube_pos[i].z;
            this.cubePositionsF32[(4 * i) + 3] = 0;
        }
    }
    generate_new_chunk(_noise_data) {
        this.cubes = this.size * this.size; // height cubes
        this.cube_pos = new Array();
        this.cube_colliders = new Array();
        this.edge_colliders = new Array();
        this.noise_data = _noise_data;
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
        let height_map = Noise.generate_noise_map(this.size, this.noise_data, this.pos.copy(), true);
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
                // add to edge colliders if at chunk edge
                if (i == 0 || i == Utils.CHUNK_SIZE - 1 || j == 0 || j == Utils.CHUNK_SIZE - 1) {
                    this.edge_colliders.push(new CubeCollider(new Vec3([x, y, z])));
                }
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
    remove_cube(cube, face) {
        // remove from cube_pos
        let index = -1;
        for (let i = 0; i < this.cube_pos.length; i++) {
            if (this.cube_pos[i].equals(cube)) {
                index = i;
                break;
            }
        }
        if (index > -1)
            this.cube_pos.splice(index, 1);
        // add new cube(s) if required
        // look at the 6 cubes which touched each face of removed cube
        // depends on which face you removed the block?
        let opp_cube = cube.copy();
        switch (face) {
            case CubeFace.negX:
                opp_cube.x += 1;
                break;
            case CubeFace.posX:
                opp_cube.x -= 1;
                break;
            case CubeFace.negY:
                opp_cube.y += 1;
                break;
            case CubeFace.posY:
                opp_cube.y -= 1;
                break;
            case CubeFace.negZ:
                opp_cube.z += 1;
                break;
            case CubeFace.posZ:
                opp_cube.y -= 1;
                break;
        }
        // look for opposite cube 
        let found_cube = false;
        for (let i = 0; i < this.cube_pos.length; i++) {
            if (this.cube_pos[i].equals(opp_cube)) {
                found_cube = true;
                break;
            }
        }
        // if not found, add it to chunk
        if (!found_cube) {
            this.cube_pos.push(opp_cube.copy());
            this.cube_colliders.push(new CubeCollider(opp_cube.copy()));
        }
        // create new array f32 array
        this.cubePositionsF32 = new Float32Array(4 * this.cube_pos.length);
        for (let i = 0; i < this.cube_pos.length; i++) {
            this.cubePositionsF32[(4 * i) + 0] = this.cube_pos[i].x;
            this.cubePositionsF32[(4 * i) + 1] = this.cube_pos[i].y;
            this.cubePositionsF32[(4 * i) + 2] = this.cube_pos[i].z;
            this.cubePositionsF32[(4 * i) + 3] = 0;
        }
        // remove cube collider
        for (let i = 0; i < this.cube_colliders.length; i++) {
            if (this.cube_colliders[i].get_pos().equals(cube)) {
                index = i;
                break;
            }
        }
        if (index > -1)
            this.cube_colliders.splice(index, 1);
    }
    get_cube_from_pos(pos) {
        // check each cube to see if pos.xz are in cube.xz
        for (let i = 0; i < this.cube_colliders.length; i++) {
            if (pos.x > this.cube_colliders[i].get_pos().x - (Utils.CUBE_LEN / 2) &&
                pos.x < this.cube_colliders[i].get_pos().x + (Utils.CUBE_LEN / 2) &&
                pos.z > this.cube_colliders[i].get_pos().z - (Utils.CUBE_LEN / 2) &&
                pos.z < this.cube_colliders[i].get_pos().z + (Utils.CUBE_LEN / 2)) {
                return this.cube_colliders[i];
            }
        }
        return null;
    }
    get_cube_colliders() {
        return this.cube_colliders;
    }
    get_edge_colliders() {
        return this.edge_colliders;
    }
    cubePositions() {
        return this.cubePositionsF32;
    }
    numCubes() {
        return this.cubes;
    }
    get_cube_pos() {
        return this.cube_pos;
    }
    get_id() {
        return this.id.copy();
    }
}
//# sourceMappingURL=Chunk.js.map