import { Debugger } from "../lib/webglutils/Debugging.js";
import { CanvasAnimation } from "../lib/webglutils/CanvasAnimation.js";
import { GUI } from "./Gui.js";
import { Vec4 } from "../lib/TSM.js";
// http-server dist -c-1
export class NeuralAnimation extends CanvasAnimation {
    // time variables
    get_delta_time() { return this.curr_delta_time; }
    get_elapsed_time() { return Date.now() - this.start_time; }
    get_width() { return this.width; }
    get_height() { return this.height; }
    set_resolution(_width, _height) {
        if (_width <= 0 || _height <= 0) {
            console.log('[WARNING] Invalid resolution: ' + _width + 'x' + _height);
            return;
        }
        this.width = _width;
        this.height = _height;
        console.log('set res: ' + this.width + 'x' + this.height);
    }
    constructor(canvas) {
        // init
        super(canvas);
        this.width = 64;
        this.height = 64;
        this.curr_delta_time = 0;
        this.fps = 0;
        this.prev_fps_time = 0;
        this.frame_count = 0;
        this.canvas2d = document.getElementById("textCanvas");
        this.contex = Debugger.makeDebugContext(this.contex);
        this.background_color = new Vec4([0.3, 0.2, 0.6, 1.0]);
        // set current time
        this.start_time = Date.now();
        this.prev_time = Date.now();
        this.prev_fps_time = Date.now();
        // add fps text element to screen
        const fps_element = document.querySelector("#fps");
        this.fps_node = document.createTextNode("");
        fps_element === null || fps_element === void 0 ? void 0 : fps_element.appendChild(this.fps_node);
        this.fps_node.nodeValue = this.fps.toFixed(0);
        this.gui = new GUI(canvas, this);
    }
    reset() {
        this.gui.reset();
    }
    draw() {
        // Drawing
        const gl = this.contex;
        const bg = this.background_color;
        gl.clearColor(bg.r, bg.g, bg.b, bg.a);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.BACK);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null); // null is the default frame buffer
        this.draw_scene(0, 0, this.width, this.height);
    }
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
    draw_scene(x, y, width, height) {
        const gl = this.contex;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(x, y, width, height);
    }
}
export function init_canvas() {
    const canvas = document.getElementById("glCanvas");
    const neural = new NeuralAnimation(canvas);
    neural.start();
}
//# sourceMappingURL=App.js.map