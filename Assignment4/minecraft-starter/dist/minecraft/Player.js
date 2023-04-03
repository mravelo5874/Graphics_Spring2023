import { Utils } from "./Utils.js";
export class Player {
    // pos access
    get_pos() { return this.pos.copy(); }
    // chunk access
    get_chunk() { return this.chunk.copy(); }
    set_chunk(_chunk) { this.chunk = _chunk.copy(); }
    // settings access
    get_sense() { return this.sense; }
    constructor(_pos) {
        this.pos = _pos.copy();
        this.chunk = Utils.pos_to_chunck(this.pos);
        this.speed = 0.25;
        this.sense = 0.25;
    }
    move(dir) {
        this.pos.add(dir.copy().scale(this.speed));
    }
}
//# sourceMappingURL=Player.js.map