import { utils } from './utils.js'
import { alpha_vertex, alpha_fragment } from './shaders/alpha_shader.js' 
import { rgb_vertex, rgb_fragment } from './shaders/rgb_shader.js'
import { bnw_vertex, bnw_fragment } from './shaders/bnw_shader.js'
import { acid_vertex, acid_fragment } from './shaders/acid_shader.js'
import { kernels_2d } from './kernels_2d.js'
import { activations_2d } from './activations_2d.js'
import { neural } from './neural.js'
import  Rand  from "../lib/rand-seed/Rand.js"

export enum automata
{
  worms, drops, waves, paths, stars, cells, slime, lands, cgol, END
}

export enum shader_mode
{
  rgb, alpha, bnw, acid, END
}

export class app2D
{
  public neural_app: neural
  public canvas: HTMLCanvasElement
  private context: WebGL2RenderingContext
  private pause: boolean = false
  private step: boolean = false
  public mode: shader_mode
  public auto: automata
  
  private program: WebGLProgram
  private vertices: Float32Array
  private buffer: WebGLBuffer

  private textures: WebGLTexture[]
  private framebuffers: WebGLFramebuffer[]

  // brush stuff
  public static max_brush: number = 250
  public brush_size: number = 100
  private brush_1: Uint8Array
  private brush_0: Uint8Array
  
  constructor(_neural: neural)
  {
    this.neural_app = _neural
    this.mode = shader_mode.rgb
    this.auto = automata.worms
    this.canvas = _neural.canvas
    this.context = _neural.context
  }

  // ####################
  // MAIN WEBGL FUNCTIONS
  // ####################

  public reset(auto: automata = this.auto, mode: shader_mode = this.mode): void 
  {
    this.auto = auto
    this.mode = mode
    let gl = this.context

    gl.disable(gl.CULL_FACE)
    gl.disable(gl.DEPTH_TEST)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    let frag = rgb_fragment
    let vert = rgb_vertex
    // set shader mode
    switch (mode)
    {
      default:
      case shader_mode.rgb:
        this.neural_app.shade_node.nodeValue= 'rgb'
        break;
      case shader_mode.alpha:
        this.neural_app.shade_node.nodeValue= 'alpha'
        frag = alpha_fragment
        vert = alpha_vertex
        break;
      case shader_mode.bnw:
        this.neural_app.shade_node.nodeValue= 'bnw'
        frag = bnw_fragment
        vert = bnw_vertex
        break;
      case shader_mode.acid:
        this.neural_app.shade_node.nodeValue= 'acid'
        frag = acid_fragment
        vert = acid_vertex
        break;
    }

    // set automata type
    switch (auto)
    {
      default:
      case automata.worms:
        frag = frag.replace('[AF]', activations_2d.worms_activation())
        this.neural_app.auto_node.nodeValue = 'worms'
        break
      case automata.drops:
        frag = frag.replace('[AF]', activations_2d.drops_activation())
        this.neural_app.auto_node.nodeValue = 'drops'
        break
      case automata.waves:
        frag = frag.replace('[AF]', activations_2d.waves_activation())
        this.neural_app.auto_node.nodeValue = 'waves'
        break
      case automata.paths:
        frag = frag.replace('[AF]', activations_2d.paths_activation())
        this.neural_app.auto_node.nodeValue = 'paths'
        break
      case automata.stars:
        frag = frag.replace('[AF]', activations_2d.stars_activation())
        this.neural_app.auto_node.nodeValue = 'stars'
        break
      case automata.cells:
        frag = frag.replace('[AF]', activations_2d.cells_activation())
        this.neural_app.auto_node.nodeValue = 'cells'
        break
      case automata.slime:
        frag = frag.replace('[AF]', activations_2d.slime_activation())
        this.neural_app.auto_node.nodeValue = 'slime'
        break
      case automata.lands:
        frag = frag.replace('[AF]', activations_2d.lands_activation())
        this.neural_app.auto_node.nodeValue = 'lands'
        break
      case automata.cgol:
        frag = frag.replace('[AF]', activations_2d.gol_activation())
        this.neural_app.auto_node.nodeValue = 'c-gol'
        break
    }

    // create shaders
    const vertex_shader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
    const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
    gl.shaderSource(vertex_shader, vert)
    gl.compileShader(vertex_shader)
    gl.shaderSource(fragment_shader, frag)
    gl.compileShader(fragment_shader)

    // used for debugging shaders
    const vertex_log = gl.getShaderInfoLog(vertex_shader)
    const fragment_log = gl.getShaderInfoLog(fragment_shader)
    if (vertex_log != '') console.log('vertex shader log: ' + vertex_log)
    if (fragment_log != '') console.log('fragment shader log: ' + fragment_log)
    
    // create program
    this.program = gl.createProgram() as WebGLProgram
    let program = this.program
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

    // Fill the texture with random states
    const w = this.canvas.width
    const h = this.canvas.height

    // generate state based on automata
    let pixels: Uint8Array = new Uint8Array(0)
    if (auto == automata.cgol)
    {
      pixels = utils.generate_empty_state(w, h)
    }
    else
    {
      switch (mode)
      {
        default:
        case shader_mode.alpha:
          pixels = utils.generate_random_alpha_state(w, h, this.neural_app.get_elapsed_time().toString())
          break
        case shader_mode.rgb:
        case shader_mode.bnw:
        case shader_mode.acid:
          pixels = utils.generate_random_rgb_state(w, h, this.neural_app.get_elapsed_time().toString())
          break
      }
    }
    
    // create 2 textures and attach them to framebuffers
    this.textures = []
    this.framebuffers = []
    for (var ii = 0; ii < 2; ++ii) 
    {
      // create texture
      var texture = this.create_setup_texture(gl)
      this.textures.push(texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

      // create a framebuffer
      var fbo = gl.createFramebuffer() as WebGLFramebuffer
      this.framebuffers.push(fbo)
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  
      // attach a texture to it.
      var attachmentPoint = gl.COLOR_ATTACHMENT0;
      gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, 0)
    }

    // set init pixels to texture 1
    gl.bindTexture(gl.TEXTURE_2D, this.textures[1])
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

    // use program !!!
    gl.useProgram(program)

    // create vertices buffer
    this.buffer = gl.createBuffer() as WebGLBuffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW)

