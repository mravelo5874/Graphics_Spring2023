precision mediump float;

    uniform vec4 uLightPos;
    
    varying vec4 normal;
    varying vec4 wsPos;
    varying vec2 uv;

    float mask = 255.0;
    int hash[512] = {
        151,160,137, 91, 90, 15,131, 13,201, 95, 96, 53,194,233,  7,225,
        140, 36,103, 30, 69,142,  8, 99, 37,240, 21, 10, 23,190,  6,148,
        247,120,234, 75,  0, 26,197, 62, 94,252,219,203,117, 35, 11, 32,
            57,177, 33, 88,237,149, 56, 87,174, 20,125,136,171,168, 68,175,
            74,165, 71,134,139, 48, 27,166, 77,146,158,231, 83,111,229,122,
            60,211,133,230,220,105, 92, 41, 55, 46,245, 40,244,102,143, 54,
            65, 25, 63,161,  1,216, 80, 73,209, 76,132,187,208, 89, 18,169,
        200,196,135,130,116,188,159, 86,164,100,109,198,173,186,  3, 64,
            52,217,226,250,124,123,  5,202, 38,147,118,126,255, 82, 85,212,
        207,206, 59,227, 47, 16, 58, 17,182,189, 28, 42,223,183,170,213,
        119,248,152,  2, 44,154,163, 70,221,153,101,155,167, 43,172,  9,
        129, 22, 39,253, 19, 98,108,110, 79,113,224,232,178,185,112,104,
        218,246, 97,228,251, 34,242,193,238,210,144, 12,191,179,162,241,
            81, 51,145,235,249, 14,239,107, 49,192,214, 31,181,199,106,157,
        184, 84,204,176,115,121, 50, 45,127,  4,150,254,138,236,205, 93,
        222,114, 67, 29, 24, 72,243,141,128,195, 78, 66,215, 61,156,180,

        151,160,137, 91, 90, 15,131, 13,201, 95, 96, 53,194,233,  7,225,
        140, 36,103, 30, 69,142,  8, 99, 37,240, 21, 10, 23,190,  6,148,
        247,120,234, 75,  0, 26,197, 62, 94,252,219,203,117, 35, 11, 32,
            57,177, 33, 88,237,149, 56, 87,174, 20,125,136,171,168, 68,175,
            74,165, 71,134,139, 48, 27,166, 77,146,158,231, 83,111,229,122,
            60,211,133,230,220,105, 92, 41, 55, 46,245, 40,244,102,143, 54,
            65, 25, 63,161,  1,216, 80, 73,209, 76,132,187,208, 89, 18,169,
        200,196,135,130,116,188,159, 86,164,100,109,198,173,186,  3, 64,
            52,217,226,250,124,123,  5,202, 38,147,118,126,255, 82, 85,212,
        207,206, 59,227, 47, 16, 58, 17,182,189, 28, 42,223,183,170,213,
        119,248,152,  2, 44,154,163, 70,221,153,101,155,167, 43,172,  9,
        129, 22, 39,253, 19, 98,108,110, 79,113,224,232,178,185,112,104,
        218,246, 97,228,251, 34,242,193,238,210,144, 12,191,179,162,241,
            81, 51,145,235,249, 14,239,107, 49,192,214, 31,181,199,106,157,
        184, 84,204,176,115,121, 50, 45,127,  4,150,254,138,236,205, 93,
        222,114, 67, 29, 24, 72,243,141,128,195, 78, 66,215, 61,156,180};

    float random (in vec2 pt, in float seed) 
    {
        return fract(sin((seed + dot(pt.xy, vec2(12.9898,78.233))))*43758.5453123);
    }

    float perlin_2d(vec2 sample, float freq)
    {
        

        vec2 value = sample * freq;

        int ix0 = floor(value.x);
        int iy0 = floor(value.y);

        float tx0 = value.x - float(ix0);
        float ty0 = value.y - float(iy0);

        ix0 &= mask;
        iy0 &= mask;

        int ix1 = ix0 + 1;
        int iy1 = iy0 + 1;

        int h0 = hash[ix0];
        int h1 = hash[ix1];

        return 0.0;
    }

    float perlin (vec2 pos, float seed, float freq, float scale, float persistance, float lacunarity, vec2 offset)
    {
        //return pos.x + pos.y;

        float cell_ampl = 1.0;
        float cell_freq = 1.0;
        float noise_height = 0.0;

        // manual set half the size
        float half_w = 16.0;

        float max_noise = -999.0;
        float min_noise = 999.0;

        // manually set octaves
        int octaves = 3;
        for (int i = 0; i < octaves; i++)
        {
            float sample_x = (pos.x - half_w + offset.x) / scale * cell_freq;
            float sample_y = (pos.t - half_w + offset.t) / scale * cell_freq;
            float value = perlin_2d(vec2(sample_x, sample_y), cell_freq) * 2.0 - 1.0;
            noise_height += value * cell_ampl;

            cell_ampl *= persistance;
            cell_freq *= lacunarity;
        }

        if (noise_height > max_noise)
        {
            max_noise = noise_height;
        }
        else if (noise_height < min_noise)
        {
            min_noise = noise_height;
        }
        return noise_height;
    }
    
    void main()
    {
        float seed = 42.0;
        float freq = 1.0;
        float scale = 50.0;
        float persistance = 0.5;
        float lacunarity = 0.2;
        vec2 offset = vec2(0.0, 0.0);

        float sample = perlin(uv, seed, freq, scale, persistance, lacunarity, offset) * 0.5;
        vec3 kd = vec3(0.517647 + sample, 0.960784 + sample, 0.533333 + sample);
        vec3 ka = vec3(0.0, 0.0, 0.0);

        /* Compute light fall off */
        vec4 lightDirection = uLightPos - wsPos;
        float dot_nl = dot(normalize(lightDirection), normalize(normal));
	    dot_nl = clamp(dot_nl, 0.0, 1.0);
	
        gl_FragColor = vec4(clamp(ka + dot_nl * kd, 0.0, 1.0), 1.0);
    }