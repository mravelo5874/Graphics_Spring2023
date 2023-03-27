import { Vec3, Quat } from "../lib/TSM.js";
import { Utils } from "./Utils.js"

// class used to convert bones into hex prisms
export class Hex
{
    public static radius : number = 0.1
    public static pi_over_3 : number = Math.PI / 3

    private color : Vec3;
    private start : Vec3;
    private end : Vec3;
    private id : number;

    private hex_indices : number[];
    private hex_positions : number[];
    private hex_colors : number[];

    private hex_indices_array : Uint32Array;
    private hex_positions_array : Float32Array;
    private hex_colors_array : Float32Array;

    private update : boolean = false
    private deleted : boolean = false

    public get_update() : boolean { return this.update }
    public got_update() : void { this.update = false }

    constructor()
    {
        this.start = Vec3.zero.copy()
        this.end = Vec3.zero.copy()
        this.id = -1
        this.color = new Vec3([0.0, 1.0, 0.0]) // default color is green

        this.hex_indices = new Array<number>()
        this.hex_positions = new Array<number>()
        this.hex_colors = new Array<number>()

        // set indices array (will not change) (should be 18 lines = 36 indices)
        for (let i = 0; i < 36; i++) this.hex_indices.push(i)
        this.hex_indices_array = new Uint32Array(this.hex_indices)

        // add ray colors (should be 18 lines = 36 indices = 108 pos values = 108 color values)
        for (let i = 0; i < 36; i++) 
        {
            this.hex_colors.push(this.color.x);
            this.hex_colors.push(this.color.y);
            this.hex_colors.push(this.color.z);
        }
        this.hex_colors_array = new Float32Array(this.hex_colors)
    }

    public set_color(_color : Vec3) : void 
    { 
        // return if already this color
        if (this.color == _color) return
        // set color
        this.color = _color 
        // update current colors
        if (this.hex_colors.length > 0)
        {
            // remove colors
            this.hex_colors.splice(0, this.hex_colors.length)
            // add ray colors (should be 18 lines = 36 indices = 108 pos values = 108 color values
            for (let i = 0; i < 36; i++)
            {
                this.hex_colors.push(this.color.x)
                this.hex_colors.push(this.color.y)
                this.hex_colors.push(this.color.z)
            }
        }

        this.hex_colors_array = new Float32Array(this.hex_colors)
        this.update = true
    }

    public rotate(offset : Vec3, quat : Quat)
    {
        let i : number = 0
        while (i < this.hex_positions.length)
        {
            // get pos
            const x : number = this.hex_positions[i]
            const y : number = this.hex_positions[i+1]
            const z : number = this.hex_positions[i+2]
            const pos : Vec3 = new Vec3([x, y, z])
            // rotate pos
            const rot_pos : Vec3 = pos.copy().add(offset.copy()).multiplyByQuat(quat).subtract(offset.copy())
            // re-assign pos
            this.hex_positions[i]   = rot_pos.x
            this.hex_positions[i+1] = rot_pos.y
            this.hex_positions[i+2] = rot_pos.z
            i += 3
        }
        this.hex_positions_array = new Float32Array(this.hex_positions)
        this.update = true
    }   

    public set(_start : Vec3, _end : Vec3, _id : number) : void 
    {
        // return if same id
        if (this.id == _id) 
            return
        // set new values
        this.id = _id
        this.deleted = false
        // copy new start and end pos
        this.start = _start.copy()
        this.end = _end.copy()
        // clear position arrays
        this.hex_positions = []
        this.hex_positions_array.slice(0, this.hex_positions_array.length)
        // get new hex positions
        this.convert()
        this.update = true
    }

    public del() : void
    {
        // return already deleted
        if (this.deleted)
            return
        // set new values
        this.id = -1
        this.deleted = true
        this.update = true
    }

    private convert() : void
    {
        const dir : Vec3 = this.end.copy().subtract(this.start.copy()).normalize()
        const per : Vec3 = Utils.find_orthonormal_vectors(dir)[0].normalize()
        const pi_over_3 : number = Hex.pi_over_3
    
        // calculate 6 hex points around start point
        const init_p : Vec3 = per.copy().scale(Hex.radius)
        const a1 : Vec3 = Utils.rotate_point(init_p, dir, pi_over_3 * 0).add(this.start)
        const b1 : Vec3 = Utils.rotate_point(init_p, dir, pi_over_3 * 1).add(this.start)
        const c1 : Vec3 = Utils.rotate_point(init_p, dir, pi_over_3 * 2).add(this.start)
        const d1 : Vec3 = Utils.rotate_point(init_p, dir, pi_over_3 * 3).add(this.start)
        const e1 : Vec3 = Utils.rotate_point(init_p, dir, pi_over_3 * 4).add(this.start)
        const f1 : Vec3 = Utils.rotate_point(init_p, dir, pi_over_3 * 5).add(this.start)
    
        const a2 : Vec3 = Utils.rotate_point(init_p, dir, pi_over_3 * 0).add(this.end)
        const b2 : Vec3 = Utils.rotate_point(init_p, dir, pi_over_3 * 1).add(this.end)
        const c2 : Vec3 = Utils.rotate_point(init_p, dir, pi_over_3 * 2).add(this.end)
        const d2 : Vec3 = Utils.rotate_point(init_p, dir, pi_over_3 * 3).add(this.end)
        const e2 : Vec3 = Utils.rotate_point(init_p, dir, pi_over_3 * 4).add(this.end)
        const f2 : Vec3 = Utils.rotate_point(init_p, dir, pi_over_3 * 5).add(this.end)

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

        // set position array
        this.hex_positions_array = new Float32Array(this.hex_positions)
    }

    public get_hex_indices(): Uint32Array 
    {
        if (this.deleted) return new Uint32Array(0)
        else return this.hex_indices_array
    }

    public get_hex_positions(): Float32Array 
    {
        if (this.deleted) return new Float32Array(0)
        else return this.hex_positions_array
    }

    public get_hex_colors() : Float32Array
    {
        if (this.deleted) return new Float32Array(0)
        else return this.hex_colors_array
    }
}