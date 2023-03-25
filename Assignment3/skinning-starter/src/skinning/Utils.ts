import { Vec3, Vec4, Mat4, Quat, Vec2 } from "../lib/TSM.js";

// http-server dist -c-1

export class Utils
{
    public static get_color(_name : string) : Vec3
    {
        switch (_name)
        {
            case "white":   return new Vec3([0.0, 0.0, 0.0])
            case "black":   return new Vec3([1.0, 1.0, 1.0])
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
    public static Vec3_toFixed(vec : Vec3, digits : number = 3)
    {
        return vec.x.toFixed(digits) + ', ' + vec.y.toFixed(digits) + ', ' + vec.z.toFixed(digits)
    }

    public static Vec2_toFixed(vec : Vec2, digits : number = 3)
    {
        return vec.x.toFixed(digits) + ', ' + vec.y.toFixed(digits)
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
        let cross1 : Vec3 = Vec3.cross(v.copy(), new Vec3(q.xyz))
        cross1 = cross1.subtract(v.copy().scale(q.w))
        let cross2 : Vec3 = Vec3.cross(cross1.copy(), new Vec3(q.xyz))
        return v.copy().add(cross2.copy().scale(2))
    }

    public static create_quaternion_from_axis_and_angle(axis : Vec3, angle : number) : Quat
    {
        // Here we calculate the sin( theta / 2) once for optimization
        const factor : number = Math.sin(angle / 2.0);

        // Calculate the x, y and z of the quaternion
        const x : number = axis.at(0) * factor;
        const y : number = axis.at(1) * factor;
        const z : number = axis.at(2) * factor;

        // Calcualte the w value by cos( theta / 2 )
        const w : number = Math.cos(angle / 2.0);

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

    public static rotate_vec_using_quat(vec : Vec3, quat : Quat) : Vec3
    {
        // Convert vector to quaternion with w = 0
        const v : Quat = new Quat([vec.x, vec.y, vec.z, 0])
        // Apply rotation to vector by multiplying quaternions
        const res : Quat = quat.copy().multiply(v.copy().multiply(quat.copy().conjugate()))
        // Extract x, y, z components of resulting quaternion
        return new Vec3(res.xyz)
    }

    public static ortho_x_quat : Quat = new Quat([-0.7071068, 0, 0, 0.7071068])
    public static ortho_y_quat : Quat = new Quat([0, 0.7071068, 0, 0.7071068])
    public static find_orthonormal_vectors(normal : Vec3) : [Vec3, Vec3]
    {
        let w : Vec3 = this.rotate_vec_using_quat(normal.copy(), this.ortho_x_quat.copy())
        const dot : number = Vec3.dot(normal.copy(), w.copy())

        if (Math.abs(dot) > 0.0)
        {
            w = this.rotate_vec_using_quat(normal.copy(), this.ortho_y_quat.copy())
        }

        w.normalize()

        const orthonormal_1 : Vec3 = Vec3.cross(normal.copy(), w.copy()).normalize()
        const orthonormal_2 : Vec3 = Vec3.cross(normal.copy(), orthonormal_1.copy()).normalize()
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
        return '{origin: ' + Utils.Vec3_toFixed(this.origin, 3) + ', direction: ' + Utils.Vec3_toFixed(this.direction, 3) + '}'
    }
}