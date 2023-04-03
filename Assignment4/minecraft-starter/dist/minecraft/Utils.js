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
    // returns a 64x64 patch of terrain heights
    static get_chunk_heights(chunk_coords) {
        // TODO
    }
    // returns the shortest distance between two lines, and the two points 
    // at which the two lines are closest on each respective line
    static line_line_dist(line1, line2) {
        const line1_pos = line1.get_start(); // r1
        const line1_dir = line1.get_end().copy().subtract(line1.get_start().copy()).normalize(); // e1
        const line2_pos = line2.get_start(); // r2
        const line2_dir = line2.get_end().copy().subtract(line2.get_start().copy()).normalize(); // e2
        // line connecting closest points has dir vector n
        const n = Vec3.cross(line1_dir, line2_dir); // e1 x e2
        // return if cross product is 0
        if (n == Vec3.zero)
            return [-1, Vec3.zero.copy(), Vec3.zero.copy()];
        const r2_sub_r1 = line2_pos.copy().subtract(line1_pos);
        const n_dot_n = Vec3.dot(n, n);
        // compute t1 and t2
        const t1 = Vec3.dot(Vec3.cross(line2_dir, n), r2_sub_r1) / n_dot_n;
        const t2 = Vec3.dot(Vec3.cross(line1_dir, n), r2_sub_r1) / n_dot_n;
        // compute p1 and p2
        const p1 = line1_pos.copy().add(line1_dir.copy().scale(t1));
        const p2 = line2_pos.copy().add(line2_dir.copy().scale(t2));
        // confirm
        const dist = Vec3.distance(p1, p2);
        return [dist, p1, p2];
    }
    // return the distance a point is from a line (start and end point)
    // with help from: https://math.stackexchange.com/questions/1905533/find-perpendicular-distance-from-point-to-line-in-3d
    static point_line_dist(point, line) {
        // TODO this
        return -1;
    }
    static cube_cyl_intersection(cube, cylinder) {
        // TODO finish this
        const cube_cen = cube.get_pos();
        const cyl_line = new Line(cylinder.start.copy(), cylinder.end.copy());
        const cyl_rad = cylinder.radius;
        let int_top = false;
        let int_bot = false;
        // get all 8 verticies of the cube
        /* top face verts */
        const v0 = cube_cen.copy().add(new Vec3([-0.5, 0.5, -0.5]));
        const v1 = cube_cen.copy().add(new Vec3([-0.5, 0.5, 0.5]));
        const v2 = cube_cen.copy().add(new Vec3([0.5, 0.5, 0.5]));
        const v3 = cube_cen.copy().add(new Vec3([0.5, 0.5, -0.5]));
        /* bottom face verts */
        const v4 = cube_cen.copy().add(new Vec3([-0.5, 0.5, -0.5]));
        const v5 = cube_cen.copy().add(new Vec3([-0.5, 0.5, 0.5]));
        const v6 = cube_cen.copy().add(new Vec3([0.5, 0.5, 0.5]));
        const v7 = cube_cen.copy().add(new Vec3([0.5, 0.5, -0.5]));
        // check top face
        let min_top_dist = Number.MAX_VALUE;
        min_top_dist = Math.min(this.point_line_dist(v0.copy(), cyl_line), min_top_dist);
        min_top_dist = Math.min(this.point_line_dist(v1.copy(), cyl_line), min_top_dist);
        min_top_dist = Math.min(this.point_line_dist(v2.copy(), cyl_line), min_top_dist);
        min_top_dist = Math.min(this.point_line_dist(v3.copy(), cyl_line), min_top_dist);
        if (min_top_dist <= cyl_rad) {
            // player is intersecting with top cube face
            int_top = true;
        }
        // check bottom face
        let min_bot_dist = Number.MAX_VALUE;
        min_bot_dist = Math.min(this.point_line_dist(v4.copy(), cyl_line), min_bot_dist);
        min_bot_dist = Math.min(this.point_line_dist(v5.copy(), cyl_line), min_bot_dist);
        min_bot_dist = Math.min(this.point_line_dist(v6.copy(), cyl_line), min_bot_dist);
        min_bot_dist = Math.min(this.point_line_dist(v7.copy(), cyl_line), min_bot_dist);
        if (min_bot_dist <= cyl_rad) {
            // player is intersecting with bot cube face
            int_bot = true;
        }
        // return if no intersection detected
        if (!int_top && !int_bot) {
            return [false, Vec3.zero];
        }
        // if only intersecting top face
        if (int_top && !int_bot) {
            // determine if player end point height is greater than cube center
            if (cyl_line.get_end().y > cube_cen.y) {
                // TODO move player up
            }
        }
        // if only intersecting bottom face
        if (!int_top && int_bot) {
            // determine if player end point height is less than cube center
            if (cyl_line.get_end().y < cube_cen.y) {
                // TODO ove player down
            }
        }
        // TODO move player xz
        return [false, Vec3.zero];
    }
}
_a = Utils;
Utils.CHUNK_SIZE = 64;
Utils.HALF_CHUNK_SIZE = _a.CHUNK_SIZE / 2;
Utils.NUM_ADJ_CHUNKS = 8;
Utils.GRAVITY = new Vec3([0.0, -9.8, 0.0]);
Utils.CUBE_LEN = 1;
Utils.PLAYER_RADIUS = 0.4;
Utils.PLAYER_HEIGHT = 2;
export { Utils };
//# sourceMappingURL=Utils.js.map