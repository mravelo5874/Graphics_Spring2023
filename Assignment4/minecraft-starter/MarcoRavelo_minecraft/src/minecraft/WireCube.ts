import { Vec3 } from "../lib/TSM.js";
import { Utils } from "./Utils.js";

export class WireCube
{   
    private pos: Vec3 // center of cube 
    private len: number // side length
    private color: Vec3 // color

    private indices : number[];
    private positions : number[];
    private colors : number[];

    private update : boolean = false
    public get_update() : boolean { return this.update }
    public got_update() : void { this.update = false }

    // requires position (center of cube) and side length to build
    constructor(_pos: Vec3, _len: number, _color: string)
    {
        // set indices array (will not change) 24
        this.indices = new Array<number>()
        for (let i = 0; i < 24; i++) this.indices.push(i)

        this.set_color(_color)
        this.set_positions(_pos.copy(), _len)
    }

    public set_positions(_pos: Vec3, _len: number)
    {
        this.pos = _pos.copy()
        this.len = _len
        this.positions = new Array<number>()

        const p: Vec3 = this.pos.copy()
        const s: number = this.len / 2

        const min: Vec3 = new Vec3([p.x - s, p.y - s, p.z - s])
        const max: Vec3 = new Vec3([p.x + s, p.y + s, p.z + s])

        // 8 verts on cube
        const a: Vec3 = new Vec3(min.xyz)
        const b: Vec3 = new Vec3([min.x, min.y, max.z])
        const c: Vec3 = new Vec3([max.x, min.y, max.z])
        const d: Vec3 = new Vec3([max.x, min.y, min.z])
        const e: Vec3 = new Vec3([min.x, max.y, min.z])
        const f: Vec3 = new Vec3([min.x, max.y, max.z])
        const g: Vec3 = new Vec3(max.xyz)
        const h: Vec3 = new Vec3([max.x, max.y, min.z])

        /* top face */
        for (let i = 0; i < 3; i++) this.positions.push(a.at(i)) // a -> b
        for (let i = 0; i < 3; i++) this.positions.push(b.at(i)) 
        for (let i = 0; i < 3; i++) this.positions.push(b.at(i)) // b -> c
        for (let i = 0; i < 3; i++) this.positions.push(c.at(i)) 
        for (let i = 0; i < 3; i++) this.positions.push(c.at(i)) // c -> d
        for (let i = 0; i < 3; i++) this.positions.push(d.at(i)) 
        for (let i = 0; i < 3; i++) this.positions.push(d.at(i)) // d -> a
        for (let i = 0; i < 3; i++) this.positions.push(a.at(i)) 

        /* bot face */
        for (let i = 0; i < 3; i++) this.positions.push(e.at(i)) // e -> f
        for (let i = 0; i < 3; i++) this.positions.push(f.at(i)) 
        for (let i = 0; i < 3; i++) this.positions.push(f.at(i)) // f -> g
        for (let i = 0; i < 3; i++) this.positions.push(g.at(i)) 
        for (let i = 0; i < 3; i++) this.positions.push(g.at(i)) // g -> h
        for (let i = 0; i < 3; i++) this.positions.push(h.at(i)) 
        for (let i = 0; i < 3; i++) this.positions.push(h.at(i)) // h -> e
        for (let i = 0; i < 3; i++) this.positions.push(e.at(i)) 

        /* legs */
        for (let i = 0; i < 3; i++) this.positions.push(a.at(i)) // a -> e
        for (let i = 0; i < 3; i++) this.positions.push(e.at(i)) 
        for (let i = 0; i < 3; i++) this.positions.push(b.at(i)) // b -> f
        for (let i = 0; i < 3; i++) this.positions.push(f.at(i)) 
        for (let i = 0; i < 3; i++) this.positions.push(c.at(i)) // c -> g
        for (let i = 0; i < 3; i++) this.positions.push(g.at(i)) 
        for (let i = 0; i < 3; i++) this.positions.push(d.at(i)) // d -> h
        for (let i = 0; i < 3; i++) this.positions.push(h.at(i))

        // update cube
        this.update = true
    }

    public set_color(_color: string)
    {
        this.colors = new Array<number>()
        this.color = Utils.get_color(_color).copy()

        // add ray colors (will not change) 24
        for (let i = 0; i < 36; i++) 
        {
            this.colors.push(this.color.x);
            this.colors.push(this.color.y);
            this.colors.push(this.color.z);
        }

        // update cube
        this.update = true
    }

    public get_indices(): Uint32Array
    {
        return new Uint32Array(this.indices)
    }

    public get_positions(): Float32Array
    {
        return new Float32Array(this.positions)
    }

    public get_colors(): Float32Array
    {
        return new Float32Array(this.colors)
    }
}