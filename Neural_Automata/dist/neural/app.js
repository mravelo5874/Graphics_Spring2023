import { utils } from './utils.js';
import { neural_renderer } from './neural_renderer.js';
import { neural_automata_vertex, neural_automata_fragment } from './shaders.js';
import { Vec3 } from '../lib/TSM.js';
// http-server dist -c-1
export class app {
    constructor(_canvas) {
        this.frame_count = 0;
        window.onresize = () => {
            if (window.innerWidth === this.renderer.width && window.innerHeight === this.renderer.height)
                return;
            this.renderer.stop_render();
            this.renderer.canvas.height = window.innerHeight;
            this.renderer.canvas.width = window.innerWidth;
            this.renderer.height = window.innerHeight;
            this.renderer.width = window.innerWidth;
            this.renderer.gl.viewport(0, 0, this.renderer.width, this.renderer.height);
            this.renderer.set_state(utils.generate_random_state(this.renderer.width, this.renderer.height));
            this.renderer.start_render();
        };
        // set up renderer with canvas
        this.renderer = new neural_renderer(_canvas);
        this.renderer.set_activation(utils.DEFAULT_ACTIVATION);
        this.renderer.set_kernel(utils.generate_random_kernel());
        this.renderer.compile_shaders(neural_automata_vertex, neural_automata_fragment);
        this.renderer.set_color(new Vec3([0.4, 0.2, 0.6]));
        this.renderer.set_state(utils.generate_random_state(this.renderer.width, this.renderer.height));
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
    }
    get_delta_time() { return this.curr_delta_time; }
    get_elapsed_time() { return Date.now() - this.start_time; }
    start() {
        this.renderer.start_render();
        // window.requestAnimationFrame(() => this.draw_loop());
    }
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