import { Vec3, Vec4 } from "../lib/TSM.js";
import { Utils, Ray } from "./Utils.js"
import { Hex } from "./Hex.js";

export class Cylinder
{
    private bone_id : number
    private start_point : Vec3
    private end_point : Vec3
    private mid_point : Vec3
    private length : number

    private quat : Vec4
    private tran : Vec3

    public get_start() : Vec3 { return this.start_point.copy() }
    public get_end() : Vec3 { return this.end_point.copy() }
    public get_id() : number { return this.bone_id }
    public get_quat() : Vec4 { return this.quat }
    public get_tran() : Vec3 { return this.tran }
    
    constructor(_bone_id : number, _start_point : Vec3, _end_point : Vec3, _quat : Vec4, _tran : Vec3)
    {
        this.bone_id = _bone_id
        this.start_point = _start_point.copy()
        this.end_point = _end_point.copy()
        this.mid_point = Utils.mid_point(_start_point.copy(), _end_point.copy())
        this.length = Vec3.distance(_end_point.copy(), _start_point.copy())
        this.quat = _quat.copy()
        this.tran = _tran.copy()

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