import { Vec3, Mat4 } from "../lib/TSM.js";
import { Bone, Mesh } from "./Scene.js"

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
        console.log('per: ' + Ray.Vec3_toFixed(p))
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

        console.log('[ROTATE] point: ' + Ray.Vec3_toFixed(point) + ', axis: ' + Ray.Vec3_toFixed(axis))
        const res : Vec3 = rotMat.multiplyPt3(point);

        //console.log('rotate: ' + Ray.Vec3_toFixed(res))
        return res
    }
}

// class used to convert bones into hex prisms
export class Hex
{
    public static radius : number = 0.1
    public static pi_over_3 : number = Math.PI / 3

    private start : Vec3;
    private end : Vec3;

    private hex_indices : number[];
    private hex_positions : number[];
    private hex_colors : number[];

    constructor(_start : Vec3, _end : Vec3)
    {
        this.start = _start.copy();
        this.end = _end.copy();

        this.hex_indices = new Array<number>();
        this.hex_positions = new Array<number>();
        this.hex_colors = new Array<number>();

        this.convert()
    }

    private convert() : void
    {
        let dir : Vec3 = this.end.copy().subtract(this.start.copy()).normalize()
        let per : Vec3 = Ray.get_perpendicular(dir.copy()).normalize()
        let len : number = Vec3.distance(this.start.copy(), this.end.copy())
        
        console.log('[HEX]' + 
        '\n\tstart: ' + Ray.Vec3_toFixed(this.start) +
        '\n\tend: ' + Ray.Vec3_toFixed(this.end) +
        '\n\tdir: ' + Ray.Vec3_toFixed(dir) +
        '\n\tper: ' + Ray.Vec3_toFixed(per) +
        '\n\tlen: ' + len.toFixed(3)
        )
        
        // calculate 6 hex points around start point
        const start_point : Vec3 = this.start.copy().add(per.copy().scale(Hex.radius))
        console.log('start point: ' + Ray.Vec3_toFixed(start_point))
        const a1 : Vec3 = Ray.rotate_point(start_point, dir.copy(), Hex.pi_over_3 * 0)
        const b1 : Vec3 = Ray.rotate_point(start_point, dir.copy(), Hex.pi_over_3 * 1)
        const c1 : Vec3 = Ray.rotate_point(start_point, dir.copy(), Hex.pi_over_3 * 2)
        const d1 : Vec3 = Ray.rotate_point(start_point, dir.copy(), Hex.pi_over_3 * 3)
        const e1 : Vec3 = Ray.rotate_point(start_point, dir.copy(), Hex.pi_over_3 * 4)
        const f1 : Vec3 = Ray.rotate_point(start_point, dir.copy(), Hex.pi_over_3 * 5)

        console.log('a1: ' + Ray.Vec3_toFixed(a1) +
        '\nb1: ' + Ray.Vec3_toFixed(b1) +
        '\nc1: ' + Ray.Vec3_toFixed(c1) +
        '\nd1: ' + Ray.Vec3_toFixed(d1) +
        '\ne1: ' + Ray.Vec3_toFixed(e1) +
        '\nf1: ' + Ray.Vec3_toFixed(f1))

        // calculate 6 hex points around end point
        const end_point : Vec3 = this.end.copy().add(per.copy().scale(Hex.radius))
        console.log('end point: ' + Ray.Vec3_toFixed(end_point))
        const a2 : Vec3 = Ray.rotate_point(end_point, dir.copy(), Hex.pi_over_3 * 0)
        const b2 : Vec3 = Ray.rotate_point(end_point, dir.copy(), Hex.pi_over_3 * 1)
        const c2 : Vec3 = Ray.rotate_point(end_point, dir.copy(), Hex.pi_over_3 * 2)
        const d2 : Vec3 = Ray.rotate_point(end_point, dir.copy(), Hex.pi_over_3 * 3)
        const e2 : Vec3 = Ray.rotate_point(end_point, dir.copy(), Hex.pi_over_3 * 4)
        const f2 : Vec3 = Ray.rotate_point(end_point, dir.copy(), Hex.pi_over_3 * 5)

        console.log('a2: ' + Ray.Vec3_toFixed(a2) +
        '\nb2: ' + Ray.Vec3_toFixed(b2) +
        '\nc2: ' + Ray.Vec3_toFixed(c2) +
        '\nd2: ' + Ray.Vec3_toFixed(d2) +
        '\ne2: ' + Ray.Vec3_toFixed(e2) +
        '\nf2: ' + Ray.Vec3_toFixed(f2))

        // [ create line segments and store ]

        // add ray indices (should be 18 lines = 36 indices)
        for (let i = 0; i < 36; i++) this.hex_indices.push(i)
        
        // add ray positions (should be 18 lines = 36 indices = 108 pos values)

        // start hexagon cap
        for (let i = 0; i < 3; i++) this.hex_positions.push(a1.at(i))
        for (let i = 0; i < 3; i++) this.hex_positions.push(b1.at(i))

        for (let i = 0; i < 3; i++) this.hex_positions.push(b1.at(i))
        for (let i = 0; i < 3; i++) this.hex_positions.push(c1.at(i))

        for (let i = 0; i < 3; i++) this.hex_positions.push(c1.at(i))
        for (let i = 0; i < 3; i++) this.hex_positions.push(d1.at(i))

        for (let i = 0; i < 3; i++) this.hex_positions.push(d1.at(i))
        for (let i = 0; i < 3; i++) this.hex_positions.push(e1.at(i))

        for (let i = 0; i < 3; i++) this.hex_positions.push(e1.at(i))
        for (let i = 0; i < 3; i++) this.hex_positions.push(f1.at(i))

        for (let i = 0; i < 3; i++) this.hex_positions.push(f1.at(i))
        for (let i = 0; i < 3; i++) this.hex_positions.push(a1.at(i))

        // end hexagon cap
        for (let i = 0; i < 3; i++) this.hex_positions.push(a2.at(i))
        for (let i = 0; i < 3; i++) this.hex_positions.push(b2.at(i))

        for (let i = 0; i < 3; i++) this.hex_positions.push(b2.at(i))
        for (let i = 0; i < 3; i++) this.hex_positions.push(c2.at(i))

        for (let i = 0; i < 3; i++) this.hex_positions.push(c2.at(i))
        for (let i = 0; i < 3; i++) this.hex_positions.push(d2.at(i))

        for (let i = 0; i < 3; i++) this.hex_positions.push(d2.at(i))
        for (let i = 0; i < 3; i++) this.hex_positions.push(e2.at(i))

        for (let i = 0; i < 3; i++) this.hex_positions.push(e2.at(i))
        for (let i = 0; i < 3; i++) this.hex_positions.push(f2.at(i))

        for (let i = 0; i < 3; i++) this.hex_positions.push(f2.at(i))
        for (let i = 0; i < 3; i++) this.hex_positions.push(a2.at(i))

        // connect caps
        for (let i = 0; i < 3; i++) this.hex_positions.push(a1.at(i))
        for (let i = 0; i < 3; i++) this.hex_positions.push(a2.at(i))

        for (let i = 0; i < 3; i++) this.hex_positions.push(b1.at(i))
        for (let i = 0; i < 3; i++) this.hex_positions.push(b2.at(i))

        for (let i = 0; i < 3; i++) this.hex_positions.push(c1.at(i))
        for (let i = 0; i < 3; i++) this.hex_positions.push(c2.at(i))

        for (let i = 0; i < 3; i++) this.hex_positions.push(d1.at(i))
        for (let i = 0; i < 3; i++) this.hex_positions.push(d2.at(i))

        for (let i = 0; i < 3; i++) this.hex_positions.push(e1.at(i))
        for (let i = 0; i < 3; i++) this.hex_positions.push(e2.at(i))

        for (let i = 0; i < 3; i++) this.hex_positions.push(f1.at(i))
        for (let i = 0; i < 3; i++) this.hex_positions.push(f2.at(i))

        // add ray colors (should be 18 lines = 36 indices = 108 pos values = 108 color values)
        let color_id : Vec3 = new Vec3([0.0, 1.0, 0.0])
        for (let i = 0; i < 36; i++)
        {
            this.hex_colors.push(color_id.x)
            this.hex_colors.push(color_id.y)
            this.hex_colors.push(color_id.z)
        }
    }

