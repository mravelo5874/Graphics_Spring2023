import { Vec2, Vec3 } from "../lib/TSM.js";
import { CubeCollider } from "./Colliders.js";
import { Noise } from "./Noise.js";
import { Utils, print } from "./Utils.js";

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
        // default terrain values
        _seed: string = '42', 
        _scale: number = 75,
        _height: number = 24,
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
    private cube_pos: Vec3[] // keep track of cube positions 

    private cubePositionsF32: Float32Array; // (4 x cubes) array of cube translations, in homogeneous coordinates
    private x : number; // Center of the chunk
    private y : number;
    private size: number; // Number of cubes along each side of the chunk
    private cube_colliders: CubeCollider[];
    private edge_colliders: CubeCollider[]; // cubes along the 4 edges of the chunk
    private noise_data: noise_map_data;
    private pos: Vec2;
    
    constructor(centerX : number, centerY : number, size: number, _noise_data: noise_map_data, _coord: Vec2)
    {
        this.x = centerX;
        this.y = centerY;
        this.size = size;
        this.cubes = size*size; // height cubes
        this.cube_pos = new Array<Vec3>()
        this.cube_colliders = new Array<CubeCollider>()
        this.edge_colliders = new Array<CubeCollider>()
        this.noise_data = _noise_data
        this.pos = _coord.copy().scale(size)

        // generate cubes in chunk
        this.generate_height_cubes()
        this.generate_fill_cubes()

        // create array f32 array
        this.cubePositionsF32 = new Float32Array(4 * this.cube_pos.length);
        for (let i = 0; i < this.cube_pos.length; i++)
        {
            this.cubePositionsF32[(4*i) + 0] = this.cube_pos[i].x
            this.cubePositionsF32[(4*i) + 1] = this.cube_pos[i].y
            this.cubePositionsF32[(4*i) + 2] = this.cube_pos[i].z
            this.cubePositionsF32[(4*i) + 3] = 0
        }
    }
    
    private generate_height_cubes()
    {
        const topleftx = this.x - this.size / 2;
        const toplefty = this.y - this.size / 2;
        
        this.cubes = this.size * this.size;
        this.cubePositionsF32 = new Float32Array(4 * this.cubes);

        // generate noise map from terrain data
        let height_map: number[][] = Noise.generate_noise_map(
            this.size, 
            this.noise_data, 
            this.pos.copy(),
            true)
    
        for (let i=0; i<this.size; i++)
        {
            for (let j=0; j<this.size; j++)
            {
                const height = height_map[j][i] * this.noise_data.height
                const x: number = topleftx + j
                const y: number = Math.floor(height)
                const z: number = toplefty + i

                // add cubes to f32 array for generate_fill_cubes()
                const idx = this.size * j + i
                this.cubePositionsF32[4*idx + 0] = x
                this.cubePositionsF32[4*idx + 1] = y
                this.cubePositionsF32[4*idx + 2] = z
                this.cubePositionsF32[4*idx + 3] = 0

                // add cube to pos and collider arrays
                this.cube_pos.push(new Vec3([x, y, z]))
                this.cube_colliders.push(new CubeCollider(new Vec3([x, y, z])))

                // add to edge colliders if at chunk edge
                if (i == 0 || i == Utils.CHUNK_SIZE - 1 || j == 0 || j == Utils.CHUNK_SIZE - 1)
                {
                    this.edge_colliders.push(new CubeCollider(new Vec3([x, y, z])))
                }
            }
        }
    }

    private generate_fill_cubes(): void
    {
        const num_height_cubes: number = this.cubePositionsF32.length

        // for every cube (excluding all edge blocks)
        for (let i = 0; i < this.size; i++) // z-direction
        {
            for (let j = 0; j < this.size; j++) // x-direction
            {
                // get cube position values
                const idx = this.size * j + i
                const my_x = this.cubePositionsF32[4*idx + 0] 
                const my_y = this.cubePositionsF32[4*idx + 1]
                const my_z = this.cubePositionsF32[4*idx + 2]

                // do something different for edge cubes 
                if (i == 0 || i == Utils.CHUNK_SIZE - 1 || j == 0 || j == Utils.CHUNK_SIZE - 1)
                {
                    const fill_cubes: number = 4
                    for (let i = 1; i < fill_cubes; i++)
                    {
                        // add cube to pos and collider arrays
                        this.cubes++
                        this.cube_pos.push(new Vec3([my_x, my_y-i, my_z]))
                    }
                    continue
                }

                // get 8 neighbor cube heights
                const n_idx =   this.size * j + (i+1)
                const ne_idx =  this.size * (j+1) + (i+1)
                const e_idx =   this.size * (j+1) + i
                const se_idx =  this.size * (j+1) + (i-1)
                const s_idx =   this.size * j + (i-1)
                const sw_idx =  this.size * (j-1) + (i-1)
                const w_idx =   this.size * (j-1) + i
                const nw_idx =  this.size * (j-1) + (i+1)

                // find min height of neightbooring cubes
                let min_height: number = my_y

                // make sure neighbor indexes are valid before checking!
                // north
                if (n_idx >= 0 && n_idx < num_height_cubes)
                {
                    const y: number = this.cubePositionsF32[4*n_idx + 1]
                    if (y < min_height) min_height = y
                }
                // north-east
                if (ne_idx >= 0 && ne_idx < num_height_cubes)
                {
                    const y: number = this.cubePositionsF32[4*ne_idx + 1]
                    if (y < min_height) min_height = y
                }
                // east
                if (e_idx >= 0 && e_idx < num_height_cubes)
                {
                    const y: number = this.cubePositionsF32[4*e_idx + 1]
                    if (y < min_height) min_height = y
                }
                // south-east
                if (se_idx >= 0 && se_idx < num_height_cubes)
                {
                    const y: number = this.cubePositionsF32[4*se_idx + 1]
                    if (y < min_height) min_height = y
                }
                // south
                if (s_idx >= 0 && s_idx < num_height_cubes)
                {
                    const y: number = this.cubePositionsF32[4*s_idx + 1]
                    if (y < min_height) min_height = y
                }
                // south-west
                if (sw_idx >= 0 && sw_idx < num_height_cubes)
                {
                    const y: number = this.cubePositionsF32[4*sw_idx + 1]
                    if (y < min_height) min_height = y
                }
                // west
                if (w_idx >= 0 && w_idx < num_height_cubes)
                {
                    const y: number = this.cubePositionsF32[4*w_idx + 1]
                    if (y < min_height) min_height = y
                }
                // north-west
                if (nw_idx >= 0 && nw_idx < num_height_cubes)
                {
                    const y: number = this.cubePositionsF32[4*nw_idx + 1]
                    if (y < min_height) min_height = y
                }
                
                if (i == 0 || i == Utils.CHUNK_SIZE - 1 || j == 0 || j == Utils.CHUNK_SIZE - 1)
                {
                    if (my_y - min_height > 4) console.log('pos: ' + j + ', ' + i + ', cube_y: ' + my_y + ', min_y: ' + min_height)
                }
                
                // add fill cubes if needed
                if (min_height < my_y)
                {
                    const fill_cubes: number = my_y - min_height
                    for (let i = 1; i < fill_cubes; i++)
                    {
                        // add cube to pos and collider arrays
                        this.cubes++
                        this.cube_pos.push(new Vec3([my_x, my_y-i, my_z]))
                        this.cube_colliders.push(new CubeCollider(new Vec3([my_x, my_y-i, my_z])))
                    }
                }
            }
        }
    }


    public remove_cube(cube: CubeCollider) : void
    {
        // TODO this!!!
        console.log('hit block: ' + print.v3(cube.get_pos()))
        
    }

    public get_cube_from_pos(pos: Vec3): CubeCollider | null
    {
        // check each cube to see if pos.xz are in cube.xz
        for (let i = 0; i < this.cube_colliders.length; i++)
        {
            if (pos.x > this.cube_colliders[i].get_pos().x - (Utils.CUBE_LEN / 2) &&
                pos.x < this.cube_colliders[i].get_pos().x + (Utils.CUBE_LEN / 2) &&
                pos.z > this.cube_colliders[i].get_pos().z - (Utils.CUBE_LEN / 2) &&
                pos.z < this.cube_colliders[i].get_pos().z + (Utils.CUBE_LEN / 2))
            {
                return this.cube_colliders[i]
            }
        }

        return null
    }

    public get_cube_colliders(): CubeCollider[]
    {   
        return this.cube_colliders
    }

    public get_edge_colliders(): CubeCollider[]
    {   
        return this.edge_colliders
    }
    
    public cubePositions(): Float32Array 
    {
        return this.cubePositionsF32;
    }
    
    public numCubes(): number 
    {
        return this.cubes;
    }
}
