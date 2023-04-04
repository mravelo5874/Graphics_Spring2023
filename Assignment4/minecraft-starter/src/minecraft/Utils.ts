import { Vec3, Vec2 } from "../lib/TSM.js";
import Rand from "../lib/rand-seed/Rand.js";
import { CubeCollider, CylinderCollider } from "./Colliders.js";

export class print
{
    public static DIGITS: number = 3

    public static v3(v: Vec3, d: number = this.DIGITS) : string { return v.x.toFixed(d) + ', ' + v.y.toFixed(d) + ', ' + v.z.toFixed(d) }
    public static v2(v: Vec2, d: number = this.DIGITS) : string { return v.x.toFixed(d) + ', ' + v.y.toFixed(d) }
}

export class Line
{   
    private start: Vec3
    private end: Vec3
    private length: number

    public get_start(): Vec3 { return this.start.copy() }
    public get_end(): Vec3 { return this.end.copy() }
    public get_len(): number { return this.length }

    constructor(_start: Vec3, _end: Vec3)
    {
        this.start = _start.copy()
        this.end = _end.copy()
        this.length = Vec3.distance(_start.copy(), _end.copy())
    }
}

export class noise
{
    public static MASK: number = 255;
    public static HASH: number[] = [ 
        151,160,137, 91, 90, 15,131, 13,201, 95, 96, 53,194,233,  7,225,
		140, 36,103, 30, 69,142,  8, 99, 37,240, 21, 10, 23,190,  6,148,
		247,120,234, 75,  0, 26,197, 62, 94,252,219,203,117, 35, 11, 32,
		 57,177, 33, 88,237,149, 56, 87,174, 20,125,136,171,168, 68,175,
		 74,165, 71,134,139, 48, 27,166, 77,146,158,231, 83,111,229,122,
		 60,211,133,230,220,105, 92, 41, 55, 46,245, 40,244,102,143, 54,
		 65, 25, 63,161,  1,216, 80, 73,209, 76,132,187,208, 89, 18,169,
		200,196,135,130,116,188,159, 86,164,100,109,198,173,186,  3, 64,
		 52,217,226,250,124,123,  5,202, 38,147,118,126,255, 82, 85,212,
		207,206, 59,227, 47, 16, 58, 17,182,189, 28, 42,223,183,170,213,
		119,248,152,  2, 44,154,163, 70,221,153,101,155,167, 43,172,  9,
		129, 22, 39,253, 19, 98,108,110, 79,113,224,232,178,185,112,104,
		218,246, 97,228,251, 34,242,193,238,210,144, 12,191,179,162,241,
		 81, 51,145,235,249, 14,239,107, 49,192,214, 31,181,199,106,157,
		184, 84,204,176,115,121, 50, 45,127,  4,150,254,138,236,205, 93,
		222,114, 67, 29, 24, 72,243,141,128,195, 78, 66,215, 61,156,180,

		151,160,137, 91, 90, 15,131, 13,201, 95, 96, 53,194,233,  7,225,
		140, 36,103, 30, 69,142,  8, 99, 37,240, 21, 10, 23,190,  6,148,
		247,120,234, 75,  0, 26,197, 62, 94,252,219,203,117, 35, 11, 32,
		 57,177, 33, 88,237,149, 56, 87,174, 20,125,136,171,168, 68,175,
		 74,165, 71,134,139, 48, 27,166, 77,146,158,231, 83,111,229,122,
		 60,211,133,230,220,105, 92, 41, 55, 46,245, 40,244,102,143, 54,
		 65, 25, 63,161,  1,216, 80, 73,209, 76,132,187,208, 89, 18,169,
		200,196,135,130,116,188,159, 86,164,100,109,198,173,186,  3, 64,
		 52,217,226,250,124,123,  5,202, 38,147,118,126,255, 82, 85,212,
		207,206, 59,227, 47, 16, 58, 17,182,189, 28, 42,223,183,170,213,
		119,248,152,  2, 44,154,163, 70,221,153,101,155,167, 43,172,  9,
		129, 22, 39,253, 19, 98,108,110, 79,113,224,232,178,185,112,104,
		218,246, 97,228,251, 34,242,193,238,210,144, 12,191,179,162,241,
		 81, 51,145,235,249, 14,239,107, 49,192,214, 31,181,199,106,157,
		184, 84,204,176,115,121, 50, 45,127,  4,150,254,138,236,205, 93,
		222,114, 67, 29, 24, 72,243,141,128,195, 78, 66,215, 61,156,180
    ]

