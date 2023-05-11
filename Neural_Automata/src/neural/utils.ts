import  Rand  from "../lib/rand-seed/Rand.js"
import { Vec2, Vec3 } from '../lib/TSM.js'

export class utils
{
    public static SQRT2: number = 1.41421356237
    public static DIGITS: number = 3

    public static v3(v: Vec3, d: number = this.DIGITS) : string { return v.x.toFixed(d) + ', ' + v.y.toFixed(d) + ', ' + v.z.toFixed(d) }
    public static v2(v: Vec2, d: number = this.DIGITS) : string { return v.x.toFixed(d) + ', ' + v.y.toFixed(d) }
    public static num3x3(k: number[][][], d: number = this.DIGITS)
    {
        console.log('num3x3:')
        /* FACE 1 */
        // row 1
        console.log('f1-r1: ' + k[0][0][0].toFixed(d) + ', ' + k[1][0][0].toFixed(d) + ', ' + k[2][0][0].toFixed(d))
        // row 2
        console.log('f1-r2: ' + k[0][1][0].toFixed(d) + ', ' + k[1][1][0].toFixed(d) + ', ' + k[2][1][0].toFixed(d))
        // row 3
        console.log('f1-r3: ' + k[0][2][0].toFixed(d) + ', ' + k[1][2][0].toFixed(d) + ', ' + k[2][2][0].toFixed(d))
        /* FACE 2 */
        // row 1
        console.log('f2-r1: ' + k[0][0][1].toFixed(d) + ', ' + k[1][0][1].toFixed(d) + ', ' + k[2][0][1].toFixed(d))
        // row 2
        console.log('f2-r2: ' + k[0][1][1].toFixed(d) + ', ' + k[1][1][1].toFixed(d) + ', ' + k[2][1][1].toFixed(d))
        // row 3
        console.log('f2-r3: ' + k[0][2][1].toFixed(d) + ', ' + k[1][2][1].toFixed(d) + ', ' + k[2][2][1].toFixed(d))
        /* FACE 3 */
        // row 1
        console.log('f3-r1: ' + k[0][0][2].toFixed(d) + ', ' + k[1][0][2].toFixed(d) + ', ' + k[2][0][2].toFixed(d))
        // row 2
        console.log('f3-r2: ' + k[0][1][2].toFixed(d) + ', ' + k[1][1][2].toFixed(d) + ', ' + k[2][1][2].toFixed(d))
        // row 3
        console.log('f3-r3: ' + k[0][2][2].toFixed(d) + ', ' + k[1][2][2].toFixed(d) + ', ' + k[2][2][2].toFixed(d))
    }
    
    // thanks to chatgpt: 'create a function that interpolates between two numbers given a t value' 
    public static lerp(p0: number, p1: number, t: number): number
    {
        // make sure t is clamped between 0 and 1
        if (t > 1) t = 1
        if (t < 0) t = 0
        // return interpolated value
        return (1 - t) * p0 + t * p1
    }

    // thanks to chatgpt: 'can you now write a function that performs inverse interpolation between 
    // two numbers given two numbers and a number in their range'
    public static inverse_lerp(p0: number, p1: number, val: number): number
    {
        // clamp value to range if outside
        if (val > p1) return 1
        else if (val < p0) return 0
        // return t value
        return (val - p0) / (p1 - p0)
    }

    public static smooth(t: number): number
    {
        return t * t * t * (t * (t * 6 - 15) + 10)
    }

    // must be used inside an async functions
    public static delay(ms: number) { return new Promise( resolve => setTimeout(resolve, ms))}

    public static clamp01(val: number)
    {
        if (val > 1) return 1
        if (val < 0) return 0
        return val
    }

    public static generate_random_alpha_state(width, height, seed)
    {
        let rng = new Rand(seed)
        let cells = new Uint8Array(height * width * 4)
        for(let i = 0; i < height*width*4; i+=4)
        {
            let r =  Math.floor(255 * rng.next())
            cells[i] = 0
            cells[i+1] = 0
            cells[i+2] = 0
            cells[i+3] = r
        }
        return cells;
    }

    public static generate_random_rgb_state(width, height, seed)
    {
        let rng = new Rand(seed)
        let cells = new Uint8Array(height * width * 4)
        for(let i = 0; i < height*width*4; i+=4)
        {
            let r =  Math.floor(255 * rng.next())
            let g =  Math.floor(255 * rng.next())
            let b =  Math.floor(255 * rng.next())
            cells[i] = r
            cells[i+1] = g
            cells[i+2] = b
            cells[i+3] = 255
        }
        return cells;
    }

    public static generate_random_binary_state(width, height, seed)
    {
        let rng = new Rand(seed)
        let cells = new Uint8Array(height * width * 4)
        for(let i = 0; i < height*width*4; i+=4)
        {
            let r = 0
            if (rng.next() > 0.5) r = 255
            cells[i] = 0
            cells[i+1] = 0
            cells[i+2] = 0
            cells[i+3] = r
        }
        return cells;
    }

    public static generate_empty_state(width, height)
    {
        let cells = new Uint8Array(height * width * 4)
        for(let i = 0; i < height*width*4; i+=4)
        {
            cells[i] = 0
            cells[i+1] = 0
            cells[i+2] = 0
            cells[i+3] = 0
        }
        return cells;
    }
}