import { Debugger } from "../lib/webglutils/Debugging.js";
import {
  CanvasAnimation,
} from "../lib/webglutils/CanvasAnimation.js";
import { GUI } from "./Gui.js";
import {
  blankCubeFSText,
  blankCubeVSText,

  ray_vertex_shader,
  ray_fragment_shader,

  water_1_vertex_shader,
  water_1_fragment_shader,
} from "./Shaders.js";
import { Mat4, Vec4, Vec3, Vec2 } from "../lib/TSM.js";


export class NeuralAnimation extends CanvasAnimation
{
  private gui: GUI;
  public getGUI(): GUI { return this.gui; }  

  /* Global Rendering Info */
  private lightPosition: Vec4;
  private backgroundColor: Vec4;
  private canvas2d: HTMLCanvasElement;
  
  constructor(canvas: HTMLCanvasElement) 
  {
    super(canvas);
    this.canvas2d = document.getElementById("textCanvas") as HTMLCanvasElement;
    this.ctx = Debugger.makeDebugContext(this.ctx);
    let gl = this.ctx;
    this.gui = new GUI(this.canvas2d, this);

    // environment stuff
    this.lightPosition = new Vec4([-1000, 1000, -1000, 1]);
    this.backgroundColor = new Vec4([1.0, 1.0, 1.0, 1.0]);
  }


  /**
   * Setup the simulation. This can be called again to reset the program.
   */
  public reset(): void 
  {    
    // reset gui
    this.gui.reset();
  }


  /**
   * Draws a single frame
   *
   */
  public draw(): void 
  {
    // Drawing
    const gl: WebGLRenderingContext = this.ctx;
    const bg: Vec4 = this.backgroundColor;
    gl.clearColor(bg.r, bg.g, bg.b, bg.a);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null); // null is the default frame buffer
    this.drawScene(0, 0, 1280, 960);        
  }

  private drawScene(x: number, y: number, width: number, height: number): void 
  {
    const gl: WebGLRenderingContext = this.ctx;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(x, y, width, height);
  }
}

export function initializeCanvas(): void 
{
  const canvas = document.getElementById("glCanvas") as HTMLCanvasElement;
  /* Start drawing */
  const canvasAnimation: NeuralAnimation = new NeuralAnimation(canvas);
  canvasAnimation.start();  
}
