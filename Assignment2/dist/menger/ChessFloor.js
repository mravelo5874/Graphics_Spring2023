import { Mat4 } from "../lib/TSM.js";
export class ChessFloor {
    constructor() {
        this.my_verticies = new Array;
        this.my_indicies = new Array;
        this.my_normals = new Array;
        this.dirty = true;
        this.create_floor();
    }
    isDirty() { return this.dirty; }
    setClean() { this.dirty = false; }
    create_floor() {
        const floor_verticies = new Array(-0.5, +0.0, -0.5, 1.0, // 0
        -0.5, +0.0, +0.5, 1.0, // 1
        +0.5, +0.0, +0.5, 1.0, // 2
        +0.5, +0.0, -0.5, 1.0);
        // order of cube triangles:
        const floor_triangles = new Array(0, 1, 3, 3, 1, 2);
        // normals follow order of triangles
        const floor_norms = new Array(+0.0, +1.0, +0.0, 0.0, +0.0, +1.0, +0.0, 0.0, +0.0, +1.0, +0.0, 0.0, +0.0, +1.0, +0.0, 0.0);
        // add to arrays
        this.my_verticies = this.my_verticies.concat(floor_verticies);
        this.my_indicies = this.my_indicies.concat(floor_triangles);
        this.my_normals = this.my_normals.concat(floor_norms);
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
        const ret = new Mat4([
            1000.0, 0.0, 0.0, 0.0,
            0.0, 1000.0, 0.0, 0.0,
            0.0, 0.0, 1000.0, 0.0,
            0.0, -2.0, 0.0, 1.0,
        ]);
        return ret;
    }
}
//# sourceMappingURL=ChessFloor.js.map