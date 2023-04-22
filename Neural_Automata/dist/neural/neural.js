import { app2D } from './app2D.js';
import { app3D } from './app3D.js';
import { user_input } from './user_input.js';
import { webgl_util } from './webgl_util.js';
// http-server dist -c-1
export class neural {
    constructor() {
        this.frame_count = 0;
        this.canvas = document.getElementById('canvas');
        this.context = webgl_util.request_context(this.canvas);
        this.app2d = new app2D(this);
        this.app3d = new app3D(this);
        this.user_input = new user_input(this.canvas, this);
        this.curr_app = 'app2d';
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
        // add shader text element to screen
        const shade_element = document.querySelector("#shade");
        this.shade_node = document.createTextNode("");
        shade_element === null || shade_element === void 0 ? void 0 : shade_element.appendChild(this.shade_node);
        this.shade_node.nodeValue = '';
        // add mode text element to screen
        const mode_element = document.querySelector("#mode");
        this.mode_node = document.createTextNode("");
        mode_element === null || mode_element === void 0 ? void 0 : mode_element.appendChild(this.mode_node);
        this.mode_node.nodeValue = '';
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
        neural.canvas_to_disp_size = new Map([[this.canvas, [512, 512]]]);
        this.resize_observer = new ResizeObserver(this.on_resize);
        this.resize_observer.observe(this.canvas, { box: 'content-box' });
    }
    get_delta_time() { return this.curr_delta_time; }
    get_elapsed_time() { return Date.now() - this.start_time; }
    set_2d() {
        this.mode_node.nodeValue = '2D';
        this.curr_app = 'app2d';
        this.app3d.end();
        this.app2d.start();
    }
    set_3d() {
        this.mode_node.nodeValue = '3D';
        this.curr_app = 'app3d';
        this.app2d.end();
        this.app3d.start();
    }
    start_render() {
        window.requestAnimationFrame(() => this.draw_loop());
    }
    draw_loop() {
        // which app to render ?
        if (this.curr_app == 'app2d') {
            this.app2d.draw_loop();
        }
        else if (this.curr_app == 'app3d') {
            this.app3d.draw_loop();
        }
        // calculate current delta time
        this.frame_count++;
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
    toggle_apps() {
        if (this.curr_app == 'app2d') {
            this.set_3d();
        }
        else if (this.curr_app == 'app3d') {
            this.set_2d();
        }
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
            neural.canvas_to_disp_size.set(entry.target, [displayWidth, displayHeight]);
            app2D.update_canvas = true;
        }
    }
    resize_canvas_to_display_size(canvas) {
        // Get the size the browser is displaying the canvas in device pixels.
        const [displayWidth, displayHeight] = neural.canvas_to_disp_size.get(canvas);
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
export function init_neural() {
    const single = new neural();
    single.set_2d();
    single.start_render();
}
//# sourceMappingURL=neural.js.map