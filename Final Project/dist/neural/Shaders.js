//  RAY SHADERS //
export const ray_vertex_shader = `
    precision mediump float;

    attribute vec3 vertex_pos;
    attribute vec3 vertex_color;

    uniform mat4 world_mat;
    uniform mat4 proj_mat;
    uniform mat4 view_mat;

    varying vec3 ray_color;
    
    void main() 
    {
        gl_Position = proj_mat * view_mat * world_mat * vec4(vertex_pos, 1.0);
        ray_color = vertex_color; 
    }
`;
export const ray_fragment_shader = `
    precision mediump float;

    varying vec3 ray_color;

    void main()
    {
        gl_FragColor = vec4(ray_color, 1.0);
    }
`;
//  WATER 1 SHADERS //
export const water_1_vertex_shader = `
    precision mediump float;

    uniform mat4 world_mat;
    uniform mat4 proj_mat;
    uniform mat4 view_mat;

    attribute vec4 vertex_pos;
    attribute vec2 a_uv;
    attribute float a_time;
    

    varying vec2 uv;
    varying vec4 ws_pos;

    void main()
    {
        gl_Position = proj_mat * view_mat * world_mat * vertex_pos;
        uv = a_uv;
        ws_pos = vertex_pos;
    }
`;
export const water_1_fragment_shader = `
    precision mediump float;

    uniform vec4 light_pos;
    uniform float time;
    uniform vec2 u_offset;

    varying vec2 uv;
    varying vec4 ws_pos;

    float inverse_lerp(float p0, float p1, float val)
    {
        // clamp value to range if outside
        if (val > p1) return 1.0;
        else if (val < p0) return 0.0;
        // return t value
        return (val - p0) / (p1 - p0);
    }

    float smoothmix(float a0, float a1, float w) 
    {
        return (a1 - a0) * (3.0 - w * 2.0) * w * w + a0;
    }

    // return a random float value between 0 and 1 (i think ???)
    float random (vec2 pt, float seed) 
    {
        return fract(sin((seed + dot(pt.xy, vec2(12.9898,78.233))))*43758.5453123);
    }

    float not_as_random(vec2 pt, float seed)
    {
        return fract(sin((seed + dot(pt.xy, vec2(12.9898,12.233))))*0.7);
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

    float perlin(vec2 pos, float seed, float scale, float persistance, float lacunarity, vec3 _offset)
    {
        float amplitude = 1.0;
        float frequency = 1.0;
        float noise_height = 0.0;

        const int octs = 4;
        for (int i = 0; i < octs; i++)
        {
            float x = (pos.x + _offset.x + (_offset.y * 4.0)) / scale * frequency;
            float y = (pos.y + _offset.z + (_offset.y * 4.0)) / scale * frequency;
            float p = perlin_2d(x, y, seed) * 2.0 + 0.5;

            noise_height += p * amplitude;
            amplitude *= persistance;
            frequency *= lacunarity;
        }

        return noise_height;
    }

    void main()
    {
        float seed = 42.0;
        float scale = 0.04;
        float persistance = (sin(time * 0.001) * 0.1) + 0.5;

        float lacunarity = (cos(time * 0.00003) + 10.0);
        vec3 offset = vec3(time * 0.000005, 0.0, time * 0.000005);
        
        vec3 kd = vec3(0.086, 0.505, 0.792);
        float sample = perlin(uv, seed, scale, persistance, lacunarity, offset);
        if (sample >= 2.0)
        {
            kd = vec3(1.0, 1.0, 1.0);
        }
        else if (sample < 2.0 && sample > 1.6)
        {
            kd = vec3(0.718, 1.0, 0.984);
        }
        else if (sample < 1.6 && sample > 1.0)
        {
            kd = vec3(0.086, 0.505, 0.792);
        }
        
        vec3 ka = vec3(0.0, 0.0, 0.0);
        vec4 lightDirection = light_pos - ws_pos;
        vec4 normal = vec4(0.0, 1.0, 0.0, 0.0);
        float dot_nl = dot(normalize(lightDirection), normalize(normal));
	    dot_nl = clamp(dot_nl, 0.0, 1.0);
        gl_FragColor = vec4(clamp(ka + dot_nl * kd, 0.0, 1.0), 0.6);
    }
`;
//  CUBE SHADERS //
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
    varying vec3 offset;
    varying float height;

    void main () 
    {
        gl_Position = uProj * uView * (aVertPos + aOffset);
        wsPos = aVertPos + aOffset;
        normal = normalize(aNorm);
        uv = aUV;
        offset = vec3(aOffset.x, aOffset.y, aOffset.z);
    }
