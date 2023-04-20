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
                this.app.reset(automata.waves);
                break;
            case 'Digit3':
                this.app.reset(automata.paths);
                break;
            case 'Digit4':
                this.app.reset(automata.gol);
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
    mouse_drag(mouse) {
        if (this.mouse_down) {
            //console.log('mouse pos (offset): ' + x + ', ' + y)
            //console.log('mouse pos (screen): ' + this.prev_x + ', ' + this.prev_y)
            switch (mouse.buttons) {
                case 1:
                    {
                        this.app.mouse_draw(mouse.x, mouse.y, 64);
                        break;
                    }
                case 2:
                    {
                        this.app.mouse_erase(this.prev_x, this.prev_y, 25);
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