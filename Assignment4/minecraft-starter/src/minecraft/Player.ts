import { Utils, print } from "./Utils.js";
import { Vec3, Vec2 } from "../lib/TSM.js";
import { Chunk } from "./Chunk.js";

export class Player
{
    private pos: Vec3;
    private vel: Vec3;
    private acc: Vec3;
    private max_acc: number = 25.0;

    private chunk: Vec2;
    private speed: number = 10.0;
    private sense: number = 0.25;

    private create_mode: boolean;

    // pos access
    public get_pos(): Vec3 { return this.pos.copy() }
    // chunk access
    public get_chunk(): Vec2 { return this.chunk.copy() }
    public set_chunk(_chunk: Vec2): void { this.chunk = _chunk.copy() }
    // settings access
    public get_sense(): number { return this.sense }
    public get_creative_mode(): boolean { return this.create_mode }

    constructor(_pos: Vec3)
    {
        // TODO: remove creative mode default
        this.create_mode = false

        // set pos vel acc
        this.pos = _pos.copy()
        this.vel = Vec3.zero.copy()
        this.acc = Vec3.zero.copy()

        // player info
        this.chunk = Utils.pos_to_chunck(this.pos)
    }

    public update(dir: Vec3, _chunk: Chunk, delta_time: number): void
    {   
        // console.log('delta_time: ' + delta_time)
        // console.log('dir: ' + print.v3(dir))

        // apply physics
        // w/ some help from: https://catlikecoding.com/unity/tutorials/movement/sliding-a-sphere/
        
        // get acceleration from move dir
        this.acc = dir.copy().scale(delta_time * delta_time)
        // apply gravity
        if (!this.create_mode) { this.acc.add(Utils.GRAVITY.copy()) }

        // calculate velocity
		const des_vel: Vec3 = this.acc.scale(this.speed)
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

        // detect collisions with chunk blocks
        

        // return if player in creative mode
        if (this.create_mode) { return }
    }
}