`;
export const blankCubeFSText = `
    precision mediump float;

    uniform vec4 uLightPos;
    
    varying vec4 normal;
    varying vec4 wsPos;
    varying vec2 uv;
    varying vec3 offset;

    float inverse_lerp(float p0, float p1, float val)
    {
        // clamp value to range if outside
        if (val > p1) return 1.0;
        else if (val < p0) return 0.0;
        // return t value
        return (val - p0) / (p1 - p0);
    }

    float smoothmix(float a0, float a1, float w) 
    {
        return (a1 - a0) * (3.0 - w * 2.0) * w * w + a0;
    }

    // return a random float value between 0 and 1 (i think ???)
    float random (vec2 pt, float seed) 
    {
        return fract(sin((seed + dot(pt.xy, vec2(12.9898,78.233))))*43758.5453123);
    }

    float not_as_random(vec2 pt, float seed)
    {
        return fract(sin((seed + dot(pt.xy, vec2(12.9898,12.233))))*0.7);
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

    float perlin(vec2 pos, float seed, float scale, float persistance, float lacunarity, vec3 _offset)
    {
        float amplitude = 1.0;
        float frequency = 1.0;
        float noise_height = 0.0;

        const int octs = 4;
        for (int i = 0; i < octs; i++)
        {
            float x = (pos.x + _offset.x + (_offset.y * 4.0)) / scale * frequency;
            float y = (pos.y + _offset.z + (_offset.y * 4.0)) / scale * frequency;
            float p = perlin_2d(x, y, seed) * 2.0 + 0.5;

            noise_height += p * amplitude;
            amplitude *= persistance;
            frequency *= lacunarity;
        }

        return noise_height;
    }
    
    void main()
    {
        float seed = 42.0;
        vec3 kd = vec3(0.0, 0.0, 0.0);
        vec3 ka = vec3(0.1, 0.1, 0.1);

        // set block noise based on height (offset.y) 
        float level_h = offset.y;

        float snow_level = 45.5;
        float stone_level = 35.5;
        float dirt_level = 20.5;
        float grass_0_level = 0.5;
        float grass_1_level = -5.5;
        float grass_2_level = -12.5;
        float grass_3_level = -20.5;

        // add transition layers between block layers
        float trans_layers = 12.0;
        level_h += floor(not_as_random(vec2(offset.x, offset.z), seed) * trans_layers);

        // snow block
        if (level_h > snow_level)
        {
            float scale = 0.25;
            float persistance = 0.2;
            float lacunarity = 1.0;
            
            float sample = perlin(uv, seed, scale, persistance, lacunarity, offset);
            sample = interpolate(-0.01, 0.01, sample);
            kd = vec3(0.99, 0.99, 0.99) + vec3(sample, sample, sample);
        }
        // stone block
        else if (level_h > stone_level)
        {
            float scale = 0.7;
            float persistance = 0.2;
            float lacunarity = 5.0;

            float sample = perlin(uv, seed, scale, persistance, lacunarity, offset);
            sample = interpolate(-0.05, 0.05, sample); 
            kd = vec3(0.639, 0.639, 0.639) + vec3(sample*0.94, sample*1.03, sample*1.13);
        }
        // dirt block
        else if (level_h > dirt_level)
        {
            float scale = 0.1;
            float persistance = 0.0;
            float lacunarity = 5.0;

            float sample = perlin(uv, seed, scale, persistance, lacunarity, offset);
            sample = interpolate(-0.1, 0.1, sample); 
            kd = vec3(0.349, 0.325, 0.267) + vec3(sample*1.244, sample*1.03, sample*0.972);
        }
        // grass 0 block
        else if (level_h > grass_0_level)
        {
            float scale = 0.5;
            float persistance = 1.5;
            float lacunarity = 2.0;

            float sample = perlin(uv, seed, scale, persistance, lacunarity, offset);
            sample = interpolate(-0.1, 0.1, sample);
            kd = vec3(0.247, 0.322, 0.192) + sample;
        }
        // grass 1 block
        else if (level_h > grass_1_level)
        {
            float scale = 0.5;
            float persistance = 1.5;
            float lacunarity = 2.0;

            float sample = perlin(uv, seed, scale, persistance, lacunarity, offset);
            sample = interpolate(-0.2, 0.2, sample);
            kd = vec3(0.322, 0.412, 0.255) + sample;
        }
        // grass 2 block
        else if (level_h > grass_2_level)
        {
            float scale = 0.5;
            float persistance = 1.5;
            float lacunarity = 2.0;

            float sample = perlin(uv, seed, scale, persistance, lacunarity, offset);
            sample = interpolate(-0.2, 0.2, sample);
            kd = vec3(0.4, 0.502, 0.329) + sample;
        }
        // grass 3 block
        else if (level_h > grass_3_level)
        {
            float scale = 0.5;
            float persistance = 1.5;
            float lacunarity = 2.0;

            float sample = perlin(uv, seed, scale, persistance, lacunarity, offset);
            sample = interpolate(-0.2, 0.2, sample);
            kd = vec3(0.51, 0.631, 0.42) + sample;
        }
        // sand block
        else
        {
            float scale = 0.7;
            float persistance = 1.0;
            float lacunarity = 5.0;

            float sample = perlin(uv, seed, scale, persistance, lacunarity, offset);
            sample = interpolate(-0.05, 0.05, sample);
            kd = vec3(1.0, 0.941, 0.816) + vec3(sample, sample*1.5, sample*1.5);
        }
        

        /* Compute light fall off */
        vec4 lightDirection = uLightPos - wsPos;
        float dot_nl = dot(normalize(lightDirection), normalize(normal));
	    dot_nl = clamp(dot_nl, 0.3, 1.0);
	
        gl_FragColor = vec4(clamp(ka + dot_nl * kd, 0.1, 1.0), 1.0);
    }
`;
//# sourceMappingURL=Shaders.js.map