    public static value_1d(value: number, freq: number): number
    {
        value *= freq
        let i0: number = Math.floor(value)
        let t: number = value - i0
        i0 &= noise.MASK
        let i1 = i0 + 1

        let h0: number = noise.HASH[i0]
        let h1: number = noise.HASH[i1]

        t = Utils.smooth(t)
        return Utils.lerp(h0, h1, t) * (1 / noise.MASK)
    }

    public static value_2d(value: Vec2, freq: number): number
    {
        value.scale(freq)
        let ix0: number = Math.floor(value.x)
        let iy0: number = Math.floor(value.y)
        let tx: number = value.x - ix0
        let ty: number = value.y - iy0
        ix0 &= noise.MASK
        iy0 &= noise.MASK
        let ix1 = ix0 + 1
        let iy1 = iy0 + 1

        let h0: number = noise.HASH[ix0]
        let h1: number = noise.HASH[ix1]
        let h00: number = noise.HASH[h0 + iy0]
        let h10: number = noise.HASH[h1 + iy0]
        let h01: number = noise.HASH[h0 + iy1]
        let h11: number = noise.HASH[h1 + iy1]

        tx = Utils.smooth(tx)
        ty = Utils.smooth(ty)

        return Utils.lerp(Utils.lerp(h00, h10, tx), Utils.lerp(h01, h11, tx), ty) * (1 / noise.MASK)
    }

    private static grads_2d_mask: number = 7
    private static grads_2d: Vec2[] = [
        new Vec2([ 1, 1]),
        new Vec2([-1, 1]),
        new Vec2([ 1,-1]),
        new Vec2([-1,-1]),
        new Vec2([ 1, 1]).normalize(),
        new Vec2([-1, 1]).normalize(),
        new Vec2([ 1,-1]).normalize(),
        new Vec2([-1,-1]).normalize() ]

    private static dot(g: Vec2, x: number, y: number): number
    {
        return g.x * x + g.y * y
    }

    public static perlin_2d(value: Vec2, freq: number): number
    {
        value.scale(freq)
        let ix0: number = Math.floor(value.x)
        let iy0: number = Math.floor(value.y)
        let tx0: number = value.x - ix0
        let ty0: number = value.y - iy0
        let tx1: number = tx0 - 1
        let ty1: number = ty0 - 1
        ix0 &= noise.MASK
        iy0 &= noise.MASK
        let ix1 = ix0 + 1
        let iy1 = iy0 + 1

        let h0: number = noise.HASH[ix0]
        let h1: number = noise.HASH[ix1]
        let g00: Vec2 = noise.grads_2d[noise.HASH[h0 + iy0] & noise.grads_2d_mask].copy()
        let g10: Vec2 = noise.grads_2d[noise.HASH[h1 + iy0] & noise.grads_2d_mask].copy()
        let g01: Vec2 = noise.grads_2d[noise.HASH[h0 + iy1] & noise.grads_2d_mask].copy()
        let g11: Vec2 = noise.grads_2d[noise.HASH[h1 + iy1] & noise.grads_2d_mask].copy()

        let v00: number = noise.dot(g00, tx0, ty0)
        let v10: number = noise.dot(g10, tx1, ty0)
        let v01: number = noise.dot(g01, tx0, ty1)
        let v11: number = noise.dot(g11, tx1, ty1)

        let tx = Utils.smooth(tx0)
        let ty = Utils.smooth(ty0)

        return Utils.lerp(Utils.lerp(v00, v10, tx), Utils.lerp(v01, v11, tx), ty) * Utils.SQRT2
    }

    public static generate_noise_map(size: number, scale: number, freq: number, octs: number, seed: string): number[][]
    {
        // make sure scale is not 0
        if (scale <= 0) { scale = 0.0001 }

        let rng = new Rand(seed);
        let rand_map: number[][] = new Array(size).fill(0).map(() => new Array(size).fill(0))
        let noise_map: number[][] = new Array(size).fill(0).map(() => new Array(size).fill(0));
        let scale_acc: number = 0

        for (let i = 0; i < size; i++)
        {
            for (let j = 0; j < size; j++)
            {
                rand_map[i][j] = rng.next()
            }
        }

        // fill values
        for (let y = 0; y < size; y++)
        {
            for (let x = 0; x < size; x++)
            {
                noise_map[x][y] = noise.perlin_2d(new Vec2([x, y]), freq) // rand_map[x][y]
            }
        }

        return noise_map;
    }
}

