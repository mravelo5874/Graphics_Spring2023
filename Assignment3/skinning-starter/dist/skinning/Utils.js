import { Vec3 } from "../lib/TSM.js";
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
}
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
        // point on ray closest to cylinder line
        let a = ray.copy(); // mouse vector
        let b = new Ray(this.start_point, Vec3.difference(this.start_point, this.end_point)); // cyliner vector
        let c = new Ray(a.get_origin(), Vec3.difference(a.get_origin(), b.get_origin())); // difference vector
        //console.log('cyl: ' + this.bone_id + '\n\ta: ' + a.print() + '\n\tb: ' + b.print() + '\n\tc: ' + c.print())
        let p = Vec3.dot(a.get_direction(), b.get_direction());
        let q = Vec3.dot(a.get_direction(), c.get_direction());
        let r = Vec3.dot(b.get_direction(), c.get_direction());
        let s = Vec3.dot(a.get_direction(), a.get_direction());
        let t = Vec3.dot(b.get_direction(), b.get_direction());
        if (s == 0.0 || t == 0.0 || (p * p) == (s * t)) {
            return [false, -1];
        }
        let denom = (s * t) - (p * p);
        let d = ((-p * r) + (q * t)) / denom;
        let e = ((p * q) + (r * s)) / denom;
        let D = a.get_direction(); // point on a closest to b
        D = D.normalize().scale(d);
        let E = b.get_direction(); // point on b closest to a
        E = E.normalize().scale(e);
        let cyl_mid_dist = Vec3.distance(this.mid_point, E);
        let D_E_dist = Vec3.distance(D, E);
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