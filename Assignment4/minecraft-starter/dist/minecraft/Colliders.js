import { Vec3 } from "../lib/TSM.js";
import { Utils } from "./Utils.js";
export class CubeCollider {
    get_pos() { return this.pos.copy(); }
    get_s_len() { return this.s_len; }
    constructor(_pos, _s_len = Utils.CUBE_LEN) {
        this.pos = _pos.copy();
        this.s_len = _s_len;
    }
}
export class CylinderCollider {
    constructor(_start, _end, _radius) {
        this.start = _start.copy();
        this.end = _end.copy();
        this.radius = _radius;
        this.height = Vec3.distance(_start, _end);
    }
}
export class AABB {
    constructor(_min, _max, _pos) {
        this.min = _min.copy();
        this.max = _max.copy();
        this.pos = _pos.copy();
    }
}
//# sourceMappingURL=Colliders.js.map