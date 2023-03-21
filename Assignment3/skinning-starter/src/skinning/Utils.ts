import { Vec3 } from "../lib/TSM.js";

// http-server dist -c-1

export class Ray
{
    private origin : Vec3
    private direction : Vec3

    public get_origin() : Vec3 { return new Vec3(this.origin.xyz) }
    public get_direction() : Vec3 { return new Vec3(this.direction.xyz) }

    constructor(_origin : Vec3, _direction : Vec3)
    {
        this.origin = _origin
        this.direction = _direction
    }

    public copy()
    {
        return new Ray(this.origin, this.direction)
    }

    public print()
    {
        return '{origin: ' + Ray.Vec3_toFixed(this.origin, 3) + ', direction: ' + Ray.Vec3_toFixed(this.direction, 3) + '}'
    }

    // used to print a Vec3 with rounded float values
    public static Vec3_toFixed(vec : Vec3, digits : number = 3)
    {
        return vec.x.toFixed(digits) + ', ' + vec.y.toFixed(digits) + ', ' + vec.z.toFixed(digits)
    }
}

export class Cylinder
{
    start_point : Vec3
    end_point : Vec3
    mid_point : Vec3
    length : number
    radius : number
    bone_id : number
    
    constructor(_start_point : Vec3, _end_point : Vec3, _radius : number, _id : number)
    {
        this.start_point = _start_point
        this.end_point = _end_point
        this.mid_point = Vec3.difference(_end_point, _start_point)
        this.radius = _radius
        this.length = Vec3.distance(_end_point, _start_point)
        this.bone_id = _id

        //console.log('cyl: ' + _id + ', start: ' + Ray.Vec3_toFixed(_start_point) + ', end: ' + Ray.Vec3_toFixed(_end_point) + ', radius: ' + _radius)
    }
    
    // checks if the ray intersects this cyliner and returns t value at intersection
    public ray_interset(ray : Ray) : [boolean, number]
    {
        // point on ray closest to cylinder line
        let a : Ray = ray.copy() // mouse vector
        let b : Ray = new Ray(this.start_point, Vec3.difference(this.start_point, this.end_point)) // cyliner vector
        let c : Ray = new Ray(a.get_origin(), Vec3.difference(a.get_origin(), b.get_origin())) // difference vector

        //console.log('cyl: ' + this.bone_id + '\n\ta: ' + a.print() + '\n\tb: ' + b.print() + '\n\tc: ' + c.print())

        let p : number = Vec3.dot(a.get_direction(), b.get_direction())
        let q : number = Vec3.dot(a.get_direction(), c.get_direction())
        let r : number = Vec3.dot(b.get_direction(), c.get_direction())
        let s : number = Vec3.dot(a.get_direction(), a.get_direction())
        let t : number = Vec3.dot(b.get_direction(), b.get_direction())

        if (s == 0.0 || t == 0.0 || (p*p) == (s*t))
        {
            return [false, -1]
        }
        
        let denom : number = (s * t) - (p * p)
        let d : number = ((-p * r) + (q * t)) / denom
        let e : number = ((p * q) + (r * s)) / denom
        let D : Vec3 = a.get_direction() // point on a closest to b
        D = D.normalize().scale(d)
        let E : Vec3 = b.get_direction() // point on b closest to a
        E = E.normalize().scale(e)

        let cyl_mid_dist : number = Vec3.distance(this.mid_point, E)
        let D_E_dist : number = Vec3.distance(D, E)

        // console.log('D: {' + Ray.Vec3_toFixed(D) + '}\nE: {' + Ray.Vec3_toFixed(E) + '}')
        // console.log('cyl-mid->E distance: ' + cyl_mid_dist)
        // console.log('cyl_length / 2: ' + this.length / 2)
        // console.log('D->E distance: ' + D_E_dist)
        // console.log('cyl_radius: ' + this.radius)

        if (Vec3.distance(this.mid_point, E) > (this.length / 2))
        {
            return [false, -1]
        }

        if (D_E_dist > this.radius)
        {
            return [false, -1]
        }

        return [true, d]
    }
}