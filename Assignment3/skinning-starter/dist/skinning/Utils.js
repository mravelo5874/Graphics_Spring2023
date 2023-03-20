export class Ray {
    constructor(_origin, _direction) {
        this.origin = _origin;
        this.direction = _direction;
    }
    print() {
        return '{origin: ' + Ray.Vec3toFixed(this.origin, 3) + ', direction: ' + Ray.Vec3toFixed(this.direction, 3) + '}';
    }
    // used to print a Vec3 with rounded float values
    static Vec3toFixed(vec, digits) {
        return vec.x.toFixed(digits) + ', ' + vec.y.toFixed(digits) + ', ' + vec.z.toFixed(digits);
    }
}
export class Cylinder {
    constructor(_start_point, _end_point, _radius) {
        this.start_point = _start_point;
        this.end_point = _end_point;
        this.radius = _radius;
    }
    // checks if the ray intersects this cyliner and returns t value at intersection
    ray_interset(ray) {
        // TODO this
        return [false, -1];
    }
}
//# sourceMappingURL=Utils.js.map