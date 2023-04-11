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
    private jump_vel: number = 0.015; // default = 0.008
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

    public update(dir: Vec3, _chunk: Chunk, _edges: CubeCollider[], delta_time: number): void
    {   
        // apply physics
        // w/ some help from: https://catlikecoding.com/unity/tutorials/movement/sliding-a-sphere/
        
        // accelerations to apply if not in creative mode
        if (!this.creative_mode)
        {
            // apply gravity 
            if (this.pos.y > Utils.WATER_LEVEL) { this.acc = Utils.GRAVITY.copy() }

            // bouyancy if in water
            if (this.pos.y < Utils.WATER_LEVEL && this.pos.y > Utils.WATER_LEVEL + (Utils.PLAYER_HEIGHT * 0.5)) this.acc = new Vec3([0.0, -0.04, 0.0])
            else if (this.pos.y < Utils.WATER_LEVEL + (Utils.PLAYER_HEIGHT * 0.5) ) this.acc = new Vec3([0.0, 0.04, 0.0])
        }

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

        // return if player in creative mode
        if (this.creative_mode) { return }

        // detect vertical collisions with chunk blocks
        const _cubes: CubeCollider[] = _chunk.get_cube_colliders()
        let near: CubeCollider[] = new Array<CubeCollider>()
        // get all blocks within a certain range
        for (let i = 0; i < _cubes.length; i++)
        {
            if (Vec3.distance(_cubes[i].get_pos(), this.collider.end.copy()) <= Utils.PLAYER_REACH)
            {
                near.push(_cubes[i])
            }
        }
        for (let i = 0; i < near.length; i++)
        {
            // check for vertical collision
            if (Utils.simple_vert_collision(near[i], this.collider))
            {
                // do not apply vertical offset if going up
                if (this.vel.y > 0) break;

                // apply offset
                this.pos = new Vec3([this.pos.x, near[i].get_pos().y + (Utils.CUBE_LEN / 2) + this.collider.height, this.pos.z])
                this.vel.y = 0
            }
        }

        
        near = new Array<CubeCollider>()
        // get all blocks within a certain range
        for (let i = 0; i < _edges.length; i++)
        {
            if (Vec3.distance(_edges[i].get_pos(), this.collider.end.copy()) <= Utils.PLAYER_REACH)
            {
                near.push(_edges[i])
            }
        }
        // detect collisions with edge blocks
        for (let i = 0; i < near.length; i++)
        {
            // check for vertical collision
            if (Utils.simple_vert_collision(near[i], this.collider))
            {
                // do not apply vertical offset if going up
                if (this.vel.y > 0) break;

                // apply offset
                this.pos = new Vec3([this.pos.x, near[i].get_pos().y + (Utils.CUBE_LEN / 2) + this.collider.height, this.pos.z])
                this.vel.y = 0
            }
        }

        // generate ray from player displacement vector
        const vec: Vec3 = new Vec3([disp.x, 0, disp.z]).normalize()
        const ray: Ray = new Ray(this.collider.end.copy(), vec.copy()) 

        // detect vertical collisions with chunk blocks
        // for (let i = 0; i < cubes.length; i++)
        // {
        //     // check for vertical collision
        //     const res = Utils.ray_cube_intersection(ray, cubes[i])
        //     const i_pos_v3 = ray.get_origin().add(ray.get_direction().scale(res[0]))
        //     const i_pos_v2 = new Vec2([i_pos_v3.x, i_pos_v3.z])
        //     const p_pos_v2 = new Vec2([this.pos.x, this.pos.z])

        //     if (Vec2.distance(i_pos_v2, p_pos_v2) <= Utils.PLAYER_RADIUS)
        //     {
        //         console.log('vert collision detected!')

        //         // determine offset
        //         const offset = i_pos_v3.add(ray.get_inverse().scale(Utils.PLAYER_RADIUS))

        //         // TODO update xz velocity

        //         // apply offset
        //         this.pos.add(offset)
        //     }
        // }


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