import { Camera } from "../lib/webglutils/Camera.js";
import { Vec3 } from "../lib/TSM.js";
import { cube } from "./cube.js";
import { simple_3d_vertex, simple_3d_fragment } from './shaders/simple_3d_shader.js';
import { automata_volume } from "./automata_volume.js";
import { rules } from "./rules.js";
export var volume_type;
(function (volume_type) {
    volume_type[volume_type["sphere"] = 0] = "sphere";
    volume_type[volume_type["random"] = 1] = "random";
    volume_type[volume_type["perlin"] = 2] = "perlin";
    volume_type[volume_type["grow"] = 3] = "grow";
    volume_type[volume_type["amoeba"] = 4] = "amoeba";
    volume_type[volume_type["clouds"] = 5] = "clouds";
    volume_type[volume_type["arch"] = 6] = "arch";
    volume_type[volume_type["caves"] = 7] = "caves";
    volume_type[volume_type["crystal"] = 8] = "crystal";
    volume_type[volume_type["END"] = 9] = "END";
})(volume_type || (volume_type = {}));
export var colormap;
(function (colormap) {
    colormap[colormap["cool_warm"] = 0] = "cool_warm";
    colormap[colormap["plasma"] = 1] = "plasma";
    colormap[colormap["virdis"] = 2] = "virdis";
    colormap[colormap["rainbow"] = 3] = "rainbow";
    colormap[colormap["green"] = 4] = "green";
    colormap[colormap["ygb"] = 5] = "ygb";
    colormap[colormap["END"] = 6] = "END";
})(colormap || (colormap = {}));
export class app3D {
    constructor(_neural) {
        this.cam_sense = 0.25;
        this.rot_speed = 0.03;
        this.zoom_speed = 0.005;
        this.min_zoom = 0.5;
        this.max_zoom = 12;
        // frames per volume updatep
        this.conv_frames = 16;
        this.pause = false;
        this.neural_app = _neural;
        this.canvas = _neural.canvas;
        this.context = _neural.context;
        this.pause = false;
        this.curr_frames = 0;
        this.update_count = 0;
        // create geometry + volume
        this.cube = new cube();
        this.auto_volume = new automata_volume(32, rules.grow());
        // set initial volume
        this.volume = volume_type.sphere;
        this.color = colormap.rainbow;
    }
    load_colormap(path) {
        let gl = this.context;
        let transfer_function = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, transfer_function);
        // add single pixel for now
        const pixel = new Uint8Array([0, 0, 0, 255]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        // add image after load
        const img = new Image();
        img.onload = () => {
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
        this.pause = false;
        this.reset();
        // set initial colormap
        this.function_texture = this.load_colormap('../colormaps/rainbow.png');
        this.neural_app.shade_node.nodeValue = 'rainbow';
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
    toggle_pause() {
        this.pause = !this.pause;
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
    toggle_volume() {
        let v = this.volume;
        v -= 1;
        if (v < 0)
            v = volume_type.END - 1;
        this.reset(v);
    }
    set_colormap(_color) {
        switch (_color) {
            case colormap.cool_warm:
                this.function_texture = this.load_colormap('../colormaps/cool-warm-paraview.png');
                this.neural_app.shade_node.nodeValue = 'cool-warm';
                break;
            case colormap.green:
                this.function_texture = this.load_colormap('../colormaps/samsel-linear-green.png');
                this.neural_app.shade_node.nodeValue = 'green';
                break;
            case colormap.plasma:
                this.function_texture = this.load_colormap('../colormaps/matplotlib-plasma.png');
                this.neural_app.shade_node.nodeValue = 'plasma';
                break;
            case colormap.rainbow:
                this.function_texture = this.load_colormap('../colormaps/rainbow.png');
                this.neural_app.shade_node.nodeValue = 'rainbow';
                break;
            case colormap.virdis:
                this.function_texture = this.load_colormap('../colormaps/matplotlib-virdis.png');
                this.neural_app.shade_node.nodeValue = 'virdis';
                break;
            case colormap.ygb:
                this.function_texture = this.load_colormap('../colormaps/samsel-linear-ygb-1211g.png');
                this.neural_app.shade_node.nodeValue = 'ygb';
                break;
        }
    }
    toggle_colormap() {
        let c = this.color;
        c -= 1;
        if (c < 0)
            c = colormap.END - 1;
        this.color = c;
        this.set_colormap(c);
    }
    toggle_shader() {
        // TODO this
    }
    toggle_automata() {
        // TODO this
    }
    reset(_type = this.volume) {
        // set volume
        this.volume = _type;
        switch (_type) {
            case volume_type.sphere:
                this.auto_volume.sphere_volume();
                this.neural_app.auto_node.nodeValue = 'sphere';
                break;
            case volume_type.random:
                this.neural_app.auto_node.nodeValue = 'random';
                this.auto_volume.randomize_volume(Date.now().toString(), 0.8);
                break;
            case volume_type.perlin:
                this.neural_app.auto_node.nodeValue = 'perlin';
                this.auto_volume.perlin_volume(Date.now().toString(), Vec3.zero);
                break;
            case volume_type.grow:
                this.neural_app.auto_node.nodeValue = 'grow';
                this.auto_volume.set_rule(rules.grow());
                this.auto_volume.sphere_volume(3);
                this.auto_volume.init_rule();
                break;
            case volume_type.amoeba:
                this.neural_app.auto_node.nodeValue = 'amoeba';
                this.auto_volume.set_rule(rules.amoeba());
                this.auto_volume.randomize_volume(Date.now().toString(), 0.8);
                this.auto_volume.init_rule();
                break;
            case volume_type.clouds:
                this.neural_app.auto_node.nodeValue = 'clouds';
                this.auto_volume.set_rule(rules.clouds());
                this.auto_volume.randomize_volume(Date.now().toString(), 0.62);
                this.auto_volume.init_rule();
                break;
            case volume_type.caves:
                this.neural_app.auto_node.nodeValue = 'caves';
                this.auto_volume.set_rule(rules.caves());
                this.auto_volume.randomize_volume(Date.now().toString(), 0.62);
                this.auto_volume.init_rule();
                break;
            case volume_type.crystal:
                this.neural_app.auto_node.nodeValue = 'crystal';
                this.auto_volume.set_rule(rules.crystal());
                this.auto_volume.sphere_volume(2);
                this.auto_volume.init_rule();
                break;
            case volume_type.arch:
                this.neural_app.auto_node.nodeValue = 'arch';
                this.auto_volume.set_rule(rules.arch());
                this.auto_volume.sphere_volume(3);
                this.auto_volume.init_rule();
                break;
        }
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
        if (!this.pause) {
            // update volume
            this.update_count++;
            this.curr_frames++;
            if (this.curr_frames >= this.conv_frames) {
                switch (this.volume) {
                    case volume_type.sphere:
                        break;
                    case volume_type.random:
                        break;
                    case volume_type.perlin:
                        let x = this.update_count;
                        this.auto_volume.perlin_volume(Date.now().toString(), new Vec3([x, x, x]).scale(0.15));
                        break;
                    case volume_type.grow:
                    case volume_type.amoeba:
                    case volume_type.clouds:
                    case volume_type.caves:
                    case volume_type.crystal:
                    case volume_type.arch:
                        this.auto_volume.apply_rule();
                        break;
                }
            }
            // rotate cube if there is no user input
            if (!this.neural_app.user_input.mouse_down) {
                let t = this.neural_app.get_elapsed_time() / 1000;
                this.camera.orbitTarget(this.camera.up().normalize(), this.rot_speed * 0.05);
            }
        }
        // Drawing
        gl.clearColor(bg.r, bg.g, bg.b, bg.a);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.FRONT);
        gl.frontFace(gl.CCW);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
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
        // set eye uniform
        const eye_loc = gl.getUniformLocation(this.program, "u_eye");
        gl.uniform3fv(eye_loc, new Float32Array(this.camera.pos().xyz));
        // set volume uniform
        const volume_loc = gl.getUniformLocation(this.program, 'u_volume');
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_3D, this.volume_texture);
        const s = this.auto_volume.get_size();
        let data = this.auto_volume.get_volume();
        gl.texImage3D(gl.TEXTURE_3D, 0, gl.ALPHA, s, s, s, 0, gl.ALPHA, gl.UNSIGNED_BYTE, data);
        gl.generateMipmap(gl.TEXTURE_3D);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.uniform1i(volume_loc, 2);
        // bind transfer function texture
        const func_loc = gl.getUniformLocation(this.program, 'u_func');
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.function_texture);
        gl.uniform1i(func_loc, 1);
    }
}
//# sourceMappingURL=app3D.js.map