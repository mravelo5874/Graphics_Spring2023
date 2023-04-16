import { Debugger } from "../lib/webglutils/Debugging.js";
import { CanvasAnimation } from "../lib/webglutils/CanvasAnimation.js";
import { GUI } from "./Gui.js";
import { Vec4 } from "../lib/TSM.js";

// http-server dist -c-1

export class NeuralAnimation extends CanvasAnimation
{
  // gui vars
  private gui: GUI

  // canvas vars
  private background_color: Vec4
  private canvas2d: HTMLCanvasElement
  private width: number = 64
  private height: number = 64

  // used to calculate fps
  private start_time: number
  private prev_time: number
  private curr_delta_time: number = 0
  private fps: number = 0
  private prev_fps_time: number = 0
  private frame_count: number = 0

  // UI nodes
  private fps_node: Text

  // time variables
  public get_delta_time(): number { return this.curr_delta_time }
  public get_elapsed_time(): number { return Date.now() - this.start_time }

  public get_width(): number { return this.width }
  public get_height(): number { return this.height }

  public set_resolution(_width: number, _height: number)
  {
    if (_width <= 0 || _height <= 0)
    {
      console.log('[WARNING] Invalid resolution: ' + _width + 'x' + _height)
      return
    }
    this.width = _width
    this.height = _height
    console.log('set res: ' + this.width + 'x' + this.height)
  }
  
  constructor(canvas: HTMLCanvasElement) 
  {
    // init
    super(canvas);
    this.canvas2d = document.getElementById("textCanvas") as HTMLCanvasElement;
    this.contex = Debugger.makeDebugContext(this.contex);
    this.background_color = new Vec4([0.3, 0.2, 0.6, 1.0])

    // set current time
    this.start_time = Date.now()
    this.prev_time = Date.now()
    this.prev_fps_time = Date.now()
  
    // add fps text element to screen
    const fps_element = document.querySelector("#fps");
    this.fps_node = document.createTextNode("");
    fps_element?.appendChild(this.fps_node);
    this.fps_node.nodeValue = this.fps.toFixed(0);

    this.gui = new GUI(canvas, this)
  }

  public reset(): void 
  {    
    this.gui.reset()
  }

  public draw_loop(): void
  {
    // calculate current delta time
    const curr_time: number = Date.now()
    this.curr_delta_time = (curr_time - this.prev_time)
    this.prev_time = curr_time

    // draw to screen
    this.draw()
    this.frame_count++

    // calculate fps
    if (Date.now() - this.prev_fps_time >= 1000)
    {
      this.fps = this.frame_count
      this.frame_count = 0
      this.prev_fps_time = Date.now()
      this.fps_node.nodeValue = this.fps.toFixed(0);
    }

    // request next frame to be drawn
    window.requestAnimationFrame(() => this.draw_loop())
  }

  public draw(): void 
  {
    // Drawing
    const gl: WebGLRenderingContext = this.contex;
    const bg: Vec4 = this.background_color;
    gl.clearColor(bg.r, bg.g, bg.b, bg.a);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null); // null is the default frame buffer
    this.draw_scene(0, 0, this.width, this.height);        
  }

  private draw_scene(x: number, y: number, width: number, height: number): void 
  {
    const gl: WebGLRenderingContext = this.contex;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(x, y, width, height);
  }
}

export function init_canvas(): void 
{
  const canvas = document.getElementById("glCanvas") as HTMLCanvasElement
  const neural: NeuralAnimation = new NeuralAnimation(canvas)
  neural.start()
}