export class Utils
{
    public static CHUNK_SIZE: number = 64
    public static HALF_CHUNK_SIZE: number = this.CHUNK_SIZE / 2
    public static NUM_ADJ_CHUNKS: number = 8
    public static GRAVITY: Vec3 = new Vec3([0.0, -9.8, 0.0])
    public static CUBE_LEN: number = 1
    public static PLAYER_RADIUS: number = 0.2
    public static PLAYER_HEIGHT: number = 2
    public static SQRT2: number = 1.41421356237

    // returns what chunk the player is in based of their position
    public static pos_to_chunck(pos: Vec3): Vec2
    {   
        const x_chunk: number = Math.floor((pos.x + this.HALF_CHUNK_SIZE) / this.CHUNK_SIZE)
        const z_chunk: number = Math.floor((pos.z + this.HALF_CHUNK_SIZE) / this.CHUNK_SIZE)
        return new Vec2([x_chunk, z_chunk])
    }

    // gets the center of a chunk based of its chunk coordinates (given by this.get_chunk())
    public static get_chunk_center(x_coord: number, z_coord: number): Vec2
    {
        const x_center: number = x_coord * this.CHUNK_SIZE
        const z_center: number = z_coord * this.CHUNK_SIZE
        return new Vec2([x_center, z_center])
    }

    // calculate the mid-point between two points
    public static mid_point(p1 : Vec3, p2 : Vec3) : Vec3
    {
        const x : number = (p1.x + p2.x) / 2.0
        const y : number = (p1.y + p2.y) / 2.0
        const z : number = (p1.z + p2.z) / 2.0
        return new Vec3([x, y, z])
    }

    public static smooth(t: number): number
    {
        return t * t * t * (t * (t * 6 - 15) + 10)
    }

    public static lerp(p0: number, p1: number, t: number): number
    {
        // make sure t is clamped between 0 and 1
        if (t > 1) t = 1
        if (t < 0) t = 0

        // set min and max
        let min: number = Number.MAX_VALUE
        if (p0 < min) min = p0
        if (p1 < min) min = p1

        // get number between p0 and p1
        const dist: number = Math.abs(p1 - p0)
        return min + (dist * t)
    }

    // returns a 64x64 patch of terrain heights
    public static get_chunk_heights(chunk_coords: Vec2): void
    {
        // TODO
    }

    // a simple means of vertical detection collison of a line with a cube, returns the y-offset to apply to the player
    public static simple_vert_collision(cube: CubeCollider, cylinder: CylinderCollider): boolean
    {
        // first, determine if cylinder point is within cube zx area (+ radius)
        const cube_cen: Vec3 = cube.get_pos()
        const cyl_end: Vec3 = cylinder.end.copy()
        const radius: number = cylinder.radius
        const cube_min: Vec3 = new Vec3([cube_cen.x - 0.5 - radius, cube_cen.y, cube_cen.z - 0.5 - radius])
        const cube_max: Vec3 = new Vec3([cube_cen.x + 0.5 + radius, cube_cen.y, cube_cen.z + 0.5 + radius])
        if (cyl_end.x >= cube_min.x && cyl_end.z >= cube_min.z && cyl_end.x <= cube_max.x && cyl_end.z <= cube_max.z)
        {
            // next, check if cylinder is under the top face of the cube but above it's center
            if (cylinder.end.y <= cube_cen.y + (Utils.CUBE_LEN / 2) && cylinder.end.y > cube_cen.y)
            {
                return true
            }
        }
        // no offset
        return false
    }

    public static simple_horz_collision(cube: CubeCollider, cylinder: CylinderCollider): boolean
    {
        // first, determine if cylinder point is within cube zx area (+ radius)
        const cube_cen: Vec3 = cube.get_pos()
        const cyl_end: Vec3 = cylinder.end.copy()
        const cyl_start: Vec3 = cylinder.start.copy()
        const radius: number = cylinder.radius
        const cube_min: Vec3 = new Vec3([cube_cen.x - 0.5 - radius, cube_cen.y, cube_cen.z - 0.5 - radius])
        const cube_max: Vec3 = new Vec3([cube_cen.x + 0.5 + radius, cube_cen.y, cube_cen.z + 0.5 + radius])
        if (cyl_end.x >= cube_min.x && cyl_end.z >= cube_min.z && cyl_end.x <= cube_max.x && cyl_end.z <= cube_max.z)
        {
            // next, check if cylinder is within vaild y-distance (height of cylinder)
            if (cyl_end.y < (cube_cen.y + 0.5) && cyl_start.y > (cube_cen.y - 0.5))
            {
                return true
            }
        }
        return false
    }
}