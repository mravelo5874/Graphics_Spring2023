import { utils } from './utils.js'
import { neural_renderer } from './neural_renderer.js'
import { neural_automata_vertex, neural_automata_fragment } from './shaders/neural_shader.js' 
import { simple_vertex, simple_fragment } from './shaders/simple_shader.js' 
import { webgl_util } from './webgl_util.js'

// http-server dist -c-1

export class app
{
  // neural program
  private canvas: HTMLCanvasElement
  private context: WebGL2RenderingContext
  private simple_program: WebGLProgram
  private vertices: Float32Array
  private texture: WebGLTexture
  private prev_pixels: Uint8Array

  // used to calculate fps
  private fps: number;
  private start_time: number;
  private prev_time: number;
  private curr_delta_time: number;
  private prev_fps_time: number;
  private frame_count: number = 0;

  // used to cap fps
  private fps_cap: number = 30
  private frame_time: number

  // used for canvas resize
  private resize_observer: ResizeObserver
  public static canvas_to_disp_size: Map<HTMLCanvasElement, number[]>
  public static update_canvas: boolean

  // UI nodes
  private fps_node: Text;
  private res_node: Text;

  constructor(_canvas: HTMLCanvasElement)
  {
    // window.onresize = () => {
		// 	if (window.innerWidth === this.renderer.width && window.innerHeight === this.renderer.height)
		// 		return;
		// 	this.renderer.stop_render();
		// 	this.renderer.canvas.height = window.innerHeight;
		// 	this.renderer.canvas.width = window.innerWidth;
		// 	this.renderer.height = window.innerHeight;
		// 	this.renderer.width = window.innerWidth;
		// 	this.renderer.gl.viewport(0, 0, this.renderer.width, this.renderer.height);
		// 	this.renderer.set_state(utils.generate_random_state(this.renderer.width, this.renderer.height));
    //   this.renderer.start_render();
		// }

    // // set up renderer with canvas
    // this.renderer = new neural_renderer(_canvas)
    // this.renderer.set_activation(utils.DEFAULT_ACTIVATION)
    // this.renderer.set_kernel(utils.generate_random_kernel())
    // this.renderer.compile_shaders(neural_automata_vertex, neural_automata_fragment)
    // this.renderer.set_color(new Vec3([0.4, 0.2, 0.6]));
    // this.renderer.set_state(utils.generate_random_state(this.renderer.width, this.renderer.height));

    this.canvas = _canvas;
    this.context = webgl_util.request_context(this.canvas);
    this.frame_time = 1000 / this.fps_cap

    // set current time
    this.start_time = Date.now()
    this.prev_time = Date.now()
    this.prev_fps_time = Date.now()
    this.curr_delta_time = 0
    this.fps = 0

    // add fps text element to screen
    const fps_element = document.querySelector("#fps")
    this.fps_node = document.createTextNode("")
    fps_element?.appendChild(this.fps_node)
    this.fps_node.nodeValue = ''

    // add res text element to screen
    const res_element = document.querySelector("#res")
    this.res_node = document.createTextNode("")
    res_element?.appendChild(this.res_node)
    this.res_node.nodeValue = ''

    // handle canvas resize
    app.canvas_to_disp_size = new Map([[this.canvas, [512, 512]]])
    this.resize_observer = new ResizeObserver(this.on_resize)
    this.resize_observer.observe(this.canvas, { box: 'content-box' })
  }

  public get_delta_time(): number { return this.curr_delta_time }
  public get_elapsed_time(): number { return Date.now() - this.start_time }

