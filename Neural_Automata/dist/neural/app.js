var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { utils } from './utils.js';
import { Vec2 } from '../lib/TSM.js';
import { simple_vertex, simple_fragment } from './shaders/simple_shader.js';
import { webgl_util } from './webgl_util.js';
import { user_input } from './user_input.js';
import { kernels } from './kernels.js';
import { activations } from './activations.js';
import Rand from "../lib/rand-seed/Rand.js";
// http-server dist -c-1
export var automata;
(function (automata) {
    automata[automata["worms"] = 0] = "worms";
    automata[automata["waves"] = 1] = "waves";
    automata[automata["paths"] = 2] = "paths";
    automata[automata["stars"] = 3] = "stars";
    automata[automata["cgol"] = 4] = "cgol";
})(automata || (automata = {}));
export class app {
    constructor(_canvas) {
        this.frame_count = 0;
        // used to cap fps
        this.fps_cap = 30;
        this.canvas = _canvas;
        this.context = webgl_util.request_context(this.canvas);
        this.user_input = new user_input(_canvas, this);
        this.frame_time = 1000 / this.fps_cap;
        // set current time
        this.start_time = Date.now();
        this.prev_time = Date.now();
        this.prev_fps_time = Date.now();
        this.curr_delta_time = 0;
        this.fps = 0;
        // add automata text element to screen
        const auto_element = document.querySelector("#auto");
        this.auto_node = document.createTextNode("");
        auto_element === null || auto_element === void 0 ? void 0 : auto_element.appendChild(this.auto_node);
        this.auto_node.nodeValue = '';
        // add fps text element to screen
        const fps_element = document.querySelector("#fps");
        this.fps_node = document.createTextNode("");
        fps_element === null || fps_element === void 0 ? void 0 : fps_element.appendChild(this.fps_node);
        this.fps_node.nodeValue = '';
        // add res text element to screen
        const res_element = document.querySelector("#res");
        this.res_node = document.createTextNode("");
        res_element === null || res_element === void 0 ? void 0 : res_element.appendChild(this.res_node);
        this.res_node.nodeValue = '';
        // handle canvas resize
        app.canvas_to_disp_size = new Map([[this.canvas, [512, 512]]]);
        this.resize_observer = new ResizeObserver(this.on_resize);
        this.resize_observer.observe(this.canvas, { box: 'content-box' });
    }
    get_delta_time() { return this.curr_delta_time; }
    get_elapsed_time() { return Date.now() - this.start_time; }
    reset(auto) {
        this.curr_automata = auto;
        let gl = this.context;
        let frag = simple_fragment;
        switch (auto) {
            default:
            case automata.worms:
                frag = frag.replace('[AF]', activations.worms_activation());
                this.auto_node.nodeValue = 'worms';
                break;
            case automata.waves:
                frag = frag.replace('[AF]', activations.waves_activation());
                this.auto_node.nodeValue = 'waves';
                break;
            case automata.paths:
                frag = frag.replace('[AF]', activations.paths_activation());
                this.auto_node.nodeValue = 'paths';
                break;
            case automata.stars:
                frag = frag.replace('[AF]', activations.stars_activation());
                this.auto_node.nodeValue = 'stars';
                break;
            case automata.cgol:
                frag = frag.replace('[AF]', activations.gol_activation());
                this.auto_node.nodeValue = 'c-gol';
                break;
        }
        // create shaders
        const vertex_shader = gl.createShader(gl.VERTEX_SHADER);
        const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(vertex_shader, simple_vertex);
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
        this.simple_program = gl.createProgram();
        let program = this.simple_program;
        gl.attachShader(program, vertex_shader);
        gl.attachShader(program, fragment_shader);
        gl.linkProgram(program);
        // used for debugging program
        const program_log = gl.getProgramInfoLog(program);
        if (program_log != '')
            console.log('shader program log: ' + program_log);
        // two triangles fill the window
        this.vertices = new Float32Array([
            // lower triangle
            -1.0, -1.0,
            -1.0, 1.0,
            1.0, -1.0,
            // upper triangle
            1.0, -1.0,
            -1.0, 1.0,
            1.0, 1.0
        ]);
        // // lower triangle
        // -0.9,-0.9,
        // -0.9, 0.9,
        // 0.9,-0.9,
        // // upper triangle
        // 0.9,-0.9,
        // -0.9, 0.9,
        // 0.9, 0.9
        // create vertices buffer
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        // use program !!!
        gl.useProgram(program);
        // set color uniform
        const color_loc = gl.getUniformLocation(program, 'u_color');
        gl.uniform4fv(color_loc, [0.0, 0.0, 0.0, 0.0]);
        // set texture uniform
        const texture_loc = gl.getUniformLocation(program, 'u_texture');
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        // Fill the texture with random states
        const w = this.canvas.width;
        const h = this.canvas.height;
        // generate state based on automata
        let pixels = new Uint8Array(0);
        if (auto == automata.cgol) {
            pixels = utils.generate_random_binary_state(w, h, this.get_elapsed_time().toString());
        }
        else {
            pixels = utils.generate_random_state(w, h, this.get_elapsed_time().toString());
        }
        this.prev_pixels = pixels;
        //console.log('pixels.length: ' + pixels.length + ', wxhx4: ' + w * h * 4)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        // Tell the shader to use texture unit 0 for u_texture
        gl.uniform1i(texture_loc, 0);
        // set kernel array uniform
        const kernel_loc = gl.getUniformLocation(program, 'u_kernel[0]');
        let kernel = new Float32Array(9);
        switch (auto) {
            default:
            case automata.worms:
                kernel = kernels.worms_kernel();
                break;
            case automata.waves:
                kernel = kernels.waves_kernel();
                break;
            case automata.paths:
                kernel = kernels.paths_kernel();
                break;
            case automata.stars:
                kernel = kernels.stars_kernel();
                break;
            case automata.cgol:
                kernel = kernels.gol_kernel();
                break;
        }
        gl.uniform1fv(kernel_loc, kernel);
        // set resolution uniform
        const res_loc = gl.getUniformLocation(program, "u_res");
        let res = new Float32Array([w, h]);
        gl.uniform2fv(res_loc, res);
        // set position attribute
        const pos_loc = gl.getAttribLocation(program, 'a_pos');
        gl.enableVertexAttribArray(pos_loc);
        gl.vertexAttribPointer(pos_loc, 2, gl.FLOAT, false, 0, 0);
        // draw !!!
        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 2);
    }
    start() {
        app.update_canvas = true;
        this.reset(automata.worms);
        window.requestAnimationFrame(() => this.draw_loop());
    }
    draw() {
        let gl = this.context;
        let w = this.canvas.width;
        let h = this.canvas.height;
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.viewport(0, 0, w, h);
        // update canvas size
        if (app.update_canvas) {
            app.update_canvas = false;
            this.resize_canvas_to_display_size(this.canvas);
            (() => __awaiter(this, void 0, void 0, function* () {
                yield utils.delay(1);
                this.reset(this.curr_automata);
            }))();
        }
        // create vertices buffer
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        // use program !!!
        gl.useProgram(this.simple_program);
        // set color uniform
        const color_loc = gl.getUniformLocation(this.simple_program, 'u_color');
        gl.uniform4fv(color_loc, [0.0, 0.0, 0.0, 0.0]);
        // set texture uniform
        const texture_loc = gl.getUniformLocation(this.simple_program, 'u_texture');
        //console.log('pixels.length: ' + pixels.length + ', wxhx4: ' + w * h * 4)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.prev_pixels);
        gl.generateMipmap(gl.TEXTURE_2D);
        // Tell the shader to use texture unit 0 for u_texture
        gl.uniform1i(texture_loc, 0);
        // set position attribute
        const pos_loc = gl.getAttribLocation(this.simple_program, 'a_pos');
        gl.enableVertexAttribArray(pos_loc);
        gl.vertexAttribPointer(pos_loc, 2, gl.FLOAT, false, 0, 0);
        // draw !!!
        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 2);
    }
    read() {
        let gl = this.context;
        let w = this.canvas.width;
        let h = this.canvas.height;
        // set texture uniform as pixels
        let pixels = new Uint8Array(w * h * 4);
        gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        this.prev_pixels = pixels;
    }
    /* Draws and then requests a draw for the next frame */
    draw_loop() {
        // draw to screen and read pixels twice to skip every other frame
        this.draw();
        this.read();
        this.draw();
        this.read();
        this.frame_count++;
        // calculate current delta time
        const curr_time = Date.now();
        this.curr_delta_time = (curr_time - this.prev_time);
        this.prev_time = curr_time;
        // calculate fps
        if (Date.now() - this.prev_fps_time >= 1000) {
            this.fps = this.frame_count;
            this.frame_count = 0;
            this.prev_fps_time = Date.now();
            this.fps_node.nodeValue = this.fps.toFixed(0);
        }
        // request next frame to be drawn
        window.requestAnimationFrame(() => this.draw_loop());
    }
    on_resize(entries) {
        for (const entry of entries) {
            let width;
            let height;
            let dpr = window.devicePixelRatio;
            if (entry.devicePixelContentBoxSize) {
                // NOTE: Only this path gives the correct answer
                // The other 2 paths are an imperfect fallback
                // for browsers that don't provide anyway to do this
                width = entry.devicePixelContentBoxSize[0].inlineSize;
                height = entry.devicePixelContentBoxSize[0].blockSize;
                dpr = 1; // it's already in width and height
            }
            else if (entry.contentBoxSize) {
                if (entry.contentBoxSize[0]) {
                    width = entry.contentBoxSize[0].inlineSize;
                    height = entry.contentBoxSize[0].blockSize;
                }
                else {
                    // legacy
                    width = entry.contentBoxSize.inlineSize;
                    height = entry.contentBoxSize.blockSize;
                }
            }
            else {
                // legacy
                width = entry.contentRect.width;
                height = entry.contentRect.height;
            }
            const displayWidth = Math.round(width * dpr);
            const displayHeight = Math.round(height * dpr);
            app.canvas_to_disp_size.set(entry.target, [displayWidth, displayHeight]);
            app.update_canvas = true;
        }
    }
    resize_canvas_to_display_size(canvas) {
        // Get the size the browser is displaying the canvas in device pixels.
        const [displayWidth, displayHeight] = app.canvas_to_disp_size.get(canvas);
        this.res_node.nodeValue = displayWidth + ' x ' + displayHeight;
        // Check if the canvas is not the same size.
        const needResize = canvas.width !== displayWidth ||
            canvas.height !== displayHeight;
        if (needResize) {
            // Make the canvas the same size
            canvas.width = displayWidth;
            canvas.height = displayHeight;
        }
        return needResize;
    }
    mouse_draw(rel_x, rel_y, brush_size) {
        let pixels = this.prev_pixels;
        let w = this.canvas.width;
        let h = this.canvas.height;
        rel_y = 1.0 - rel_y;
        let x = Math.floor(w * rel_x);
        let y = Math.floor(h * rel_y);
        let rng = new Rand((rel_x * rel_y).toString());
        // fill in pixels
        for (let i = y - brush_size; i < y + brush_size; i++) {
            for (let j = x - brush_size; j < x + brush_size; j++) {
                // get new random value
                let r = 0;
                if (this.curr_automata == automata.cgol) {
                    if (rng.next() > 0.5)
                        r = 255;
                }
                else {
                    r = Math.floor(255 * rng.next());
                }
                // access pixel at (x, y) by using (y * width) + (x * 4)
                const idx = (i * w + j) * 4;
                // make sure index is not out of range
                if (idx < pixels.length && idx > -1) {
                    // used to draw a circle
                    if (Vec2.distance(new Vec2([x, y]), new Vec2([j, i])) <= brush_size) {
                        pixels[idx + 3] = r;
                    }
                }
            }
        }
        // set prev pixels to display
        this.prev_pixels = pixels;
    }
    mouse_erase(rel_x, rel_y, brush_size) {
        let pixels = this.prev_pixels;
        let w = this.canvas.width;
        let h = this.canvas.height;
        rel_y = 1.0 - rel_y;
        let x = Math.floor(w * rel_x);
        let y = Math.floor(h * rel_y);
        // fill in pixels
        for (let i = y - brush_size; i < y + brush_size; i++) {
            for (let j = x - brush_size; j < x + brush_size; j++) {
                // access pixel at (x, y) by using (y * width) + (x * 4)
                const idx = (i * w + j) * 4;
                // make sure index is not out of range
                if (idx < pixels.length && idx > -1) {
                    // used to draw a circle
                    if (Vec2.distance(new Vec2([x, y]), new Vec2([j, i])) <= brush_size) {
                        pixels[idx + 3] = 0;
                    }
                }
            }
        }
        // set prev pixels to display
        this.prev_pixels = pixels;
    }
}
export function init_app() {
    // get canvas element from document
    const canvas = document.getElementById('canvas');
    const neural_app = new app(canvas);
    neural_app.start();
}
//# sourceMappingURL=app.js.map