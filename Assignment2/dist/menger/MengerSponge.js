import { Mat4, Vec3 } from "../lib/TSM.js";
/**
 * Represents a Menger Sponge
 */
export class MengerSponge {
    constructor(level) {
        this.vert_per_cube = 24;
        this.my_verticies = new Array;
        this.my_indicies = new Array;
        this.my_normals = new Array;
        this.cube_count = 0;
        this.setLevel(level);
        this.dirty = true;
    }
    /**
     * Returns true if the sponge has changed.
     */
    isDirty() { return this.dirty; }
    setClean() { this.dirty = false; }
    get_level() { return this.sponge_level; }
    remove() {
        // set level to 0
        this.setLevel(0);
        // clear arrays
        this.my_verticies.splice(0, this.my_verticies.length);
        this.my_indicies.splice(0, this.my_indicies.length);
        this.my_normals.splice(0, this.my_normals.length);
    }
    setLevel(level) {
        if (level == this.sponge_level)
            return;
        this.sponge_level = level;
        this.cube_count = 0;
        console.log("setting sponge level: " + this.sponge_level);
        this.construct_sponge();
        this.dirty = true;
    }
    add_cube(min_corner, max_corner) {
        //console.log("adding new cube...")
        // get cube number
        const n = this.cube_count * this.vert_per_cube;
        //console.log("cube_num: " + this.cube_count)
        this.cube_count = this.cube_count + 1;
        // order of cube verticies:
        const cube_verticies = new Array(min_corner.x, min_corner.y, max_corner.z, 1.0, // 0
        min_corner.x, max_corner.y, max_corner.z, 1.0, // 1
        min_corner.x, max_corner.y, min_corner.z, 1.0, // 2
        min_corner.x, min_corner.y, min_corner.z, 1.0, // 3 -> -x face
        max_corner.x, min_corner.y, min_corner.z, 1.0, // 4
        max_corner.x, max_corner.y, min_corner.z, 1.0, // 5
        max_corner.x, max_corner.y, max_corner.z, 1.0, // 6
        max_corner.x, min_corner.y, max_corner.z, 1.0, // 7 -> +x face
        min_corner.x, min_corner.y, max_corner.z, 1.0, // 8
        min_corner.x, min_corner.y, min_corner.z, 1.0, // 9
        max_corner.x, min_corner.y, min_corner.z, 1.0, // 10
        max_corner.x, min_corner.y, max_corner.z, 1.0, // 11 -> -y face
        min_corner.x, max_corner.y, min_corner.z, 1.0, // 12
        min_corner.x, max_corner.y, max_corner.z, 1.0, // 13
        max_corner.x, max_corner.y, max_corner.z, 1.0, // 14
        max_corner.x, max_corner.y, min_corner.z, 1.0, // 15 -> +y face
        min_corner.x, min_corner.y, min_corner.z, 1.0, // 16
        min_corner.x, max_corner.y, min_corner.z, 1.0, // 17
        max_corner.x, max_corner.y, min_corner.z, 1.0, // 18
        max_corner.x, min_corner.y, min_corner.z, 1.0, // 19 -> -z face
        max_corner.x, min_corner.y, max_corner.z, 1.0, // 20      		
        max_corner.x, max_corner.y, max_corner.z, 1.0, // 21			
        min_corner.x, max_corner.y, max_corner.z, 1.0, // 22			
        min_corner.x, min_corner.y, max_corner.z, 1.0);
        // order of cube triangles:
        const cube_triangles = new Array(0 + n, 1 + n, 2 + n, 2 + n, 3 + n, 0 + n, // -x face
        4 + n, 5 + n, 6 + n, 6 + n, 7 + n, 4 + n, // +x face
        8 + n, 9 + n, 10 + n, 10 + n, 11 + n, 8 + n, // -y face
        12 + n, 13 + n, 14 + n, 14 + n, 15 + n, 12 + n, // +y face
        16 + n, 17 + n, 18 + n, 18 + n, 19 + n, 16 + n, // -z face
        20 + n, 21 + n, 22 + n, 22 + n, 23 + n, 20 + n);
        // normals follow order of triangles
        const cube_norms = new Array(-1.0, +0.0, +0.0, 0.0, -1.0, +0.0, +0.0, 0.0, -1.0, +0.0, +0.0, 0.0, -1.0, +0.0, +0.0, 0.0, // -x face
        +1.0, +0.0, +0.0, 0.0, +1.0, +0.0, +0.0, 0.0, +1.0, +0.0, +0.0, 0.0, +1.0, +0.0, +0.0, 0.0, // +x face
        +0.0, -1.0, +0.0, 0.0, +0.0, -1.0, +0.0, 0.0, +0.0, -1.0, +0.0, 0.0, +0.0, -1.0, +0.0, 0.0, // -y face
        +0.0, +1.0, +0.0, 0.0, +0.0, +1.0, +0.0, 0.0, +0.0, +1.0, +0.0, 0.0, +0.0, +1.0, +0.0, 0.0, // +y face
        +0.0, +0.0, -1.0, 0.0, +0.0, +0.0, -1.0, 0.0, +0.0, +0.0, -1.0, 0.0, +0.0, +0.0, -1.0, 0.0, // -z face
        +0.0, +0.0, +1.0, 0.0, +0.0, +0.0, +1.0, 0.0, +0.0, +0.0, +1.0, 0.0, +0.0, +0.0, +1.0, 0.0);
        // add to arrays
        for (let i = 0; i < 96; i++)
            this.my_verticies.push(cube_verticies[i]);
        for (let i = 0; i < 36; i++)
            this.my_indicies.push(cube_triangles[i]);
        for (let i = 0; i < 96; i++)
            this.my_normals.push(cube_norms[i]);
    }
    construct_sponge() {
        // clear arrays
        this.my_verticies.splice(0, this.my_verticies.length);
        this.my_indicies.splice(0, this.my_indicies.length);
        this.my_normals.splice(0, this.my_normals.length);
        console.log("creating sponge...");
        // initial min and max corners
        const min_corner = new Vec3([-0.5, -0.5, -0.5]);
        const max_corner = new Vec3([+0.5, +0.5, +0.5]);
        // being generation sub-cubes
        this.generate_sub_cubes(min_corner, max_corner, this.sponge_level);
        console.log("vertices.length: " + this.my_verticies.length);
        console.log("indicies.length: " + this.my_indicies.length);
        console.log("normals.length: " + this.my_normals.length);
        // console.log("vertices: " + this.my_verticies)
        // console.log("indicies: " + this.my_indicies)
        // console.log("normals: " + this.my_normals)
    }
    generate_sub_cubes(min_corner, max_corner, depth) {
        // stop recurrsion when depth is 1
        if (depth <= 1) {
            this.add_cube(min_corner, max_corner);
            return;
        }
        // otherwise, continue sub-dividing cube (into 20 respective cubes)
        const s = (max_corner.x - min_corner.x) / 3.0;
        // level 1:
        this.mini_cube(min_corner, new Vec3([0, 0, 0]), s, depth); // cube 1
        this.mini_cube(min_corner, new Vec3([1, 0, 0]), s, depth); // cube 2
        this.mini_cube(min_corner, new Vec3([2, 0, 0]), s, depth); // cube 3
        this.mini_cube(min_corner, new Vec3([0, 0, 1]), s, depth); // cube 4
        this.mini_cube(min_corner, new Vec3([2, 0, 1]), s, depth); // cube 5
        this.mini_cube(min_corner, new Vec3([0, 0, 2]), s, depth); // cube 6
        this.mini_cube(min_corner, new Vec3([1, 0, 2]), s, depth); // cube 7
        this.mini_cube(min_corner, new Vec3([2, 0, 2]), s, depth); // cube 8
        // level 2:
        this.mini_cube(min_corner, new Vec3([0, 1, 0]), s, depth); // cube 14
        this.mini_cube(min_corner, new Vec3([2, 1, 0]), s, depth); // cube 15
        this.mini_cube(min_corner, new Vec3([0, 1, 2]), s, depth); // cube 16
        this.mini_cube(min_corner, new Vec3([2, 1, 2]), s, depth); // cube 17
        // level 3:
        this.mini_cube(min_corner, new Vec3([0, 2, 0]), s, depth); // cube 13
        this.mini_cube(min_corner, new Vec3([1, 2, 0]), s, depth); // cube 14
        this.mini_cube(min_corner, new Vec3([2, 2, 0]), s, depth); // cube 15
        this.mini_cube(min_corner, new Vec3([0, 2, 1]), s, depth); // cube 16
        this.mini_cube(min_corner, new Vec3([2, 2, 1]), s, depth); // cube 17
        this.mini_cube(min_corner, new Vec3([0, 2, 2]), s, depth); // cube 18
        this.mini_cube(min_corner, new Vec3([1, 2, 2]), s, depth); // cube 19
        this.mini_cube(min_corner, new Vec3([2, 2, 2]), s, depth); // cube 20
    }
    mini_cube(min_corner, m, s, depth) {
        const min_1 = new Vec3([min_corner.x + (s * m.x), min_corner.y + (s * m.y), min_corner.z + (s * m.z)]);
        const max_1 = new Vec3([min_corner.x + (s * (m.x + 1)), min_corner.y + (s * (m.y + 1)), min_corner.z + (s * (m.z + 1))]);
        this.generate_sub_cubes(min_1, max_1, depth - 1);
    }
    /* Returns a flat Float32Array of the sponge's vertex positions */
    positionsFlat() {
        //console.log("vertices: " + this.my_verticies.length);
        return new Float32Array(this.my_verticies); // new Float32Array([1.0, 0.0, 0.0, 1.0, -1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0]);
    }
    /**
     * Returns a flat Uint32Array of the sponge's face indices
     */
    indicesFlat() {
        //console.log("indicies: " + this.my_indicies.length);
        return new Uint32Array(this.my_indicies); // new Uint32Array([0, 1, 2]);
    }
    /**
     * Returns a flat Float32Array of the sponge's normals
     */
    normalsFlat() {
        //console.log("normals: " + this.my_normals.length);
        return new Float32Array(this.my_normals); // new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0]);
    }
    /**
     * Returns the model matrix of the sponge
     */
    uMatrix() {
        const ret = new Mat4().setIdentity();
        return ret;
    }
}
//# sourceMappingURL=MengerSponge.js.map