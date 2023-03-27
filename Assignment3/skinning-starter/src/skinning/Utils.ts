import { Vec3, Vec4, Mat4, Quat, Vec2 } from "../lib/TSM.js";
import { Hex } from "./Hex.js";

// http-server dist -c-1

export class Utils
{
    public static get_color(_name : string) : Vec3
    {
        switch (_name)
        {
            case "white":   return new Vec3([1.0, 1.0, 1.0])
            case "black":   return new Vec3([0.0, 0.0, 0.0])
            case "red":     return new Vec3([1.0, 0.0, 0.0])
            case "green":   return new Vec3([0.0, 1.0, 0.0])
            case "blue":    return new Vec3([0.0, 0.0, 1.0])
            case "cyan":    return new Vec3([0.0, 1.0, 1.0])
            case "pink":    return new Vec3([1.0, 0.0, 1.0])
            default:        break;
        }
        // return white as default
        return new Vec3([0.0, 0.0, 0.0])
    }

    // used to print a Vec3 with rounded float values
    public static vec3_toFixed(vec : Vec3, digits : number = 3)
    {
        return vec.x.toFixed(digits) + ', ' + vec.y.toFixed(digits) + ', ' + vec.z.toFixed(digits)
    }

    public static vec2_toFixed(vec : Vec2, digits : number = 3)
    {
        return vec.x.toFixed(digits) + ', ' + vec.y.toFixed(digits)
    }

    public static quat_toFixed(quat : Quat, digits : number = 3)
    {
        return quat.x.toFixed(digits) + ', ' + quat.y.toFixed(digits) + ', ' + quat.z.toFixed(digits) + ', ' + quat.w.toFixed(digits)
    }

    public static mat4_toFixed(mat : Mat4, digits : number = 3)
    {
        return '\n' +
        '|' + mat.at(0).toFixed(digits) + '|' + mat.at(4).toFixed(digits) + '|' + mat.at(8).toFixed(digits) + '|' + mat.at(12).toFixed(digits) + '|\n' +
        '|' + mat.at(1).toFixed(digits) + '|' + mat.at(5).toFixed(digits) + '|' + mat.at(9).toFixed(digits) + '|' + mat.at(13).toFixed(digits) + '|\n' +
        '|' + mat.at(2).toFixed(digits) + '|' + mat.at(6).toFixed(digits) + '|' + mat.at(10).toFixed(digits) + '|' + mat.at(14).toFixed(digits) + '|\n' +
        '|' + mat.at(3).toFixed(digits) + '|' + mat.at(7).toFixed(digits) + '|' + mat.at(11).toFixed(digits) + '|' + mat.at(15).toFixed(digits) + '|\n'
    }

    // checks if the ray intersects this cyliner and returns t value at intersection
    public static ray_interset(ray : Ray, start : Vec3, end : Vec3) : [boolean, number]
    {
        const cyl_pos : Vec3 = start.copy()  // r1
        const cyl_dir : Vec3 = end.copy().subtract(start.copy()).normalize() // e1

        const ray_pos : Vec3 = ray.get_origin() // r2
        const ray_dir : Vec3 = ray.get_direction().normalize() // e2

        // line connecting closest points has dir vector n
        const n : Vec3 = Vec3.cross(cyl_dir, ray_dir) // e1 x e2

        // return if cross product is 0
        if (n == Vec3.zero) return [false, Number.MIN_VALUE]
        
        const r2_sub_r1 : Vec3 = ray_pos.copy().subtract(cyl_pos)
        const n_dot_n : number = Vec3.dot(n, n)
        // compute t1 and t2
        const t1 : number = Vec3.dot(Vec3.cross(ray_dir, n), r2_sub_r1) / n_dot_n
        const t2 : number = Vec3.dot(Vec3.cross(cyl_dir, n), r2_sub_r1) / n_dot_n
        // compute p1 and p2
        const p1 : Vec3 = cyl_pos.copy().add(cyl_dir.copy().scale(t1))
        const p2 : Vec3 = ray_pos.copy().add(ray_dir.copy().scale(t2))
        // confirm
        const dist : number = Vec3.distance(p1, p2)
        
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
        if (dist > Hex.radius) return [false, Number.MIN_VALUE]

        // return if dist(mid_point -> p1) > length / 2
        const mid_point : Vec3 = Utils.mid_point(start, end)
        const length = Vec3.distance(end, start)
        if (Vec3.distance(mid_point, p1) > length / 2) return [false, Number.MIN_VALUE]
     
        // now, return true
        return [true, (t2 * -1.0)]
    }

