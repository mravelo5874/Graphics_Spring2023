import { Vec3 } from "../lib/TSM.js"
import  Rand  from "../lib/rand-seed/Rand.js"
import { noise, noise_map_data } from "./noise.js";
import { utils } from "./utils.js";
import { neighborhood_type, rule }from "./rules.js";
 
export class cell
{
    public pos: Vec3
    public state: number

    constructor(_pos: Vec3, _state: number)
    {
        this.pos = _pos
        this.state = _state
    }
}

export class automata_volume
{
    private size: number 
    private volume: number[][][]
    private cells: cell[][][]
    private map_data: noise_map_data
    private volume_uint8: Uint8Array
    private my_rule: rule
    private stable: boolean = false
    
    // [depricated] private kernel: number[][][]
    // [depricated] private activation: activation_type_3d

    constructor(_size: number, _rule: rule) // [depricated] _kernel: number[][][], _activation: activation_type_3d
    {
        this.size = _size
        this.my_rule = _rule
        this.volume = this.create_empty_volume(_size)

        this.map_data = new noise_map_data(
            Date.now.toString(),
            16.0, // scale
            0.0, // height
            1.0, //freq
            1.0, // oct
            0.1, // pers
            5.0, // lacu
            )
        this.create_uint8()
    }

    public get_size(): number { return this.size }
    public get_volume(): Uint8Array { return this.volume_uint8 }
    public set_rule(_rule: rule): void { this.my_rule = _rule }

    public create_empty_volume(_size: number): number[][][]
    {
        let v: number[][][] = []
        for (let x = 0; x < _size; x++)
        {
            v[x] = []
            for (let y = 0; y < _size; y++)
            {
                v[x][y] = []
                for (let z = 0; z < _size; z++)
                {
                    v[x][y][z] = 0
                }
            }
        }
        return v
    }

    public sphere_volume(radius: number = Math.floor(this.size/2))
    {
        if (radius < 2) radius = 2
        let x: number = Math.floor(this.size/2)
        const center: Vec3 = new Vec3([x, x, x])
        for (let x = 0; x < this.size; x++)
        {
            for (let y = 0; y < this.size; y++)
            {
                for (let z = 0; z < this.size; z++)
                {
                    let v = 0
                    if (Vec3.distance(center, new Vec3([x, y, z])) < radius - 1)
                    {
                        v = 1
                    }
                    this.volume[x][y][z] = v
                }
            }
        }
        this.create_uint8()
    }

    public organize_volume()
    {
        for (let x = 0; x < this.size; x++)
        {
            for (let y = 0; y < this.size; y++)
            {
                for (let z = 0; z < this.size; z++)
                {
                    this.volume[x][y][z] = utils.inverse_lerp(0, this.size * this.size * this.size, x * y * z)
                }
            }
        }
        this.create_uint8()
    }

    public randomize_volume(seed: string, thresh: number)
    {
        let rng = new Rand(seed)
        for (let x = 0; x < this.size; x++)
        {
            for (let y = 0; y < this.size; y++)
            {
                for (let z = 0; z < this.size; z++)
                {
                    let v = 0
                    if (rng.next() > thresh)
                    {
                        v = 1
                    }
                    this.volume[x][y][z] = v
                }
            }
        }
        this.create_uint8()
    }

    public perlin_volume(seed: string, offset: Vec3)
    {
        const perlin_data = noise.generate_perlin_volume(this.size, this.map_data, offset, true)

        for (let x = 0; x < this.size; x++)
        {
            for (let y = 0; y < this.size; y++)
            {
                for (let z = 0; z < this.size; z++)
                {
                    let p = 0
                    if (perlin_data[x][y][z] > 0.1)
                    {
                        p = 1
                    }
                    this.volume[x][y][z] = p
                }
            }
        }
        this.create_uint8()
    }

    private create_empty_cells(): cell[][][]
    {
        let c: cell[][][] = []
        for (let x = 0; x < this.size; x++)
        {
            c[x] = []
            for (let y = 0; y < this.size; y++)
            {
                c[x][y] = []
                for (let z = 0; z < this.size; z++)
                {
                    c[x][y][z] = new cell(new Vec3([x, y, z]), 0)
                }
            }
        }
        return c
    }

    public init_rule()
    {
        this.stable = false
        this.cells = this.create_empty_cells()
        for (let x = 0; x < this.size; x++)
        { 
            for (let y = 0; y < this.size; y++)
            {
                for (let z = 0; z < this.size; z++)
                {
                    if (this.volume[x][y][z] > 0)
                        this.cells[x][y][z].state = this.my_rule.init_states
                }
            }
        }
    }

    private static moore_offsets: Vec3[] = [
        new Vec3([-1, -1, -1]),
        new Vec3([ 0, -1, -1]),
        new Vec3([ 1, -1, -1]),

        new Vec3([-1,  0, -1]),
        new Vec3([ 0,  0, -1]),
        new Vec3([ 1,  0, -1]),

        new Vec3([-1,  1, -1]),
        new Vec3([ 0,  1, -1]),
        new Vec3([ 1,  1, -1]),

        new Vec3([-1, -1,  0]),
        new Vec3([ 0, -1,  0]),
        new Vec3([ 1, -1,  0]),

        new Vec3([-1,  0,  0]),
        //new Vec3([ 0,  0,  0]),
        new Vec3([ 1,  0,  0]),

        new Vec3([-1,  1,  0]),
        new Vec3([ 0,  1,  0]),
        new Vec3([ 1,  1,  0]),

        new Vec3([-1, -1,  1]),
        new Vec3([ 0, -1,  1]),
        new Vec3([ 1, -1,  1]),

        new Vec3([-1,  0,  1]),
        new Vec3([ 0,  0,  1]),
        new Vec3([ 1,  0,  1]),

        new Vec3([-1,  1,  1]),
        new Vec3([ 0,  1,  1]),
        new Vec3([ 1,  1,  1])]