  public reset(): void 
  {
    let gl = this.context

    // create shaders
    const vertex_shader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
    const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
    gl.shaderSource(vertex_shader, simple_vertex)
    gl.compileShader(vertex_shader)
    gl.shaderSource(fragment_shader, simple_fragment)
    gl.compileShader(fragment_shader)

    // used for debugging shaders
    const vertex_log = gl.getShaderInfoLog(vertex_shader)
    const fragment_log = gl.getShaderInfoLog(fragment_shader)
    if (vertex_log != '') console.log('vertex shader log: ' + vertex_log)
    if (fragment_log != '') console.log('fragment shader log: ' + fragment_log)
    
    // create program
    this.simple_program = gl.createProgram() as WebGLProgram
    let program = this.simple_program
    gl.attachShader(program, vertex_shader)
    gl.attachShader(program, fragment_shader)
    gl.linkProgram(program)

    // used for debugging program
    const program_log = gl.getProgramInfoLog(program)
    if (program_log != '') console.log('shader program log: ' + program_log)

    // two triangles fill the window
    this.vertices = new Float32Array([
      // lower triangle
      -1.0,-1.0,
      -1.0, 1.0,
        1.0,-1.0,
      // upper triangle
        1.0,-1.0,
      -1.0, 1.0,
        1.0, 1.0
    ])

    // // lower triangle
    // -0.9,-0.9,
    // -0.9, 0.9,
    // 0.9,-0.9,
    // // upper triangle
    // 0.9,-0.9,
    // -0.9, 0.9,
    // 0.9, 0.9
    
    // create vertices buffer
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW)

    // use program !!!
    gl.useProgram(program)

    // set color uniform
    const color_loc = gl.getUniformLocation(program, 'u_color')
    gl.uniform4fv(color_loc, [0.914, 0.855, 0.949, 1.0])

    // set texture uniform
    const texture_loc = gl.getUniformLocation(program, 'u_texture');
    this.texture = gl.createTexture() as WebGLTexture
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    // Fill the texture with random states
    const w = this.canvas.width
    const h = this.canvas.height
    let pixels: Uint8Array = utils.generate_random_state(w, h)
    console.log('init wxh: ' + w + ', ' + h + ', init pixels: ' + pixels.length)
    this.prev_pixels = pixels
    //console.log('pixels.length: ' + pixels.length + ', wxhx4: ' + w * h * 4)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    // Tell the shader to use texture unit 0 for u_texture
    gl.uniform1i(texture_loc, 0)

    // set kernel array uniform
    const kernel_loc = gl.getUniformLocation(program, 'u_kernel[0]')
    let kernel: Float32Array = utils.worms_kernel()
    gl.uniform1fv(kernel_loc, kernel)

    // set resolution uniform
    const res_loc = gl.getUniformLocation(program, "u_res")
    let res: Float32Array = new Float32Array([w, h])
    console.log('res: ' + res)
    gl.uniform2fv(res_loc, res)

    // set position attribute
    const pos_loc = gl.getAttribLocation(program, 'a_pos')
    gl.enableVertexAttribArray(pos_loc)
    gl.vertexAttribPointer(pos_loc, 2, gl.FLOAT, false, 0, 0)

