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
export class Ray {
    get_origin() { return new Vec3(this.origin.xyz); }
    get_direction() { return new Vec3(this.direction.xyz).normalize(); }
    constructor(_origin, _direction) {
        this.origin = _origin.copy();
        this.direction = _direction.copy();
    }
    copy() {
        return new Ray(this.origin.copy(), this.direction.copy());
    }
    print() {
        return '{origin: ' + print.v3(this.origin, 3) + ', direction: ' + print.v3(this.direction, 3) + '}';
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
    static magnitude(v) {
        const a = v.at(0) * v.at(0);
        const b = v.at(1) * v.at(1);
        const c = v.at(2) * v.at(2);
        let res = a + b + c;
        res = Math.sqrt(res);
        return res;
    }
    // thanks to chatgpt: 'create a function that interpolates between two numbers given a t value' 
    static lerp(p0, p1, t) {
        // make sure t is clamped between 0 and 1
        if (t > 1)
            t = 1;
        if (t < 0)
            t = 0;
        // return interpolated value
        return (1 - t) * p0 + t * p1;
    }
    // thanks to chatgpt: 'can you now write a function that performs inverse interpolation between 
    // two numbers given two numbers and a number in their range'
    static inverse_lerp(p0, p1, val) {
        // clamp value to range if outside
        if (val > p1)
            return 1;
        else if (val < p0)
            return 0;
        // return t value
        return (val - p0) / (p1 - p0);
    }
    // thanks to chatgpt: can you write a function that returns the two perpendicular 2d vectors 
    // when given a single 2d vector.
    static perpendiculars(vec) {
        const x = vec.x;
        const y = vec.y;
        if (x == 0) {
            // If the x-coordinate is zero, the first perpendicular vector has an x-coordinate of 1
            // and the second perpendicular vector has an x-coordinate of -1.
            return [new Vec2([1, 0]), new Vec2([-1, 0])];
        }
        else if (y == 0) {
            // If the y-coordinate is zero, the first perpendicular vector has a y-coordinate of 1
            // and the second perpendicular vector has a y-coordinate of -1.
            return [new Vec2([0, 1]), new Vec2([0, -1])];
        }
        // For other vectors, we use the fact that the dot product of two perpendicular vectors is 0.
        // We solve for one coordinate and set the other coordinate to 1 or -1, as appropriate.
        let perp1 = [1, -x / y];
        let perp_norm = Math.pow((Math.pow(perp1[0], 2) + Math.pow(perp1[1], 2)), 0.5);
        perp1[0] /= perp_norm;
        perp1[1] /= perp_norm;
        let perp2 = [-1, x / y];
        perp_norm = Math.pow((Math.pow(perp2[0], 2) + Math.pow(perp2[1], 2)), 0.5);
        perp2[0] /= perp_norm;
        perp2[1] /= perp_norm;
        return [new Vec2([perp1[0], perp1[1]]).normalize(), new Vec2([perp2[0], perp2[1]]).normalize()];
    }
    // thanks to chatgpt: write a function which projects a 2d vector onto another 2d vector. this 
    // should return a 2d vector.
    static project_2d_vector(v, p) {
        let length = Math.pow(v.x, 2) + Math.pow(v.y, 2);
        if (length == 0) {
            return Vec2.zero.copy();
        }
        let dot = Vec2.dot(v, p);
        let scalar = dot / length;
        return new Vec2([scalar * p.x, scalar * p.y]).normalize();
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
        // no offset
        return false;
    }
    static aabb_collision(a, b) {
        return (a.min.x + a.pos.x <= b.max.x + b.pos.x &&
            a.max.x + a.pos.x >= b.min.x + b.pos.x &&
            a.min.y + a.pos.y <= b.max.y + b.pos.y &&
            a.max.y + a.pos.y >= b.min.y + b.pos.y &&
            a.min.z + a.pos.z <= b.max.z + b.pos.z &&
            a.max.z + a.pos.z >= b.min.z + b.pos.z);
    }
    static flatten_2d_array(array, size) {
        let flat_array = new Array();
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                flat_array.push(array[x][y]);
            }
        }
        return flat_array;
    }
}
_a = Utils;
Utils.CHUNK_SIZE = 64;
Utils.HALF_CHUNK_SIZE = _a.CHUNK_SIZE / 2;
Utils.NUM_ADJ_CHUNKS = 8;
Utils.GRAVITY = new Vec3([0.0, -9.8, 0.0]);
Utils.CUBE_LEN = 1;
Utils.PLAYER_RADIUS = 0.1;
Utils.PLAYER_HEIGHT = 2;
Utils.SQRT2 = 1.41421356237;
export { Utils };
//# sourceMappingURL=Utils.js.map