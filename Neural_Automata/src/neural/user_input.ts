import { app, automata } from './app.js'


export class user_input
{
    private app: app

    // mouse variables
    private mouse_down: boolean = false
    private prev_x: number
    private prev_y: number

    constructor(canvas: HTMLCanvasElement, neural_app: app)
    {
        this.app = neural_app

        // event listeners for keyboard input
        window.addEventListener("keydown", (key: KeyboardEvent) => this.on_key_down(key))
        window.addEventListener("keyup", (key: KeyboardEvent) => this.on_key_up(key))
        // event listeners for mouse input
        canvas.addEventListener("mousedown", (mouse: MouseEvent) => this.mouse_start(mouse))
        canvas.addEventListener("mousemove", (mouse: MouseEvent) => this.mouse_drag(mouse))
        canvas.addEventListener("mouseup", (mouse: MouseEvent) => this.mouse_end(mouse))
        canvas.addEventListener("contextmenu", (event: any) => event.preventDefault())
    }

    private on_key_down(key: KeyboardEvent)
    {
        switch (key.code) 
        {
            case 'Digit1':
                this.app.reset(automata.worms)
                break
            case 'Digit2':
                this.app.reset(automata.waves)
                break
            case 'Digit3':
                this.app.reset(automata.paths)
                break
            case 'Digit4':
                this.app.reset(automata.gol)
                break
            case 'KeyR': 
                this.app.reset(this.app.curr_automata)
                break
            default:
                console.log('Key : \'', key.code, '\' was pressed.');
                break
        }
    }

    private on_key_up(key: KeyboardEvent)
    {

    }

    private mouse_start(mouse: MouseEvent)
    {
        this.mouse_down = true
    }

    private mouse_drag(mouse: MouseEvent)
    {
        if (this.mouse_down)
        {
            //console.log('mouse pos (offset): ' + x + ', ' + y)
            //console.log('mouse pos (screen): ' + this.prev_x + ', ' + this.prev_y)

            switch (mouse.buttons) 
            {
                case 1:
                {
                    this.app.mouse_draw(mouse.x ,mouse.y, 64)
                    break
                }
                case 2:
                {
                    this.app.mouse_erase(this.prev_x, this.prev_y, 25)
                    break
                }
            }
        }
    }

    private mouse_end(mouse: MouseEvent)
    {
        this.mouse_down = false
    }
}