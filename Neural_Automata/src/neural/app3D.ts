import { neural } from "./neural";

export class app3D
{
    private neural_app: neural
    private canvas: HTMLCanvasElement
    private context: WebGL2RenderingContext

    constructor(_neural: neural)
    {
        this.neural_app = _neural
        this.canvas = _neural.canvas
        this.context = _neural.context
    }

    public reset()
    {

    }

    public start()
    {
        this.reset()
        this.neural_app.auto_node.nodeValue = 'none'
        this.neural_app.shade_node.nodeValue = 'none'
    }

    public end()
    {
        // idk something ?
    }

    public draw_loop(): void
    {
        let gl = this.context
        let w = this.canvas.width
        let h = this.canvas.height

        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.viewport(0, 0, w, h)
    }
}