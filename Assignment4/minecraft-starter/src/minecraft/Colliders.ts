import { Vec3 } from "../lib/TSM.js";
import { Utils } from "./Utils.js";

export class CubeCollider 
{
    private pos: Vec3;
    private s_len: number;

    public get_pos(): Vec3 { return this.pos.copy() }
    public get_s_len(): number { return this.s_len }

    constructor(_pos: Vec3, _s_len: number = Utils.CUBE_LEN)
    {
        this.pos = _pos.copy()
        this.s_len = _s_len
    }
}

export class CylinderCollider 
{
    public start: Vec3
    public end: Vec3
    public radius: number
    public height: number

    constructor(_start: Vec3, _end: Vec3, _radius: number)
    {
        this.start = _start.copy()
        this.end = _end.copy()
        this.radius = _radius
        this.height = Vec3.distance(_start, _end)
    }
}

export class AABB
{
    public min: Vec3 // max corner from (0, 0, 0)
    public max: Vec3 // min corner from (0, 0, 0)
    public pos: Vec3 // current pos of aabb in world space

    constructor(_min: Vec3, _max: Vec3, _pos: Vec3)
    {
        this.min = _min.copy()
        this.max = _max.copy()
        this.pos = _pos.copy()
    }
}