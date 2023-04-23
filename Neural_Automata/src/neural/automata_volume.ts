import  Rand  from "../lib/rand-seed/Rand.js"

export class automata_volume
{
    private size: number 
    private volume: number[][][]
    private volume_uint8: Uint8Array

    constructor(_size: number)
    {
        this.size = _size
        this.volume = []
        for (let x = 0; x < this.size; x++)
        {
            this.volume[x] = []
            for (let y = 0; y < this.size; y++)
            {
                this.volume[x][y] = []
                for (let z = 0; z < this.size; z++)
                {
                    this.volume[x][y][z] = 0
                }
            }
        }
        this.create_uint8()
    }

    public get_size(): number { return this.size }

    public get_volume(): Uint8Array { return this.volume_uint8 }

    public randomize_volume(seed: string)
    {
        let rng = new Rand(seed)

        for (let x = 0; x < this.size; x++)
        {
            for (let y = 0; y < this.size; y++)
            {
                for (let z = 0; z < this.size; z++)
                {
                    this.volume[x][y][z] = rng.next()
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