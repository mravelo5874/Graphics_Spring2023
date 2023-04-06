import { Utils, Ray, print } from "./Utils.js";
import { Vec3, Vec2 } from "../lib/TSM.js";
import { Chunk } from "./Chunk.js";
import { CubeCollider, CylinderCollider, AABB } from "./Colliders.js";

export class Player
{
    // private attributes
    private chunk: Vec2;
    private pos: Vec3;
    private vel: Vec3;
    private acc: Vec3;
    private max_acc: number = 0.00002; // default = 0.00002    
    private speed: number = 0.01; // default = 0.005
    private creative_speedup: number = 4; 
    private sense: number = 0.25; // default = 0.25
    private jump_vel: number = 0.008; // default = 0.008
    private collider: CylinderCollider;
    private aabb: AABB;
    private creative_mode: boolean;

    // pos access
    public get_pos(): Vec3 { return this.pos.copy() }
    // chunk access
    public get_chunk(): Vec2 { return this.chunk.copy() }
    public set_chunk(_chunk: Vec2): void { this.chunk = _chunk.copy() }
    // settings access
    public get_sense(): number { return this.sense }
    public get_creative_mode(): boolean { return this.creative_mode }
    public toggle_creative_mode(): void { this.creative_mode = !this.creative_mode; this.acc = Vec3.zero.copy(); this.vel.y = 0 }

    constructor(_pos: Vec3)
    {   
        // init in normal model
        this.creative_mode = false

        // set pos vel acc
        this.pos = _pos.copy()
        this.vel = Vec3.zero.copy()
        this.acc = Vec3.zero.copy()

        // player info
        this.chunk = Utils.pos_to_chunck(this.pos)
        this.collider = new CylinderCollider(this.pos.copy(), this.pos.copy().subtract(new Vec3([0,Utils.PLAYER_HEIGHT,0])), Utils.PLAYER_RADIUS)
        this.aabb = new AABB(
            new Vec3([-Utils.PLAYER_RADIUS, -Utils.PLAYER_RADIUS, -(Utils.PLAYER_HEIGHT / 2)]), 
            new Vec3([Utils.PLAYER_RADIUS, Utils.PLAYER_RADIUS, (Utils.PLAYER_HEIGHT / 2)]),
            this.pos.copy())
    }