    // draw !!!
    gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 2)
  }

  public start(): void
  { 
    this.reset()
    // start animation
    window.requestAnimationFrame(() => this.draw_loop())
  }

  private draw(): void
  {
    let gl = this.context
    let w = this.canvas.width
    let h = this.canvas.height

    gl.clearColor(0.914, 0.855, 0.949, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.viewport(0, 0, w, h)

    // update canvas size
    if (app.update_canvas)
    {
      console.log('updating canvas...')
      app.update_canvas = false

      this.resize_canvas_to_display_size(this.canvas)
      this.reset()

      // // set texture uniform
      // const texture_loc = gl.getUniformLocation(this.simple_program, 'u_texture');
      // // Fill the texture with random states
      // const w = this.canvas.width
      // const h = this.canvas.height
      // let pixels: Uint8Array = utils.generate_random_state(w, h)
      // console.log('update wxh: ' + w + ', ' + h + ', update pixels: ' + pixels.length)
      // this.prev_pixels = pixels
      // //console.log('pixels.length: ' + pixels.length + ', wxhx4: ' + w * h * 4)
      // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
      // gl.generateMipmap(gl.TEXTURE_2D)
      // // Tell the shader to use texture unit 0 for u_texture
      // gl.uniform1i(texture_loc, 0)

      // // set resolution uniform
      // const res_loc = gl.getUniformLocation(this.simple_program, "u_res")
      // let res: Float32Array = new Float32Array([w, h])
      // gl.uniform2fv(res_loc, res)
    }
    
    // create vertices buffer
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW)

    // use program !!!
    gl.useProgram(this.simple_program)

    // // set color uniform
    // const color_loc = gl.getUniformLocation(this.simple_program, 'u_color')
    // gl.uniform4fv(color_loc, [0.914, 0.855, 0.949, 1.0])

    // set texture uniform
    const texture_loc = gl.getUniformLocation(this.simple_program, 'u_texture');
    //console.log('pixels.length: ' + pixels.length + ', wxhx4: ' + w * h * 4)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.prev_pixels)
    gl.generateMipmap(gl.TEXTURE_2D)
    // Tell the shader to use texture unit 0 for u_texture
    gl.uniform1i(texture_loc, 0)

    // set position attribute
    const pos_loc = gl.getAttribLocation(this.simple_program, 'a_pos')
    gl.enableVertexAttribArray(pos_loc)
    gl.vertexAttribPointer(pos_loc, 2, gl.FLOAT, false, 0, 0)

    // draw !!!
    gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 2)
  }

  private read(): void
  {
    let gl = this.context
    let w = this.canvas.width
    let h = this.canvas.height
    // set texture uniform as pixels
    const texture_loc = gl.getUniformLocation(this.simple_program, 'u_texture')
    let pixels: Uint8Array = new Uint8Array(w * h * 4)
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
    this.prev_pixels = pixels
    // console.log('curr wxh: ' + w + ', ' + h + ', curr pixels: ' + pixels.length)
    // console.log('prev pixels: ' + pixels)
  }

  /* Draws and then requests a draw for the next frame */
  public draw_loop(): void
  {
    // draw to screen
    this.draw()
    this.read()
    this.frame_count++

    // calculate current delta time
    const curr_time: number = Date.now()
    this.curr_delta_time = (curr_time - this.prev_time)
    this.prev_time = curr_time

    // calculate fps
    if (Date.now() - this.prev_fps_time >= 1000)
    {
      this.fps = this.frame_count
      this.frame_count = 0
      this.prev_fps_time = Date.now()
      this.fps_node.nodeValue = this.fps.toFixed(0)
    }
  
    // request next frame to be drawn
    window.requestAnimationFrame(() => this.draw_loop())
  }

  private on_resize(entries) 
  {
    for (const entry of entries) 
    {
      let width;
      let height;
      let dpr = window.devicePixelRatio;
      if (entry.devicePixelContentBoxSize) 
      {
        // NOTE: Only this path gives the correct answer
        // The other 2 paths are an imperfect fallback
        // for browsers that don't provide anyway to do this
        width = entry.devicePixelContentBoxSize[0].inlineSize;
        height = entry.devicePixelContentBoxSize[0].blockSize;
        dpr = 1; // it's already in width and height
      } 
      else if (entry.contentBoxSize) 
      {
        if (entry.contentBoxSize[0]) 
        {
          width = entry.contentBoxSize[0].inlineSize;
          height = entry.contentBoxSize[0].blockSize;
        } 
        else 
        {
          // legacy
          width = entry.contentBoxSize.inlineSize;
          height = entry.contentBoxSize.blockSize;
        }
      } 
      else 
      {
        // legacy
        width = entry.contentRect.width;
        height = entry.contentRect.height;
      }
      const displayWidth = Math.round(width * dpr);
      const displayHeight = Math.round(height * dpr);
      app.canvas_to_disp_size.set(entry.target, [displayWidth, displayHeight]);
      app.update_canvas = true
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

    if (needResize) 
    {
      // Make the canvas the same size
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }

    return needResize;
  }
}

export function init_app(): void 
{
  // get canvas element from document
  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  const neural_app: app = new app(canvas)
  neural_app.start()
}
