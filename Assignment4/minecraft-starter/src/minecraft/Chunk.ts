import { Mat3, Mat4, Vec2, Vec3, Vec4 } from "../lib/TSM.js";
import Rand from "../lib/rand-seed/Rand.js"
import { CubeCollider } from "./Colliders.js";
import { Noise } from "./Noise.js";
import { print } from "./Utils.js"

export class noise_map_data
{
    public seed: string
    public scale: number
    public height: number
    public freq: number
    public octs: number
    public pers: number
    public lacu: number

    constructor(
        _seed: string = '42', 
        _scale: number = 75,
        _height: number = 16,
        _freq: number = 1,  
        _octs: number = 4,
        _pers: number = 0.1, 
        _lacu: number = 5
        )
    {
        this.seed = _seed
        this.scale = _scale
        this.height = _height
        this.freq = _freq
        this.octs = _octs
        this.pers = _pers
        this.lacu = _lacu
    }
}

export class Chunk 
{
    private cubes: number; // Number of cubes that should be *drawn* each frame
    private cubePositionsF32: Float32Array; // (4 x cubes) array of cube translations, in homogeneous coordinates
    private x : number; // Center of the chunk
    private y : number;
    private size: number; // Number of cubes along each side of the chunk
    private cube_colliders: CubeCollider[];
    private noise_data: noise_map_data;
    private coord: Vec2;
    private pos: Vec2;
    
    constructor(centerX : number, centerY : number, size: number, _noise_data: noise_map_data, _coord: Vec2)
    {
        this.x = centerX;
        this.y = centerY;
        this.size = size;
        this.cubes = size*size;
        this.cube_colliders = new Array<CubeCollider>()
        this.noise_data = _noise_data
        this.coord = _coord
        this.pos = _coord.copy().scale(size)
        this.generateCubes();
    }
    
    private generateCubes() 
    {
        const topleftx = this.x - this.size / 2;
        const toplefty = this.y - this.size / 2;
        
        // The real landscape-generation logic. The example code below shows you how to use the pseudorandom number generator to create a few cubes.
        this.cubes = this.size * this.size;
        this.cubePositionsF32 = new Float32Array(4 * this.cubes);

        let height_map: number[][] = Noise.generate_noise_map(
            this.size, 
            this.noise_data.seed, 
            this.noise_data.scale, 
            this.noise_data.freq, 
            this.noise_data.octs, 
            this.noise_data.pers, 
            this.noise_data.lacu, 
            this.pos.copy(),
            true)
    

        for(let i=0; i<this.size; i++)
        {
            for(let j=0; j<this.size; j++)
            {
                const height = height_map[j][i] * this.noise_data.height
                const idx = this.size * i + j

                const x: number = topleftx + j
                const z: number = toplefty + i

                this.cubePositionsF32[4*idx + 0] = x
                this.cubePositionsF32[4*idx + 1] = Math.floor(height)
                this.cubePositionsF32[4*idx + 2] = z
                this.cubePositionsF32[4*idx + 3] = 0

                // create cube collider for block
                this.cube_colliders.push(new CubeCollider(new Vec3([x, height, z])))
            }
        }
    }

    public get_cube_colliders(): CubeCollider[]
    {   
        return this.cube_colliders
    }
    
    public cubePositions(): Float32Array {
        return this.cubePositionsF32;
    }
    
    
    public numCubes(): number {
        return this.cubes;
    }
}
