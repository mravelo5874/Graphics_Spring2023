import { automata, shader_mode } from './app2D.js';
import { Vec3 } from '../lib/TSM.js';
import { colormap, volume_type } from './app3D.js';
import Rand from "../lib/rand-seed/Rand.js";
export class user_input {
    neural_app;
    mouse_down = false;
    key_lock = false;
    prev_x;
    prev_y;
    constructor(canvas, _neural) {
        this.neural_app = _neural;
        canvas.addEventListener("contextmenu", (event) => event.preventDefault());
        // event listeners for keyboard input
        window.addEventListener("keydown", (key) => this.on_key_down(key));
        window.addEventListener("keyup", (key) => this.on_key_up(key));
        // event listeners for mouse input
        canvas.addEventListener("mousedown", (mouse) => this.mouse_start(mouse));
        canvas.addEventListener("mousemove", (mouse) => this.mouse_drag(mouse));
        canvas.addEventListener("mouseup", (mouse) => this.mouse_end(mouse));
        canvas.addEventListener("wheel", (event) => this.mouse_wheel(event));
        // event listeners for touch input
        canvas.addEventListener("touchstart", (touch) => this.touch_start(touch));
        canvas.addEventListener("touchmove", (touch) => this.touch_drag(touch));
        canvas.addEventListener("touchend", (touch) => this.touch_end(touch));
    }
    on_key_down(key) {
        if (this.key_lock)
            return;
        this.key_lock = true;
        // switch (key.code) 
        // {
        //     // switch between 2d and 3d app
        //     case 'Space':
        //         this.neural_app.toggle_apps()
        //         break
        //     // toggle modes
        //     case 'ShiftLeft':
        //         switch (this.neural_app.curr_app)
        //         {
        //             case 'app2d':
        //                 this.neural_app.app2d.toggle_shader()
        //                 break
        //             case 'app3d':
        //                 this.neural_app.app3d.toggle_colormap()
        //                 break
        //         }
        //         break
        //     case 'ControlLeft':
        //         switch (this.neural_app.curr_app)
        //         {
        //             case 'app2d':
        //                 this.neural_app.app2d.toggle_automata()
        //                 break
        //             case 'app3d':
        //                 this.neural_app.app3d.toggle_volume()
        //                 break
        //         }
        //         break
        //     case 'KeyR': 
        //         switch (this.neural_app.curr_app)
        //         {
        //             case 'app2d':
        //                 this.neural_app.app2d.reset()
        //                 break
        //             case 'app3d':
        //                 this.neural_app.app3d.reset()
        //                 break
        //         }
        //         break
        //     case 'KeyP':
        //         switch (this.neural_app.curr_app)
        //         {
        //             case 'app2d':
        //                 this.neural_app.app2d.toggle_pause()
        //                 break
        //             case 'app3d':
        //                 this.neural_app.app3d.toggle_pause()
        //                 break
        //         }
        //         break
        //     case 'Backquote':
        //         if (this.neural_app.curr_app == 'app2d')
        //             this.neural_app.app2d.reset(automata.cgol)
        //         break
        //     case 'ArrowUp':
        //         if (this.neural_app.curr_app == 'app3d')
        //             this.neural_app.app3d.camera_zoom(-20)
        //         break
        //     case 'ArrowDown':
        //         if (this.neural_app.curr_app == 'app3d')
        //             this.neural_app.app3d.camera_zoom(20)
        //         break
        //     case 'ArrowLeft':
        //         switch (this.neural_app.curr_app)
        //         {
        //             case 'app2d':
        //                 this.neural_app.app2d.go_left()
        //                 break
        //             case 'app3d':
        //                 this.neural_app.app3d.go_left()
        //                 break
        //         }
        //         break
        //     case 'ArrowRight':
        //         switch (this.neural_app.curr_app)
        //         {
        //             case 'app2d':
        //                 this.neural_app.app2d.go_right()
        //                 break
        //             case 'app3d':
        //                 this.neural_app.app3d.go_right()
        //                 break
        //         }
        //         break
        //     case 'KeyZ':
        //         switch (this.neural_app.curr_app)
        //         {
        //             case 'app3d':
        //                 this.neural_app.app3d.reset(volume_type.neural)
        //                 this.neural_app.app3d.randomize_kernel()
        //                 break
        //         }
        //         break
        //     default:
        //         console.log('Key : \'', key.code, '\' was pressed.');
        //         break
        // }
    }
    toggle_shade(rev) {
        switch (this.neural_app.curr_app) {
            case 'app2d':
                if (rev)
                    this.neural_app.app2d.shader_right();
                else
                    this.neural_app.app2d.shader_left();
                break;
            case 'app3d':
                if (rev)
                    this.neural_app.app3d.colormap_right();
                else
                    this.neural_app.app3d.colormap_left();
                break;
        }
    }
    toggle_automata(rev) {
        switch (this.neural_app.curr_app) {
            case 'app2d':
                if (rev)
                    this.neural_app.app2d.go_right();
                else
                    this.neural_app.app2d.go_left();
                break;
            case 'app3d':
                if (rev)
                    this.neural_app.app3d.go_right();
                else
                    this.neural_app.app3d.go_left();
                break;
        }
    }
    reset() {
        switch (this.neural_app.curr_app) {
            case 'app2d':
                this.neural_app.app2d.reset();
                break;
            case 'app3d':
                this.neural_app.app3d.reset();
                break;
        }
    }
    toggle_pause() {
        switch (this.neural_app.curr_app) {
            case 'app2d':
                this.neural_app.app2d.toggle_pause();
                break;
            case 'app3d':
                this.neural_app.app3d.toggle_pause();
                break;
        }
    }
    randomize() {
        let rng = new Rand(Date.now().toString());
        // determin between 2d and 3d
        if (rng.next() > 0.5) {
            // set 3d
            this.neural_app.set_3d();
            // randomize automata
            let auto = Math.floor(rng.next() * (volume_type.END - 1));
            this.neural_app.app3d.reset(auto);
            // randomize shade
            let color = Math.floor(rng.next() * (colormap.END - 1));
            this.neural_app.app3d.set_colormap(color);
        }
        else {
            // set 2d
            this.neural_app.set_2d();
            // randomize automata
            let auto = Math.floor(rng.next() * (automata.END - 1));
            // randomize shade
            let shade = Math.floor(rng.next() * (shader_mode.END - 1));
            this.neural_app.app2d.reset(auto, shade);
        }
    }
    on_key_up(key) {
        this.key_lock = false;
    }
    mouse_wheel(wheel) {
        if (this.neural_app.curr_app == 'app2d') {
            // do something !
        }
        else if (this.neural_app.curr_app == 'app3d') {
            this.neural_app.app3d.camera_zoom(wheel.deltaY);
        }
    }
    touch_start(touch) {
        // draw with mouse if in 2d mode
        const pos = this.get_touch_canvas(touch, this.neural_app.canvas);
        this.prev_x = pos.x / this.neural_app.canvas.width;
        this.prev_y = pos.y / this.neural_app.canvas.height;
        this.mouse_down = true;
    }
    touch_drag(touch) {
        // draw with mouse if in 2d mode
        const pos = this.get_touch_canvas(touch, this.neural_app.canvas);
        const x = pos.x / this.neural_app.canvas.width;
        const y = pos.y / this.neural_app.canvas.height;
        const dx = x - this.prev_x;
        const dy = y - this.prev_y;
        this.prev_x = x;
        this.prev_y = y;
        if (this.mouse_down) {
            switch (touch.touches.length) {
                case 1:
                    {
                        if (this.neural_app.curr_app == 'app2d') {
                            this.neural_app.app2d.mouse_erase(x, y);
                        }
                        else if (this.neural_app.curr_app == 'app3d') {
                            // move camera if in 3d mode
                            let camera = this.neural_app.app3d.camera;
                            const mouseDir = camera.right();
                            mouseDir.scale(-dx);
                            mouseDir.add(camera.up().scale(dy));
                            mouseDir.normalize();
                            // move camera
                            let rotAxis = Vec3.cross(camera.forward(), mouseDir);
                            rotAxis = rotAxis.normalize();
                            // make sure values are not NaN
                            if (dy != 0 || dx != 0) {
                                camera.orbitTarget(rotAxis, this.neural_app.app3d.rot_speed);
                            }
                        }
                        break;
                    }
                case 2:
                    {
                        if (this.neural_app.curr_app == 'app2d') {
                            this.neural_app.app2d.mouse_draw(x, y);
                        }
                        else if (this.neural_app.curr_app == 'app3d') {
                            this.neural_app.app3d.camera_zoom(dy);
                        }
                        break;
                    }
            }
        }
    }
    touch_end(touch) {
        this.mouse_down = false;
    }
    mouse_start(mouse) {
        // return if screen size too small
        if (this.neural_app.canvas.width <= 600)
            return;
        // draw with mouse if in 2d mode
        const pos = this.get_mouse_canvas(mouse, this.neural_app.canvas);
        this.prev_x = pos.x / this.neural_app.canvas.width;
        this.prev_y = pos.y / this.neural_app.canvas.height;
        this.mouse_down = true;
    }
    mouse_drag(mouse) {
        // return if screen size too small
        if (this.neural_app.canvas.width <= 600)
            return;
        // draw with mouse if in 2d mode
        const pos = this.get_mouse_canvas(mouse, this.neural_app.canvas);
        const x = pos.x / this.neural_app.canvas.width;
        const y = pos.y / this.neural_app.canvas.height;
        const dx = x - this.prev_x;
        const dy = y - this.prev_y;
        this.prev_x = x;
        this.prev_y = y;
        if (this.mouse_down) {
            switch (mouse.buttons) {
                case 1:
                    {
                        if (this.neural_app.curr_app == 'app2d') {
                            this.neural_app.app2d.mouse_draw(x, y);
                        }
                        else if (this.neural_app.curr_app == 'app3d') {
                            // move camera if in 3d mode
                            let camera = this.neural_app.app3d.camera;
                            const mouseDir = camera.right();
                            mouseDir.scale(-dx);
                            mouseDir.add(camera.up().scale(dy));
                            mouseDir.normalize();
                            // move camera
                            let rotAxis = Vec3.cross(camera.forward(), mouseDir);
                            rotAxis = rotAxis.normalize();
                            // make sure values are not NaN
                            if (dy != 0 || dx != 0) {
                                camera.orbitTarget(rotAxis, this.neural_app.app3d.rot_speed);
                            }
                        }
                        break;
                    }
                case 2:
                    {
                        if (this.neural_app.curr_app == 'app2d') {
                            this.neural_app.app2d.mouse_erase(x, y);
                        }
                        else if (this.neural_app.curr_app == 'app3d') {
                        }
                        break;
                    }
            }
        }
    }
    mouse_end(mouse) {
        // return if screen size too small
        if (this.neural_app.canvas.width <= 600)
            return;
        this.mouse_down = false;
    }
    // thanks to:
    // https://stackoverflow.com/questions/42309715/how-to-correctly-pass-mouse-coordinates-to-webgl
    get_mouse_relative(event, target) {
        target = target || event.target;
        var rect = target.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }
    // assumes target or event.target is canvas
    get_mouse_canvas(event, target) {
        target = target || event.target;
        var pos = this.get_mouse_relative(event, target);
        pos.x = pos.x * target.width / target.clientWidth;
        pos.y = pos.y * target.height / target.clientHeight;
        return pos;
    }
    get_touch_relative(event, target) {
        target = target || event.target;
        var rect = target.getBoundingClientRect();
        return { x: event.touches[0].clientX - rect.left, y: event.touches[0].clientY - rect.top };
    }
    // assumes target or event.target is canvas
    get_touch_canvas(event, target) {
        target = target || event.target;
        var pos = this.get_touch_relative(event, target);
        pos.x = pos.x * target.width / target.clientWidth;
        pos.y = pos.y * target.height / target.clientHeight;
        return pos;
    }
}
//# sourceMappingURL=user_input.js.map