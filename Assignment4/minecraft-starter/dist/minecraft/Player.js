import { Utils, print } from "./Utils.js";
import { Vec3 } from "../lib/TSM.js";
import { CylinderCollider } from "./Colliders.js";
export class Player {
    // pos access
    get_pos() { return this.pos.copy(); }
    // chunk access
    get_chunk() { return this.chunk.copy(); }
    set_chunk(_chunk) { this.chunk = _chunk.copy(); }
    // settings access
    get_sense() { return this.sense; }
    get_creative_mode() { return this.creative_mode; }
    toggle_creative_mode() { this.creative_mode = !this.creative_mode; this.acc = Vec3.zero.copy(); this.vel.y = 0; }
    constructor(_pos) {
        this.max_acc = 0.00001;
        this.speed = 0.005;
        this.sense = 0.25;
        // TODO: remove creative mode default
        this.creative_mode = true;
        // set pos vel acc
        this.pos = _pos.copy();
        this.vel = Vec3.zero.copy();
        this.acc = Vec3.zero.copy();
        // player info
        this.chunk = Utils.pos_to_chunck(this.pos);
        this.collider = new CylinderCollider(this.pos.copy(), this.pos.copy().subtract(new Vec3([0, Utils.PLAYER_HEIGHT, 0])), Utils.PLAYER_RADIUS);
    }
    update(dir, _chunk, delta_time) {
        //console.log('delta_time: ' + delta_time)
        //console.log('dir: ' + print.v3(dir))
        // apply physics
        // w/ some help from: https://catlikecoding.com/unity/tutorials/movement/sliding-a-sphere/
        // apply gravity
        if (!this.creative_mode) {
            this.acc = Utils.GRAVITY.copy();
        }
        // calculate velocity
        const des_vel = dir.copy().add(this.acc.copy().scale(delta_time)).scale(this.speed);
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
        console.log('pos: {' + print.v3(this.pos.copy()) + '}');
        /*
        this.collider.start = this.pos.copy()
        this.collider.end = this.pos.copy().subtract(new Vec3([0,Utils.PLAYER_HEIGHT,0]))

        // detect collisions with chunk blocks
        const cubes: CubeCollider[] = _chunk.get_cube_colliders()
        for (let i = 0; i < cubes.length; i++)
        {
            const res = Utils.cube_cyl_intersection(cubes[i], this.collider)
            if (res[0])
            {
                console.log('collision')
            }
        }

        // return if player in creative mode
        if (this.create_mode) { return }
        */
    }
}
//# sourceMappingURL=Player.js.map