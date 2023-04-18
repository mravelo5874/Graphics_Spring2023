import { webgl_util } from './webgl_util.js'
import { Mat3 } from "../lib/TSM.js";
import { neural_automata_vertex, neural_automata_fragment} from './shaders.js' 
// http-server dist -c-1

export class app
{
  private canvas: HTMLCanvasElement
  private context: WebGL2RenderingContext

  // neural program
  private program
  private pos_attr
  private color_uni
  private matrix_uni
  private pos_buffer

  // for canvas resizing
  public static canvas_to_disp_size: Map<HTMLCanvasElement, number[]>
  private resize_observer: ResizeObserver

  // used to calculate fps
  private fps: number;
  private start_time: number;
  private prev_time: number;
  private curr_delta_time: number;
  private prev_fps_time: number;
  private frame_count: number = 0;

  // UI nodes
  private fps_node: Text;
  private res_node: Text;

  constructor(_canvas: HTMLCanvasElement)
  {
    this.canvas = _canvas
    this.context = webgl_util.request_context(this.canvas);

    // setup GLSL program
    this.program = webgl_util.createProgram(this.context, neural_automata_vertex, neural_automata_fragment);
    this.context.useProgram(this.program);

    // vertex + uniform data
    this.pos_attr = this.context.getAttribLocation(this.program, 'a_pos')
    this.color_uni = this.context.getUniformLocation(this.program, 'u_color')
    this.matrix_uni = this.context.getUniformLocation(this.program, 'u_matrix')

    // bind position buffer
    this.pos_buffer = this.context.createBuffer()
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this.pos_buffer)
    
    // handle canvas resize
    app.canvas_to_disp_size = new Map([[this.canvas, [300, 150]]]);
    this.resize_observer = new ResizeObserver(this.on_resize)
    this.resize_observer.observe(this.canvas, {box: 'content-box'});

    // set current time
    this.start_time = Date.now()
    this.prev_time = Date.now()
    this.prev_fps_time = Date.now()
    this.curr_delta_time = 0
    this.fps = 0

    // add fps text element to screen
    const fps_element = document.querySelector("#fps");
    this.fps_node = document.createTextNode("");
    fps_element?.appendChild(this.fps_node);
    this.fps_node.nodeValue = ''

    // add res text element to screen
    const res_element = document.querySelector("#res");
    this.res_node = document.createTextNode("");
    res_element?.appendChild(this.res_node);
    this.res_node.nodeValue = ''
  }

  public get_delta_time(): number { return this.curr_delta_time }
  public get_elapsed_time(): number { return Date.now() - this.start_time }

  public start(): void
  {
    window.requestAnimationFrame(() => this.draw_loop());
  }

  private draw(): void
  {
    let gl = this.context

    let time = this.get_elapsed_time() * 0.001

    this.resize_canvas_to_display_size(this.canvas)

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(this.program)
    gl.enableVertexAttribArray(this.pos_attr)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.pos_buffer)

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        this.pos_attr, size, type, normalize, stride, offset);

    // Set Geometry.
    var radius = Math.sqrt(gl.canvas.width * gl.canvas.width + gl.canvas.height * gl.canvas.height) * 0.5;
    var angle = time;
    var x = Math.cos(angle) * radius;
    var y = Math.sin(angle) * radius;
    var centerX = gl.canvas.width  / 2;
    var centerY = gl.canvas.height / 2;
    this.set_geometry(gl, centerX + x, centerY + y, centerX - x, centerY - y);
      
    const proj_matrix: Mat3 = Mat3.projection(gl.canvas.width, gl.canvas.height)
    
    // Set the matrix.
    gl.uniformMatrix3fv(this.matrix_uni, false, proj_matrix.all());

    // Draw in red
    gl.uniform4fv(this.color_uni, [1, 0, 0, 1]);

    // Draw the geometry.
    var primitiveType = gl.LINES;
    var offset = 0;
    var count = 2;
    gl.drawArrays(primitiveType, offset, count);
  }

  private set_geometry(gl, x1, y1, x2, y2) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            x1, y1,
            x2, y2]),
        gl.STATIC_DRAW);
  }

  private on_resize(entries) 
  {
    for (const entry of entries) {
      let width;
      let height;
      let dpr = window.devicePixelRatio;
      if (entry.devicePixelContentBoxSize) {
        // NOTE: Only this path gives the correct answer
        // The other 2 paths are an imperfect fallback
        // for browsers that don't provide anyway to do this
        width = entry.devicePixelContentBoxSize[0].inlineSize;
        height = entry.devicePixelContentBoxSize[0].blockSize;
        dpr = 1; // it's already in width and height
      } else if (entry.contentBoxSize) {
        if (entry.contentBoxSize[0]) {
          width = entry.contentBoxSize[0].inlineSize;
          height = entry.contentBoxSize[0].blockSize;
        } else {
          // legacy
          width = entry.contentBoxSize.inlineSize;
          height = entry.contentBoxSize.blockSize;
        }
      } else {
        // legacy
        width = entry.contentRect.width;
        height = entry.contentRect.height;
      }
      const displayWidth = Math.round(width * dpr);
      const displayHeight = Math.round(height * dpr);
      app.canvas_to_disp_size.set(entry.target, [displayWidth, displayHeight]);
    }
  }

  private resize_canvas_to_display_size(canvas) 
  {
    // Get the size the browser is displaying the canvas in device pixels.
    const [displayWidth, displayHeight] = app.canvas_to_disp_size.get(canvas) as number[];
    this.res_node.nodeValue = displayWidth + ' x ' + displayHeight

    // Check if the canvas is not the same size.
    const needResize = canvas.width  !== displayWidth ||
                       canvas.height !== displayHeight;

    if (needResize) {
      // Make the canvas the same size
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }

    return needResize;
  }

  /* Draws and then requests a draw for the next frame */
  public draw_loop(): void
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
    window.requestAnimationFrame(() => this.draw_loop());
  }
}

export function init_app(): void 
{
  // get canvas element from document
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  const neural_app: app = new app(canvas)
  neural_app.start()
}
