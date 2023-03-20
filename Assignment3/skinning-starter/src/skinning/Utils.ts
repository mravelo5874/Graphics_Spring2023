import { Vec3 } from "../lib/TSM.js";


export class Ray
{
    origin : Vec3
    direction : Vec3

    constructor(_origin : Vec3, _direction : Vec3)
    {
        this.origin = _origin
        this.direction = _direction
    }

    public print()
    {
        return '{origin: ' + Ray.Vec3toFixed(this.origin, 3) + ', direction: ' + Ray.Vec3toFixed(this.direction, 3) + '}'
    }

    // used to print a Vec3 with rounded float values
    public static Vec3toFixed(vec : Vec3, digits : number)
    {
        return vec.x.toFixed(digits) + ', ' + vec.y.toFixed(digits) + ', ' + vec.z.toFixed(digits)
    }
}

export class Cylinder
{
    start_point : Vec3
    end_point : Vec3
    radius : number

    constructor(_start_point : Vec3, _end_point : Vec3, _radius : number)
    {
        this.start_point = _start_point
        this.end_point = _end_point
        this.radius = _radius
    }
    
    // checks if the ray intersects this cyliner and returns t value at intersection
    public ray_interset(ray : Ray) : [boolean, number]
    {
        // TODO this
        return [false, -1]
    }
}