    public update(dir: Vec3, _chunk: Chunk, delta_time: number): void
    {   
        // apply physics
        // w/ some help from: https://catlikecoding.com/unity/tutorials/movement/sliding-a-sphere/
        
        // apply gravity
        if (!this.creative_mode) { this.acc = Utils.GRAVITY.copy() }

        // calculate velocity
		let des_vel: Vec3 = dir.copy().add(this.acc.copy().scale(delta_time)).scale(this.speed)

        // add creative mode speed-up
        if (this.creative_mode) des_vel.scale(this.creative_speedup)
        
        // apply velocity to player
        const max_delta_speed: number = this.max_acc * delta_time
        // x vel
        if (this.vel.x < des_vel.x) { this.vel.x = Math.min(this.vel.x + max_delta_speed, des_vel.x) }
        else if (this.vel.x > des_vel.x) { this.vel.x = Math.max(this.vel.x - max_delta_speed, des_vel.x) }
        // y vel
        if (this.vel.y < des_vel.y) { this.vel.y = Math.min(this.vel.y + max_delta_speed, des_vel.y) }
        else if (this.vel.y > des_vel.y) { this.vel.y = Math.max(this.vel.y - max_delta_speed, des_vel.y) }
        // z vel
        if (this.vel.z < des_vel.z) { this.vel.z = Math.min(this.vel.z + max_delta_speed, des_vel.z) }
        else if (this.vel.z > des_vel.z) { this.vel.z = Math.max(this.vel.z - max_delta_speed, des_vel.z) }

        // calc displacement
		const disp: Vec3 = this.vel.copy().scale(delta_time)
        this.pos.add(disp.copy())

        // update collider
        this.collider.start = this.pos.copy()
        this.collider.end = this.pos.copy().subtract(new Vec3([0,Utils.PLAYER_HEIGHT,0]))
        this.aabb.pos = this.pos.copy()

        // return if player in creative mode
        if (this.creative_mode) { return }

        // detect collisions with chunk blocks
        // implement aabb collision detection
        // const cubes_aabb: AABB[] = _chunk.get_cube_aabbs()
        // console.log('cube_aabbs: ' + cubes_aabb.length)

        // for (let i = 0; i < cubes_aabb.length; i++)
        // {
        //     if (Utils.aabb_collision(cubes_aabb[i], this.aabb))
        //     {
        //         console.log('aabb collision!')

        //         // Check if there is an overlap on each dimension
        //         const cube: AABB = cubes_aabb[i]
        //         const me: AABB = this.aabb
        //         let overlap_x: number = Math.max(0, Math.min(cube.max.x + cube.pos.x, me.max.x + me.pos.x) - Math.max(cube.min.x + cube.pos.x, me.min.x + me.pos.x))
        //         let overlap_y: number = Math.max(0, Math.min(cube.max.y + cube.pos.y, me.max.y + me.pos.y) - Math.max(cube.min.y + cube.pos.y, me.min.y + me.pos.y))
        //         let overlap_z: number = Math.max(0, Math.min(cube.max.z + cube.pos.z, me.max.z + me.pos.z) - Math.max(cube.min.z + cube.pos.z, me.min.z + me.pos.z))

        //         // If there is no overlap, return no movement
        //         if (overlap_x == 0 && overlap_y == 0 && overlap_z == 0)
        //             continue

        //         // Calculate the amount to move the second box in each dimension
        //         const move_x: number = overlap_x / 64
        //         const move_y: number = overlap_y / 64
        //         const move_z: number = overlap_z / 64

        //         // Move the second box by the calculated amounts
        //         this.pos.add(new Vec3([move_x, move_y, move_z]))

        //         // update player vel
        //         if (move_y > 0) this.vel.y = 0
        //         if (move_x > 0) this.vel.x = 0
        //         if (move_z > 0) this.vel.z = 0
        //     }
        // }

        /* everything under this comment is meant to be deleted later :) */
        const cubes: CubeCollider[] = _chunk.get_cube_colliders()
        for (let i = 0; i < cubes.length; i++)
        {
            // check for vertical collision
            if (Utils.simple_vert_collision(cubes[i], this.collider))
            {
                // do not apply vertical offset if going up
                if (this.vel.y > 0) break;

                // apply offset
                this.pos = new Vec3([this.pos.x, cubes[i].get_pos().y + (Utils.CUBE_LEN / 2) + this.collider.height, this.pos.z])
                this.vel.y = 0
                this.collider.start = this.pos.copy()
                this.collider.end = this.pos.copy().subtract(new Vec3([0,Utils.PLAYER_HEIGHT,0]))
            }

            // check for horizontal collision
            // if (Utils.simple_horz_collision(cubes[i], this.collider))
            // {
            //     // determine ray from cube center to player center
            //     const cube_cen: Vec3 = cubes[i].get_pos()
            //     const player_cen: Vec3 = this.collider.end.copy()
            //     const dir: Vec3 = player_cen.copy().subtract(cube_cen).normalize()
            //     const d: Ray = new Ray(cubes[i].get_pos(), dir)

            //     // get x and z components and calc orthonormals
            //     const dx: number = d.get_direction().x
            //     const dz: number = d.get_direction().z      
            //     let perps = Utils.perpendiculars(new Vec2([dx, dz]).normalize())

            //     // todo offset player
            //     const cube_xz: Vec2 = new Vec2([cube_cen.x, cube_cen.z])
            //     const pos_xz: Vec2 = new Vec2([this.pos.x, this.pos.z])
            //     const dist: number = Vec2.distance(cube_xz, pos_xz)
            //     // only offset if within range
            //     if (dist < this.collider.radius + Utils.CUBE_LEN)
            //     {
            //         this.pos = this.pos.copy().add(dir.copy().scale(0.01))
            //     }

            //     // determine which perp is in same dir as player velocity
            //     let mag: number = Utils.magnitude(this.vel)
            //     if (this.vel.x != 0 && this.vel.z != 0)
            //     {
            //         const vel_xz: Vec2 = new Vec2([this.vel.x, this.vel.z])
            //         const x0 = Vec2.dot(vel_xz, perps[0])
            //         const x1 = Vec2.dot(vel_xz, perps[1])
            //         if (x0 > 0 && x1 <= 0)
            //         {
            //             this.vel.x = 0
            //         }
            //         else if (x1 > 0 && x0 <= 0)
            //         {
            //             this.vel.z = 0
            //         }
            //     }

            //determine max offset between x and z
            // const x_offset_dist = Math.abs(this.pos.x - cubes[i].get_pos().x) / 256
            // const z_offset_dist = Math.abs(this.pos.z - cubes[i].get_pos().z) / 256

            // // apply offset(s)
            // let new_pos: Vec3 = this.pos.copy()
            // if (x_offset_dist > 0)
            // {
            //     // which direction is the player moving?
            //     if (this.vel.x > 0)
            //     {
            //         new_pos.x -= x_offset_dist
            //     }
            //     else if (this.vel.x < 0)
            //     {
            //         new_pos.x += x_offset_dist
            //     }
            //     // set new pos and vel
            //     this.pos = new_pos.copy()
            //     this.vel.x = 0
            // }
            // if (z_offset_dist > 0)
            // {
            //     // which direction is the player moving?
            //     if (this.vel.z > 0)
            //     {
            //         new_pos.z -= z_offset_dist
            //     }
            //     else if (this.vel.z < 0)
            //     {
            //         new_pos.z += z_offset_dist
            //     }
            //     // set new pos and vel
            //     this.pos = new_pos.copy()
            //     this.vel.z = 0
            // }
        }

        // get the top-most cube in the player's position
        const my_cube = _chunk.get_cube_from_pos(this.pos)
        if (my_cube)
        {
            if (this.pos.y < my_cube.get_pos().y + (Utils.CUBE_LEN / 2) + Utils.PLAYER_HEIGHT)
            {
                this.pos.y = my_cube.get_pos().y + (Utils.CUBE_LEN / 2) + Utils.PLAYER_HEIGHT
            }
        }

        // update collider
        this.collider.start = this.pos.copy()
        this.collider.end = this.pos.copy().subtract(new Vec3([0,Utils.PLAYER_HEIGHT,0]))
        this.aabb.pos = this.pos.copy().subtract(new Vec3([0,Utils.PLAYER_HEIGHT / 2,0]))
    }

    public jump(): void
    {
        // determine if player on ground before jumping
        if (this.vel.y == 0) this.vel.y += this.jump_vel
    }
}