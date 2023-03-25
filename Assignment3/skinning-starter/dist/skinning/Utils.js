import { Vec3, Mat4, Quat } from "../lib/TSM.js";
// http-server dist -c-1
export class Utils {
    static get_color(_name) {
        switch (_name) {
            case "white": return new Vec3([0.0, 0.0, 0.0]);
            case "black": return new Vec3([1.0, 1.0, 1.0]);
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
    // used to print a Vec3 with rounded float values
    static Vec3_toFixed(vec, digits = 3) {
        return vec.x.toFixed(digits) + ', ' + vec.y.toFixed(digits) + ', ' + vec.z.toFixed(digits);
    }
    static Vec2_toFixed(vec, digits = 3) {
        return vec.x.toFixed(digits) + ', ' + vec.y.toFixed(digits);
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
    static mid_point(p1, p2) {
        const x = (p1.x + p2.x) / 2.0;
        const y = (p1.y + p2.y) / 2.0;
        const z = (p1.z + p2.z) / 2.0;
        return new Vec3([x, y, z]);
    }
    static apply_quaternion(q, v) {
        let cross1 = Vec3.cross(v.copy(), new Vec3(q.xyz));
        cross1 = cross1.subtract(v.copy().scale(q.w));
        let cross2 = Vec3.cross(cross1.copy(), new Vec3(q.xyz));
        return v.copy().add(cross2.copy().scale(2));
    }
    static create_quaternion_from_axis_and_angle(axis, angle) {
        // Here we calculate the sin( theta / 2) once for optimization
        const factor = Math.sin(angle / 2.0);
        // Calculate the x, y and z of the quaternion
        const x = axis.at(0) * factor;
        const y = axis.at(1) * factor;
        const z = axis.at(2) * factor;
        // Calcualte the w value by cos( theta / 2 )
        const w = Math.cos(angle / 2.0);
        return new Quat([x, y, z, w]).normalize();
    }
    // no longer needed :-)
    // public static find_quaternion_twist(quat : Quat, axis : Vec3) : number
    // {
    //     axis.copy().normalize()
    //     // Take the axis you want to find the rotation around, 
    //     // and find an orthogonal vector to it.
    //     const orth : Vec3 = this.find_orthonormal_vectors(axis.copy())[0]
    //     // Rotate this new vector using your quaternion.
    //     // Project this rotated vector onto the plane the 
    //     // normal of which is your axis
    //     const flat : Vec3 = orth.copy().subtract(axis.copy().scale(Vec3.dot(orth.copy(), axis.copy())))
    //     // The acos of the dot product of this projected 
    //     // vector and the original orthogonal is your angle.
    //     const twist_angle : number = Math.acos(Vec3.dot(orth.copy(), flat.copy()))
    //     return twist_angle
    // }
    static rotate_vec_using_quat(vec, quat) {
        // Convert vector to quaternion with w = 0
        const v = new Quat([vec.x, vec.y, vec.z, 0]);
        // Apply rotation to vector by multiplying quaternions
        const res = quat.copy().multiply(v.copy().multiply(quat.copy().conjugate()));
        // Extract x, y, z components of resulting quaternion
        return new Vec3(res.xyz);
    }
    static find_orthonormal_vectors(normal) {
        let w = this.rotate_vec_using_quat(normal.copy(), this.ortho_x_quat.copy());
        const dot = Vec3.dot(normal.copy(), w.copy());
        if (Math.abs(dot) > 0.0) {
            w = this.rotate_vec_using_quat(normal.copy(), this.ortho_y_quat.copy());
        }
        w.normalize();
        const orthonormal_1 = Vec3.cross(normal.copy(), w.copy()).normalize();
        const orthonormal_2 = Vec3.cross(normal.copy(), orthonormal_1.copy()).normalize();
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
        return '{origin: ' + Utils.Vec3_toFixed(this.origin, 3) + ', direction: ' + Utils.Vec3_toFixed(this.direction, 3) + '}';
    }
}
//# sourceMappingURL=Utils.js.map