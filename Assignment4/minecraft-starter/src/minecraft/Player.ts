import { Utils, print } from "./Utils.js";
import { Vec3, Vec2 } from "../lib/TSM.js";
import { Chunk } from "./Chunk.js";
import { CubeCollider, CylinderCollider } from "./Colliders.js";

export class Player
{
    // private attributes
    private chunk: Vec2;
    private pos: Vec3;
    private vel: Vec3;
    private acc: Vec3;
    private max_acc: number = 0.00001; // default = 0.00001    
    private speed: number = 0.005; // default = 0.005
    private sense: number = 0.25; // default = 0.25
    private jump_vel: number = 0.005; // default = 0.005
    private collider: CylinderCollider;
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
    }

    public update(dir: Vec3, _chunk: Chunk, delta_time: number): void
    {   
        // apply physics
        // w/ some help from: https://catlikecoding.com/unity/tutorials/movement/sliding-a-sphere/
        
        // apply gravity
        if (!this.creative_mode) { this.acc = Utils.GRAVITY.copy() }

        // calculate velocity
		const des_vel: Vec3 = dir.copy().add(this.acc.copy().scale(delta_time)).scale(this.speed)
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

        // return if player in creative mode
        if (this.creative_mode) { return }

        // detect collisions with chunk blocks
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
            if (Utils.simple_horz_collision(cubes[i], this.collider))
            {
                // determine max offset between x and z
                const x_offset_dist = Math.abs(this.pos.x - cubes[i].get_pos().x) / 256
                const z_offset_dist = Math.abs(this.pos.z - cubes[i].get_pos().z) / 256

                // apply offset(s)
                let new_pos: Vec3 = this.pos.copy()
                if (x_offset_dist > 0)
                {
                    // which direction is the player moving?
                    if (this.vel.x > 0)
                    {
                        new_pos.x -= x_offset_dist
                    }
                    else if (this.vel.x < 0)
                    {
                        new_pos.x += x_offset_dist
                    }
                    // set new pos and vel
                    this.pos = new_pos.copy()
                    this.vel.x = 0
                }
                if (z_offset_dist > 0)
                {
                    // which direction is the player moving?
                    if (this.vel.z > 0)
                    {
                        new_pos.z -= z_offset_dist
                    }
                    else if (this.vel.z < 0)
                    {
                        new_pos.z += z_offset_dist
                    }
                    // set new pos and vel
                    this.pos = new_pos.copy()
                    this.vel.z = 0
                }
                this.collider.start = this.pos.copy()
                this.collider.end = this.pos.copy().subtract(new Vec3([0,Utils.PLAYER_HEIGHT,0])) 
            }
        }
    }

    public jump(): void
    {
        // determine if player on ground before jumping
        if (this.vel.y == 0) this.vel.y += this.jump_vel
    }
}