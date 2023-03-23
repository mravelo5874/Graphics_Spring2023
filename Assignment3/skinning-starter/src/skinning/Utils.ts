import { Vec3, Mat4, Vec4, Quat, Mat3 } from "../lib/TSM.js";
import { CLoader } from "./AnimationFileLoader.js";
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

    public static find_quaternion_twist(quat : Quat, axis : Vec3) : number
    {
        axis.copy().normalize()

        const orth : Vec3 = this.get_perpendicular(axis.copy())
        //const trans : Vec3 = Vec3.
        return 0
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
    private id : number;
    private deleted : boolean;

    private hex_indices : number[];
    private hex_positions : number[];
    private hex_colors : number[];

    private update : boolean = false

    public get_update() : boolean { return this.update }
    public got_update() : void { this.update = false }

    constructor()
    {
        this.start = Vec3.zero.copy()
        this.end = Vec3.zero.copy()
        this.id = -1
        this.deleted = false

        this.hex_indices = new Array<number>()
        this.hex_positions = new Array<number>()
        this.hex_colors = new Array<number>()
    }

    public set(_start : Vec3, _end : Vec3, _id : number)
    {
        // return if same id
        if (this.id == _id) 
            return
        // set new values
        this.id = _id
        this.deleted = false
        
        // console.log('Hex.set()')
        // console.log('this.start: ' + Util.Vec3_toFixed(this.start))
        // console.log('_start: ' + Util.Vec3_toFixed(_start))
        // console.log('this.end: ' + Util.Vec3_toFixed(this.end))
        // console.log('_end: ' + Util.Vec3_toFixed(_end))
        // console.log('\n')

        this.start = _start.copy()
        this.end = _end.copy()
        this.hex_indices = new Array<number>()
        this.hex_positions = new Array<number>()
        this.hex_colors = new Array<number>()
        this.convert()

        this.update = true
    }

    public del()
    {
        // return already deleted
        if (this.deleted) 
            return
        // set new values
        this.id = -1
        this.deleted = true

        // console.log('Hex.del()')
        // console.log('this.start: ' + Util.Vec3_toFixed(this.start))
        // console.log('_start: ' + Util.Vec3_toFixed(Vec3.zero.copy()))
        // console.log('this.end: ' + Util.Vec3_toFixed(this.end))
        // console.log('_end: ' + Util.Vec3_toFixed(Vec3.zero.copy()))
        // console.log('\n')

        this.start = Vec3.zero.copy()
        this.end = Vec3.zero.copy()
        this.hex_indices.splice(0, this.hex_indices.length)
        this.hex_positions.splice(0, this.hex_positions.length)
        this.hex_colors.splice(0, this.hex_colors.length)
        this.update = true
    }

    private convert() : void
    {
        const dir : Vec3 = this.end.copy().subtract(this.start.copy()).normalize()
        const per : Vec3 = Util.get_perpendicular(dir.copy()).normalize()
        
        // console.log('[HEX]' + 
        // '\n\tstart: ' + Util.Vec3_toFixed(this.start) +
        // '\n\tend: ' + Util.Vec3_toFixed(this.end) +
        // '\n\tdir: ' + Util.Vec3_toFixed(dir) +
        // '\n\tper: ' + Util.Vec3_toFixed(per) +
        // '\n\tlen: ' + len.toFixed(3)
        // )
    
        // calculate 6 hex points around start point
        const init_p : Vec3 = per.copy().scale(Hex.radius)
        const a1 : Vec3 = Util.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 0).add(this.start.copy())
        const b1 : Vec3 = Util.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 1).add(this.start.copy())
        const c1 : Vec3 = Util.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 2).add(this.start.copy())
        const d1 : Vec3 = Util.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 3).add(this.start.copy())
        const e1 : Vec3 = Util.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 4).add(this.start.copy())
        const f1 : Vec3 = Util.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 5).add(this.start.copy())

        // console.log('a1: ' + Util.Vec3_toFixed(a1) +
        // '\nb1: ' + Util.Vec3_toFixed(b1) +
        // '\nc1: ' + Util.Vec3_toFixed(c1) +
        // '\nd1: ' + Util.Vec3_toFixed(d1) +
        // '\ne1: ' + Util.Vec3_toFixed(e1) +
        // '\nf1: ' + Util.Vec3_toFixed(f1))
    
        const a2 : Vec3 = Util.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 0).add(this.end.copy())
        const b2 : Vec3 = Util.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 1).add(this.end.copy())
        const c2 : Vec3 = Util.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 2).add(this.end.copy())
        const d2 : Vec3 = Util.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 3).add(this.end.copy())
        const e2 : Vec3 = Util.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 4).add(this.end.copy())
        const f2 : Vec3 = Util.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 5).add(this.end.copy())

        // console.log('a2: ' + Util.Vec3_toFixed(a2) +
        // '\nb2: ' + Util.Vec3_toFixed(b2) +
        // '\nc2: ' + Util.Vec3_toFixed(c2) +
        // '\nd2: ' + Util.Vec3_toFixed(d2) +
        // '\ne2: ' + Util.Vec3_toFixed(e2) +
        // '\nf2: ' + Util.Vec3_toFixed(f2))

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
    
    constructor(_start_point : Vec3, _end_point)
    {
        this.start_point = _start_point.copy()
        this.end_point = _end_point.copy()
        this.mid_point = Util.mid_point(_start_point.copy(), _end_point.copy())
        this.length = Vec3.distance(_end_point.copy(), _start_point.copy())

        //console.log('cyl: ' + ', start: ' + Util.Vec3_toFixed(_start_point) + ', end: ' + Util.Vec3_toFixed(_end_point))
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
        //const d : number = Math.abs(Vec3.dot(n.copy(), (cyl_pos.copy().subtract(ray_pos.copy())))) / Util.magnitude(n.copy())
        
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
        if (dist > Hex.radius) return [false, Number.MIN_VALUE]

        // return if dist(mid_point -> p1) > length / 2
        if (Vec3.distance(this.mid_point.copy(), p1.copy()) > this.length / 2) return [false, Number.MIN_VALUE]

        // add as line to scene.rr
        // if (scene != null) scene.rr.add_ray(new Ray(p1.copy(), p2.copy().subtract(p1.copy())), "pink", dist)
     
        // now, return true
        return [true, (t2 * -1.0)]
    }
}