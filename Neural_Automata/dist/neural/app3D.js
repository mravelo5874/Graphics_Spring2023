import { Camera } from "../lib/webglutils/Camera.js";
import { Vec3 } from "../lib/TSM.js";
import { cube } from "./cube.js";
import { simple_3d_vertex, simple_3d_fragment } from './shaders/simple_3d_shader.js';
export class app3D {
    constructor(_neural) {
        this.cam_sense = 0.25;
        this.rot_speed = 0.03;
        this.zoom_speed = 0.005;
        this.min_zoom = 1.5;
        this.max_zoom = 12;
        this.neural_app = _neural;
        this.canvas = _neural.canvas;
        this.context = _neural.context;
        this.cube = new cube();
    }
    start() {
        this.reset();
        this.neural_app.auto_node.nodeValue = 'none';
        this.neural_app.shade_node.nodeValue = 'simple 3d';
    }
    end() {
        // idk something ?
    }
    camera_zoom(zoom) {
        let dist = this.camera.distance();
        // do not zoom if too far away or too close
        if (dist > this.max_zoom && zoom > 0)
            return;
        else if (dist < this.min_zoom && zoom < 0)
            return;
        // offset camera
        this.camera.offsetDist(zoom * this.zoom_speed);
    }
    toggle_shader() {
    }
    toggle_automata() {
    }
    reset() {
        // get context
        let gl = this.context;
        // reset camera
        this.camera = new Camera(new Vec3([0, 0, -2]), new Vec3([0, 0, 0]), new Vec3([0, 1, 0]), 45, this.canvas.width / this.canvas.height, 0.1, 1000.0);
        // program
        let frag = simple_3d_fragment;
        let vert = simple_3d_vertex;
        // create shaders
        const vertex_shader = gl.createShader(gl.VERTEX_SHADER);
        const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(vertex_shader, vert);
        gl.compileShader(vertex_shader);
        gl.shaderSource(fragment_shader, frag);
        gl.compileShader(fragment_shader);
        // used for debugging shaders
        const vertex_log = gl.getShaderInfoLog(vertex_shader);
        const fragment_log = gl.getShaderInfoLog(fragment_shader);
        if (vertex_log != '')
            console.log('vertex shader log: ' + vertex_log);
        if (fragment_log != '')
            console.log('fragment shader log: ' + fragment_log);
        // create program
        this.program = gl.createProgram();
        let program = this.program;
        gl.attachShader(program, vertex_shader);
        gl.attachShader(program, fragment_shader);
        gl.linkProgram(program);
        // used for debugging program
        const program_log = gl.getProgramInfoLog(program);
        if (program_log != '')
            console.log('shader program log: ' + program_log);
        this.setup_cube();
    }
    draw_loop() {
        let gl = this.context;
        let w = this.canvas.width;
        let h = this.canvas.height;
        let bg = this.neural_app.bg_color;
        // rotate cube if there is no user input
        if (!this.neural_app.user_input.mouse_down) {
            let t = this.neural_app.get_elapsed_time() / 1000;
            this.camera.orbitTarget(this.camera.up().normalize(), this.rot_speed * 0.05);
        }
        // Drawing
        gl.clearColor(bg.r, bg.g, bg.b, bg.a);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.BACK);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, w, h);
        this.setup_cube();
        // draw !!!
        gl.drawElements(gl.TRIANGLES, this.cube.get_idx_u32().length, gl.UNSIGNED_INT, 0);
    }
    setup_cube() {
        let gl = this.context;
        // draw cube
        gl.useProgram(this.program);
        /* Setup VAO */
        gl.bindVertexArray(this.vao);
        /* Setup Index Buffer */
        const idx_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.cube.get_idx_u32(), gl.STATIC_DRAW);
        /* Setup Attributes */
        // position attribute
        let pos_loc = gl.getAttribLocation(this.program, 'a_pos');
        const pos_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pos_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.cube.get_pos_f32(), gl.STATIC_DRAW);
        gl.vertexAttribPointer(pos_loc, 4, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.vertexAttribDivisor(pos_loc, 0);
        gl.enableVertexAttribArray(pos_loc);
        // normal attribute
        let norm_loc = gl.getAttribLocation(this.program, 'a_norm');
        const norm_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, norm_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.cube.get_norms_f32(), gl.STATIC_DRAW);
        gl.vertexAttribPointer(norm_loc, 4, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.vertexAttribDivisor(norm_loc, 0);
        gl.enableVertexAttribArray(norm_loc);
        // uvs attribute
        let uv_loc = gl.getAttribLocation(this.program, 'a_uv');
        const uv_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uv_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.cube.get_uvs_f32(), gl.STATIC_DRAW);
        gl.vertexAttribPointer(uv_loc, 2, gl.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.vertexAttribDivisor(uv_loc, 0);
        gl.enableVertexAttribArray(uv_loc);
        // set view uniform
        const view_loc = gl.getUniformLocation(this.program, "u_view");
        gl.uniformMatrix4fv(view_loc, false, new Float32Array(this.camera.viewMatrix().all()));
        // set projection uniform
        const proj_loc = gl.getUniformLocation(this.program, "u_proj");
        gl.uniformMatrix4fv(proj_loc, false, new Float32Array(this.camera.projMatrix().all()));
    }
}
//# sourceMappingURL=app3D.js.map