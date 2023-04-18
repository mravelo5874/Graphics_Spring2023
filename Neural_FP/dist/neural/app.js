import { webgl_util } from './webgl_util.js';
import { Mat3 } from "../lib/TSM.js";
import { neural_automata_vertex, neural_automata_fragment } from './shaders.js';
// http-server dist -c-1
export class app {
    constructor(_canvas) {
        this.frame_count = 0;
        this.canvas = _canvas;
        this.context = webgl_util.request_context(this.canvas);
        console.log('context: ' + this.context);
        // setup GLSL program
        this.program = webgl_util.createProgram(this.context, neural_automata_vertex, neural_automata_fragment);
        this.context.useProgram(this.program);
        // vertex + uniform data
        this.pos_attr = this.context.getAttribLocation(this.program, 'a_position');
        this.color_uni = this.context.getUniformLocation(this.program, 'u_color');
        this.matrix_uni = this.context.getUniformLocation(this.program, 'u_matrix');
        // bind position buffer
        this.pos_buffer = this.context.createBuffer();
        this.context.bindBuffer(this.context.ARRAY_BUFFER, this.pos_buffer);
        // handle canvas resize
        this.canvas_to_disp_size = new Map([[this.canvas, [300, 150]]]);
        this.resize_observer = new ResizeObserver(this.on_resize);
        this.resize_observer.observe(this.canvas, { box: 'content-box' });
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
        this.fps_node.nodeValue = this.fps.toFixed(0); // no decimal place
    }
    start() {
        window.requestAnimationFrame(() => this.draw_loop());
    }
    draw_scene(time) {
        console.log('context: ' + this.context);
        let gl = this.context;
        time *= 0.001;
        this.resize_canvas_to_display_size(this.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(this.program);
        gl.enableVertexAttribArray(this.pos_attr);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pos_buffer);
        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2; // 2 components per iteration
        var type = gl.FLOAT; // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0; // start at the beginning of the buffer
        gl.vertexAttribPointer(this.pos_attr, size, type, normalize, stride, offset);
        // Set Geometry.
        var radius = Math.sqrt(gl.canvas.width * gl.canvas.width + gl.canvas.height * gl.canvas.height) * 0.5;
        var angle = time;
        var x = Math.cos(angle) * radius;
        var y = Math.sin(angle) * radius;
        var centerX = gl.canvas.width / 2;
        var centerY = gl.canvas.height / 2;
        this.set_geometry(gl, centerX + x, centerY + y, centerX - x, centerY - y);
        const proj_matrix = Mat3.projection(gl.canvas.width, gl.canvas.height);
        // Set the matrix.
        gl.uniformMatrix3fv(this.matrix_uni, false, proj_matrix);
        // Draw in red
        gl.uniform4fv(this.color_uni, [1, 0, 0, 1]);
        // Draw the geometry.
        var primitiveType = gl.LINES;
        var offset = 0;
        var count = 2;
        gl.drawArrays(primitiveType, offset, count);
        requestAnimationFrame(this.draw_scene);
    }
    set_geometry(gl, x1, y1, x2, y2) {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            x1, y1,
            x2, y2
        ]), gl.STATIC_DRAW);
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
            this.canvas_to_disp_size.set(entry.target, [displayWidth, displayHeight]);
        }
    }
    resize_canvas_to_display_size(canvas) {
        // Get the size the browser is displaying the canvas in device pixels.
        const [displayWidth, displayHeight] = this.canvas_to_disp_size.get(canvas);
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
    /* Draws a single frame */
    draw() {
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
}
export function init_app() {
    // get canvas element from document
    const canvas = document.getElementById('canvas');
    const neural_app = new app(canvas);
    neural_app.start();
}
//# sourceMappingURL=app.js.map