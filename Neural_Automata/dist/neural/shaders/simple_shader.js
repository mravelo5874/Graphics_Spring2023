export const simple_vertex = `
precision mediump float;
attribute vec2 a_pos;
varying vec2 v_pos;
void main()
{
    gl_Position = vec4(a_pos, 0.0, 1.0);
    v_pos = a_pos;
}
`;
export const simple_fragment = `
precision mediump float;
uniform vec4 u_color;
uniform sampler2D u_texture;
uniform float u_kernel[9];
uniform vec2 u_one_pixel;
uniform vec2 u_res;
varying vec2 v_pos;

float activation(float x)\n{\n\treturn x;\n}

float inverse_gaussian(float x)
{
    return -1.0/pow(2.0, (0.6*pow(x, 2.0))) + 1.0;
}

vec2 get_coords(vec2 coord, vec2 offset)
{
    return mod(coord + u_one_pixel * offset, 1.0);
}

void main()
{
    vec2 position = gl_FragCoord.xy / u_res.xy;

    float sum = 
          texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0, -1.0)) / u_res.xy).r * u_kernel[0]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0, -1.0)) / u_res.xy).r * u_kernel[1]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0, -1.0)) / u_res.xy).r * u_kernel[2]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0,  0.0)) / u_res.xy).r * u_kernel[3]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0,  0.0)) / u_res.xy).r * u_kernel[4]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0,  0.0)) / u_res.xy).r * u_kernel[5]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0,  1.0)) / u_res.xy).r * u_kernel[6]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0,  1.0)) / u_res.xy).r * u_kernel[7]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0,  1.0)) / u_res.xy).r * u_kernel[8];
    
    float x = inverse_gaussian(sum);
    gl_FragColor = vec4(x, x, x, 1.0);

    //gl_FragColor =  texture2D(u_texture, position);
}
`;
//# sourceMappingURL=simple_shader.js.map