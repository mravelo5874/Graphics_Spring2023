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
    public static PLAYER_RADIUS: number = 0.4
    public static PLAYER_HEIGHT: number = 2

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

    // returns a 64x64 patch of terrain heights
    public static get_chunk_heights(chunk_coords: Vec2): void
    {
        // TODO
    }

    // returns the shortest distance between two lines, and the two points 
    // at which the two lines are closest on each respective line
    public static line_line_dist(line1: Line, line2: Line): [number, Vec3, Vec3]
    {
        const line1_pos : Vec3 = line1.get_start()  // r1
        const line1_dir : Vec3 = line1.get_end().copy().subtract(line1.get_start().copy()).normalize() // e1

        const line2_pos : Vec3 = line2.get_start()  // r2
        const line2_dir : Vec3 = line2.get_end().copy().subtract(line2.get_start().copy()).normalize() // e2

        // line connecting closest points has dir vector n
        const n : Vec3 = Vec3.cross(line1_dir, line2_dir) // e1 x e2

        // return if cross product is 0
        if (n == Vec3.zero) return [-1, Vec3.zero.copy(), Vec3.zero.copy()]
        
        const r2_sub_r1 : Vec3 = line2_pos.copy().subtract(line1_pos)
        const n_dot_n : number = Vec3.dot(n, n)
        // compute t1 and t2
        const t1 : number = Vec3.dot(Vec3.cross(line2_dir, n), r2_sub_r1) / n_dot_n
        const t2 : number = Vec3.dot(Vec3.cross(line1_dir, n), r2_sub_r1) / n_dot_n
        // compute p1 and p2
        const p1 : Vec3 = line1_pos.copy().add(line1_dir.copy().scale(t1))
        const p2 : Vec3 = line2_pos.copy().add(line2_dir.copy().scale(t2))
        // confirm
        const dist : number = Vec3.distance(p1, p2)
        return [dist, p1, p2]
    }

    // return the distance a point is from a line (start and end point)
    // with help from: https://math.stackexchange.com/questions/1905533/find-perpendicular-distance-from-point-to-line-in-3d
    public static point_line_dist(point: Vec3, line: Line): number
    {
        // TODO this
        return -1
    }

    public static cube_cyl_intersection(cube: CubeCollider, cylinder: CylinderCollider): [boolean, Vec3]
    {
        // TODO finish this
        const cube_cen: Vec3 = cube.get_pos()
        const cyl_line: Line = new Line(cylinder.start.copy(), cylinder.end.copy())
        const cyl_rad: number = cylinder.radius
        let int_top: boolean = false
        let int_bot: boolean = false

        // get all 8 verticies of the cube
        /* top face verts */
        const v0: Vec3 = cube_cen.copy().add(new Vec3([-0.5, 0.5, -0.5]))
        const v1: Vec3 = cube_cen.copy().add(new Vec3([-0.5, 0.5, 0.5]))
        const v2: Vec3 = cube_cen.copy().add(new Vec3([0.5, 0.5, 0.5]))
        const v3: Vec3 = cube_cen.copy().add(new Vec3([0.5, 0.5, -0.5]))
        /* bottom face verts */
        const v4: Vec3 = cube_cen.copy().add(new Vec3([-0.5, 0.5, -0.5]))
        const v5: Vec3 = cube_cen.copy().add(new Vec3([-0.5, 0.5, 0.5]))
        const v6: Vec3 = cube_cen.copy().add(new Vec3([0.5, 0.5, 0.5]))
        const v7: Vec3 = cube_cen.copy().add(new Vec3([0.5, 0.5, -0.5]))

        // check top face
        let min_top_dist: number = Number.MAX_VALUE
        min_top_dist = Math.min(this.point_line_dist(v0.copy(), cyl_line), min_top_dist)
        min_top_dist = Math.min(this.point_line_dist(v1.copy(), cyl_line), min_top_dist)
        min_top_dist = Math.min(this.point_line_dist(v2.copy(), cyl_line), min_top_dist)
        min_top_dist = Math.min(this.point_line_dist(v3.copy(), cyl_line), min_top_dist)
        if (min_top_dist <= cyl_rad)
        {
            // player is intersecting with top cube face
            int_top = true
        }

        // check bottom face
        let min_bot_dist: number = Number.MAX_VALUE
        min_bot_dist = Math.min(this.point_line_dist(v4.copy(), cyl_line), min_bot_dist)
        min_bot_dist = Math.min(this.point_line_dist(v5.copy(), cyl_line), min_bot_dist)
        min_bot_dist = Math.min(this.point_line_dist(v6.copy(), cyl_line), min_bot_dist)
        min_bot_dist = Math.min(this.point_line_dist(v7.copy(), cyl_line), min_bot_dist)
        if (min_bot_dist <= cyl_rad)
        {
            // player is intersecting with bot cube face
            int_bot = true
        }

        // return if no intersection detected
        if (!int_top && !int_bot)
        {
            return [false, Vec3.zero]
        }

        // if only intersecting top face
        if (int_top && !int_bot)
        {
            // determine if player end point height is greater than cube center
            if (cyl_line.get_end().y > cube_cen.y)
            {
                // TODO move player up
            }
        }

        // if only intersecting bottom face
        if (!int_top && int_bot)
        {
            // determine if player end point height is less than cube center
            if (cyl_line.get_end().y < cube_cen.y)
            {
                // TODO ove player down
            }
        }

        // TODO move player xz
        return [false, Vec3.zero]
    }
}