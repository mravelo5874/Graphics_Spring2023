import { Vec3, Mat4, Quat } from "../lib/TSM.js";
// http-server dist -c-1
export class Util {
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
Util.ortho_x_quat = new Quat([-0.7071068, 0, 0, 0.7071068]);
Util.ortho_y_quat = new Quat([0, 0.7071068, 0, 0.7071068]);
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
        return '{origin: ' + Util.Vec3_toFixed(this.origin, 3) + ', direction: ' + Util.Vec3_toFixed(this.direction, 3) + '}';
    }
}
// class used to convert bones into hex prisms
export class Hex {
    get_update() { return this.update; }
    got_update() { this.update = false; }
    constructor() {
        this.update = false;
        this.start = Vec3.zero.copy();
        this.end = Vec3.zero.copy();
        this.id = -1;
        this.deleted = false;
        this.color = new Vec3([0.0, 1.0, 0.0]); // default color is green
        this.hex_indices = new Array();
        this.hex_positions = new Array();
        this.hex_colors = new Array();
    }
    set_color(_color) {
        // return if already this color
        if (this.color == _color)
            return;
        // set color
        this.color = _color;
        // update current colors
        if (this.hex_colors.length > 0) {
            // remove colors
            this.hex_colors.splice(0, this.hex_colors.length);
            // add ray colors (should be 18 lines = 36 indices = 108 pos values = 108 color values
            for (let i = 0; i < 36; i++) {
                this.hex_colors.push(this.color.x);
                this.hex_colors.push(this.color.y);
                this.hex_colors.push(this.color.z);
            }
        }
    }
    rotate(quat) {
        let i = 0;
        while (i < this.hex_positions.length) {
            // get pos
            const x = this.hex_positions[i];
            const y = this.hex_positions[i + 1];
            const z = this.hex_positions[i + 2];
            const pos = new Vec3([x, y, z]);
            // rotate pos
            const rot_pos = pos.copy().multiplyByQuat(quat);
            // re-assign pos
            this.hex_positions[i] = rot_pos.x;
            this.hex_positions[i + 1] = rot_pos.y;
            this.hex_positions[i + 2] = rot_pos.z;
            i += 3;
        }
        this.update = true;
    }
    set(_start, _end, _id) {
        // return if same id
        if (this.id == _id)
            return;
        // set new values
        this.id = _id;
        this.deleted = false;
        // console.log('Hex.set()')
        // console.log('this.start: ' + Util.Vec3_toFixed(this.start))
        // console.log('_start: ' + Util.Vec3_toFixed(_start))
        // console.log('this.end: ' + Util.Vec3_toFixed(this.end))
        // console.log('_end: ' + Util.Vec3_toFixed(_end))
        // console.log('\n')
        this.start = _start.copy();
        this.end = _end.copy();
        this.hex_indices.splice(0, this.hex_indices.length);
        this.hex_positions.splice(0, this.hex_positions.length);
        this.hex_colors.splice(0, this.hex_colors.length);
        this.convert();
        this.update = true;
    }
    del() {
        // return already deleted
        if (this.deleted)
            return;
        // set new values
        this.id = -1;
        this.deleted = true;
        // console.log('Hex.del()')
        // console.log('this.start: ' + Util.Vec3_toFixed(this.start))
        // console.log('_start: ' + Util.Vec3_toFixed(Vec3.zero.copy()))
        // console.log('this.end: ' + Util.Vec3_toFixed(this.end))
        // console.log('_end: ' + Util.Vec3_toFixed(Vec3.zero.copy()))
        // console.log('\n')
        this.start = Vec3.zero.copy();
        this.end = Vec3.zero.copy();
        this.hex_indices.splice(0, this.hex_indices.length);
        this.hex_positions.splice(0, this.hex_positions.length);
        this.hex_colors.splice(0, this.hex_colors.length);
        this.update = true;
    }
    convert() {
        const dir = this.end.copy().subtract(this.start.copy()).normalize();
        const per = Util.find_orthonormal_vectors(dir.copy())[0].normalize();
        // console.log('[HEX]' + 
        // '\n\tstart: ' + Util.Vec3_toFixed(this.start) +
        // '\n\tend: ' + Util.Vec3_toFixed(this.end) +
        // '\n\tdir: ' + Util.Vec3_toFixed(dir) +
        // '\n\tper: ' + Util.Vec3_toFixed(per) +
        // '\n\tlen: ' + len.toFixed(3)
        // )
        // calculate 6 hex points around start point
        const init_p = per.copy().scale(Hex.radius);
        const a1 = Util.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 0).add(this.start.copy());
        const b1 = Util.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 1).add(this.start.copy());
        const c1 = Util.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 2).add(this.start.copy());
        const d1 = Util.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 3).add(this.start.copy());
        const e1 = Util.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 4).add(this.start.copy());
        const f1 = Util.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 5).add(this.start.copy());
        // console.log('a1: ' + Util.Vec3_toFixed(a1) +
        // '\nb1: ' + Util.Vec3_toFixed(b1) +
        // '\nc1: ' + Util.Vec3_toFixed(c1) +
        // '\nd1: ' + Util.Vec3_toFixed(d1) +
        // '\ne1: ' + Util.Vec3_toFixed(e1) +
        // '\nf1: ' + Util.Vec3_toFixed(f1))
        const a2 = Util.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 0).add(this.end.copy());
        const b2 = Util.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 1).add(this.end.copy());
        const c2 = Util.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 2).add(this.end.copy());
        const d2 = Util.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 3).add(this.end.copy());
        const e2 = Util.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 4).add(this.end.copy());
        const f2 = Util.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 5).add(this.end.copy());
        // console.log('a2: ' + Util.Vec3_toFixed(a2) +
        // '\nb2: ' + Util.Vec3_toFixed(b2) +
        // '\nc2: ' + Util.Vec3_toFixed(c2) +
        // '\nd2: ' + Util.Vec3_toFixed(d2) +
        // '\ne2: ' + Util.Vec3_toFixed(e2) +
        // '\nf2: ' + Util.Vec3_toFixed(f2))
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
        // add ray colors (should be 18 lines = 36 indices = 108 pos values = 108 color values
        for (let i = 0; i < 36; i++) {
            this.hex_colors.push(this.color.x);
            this.hex_colors.push(this.color.y);
            this.hex_colors.push(this.color.z);
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
    get_id() { return this.bone_id; }
    get_quat() { return this.quat; }
    get_tran() { return this.tran; }
    constructor(_bone_id, _start_point, _end_point, _quat, _tran) {
        this.bone_id = _bone_id;
        this.start_point = _start_point.copy();
        this.end_point = _end_point.copy();
        this.mid_point = Util.mid_point(_start_point.copy(), _end_point.copy());
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
//# sourceMappingURL=Utils.js.map