import { Utils } from "./Utils.js";
import { Vec3 } from "../lib/TSM.js";
export class Player {
    // pos access
    get_pos() { return this.pos.copy(); }
    // chunk access
    get_chunk() { return this.chunk.copy(); }
    set_chunk(_chunk) { this.chunk = _chunk.copy(); }
    // settings access
    get_sense() { return this.sense; }
    get_creative_mode() { return this.create_mode; }
    constructor(_pos) {
        this.max_acc = 25.0;
        this.speed = 10.0;
        this.sense = 0.25;
        // TODO: remove creative mode default
        this.create_mode = false;
        // set pos vel acc
        this.pos = _pos.copy();
        this.vel = Vec3.zero.copy();
        this.acc = Vec3.zero.copy();
        // player info
        this.chunk = Utils.pos_to_chunck(this.pos);
    }
    update(dir, _chunk, delta_time) {
        // console.log('delta_time: ' + delta_time)
        // console.log('dir: ' + print.v3(dir))
        // apply physics
        // w/ some help from: https://catlikecoding.com/unity/tutorials/movement/sliding-a-sphere/
        // get acceleration from move dir
        this.acc = dir.copy().scale(delta_time * delta_time);
        // apply gravity
        if (!this.create_mode) {
            this.acc.add(Utils.GRAVITY.copy());
        }
        const des_vel = this.acc.scale(this.speed);
        const max_delta_speed = this.max_acc * delta_time;
        // x vel
        if (this.vel.x < des_vel.x) {
            this.vel.x = Math.min(this.vel.x + max_delta_speed, des_vel.x);
        }
        else if (this.vel.x > des_vel.x) {
            this.vel.x = Math.max(this.vel.x - max_delta_speed, des_vel.x);
        }
        // y vel
        if (this.vel.y < des_vel.y) {
            this.vel.y = Math.min(this.vel.y + max_delta_speed, des_vel.y);
        }
        else if (this.vel.y > des_vel.y) {
            this.vel.y = Math.max(this.vel.y - max_delta_speed, des_vel.y);
        }
        // z vel
        if (this.vel.z < des_vel.z) {
            this.vel.z = Math.min(this.vel.z + max_delta_speed, des_vel.z);
        }
        else if (this.vel.z > des_vel.z) {
            this.vel.z = Math.max(this.vel.z - max_delta_speed, des_vel.z);
        }
        // calc displacement
        const disp = this.vel.copy().scale(delta_time);
        this.pos.add(disp.copy());
        // return if player in creative mode
        if (this.create_mode) {
            return;
        }
    }
}
//# sourceMappingURL=Player.js.map