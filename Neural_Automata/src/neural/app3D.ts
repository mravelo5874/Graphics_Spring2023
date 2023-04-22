import { neural } from "./neural";

export class app3D
{
    private canvas: HTMLCanvasElement
    private context: WebGL2RenderingContext

    constructor(_neural: neural)
    {
        this.canvas = _neural.canvas
        this.context = _neural.context
    }

    public start()
    {
        this.draw()
    }

    public end()
    {

    }

    private draw(): void
    {
        let gl = this.context
        let w = this.canvas.width
        let h = this.canvas.height

        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.viewport(0, 0, w, h)
    }
}