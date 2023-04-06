export const blankCubeVSText = `
    precision mediump float;

    uniform vec4 uLightPos;    
    uniform mat4 uView;
    uniform mat4 uProj;
    
    attribute vec4 aNorm;
    attribute vec4 aVertPos;
    attribute vec4 aOffset;
    attribute vec2 aUV;
    
    varying vec4 normal;
    varying vec4 wsPos;
    varying vec2 uv;

    void main () 
    {
        gl_Position = uProj * uView * (aVertPos + aOffset);
        wsPos = aVertPos + aOffset;
        normal = normalize(aNorm);
        uv = aUV;
    }
`;
export const blankCubeFSText = `
    precision mediump float;

    uniform vec4 uLightPos;
    
    varying vec4 normal;
    varying vec4 wsPos;
    varying vec2 uv;

    float smoothmix(float a0, float a1, float w) 
    {
        return (a1 - a0) * (3.0 - w * 2.0) * w * w + a0;
    }

    // return a random float value between 0 and 1 (i think ???)
    float random (vec2 pt, float seed) 
    {
        return fract(sin((seed + dot(pt.xy, vec2(12.9898,78.233))))*43758.5453123);
    }

    // returns a random unit vector
    vec2 rand_unit_vec(vec2 xy, float seed) 
    {
        float theta = 6.28318530718*random(xy, seed);
        return vec2(cos(theta), sin(theta));
    }

    // linearly interpolate between two numbers
    float interpolate(float a0, float a1, float t)
    {   
        if (0.0 > t) return a0;
        if (1.0 < t) return a1;

        return smoothmix(a0, a1, t);
    }

    // compute the dot product of the distance and grad vectors
    float dot_grid_grad(int ix, int iy, float x, float y, float seed)
    {
        // get the gradient from integer coords
        vec2 pos = vec2(float(ix), float(iy));
        vec2 grad = rand_unit_vec(pos, seed);

        // compute distance vector
        float dx = x - float(ix);
        float dy = y - float(iy);

        // compute and return dot product
        return (dx*grad.x + dy*grad.y);
    }

    float perlin_2d(float x, float y, float seed)
    {
        // determine grid cell coords
        int x0 = int(floor(x));
        int x1 = x0 + 1;
        int y0 = int(floor(y));
        int y1 = y0 + 1;

        // determine interpolation weights
        float sx = x - float(x0);
        float sy = y - float(y0);

        // interpolate between grid values
        float n0, n1, ix0, ix1, value;

        n0 = dot_grid_grad(x0, y0, x, y, seed);
        n1 = dot_grid_grad(x1, y0, x, y, seed);
        ix0 = interpolate(n0, n1, sx);

        n0 = dot_grid_grad(x0, y1, x, y, seed);
        n1 = dot_grid_grad(x1, y1, x, y, seed);
        ix1 = interpolate(n0, n1, sx);

        value = interpolate(ix0, ix1, sy);
        return value;
    }

    float perlin(vec2 pos, float seed, float scale, float persistance, float lacunarity)
    {
        float amplitude = 1.0;
        float frequency = 1.0;
        float noise_height = 0.0;

        const int octs = 4;
        for (int i = 0; i < octs; i++)
        {
            float x = pos.x / scale * frequency;
            float y = pos.y / scale * frequency;
            float p = perlin_2d(x, y, seed) * 2.0 + 0.5;

            noise_height += p * amplitude;
            amplitude *= persistance;
            frequency *= lacunarity;
        }

        return noise_height;
    }
    
    void main()
    {
        float scale = 0.2;
        float persistance = 0.5;
        float lacunarity = 2.0;
        float seed = 42.0;

        float sample = perlin(uv, seed, scale, persistance, lacunarity);
        //vec3 kd = vec3(0.517647 - sample, 0.960784 - sample, 0.533333 - sample);
        vec3 kd = vec3(sample, sample, sample);
        vec3 ka = vec3(0.0, 0.0, 0.0);

        /* Compute light fall off */
        vec4 lightDirection = uLightPos - wsPos;
        float dot_nl = dot(normalize(lightDirection), normalize(normal));
	    dot_nl = clamp(dot_nl, 0.0, 1.0);
	
        gl_FragColor = vec4(clamp(ka + dot_nl * kd, 0.0, 1.0), 1.0);
    }
`;
//# sourceMappingURL=Shaders.js.map