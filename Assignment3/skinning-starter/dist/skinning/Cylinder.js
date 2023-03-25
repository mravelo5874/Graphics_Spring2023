import { Vec3 } from "../lib/TSM.js";
import { Utils } from "./Utils.js";
import { Hex } from "./Hex.js";
export class Cylinder {
    get_start() { return this.start_point.copy(); }
    get_end() { return this.end_point.copy(); }
    get_id() { return this.bone_id; }
    get_quat() { return this.quat; }
    get_tran() { return this.tran; }
    constructor(_bone_id, _start_point, _end_point, _quat, _tran) {
        this.bone_id = _bone_id;
        this.start_point = _start_point.copy();
        this.end_point = _end_point.copy();
        this.mid_point = Utils.mid_point(_start_point.copy(), _end_point.copy());
        this.length = Vec3.distance(_end_point.copy(), _start_point.copy());
        this.quat = _quat.copy();
        this.tran = _tran.copy();
        //console.log('cyl: ' + ', start: ' + Util.Vec3_toFixed(_start_point) + ', end: ' + Util.Vec3_toFixed(_end_point))
    }
    // checks if the ray intersects this cyliner and returns t value at intersection
    ray_interset(ray) {
        const cyl_pos = this.start_point.copy(); // r1
        const cyl_dir = this.end_point.copy().subtract(this.start_point.copy()).normalize(); // e1
        const ray_pos = ray.get_origin(); // r2
        const ray_dir = ray.get_direction().normalize(); // e2
        // line connecting closest points has dir vector n
        const n = Vec3.cross(cyl_dir.copy(), ray_dir.copy()); // e1 x e2
        // return if cross product is 0
        if (n == Vec3.zero)
            return [false, Number.MIN_VALUE];
        // compute distance bewteen p1 and p2
        //const d : number = Math.abs(Vec3.dot(n.copy(), (cyl_pos.copy().subtract(ray_pos.copy())))) / Util.magnitude(n.copy())
        const r2_sub_r1 = ray_pos.copy().subtract(cyl_pos.copy());
        const n_dot_n = Vec3.dot(n.copy(), n.copy());
        // compute t1 and t2
        const t1 = Vec3.dot(Vec3.cross(ray_dir.copy(), n.copy()), r2_sub_r1) / n_dot_n;
        const t2 = Vec3.dot(Vec3.cross(cyl_dir.copy(), n.copy()), r2_sub_r1) / n_dot_n;
        // compute p1 and p2
        const p1 = cyl_pos.copy().add(cyl_dir.copy().scale(t1));
        const p2 = ray_pos.copy().add(ray_dir.copy().scale(t2));
        // confirm
        const dist = Vec3.distance(p1.copy(), p2.copy());
        // add as line to scene.rr
        //scene.rr.add_ray(new Ray(p1.copy(), p2.copy().subtract(p1.copy())), "blue", dist)
        /*
        console.log('[INTERSECT]\n' +
        '\tcyl: {pos: ' + Util.Vec3_toFixed(cyl_pos) + ', dir: ' + Util.Vec3_toFixed(cyl_dir) + '}\n' +
        '\tray: {pos: ' + Util.Vec3_toFixed(ray_pos) + ', dir: ' + Util.Vec3_toFixed(ray_dir) + '}\n' +
        //'\td: ' + d.toFixed(3) + '\n' +
        '\tdist: ' + dist.toFixed(3) + '\n' +
        '\tt1: ' + t1.toFixed(3) + '\n' +
        '\tt2: ' + t2.toFixed(3) + '\n' +
        '\tp1: ' + Util.Vec3_toFixed(p1) + '\n' +
        '\tp2: ' + Util.Vec3_toFixed(p2) + '\n')
        */
        // return if dist > radius
        if (dist > Hex.radius)
            return [false, Number.MIN_VALUE];
        // return if dist(mid_point -> p1) > length / 2
        if (Vec3.distance(this.mid_point.copy(), p1.copy()) > this.length / 2)
            return [false, Number.MIN_VALUE];
        // add as line to scene.rr
        // if (scene != null) scene.rr.add_ray(new Ray(p1.copy(), p2.copy().subtract(p1.copy())), "pink", dist)
        // now, return true
        return [true, (t2 * -1.0)];
    }
}
//# sourceMappingURL=Cylinder.js.map