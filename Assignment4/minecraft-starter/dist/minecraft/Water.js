import { Vec4 } from "../lib/TSM.js";
import { Utils } from "./Utils.js";
export class Water {
    get_indices() { return this.indices_u32; }
    get_positions() { return this.vertex_f32; }
    constructor(init_chunk) {
        this.indices = [0, 1, 2, 2, 3, 0];
        this.indices_u32 = new Uint32Array(this.indices);
        this.update_chunk(init_chunk.copy());
    }
    update_chunk(_chunk) {
        this.current_chunk = _chunk.copy();
        this.vertex_pos = new Array();
        // get chunk center
        const center = Utils.get_chunk_center(this.current_chunk.x, this.current_chunk.y);
        const corner_0 = new Vec4([center.x - (Utils.CHUNK_SIZE * 1.5), Utils.WATER_LEVEL, center.y - (Utils.CHUNK_SIZE * 1.5), 1]);
        const corner_1 = new Vec4([center.x + (Utils.CHUNK_SIZE * 1.5), Utils.WATER_LEVEL, center.y - (Utils.CHUNK_SIZE * 1.5), 1]);
        const corner_2 = new Vec4([center.x + (Utils.CHUNK_SIZE * 1.5), Utils.WATER_LEVEL, center.y + (Utils.CHUNK_SIZE * 1.5), 1]);
        const corner_3 = new Vec4([center.x - (Utils.CHUNK_SIZE * 1.5), Utils.WATER_LEVEL, center.y + (Utils.CHUNK_SIZE * 1.5), 1]);
        for (let i = 0; i < 4; i++)
            this.vertex_pos.push(corner_0.at(i));
        for (let i = 0; i < 4; i++)
            this.vertex_pos.push(corner_3.at(i));
        for (let i = 0; i < 4; i++)
            this.vertex_pos.push(corner_2.at(i));
        for (let i = 0; i < 4; i++)
            this.vertex_pos.push(corner_1.at(i));
        for (let i = 0; i < 4; i++)
            this.vertex_pos.push(corner_2.at(i));
        for (let i = 0; i < 4; i++)
            this.vertex_pos.push(corner_0.at(i));
        this.vertex_f32 = new Float32Array(this.vertex_pos);
    }
}
//# sourceMappingURL=Water.js.map