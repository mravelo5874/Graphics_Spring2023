import { automata } from './app.js';
export class user_input {
    constructor(canvas, neural_app) {
        // mouse variables
        this.mouse_down = false;
        this.app = neural_app;
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
        switch (key.code) {
            case 'Digit1':
                this.app.reset(automata.worms);
                break;
            case 'Digit2':
                this.app.reset(automata.drops);
                break;
            case 'Digit3':
                this.app.reset(automata.waves);
                break;
            case 'Digit4':
                this.app.reset(automata.paths);
                break;
            case 'Digit5':
                this.app.reset(automata.stars);
                break;
            case 'Digit6':
                this.app.reset(automata.cells);
                break;
            case 'Digit7':
                this.app.reset(automata.slime);
                break;
            case 'Digit8':
                this.app.reset(automata.borders);
                break;
            case 'Digit9':
                this.app.reset(automata.wolfy);
                break;
            case 'Digit0':
                this.app.reset(automata.cgol);
                break;
            case 'KeyR':
                this.app.reset(this.app.curr_automata);
                break;
            default:
                console.log('Key : \'', key.code, '\' was pressed.');
                break;
        }
    }
    on_key_up(key) {
    }
    mouse_start(mouse) {
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
        const pos = this.get_mouse_canvas(mouse, this.app.canvas);
        // pos is in pixel coordinates for the canvas.
        // so convert to WebGL clip space coordinates
        const x = pos.x / this.app.canvas.width;
        const y = pos.y / this.app.canvas.height;
        if (this.mouse_down) {
            switch (mouse.buttons) {
                case 1:
                    {
                        this.app.mouse_draw(x, y, 32);
                        break;
                    }
                case 2:
                    {
                        this.app.mouse_erase(x, y, 32);
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