    // set color uniform
    const color_loc = gl.getUniformLocation(program, 'u_color')
    gl.uniform4fv(color_loc, [0.0, 0.0, 0.0, 0.0])

    // set time uniform
    const time_loc = gl.getUniformLocation(program, 'u_time')
    gl.uniform1f(time_loc, 0.0)
    
    // set step uniform
    const step_loc = gl.getUniformLocation(this.program, 'u_step')
    this.step = true
    gl.uniform1f(step_loc, 1)

    // set pause uniform
    const pause_loc = gl.getUniformLocation(this.program, 'u_pause')
    this.pause = false
    gl.uniform1f(pause_loc, 0)

    // start with the original texture on unit 0
    const texture_loc = gl.getUniformLocation(program, 'u_texture')
    gl.activeTexture(gl.TEXTURE0 + 0)
    gl.bindTexture(gl.TEXTURE_2D, this.textures[1])
 
    // Tell the shader to get the texture from texture unit 0
    gl.uniform1i(texture_loc, 0)

    // set kernel array uniform
    const kernel_loc = gl.getUniformLocation(program, 'u_kernel[0]')
    let kernel: Float32Array = new Float32Array(9)
    switch (auto)
    {
      default:
      case automata.worms:
        kernel = kernels_2d.worms_kernel()
        break
      case automata.drops:
        kernel = kernels_2d.drops_kernel()
        break
      case automata.slime:
        kernel = kernels_2d.slime_kernel()
        break
      case automata.waves:
        kernel = kernels_2d.waves_kernel()
        break
      case automata.paths:
        kernel = kernels_2d.paths_kernel()
        break
      case automata.stars:
        kernel = kernels_2d.stars_kernel()
        break
      case automata.cells:
        kernel = kernels_2d.cells_kernel()
        break
      case automata.lands:
        kernel = kernels_2d.lands_kernel()
        break
      case automata.cgol:
        kernel = kernels_2d.gol_kernel()
        break
    }
    gl.uniform1fv(kernel_loc, kernel)

    // set resolution uniform
    const res_loc = gl.getUniformLocation(program, "u_res")
    let res: Float32Array = new Float32Array([w, h])
    gl.uniform2fv(res_loc, res)

    // set position attribute
    const pos_loc = gl.getAttribLocation(program, 'a_pos')
    gl.enableVertexAttribArray(pos_loc)
    gl.vertexAttribPointer(pos_loc, 2, gl.FLOAT, false, 0, 0)

