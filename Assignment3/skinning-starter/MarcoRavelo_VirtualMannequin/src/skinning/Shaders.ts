export const floorVSText = `
    precision mediump float;

    uniform vec4 uLightPos;
    uniform mat4 uWorld;
    uniform mat4 uView;
    uniform mat4 uProj;
    
    attribute vec4 aVertPos;

    varying vec4 vClipPos;

    void main () {

        gl_Position = uProj * uView * uWorld * aVertPos;
        vClipPos = gl_Position;
    }
`;

export const floorFSText = `
    precision mediump float;

    uniform mat4 uViewInv;
    uniform mat4 uProjInv;
    uniform vec4 uLightPos;

    varying vec4 vClipPos;

    void main() {
        vec4 wsPos = uViewInv * uProjInv * vec4(vClipPos.xyz/vClipPos.w, 1.0);
        wsPos /= wsPos.w;
        /* Determine which color square the position is in */
        float checkerWidth = 5.0;
        float i = floor(wsPos.x / checkerWidth);
        float j = floor(wsPos.z / checkerWidth);
        vec3 color = mod(i + j, 2.0) * vec3(1.0, 1.0, 1.0);

        /* Compute light fall off */
        vec4 lightDirection = uLightPos - wsPos;
        float dot_nl = dot(normalize(lightDirection), vec4(0.0, 1.0, 0.0, 0.0));
	    dot_nl = clamp(dot_nl, 0.0, 1.0);
	
        gl_FragColor = vec4(clamp(dot_nl * color, 0.0, 1.0), 1.0);
    }
`;

export const sceneVSText = `
    precision mediump float;

    attribute vec3 vertPosition;
    attribute vec2 aUV;
    attribute vec3 aNorm;
    attribute vec4 skinIndices;
    attribute vec4 skinWeights;
    attribute vec4 v0;
    attribute vec4 v1;
    attribute vec4 v2;
    attribute vec4 v3;
    
    varying vec4 lightDir;
    varying vec2 uv;
    varying vec4 normal;
 
    uniform vec4 lightPosition;
    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProj;

    uniform mat4 D_mats[64];
    //uniform mat4 U_mats[64];

    uniform vec3 jTrans[64];
    uniform vec4 jRots[64];

    // linear-blend skinning!
    vec3 linear_blend_skinning()
    {
        vec3 sum = vec3(0.0, 0.0, 0.0);
        for (int i = 0; i < 4; i++)
        {
            // get matrix
            int index = int(skinIndices[i]);
            mat4 Di = D_mats[index];

            // get correct position
            vec4 v = vec4(0.0, 0.0, 0.0, 1.0);
            if (i == 0)
            {
                v = vec4(v0);
            }
            else if (i == 1)
            {
                v = vec4(v1);
            }
            else if (i == 2)
            {
                v = vec4(v2);
            }
            else if (i == 3)
            {
                v = vec4(v3);
            }

            // calculate sum
            float w = skinWeights[i];
            vec4 c = Di * v;
            c *= w;
            sum.x += c.x;
            sum.y += c.y;
            sum.z += c.z;
        }
        return sum;
    }

    void main () 
    {
        vec3 trans = linear_blend_skinning();
        vec4 worldPosition = mWorld * vec4(trans, 1.0);
        gl_Position = mProj * mView * worldPosition;
        
        //  Compute light direction and transform to camera coordinates
        lightDir = lightPosition - worldPosition;
        
        vec4 aNorm4 = vec4(aNorm, 0.0);
        normal = normalize(mWorld * vec4(aNorm, 0.0));

        uv = aUV;
    }

`;

export const sceneFSText = `
    precision mediump float;

    varying vec4 lightDir;
    varying vec2 uv;
    varying vec4 normal;

    void main () {
        gl_FragColor = vec4((normal.x + 1.0)/2.0, (normal.y + 1.0)/2.0, (normal.z + 1.0)/2.0,1.0);
    }
`;

export const skeletonVSText = `
    precision mediump float;

    attribute vec3 vertPosition;
    attribute float boneIndex;
    
    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProj;

    uniform vec3 bTrans[64];
    uniform vec4 bRots[64];


    vec3 qtrans(vec4 q, vec3 v) {
        return v + 2.0 * cross(cross(v, q.xyz) - q.w*v, q.xyz);
    }

    void main () {
        int index = int(boneIndex);
        gl_Position = mProj * mView * mWorld * vec4(bTrans[index] + qtrans(bRots[index], vertPosition), 1.0);
    }
`;

export const skeletonFSText = `
    precision mediump float;

    void main () 
    {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
`;

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

export const hex_fragment_shader = `
    precision mediump float;

    varying vec3 ray_color;

    void main()
    {
        gl_FragColor = vec4(ray_color, 1.0);
    }
`;

export const hex_vertex_shader = `
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

export const sBackVSText = `
    precision mediump float;

    attribute vec2 vertPosition;

    varying vec2 uv;

    void main() {
        gl_Position = vec4(vertPosition, 0.0, 1.0);
        uv = vertPosition;
        uv.x = (1.0 + uv.x) / 2.0;
        uv.y = (1.0 + uv.y) / 2.0;
    }
`;

export const sBackFSText = `
    precision mediump float;

    varying vec2 uv;

    void main () {
        gl_FragColor = vec4(0.1, 0.1, 0.1, 1.0);
        if (abs(uv.y-.33) < .005 || abs(uv.y-.67) < .005) {
            gl_FragColor = vec4(1, 1, 1, 1);
        }
    }

`;