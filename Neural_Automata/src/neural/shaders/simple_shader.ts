export const simple_vertex = 
`
precision mediump float;
attribute vec2 a_pos;
varying vec2 v_pos;
void main()
{
    gl_Position = vec4(a_pos, 0.0, 1.0);
    v_pos = a_pos;
}
`
export const simple_fragment = 
`
precision mediump float;
uniform vec4 u_color;
uniform sampler2D u_texture;
uniform float u_kernel[9];
uniform vec2 u_res;
varying vec2 v_pos;

float activation(float x)
{
    [AF]
}

void main()
{
    vec2 position = gl_FragCoord.xy / u_res.xy;

    float sum = 
          texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0, -1.0)) / u_res.xy).a * u_kernel[0]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0, -1.0)) / u_res.xy).a * u_kernel[1]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0, -1.0)) / u_res.xy).a * u_kernel[2]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0,  0.0)) / u_res.xy).a * u_kernel[3]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0,  0.0)) / u_res.xy).a * u_kernel[4]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0,  0.0)) / u_res.xy).a * u_kernel[5]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0,  1.0)) / u_res.xy).a * u_kernel[6]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0,  1.0)) / u_res.xy).a * u_kernel[7]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0,  1.0)) / u_res.xy).a * u_kernel[8];
    
    float x = activation(sum);
    gl_FragColor = vec4(0.0, 0.0, 0.0, x) + u_color;

    //gl_FragColor =  texture2D(u_texture, position);
}
`
