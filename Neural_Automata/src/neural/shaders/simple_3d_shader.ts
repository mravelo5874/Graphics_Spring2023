export const simple_3d_vertex = 
`
    precision mediump float;

    uniform mat4 u_view;
    uniform mat4 u_proj;
    
    attribute vec4 a_norm;
    attribute vec4 a_pos;
    attribute vec2 a_uv;
    
    varying vec4 v_norm;
    varying vec4 v_pos;
    varying vec2 v_uv;

    void main () {

        gl_Position = u_proj * u_view * a_pos;
        v_pos = a_pos;
        v_norm = normalize(a_norm);
        v_uv = a_uv;
    }
`;

export const simple_3d_fragment = 
`
    precision mediump float;
    
    varying vec4 v_norm;
    varying vec4 v_pos;
    varying vec2 v_uv;
    
    void main() 
    {
        gl_FragColor = vec4(v_pos.xyz, 1.0);
    }
`;

