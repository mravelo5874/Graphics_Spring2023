import { Utils } from "./Utils.js";
import { Vec3 } from "../lib/TSM.js";
import { CylinderCollider, AABB } from "./Colliders.js";
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
        this.max_acc = 0.00002; // default = 0.00002    
        this.speed = 0.01; // default = 0.005
        this.creative_speedup = 4;
        this.sense = 0.25; // default = 0.25
        this.jump_vel = 0.008; // default = 0.008
        // init in normal model
        this.creative_mode = false;
        // set pos vel acc
        this.pos = _pos.copy();
        this.vel = Vec3.zero.copy();
        this.acc = Vec3.zero.copy();
        // player info
        this.chunk = Utils.pos_to_chunck(this.pos);
        this.collider = new CylinderCollider(this.pos.copy(), this.pos.copy().subtract(new Vec3([0, Utils.PLAYER_HEIGHT, 0])), Utils.PLAYER_RADIUS);
        this.aabb = new AABB(new Vec3([-Utils.PLAYER_RADIUS, -Utils.PLAYER_RADIUS, -(Utils.PLAYER_HEIGHT / 2)]), new Vec3([Utils.PLAYER_RADIUS, Utils.PLAYER_RADIUS, (Utils.PLAYER_HEIGHT / 2)]), this.pos.copy());
    }
    update(dir, _chunk, _edges, delta_time) {
        // apply physics
        // w/ some help from: https://catlikecoding.com/unity/tutorials/movement/sliding-a-sphere/
        // apply gravity
        if (!this.creative_mode) {
            this.acc = Utils.GRAVITY.copy();
        }
        // calculate velocity
        let des_vel = dir.copy().add(this.acc.copy().scale(delta_time)).scale(this.speed);
        // add creative mode speed-up
        if (this.creative_mode)
            des_vel.scale(this.creative_speedup);
        // apply velocity to player
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
        // update collider
        this.collider.start = this.pos.copy();
        this.collider.end = this.pos.copy().subtract(new Vec3([0, Utils.PLAYER_HEIGHT, 0]));
        this.aabb.pos = this.pos.copy();
        // return if player in creative mode
        if (this.creative_mode) {
            return;
        }
        // detect collisions with chunk blocks
        const cubes = _chunk.get_cube_colliders();
        for (let i = 0; i < cubes.length; i++) {
            // check for vertical collision
            if (Utils.simple_vert_collision(cubes[i], this.collider)) {
                // do not apply vertical offset if going up
                if (this.vel.y > 0)
                    break;
                // apply offset
                this.pos = new Vec3([this.pos.x, cubes[i].get_pos().y + (Utils.CUBE_LEN / 2) + this.collider.height, this.pos.z]);
                this.vel.y = 0;
                this.collider.start = this.pos.copy();
                this.collider.end = this.pos.copy().subtract(new Vec3([0, Utils.PLAYER_HEIGHT, 0]));
            }
        }
        // detect collisions with edge blocks
        for (let i = 0; i < _edges.length; i++) {
            // check for vertical collision
            if (Utils.simple_vert_collision(_edges[i], this.collider)) {
                // do not apply vertical offset if going up
                if (this.vel.y > 0)
                    break;
                // apply offset
                this.pos = new Vec3([this.pos.x, _edges[i].get_pos().y + (Utils.CUBE_LEN / 2) + this.collider.height, this.pos.z]);
                this.vel.y = 0;
                this.collider.start = this.pos.copy();
                this.collider.end = this.pos.copy().subtract(new Vec3([0, Utils.PLAYER_HEIGHT, 0]));
            }
        }
        // get the top-most cube in the player's position
        const my_cube = _chunk.get_cube_from_pos(this.pos);
        if (my_cube) {
            if (this.pos.y < my_cube.get_pos().y + (Utils.CUBE_LEN / 2) + Utils.PLAYER_HEIGHT) {
                this.pos.y = my_cube.get_pos().y + (Utils.CUBE_LEN / 2) + Utils.PLAYER_HEIGHT;
            }
        }
        // update collider
        this.collider.start = this.pos.copy();
        this.collider.end = this.pos.copy().subtract(new Vec3([0, Utils.PLAYER_HEIGHT, 0]));
        this.aabb.pos = this.pos.copy().subtract(new Vec3([0, Utils.PLAYER_HEIGHT / 2, 0]));
    }
    try_destroy_block(ray, chunk) {
        const cubes = chunk.get_cube_colliders();
        let near = new Array();
        let min_t = Number.MAX_VALUE;
        let hit_idx = -1;
        // get all blocks within a certain range
        for (let i = 0; i < cubes.length; i++) {
            if (Vec3.distance(cubes[i].get_pos(), this.get_pos()) <= Utils.PLAYER_REACH) {
                near.push(cubes[i]);
            }
        }
        console.log('near cubes: ' + near.length);
        // check each near cube for ray intersection
        for (let i = 0; i < near.length; i++) {
            const t = Utils.ray_cube_intersection(ray.copy(), near[i]);
            // console.log('t: ' + t + ', min_t: ' + min_t)
            if (t < min_t && t > 0) {
                min_t = t;
                hit_idx = i;
            }
        }
        // remove cube from chunk
        if (hit_idx > -1 && min_t > -1) {
            chunk.remove_cube(near[hit_idx]);
            return true;
        }
        return false;
    }
    jump() {
        // determine if player on ground before jumping
        if (this.vel.y == 0)
            this.vel.y += this.jump_vel;
    }
}
//# sourceMappingURL=Player.js.map