import { Vec3, Vec4 } from "../lib/TSM.js";
import { Utils, Ray } from "./Utils.js"

export class Cylinder
{
    private bone_id : number
    private start_point : Vec3
    private end_point : Vec3

    public get_start() : Vec3 { return this.start_point.copy() }
    public get_end() : Vec3 { return this.end_point.copy() }
    public get_id() : number { return this.bone_id }
    
    constructor(_bone_id : number, _start_point : Vec3, _end_point : Vec3)
    {
        this.bone_id = _bone_id
        this.start_point = _start_point.copy()
        this.end_point = _end_point.copy()
    }
}