    public get_hex_indices(): Uint32Array 
    {
        console.log('hex indices: ' + this.hex_indices)
        return new Uint32Array(this.hex_indices);
    }

    public get_hex_positions(): Float32Array 
    {
        console.log('hex pos: ' + this.hex_positions)
        return new Float32Array(this.hex_positions);
    }

    public get_hex_colors() : Float32Array
    {
        console.log('hex colors: ' + this.hex_colors)
        return new Float32Array(this.hex_colors)
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
        let str_p : Vec3 = this.start_point.copy()
        let end_p : Vec3 = this.end_point.copy()

        //console.log('cyl: ' + this.bone_id + ', str: ' + Ray.Vec3_toFixed(str_p) + ', end: ' + Ray.Vec3_toFixed(end_p))

        // point on ray closest to cylinder line
        let a : Ray = ray.copy() // mouse vector
        let b : Ray = new Ray(str_p, end_p.copy().subtract(str_p)) // cyliner vector
        let c : Ray = new Ray(a.get_origin(), a.get_origin().subtract(b.get_origin()).normalize()) // difference vector

        //console.log('cyl: ' + this.bone_id + '\n\ta: ' + a.print() + '\n\tb: ' + b.print() + '\n\tc: ' + c.print())

        let p : number = Vec3.dot(a.get_direction(), b.get_direction())
        let q : number = Vec3.dot(a.get_direction(), c.get_direction())
        let r : number = Vec3.dot(b.get_direction(), c.get_direction())
        let s : number = Vec3.dot(a.get_direction(), a.get_direction())
        let t : number = Vec3.dot(b.get_direction(), b.get_direction())

        // if (s == 0.0 || t == 0.0 || (p*p) == (s*t))
        // {
        //     return [false, -1]
        // }
        
        let denom : number = (s * t) - (p * p)
        let d : number = ((-p * r) + (q * t)) / denom
        let e : number = ((p * q) + (r * s)) / denom
        let D : Vec3 = a.get_direction() // point on a closest to b
        D = D.normalize().scale(d)
        let E : Vec3 = b.get_direction() // point on b closest to a
        E = E.normalize().scale(e)

        let cyl_mid_dist : number = Vec3.distance(this.mid_point, E)
        let D_E_dist : number = Vec3.distance(D, E)
        
        // console.log('[CALCS]')
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