import { utils } from './utils.js'
import { Vec2 } from '../lib/TSM.js'
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

  public mode: shader_mode
  public auto: automata
  
  private program: WebGLProgram
  private vertices: Float32Array
  private texture: WebGLTexture
  private prev_pixels: Uint8Array
  
  constructor(_neural: neural)
  {
    this.neural_app = _neural
    this.mode = shader_mode.alpha
    this.canvas = _neural.canvas
    this.context = _neural.context
  }

  public start(): void
  { 
    
    this.reset(automata.worms, shader_mode.rgb)
  }

  public end(): void
  {
    // idk something ?
  }

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

    // create vertices buffer
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW)

    // use program !!!
    gl.useProgram(program)

    // set color uniform
    const color_loc = gl.getUniformLocation(program, 'u_color')
    gl.uniform4fv(color_loc, [0.0, 0.0, 0.0, 0.0])

    // set time uniform
    const time_loc = gl.getUniformLocation(program, 'u_time')
    gl.uniform1f(time_loc, 0.0)

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
    this.prev_pixels = pixels

    // set texture uniform
    const texture_loc = gl.getUniformLocation(program, 'u_texture');
    this.texture = gl.createTexture() as WebGLTexture
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
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

    // draw !!!
    gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 2)
  }

  public draw(): void
  {
    let gl = this.context
    let w = this.canvas.width
    let h = this.canvas.height

    // create vertices buffer
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW)

    // use program !!!
    gl.useProgram(this.program)

    // set color uniform
    const color_loc = gl.getUniformLocation(this.program, 'u_color')
    gl.uniform4fv(color_loc, [0.0, 0.0, 0.0, 0.0])

    // set texture uniform
    const texture_loc = gl.getUniformLocation(this.program, 'u_texture');
    //console.log('pixels.length: ' + pixels.length + ', wxhx4: ' + w * h * 4)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.prev_pixels)
    gl.generateMipmap(gl.TEXTURE_2D)
    // Tell the shader to use texture unit 0 for u_texture
    gl.uniform1i(texture_loc, 0)

    // set time uniform
    const time_loc = gl.getUniformLocation(this.program, 'u_time')
    gl.uniform1f(time_loc, this.neural_app.get_elapsed_time())

    // set position attribute
    const pos_loc = gl.getAttribLocation(this.program, 'a_pos')
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
    let pixels: Uint8Array = new Uint8Array(w * h * 4)
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
    this.prev_pixels = pixels
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
    gl.viewport(0, 0, w, h)

    // draw to screen and read pixels twice to skip every other frame
    this.draw()
    this.read()
    this.draw()
    this.read()
  }

  public mouse_draw(rel_x: number, rel_y: number, brush_size: number)
  {
    let pixels = this.prev_pixels
    let w = this.canvas.width
    let h = this.canvas.height

    rel_y = 1.0 - rel_y
    let x = Math.floor(w * rel_x)
    let y = Math.floor(h * rel_y)

    let rng = new Rand((rel_x * rel_y).toString())

    // fill in pixels
    for (let i = y - brush_size; i < y + brush_size; i++)
    {
      for (let j = x - brush_size; j < x + brush_size; j++)
      {  
        const idx = (i * w + j) * 4
        // make sure index is not out of range
        if (idx < pixels.length && idx > -1) 
        {
          // used to draw a circle
          if (Vec2.distance(new Vec2([x, y]), new Vec2([j, i])) <= brush_size)
          {
            switch (this.mode)
            {
              case shader_mode.alpha:
                // get new random value
                let x = 0
                if (this.auto == automata.cgol) 
                {
                  if (rng.next() > 0.5) x = 255
                }
                else 
                {
                  x = Math.floor(255 * rng.next())
                }
                pixels[idx+3] = x
                break
              case shader_mode.rgb:
              case shader_mode.bnw:
              case shader_mode.acid:
                // get 3 random values
                let r = 0
                let g = 0
                let b = 0
                if (this.auto == automata.cgol)
                {
                  if (rng.next() > 0.5) r = 255
                  if (rng.next() > 0.5) g = 255
                  if (rng.next() > 0.5) b = 255
                } 
                else
                {
                  r = Math.floor(255 * rng.next())
                  g = Math.floor(255 * rng.next())
                  b = Math.floor(255 * rng.next())
                } 
                pixels[idx] = r
                pixels[idx+1] = g
                pixels[idx+2] = b
            }
          } 
        }
      }
    }
    // set prev pixels to display
    this.prev_pixels = pixels
  }

  public mouse_erase(rel_x: number, rel_y: number, brush_size: number)
  {
    let pixels = this.prev_pixels
    let w = this.canvas.width
    let h = this.canvas.height

    rel_y = 1.0 - rel_y
    let x = Math.floor(w * rel_x)
    let y = Math.floor(h * rel_y)

    // fill in pixels
    for (let i = y - brush_size; i < y + brush_size; i++)
    {
      for (let j = x - brush_size; j < x + brush_size; j++)
      {
        // access pixel at (x, y) by using (y * width) + (x * 4)
        const idx = (i * w + j) * 4
        // make sure index is not out of range
        if (idx < pixels.length && idx > -1) 
        {
          // used to draw a circle
          if (Vec2.distance(new Vec2([x, y]), new Vec2([j, i])) <= brush_size)
          {
            switch (this.mode)
            {
              case shader_mode.alpha:
                pixels[idx+3] = 0
                break
              case shader_mode.rgb:
              case shader_mode.bnw:
              case shader_mode.acid:
                pixels[idx] = 0
                pixels[idx+1] = 0
                pixels[idx+2] = 0
                break
            }
          } 
        }
      }
    }
    // set prev pixels to display
    this.prev_pixels = pixels
  }

  public toggle_automata(): void
  {
    let a = this.auto
    a -= 1
    if (a < 0) a = automata.cgol - 1
    this.reset(a, this.mode)
  }

  public toggle_shader(): void
  {
    let m = this.mode
    m -= 1
    if (m < 0) m = shader_mode.END - 1
    this.reset(this.auto, m)
  }
}
