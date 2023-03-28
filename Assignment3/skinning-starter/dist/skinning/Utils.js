import { Vec3, Mat4, Quat } from "../lib/TSM.js";
// http-server dist -c-1
export class Utils {
    static get_color(_name) {
        switch (_name) {
            case "white": return new Vec3([1.0, 1.0, 1.0]);
            case "black": return new Vec3([0.0, 0.0, 0.0]);
            case "red": return new Vec3([1.0, 0.0, 0.0]);
            case "green": return new Vec3([0.0, 1.0, 0.0]);
            case "blue": return new Vec3([0.0, 0.0, 1.0]);
            case "cyan": return new Vec3([0.0, 1.0, 1.0]);
            case "pink": return new Vec3([1.0, 0.0, 1.0]);
            default: break;
        }
        // return white as default
        return new Vec3([0.0, 0.0, 0.0]);
    }
    static attribute_toFixed(attr, items, digits = 3) {
        let str = '';
        for (let i = 0; i < items; i++) {
            str += attr.values[i].toFixed(digits) + ', ';
        }
        return str;
    }
    static vec3_toFixed(vec, digits = 3) {
        return vec.x.toFixed(digits) + ', ' + vec.y.toFixed(digits) + ', ' + vec.z.toFixed(digits);
    }
    static vec2_toFixed(vec, digits = 3) {
        return vec.x.toFixed(digits) + ', ' + vec.y.toFixed(digits);
    }
    static quat_toFixed(quat, digits = 3) {
        return quat.x.toFixed(digits) + ', ' + quat.y.toFixed(digits) + ', ' + quat.z.toFixed(digits) + ', ' + quat.w.toFixed(digits);
    }
    static mat4_toFixed(mat, digits = 3) {
        return '\n' +
            '|' + mat.at(0).toFixed(digits) + '|' + mat.at(4).toFixed(digits) + '|' + mat.at(8).toFixed(digits) + '|' + mat.at(12).toFixed(digits) + '|\n' +
            '|' + mat.at(1).toFixed(digits) + '|' + mat.at(5).toFixed(digits) + '|' + mat.at(9).toFixed(digits) + '|' + mat.at(13).toFixed(digits) + '|\n' +
            '|' + mat.at(2).toFixed(digits) + '|' + mat.at(6).toFixed(digits) + '|' + mat.at(10).toFixed(digits) + '|' + mat.at(14).toFixed(digits) + '|\n' +
            '|' + mat.at(3).toFixed(digits) + '|' + mat.at(7).toFixed(digits) + '|' + mat.at(11).toFixed(digits) + '|' + mat.at(15).toFixed(digits) + '|\n';
    }
    // checks if the ray intersects this cyliner and returns t value at intersection
    static ray_interset(ray, start, end, radius) {
        const cyl_pos = start.copy(); // r1
        const cyl_dir = end.copy().subtract(start.copy()).normalize(); // e1
        const ray_pos = ray.get_origin(); // r2
        const ray_dir = ray.get_direction().normalize(); // e2
        // line connecting closest points has dir vector n
        const n = Vec3.cross(cyl_dir, ray_dir); // e1 x e2
        // return if cross product is 0
        if (n == Vec3.zero)
            return [false, Number.MIN_VALUE];
        const r2_sub_r1 = ray_pos.copy().subtract(cyl_pos);
        const n_dot_n = Vec3.dot(n, n);
        // compute t1 and t2
        const t1 = Vec3.dot(Vec3.cross(ray_dir, n), r2_sub_r1) / n_dot_n;
        const t2 = Vec3.dot(Vec3.cross(cyl_dir, n), r2_sub_r1) / n_dot_n;
        // compute p1 and p2
        const p1 = cyl_pos.copy().add(cyl_dir.copy().scale(t1));
        const p2 = ray_pos.copy().add(ray_dir.copy().scale(t2));
        // confirm
        const dist = Vec3.distance(p1, p2);
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
        if (dist > radius)
            return [false, Number.MIN_VALUE];
        // return if dist(mid_point -> p1) > length / 2
        const mid_point = Utils.mid_point(start, end);
        const length = Vec3.distance(end, start);
        if (Vec3.distance(mid_point, p1) > length / 2)
            return [false, Number.MIN_VALUE];
        // now, return true
        return [true, (t2 * -1.0)];
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
    static rotate_vec_using_quat(vec, quat) {
        // Convert vector to quaternion with w = 0
        const v = new Quat([vec.x, vec.y, vec.z, 0]);
        // Apply rotation to vector by multiplying quaternions
        const res = quat.copy().multiply(v.copy().multiply(quat.copy().conjugate()));
        // Extract x, y, z components of resulting quaternion
        return new Vec3(res.xyz);
    }
    static magnitude(v) {
        const a = v.at(0) * v.at(0);
        const b = v.at(1) * v.at(1);
        const c = v.at(2) * v.at(2);
        let res = a + b + c;
        res = Math.sqrt(res);
        return res;
    }
    static mid_point(p1, p2) {
        const x = (p1.x + p2.x) / 2.0;
        const y = (p1.y + p2.y) / 2.0;
        const z = (p1.z + p2.z) / 2.0;
        return new Vec3([x, y, z]);
    }
    static apply_quaternion(q, v) {
        let cross1 = Vec3.cross(v, new Vec3(q.xyz));
        cross1 = cross1.subtract(v.copy().scale(q.w));
        let cross2 = Vec3.cross(cross1, new Vec3(q.xyz));
        return v.copy().add(cross2.copy().scale(2));
    }
    static create_quaternion_from_axis_and_angle(axis, angle) {
        // Here we calculate the sin(theta / 2) once for optimization
        const factor = Math.sin(angle / 2);
        // Calculate the x, y and z of the quaternion
        const x = axis.x * factor;
        const y = axis.y * factor;
        const z = axis.z * factor;
        // Calcualte the w value by cos( theta / 2 )
        const w = Math.cos(angle / 2);
        return new Quat([x, y, z, w]).normalize();
    }
    static find_orthonormal_vectors(normal) {
        let w = this.rotate_vec_using_quat(normal, this.ortho_x_quat);
        const dot = Vec3.dot(normal, w);
        if (Math.abs(dot) > 0.0) {
            w = this.rotate_vec_using_quat(normal, this.ortho_y_quat);
        }
        w.normalize();
        const orthonormal_1 = Vec3.cross(normal, w).normalize();
        const orthonormal_2 = Vec3.cross(normal, orthonormal_1).normalize();
        return [orthonormal_1, orthonormal_2];
    }
}
Utils.ortho_x_quat = new Quat([-0.7071068, 0, 0, 0.7071068]);
Utils.ortho_y_quat = new Quat([0, 0.7071068, 0, 0.7071068]);
export class Ray {
    get_origin() { return new Vec3(this.origin.xyz); }
    get_direction() { return new Vec3(this.direction.xyz).normalize(); }
    constructor(_origin, _direction) {
        this.origin = _origin.copy();
        this.direction = _direction.copy();
    }
    copy() {
        return new Ray(this.origin.copy(), this.direction.copy());
    }
    print() {
        return '{origin: ' + Utils.vec3_toFixed(this.origin, 3) + ', direction: ' + Utils.vec3_toFixed(this.direction, 3) + '}';
    }
}
//# sourceMappingURL=Utils.js.map