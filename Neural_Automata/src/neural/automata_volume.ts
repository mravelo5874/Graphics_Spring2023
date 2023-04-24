import { Vec3 } from "../lib/TSM.js"
import  Rand  from "../lib/rand-seed/Rand.js"
import { activation_3d, activation_type_3d } from "./activations_3d.js"

export class automata_volume
{
    private size: number 
    private volume: number[][][]
    private volume_uint8: Uint8Array
    private kernel: number[][][]
    private activation: activation_type_3d

    constructor(_size: number, _kernel: number[][][], _activation: activation_type_3d)
    {
        this.size = _size
        this.kernel = _kernel
        this.activation = _activation
        this.volume = this.create_empty_volume(_size)
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

    public randomize_volume(seed: string)
    {
        console.log('seed: ' + seed)
        let rng = new Rand(seed)

        for (let x = 0; x < this.size; x++)
        {
            for (let y = 0; y < this.size; y++)
            {
                for (let z = 0; z < this.size; z++)
                {
                    let val = 0
                    const r = rng.next()
                    if (r > 0.75)
                    {
                        val = r
                    }
                    this.volume[x][y][z] = val
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