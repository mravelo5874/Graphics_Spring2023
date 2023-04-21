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
                this.app.reset(automata.drops)
                break
            case 'Digit3':
                this.app.reset(automata.waves)
                break
            case 'Digit4':
                this.app.reset(automata.paths)
                break
            case 'Digit5':
                this.app.reset(automata.stars)
                break
            case 'Digit6':
                this.app.reset(automata.cells)
                break
            case 'Digit7':
                this.app.reset(automata.slime)
                break
            case 'Digit8':
                this.app.reset(automata.lands)
                break
            case 'Digit9':
                this.app.reset(automata.wolfy)
                break
            case 'Digit0':
                this.app.reset(automata.cgol)
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

    // thanks to:
    // https://stackoverflow.com/questions/42309715/how-to-correctly-pass-mouse-coordinates-to-webgl
    private get_mouse_relative(event, target) 
    {
        target = target || event.target
        var rect = target.getBoundingClientRect()
        return { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }
      
    // assumes target or event.target is canvas
    private get_mouse_canvas(event, target) 
    {
        target = target || event.target
        var pos = this.get_mouse_relative(event, target)
        pos.x = pos.x * target.width  / target.clientWidth
        pos.y = pos.y * target.height / target.clientHeight
        return pos
    }

    private mouse_drag(mouse: MouseEvent)
    {
        const pos = this.get_mouse_canvas(mouse, this.app.canvas)
        // pos is in pixel coordinates for the canvas.
        // so convert to WebGL clip space coordinates
        const x = pos.x / this.app.canvas.width
        const y = pos.y / this.app.canvas.height
        if (this.mouse_down)
        {
            switch (mouse.buttons)
            {
                case 1:
                {
                    this.app.mouse_draw(x, y, 32)
                    break
                }
                case 2:
                {
                    this.app.mouse_erase(x, y, 32)
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