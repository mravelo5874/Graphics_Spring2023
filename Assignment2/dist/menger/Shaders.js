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
        lightDir = lightPosition - vec4(vertPosition, 1.0);
		
        //  Pass along the vertex normal (world coordinates)
        normal = aNorm;
    }
`;
export let defaultFSText = `
    precision mediump float;

    varying vec4 lightDir;
    varying vec4 normal;    
    
    void main () 
    {    
        float abs_x = normal.x < 0.0 ? normal.x * -1.0 : normal.x;
        float abs_y = normal.y < 0.0 ? normal.y * -1.0 : normal.y;
        float abs_z = normal.z < 0.0 ? normal.z * -1.0 : normal.z;

        if (abs_x > abs_y && abs_x > abs_z)
        {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
            
        if (abs_y > abs_x && abs_y > abs_z)
        {
            gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
        }
            
        if (abs_z > abs_x && abs_z > abs_y)
        {
            gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
        }
    }
`;
// floor shaders
export let floorVSText = `
    precision mediump float;

    attribute vec3 vertPosition;
    attribute vec3 vertColor;
    attribute vec4 aNorm;
    
    varying vec4 lightDir;
    varying vec4 normal;
    varying vec4 world;
 
    uniform vec4 lightPosition;
    uniform mat4 mWorld;
    uniform mat4 mView;
	uniform mat4 mProj;

    void main() 
    {
		//  Convert vertex to camera coordinates and the NDC
        gl_Position = mProj * mView * mWorld * vec4 (vertPosition, 1.0);
        
        //  Compute light direction (world coordinates)
        lightDir = lightPosition - vec4(vertPosition, 1.0);
		
        //  Pass along the vertex normal (world coordinates)
        normal = aNorm;
        world = mWorld * vec4(vertPosition, 1.0);
    }
`;
export let floorFSText = `
    precision mediump float;

    varying vec4 lightDir;
    varying vec4 normal;
    varying vec4 world;

    float PI = 3.14159265359;
    float ONE_FIF = 1.0/5.0;
    
    void main() 
    {       
        vec4 res = sin(PI * world * ONE_FIF);

        if (res.x > 0.0 && res.z > 0.0 || res.x < 0.0 && res.z < 0.0)
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
        else
        {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
    }
`;
//# sourceMappingURL=Shaders.js.map