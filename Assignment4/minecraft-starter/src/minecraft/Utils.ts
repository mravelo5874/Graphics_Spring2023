import { Vec3, Vec2 } from "../lib/TSM.js";
import { CubeCollider, CylinderCollider, AABB } from "./Colliders.js";

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

export class Ray
{
    private origin : Vec3
    private direction : Vec3
    private inverse: Vec3

    public get_origin() : Vec3 { return new Vec3(this.origin.xyz) }
    public get_direction() : Vec3 { return new Vec3(this.direction.xyz).normalize() }
    public get_inverse() : Vec3 { return new Vec3(this.inverse.xyz).normalize() }

    constructor(_origin : Vec3, _direction : Vec3)
    {
        this.origin = _origin.copy()
        this.direction = _direction.copy()

        // create inverse dir
        let inv: Vec3 = this.get_direction();
        inv.x = 1 / inv.x
        inv.y = 1 / inv.y
        inv.z = 1 / inv.z
        this.inverse = inv.copy()
    }

    public copy()
    {
        return new Ray(this.origin.copy(), this.direction.copy())
    }

    public print()
    {
        return '{origin: ' + print.v3(this.origin, 3) + ', direction: ' + print.v3(this.direction, 3) + '}'
    }
}

export class Utils
{
    public static CHUNK_SIZE: number = 64
    public static HALF_CHUNK_SIZE: number = this.CHUNK_SIZE / 2
    public static NUM_ADJ_CHUNKS: number = 8
    public static GRAVITY: Vec3 = new Vec3([0.0, -9.8, 0.0])
    public static CUBE_LEN: number = 1
    public static PLAYER_RADIUS: number = 0.1
    public static PLAYER_HEIGHT: number = 2
    public static PLAYER_REACH: number = 8.0
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

    public static magnitude(v : Vec3) : number
    {
        const a : number = v.at(0) * v.at(0)
        const b : number = v.at(1) * v.at(1)
        const c : number = v.at(2) * v.at(2)
        let res : number = a + b + c
        res = Math.sqrt(res)
        return res
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

    // thanks to chatgpt: can you write a function that returns the two perpendicular 2d vectors 
    // when given a single 2d vector.
    public static perpendiculars(vec: Vec2): [Vec2, Vec2]
    {
        const x: number = vec.x
        const y: number = vec.y

        if (x == 0)
        {
            // If the x-coordinate is zero, the first perpendicular vector has an x-coordinate of 1
            // and the second perpendicular vector has an x-coordinate of -1.
            return [new Vec2([1, 0]), new Vec2([-1, 0])]
        }
        else if (y == 0)
        {
            // If the y-coordinate is zero, the first perpendicular vector has a y-coordinate of 1
            // and the second perpendicular vector has a y-coordinate of -1.
            return [new Vec2([0, 1]), new Vec2([0, -1])]
        }

        // For other vectors, we use the fact that the dot product of two perpendicular vectors is 0.
        // We solve for one coordinate and set the other coordinate to 1 or -1, as appropriate.
        let perp1 = [1, -x/y]
        let perp_norm = (perp1[0]**2 + perp1[1]**2)**0.5
        perp1[0] /= perp_norm
        perp1[1] /= perp_norm
        let perp2 = [-1, x/y]
        perp_norm = (perp2[0]**2 + perp2[1]**2)**0.5
        perp2[0] /= perp_norm
        perp2[1] /= perp_norm
        return [new Vec2([perp1[0], perp1[1]]).normalize(), new Vec2([perp2[0], perp2[1]]).normalize()]
    }
    
    // thanks to chatgpt: write a function which projects a 2d vector onto another 2d vector. this 
    // should return a 2d vector.
    public static project_2d_vector(v: Vec2, p: Vec2): Vec2
    {
        let length: number = v.x**2 + v.y**2
        if (length == 0)
        {
            return Vec2.zero.copy()
        }
        let dot: number = Vec2.dot(v, p)
        let scalar: number = dot / length
        return new Vec2([scalar*p.x, scalar*p.y]).normalize()
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
        // no offset
        return false
    }

    public static ray_cube_intersection(ray: Ray, cube: CubeCollider): number
    {
        const pos: Vec3 = cube.get_pos()
        const r_inv: Vec3 = ray.get_inverse().normalize()
        const r_ori: Vec3 = ray.get_origin()

        const min_bb: Vec3 = new Vec3([pos.x - 0.5, pos.y - 0.5, pos.z - 0.5])
        const max_bb: Vec3 = new Vec3([pos.x + 0.5, pos.y + 0.5, pos.z + 0.5])

        let t_min_x = (min_bb.x - r_ori.x) * r_inv.x
        let t_max_x = (max_bb.x - r_ori.x) * r_inv.x
        let t_min_y = (min_bb.y - r_ori.y) * r_inv.y
        let t_max_y = (max_bb.y - r_ori.y) * r_inv.y
        let t_min_z = (min_bb.z - r_ori.z) * r_inv.z
        let t_max_z = (max_bb.z - r_ori.z) * r_inv.z

        // Find the minimum and maximum t-values for the entry and exit points
        let t_min = Math.max(Math.min(t_min_x, t_max_x), Math.min(t_min_y, t_max_y), Math.min(t_min_z, t_max_z))
        let t_max = Math.min(Math.max(t_min_x, t_max_x), Math.max(t_min_y, t_max_y), Math.max(t_min_z, t_max_z))

        // If the minimum t-value for the exit point is greater than the maximum t-value for the entry point,
        // there is no intersection
        if (t_min > t_max) return -1

        return Math.abs(t_min)
    }

    public static aabb_collision(a: AABB, b: AABB): boolean
    {
        return (
            a.min.x + a.pos.x <= b.max.x + b.pos.x &&
            a.max.x + a.pos.x >= b.min.x + b.pos.x &&
            a.min.y + a.pos.y <= b.max.y + b.pos.y &&
            a.max.y + a.pos.y >= b.min.y + b.pos.y &&
            a.min.z + a.pos.z <= b.max.z + b.pos.z &&
            a.max.z + a.pos.z >= b.min.z + b.pos.z
        );      
    }

    public static flatten_2d_array(array: number[][], size: number): number[]
    {
        let flat_array: number[] = new Array<number>()
        for (let y = 0; y < size; y++)
        {
            for (let x = 0; x < size; x++)
            {
                flat_array.push(array[x][y])
            }
        }
        return flat_array
    }

    public static get_color(_name : string) : Vec3
    {
        switch (_name)
        {
            case "white":   return new Vec3([1.0, 1.0, 1.0])
            case "black":   return new Vec3([0.0, 0.0, 0.0])
            case "red":     return new Vec3([1.0, 0.0, 0.0])
            case "green":   return new Vec3([0.0, 1.0, 0.0])
            case "blue":    return new Vec3([0.0, 0.0, 1.0])
            case "cyan":    return new Vec3([0.0, 1.0, 1.0])
            case "pink":    return new Vec3([1.0, 0.0, 1.0])
            default:        break;
        }
        // return white as default
        return new Vec3([0.0, 0.0, 0.0])
    }
}