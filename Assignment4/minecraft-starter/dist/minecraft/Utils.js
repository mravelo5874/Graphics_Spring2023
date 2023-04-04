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
    // returns a 64x64 patch of terrain heights
    static get_chunk_heights(chunk_coords) {
        // TODO
    }
    // a simple means of vertical detection collison of a line with a cube, returns the y-offset to apply to the player
    static simple_vert_collision(cube, cylinder) {
        // first, determine if cylinder point is within cube zx area
        const cube_cen = cube.get_pos();
        const cyl_end = cylinder.end.copy();
        const cube_min = new Vec3([cube_cen.x - 0.5, cube_cen.y, cube_cen.z - 0.5]);
        const cube_max = new Vec3([cube_cen.x + 0.5, cube_cen.y, cube_cen.z + 0.5]);
        // console.log('\n')
        // console.log('cyl_cen: ' + print.v3(cyl_end))
        // console.log('cube_min: ' + print.v3(cube_min))
        // console.log('cube_max: ' + print.v3(cube_max))
        if (cyl_end.x >= cube_min.x && cyl_end.z >= cube_min.z && cyl_end.x <= cube_max.x && cyl_end.z <= cube_max.z) {
            // next, decide which way to offset based on cylinder's position and distance from center of cube
            const cyl_mid = Utils.mid_point(cylinder.start.copy(), cylinder.end.copy());
            const y_dist = Math.abs(cyl_mid.y - cube_cen.y);
            if (cylinder.end.y <= cube_cen.y + (Utils.CUBE_LEN / 2)) {
                return true;
            }
        }
        // no offset
        return false;
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
    // return the point, the t-value of a point projected onto a line, and the distance of the point to calculated projection p
    // with help from: https://math.stackexchange.com/questions/1905533/find-perpendicular-distance-from-point-to-line-in-3d
    static point_line_projection(point, line) {
        // point = a
        // start = b
        // end = c
        const dir_vec = line.get_start().subtract(line.get_end()).normalize();
        const b2a_vec = point.copy().subtract(line.get_start());
        const t = Vec3.dot(dir_vec, b2a_vec);
        const p = line.get_end().add(dir_vec.copy().scale(t));
        const dist = Vec3.distance(point, p);
        return [p.copy(), t, dist];
    }
    // TODO does this work as intended?
    static calc_int(proj_res, radius, cyl_mid, cyl_line) {
        return proj_res[1] > 0 // is t positive?
            && proj_res[2] < radius // is the distance less than the radius?
            && Vec3.distance(proj_res[0], cyl_mid) < (cyl_line.get_len() / 2); // is the projected point within the cylinder?
    }
    static cube_cyl_intersection(cube, cylinder) {
        // TODO finish this
        const cube_cen = cube.get_pos();
        const cyl_line = new Line(cylinder.start.copy(), cylinder.end.copy());
        const cyl_rad = cylinder.radius;
        const cyl_mid = this.mid_point(cylinder.start.copy(), cylinder.end.copy());
        let int_top = false;
        let int_bot = false;
        // get all 8 verticies of the cube
        /* top face verts */
        const v0 = cube_cen.copy().add(new Vec3([-0.5, 0.5, -0.5]));
        const v1 = cube_cen.copy().add(new Vec3([-0.5, 0.5, 0.5]));
        const v2 = cube_cen.copy().add(new Vec3([0.5, 0.5, 0.5]));
        const v3 = cube_cen.copy().add(new Vec3([0.5, 0.5, -0.5]));
        /* bottom face verts */
        const v4 = cube_cen.copy().add(new Vec3([-0.5, -0.5, -0.5]));
        const v5 = cube_cen.copy().add(new Vec3([-0.5, -0.5, 0.5]));
        const v6 = cube_cen.copy().add(new Vec3([0.5, -0.5, 0.5]));
        const v7 = cube_cen.copy().add(new Vec3([0.5, -0.5, -0.5]));
        console.log('top face:');
        console.log('v0: ' + print.v3(v0));
        console.log('v1: ' + print.v3(v1));
        console.log('v2: ' + print.v3(v2));
        console.log('v3: ' + print.v3(v3));
        console.log('bot face:');
        console.log('v4: ' + print.v3(v4));
        console.log('v5: ' + print.v3(v5));
        console.log('v6: ' + print.v3(v6));
        console.log('v7: ' + print.v3(v7));
        // get projection results
        /* top face res */
        const r0 = this.point_line_projection(v0.copy(), cyl_line);
        const r1 = this.point_line_projection(v1.copy(), cyl_line);
        const r2 = this.point_line_projection(v2.copy(), cyl_line);
        const r3 = this.point_line_projection(v3.copy(), cyl_line);
        /* bottom face res */
        const r4 = this.point_line_projection(v4.copy(), cyl_line);
        const r5 = this.point_line_projection(v5.copy(), cyl_line);
        const r6 = this.point_line_projection(v6.copy(), cyl_line);
        const r7 = this.point_line_projection(v7.copy(), cyl_line);
        // calculate if player collider intersected with top face
        if (this.calc_int(r0, cylinder.radius, cyl_mid.copy(), cyl_line) ||
            this.calc_int(r1, cylinder.radius, cyl_mid.copy(), cyl_line) ||
            this.calc_int(r2, cylinder.radius, cyl_mid.copy(), cyl_line) ||
            this.calc_int(r3, cylinder.radius, cyl_mid.copy(), cyl_line)) {
            // player has intersected with top cube face
            int_top = true;
        }
        // calculate if player collider intersected with bottom face
        if (this.calc_int(r4, cylinder.radius, cyl_mid.copy(), cyl_line) ||
            this.calc_int(r5, cylinder.radius, cyl_mid.copy(), cyl_line) ||
            this.calc_int(r6, cylinder.radius, cyl_mid.copy(), cyl_line) ||
            this.calc_int(r7, cylinder.radius, cyl_mid.copy(), cyl_line)) {
            // player has intersected with bottom cube face
            int_bot = true;
        }
        // return if no intersection detected
        if (!int_top && !int_bot) {
            return [false, Vec3.zero];
        }
        // store how much to offset player to correct their pos
        let offset = Vec3.zero.copy();
        // if only intersecting top face
        if (int_top && !int_bot) {
            // determine if player end point height is greater than cube center
            if (cyl_line.get_end().y > cube_cen.y) {
                // move player up
                offset.add(new Vec3([0, Vec3.distance(r0[0], cyl_mid), 0]));
            }
        }
        // if only intersecting bottom face
        else if (!int_top && int_bot) {
            // determine if player end point height is less than cube center
            if (cyl_line.get_end().y < cube_cen.y) {
                // move player down
                offset.add(new Vec3([0, -Vec3.distance(r0[0], cyl_mid), 0]));
            }
        }
        // TODO move player xz
        return [true, offset.copy()];
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