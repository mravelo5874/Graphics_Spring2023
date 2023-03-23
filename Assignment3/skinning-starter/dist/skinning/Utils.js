import { Vec3, Mat4 } from "../lib/TSM.js";
// http-server dist -c-1
export class Util {
    // used to print a Vec3 with rounded float values
    static Vec3_toFixed(vec, digits = 3) {
        return vec.x.toFixed(digits) + ', ' + vec.y.toFixed(digits) + ', ' + vec.z.toFixed(digits);
    }
    static get_perpendicular(v) {
        // find non-zero coord
        let non_zero_coord = 0.0;
        for (let i = 0; i < 3; i++) {
            if (v.at(i) != 0.0) {
                non_zero_coord = v.at(i);
                break;
            }
        }
        // return zero vector if all are 0
        if (non_zero_coord == 0.0) {
            return new Vec3([0.0, 0.0, 0.0]);
        }
        // choose another coord that is not equal tto the non-zero coord
        let other_coord = non_zero_coord;
        for (let i = 0; i < 3; i++) {
            if (v.at(i) != non_zero_coord) {
                other_coord = v.at(i);
                break;
            }
        }
        // if all coords are equal, return zero vector
        if (other_coord == non_zero_coord) {
            return new Vec3([0.0, 0.0, 0.0]);
        }
        // compute perpendicular vector using cross product
        let z = 0.0;
        if (v.at(2) != 0.0) {
            z = (non_zero_coord * other_coord * -1.0) / v.at(2);
        }
        const p = new Vec3([non_zero_coord, other_coord, z]);
        //console.log('per: ' + Ray.Vec3_toFixed(p))
        return p;
    }
    static rotate_point(point, axis, radians) {
        console.assert(axis != null);
        console.assert(radians != null);
        axis.normalize();
        // Compute rotation matrix
        const rotMat = new Mat4().setIdentity();
        rotMat.rotate(radians, axis);
        //console.log('[ROTATE] point: ' + Ray.Vec3_toFixed(point) + ', axis: ' + Ray.Vec3_toFixed(axis))
        const res = rotMat.multiplyPt3(point);
        //console.log('rotate: ' + Ray.Vec3_toFixed(res))
        return res;
    }
    static magnitude(v) {
        const a = v.at(0) * v.at(0);
        const b = v.at(1) * v.at(1);
        const c = v.at(2) * v.at(2);
        let res = a + b + c;
        res = Math.sqrt(res);
        return res;
    }
}
export class Ray {
    get_origin() { return new Vec3(this.origin.xyz); }
    get_direction() { return new Vec3(this.direction.xyz); }
    constructor(_origin, _direction) {
        this.origin = _origin;
        this.direction = _direction;
    }
    copy() {
        return new Ray(this.origin, this.direction);
    }
    print() {
        return '{origin: ' + Util.Vec3_toFixed(this.origin, 3) + ', direction: ' + Util.Vec3_toFixed(this.direction, 3) + '}';
    }
}
// class used to convert bones into hex prisms
export class Hex {
    get_update() { return this.update; }
    got_update() { this.update = false; }
    constructor() {
        this.init = false;
        this.update = false;
        if (!this.init) {
            this.start = Vec3.zero.copy();
            this.end = Vec3.zero.copy();
            this.hex_indices = new Array();
            this.hex_positions = new Array();
            this.hex_colors = new Array();
            this.init = true;
        }
    }
    set(_start, _end) {
        if (!this.update) {
            this.start = _start.copy();
            this.end = _end.copy();
            this.hex_indices = new Array();
            this.hex_positions = new Array();
            this.hex_colors = new Array();
            this.convert();
            this.update = true;
        }
    }
    del() {
        if (!this.update) {
            this.start = Vec3.zero.copy();
            this.end = Vec3.zero.copy();
            this.hex_indices = new Array();
            this.hex_positions = new Array();
            this.hex_colors = new Array();
            this.update = true;
        }
    }
    convert() {
        let dir = this.end.copy().subtract(this.start.copy()).normalize();
        let per = Util.get_perpendicular(dir.copy()).normalize();
        let len = Vec3.distance(this.start.copy(), this.end.copy());
        /*
        console.log('[HEX]' +
        '\n\tstart: ' + Ray.Vec3_toFixed(this.start) +
        '\n\tend: ' + Ray.Vec3_toFixed(this.end) +
        '\n\tdir: ' + Ray.Vec3_toFixed(dir) +
        '\n\tper: ' + Ray.Vec3_toFixed(per) +
        '\n\tlen: ' + len.toFixed(3)
        )
        */
        // calculate 6 hex points around start point
        const start_point = this.start.copy().add(per.copy().scale(Hex.radius));
        //console.log('start point: ' + Ray.Vec3_toFixed(start_point))
        const a1 = Util.rotate_point(start_point, dir.copy(), Hex.pi_over_3 * 0);
        const b1 = Util.rotate_point(start_point, dir.copy(), Hex.pi_over_3 * 1);
        const c1 = Util.rotate_point(start_point, dir.copy(), Hex.pi_over_3 * 2);
        const d1 = Util.rotate_point(start_point, dir.copy(), Hex.pi_over_3 * 3);
        const e1 = Util.rotate_point(start_point, dir.copy(), Hex.pi_over_3 * 4);
        const f1 = Util.rotate_point(start_point, dir.copy(), Hex.pi_over_3 * 5);
        /*
        console.log('a1: ' + Ray.Vec3_toFixed(a1) +
        '\nb1: ' + Ray.Vec3_toFixed(b1) +
        '\nc1: ' + Ray.Vec3_toFixed(c1) +
        '\nd1: ' + Ray.Vec3_toFixed(d1) +
        '\ne1: ' + Ray.Vec3_toFixed(e1) +
        '\nf1: ' + Ray.Vec3_toFixed(f1))
        */
        // calculate 6 hex points around end point
        const end_point = this.end.copy().add(per.copy().scale(Hex.radius));
        //console.log('end point: ' + Ray.Vec3_toFixed(end_point))
        const a2 = Util.rotate_point(end_point, dir.copy(), Hex.pi_over_3 * 0);
        const b2 = Util.rotate_point(end_point, dir.copy(), Hex.pi_over_3 * 1);
        const c2 = Util.rotate_point(end_point, dir.copy(), Hex.pi_over_3 * 2);
        const d2 = Util.rotate_point(end_point, dir.copy(), Hex.pi_over_3 * 3);
        const e2 = Util.rotate_point(end_point, dir.copy(), Hex.pi_over_3 * 4);
        const f2 = Util.rotate_point(end_point, dir.copy(), Hex.pi_over_3 * 5);
        /*
        console.log('a2: ' + Ray.Vec3_toFixed(a2) +
        '\nb2: ' + Ray.Vec3_toFixed(b2) +
        '\nc2: ' + Ray.Vec3_toFixed(c2) +
        '\nd2: ' + Ray.Vec3_toFixed(d2) +
        '\ne2: ' + Ray.Vec3_toFixed(e2) +
        '\nf2: ' + Ray.Vec3_toFixed(f2))
        */
        // [ create line segments and store ]
        // add ray indices (should be 18 lines = 36 indices)
        for (let i = 0; i < 36; i++)
            this.hex_indices.push(i);
        // add ray positions (should be 18 lines = 36 indices = 108 pos values)
        // start hexagon cap
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(a1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(b1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(b1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(c1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(c1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(d1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(d1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(e1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(e1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(f1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(f1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(a1.at(i));
        // end hexagon cap
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(a2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(b2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(b2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(c2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(c2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(d2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(d2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(e2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(e2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(f2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(f2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(a2.at(i));
        // connect caps
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(a1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(a2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(b1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(b2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(c1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(c2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(d1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(d2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(e1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(e2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(f1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(f2.at(i));
        // add ray colors (should be 18 lines = 36 indices = 108 pos values = 108 color values)
        let color_id = new Vec3([0.0, 1.0, 0.0]);
        for (let i = 0; i < 36; i++) {
            this.hex_colors.push(color_id.x);
            this.hex_colors.push(color_id.y);
            this.hex_colors.push(color_id.z);
        }
    }
    get_hex_indices() {
        return new Uint32Array(this.hex_indices);
    }
    get_hex_positions() {
        return new Float32Array(this.hex_positions);
    }
    get_hex_colors() {
        return new Float32Array(this.hex_colors);
    }
}
Hex.radius = 0.1;
Hex.pi_over_3 = Math.PI / 3;
export class Cylinder {
    get_start() { return this.start_point.copy(); }
    get_end() { return this.end_point.copy(); }
    constructor(_start_point, _end_point, _radius, _id) {
        this.start_point = _start_point.copy();
        this.end_point = _end_point.copy();
        this.mid_point = Vec3.difference(_end_point.copy(), _start_point.copy());
        this.length = Vec3.distance(_end_point.copy(), _start_point.copy());
        //console.log('cyl: ' + _id + ', start: ' + Util.Vec3_toFixed(_start_point) + ', end: ' + Util.Vec3_toFixed(_end_point) + ', radius: ' + _radius)
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
        const d = Math.abs(Vec3.dot(n.copy(), (cyl_pos.copy().subtract(ray_pos.copy())))) / Util.magnitude(n.copy());
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
        /*
        console.log('[INTERSECT]\n' +
        '\tcyl: {pos: ' + Util.Vec3_toFixed(cyl_pos) + ', dir: ' + Util.Vec3_toFixed(cyl_dir) + '\n' +
        '\tray: {pos: ' + Util.Vec3_toFixed(ray_pos) + ', dir: ' + Util.Vec3_toFixed(ray_dir) + '\n' +
        '\td: ' + d.toFixed(3) + '\n' +
        '\tdist: ' + dist.toFixed(3) + '\n' +
        '\tt1: ' + t1.toFixed(3) + '\n' +
        '\tt2: ' + t2.toFixed(3) + '\n' +
        '\tp1: ' + Util.Vec3_toFixed(p1) + '\n' +
        '\tp2: ' + Util.Vec3_toFixed(p2) + '\n')
        */
        // return if dist > radius
        if (dist > Hex.radius)
            [false, Number.MIN_VALUE];
        // return if dist(mid_point -> p1) > length / 2
        if (Vec3.distance(this.mid_point.copy(), p1.copy()) > this.length / 2)
            [false, Number.MIN_VALUE];
        // now, return true
        return [true, (t2 * -1.0)];
    }
}
//# sourceMappingURL=Utils.js.map