    public static get_perpendicular(v : Vec3) : Vec3
    {
        // find non-zero coord
        let non_zero_coord : number = 0.0
        for (let i = 0; i < 3; i++)
        {
            if (v.at(i) != 0.0)
            {
                non_zero_coord = v.at(i)
                break
            }
        }
        // return zero vector if all are 0
        if (non_zero_coord == 0.0)
        {
            return new Vec3([0.0, 0.0, 0.0])
        }
        // choose another coord that is not equal tto the non-zero coord
        let other_coord : number = non_zero_coord
        for (let i = 0; i < 3; i++)
        {
            if (v.at(i) != non_zero_coord)
            {
                other_coord = v.at(i)
                break
            }
        }
        // if all coords are equal, return zero vector
        if (other_coord == non_zero_coord)
        {
            return new Vec3([0.0, 0.0, 0.0])
        }
        // compute perpendicular vector using cross product
        let z : number = 0.0
        if (v.at(2) != 0.0)
        {
            z = (non_zero_coord * other_coord * -1.0) / v.at(2)
        }
        const p : Vec3 = new Vec3([non_zero_coord, other_coord, z])
        //console.log('per: ' + Ray.Vec3_toFixed(p))
        return p
    }

    public static rotate_point(point : Vec3, axis : Vec3, radians : number) : Vec3
    {
        console.assert(axis != null);
        console.assert(radians != null);
        axis.normalize();
    
        // Compute rotation matrix
        const rotMat: Mat4 = new Mat4().setIdentity();
        rotMat.rotate(radians, axis);

        //console.log('[ROTATE] point: ' + Ray.Vec3_toFixed(point) + ', axis: ' + Ray.Vec3_toFixed(axis))
        const res : Vec3 = rotMat.multiplyPt3(point);

        //console.log('rotate: ' + Ray.Vec3_toFixed(res))
        return res
    }

    public static rotate_vec_using_quat(vec : Vec3, quat : Quat) : Vec3
    {
        // Convert vector to quaternion with w = 0
        const v : Quat = new Quat([vec.x, vec.y, vec.z, 0])
        // Apply rotation to vector by multiplying quaternions
        const res : Quat = quat.copy().multiply(v.copy().multiply(quat.copy().conjugate()))
        // Extract x, y, z components of resulting quaternion
        return new Vec3(res.xyz)
    }

    public static magnitude(v : Vec3) : number
    {
        const a : number = v.at(0) * v.at(0)
        const b : number = v.at(1) * v.at(1)
        const c : number = v.at(2) * v.at(2)
        let res : number = a + b + c
        res = Math.sqrt(res)
        return res
    }

    public static mid_point(p1 : Vec3, p2 : Vec3) : Vec3
    {
        const x : number = (p1.x + p2.x) / 2.0
        const y : number = (p1.y + p2.y) / 2.0
        const z : number = (p1.z + p2.z) / 2.0
        return new Vec3([x, y, z])
    }

    public static apply_quaternion(q : Vec4, v : Vec3) : Vec3 
    {
        let cross1 : Vec3 = Vec3.cross(v, new Vec3(q.xyz))
        cross1 = cross1.subtract(v.copy().scale(q.w))
        let cross2 : Vec3 = Vec3.cross(cross1, new Vec3(q.xyz))
        return v.copy().add(cross2.copy().scale(2))
    }

    public static create_quaternion_from_axis_and_angle(axis : Vec3, angle : number) : Quat
    {
        // Here we calculate the sin(theta / 2) once for optimization
        const factor : number = Math.sin(angle / 2);

        // Calculate the x, y and z of the quaternion
        const x : number = axis.x * factor;
        const y : number = axis.y * factor;
        const z : number = axis.z * factor;

        // Calcualte the w value by cos( theta / 2 )
        const w : number = Math.cos(angle / 2);

        return new Quat([x, y, z, w]).normalize();
    }

    public static ortho_x_quat : Quat = new Quat([-0.7071068, 0, 0, 0.7071068])
    public static ortho_y_quat : Quat = new Quat([0, 0.7071068, 0, 0.7071068])
    public static find_orthonormal_vectors(normal : Vec3) : [Vec3, Vec3]
    {
        let w : Vec3 = this.rotate_vec_using_quat(normal, this.ortho_x_quat)
        const dot : number = Vec3.dot(normal, w)

        if (Math.abs(dot) > 0.0)
        {
            w = this.rotate_vec_using_quat(normal, this.ortho_y_quat)
        }

        w.normalize()

        const orthonormal_1 : Vec3 = Vec3.cross(normal, w).normalize()
        const orthonormal_2 : Vec3 = Vec3.cross(normal, orthonormal_1).normalize()
        return [orthonormal_1, orthonormal_2]
    }
}

export class Ray
{
    private origin : Vec3
    private direction : Vec3

    public get_origin() : Vec3 { return new Vec3(this.origin.xyz) }
    public get_direction() : Vec3 { return new Vec3(this.direction.xyz).normalize() }

    constructor(_origin : Vec3, _direction : Vec3)
    {
        this.origin = _origin.copy()
        this.direction = _direction.copy()
    }

    public copy()
    {
        return new Ray(this.origin.copy(), this.direction.copy())
    }

    public print()
    {
        return '{origin: ' + Utils.vec3_toFixed(this.origin, 3) + ', direction: ' + Utils.vec3_toFixed(this.direction, 3) + '}'
    }
}