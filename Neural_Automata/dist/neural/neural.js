import { app2D } from './app2D.js';
import { app3D } from './app3D.js';
import { user_input } from './user_input.js';
import { webgl_util } from './webgl_util.js';
import { utils } from './utils.js';
import { Vec4 } from "../lib/TSM.js";
// ui imports
import { info_ui } from './ui/info_ui.js';
import { option_ui } from './ui/option_ui.js';
import { filter_ui } from './ui/filter_ui.js';
// http-server dist -c-1
// this is the main program where everything happens 
export class neural {
    app2d;
    app3d;
    curr_app;
    bg_color;
    canvas;
    context;
    static update_canvas;
    // input
    user_input;
    // used to calculate fps
    fps;
    start_time;
    prev_time;
    curr_delta_time;
    prev_fps_time;
    frame_count = 0;
    // used for canvas resize
    resize_observer;
    static canvas_to_disp_size;
    // ui windows
    info_ui;
    option_ui;
    filter_ui;
    constructor() {
        // canvas & context 🎵
        this.canvas = document.getElementById('canvas');
        this.context = webgl_util.request_context(this.canvas);
        // start apps
        this.app2d = new app2D(this);
        this.app3d = new app3D(this);
        // add bg and input
        this.bg_color = new Vec4([0.0, 0.0, 0.0, 1.0]);
        this.user_input = new user_input(this.canvas, this);
        this.curr_app = 'app2d';
        // set current time
        this.start_time = Date.now();
        this.prev_time = Date.now();
        this.prev_fps_time = Date.now();
        this.curr_delta_time = 0;
        this.fps = 0;
        // set ui
        this.info_ui = new info_ui();
        this.option_ui = new option_ui();
        this.filter_ui = new filter_ui();
        // handle canvas resize
        neural.canvas_to_disp_size = new Map([[this.canvas, [512, 512]]]);
        this.resize_observer = new ResizeObserver(this.on_resize);
        this.resize_observer.observe(this.canvas, { box: 'content-box' });
        // setup ui buttons
        this.setup_buttons();
        // start apps 🧨
        this.app3d.start();
        this.app2d.start();
        this.app2d.set_brush(this.app2d.brush_size);
    }
    get_delta_time() { return this.curr_delta_time; }
    get_elapsed_time() { return Date.now() - this.start_time; }
    set_2d() {
        this.resize_canvas_to_display_size(this.canvas);
        this.option_ui.mode_node.nodeValue = 'app2D';
        this.curr_app = 'app2d';
        this.app3d.end();
        this.app2d.start();
    }
    set_3d() {
        this.resize_canvas_to_display_size(this.canvas);
        this.option_ui.mode_node.nodeValue = 'app3D';
        this.curr_app = 'app3d';
        this.app2d.end();
        this.app3d.start();
    }
    start_render() {
        window.requestAnimationFrame(() => this.draw_loop());
    }
    draw_loop() {
        // update canvas size
        if (neural.update_canvas) {
            console.log('update canvas!');
            neural.update_canvas = false;
            this.resize_canvas_to_display_size(this.canvas);
            // reset apps
            if (this.curr_app == 'app2d') {
                (async () => {
                    await utils.delay(1);
                    this.app2d.reset();
                })();
            }
            else if (this.curr_app == 'app3d') {
                (async () => {
                    await utils.delay(1);
                    this.app3d.reset();
                })();
            }
        }
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
            this.info_ui.fps_node.nodeValue = this.fps.toFixed(0);
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
            neural.update_canvas = true;
        }
    }
    resize_canvas_to_display_size(canvas) {
        // Get the size the browser is displaying the canvas in device pixels.
        const [displayWidth, displayHeight] = neural.canvas_to_disp_size.get(canvas);
        this.info_ui.res_node.nodeValue = displayWidth + ' x ' + displayHeight;
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
    setup_buttons() {
        // handle randomize button
        var rndm_btn = document.getElementById("randomize_button");
        rndm_btn.addEventListener("click", () => {
            this.user_input.randomize();
        });
        // handle pause button
        var pause_btn = document.getElementById("pause_button");
        pause_btn.addEventListener("click", () => {
            this.user_input.toggle_pause();
        });
        // handle reset button
        var reset_btn = document.getElementById("reset_button");
        reset_btn.addEventListener("click", () => {
            this.user_input.reset();
        });
        // automata buttons
        var a_0 = document.getElementById("a-");
        a_0.addEventListener("click", () => { this.user_input.toggle_automata(false); });
        var a_1 = document.getElementById("a+");
        a_1.addEventListener("click", () => { this.user_input.toggle_automata(true); });
        // mode buttons
        var b_0 = document.getElementById("b-");
        b_0.addEventListener("click", () => { this.toggle_apps(); });
        var b_1 = document.getElementById("b+");
        b_1.addEventListener("click", () => { this.toggle_apps(); });
        // shade buttons
        var c_0 = document.getElementById("c-");
        c_0.addEventListener("click", () => { this.user_input.toggle_shade(false); });
        var c_1 = document.getElementById("c+");
        c_1.addEventListener("click", () => { this.user_input.toggle_shade(true); });
        // brush buttons
        var d_0 = document.getElementById("d-");
        d_0.addEventListener("click", () => { this.app2d.delta_brush(-10); });
        var d_1 = document.getElementById("d+");
        d_1.addEventListener("click", () => { this.app2d.delta_brush(10); });
        // brush buttons
        var e_0 = document.getElementById("e-");
        e_0.addEventListener("click", () => { this.app3d.camera_zoom(-20); });
        var e_1 = document.getElementById("e+");
        e_1.addEventListener("click", () => { this.app3d.camera_zoom(20); });
    }
}
export function init_neural() {
    const single = new neural();
    single.set_2d();
    single.start_render();
}
//# sourceMappingURL=neural.js.map