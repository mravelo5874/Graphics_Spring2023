export const rgb_vertex = 
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
export const rgb_fragment = 
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

    float sum_r = 
          texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0, -1.0)) / u_res.xy).r * u_kernel[0]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0, -1.0)) / u_res.xy).r * u_kernel[1]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0, -1.0)) / u_res.xy).r * u_kernel[2]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0,  0.0)) / u_res.xy).r * u_kernel[3]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0,  0.0)) / u_res.xy).r * u_kernel[4]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0,  0.0)) / u_res.xy).r * u_kernel[5]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0,  1.0)) / u_res.xy).r * u_kernel[6]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0,  1.0)) / u_res.xy).r * u_kernel[7]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0,  1.0)) / u_res.xy).r * u_kernel[8];

    float sum_g = 
        texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0, -1.0)) / u_res.xy).g * u_kernel[0]
      + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0, -1.0)) / u_res.xy).g * u_kernel[1]
      + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0, -1.0)) / u_res.xy).g * u_kernel[2]
      + texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0,  0.0)) / u_res.xy).g * u_kernel[3]
      + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0,  0.0)) / u_res.xy).g * u_kernel[4]
      + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0,  0.0)) / u_res.xy).g * u_kernel[5]
      + texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0,  1.0)) / u_res.xy).g * u_kernel[6]
      + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0,  1.0)) / u_res.xy).g * u_kernel[7]
      + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0,  1.0)) / u_res.xy).g * u_kernel[8];

    float sum_b = 
      texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0, -1.0)) / u_res.xy).b * u_kernel[0]
    + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0, -1.0)) / u_res.xy).b * u_kernel[1]
    + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0, -1.0)) / u_res.xy).b * u_kernel[2]
    + texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0,  0.0)) / u_res.xy).b * u_kernel[3]
    + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0,  0.0)) / u_res.xy).b * u_kernel[4]
    + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0,  0.0)) / u_res.xy).b * u_kernel[5]
    + texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0,  1.0)) / u_res.xy).b * u_kernel[6]
    + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0,  1.0)) / u_res.xy).b * u_kernel[7]
    + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0,  1.0)) / u_res.xy).b * u_kernel[8];
    
    float r = activation(sum_r);
    float g = activation(sum_g);
    float b = activation(sum_b);
    gl_FragColor = vec4(r, g, b, 1.0);
}
`
