import { print } from "../../minecraft/Utils.js";
import { Vec2, Vec3 } from "../TSM.js";
import { Debugger, GLCallback, GLErrorCallback } from "./Debugging.js";

export class WebGLUtilities {

  /**
   * Creates and compiles a WebGL Shader from given source
   * @param ctx a WebGL rendering context. This has methods for compiling the shader.
   * @param shaderType can only be ctx.VERTEX_SHADER or ctx.FRAGMENT_SHADER.
   * @param source the shader source code as a string.
   * @return a WebGL shader
   */
  public static createShader(
    ctx: WebGLRenderingContext,
    shaderType: number,
    source: string
  ): WebGLShader {
    /* TODO: error checking */
    const shader: WebGLShader = ctx.createShader(shaderType) as WebGLShader;
    ctx.shaderSource(shader, source);
    ctx.compileShader(shader);

    /* Check for Compilation Errors */
    if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
      console.error("ERROR compiling shader!", ctx.getShaderInfoLog(shader));
    }
    return shader;
  }

  /**
   * Creates a shader program from the given vertex shader and fragment shader
   * @param vsSource the vertex shader source as a string
   * @param fsSource the fragment shader source as a string
   * @return a WebGLProgram
   */
  public static createProgram(
    ctx: WebGLRenderingContext,
    vsSource: string,
    fsSource: string
  ): WebGLProgram {
    /* TODO: error checking */

    const shaderProgram: WebGLProgram = ctx.createProgram() as WebGLProgram;

    const vertexShader: WebGLShader = WebGLUtilities.createShader(
      ctx,
      ctx.VERTEX_SHADER,
      vsSource
    );
    ctx.attachShader(shaderProgram, vertexShader);

    const fragmentShader: WebGLShader = WebGLUtilities.createShader(
      ctx,
      ctx.FRAGMENT_SHADER,
      fsSource
    );
    ctx.attachShader(shaderProgram, fragmentShader);

    ctx.linkProgram(shaderProgram);

    /* Check for Linker Errors */
    if (!ctx.getProgramParameter(shaderProgram, ctx.LINK_STATUS)) {
      console.error(
        "ERROR linking program!",
        ctx.getProgramInfoLog(shaderProgram)
      );
    }

    /* While debugging Validate Program */
    ctx.validateProgram(shaderProgram);
    if (!ctx.getProgramParameter(shaderProgram, ctx.VALIDATE_STATUS)) {
      console.error(
        "ERROR validating program!",
        ctx.getProgramInfoLog(shaderProgram)
      );
    }

    return shaderProgram;
  }

  /**
   * Returns a WebGL context for the given Canvas
   * @param canvas any HTML canvas element
   * @return the WebGL rendering context for the canvas
   */
  public static requestWebGLContext(
    canvas: HTMLCanvasElement
  ): WebGL2RenderingContext {
    /* Request WebGL Context */
    let ctx: WebGL2RenderingContext = canvas.getContext("webgl2", {
      preserveDrawingBuffer: true
    }) as WebGL2RenderingContext;

    if (!ctx) {
      console.log(
        "Your browser does not support WebGL, falling back",
        "to Experimental WebGL"
      );
      ctx = canvas.getContext("experimental-webgl") as WebGL2RenderingContext;
    }

    if (!ctx) {
      throw new Error(
        "Your browser does not support WebGL or Experimental-WebGL"
      );
    }

    return ctx;
  }
}

/**
 * An abstract class that defines the interface for any
 * animation class.
 */
export abstract class CanvasAnimation {
  protected c: HTMLCanvasElement;
  protected ctx: WebGL2RenderingContext;

  private start_time: number;
  private prev_time: number;
  private curr_delta_time: number;

  // used to calculate fps
  private fps: number;
  private prev_fps_time: number;
  private frame_count: number = 0;

  // UI nodes
  private fps_node: Text;
  private scale_node: Text;
  private height_node: Text;
  private pers_node: Text;
  private lacu_node: Text;
  private pos_node: Text;
  private chunk_node: Text;
  private mode_node: Text;

  // public set values for UI text
  public scale_ui: number
  public height_ui: number
  public pers_ui: number
  public lacu_ui: number
  public pos_ui: Vec3
  public chunk_ui: Vec2
  public mode_ui: boolean

  public get_delta_time(): number { return this.curr_delta_time }
  public get_elapsed_time(): number { return Date.now() - this.start_time }

