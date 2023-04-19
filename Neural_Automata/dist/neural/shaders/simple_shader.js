export const simple_vertex = `
precision mediump float;
attribute vec2 pos;
void main()
{
    gl_Position = vec4(pos, 0.0, 1.0);
}
`;
export const simple_fragment = `
precision mediump float;
uniform vec4 color;
void main()
{
    gl_FragColor = color;
}
`;
//# sourceMappingURL=simple_shader.js.map