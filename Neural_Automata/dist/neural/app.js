import { simple_vertex, simple_fragment } from './shaders/simple_shader.js';
import { webgl_util } from './webgl_util.js';
// http-server dist -c-1
export class app {
    constructor(_canvas) {
        // window.onresize = () => {
        // 	if (window.innerWidth === this.renderer.width && window.innerHeight === this.renderer.height)
        // 		return;
        // 	this.renderer.stop_render();
        // 	this.renderer.canvas.height = window.innerHeight;
        // 	this.renderer.canvas.width = window.innerWidth;
        // 	this.renderer.height = window.innerHeight;
        // 	this.renderer.width = window.innerWidth;
        // 	this.renderer.gl.viewport(0, 0, this.renderer.width, this.renderer.height);
        // 	this.renderer.set_state(utils.generate_random_state(this.renderer.width, this.renderer.height));
        //   this.renderer.start_render();
        // }
        this.frame_count = 0;
        // // set up renderer with canvas
        // this.renderer = new neural_renderer(_canvas)
        // this.renderer.set_activation(utils.DEFAULT_ACTIVATION)
        // this.renderer.set_kernel(utils.generate_random_kernel())
        // this.renderer.compile_shaders(neural_automata_vertex, neural_automata_fragment)
        // this.renderer.set_color(new Vec3([0.4, 0.2, 0.6]));
        // this.renderer.set_state(utils.generate_random_state(this.renderer.width, this.renderer.height));
        this.canvas = _canvas;
        this.context = webgl_util.request_context(this.canvas);
        // set current time
        this.start_time = Date.now();
        this.prev_time = Date.now();
        this.prev_fps_time = Date.now();
        this.curr_delta_time = 0;
        this.fps = 0;
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
        app.canvas_to_disp_size = new Map([[this.canvas, [500, 500]]]);
        this.resize_observer = new ResizeObserver(this.on_resize);
        this.resize_observer.observe(this.canvas, { box: 'content-box' });
    }
    get_delta_time() { return this.curr_delta_time; }
    get_elapsed_time() { return Date.now() - this.start_time; }
    start() {
        //this.renderer.start_render();
        let gl = this.context;
        // create shaders
        const vertex_shader = gl.createShader(gl.VERTEX_SHADER);
        const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(vertex_shader, simple_vertex);
        gl.compileShader(vertex_shader);
        gl.shaderSource(fragment_shader, simple_fragment);
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
            -0.9, -0.9,
            -0.9, 0.9,
            0.9, -0.9,
            // upper triangle
            0.9, -0.9,
            -0.9, 0.9,
            0.9, 0.9
        ]);
        // create vertices buffer
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        // set color uniform
        gl.useProgram(program);
        const color_loc = gl.getUniformLocation(program, 'color');
        gl.uniform4fv(color_loc, [0.914, 0.855, 0.949, 1.0]);
        // set position attribute
        const pos_loc = gl.getAttribLocation(program, 'pos');
        gl.enableVertexAttribArray(pos_loc);
        gl.vertexAttribPointer(pos_loc, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 2);
        window.requestAnimationFrame(() => this.draw_loop());
    }
    draw() {
        // update canvas size
        if (app.update_canvas) {
            app.update_canvas = false;
            console.log('update canvas!');
            this.resize_canvas_to_display_size(this.canvas);
            console.log('new size: ' + this.canvas.width + ' x ' + this.canvas.height);
        }
        let gl = this.context;
        gl.clearColor(0.522, 0.514, 0.62, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        // create vertices buffer
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        // set color uniform
        gl.useProgram(this.simple_program);
        const color_loc = gl.getUniformLocation(this.simple_program, 'color');
        gl.uniform4fv(color_loc, [0.922, 0.765, 0.345, 1.0]);
        // set position attribute
        const pos_loc = gl.getAttribLocation(this.simple_program, 'pos');
        gl.enableVertexAttribArray(pos_loc);
        gl.vertexAttribPointer(pos_loc, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 2);
    }
    /* Draws and then requests a draw for the next frame */
    draw_loop() {
        // calculate current delta time
        const curr_time = Date.now();
        this.curr_delta_time = (curr_time - this.prev_time);
        this.prev_time = curr_time;
        // draw to screen
        this.draw();
        this.frame_count++;
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
}
export function init_app() {
    // get canvas element from document
    const canvas = document.getElementById('canvas');
    const neural_app = new app(canvas);
    neural_app.start();
}
//# sourceMappingURL=app.js.map