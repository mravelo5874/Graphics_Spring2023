import { Vec3, Vec2 } from "../lib/TSM.js";
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

    // thanks to chatgpt: 'create a function that interpolates between two numbers given a t value' 
    public static lerp(p0: number, p1: number, t: number): number
    {
        // make sure t is clamped between 0 and 1
        if (t > 1) t = 1
        if (t < 0) t = 0
        // return interpolated value
        return (1 - t) * p0 + t * p1
    }

    // thanks to chatgpt: 'can you now write a function that performs inverse interpolation between 
    // two numbers given two numbers and a number in their range'
    public static inverse_lerp(p0: number, p1: number, val: number): number
    {
        // clamp value to range if outside
        if (val > p1) return 1
        else if (val < p0) return 0
        // return t value
        return (val - p0) / (p1 - p0)
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