    // DRAW TO CANVAS
    this.set_fb(null, w, h, gl)
    this.draw_to_canvas(gl)
  }

  public draw(): void
  {
    let gl = this.context
    let w = this.canvas.width
    let h = this.canvas.height

    // use program !!!
    gl.useProgram(this.program)

    // create vertices buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW)

    // set texture uniform
    const texture_loc = gl.getUniformLocation(this.program, 'u_texture')
    gl.activeTexture(gl.TEXTURE0 + 0)
    gl.bindTexture(gl.TEXTURE_2D, this.textures[1])

    // Tell the shader to get the texture from texture unit 0
    gl.uniform1i(texture_loc, 0);

    // set time uniform
    const time_loc = gl.getUniformLocation(this.program, 'u_time')
    gl.uniform1f(time_loc, this.neural_app.get_elapsed_time())

    // set step as true for the 2 iterations
    const step_loc = gl.getUniformLocation(this.program, 'u_step')
    gl.uniform1f(step_loc, 1)

    // set pause uniform
    const pause_loc = gl.getUniformLocation(this.program, 'u_pause')
    if (this.pause) gl.uniform1f(pause_loc, 1)
    else gl.uniform1f(pause_loc, 0)

    // set position attribute
    const pos_loc = gl.getAttribLocation(this.program, 'a_pos')
    gl.enableVertexAttribArray(pos_loc)
    gl.vertexAttribPointer(pos_loc, 2, gl.FLOAT, false, 0, 0)

    // FRAMEBUFFER 1
    this.set_fb(this.framebuffers[0], w, h, gl)
    this.draw_to_canvas(gl)
    gl.bindTexture(gl.TEXTURE_2D, this.textures[0])

    // FRAMEBUFFER 2
    this.set_fb(this.framebuffers[1], w, h, gl)
    this.draw_to_canvas(gl)
    gl.bindTexture(gl.TEXTURE_2D, this.textures[1])

    // set step as false for drawing to canvas
    gl.uniform1f(step_loc, 0)

    // DRAW TO CANVAS
    this.set_fb(null, w, h, gl)
    this.draw_to_canvas(gl)
  }

  private set_fb(fbo, width, height, gl): void
  {
    // make this the framebuffer we are rendering to.
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, width, height)
  }

  private draw_to_canvas(gl: WebGL2RenderingContext): void
  {
    // Draw the rectangle.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
  }

  /* Draws and then requests a draw for the next frame */
  public draw_loop(): void
  {
    let gl = this.context
    let w = this.canvas.width
    let h = this.canvas.height
    let bg = this.neural_app.bg_color

    // Drawing
    gl.clearColor(bg.r, bg.g, bg.b, bg.a)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.disable(gl.BLEND)
    gl.viewport(0, 0, w, h)

    // draw to screen
    this.draw()
  }

  // ############################
  // BRUSH DRAW / ERASE FUNCTIONS
  // ############################

  public set_brush(size: number): void 
  {  
		this.brush_size = size
		let arr_size = size*size*4
		this.brush_1 = new Uint8Array(arr_size)
		this.brush_0 = new Uint8Array(arr_size)
    let rng = new Rand()
		for (let i=0; i < arr_size; i++)
    {
			this.brush_1[i] = rng.next() * 255;
			this.brush_0[i] = 0;
		}

    // set node value
    this.neural_app.brush_node.nodeValue = this.brush_size.toFixed(0).toString()
	}

  private randomize_brush()
  {
		let arr_size = this.brush_size*this.brush_size*4
		this.brush_1 = new Uint8Array(arr_size)
    let rng = new Rand()
		for (let i=0; i < arr_size; i++) 
    {
			this.brush_1[i] = rng.next() * 255;
			this.brush_0[i] = 0;
		}
  }

  public mouse_draw(rel_x: number, rel_y: number)
  {
    let gl = this.context
    let w = this.canvas.width
    let h = this.canvas.height
		rel_y = 1.0 - rel_y

    let x = Math.floor(w * rel_x)
    let y = Math.floor(h * rel_y)
    x = x - Math.floor(this.brush_size / 2) // center brush
		y = y - Math.floor(this.brush_size / 2)


    this.randomize_brush()
		let brush_arr = this.brush_1
		gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, this.brush_size, this.brush_size, gl.RGBA, gl.UNSIGNED_BYTE, brush_arr)
    this.draw_to_canvas(gl)
  }

  public mouse_erase(rel_x: number, rel_y: number)
  {
    let gl = this.context
    let w = this.canvas.width
    let h = this.canvas.height
		rel_y = 1.0 - rel_y

    let x = Math.floor(w * rel_x)
    let y = Math.floor(h * rel_y)
    x = x - Math.floor(this.brush_size / 2) // center brush
		y = y - Math.floor(this.brush_size / 2)

		let brush_arr = this.brush_0
		gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, this.brush_size, this.brush_size, gl.RGBA, gl.UNSIGNED_BYTE, brush_arr)
    this.draw_to_canvas(gl)
  }

  // #################
  // UTILITY FUNCTIONS
  // #################

  public start(): void
  { 
    this.pause = false
    this.reset()
  }

  public toggle_pause(): void
  {
    this.pause = !this.pause
  }

  public end(): void
  {
    // idk something ?
  }

  public toggle_automata(): void
  {
    let a = this.auto
    a -= 1
    if (a < 0) a = automata.END - 1
    this.reset(a, this.mode)
  }

  public shader_left(): void
  {
    let m = this.mode
    m -= 1
    if (m < 0) m = shader_mode.END - 1
    this.reset(this.auto, m)
  }

  public shader_right(): void
  {
    let m = this.mode
    m += 1
    if (m > shader_mode.END - 1) m = 0
    this.reset(this.auto, m)
  }

  public go_left()
  {
    let a = this.auto
    a += 1
    if (a > automata.END - 1) a = 0
    this.reset(a, this.mode)
  }

  public go_right()
  {
    this.toggle_automata()
  }

  public delta_brush(delta: number)
  {
    this.brush_size += delta
    if (this.brush_size <= 0) this.brush_size = 0
    if (this.brush_size >= app2D.max_brush) this.brush_size = app2D.max_brush
    this.set_brush(this.brush_size)
  }

  private create_setup_texture(gl: WebGL2RenderingContext): WebGLTexture
  {
    var texture = gl.createTexture() as WebGLTexture
    gl.bindTexture(gl.TEXTURE_2D, texture)

    // Set up texture so we can render any size image and so we are
    // working with pixels.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
 
    return texture
  }
}
