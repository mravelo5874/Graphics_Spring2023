import Rand from "../lib/rand-seed/Rand.js";
class utils {
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
    // must be used inside an async functions
    static delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
    static generate_random_state(width, height, seed) {
        let rng = new Rand(seed);
        let cells = new Uint8Array(height * width * 4);
        for (let i = 0; i < height * width * 4; i += 4) {
            let r = Math.floor(255 * rng.next());
            cells[i] = 0;
            cells[i + 1] = 0;
            cells[i + 2] = 0;
            cells[i + 3] = r;
        }
        return cells;
    }
    static generate_random_binary_state(width, height, seed) {
        let rng = new Rand(seed);
        let cells = new Uint8Array(height * width * 4);
        for (let i = 0; i < height * width * 4; i += 4) {
            let r = 0;
            if (rng.next() > 0.5)
                r = 255;
            cells[i] = 0;
            cells[i + 1] = 0;
            cells[i + 2] = 0;
            cells[i + 3] = r;
        }
        return cells;
    }
    static generate_empty_state(width, height) {
        let cells = new Uint8Array(height * width * 4);
        for (let i = 0; i < height * width * 4; i += 4) {
            cells[i] = 0;
            cells[i + 1] = 0;
            cells[i + 2] = 0;
            cells[i + 3] = 0;
        }
        return cells;
    }
}
utils.DEFAULT_ACTIVATION = `float activation(float x) {\n\treturn x;\n}`;
export { utils };
//# sourceMappingURL=utils.js.map