    private static von_neu_offsets: Vec3[] = [
        new Vec3([-1,  0,  0]),
        new Vec3([ 1,  0,  0]),

        new Vec3([ 0, -1,  0]),
        new Vec3([ 0,  1,  0]),

        new Vec3([ 0,  0, -1]),
        new Vec3([ 0,  0,  1]),
    ]

    private get_alive_neighboors(x, y, z): number
    {
        let count = 0
        const pos: Vec3 = new Vec3([x, y, z])
        if (this.my_rule.neighborhood == neighborhood_type.MOORE)
        {
            for (let i = 0; i < automata_volume.moore_offsets.length; i++)
            {
                let n = pos.copy().add(automata_volume.moore_offsets[i])
                // wrap indexs
                if (n.x >= this.size) n.x = 0
                else if (n.x < 0) n.x = this.size - 1
                if (n.y >= this.size) n.y = 0
                else if (n.y < 0) n.y = this.size - 1
                if (n.z >= this.size) n.z = 0
                else if (n.z < 0) n.z = this.size - 1
                // check if alive
                if (this.cells[n.x][n.y][n.z].state > 0)
                    count++
            }
        }
        else // VON_NEUMANN
        {
            for (let i = 0; i < automata_volume.von_neu_offsets.length; i++)
            {
                let n = pos.copy().add(automata_volume.von_neu_offsets[i])
                // wrap indexs
                if (n.x >= this.size) n.x = 0
                else if (n.x < 0) n.x = this.size - 1
                if (n.y >= this.size) n.y = 0
                else if (n.y < 0) n.y = this.size - 1
                if (n.z >= this.size) n.z = 0
                else if (n.z < 0) n.z = this.size - 1
                // check if alive
                if (this.cells[n.x][n.y][n.z].state > 0)
                    count++
            }
        }
        return count
    }

    public apply_rule()
    {
        // return in cells are stable
        if (this.stable) return

        let update: cell[][][] = this.create_empty_cells()
        let change: boolean = false
        for (let x = 0; x < this.size; x++)
        {
            for (let y = 0; y < this.size; y++)
            {
                for (let z = 0; z < this.size; z++)
                {
                    // get number of neighbooring alive cells
                    const alive_neighboors: number = this.get_alive_neighboors(x, y, z)
                    // check if cell is alive
                    if (this.cells[x][y][z].state > 0)
                    {
                        // check if loose health
                        if (this.my_rule.alive_req.includes(alive_neighboors))
                        {   
                            update[x][y][z] = new cell(new Vec3([x, y, z]), this.cells[x][y][z].state)
                            change = true
                        }
                        else
                        {
                            const new_state = this.cells[x][y][z].state - 1
                            update[x][y][z] = new cell(new Vec3([x, y, z]), new_state)
                            // modify volume if dead
                            if (new_state <= 0)
                            {
                                this.volume[x][y][z] = 0
                                change = true
                            }
                        }
                            
                    }
                    else
                    {
                        // cell is dead
                        // check if can be born
                        if (this.my_rule.born_req.includes(alive_neighboors))
                        {
                            update[x][y][z] = new cell(new Vec3([x, y, z]), this.my_rule.init_states)
                            this.volume[x][y][z] = 1
                            change = true
                        }
                    }
                }
            }
        }
        // check if no change has been made
        if (!change)
        {
            this.stable = true
            console.log('cells stable!')
        }

        // update state
        this.cells = update
        this.create_uint8()
    }

    private create_uint8(): void
    {
        this.volume_uint8 = new Uint8Array(this.size * this.size * this.size)
        for (let x = 0; x < this.size; x++)
        {
            for (let y = 0; y < this.size; y++)
            {
                for (let z = 0; z < this.size; z++)
                {
                    this.volume_uint8[z + (y * this.size) + (x * this.size * this.size)] = Math.floor(this.volume[x][y][z] * 255)
                }
            }
        }
    }
}

// [depricated] :sad-emoji:
/*
public apply_convolutiuon_update()
    {
        let v: number[][][] = this.create_empty_volume(this.size)
        for (let x = 0; x < this.size; x++)
        {
            for (let y = 0; y < this.size; y++)
            {
                for (let z = 0; z < this.size; z++)
                {
                    v[x][y][z] = this.calculate_convolution(new Vec3([x, y, z]))
                }
            }
        }
        // update volume arrays
        this.volume = v
        this.create_uint8()
    }

    private calculate_convolution(pos: Vec3): number
    {   
        let sum: number = 0
        for (let i = -1; i <= 1; i++)
        {
            for (let j = -1; j <= 1; j++)
            {
                for (let k = -1; k <= 1; k++)
                {
                    // get offset positions
                    let x = pos.x + i
                    let y = pos.x + j
                    let z = pos.x + k

                    // make sure to wrap volume if out of bounds
                    if (x > this.size - 1) x = 0
                    if (x < 0) x = this.size - 1
                    if (y > this.size - 1) y = 0
                    if (y < 0) y = this.size - 1
                    if (z > this.size - 1) z = 0
                    if (z < 0) z = this.size - 1

                    sum += this.volume[x][y][z] * this.kernel[i+1][j+1][k+1]
                }
            }
        }
        return activation_3d.perfrom_activation(sum, this.activation)
    }
*/