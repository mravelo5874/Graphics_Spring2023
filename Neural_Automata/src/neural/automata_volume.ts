import { Vec3 } from "../lib/TSM.js"
import  Rand  from "../lib/rand-seed/Rand.js"
import noise from "./noise.js"
import noise_map_data from "./map_data.js"
import { utils } from "./utils.js"
import { neighborhood_type, rule }from "./rules.js"


export class automata_volume
{
    private size: number 
    private volume: number[][][]
    private cells: number[][][]
    private map_data: noise_map_data
    private volume_uint8: Uint8Array
    private my_rule: rule
    public pause: boolean = false

    // perlin stuff
    private perlin_worker: Worker
    private perlin_offset: Vec3
    private perlin_running: boolean = false

    // rules stuff
    private rule_worker: Worker
    private rule_running: boolean = false

    constructor(_size: number, _rule: rule) 
    {
        this.size = _size
        this.my_rule = _rule
        this.volume = this.create_empty_volume(_size)
        this.cells = this.create_empty_volume(_size)

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

    public pause_perlin()
    {
        this.perlin_running = false
    }

    public resume_perlin()
    {
        this.perlin_running = true
        this.perlin_loop()
    }

    public start_perlin(): void
    {
        if (!this.perlin_running)
        {
            this.perlin_worker = new Worker('neural/workers/perlin_worker.js', {type: 'module'})
            this.perlin_running = true
            this.perlin_offset = Vec3.zero.copy()
            this.perlin_loop()
        }
    }

    private perlin_loop(): void
    {
        if (!this.perlin_running) return

        const o: Vec3 = this.perlin_offset
        this.perlin_worker.postMessage([this.size, o.x, o.y, o.z, this.map_data])
        this.perlin_worker.onmessage = (event) => 
        {   
            if (this.perlin_running)
            {
                // recieve message from worker and update volume
                this.volume = event.data
                this.create_uint8()
                let x = this.perlin_offset.x + 0.2
                this.perlin_offset = new Vec3([x,x,x])

                // start again
                this.perlin_loop()
            }
        }
    }

    public stop_perlin(): void
    {
        if (this.perlin_running)
        {
            this.perlin_running = false
            this.perlin_worker.terminate()

            this.volume = this.create_empty_volume(this.size)
            this.cells = this.create_empty_volume(this.size)
        }
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

    private init_cells(): void
    {
        for (let x = 0; x < this.size; x++)
        {
            for (let y = 0; y < this.size; y++)
            {
                for (let z = 0; z < this.size; z++)
                {
                    if (this.volume[x][y][z] > 0)
                    {   
                        this.cells[x][y][z] = this.my_rule.init_states
                    }
                }
            }
        }
    }

    public pause_rule()
    {
        this.rule_running = false
    }

    public resume_rule()
    {
        this.rule_running = true
        this.rule_loop()
    }

    public start_rule()
    {
        if (!this.rule_running)
        {
            this.init_cells()
            this.rule_worker = new Worker('neural/workers/rule_worker.js', {type: 'module'})
            this.rule_running = true
            this.rule_loop()
        }
    }

    private rule_loop()
    {
        if (!this.rule_running) return

        this.rule_worker.postMessage([this.size, this.cells, this.my_rule, this.volume])
        this.rule_worker.onmessage = (event) => 
        {   
            if (this.rule_running)
            {
                // recieve message from worker and update volume
                this.cells = event.data[0]
                this.volume = event.data[1]
                this.create_uint8()

                // start again
                this.rule_loop()
            }
        }
    }

    public stop_rule(): void
    {
        if (this.rule_running)
        {
            this.rule_running = false
            this.rule_worker.terminate()
            // clear volume and cells
            this.volume = this.create_empty_volume(this.size)
            this.cells = this.create_empty_volume(this.size)
        }
    }

    private create_uint8(): void
    {
        // console.log('creating uint8 array')
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