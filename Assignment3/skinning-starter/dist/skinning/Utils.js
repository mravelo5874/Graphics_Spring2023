import { Vec3, Mat4 } from "../lib/TSM.js";
// http-server dist -c-1
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
        return '{origin: ' + Ray.Vec3_toFixed(this.origin, 3) + ', direction: ' + Ray.Vec3_toFixed(this.direction, 3) + '}';
    }
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
        return p;
    }
    static rotate(ray, axis, radians) {
        console.assert(axis != null);
        console.assert(radians != null);
        axis.normalize();
        // Compute rotation matrix
        const rotMat = new Mat4().setIdentity();
        rotMat.rotate(radians, axis);
        const pos = ray.get_origin();
        const dir = ray.get_direction();
        let posToEye = Vec3.difference(dir, pos);
        posToEye = rotMat.multiplyPt3(posToEye);
        const res = Vec3.sum(pos, posToEye);
        console.log('rotate: ' + Ray.Vec3_toFixed(res));
        return res;
    }
}
// class used to convert bones into hex prisms
export class Hex {
    constructor(_start, _end) {
        this.start = _start.copy();
        this.end = _end.copy();
        this.hex_indices = new Array();
        this.hex_positions = new Array();
        this.hex_colors = new Array();
        this.convert();
    }
    convert() {
        let dir = this.end.copy().subtract(this.start.copy()).normalize();
        let per = Ray.get_perpendicular(dir.copy()).normalize();
        let len = Vec3.distance(this.start.copy(), this.end.copy());
        console.log('[HEX]' +
            '\n\tstart: ' + Ray.Vec3_toFixed(this.start) +
            '\n\tend: ' + Ray.Vec3_toFixed(this.end) +
            '\n\tdir: ' + Ray.Vec3_toFixed(dir) +
            '\n\tper: ' + Ray.Vec3_toFixed(per) +
            '\n\tlen: ' + len.toFixed(3));
        // calculate 6 hex points around start point
        const per_ray_start = new Ray(this.start.copy(), dir.copy());
        let a1 = Ray.rotate(per_ray_start, dir.copy(), Hex.pi_over_3 * 0);
        let b1 = Ray.rotate(per_ray_start, dir.copy(), Hex.pi_over_3 * 1);
        let c1 = Ray.rotate(per_ray_start, dir.copy(), Hex.pi_over_3 * 2);
        let d1 = Ray.rotate(per_ray_start, dir.copy(), Hex.pi_over_3 * 3);
        let e1 = Ray.rotate(per_ray_start, dir.copy(), Hex.pi_over_3 * 4);
        let f1 = Ray.rotate(per_ray_start, dir.copy(), Hex.pi_over_3 * 5);
        console.log('a1: ' + Ray.Vec3_toFixed(a1) +
            '\nb1: ' + Ray.Vec3_toFixed(b1) +
            '\nc1: ' + Ray.Vec3_toFixed(c1) +
            '\nd1: ' + Ray.Vec3_toFixed(d1) +
            '\ne1: ' + Ray.Vec3_toFixed(e1) +
            '\nf1: ' + Ray.Vec3_toFixed(f1));
        // calculate 6 hex points around end point
        const per_ray_end = new Ray(this.end.copy(), dir.copy());
        let a2 = Ray.rotate(per_ray_end, dir.copy(), Hex.pi_over_3 * 0);
        let b2 = Ray.rotate(per_ray_end, dir.copy(), Hex.pi_over_3 * 1);
        let c2 = Ray.rotate(per_ray_end, dir.copy(), Hex.pi_over_3 * 2);
        let d2 = Ray.rotate(per_ray_end, dir.copy(), Hex.pi_over_3 * 3);
        let e2 = Ray.rotate(per_ray_end, dir.copy(), Hex.pi_over_3 * 4);
        let f2 = Ray.rotate(per_ray_end, dir.copy(), Hex.pi_over_3 * 5);
        console.log('a2: ' + Ray.Vec3_toFixed(a2) +
            '\nb2: ' + Ray.Vec3_toFixed(b2) +
            '\nc2: ' + Ray.Vec3_toFixed(c2) +
            '\nd2: ' + Ray.Vec3_toFixed(d2) +
            '\ne2: ' + Ray.Vec3_toFixed(e2) +
            '\nf2: ' + Ray.Vec3_toFixed(f2));
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
        console.log('hex indices: ' + this.hex_indices);
        return new Uint32Array(this.hex_indices);
    }
    get_hex_positions() {
        console.log('hex pos: ' + this.hex_positions);
        return new Float32Array(this.hex_positions);
    }
    get_hex_colors() {
        console.log('hex colors: ' + this.hex_colors);
        return new Float32Array(this.hex_colors);
    }
}
Hex.radius = 1.0;
Hex.pi_over_3 = Math.PI / 3;
export class Cylinder {
    constructor(_start_point, _end_point, _radius, _id) {
        this.start_point = _start_point;
        this.end_point = _end_point;
        this.mid_point = Vec3.difference(_end_point, _start_point);
        this.radius = _radius;
        this.length = Vec3.distance(_end_point, _start_point);
        this.bone_id = _id;
        //console.log('cyl: ' + _id + ', start: ' + Ray.Vec3_toFixed(_start_point) + ', end: ' + Ray.Vec3_toFixed(_end_point) + ', radius: ' + _radius)
    }
    // checks if the ray intersects this cyliner and returns t value at intersection
    ray_interset(ray) {
        let str_p = this.start_point.copy();
        let end_p = this.end_point.copy();
        //console.log('cyl: ' + this.bone_id + ', str: ' + Ray.Vec3_toFixed(str_p) + ', end: ' + Ray.Vec3_toFixed(end_p))
        // point on ray closest to cylinder line
        let a = ray.copy(); // mouse vector
        let b = new Ray(str_p, end_p.copy().subtract(str_p)); // cyliner vector
        let c = new Ray(a.get_origin(), a.get_origin().subtract(b.get_origin()).normalize()); // difference vector
        //console.log('cyl: ' + this.bone_id + '\n\ta: ' + a.print() + '\n\tb: ' + b.print() + '\n\tc: ' + c.print())
        let p = Vec3.dot(a.get_direction(), b.get_direction());
        let q = Vec3.dot(a.get_direction(), c.get_direction());
        let r = Vec3.dot(b.get_direction(), c.get_direction());
        let s = Vec3.dot(a.get_direction(), a.get_direction());
        let t = Vec3.dot(b.get_direction(), b.get_direction());
        // if (s == 0.0 || t == 0.0 || (p*p) == (s*t))
        // {
        //     return [false, -1]
        // }
        let denom = (s * t) - (p * p);
        let d = ((-p * r) + (q * t)) / denom;
        let e = ((p * q) + (r * s)) / denom;
        let D = a.get_direction(); // point on a closest to b
        D = D.normalize().scale(d);
        let E = b.get_direction(); // point on b closest to a
        E = E.normalize().scale(e);
        let cyl_mid_dist = Vec3.distance(this.mid_point, E);
        let D_E_dist = Vec3.distance(D, E);
        // console.log('[CALCS]')
        // console.log('D: {' + Ray.Vec3_toFixed(D) + '}\nE: {' + Ray.Vec3_toFixed(E) + '}')
        // console.log('cyl-mid->E distance: ' + cyl_mid_dist)
        // console.log('cyl_length / 2: ' + this.length / 2)
        // console.log('D->E distance: ' + D_E_dist)
        // console.log('cyl_radius: ' + this.radius)
        if (Vec3.distance(this.mid_point, E) > (this.length / 2)) {
            return [false, -1];
        }
        if (D_E_dist > this.radius) {
            return [false, -1];
        }
        return [true, d];
    }
}
//# sourceMappingURL=Utils.js.map