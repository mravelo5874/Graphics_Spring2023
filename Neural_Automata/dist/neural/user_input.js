import { automata, shader_mode } from './app2D.js';
import { Vec3 } from '../lib/TSM.js';
export class user_input {
    constructor(canvas, _neural) {
        this.mouse_down = false;
        this.key_lock = false;
        this.neural_app = _neural;
        // event listeners for keyboard input
        window.addEventListener("keydown", (key) => this.on_key_down(key));
        window.addEventListener("keyup", (key) => this.on_key_up(key));
        // event listeners for mouse input
        canvas.addEventListener("mousedown", (mouse) => this.mouse_start(mouse));
        canvas.addEventListener("mousemove", (mouse) => this.mouse_drag(mouse));
        canvas.addEventListener("mouseup", (mouse) => this.mouse_end(mouse));
        canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    }
    on_key_down(key) {
        if (this.key_lock)
            return;
        this.key_lock = true;
        switch (key.code) {
            // switch between 2d and 3d app
            case 'Space':
                this.neural_app.toggle_apps();
                break;
            // toggle modes
            case 'ShiftLeft':
                this.neural_app.app2d.toggle_shader();
                break;
            case 'ControlLeft':
                this.neural_app.app2d.toggle_automata();
                break;
            // maually set modes
            case 'KeyQ':
                this.neural_app.app2d.reset(this.neural_app.app2d.auto, shader_mode.rgb);
                break;
            case 'KeyW':
                this.neural_app.app2d.reset(this.neural_app.app2d.auto, shader_mode.alpha);
                break;
            case 'KeyE':
                this.neural_app.app2d.reset(this.neural_app.app2d.auto, shader_mode.bnw);
                break;
            case 'KeyA':
                this.neural_app.app2d.reset(this.neural_app.app2d.auto, shader_mode.acid);
                break;
            case 'Digit1':
                this.neural_app.app2d.reset(automata.worms, this.neural_app.app2d.mode);
                break;
            case 'Digit2':
                this.neural_app.app2d.reset(automata.drops, this.neural_app.app2d.mode);
                break;
            case 'Digit3':
                this.neural_app.app2d.reset(automata.waves, this.neural_app.app2d.mode);
                break;
            case 'Digit4':
                this.neural_app.app2d.reset(automata.paths, this.neural_app.app2d.mode);
                break;
            case 'Digit5':
                this.neural_app.app2d.reset(automata.stars, this.neural_app.app2d.mode);
                break;
            case 'Digit6':
                this.neural_app.app2d.reset(automata.cells, this.neural_app.app2d.mode);
                break;
            case 'Digit7':
                this.neural_app.app2d.reset(automata.slime, this.neural_app.app2d.mode);
                break;
            case 'Digit8':
                this.neural_app.app2d.reset(automata.lands, this.neural_app.app2d.mode);
                break;
            case 'Digit9':
                this.neural_app.app2d.reset(automata.wolfy, this.neural_app.app2d.mode);
                break;
            case 'Digit0':
                this.neural_app.app2d.reset(automata.cgol, this.neural_app.app2d.mode);
                break;
            case 'KeyR':
                this.neural_app.app2d.reset(this.neural_app.app2d.auto, this.neural_app.app2d.mode);
                break;
            default:
                console.log('Key : \'', key.code, '\' was pressed.');
                break;
        }
    }
    on_key_up(key) {
        this.key_lock = false;
    }
    mouse_start(mouse) {
        // draw with mouse if in 2d mode
        const pos = this.get_mouse_canvas(mouse, this.neural_app.canvas);
        const x = pos.x / this.neural_app.canvas.width;
        const y = pos.y / this.neural_app.canvas.height;
        this.prev_x = x;
        this.prev_y = y;
        this.mouse_down = true;
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
    mouse_drag(mouse) {
        // draw with mouse if in 2d mode
        const pos = this.get_mouse_canvas(mouse, this.neural_app.canvas);
        const x = pos.x / this.neural_app.canvas.width;
        const y = pos.y / this.neural_app.canvas.height;
        const dx = x - this.prev_x;
        const dy = y - this.prev_y;
        if (this.mouse_down) {
            switch (mouse.buttons) {
                case 1:
                    {
                        if (this.neural_app.curr_app == 'app2d') {
                            this.neural_app.app2d.mouse_draw(x, y, 32);
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
                            camera.orbitTarget(rotAxis, this.neural_app.app3d.rot_speed);
                        }
                        break;
                    }
                case 2:
                    {
                        if (this.neural_app.curr_app == 'app2d') {
                            this.neural_app.app2d.mouse_erase(x, y, 32);
                        }
                        else if (this.neural_app.curr_app == 'app3d') {
                        }
                        break;
                    }
            }
        }
    }
    mouse_end(mouse) {
        this.mouse_down = false;
    }
}
//# sourceMappingURL=user_input.js.map