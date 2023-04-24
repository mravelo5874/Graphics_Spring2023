import { Camera } from "../lib/webglutils/Camera.js";
import { Vec3 } from "../lib/TSM.js";
import { cube } from "./cube.js";
import { simple_3d_vertex, simple_3d_fragment } from './shaders/simple_3d_shader.js';
import { automata_volume } from "./automata_volume.js";
import { kernels_3d } from "./kernels_3d.js";
import { activation_type_3d } from "./activations_3d.js";
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
        this.volume = new automata_volume(32, kernels_3d.worm_kernel(), activation_type_3d.worm);
        this.volume.randomize_volume(Date.now().toString());
    }
    load_colormap(path) {
        let gl = this.context;
        let transfer_function = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, transfer_function);
        // add single pixel for now
        const pixel = new Uint8Array([0, 0, 255, 255]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        // add image after load
        const img = new Image();
        img.onload = () => {
            console.log('loaded img: ' + img.width + ' x ' + img.height);
            gl.bindTexture(gl.TEXTURE_2D, transfer_function);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        };
        // Turn off mips and set wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        img.src = path;
        return transfer_function;
    }
    start() {
        this.reset();
        this.neural_app.auto_node.nodeValue = 'none';
        this.neural_app.shade_node.nodeValue = 'simple 3d';
        // set colormap texture
        this.function_texture = this.load_colormap('../colormaps/matplotlib-plasma.png');
        let gl = this.context;
        // bind transfer function texture
        const func_loc = gl.getUniformLocation(this.program, 'u_func');
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.function_texture);
        gl.uniform1i(func_loc, 1);
        // create volume texture and vao
        this.volume_texture = gl.createTexture();
        this.vao = gl.createVertexArray();
        this.setup_cube();
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
        // use program!
        gl.useProgram(this.program);
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
        gl.cullFace(gl.FRONT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.viewport(0, 0, w, h);
        //this.volume.apply_convolutiuon_update()
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
        // set eye uniform
        const eye_loc = gl.getUniformLocation(this.program, "u_eye");
        gl.uniform3fv(eye_loc, new Float32Array(this.camera.pos().xyz));
        // set volume uniform
        const volume_loc = gl.getUniformLocation(this.program, 'u_volume');
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_3D, this.volume_texture);
        const s = this.volume.get_size();
        let data = this.volume.get_volume();
        gl.texImage3D(gl.TEXTURE_3D, 0, gl.ALPHA, s, s, s, 0, gl.ALPHA, gl.UNSIGNED_BYTE, data);
        gl.generateMipmap(gl.TEXTURE_3D);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.uniform1i(volume_loc, 2);
        // bind transfer function texture
        const func_loc = gl.getUniformLocation(this.program, 'u_func');
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.function_texture);
        gl.uniform1i(func_loc, 1);
    }
}
//# sourceMappingURL=app3D.js.map