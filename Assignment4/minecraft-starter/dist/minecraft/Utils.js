var _a;
import { Vec3, Vec2 } from "../lib/TSM.js";
class print {
    static v3(v, d = this.DIGITS) { return v.x.toFixed(d) + ', ' + v.y.toFixed(d) + ', ' + v.z.toFixed(d); }
    static v2(v, d = this.DIGITS) { return v.x.toFixed(d) + ', ' + v.y.toFixed(d); }
}
print.DIGITS = 3;
export { print };
export class Line {
    get_start() { return this.start.copy(); }
    get_end() { return this.end.copy(); }
    get_len() { return this.length; }
    constructor(_start, _end) {
        this.start = _start.copy();
        this.end = _end.copy();
        this.length = Vec3.distance(_start.copy(), _end.copy());
    }
}
class Utils {
    // returns what chunk the player is in based of their position
    static pos_to_chunck(pos) {
        const x_chunk = Math.floor((pos.x + this.HALF_CHUNK_SIZE) / this.CHUNK_SIZE);
        const z_chunk = Math.floor((pos.z + this.HALF_CHUNK_SIZE) / this.CHUNK_SIZE);
        return new Vec2([x_chunk, z_chunk]);
    }
    // gets the center of a chunk based of its chunk coordinates (given by this.get_chunk())
    static get_chunk_center(x_coord, z_coord) {
        const x_center = x_coord * this.CHUNK_SIZE;
        const z_center = z_coord * this.CHUNK_SIZE;
        return new Vec2([x_center, z_center]);
    }
    // calculate the mid-point between two points
    static mid_point(p1, p2) {
        const x = (p1.x + p2.x) / 2.0;
        const y = (p1.y + p2.y) / 2.0;
        const z = (p1.z + p2.z) / 2.0;
        return new Vec3([x, y, z]);
    }
    static smooth(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    static lerp(p0, p1, t) {
        // make sure t is clamped between 0 and 1
        if (t > 1)
            t = 1;
        if (t < 0)
            t = 0;
        // return interpolated value
        return (1 - t) * p0 + t * p1;
    }
    // a simple means of vertical detection collison of a line with a cube, returns the y-offset to apply to the player
    static simple_vert_collision(cube, cylinder) {
        // first, determine if cylinder point is within cube zx area (+ radius)
        const cube_cen = cube.get_pos();
        const cyl_end = cylinder.end.copy();
        const radius = cylinder.radius;
        const cube_min = new Vec3([cube_cen.x - 0.5 - radius, cube_cen.y, cube_cen.z - 0.5 - radius]);
        const cube_max = new Vec3([cube_cen.x + 0.5 + radius, cube_cen.y, cube_cen.z + 0.5 + radius]);
        if (cyl_end.x >= cube_min.x && cyl_end.z >= cube_min.z && cyl_end.x <= cube_max.x && cyl_end.z <= cube_max.z) {
            // next, check if cylinder is under the top face of the cube but above it's center
            if (cylinder.end.y <= cube_cen.y + (Utils.CUBE_LEN / 2) && cylinder.end.y > cube_cen.y) {
                return true;
            }
        }
        // no offset
        return false;
    }
    static simple_horz_collision(cube, cylinder) {
        // first, determine if cylinder point is within cube zx area (+ radius)
        const cube_cen = cube.get_pos();
        const cyl_end = cylinder.end.copy();
        const cyl_start = cylinder.start.copy();
        const radius = cylinder.radius;
        const cube_min = new Vec3([cube_cen.x - 0.5 - radius, cube_cen.y, cube_cen.z - 0.5 - radius]);
        const cube_max = new Vec3([cube_cen.x + 0.5 + radius, cube_cen.y, cube_cen.z + 0.5 + radius]);
        if (cyl_end.x >= cube_min.x && cyl_end.z >= cube_min.z && cyl_end.x <= cube_max.x && cyl_end.z <= cube_max.z) {
            // next, check if cylinder is within vaild y-distance (height of cylinder)
            if (cyl_end.y < (cube_cen.y + 0.5) && cyl_start.y > (cube_cen.y - 0.5)) {
                return true;
            }
        }
        return false;
    }
}
_a = Utils;
Utils.CHUNK_SIZE = 64;
Utils.HALF_CHUNK_SIZE = _a.CHUNK_SIZE / 2;
Utils.NUM_ADJ_CHUNKS = 8;
Utils.GRAVITY = new Vec3([0.0, -9.8, 0.0]);
Utils.CUBE_LEN = 1;
Utils.PLAYER_RADIUS = 0.2;
Utils.PLAYER_HEIGHT = 2;
Utils.SQRT2 = 1.41421356237;
export { Utils };
//# sourceMappingURL=Utils.js.map