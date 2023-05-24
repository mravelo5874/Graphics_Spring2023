import { automata, shader_mode } from './app2D.js'
import { neural } from './neural.js'
import { Vec3 } from '../lib/TSM.js'
import { colormap, volume_type } from './app3D.js'
import  Rand  from "../lib/rand-seed/Rand.js"
import { app2D } from './app2D.js'
import { utils } from './utils.js'

export class user_input
{
    private neural_app: neural
    public mouse_down: boolean = false
    private key_lock: boolean = false
    private can_randomize: boolean = true
    private can_reset: boolean = true
    private prev_x: number
    private prev_y: number

    constructor(canvas: HTMLCanvasElement, _neural: neural)
    {
        this.neural_app = _neural
        canvas.addEventListener("contextmenu", (event: any) => event.preventDefault())

        // event listeners for keyboard input
        window.addEventListener("keydown", (key: KeyboardEvent) => this.on_key_down(key))
        window.addEventListener("keyup", (key: KeyboardEvent) => this.on_key_up(key))
        // event listeners for mouse input
        canvas.addEventListener("mousedown", (mouse: MouseEvent) => this.mouse_start(mouse))
        canvas.addEventListener("mousemove", (mouse: MouseEvent) => this.mouse_drag(mouse))
        canvas.addEventListener("mouseup", (mouse: MouseEvent) => this.mouse_end(mouse))
        canvas.addEventListener("wheel", (event: WheelEvent) => this.mouse_wheel(event))
        // event listeners for touch input
        canvas.addEventListener("touchstart", (touch: TouchEvent) => this.touch_start(touch))
        canvas.addEventListener("touchmove", (touch: TouchEvent) => this.touch_drag(touch))
        canvas.addEventListener("touchend", (touch: TouchEvent) => this.touch_end(touch))
    }

    private on_key_down(key: KeyboardEvent)
    {
        if (this.key_lock) return
        this.key_lock = true

        //     case 'KeyZ':
        //         switch (this.neural_app.curr_app)
        //         {
        //             case 'app3d':
        //                 this.neural_app.app3d.reset(volume_type.neural)
        //                 this.neural_app.app3d.randomize_kernel()
        //                 break
        //         }
        //         break
    }

    public toggle_shade(rev: boolean)
    {
        switch (this.neural_app.curr_app)
        {
            case 'app2d':
                if (rev) this.neural_app.app2d.shader_right()
                else this.neural_app.app2d.shader_left()
                break
            case 'app3d':
                if (rev) this.neural_app.app3d.colormap_right()
                else this.neural_app.app3d.colormap_left()
                break
        }
    }

    public toggle_automata(rev: boolean)
    {
        switch (this.neural_app.curr_app)
        {
            case 'app2d':
                if (rev) this.neural_app.app2d.go_right()
                else this.neural_app.app2d.go_left()
                break
            case 'app3d':
                if (rev) this.neural_app.app3d.go_right()
                else this.neural_app.app3d.go_left()
                break
        }
    }

    public reset()
    {
        if (!this.can_reset) return
        this.can_reset = false

        switch (this.neural_app.curr_app)
        {
            case 'app2d':
                this.neural_app.app2d.reset()
                break
            case 'app3d':
                this.neural_app.app3d.reset()
                break
        }

         // add delay between randomizations
         (async () => { 
            await utils.delay(100)
            this.can_reset = true
        })();
    }

    public toggle_pause()
    {
        switch (this.neural_app.curr_app)
        {
            case 'app2d':
                this.neural_app.app2d.toggle_pause()
                break
            case 'app3d':
                this.neural_app.app3d.toggle_pause()
                break
        }
    }

    public randomize()
    {
        if (!this.can_randomize) return
        this.can_randomize = false

        let rng = new Rand(Date.now().toString())
        // determin between 2d and 3d
        if (rng.next() > 0.5)
        {
            // set 3d
            this.neural_app.set_3d()
            // randomize automata
            let auto = Math.floor(rng.next() * (volume_type.END - 1))
            this.neural_app.app3d.reset(auto, false)
            // randomize shade
            let color = Math.floor(rng.next() * (colormap.END - 1))
            this.neural_app.app3d.set_colormap(color)
        }
        else
        {
            // set 2d
            this.neural_app.set_2d()
            // randomize automata
            let auto = Math.floor(rng.next() * (automata.END - 1))
            // randomize shade
            let shade = Math.floor(rng.next() * (shader_mode.END - 1))
            this.neural_app.app2d.reset(auto, shade)
        }

        // randomize brush
        let brush = rng.next() * app2D.max_brush
        this.neural_app.app2d.set_brush(brush)
        // randomize zoom
        let zoom = rng.next() * this.neural_app.app3d.max_zoom
        this.neural_app.app3d.set_zoom(zoom);

        // add delay between randomizations
        (async () => { 
            await utils.delay(100)
            this.can_randomize = true
        })();
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

    private touch_start(touch: TouchEvent)
    {   
        // draw with mouse if in 2d mode
        const pos = this.get_touch_canvas(touch, this.neural_app.canvas)

        this.prev_x = pos.x / this.neural_app.canvas.width
        this.prev_y = pos.y / this.neural_app.canvas.height
        this.mouse_down = true
    }

    private touch_drag(touch: TouchEvent)
    {
        // draw with mouse if in 2d mode
        const pos = this.get_touch_canvas(touch, this.neural_app.canvas)
        const x = pos.x / this.neural_app.canvas.width
        const y = pos.y / this.neural_app.canvas.height
        const dx = x - this.prev_x;
        const dy = y - this.prev_y;
        this.prev_x = x
        this.prev_y = y

        if (this.mouse_down)
        {
            switch (touch.touches.length)
            {
                case 1:
                {
                    if (this.neural_app.curr_app == 'app2d')
                    { 
                        this.neural_app.app2d.mouse_erase(x, y)
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
                        this.neural_app.app2d.mouse_draw(x, y)
                    }
                    else if (this.neural_app.curr_app == 'app3d')
                    {
                        this.neural_app.app3d.camera_zoom(dy)
                    }
                    break
                }
            }
        }
    }

    private touch_end(touch: TouchEvent)
    {   
        this.mouse_down = false
    }

    private mouse_start(mouse: MouseEvent)
    {
        // return if screen size too small
        if (this.neural_app.canvas.width <= 600) return;

        // draw with mouse if in 2d mode
        const pos = this.get_mouse_canvas(mouse, this.neural_app.canvas)
        this.prev_x = pos.x / this.neural_app.canvas.width
        this.prev_y = pos.y / this.neural_app.canvas.height
        this.mouse_down = true
    }

    private mouse_drag(mouse: MouseEvent)
    {
        // return if screen size too small
        if (this.neural_app.canvas.width <= 600) return;

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
                        this.neural_app.app2d.mouse_draw(x, y)
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
                        this.neural_app.app2d.mouse_erase(x, y)
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
        // return if screen size too small
        if (this.neural_app.canvas.width <= 600) return;

        this.mouse_down = false
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

    private get_touch_relative(event: TouchEvent, target) 
    {
        target = target || event.target
        var rect = target.getBoundingClientRect()
        return { x: event.touches[0].clientX - rect.left, y: event.touches[0].clientY - rect.top }
    }
      
    // assumes target or event.target is canvas
    private get_touch_canvas(event: TouchEvent, target)
    {
        target = target || event.target
        var pos = this.get_touch_relative(event, target)
        pos.x = pos.x * target.width  / target.clientWidth
        pos.y = pos.y * target.height / target.clientHeight
        return pos
    }
}