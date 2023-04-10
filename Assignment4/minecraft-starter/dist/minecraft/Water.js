import { Vec3 } from "../lib/TSM.js";
export class Water {
    // TODO this
    //public get_indices(): Uint32Array { return new Uint32Array(this.indices) }
    constructor(init_chunk) {
        this.current_chunk = init_chunk.copy();
        this.indices = [new Vec3([0, 1, 2]), new Vec3([2, 3, 0])];
    }
    update_chunk(_chunk) {
        this.current_chunk = _chunk.copy();
    }
}
//# sourceMappingURL=Water.js.map