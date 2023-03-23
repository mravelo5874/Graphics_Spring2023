import { Vec3, Mat4 } from "../lib/TSM.js";
import { Bone, Mesh } from "./Scene.js"

// http-server dist -c-1

export class Util
{
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
}

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
        return '{origin: ' + Util.Vec3_toFixed(this.origin, 3) + ', direction: ' + Util.Vec3_toFixed(this.direction, 3) + '}'
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

    private init : boolean = false
    private update : boolean = false

    public get_update() : boolean { return this.update }
    public got_update() : void { this.update = false }

    constructor()
    {
        if (!this.init)
        {
            this.start = Vec3.zero.copy()
            this.end = Vec3.zero.copy()

            this.hex_indices = new Array<number>();
            this.hex_positions = new Array<number>();
            this.hex_colors = new Array<number>();
            this.init = true
        }
    }

    public set(_start : Vec3, _end : Vec3)
    {
        if (!this.update)
        {
            this.start = _start.copy();
            this.end = _end.copy();
            this.hex_indices = new Array<number>();
            this.hex_positions = new Array<number>();
            this.hex_colors = new Array<number>();
            this.convert()
            this.update = true
        }
    }

    public del()
    {
        if (!this.update)
        {
            this.start = Vec3.zero.copy()
            this.end = Vec3.zero.copy()
            this.hex_indices = new Array<number>();
            this.hex_positions = new Array<number>();
            this.hex_colors = new Array<number>();
            this.update = true
        }
    }

    private convert() : void
    {
        let dir : Vec3 = this.end.copy().subtract(this.start.copy()).normalize()
        let per : Vec3 = Util.get_perpendicular(dir.copy()).normalize()
        let len : number = Vec3.distance(this.start.copy(), this.end.copy())
        
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
        const start_point : Vec3 = this.start.copy().add(per.copy().scale(Hex.radius))
        //console.log('start point: ' + Ray.Vec3_toFixed(start_point))
        const a1 : Vec3 = Util.rotate_point(start_point, dir.copy(), Hex.pi_over_3 * 0)
        const b1 : Vec3 = Util.rotate_point(start_point, dir.copy(), Hex.pi_over_3 * 1)
        const c1 : Vec3 = Util.rotate_point(start_point, dir.copy(), Hex.pi_over_3 * 2)
        const d1 : Vec3 = Util.rotate_point(start_point, dir.copy(), Hex.pi_over_3 * 3)
        const e1 : Vec3 = Util.rotate_point(start_point, dir.copy(), Hex.pi_over_3 * 4)
        const f1 : Vec3 = Util.rotate_point(start_point, dir.copy(), Hex.pi_over_3 * 5)

        /*
        console.log('a1: ' + Ray.Vec3_toFixed(a1) +
        '\nb1: ' + Ray.Vec3_toFixed(b1) +
        '\nc1: ' + Ray.Vec3_toFixed(c1) +
        '\nd1: ' + Ray.Vec3_toFixed(d1) +
        '\ne1: ' + Ray.Vec3_toFixed(e1) +
        '\nf1: ' + Ray.Vec3_toFixed(f1))
        */

        // calculate 6 hex points around end point
        const end_point : Vec3 = this.end.copy().add(per.copy().scale(Hex.radius))
        //console.log('end point: ' + Ray.Vec3_toFixed(end_point))
        const a2 : Vec3 = Util.rotate_point(end_point, dir.copy(), Hex.pi_over_3 * 0)
        const b2 : Vec3 = Util.rotate_point(end_point, dir.copy(), Hex.pi_over_3 * 1)
        const c2 : Vec3 = Util.rotate_point(end_point, dir.copy(), Hex.pi_over_3 * 2)
        const d2 : Vec3 = Util.rotate_point(end_point, dir.copy(), Hex.pi_over_3 * 3)
        const e2 : Vec3 = Util.rotate_point(end_point, dir.copy(), Hex.pi_over_3 * 4)
        const f2 : Vec3 = Util.rotate_point(end_point, dir.copy(), Hex.pi_over_3 * 5)

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
        return new Uint32Array(this.hex_indices);
    }

    public get_hex_positions(): Float32Array 
    {
        return new Float32Array(this.hex_positions);
    }

    public get_hex_colors() : Float32Array
    {
        return new Float32Array(this.hex_colors)
    }
}

export class Cylinder
{
    private start_point : Vec3
    private end_point : Vec3
    private mid_point : Vec3
    private length : number

    public get_start() : Vec3 { return this.start_point.copy() }
    public get_end() : Vec3 { return this.end_point.copy() }
    
    constructor(_start_point : Vec3, _end_point : Vec3, _radius : number, _id : number)
    {
        this.start_point = _start_point.copy()
        this.end_point = _end_point.copy()
        this.mid_point = Vec3.difference(_end_point.copy(), _start_point.copy())
        this.length = Vec3.distance(_end_point.copy(), _start_point.copy())
        //console.log('cyl: ' + _id + ', start: ' + Util.Vec3_toFixed(_start_point) + ', end: ' + Util.Vec3_toFixed(_end_point) + ', radius: ' + _radius)
    }
    
    // checks if the ray intersects this cyliner and returns t value at intersection
    public ray_interset(ray : Ray) : [boolean, number]
    {
        const cyl_pos : Vec3 = this.start_point.copy()  // r1
        const cyl_dir : Vec3 = this.end_point.copy().subtract(this.start_point.copy()).normalize() // e1

        const ray_pos : Vec3 = ray.get_origin() // r2
        const ray_dir : Vec3 = ray.get_direction().normalize() // e2

        // line connecting closest points has dir vector n
        const n : Vec3 = Vec3.cross(cyl_dir.copy(), ray_dir.copy()) // e1 x e2

        // return if cross product is 0
        if (n == Vec3.zero) return [false, Number.MIN_VALUE]

        // compute distance bewteen p1 and p2
        const d : number = Math.abs(Vec3.dot(n.copy(), (cyl_pos.copy().subtract(ray_pos.copy())))) / Util.magnitude(n.copy())
        
        const r2_sub_r1 : Vec3 = ray_pos.copy().subtract(cyl_pos.copy())
        const n_dot_n : number = Vec3.dot(n.copy(), n.copy())
        // compute t1 and t2
        const t1 : number = Vec3.dot(Vec3.cross(ray_dir.copy(), n.copy()), r2_sub_r1) / n_dot_n
        const t2 : number = Vec3.dot(Vec3.cross(cyl_dir.copy(), n.copy()), r2_sub_r1) / n_dot_n
        // compute p1 and p2
        const p1 : Vec3 = cyl_pos.copy().add(cyl_dir.copy().scale(t1))
        const p2 : Vec3 = ray_pos.copy().add(ray_dir.copy().scale(t2))

        // confirm
        const dist : number = Vec3.distance(p1.copy(), p2.copy())
        
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
        if (dist > Hex.radius) [false, Number.MIN_VALUE]

        // return if dist(mid_point -> p1) > length / 2
        if (Vec3.distance(this.mid_point.copy(), p1.copy()) > this.length / 2) [false, Number.MIN_VALUE]
     
        // now, return true
        return [true, (t2 * -1.0)]
    }
}