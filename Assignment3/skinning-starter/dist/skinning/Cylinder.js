export class Cylinder {
    get_start() { return this.start_point.copy(); }
    get_end() { return this.end_point.copy(); }
    get_id() { return this.bone_id; }
    constructor(_bone_id, _start_point, _end_point) {
        this.bone_id = _bone_id;
        this.start_point = _start_point.copy();
        this.end_point = _end_point.copy();
    }
}
//# sourceMappingURL=Cylinder.js.map