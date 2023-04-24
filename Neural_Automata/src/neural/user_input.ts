import { automata } from './app2D.js'
import { neural } from './neural.js'
import { Vec3 } from '../lib/TSM.js'
import { utils } from './utils.js'


export class user_input
{
    private neural_app: neural

    public mouse_down: boolean = false
    private key_lock: boolean = false
    private prev_x: number
    private prev_y: number

    constructor(canvas: HTMLCanvasElement, _neural: neural)
    {
        this.neural_app = _neural

        // event listeners for keyboard input
        window.addEventListener("keydown", (key: KeyboardEvent) => this.on_key_down(key))
        window.addEventListener("keyup", (key: KeyboardEvent) => this.on_key_up(key))
        // event listeners for mouse input
        canvas.addEventListener("mousedown", (mouse: MouseEvent) => this.mouse_start(mouse))
        canvas.addEventListener("mousemove", (mouse: MouseEvent) => this.mouse_drag(mouse))
        canvas.addEventListener("mouseup", (mouse: MouseEvent) => this.mouse_end(mouse))
        canvas.addEventListener("contextmenu", (event: any) => event.preventDefault())
        canvas.addEventListener("wheel", (event: WheelEvent) => this.mouse_wheel(event))
    }

    private on_key_down(key: KeyboardEvent)
    {
        if (this.key_lock) return
        this.key_lock = true

        switch (key.code) 
        {
            // switch between 2d and 3d app
            case 'Space':
                this.neural_app.toggle_apps()
                break
            // toggle modes
            case 'ShiftLeft':
                switch (this.neural_app.curr_app)
                {
                    case 'app2d':
                        this.neural_app.app2d.toggle_shader()
                        break
                    case 'app3d':
                        this.neural_app.app3d.toggle_colormap()
                        break
                }
                break
            case 'ControlLeft':
                switch (this.neural_app.curr_app)
                {
                    case 'app2d':
                        this.neural_app.app2d.toggle_automata()
                        break
                    case 'app3d':
                        this.neural_app.app3d.toggle_volume()
                        break
                }
                break
            case 'KeyR': 
                switch (this.neural_app.curr_app)
                {
                    case 'app2d':
                        this.neural_app.app2d.reset()
                        break
                    case 'app3d':
                        this.neural_app.app3d.reset()
                        break
                }
                break
            case 'KeyP':
                switch (this.neural_app.curr_app)
                {
                    case 'app3d':
                        this.neural_app.app3d.toggle_pause()
                        break
                }
                break
            case 'Backquote':
                if (this.neural_app.curr_app == 'app2d')
                    this.neural_app.app2d.reset(automata.cgol)
                break
            case 'ArrowUp':
                if (this.neural_app.curr_app == 'app3d')
                    this.neural_app.app3d.camera_zoom(-20)
                break
            case 'ArrowDown':
                if (this.neural_app.curr_app == 'app3d')
                    this.neural_app.app3d.camera_zoom(20)
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

    private mouse_wheel(wheel: WheelEvent)
    {
        if (this.neural_app.curr_app == 'app2d')
        { 
            // do something !
        }
        else if (this.neural_app.curr_app == 'app3d')
        {
            this.neural_app.app3d.camera_zoom(wheel.deltaY)
        }
    }

    private mouse_start(mouse: MouseEvent)
    {
        // draw with mouse if in 2d mode
        const pos = this.get_mouse_canvas(mouse, this.neural_app.canvas)
        this.prev_x = pos.x / this.neural_app.canvas.width
        this.prev_y = pos.y / this.neural_app.canvas.height
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
        // draw with mouse if in 2d mode
        const pos = this.get_mouse_canvas(mouse, this.neural_app.canvas)
        const x = pos.x / this.neural_app.canvas.width
        const y = pos.y / this.neural_app.canvas.height
        const dx = x - this.prev_x;
        const dy = y - this.prev_y;
        this.prev_x = x
        this.prev_y = y

        if (this.mouse_down)
        {
            switch (mouse.buttons)
            {
                case 1:
                {
                    if (this.neural_app.curr_app == 'app2d')
                    { 
                        this.neural_app.app2d.mouse_draw(x, y, 32)
                    }
                    else if (this.neural_app.curr_app == 'app3d')
                    {
                        // move camera if in 3d mode
                        let camera = this.neural_app.app3d.camera
                        const mouseDir: Vec3 = camera.right()
                        mouseDir.scale(-dx)
                        mouseDir.add(camera.up().scale(dy))
                        mouseDir.normalize()
                        // move camera
                        let rotAxis: Vec3 = Vec3.cross(camera.forward(), mouseDir)
                        rotAxis = rotAxis.normalize()

                        // make sure values are not NaN
                        if (dy != 0 || dx != 0)
                        {
                            camera.orbitTarget(rotAxis, this.neural_app.app3d.rot_speed)
                        }
                    }
                    break
                }
                case 2:
                {
                    if (this.neural_app.curr_app == 'app2d')
                    { 
                        this.neural_app.app2d.mouse_erase(x, y, 32)
                    }
                    else if (this.neural_app.curr_app == 'app3d')
                    {

                    }
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