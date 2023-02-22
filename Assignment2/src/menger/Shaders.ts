export let defaultVSText = `
    precision mediump float;

    attribute vec3 vertPosition;
    attribute vec3 vertColor;
    attribute vec4 aNorm;
    
    varying vec4 lightDir;
    varying vec4 normal;   
 
    uniform vec4 lightPosition;
    uniform mat4 mWorld;
    uniform mat4 mView;
	uniform mat4 mProj;

    void main () 
    {
		//  Convert vertex to camera coordinates and the NDC
        gl_Position = mProj * mView * mWorld * vec4 (vertPosition, 1.0);
        
        //  Compute light direction (world coordinates)
        vec4 frag_pos = vec4(mWorld * vec4(vertPosition, 1.0));
        lightDir = lightPosition - frag_pos;
		
        //  Pass along the vertex normal (world coordinates)
        normal = aNorm;
    }
`;


export let defaultFSText = 
`
    precision mediump float;

    varying vec4 lightDir;
    varying vec4 normal;    

    vec3 LIGHT_COLOR = vec3(1.0, 1.0, 1.0);
    vec3 RED = vec3(1.0, 0.0, 0.0);
    vec3 GREEN = vec3(0.0, 1.0, 0.0);
    vec3 BLUE = vec3(0.0, 0.0, 1.0);
    
    void main () 
    {    
        // PHONG ILLUMINATION
        vec3 norm_vec = normalize(vec3(normal.x, normal.y, normal.z));
        vec3 norm_abs = abs(norm_vec);
        vec3 light_vec = normalize(vec3(lightDir.x, lightDir.y, lightDir.z));
        float diff = max(dot(light_vec, norm_vec), 0.0);
        vec3 diffuse = diff * LIGHT_COLOR;

        if (norm_abs.x > norm_abs.y && norm_abs.x > norm_abs.z)
        {
            vec3 color = RED * diffuse;
            gl_FragColor = vec4(color.x, color.y, color.z, 1.0);
        }
            
        if (norm_abs.y > norm_abs.x && norm_abs.y > norm_abs.z)
        {
            vec3 color = GREEN * diffuse;
            gl_FragColor = vec4(color.x, color.y, color.z, 1.0);
        }
            
        if (norm_abs.z > norm_abs.x && norm_abs.z > norm_abs.y)
        {
            vec3 color = BLUE * diffuse;
            gl_FragColor = vec4(color.x, color.y, color.z, 1.0);
        }
    }
`;




// floor shaders

export let floorVSText = 
`
    precision mediump float;

    attribute vec3 vertPosition;
    attribute vec3 vertColor;
    attribute vec4 aNorm;
    
    varying vec4 lookDir;
    varying vec4 lightDir;
    varying vec4 normal;
    varying vec4 worldPos;
 
    uniform vec4 vLook;
    uniform vec4 lightPosition;
    uniform mat4 mWorld;
    uniform mat4 mView;
	uniform mat4 mProj;

    void main() 
    {
		//  Convert vertex to camera coordinates and the NDC
        gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
        
        //  Compute light direction (world coordinates)
        vec4 frag_pos = vec4(mWorld * vec4(vertPosition, 1.0));
        lightDir = lightPosition - frag_pos;
		
        //  Pass along the vertex normal (world coordinates)
        normal = aNorm;

        // pass along world position
        worldPos = mWorld * vec4(vertPosition, 1.0);

        // pass along the look direction
        lookDir = vLook;
    }
`;

export let floorFSText = 
`
    precision mediump float;

    varying vec4 lookDir;
    varying vec4 lightDir;
    varying vec4 normal;
    varying vec4 worldPos;

    float PI = 3.14159265359;
    float ONE_FIF = 1.0/5.0;
    vec3 LIGHT_COLOR = vec3(1.0, 1.0, 1.0);
    vec3 WHITE = vec3(1.0, 1.0, 1.0);
    vec3 BLACK = vec3(0.0, 0.0, 0.0);

    void main() 
    {       
        // CHESS COLOUR ?
        vec4 chess_calc = sin(PI * worldPos * ONE_FIF);
        bool chess_black = chess_calc.x > 0.0 && chess_calc.z > 0.0 || chess_calc.x < 0.0 && chess_calc.z < 0.0;

        // PHONG ILLUMINATION
        vec3 norm_vec = normalize(vec3(normal.x, normal.y, normal.z));
        vec3 light_vec = normalize(vec3(lightDir.x, lightDir.y, lightDir.z));
        float diff = max(dot(light_vec, norm_vec), 0.0);
        vec3 diffuse = diff * LIGHT_COLOR;

        if (chess_black)
        {
            vec3 color = BLACK * diffuse;
            gl_FragColor = vec4(color.x, color.y, color.z, 1.0);
        }
        else
        {
            vec3 color = WHITE * diffuse;
            gl_FragColor = vec4(color.x, color.y, color.z, 1.0);
        }
    }
`;

