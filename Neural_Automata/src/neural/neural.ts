import { app2D } from './app2D.js'
import { app3D } from './app3D.js'
import { user_input } from './user_input.js'
import { webgl_util } from './webgl_util.js'

export class neural
{
    public app2d: app2D
    public app3d: app3D
    private curr_app: string

    public canvas: HTMLCanvasElement
    public context: WebGL2RenderingContext

    // input
    public user_input: user_input

    constructor()
    {
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement
        this.context = webgl_util.request_context(this.canvas)
        this.app2d = new app2D(this)
        this.app3d = new app3D(this)

        this.user_input = new user_input(this.canvas, this)
        this.curr_app = 'app2d'
    }

    public set_2d()
    {
        this.curr_app = 'app2d'
        this.app3d.end()
        this.app2d.start()
    }

    public set_3d()
    {
        this.curr_app = 'app3d'
        this.app2d.end()
        this.app3d.start()
    }

    public toggle_apps()
    {
        if (this.curr_app == 'app2d')
        {
            this.set_3d()
        }
        else if (this.curr_app == 'app3d')
        {
            this.set_2d()
        }
    }
}

export function init_neural(): void 
{
   const single: neural = new neural()
   single.set_2d()
}