  constructor(canvas: HTMLCanvasElement,
    debugMode : boolean = false,
    stopOnError: boolean = false,
    glErrorCallback: GLErrorCallback = Debugger.throwOnError,
    glCallback: GLCallback = Debugger.throwErrorOnUndefinedArg
    ) {
    // Create webgl rendering context
    this.c = canvas;
    this.ctx = WebGLUtilities.requestWebGLContext(this.c);

    // set current time
    this.start_time = Date.now()
    this.prev_time = Date.now()
    this.prev_fps_time = Date.now()
    this.curr_delta_time = 0
    this.fps = 0
    // set initial value
    this.scale_ui = 0
    this.height_ui = 0
    this.pers_ui = 0
    this.lacu_ui = 0
    
    if (debugMode) {
      this.ctx = Debugger.makeDebugContext(this.ctx, glErrorCallback, glCallback);
    }

    // add fps text element to screen
    const fps_element = document.querySelector("#fps");
    this.fps_node = document.createTextNode("");
    fps_element?.appendChild(this.fps_node);
    this.fps_node.nodeValue = this.fps.toFixed(0);  // no decimal place

    // add scale text element to screen
    const scale_element = document.querySelector("#scale");
    this.scale_node = document.createTextNode("");
    scale_element?.appendChild(this.scale_node);
    this.scale_node.nodeValue = this.scale_ui.toFixed(2)

    // add height text element to screen
    const height_element = document.querySelector("#height");
    this.height_node = document.createTextNode("");
    height_element?.appendChild(this.height_node);
    this.height_node.nodeValue = this.height_ui.toFixed(0)

    // add persistance text element to screen
    const pers_element = document.querySelector("#pers");
    this.pers_node = document.createTextNode("");
    pers_element?.appendChild(this.pers_node);
    this.pers_node.nodeValue = this.pers_ui.toFixed(2)

    // add lacunarity text element to screen
    const lacu_element = document.querySelector("#lacu");
    this.lacu_node = document.createTextNode("");
    lacu_element?.appendChild(this.lacu_node);
    this.lacu_node.nodeValue = this.lacu_ui.toFixed(2)

    // add player pos text element
    const pos_element = document.querySelector("#pos");
    this.pos_node = document.createTextNode("");
    pos_element?.appendChild(this.pos_node);
    this.pos_node.nodeValue = print.v3(Vec3.zero.copy(), 1)

    // add player chunk text element to screen
    const chunk_element = document.querySelector("#chunk");
    this.chunk_node = document.createTextNode("");
    chunk_element?.appendChild(this.chunk_node);
    this.chunk_node.nodeValue = print.v2(Vec2.zero.copy(), 0)

    // add player mode text element to screen
    const mode_element = document.querySelector("#mode");
    this.mode_node = document.createTextNode("");
    mode_element?.appendChild(this.mode_node);
    this.mode_node.nodeValue = this.mode_ui ? 'on' : 'off'
  }

  public update_ui(): void
  {
    this.fps_node.nodeValue = this.fps.toFixed(0);  // no decimal place
    this.scale_node.nodeValue = this.scale_ui.toFixed(2)
    this.height_node.nodeValue = this.height_ui.toFixed(0) // no decimal place
    this.pers_node.nodeValue = this.pers_ui.toFixed(2)
    this.lacu_node.nodeValue = this.lacu_ui.toFixed(2)
    this.pos_node.nodeValue = print.v3(this.pos_ui.copy(), 1)
    this.chunk_node.nodeValue = print.v2(this.chunk_ui.copy(), 0)
    this.mode_node.nodeValue = this.mode_ui ? 'on' : 'off'
  }

  /**
   * Resets the animation. Must be implemented
   */
  public abstract reset(): void;

  /**
   * Draws a single frame. Must be implemented.
   */
  public abstract draw(): void;

  /**
   * Draws and then requests a draw for the next frame.
   */
  public drawLoop(): void 
  {
    // calculate current delta time
    const curr_time: number = Date.now()
    this.curr_delta_time = (curr_time - this.prev_time)
    this.prev_time = curr_time

    // draw to screen
    this.draw();
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
    window.requestAnimationFrame(() => this.drawLoop());
  }

  /**
   * Starts the draw loop of the animation
   */
  public start(): void {
    window.requestAnimationFrame(() => this.drawLoop());
  }
}
