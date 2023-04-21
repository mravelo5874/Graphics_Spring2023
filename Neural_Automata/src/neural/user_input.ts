import { app, automata, shader_mode } from './app.js'


export class user_input
{
    private app: app
    private mouse_down: boolean = false
    private key_lock: boolean = false

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
        if (this.key_lock) return
        this.key_lock = true

        switch (key.code) 
        {
            case 'KeyQ':
                this.app.reset(this.app.auto, shader_mode.rgb)
                break
            case 'KeyW':
                this.app.reset(this.app.auto, shader_mode.alpha)
                break
            case 'Digit1':
                this.app.reset(automata.worms, this.app.mode)
                break
            case 'Digit2':
                this.app.reset(automata.drops, this.app.mode)
                break
            case 'Digit3':
                this.app.reset(automata.waves, this.app.mode)
                break
            case 'Digit4':
                this.app.reset(automata.paths, this.app.mode)
                break
            case 'Digit5':
                this.app.reset(automata.stars, this.app.mode)
                break
            case 'Digit6':
                this.app.reset(automata.cells, this.app.mode)
                break
            case 'Digit7':
                this.app.reset(automata.slime, this.app.mode)
                break
            case 'Digit8':
                this.app.reset(automata.lands, this.app.mode)
                break
            case 'Digit9':
                this.app.reset(automata.wolfy, this.app.mode)
                break
            case 'Digit0':
                this.app.reset(automata.cgol, this.app.mode)
                break
            case 'KeyR': 
                this.app.reset(this.app.auto, this.app.mode)
                break
            default:
                console.log('Key : \'', key.code, '\' was pressed.');
                break
        }
    }

    private on_key_up(key: KeyboardEvent)
    {
        this.key_lock = false
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