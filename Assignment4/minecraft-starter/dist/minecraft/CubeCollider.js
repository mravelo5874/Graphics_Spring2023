import { Utils } from "./Utils.js";
export class CubeCollider {
    get_pos() { return this.pos.copy(); }
    get_s_len() { return this.s_len; }
    constructor(_pos, _s_len = Utils.CUBE_LEN) {
        this.pos = _pos.copy();
        this.s_len = _s_len;
    }
}
//# sourceMappingURL=CubeCollider.js.map