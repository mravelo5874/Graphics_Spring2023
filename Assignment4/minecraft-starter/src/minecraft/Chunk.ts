import { Mat3, Mat4, Vec3, Vec4 } from "../lib/TSM.js";
import Rand from "../lib/rand-seed/Rand.js"
import { CubeCollider } from "./Colliders.js";
import { Noise } from "./Noise.js";

export class Chunk 
{
    private cubes: number; // Number of cubes that should be *drawn* each frame
    private cubePositionsF32: Float32Array; // (4 x cubes) array of cube translations, in homogeneous coordinates
    private x : number; // Center of the chunk
    private y : number;
    private size: number; // Number of cubes along each side of the chunk
    private cube_colliders: CubeCollider[];
    
    constructor(centerX : number, centerY : number, size: number) 
    {
        this.x = centerX;
        this.y = centerY;
        this.size = size;
        this.cubes = size*size;
        this.cube_colliders = new Array<CubeCollider>()
        this.generateCubes();
    }
    
    private generateCubes() 
    {
        const topleftx = this.x - this.size / 2;
        const toplefty = this.y - this.size / 2;
        
        // The real landscape-generation logic. The example code below shows you how to use the pseudorandom number generator to create a few cubes.
        this.cubes = this.size * this.size;
        this.cubePositionsF32 = new Float32Array(4 * this.cubes);

        const scale: number = 16
        const freq: number = 1 / 64
        const octs: number = 1
        const seed: string = '42'
        let height_map: number[][] = Noise.generate_noise_map(this.size, scale, freq, octs, seed)
        
        //console.log('height map: ' + height_map)

        for(let i=0; i<this.size; i++)
        {
            for(let j=0; j<this.size; j++)
            {
                const height = height_map[i][j]
                const idx = this.size * i + j

                const x: number = topleftx + j
                const z: number = toplefty + i

                this.cubePositionsF32[4*idx + 0] = x
                this.cubePositionsF32[4*idx + 1] = height
                this.cubePositionsF32[4*idx + 2] = z
                this.cubePositionsF32[4*idx + 3] = 0

                //console.log('cube: ' + idx + ', a: ' + x + ', b: ' + z + ', height: ' + height)

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
