import  Rand  from "../lib/rand-seed/Rand.js"

export class utils
{
    public static DEFAULT_ACTIVATION = `float activation(float x) {\n\treturn x;\n}`
    
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

    // must be used inside an async functions
    public static delay(ms: number) { return new Promise( resolve => setTimeout(resolve, ms))}

    public static generate_random_state(width, height)
    {
        let rng = new Rand((width * height).toString())
        let cells = new Uint8Array(height * width * 4)
        for(let i = 0; i < height*width*4; i+=4)
        {
            let r =  Math.floor(255 * rng.next())
            cells[i] = r
            cells[i+1] = r
            cells[i+2] = r
            cells[i+3] = 255
        }
        return cells;
    }

    public static generate_random_binary_state(width, height)
    {
        let rng = new Rand((width * height).toString())
        let cells = new Uint8Array(height * width * 4)
        for(let i = 0; i < height*width*4; i+=4)
        {
            let r = 0
            if (rng.next() > 0.5) r = 255
            cells[i] = r
            cells[i+1] = r
            cells[i+2] = r
            cells[i+3] = 255
        }
        return cells;
    }

    public static generate_random_kernel(min=-1, max=1, h_symmetry=false, v_symmetry=false, full_symmetry=false) 
    {
        let range = max - min;
        let kernel = new Float32Array(9);
    
        for (let i in kernel)
        {
            kernel[i] = Math.random()*range + min;
        }

		// if (full_symmetry)
		// 	kernel = this.fullSymmetry(kernel);
		// else
        // {
		// 	if (h_symmetry)
		// 		kernel = this.hSymmetry(kernel);
		// 	if (v_symmetry)
		// 		kernel = this.vSymmetry(kernel);
		// }
        return kernel;
    }
}