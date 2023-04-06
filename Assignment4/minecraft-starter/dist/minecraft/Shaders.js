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

    float perlin(vec2 pos)
    {
        return pos.x + pos.y;
    }
    
    void main()
    {
        float sample = perlin(uv) * 0.5;
        vec3 kd = vec3(0.517647 + sample, 0.960784 + sample, 0.533333 + sample);
        vec3 ka = vec3(0.0, 0.0, 0.0);

        /* Compute light fall off */
        vec4 lightDirection = uLightPos - wsPos;
        float dot_nl = dot(normalize(lightDirection), normalize(normal));
	    dot_nl = clamp(dot_nl, 0.0, 1.0);
	
        gl_FragColor = vec4(clamp(ka + dot_nl * kd, 0.0, 1.0), 1.0);
    }
`;
//# sourceMappingURL=Shaders.js.map