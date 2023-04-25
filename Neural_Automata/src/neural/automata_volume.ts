import { Vec3 } from "../lib/TSM.js"
import  Rand  from "../lib/rand-seed/Rand.js"
import { activation_3d, activation_type_3d } from "./activations_3d.js"
import { noise, noise_map_data } from "./noise.js";
import { utils } from "./utils.js";

export class automata_volume
{
    private size: number 
    private volume: number[][][]
    private map_data: noise_map_data
    private volume_uint8: Uint8Array
    private kernel: number[][][]
    private activation: activation_type_3d

    constructor(_size: number, _kernel: number[][][], _activation: activation_type_3d)
    {
        this.size = _size
        this.kernel = _kernel
        this.activation = _activation
        this.volume = this.create_empty_volume(_size)

        this.map_data = new noise_map_data(
            Date.now.toString(),
            16.0, // scale
            0.0, // height
            1.0, //freq
            1.0, // oct
            0.1, // pers
            5.0,    // lacu
            )
        this.create_uint8()
    }

    public get_size(): number { return this.size }
    public get_volume(): Uint8Array { return this.volume_uint8 }

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

    public sphere_volume()
    {
        const radius: number = Math.floor(this.size/2)
        const center: Vec3 = new Vec3([radius, radius, radius])
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

    public randomize_volume(seed: string)
    {
        let rng = new Rand(seed)
        for (let x = 0; x < this.size; x++)
        {
            for (let y = 0; y < this.size; y++)
            {
                for (let z = 0; z < this.size; z++)
                {
                    let v = 0
                    if (rng.next() > 0.8)
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