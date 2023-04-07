import { Debugger } from "../lib/webglutils/Debugging.js";
import {
  CanvasAnimation,
  WebGLUtilities
} from "../lib/webglutils/CanvasAnimation.js";
import { GUI } from "./Gui.js";
import {
  blankCubeFSText,
  blankCubeVSText,

  ray_vertex_shader,
  ray_fragment_shader
} from "./Shaders.js";
import { Mat4, Vec4, Vec3, Vec2 } from "../lib/TSM.js";
import { RenderPass } from "../lib/webglutils/RenderPass.js";
import { Camera } from "../lib/webglutils/Camera.js";
import { Cube } from "./Cube.js";
import { Chunk, noise_map_data, chunk_data } from "./Chunk.js";

// custom imports
import { Utils, Ray, print, CubeFace } from "./Utils.js";
import { Player } from "./Player.js";
import { Noise } from "./Noise.js";
import { CubeCollider } from "./Colliders.js";
import { RaycastRenderer } from "./RaycastRenderer.js";
import { WireCube } from "./WireCube.js";

export class MinecraftAnimation extends CanvasAnimation
{
  private gui: GUI;
  
  // chunk related vars
  private current_chunk : Chunk; // the current chunk in which the player is in
  private adj_chunks: Chunk[]; // the 8 adjacent chuncks that surround the current_chunk
  public terrain_data: noise_map_data // nouse map data used to generate new chunks
  private edge_colliders: CubeCollider[] // edge colliders of 8 adjacent chunks
  private chunk_datas: chunk_data[] // used to store already generated chunks
  
  /*  Cube Rendering */
  private cubeGeometry: Cube;
  private blankCubeRenderPass: RenderPass;

  // wire cube
  private wire_cube: WireCube
  private wire_cube_pass: RenderPass
  private render_wire_cube: boolean = false

  /* Global Rendering Info */
  private lightPosition: Vec4;
  private backgroundColor: Vec4;

  
  private canvas2d: HTMLCanvasElement;
  public player: Player;

  // render pass for rendering rays
  private prev_ray_length : number = 0;
  private ray_render_pass : RenderPass;
  public rr: RaycastRenderer;
  
  constructor(canvas: HTMLCanvasElement) 
  {
    super(canvas);
    this.canvas2d = document.getElementById("textCanvas") as HTMLCanvasElement;
    this.ctx = Debugger.makeDebugContext(this.ctx);
    let gl = this.ctx;
    this.gui = new GUI(this.canvas2d, this);

    // create player
    const player_pos: Vec3 = this.gui.getCamera().pos();
    this.player = new Player(player_pos)

    // create raycast renderer
    this.rr = new RaycastRenderer()
    this.ray_render_pass = new RenderPass(gl, ray_vertex_shader, ray_fragment_shader)
    
    // create terrain data object
    this.terrain_data = new noise_map_data()

    // update ui
    this.scale_ui = this.terrain_data.scale
    this.height_ui = this.terrain_data.height
    this.pers_ui = this.terrain_data.pers
    this.lacu_ui = this.terrain_data.lacu
    this.pos_ui = this.player.get_pos()
    this.chunk_ui = this.player.get_chunk()
    this.update_ui()

    // generate current chunk
    this.current_chunk = new Chunk(0.0, 0.0, Utils.CHUNK_SIZE, this.player.get_chunk());
    this.current_chunk.generate_new_chunk(this.terrain_data)
    this.chunk_datas = new Array<chunk_data>()
    this.chunk_datas.push(new chunk_data(this.current_chunk.get_id(), this.current_chunk.get_cube_pos()))
    // and adjacent chunks
    this.try_load_adj_chunks(this.player.get_chunk())
      
    // blank cube
    this.blankCubeRenderPass = new RenderPass(gl, blankCubeVSText, blankCubeFSText);
    this.cubeGeometry = new Cube();
    this.initBlankCube();
    
    // wire cube
    this.render_wire_cube = true
    this.wire_cube = new WireCube(new Vec3([0.0, 46.0, 0.0]), Utils.CUBE_LEN, 'red')
    this.wire_cube_pass = new RenderPass(gl, ray_vertex_shader, ray_fragment_shader)
    this.init_wire_cube()

    // environment stuff
    this.lightPosition = new Vec4([-1000, 1000, -1000, 1]);
    this.backgroundColor = new Vec4([0.470588, 0.756863, 0.890196, 1.0]);
  }

  public static n_offset:   Vec2 = new Vec2([ 0, 1])
  public static ne_offset:  Vec2 = new Vec2([ 1, 1])
  public static e_offset:   Vec2 = new Vec2([ 1, 0])
  public static se_offset:  Vec2 = new Vec2([ 1,-1])

  public static s_offset:   Vec2 = new Vec2([ 0,-1])
  public static sw_offset:  Vec2 = new Vec2([-1,-1])
  public static w_offset:   Vec2 = new Vec2([-1, 0])
  public static nw_offset:  Vec2 = new Vec2([-1, 1])

  private try_load_adj_chunks(center_chunk: Vec2): void
  {
    // get center chunk coordinates
    const x_cen: number = center_chunk.x
    const z_cen: number = center_chunk.y

    // create list of 8 chunks
    const new_chunks: Chunk[] = new Array<Chunk>()

    // north chunk (+Z)
    const n_id = this.player.get_chunk().add(MinecraftAnimation.n_offset)
    const n_res = this.try_load_chunk(n_id.copy())
    new_chunks.push(n_res[1])

    // north-east chunk (+Z)
    const ne_id = this.player.get_chunk().add(MinecraftAnimation.ne_offset)
    const ne_res = this.try_load_chunk(ne_id.copy())
    new_chunks.push(ne_res[1])

    // east chunk (+X)
    const e_id = this.player.get_chunk().add(MinecraftAnimation.e_offset)
    const e_res = this.try_load_chunk(e_id.copy())
    new_chunks.push(e_res[1])

    // south-east chunk (+X)
    const se_id = this.player.get_chunk().add(MinecraftAnimation.se_offset)
    const se_res = this.try_load_chunk(se_id.copy())
    new_chunks.push(se_res[1])

    // south chunk (-Z)
    const s_id = this.player.get_chunk().add(MinecraftAnimation.s_offset)
    const s_res = this.try_load_chunk(s_id.copy())
    new_chunks.push(s_res[1])

    // south-west chunk (-Z)
    const sw_id = this.player.get_chunk().add(MinecraftAnimation.sw_offset)
    const sw_res = this.try_load_chunk(sw_id.copy())
    new_chunks.push(sw_res[1])

    // west chunk (-X)
    const w_id = this.player.get_chunk().add(MinecraftAnimation.w_offset)
    const w_res = this.try_load_chunk(w_id.copy())
    new_chunks.push(w_res[1])

    // north-west chunk (-X)
    const nw_id = this.player.get_chunk().add(MinecraftAnimation.nw_offset)
    const nw_res = this.try_load_chunk(nw_id.copy())
    new_chunks.push(nw_res[1])

    // set adjacent chunks
    this.adj_chunks = new_chunks

    // get edge colliders for all 8 adjacent chunks
    this.edge_colliders = new Array<CubeCollider>()
    for (let i = 0; i < this.adj_chunks.length; i++)
    {
      let edges: CubeCollider[] = this.adj_chunks[i].get_edge_colliders()
      for (let j = 0; j < edges.length; j++)
      {
        this.edge_colliders.push(edges[j])
      }
    }
  }

  /**
   * Setup the simulation. This can be called again to reset the program.
   */
  public reset(): void 
  {    
    // reset gui
    this.gui.reset();

    // reset chunk data
    this.chunk_datas = []

    // reset player
    const player_pos: Vec3 = this.gui.getCamera().pos();
    this.player = new Player(player_pos)
    const curr_chunk: Vec2 = Utils.pos_to_chunck(this.player.get_pos())
    this.player.set_chunk(curr_chunk.copy())

    // generate chunks
    this.current_chunk = new Chunk(0.0, 0.0, Utils.CHUNK_SIZE, this.player.get_chunk());
    this.current_chunk.generate_new_chunk(this.terrain_data)
    this.chunk_datas.push(new chunk_data(this.current_chunk.get_id(), this.current_chunk.get_cube_pos()))
    // and adjacent chunks
    this.try_load_adj_chunks(this.player.get_chunk())

    // reset rays
    this.rr.clear_rays()
    this.init_rays()

    // update ui
    this.scale_ui = this.terrain_data.scale
    this.height_ui = this.terrain_data.height
    this.pers_ui = this.terrain_data.pers
    this.lacu_ui = this.terrain_data.lacu
    this.pos_ui = this.player.get_pos()
    this.chunk_ui = this.player.get_chunk()
    this.mode_ui = this.player.get_creative_mode()
    this.update_ui()
  }

  public init_rays() : void 
  {
    // index buffer ray is ray indices
    this.ray_render_pass.setIndexBufferData(this.rr.get_ray_indices());

    // vertex positions
    this.ray_render_pass.addAttribute(
        "vertex_pos",
        3, 
        this.ctx.FLOAT, 
        false, 
        3 * Float32Array.BYTES_PER_ELEMENT,
        0,
        undefined,
        this.rr.get_ray_positions());

    // vertex colors
    this.ray_render_pass.addAttribute(
      "vertex_color",
      3, 
      this.ctx.FLOAT, 
      false, 
      3 * Float32Array.BYTES_PER_ELEMENT,
      0,
      undefined,
      this.rr.get_ray_colors());
    
    // add matricies
    this.ray_render_pass.addUniform("world_mat",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniformMatrix4fv(loc, false, new Float32Array(Mat4.identity.all()));
    });
    this.ray_render_pass.addUniform("proj_mat",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.projMatrix().all()));
    });
    this.ray_render_pass.addUniform("view_mat",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.viewMatrix().all()));
    });
      
    this.ray_render_pass.setDrawData(this.ctx.LINES, this.rr.get_ray_indices().length, this.ctx.UNSIGNED_INT, 0);
    this.ray_render_pass.setup();
  }

  public init_wire_cube() : void
  {
    // reset render pass
    this.wire_cube_pass = new RenderPass(this.ctx, ray_vertex_shader, ray_fragment_shader)

    // index buffer ray is ray indices
    this.wire_cube_pass.setIndexBufferData(this.wire_cube.get_indices());

    // vertex positions
    this.wire_cube_pass.addAttribute(
        "vertex_pos",
        3, 
        this.ctx.FLOAT, 
        false, 
        3 * Float32Array.BYTES_PER_ELEMENT,
        0,
        undefined,
        this.wire_cube.get_positions());

    // vertex colors
    this.wire_cube_pass.addAttribute(
      "vertex_color",
      3, 
      this.ctx.FLOAT, 
      false, 
      3 * Float32Array.BYTES_PER_ELEMENT,
      0,
      undefined,
      this.wire_cube.get_colors());
    
    // add matricies
    this.wire_cube_pass.addUniform("world_mat",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniformMatrix4fv(loc, false, new Float32Array(Mat4.identity.all()));
    });
    this.wire_cube_pass.addUniform("proj_mat",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.projMatrix().all()));
    });
    this.wire_cube_pass.addUniform("view_mat",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.viewMatrix().all()));
    });
      
    this.wire_cube_pass.setDrawData(this.ctx.LINES, this.wire_cube.get_indices().length, this.ctx.UNSIGNED_INT, 0);
    this.wire_cube_pass.setup();
  }
  
  /**
   * Sets up the blank cube drawing
   */
  private initBlankCube(): void {
    this.blankCubeRenderPass.setIndexBufferData(this.cubeGeometry.indicesFlat());
    this.blankCubeRenderPass.addAttribute("aVertPos",
      4,
      this.ctx.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      0,
      undefined,
      this.cubeGeometry.positionsFlat()
    );
    
    this.blankCubeRenderPass.addAttribute("aNorm",
      4,
      this.ctx.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      0,
      undefined,
      this.cubeGeometry.normalsFlat()
    );
    
    this.blankCubeRenderPass.addAttribute("aUV",
      2,
      this.ctx.FLOAT,
      false,
      2 * Float32Array.BYTES_PER_ELEMENT,
      0,
      undefined,
      this.cubeGeometry.uvFlat()
    );
    
    this.blankCubeRenderPass.addInstancedAttribute("aOffset",
      4,
      this.ctx.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      0,
      undefined,
      new Float32Array(0)
    );

    this.blankCubeRenderPass.addInstancedAttribute("terrain_height",
      1,
      this.ctx.FLOAT,
      false,
      1 * Float32Array.BYTES_PER_ELEMENT,
      0,
      undefined,
      new Float32Array(this.terrain_data.height)
    );

    this.blankCubeRenderPass.addUniform("uLightPos",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniform4fv(loc, this.lightPosition.xyzw);
    });
    this.blankCubeRenderPass.addUniform("uProj",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.projMatrix().all()));
    });
    this.blankCubeRenderPass.addUniform("uView",
      (gl: WebGLRenderingContext, loc: WebGLUniformLocation) => {
        gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.viewMatrix().all()));
    });
    
    this.blankCubeRenderPass.setDrawData(this.ctx.TRIANGLES, this.cubeGeometry.indicesFlat().length, this.ctx.UNSIGNED_INT, 0);
    this.blankCubeRenderPass.setup();    
  }

  // used to update chunks after terrain change has been made 
  public update_terrain(): void
  {
    this.scale_ui = this.terrain_data.scale
    this.height_ui = this.terrain_data.height
    this.pers_ui = this.terrain_data.pers
    this.lacu_ui = this.terrain_data.lacu
    this.update_ui()
    
    // load or generate new chunk
    this.try_load_chunk(this.player.get_chunk().copy())
    // and adj chunks
    this.try_load_adj_chunks(this.player.get_chunk())

    // update current terrain_height
    this.blankCubeRenderPass.updateAttributeBuffer("terrain_height", new Float32Array(this.terrain_data.height));
  }

  // attempts to load a chunk from data, else generates a new chunk
  private try_load_chunk(chunk: Vec2): [boolean, Chunk]
  {
    // search for chunk in chunk datas
    let found_data: boolean = false
    let idx: number = -1
    for (let i = 0; i < this.chunk_datas.length; i++)
    {
      if (this.chunk_datas[i].get_id().equals(chunk))
      {
        found_data = true
        idx = i
        break
      }
    }

    // render new 3x3 chunks around player
    const new_chunk_center: Vec2 = Utils.get_chunk_center(chunk.x, chunk.y)
    let the_chunk: Chunk = new Chunk(new_chunk_center.x, new_chunk_center.y, Utils.CHUNK_SIZE, chunk);

    // if found, load cubes into current chunk
    if (found_data)
    {
      the_chunk.load_chunk(this.chunk_datas[idx].get_cubes())
    }
    // else generate a new chunk and save data
    else
    {
      the_chunk.generate_new_chunk(this.terrain_data)
      this.chunk_datas.push(new chunk_data(the_chunk.get_id(), the_chunk.get_cube_pos()))
    }

    return [found_data, the_chunk]
  }

  // send mouse raycast and chunk blocks to player
  public try_destroy_block(ray: Ray): void
  {
    const cubes: CubeCollider[] = this.current_chunk.get_cube_colliders()
    let near: CubeCollider[] = new Array<CubeCollider>()
    let min_t: number = Number.MAX_VALUE
    let hit_idx: number = -1;
    let face: CubeFace = CubeFace.negX

    // get all blocks within a certain range
    for (let i = 0; i < cubes.length; i++)
    {
      if (Vec3.distance(cubes[i].get_pos(), ray.get_origin()) <= Utils.PLAYER_REACH)
      {
          near.push(cubes[i])
      }
    }

    // check each near cube for ray intersection
    for (let i = 0; i < near.length; i++)
    {
      const res = Utils.ray_cube_intersection(ray.copy(), near[i])
      let t: number = res[0]
      if (t > -1 && t < min_t)
      {
        min_t = t
        hit_idx = i
        face = res[1]
      }
    }

    // if hit a cube
    if (hit_idx > -1 && min_t > -1)
    {
      // find cube and hightlight
      this.wire_cube.set_positions(near[hit_idx].get_pos(), Utils.CUBE_LEN)
      // remove cube from chunk
      this.current_chunk.remove_cube(near[hit_idx].get_pos(), face)
      // search for chunk in chunk datas
      const chunk: Vec2 = this.player.get_chunk()
      let found_data: boolean = false
      let idx: number = -1
      for (let i = 0; i < this.chunk_datas.length; i++)
      {
        if (this.chunk_datas[i].get_id().equals(chunk))
        {
          found_data = true
          idx = i
          break
        }
      }
      // update chunk data
      if (found_data)
      {
        this.chunk_datas[idx].update(this.current_chunk.get_cube_pos())
      }
    }
  }

  /**
   * Draws a single frame
   *
   */
  public draw(): void 
  {
    // Logic for a rudimentary walking simulator. Check for collisions 
    // and reject attempts to walk into a cube. Handle gravity, jumping, 
    // and loading of new chunks when necessary.
    const move_dir: Vec3 = this.gui.walkDir()

    // apply physics to player rigid body
    this.player.update(move_dir, this.current_chunk, this.edge_colliders, this.get_delta_time())
    
    // set player's current chunk
    const curr_chunk: Vec2 = Utils.pos_to_chunck(this.player.get_pos())
    if (!curr_chunk.equals(this.player.get_chunk()))
    {
      // load or generate new chunk
      this.player.set_chunk(curr_chunk.copy())
      const res = this.try_load_chunk(curr_chunk.copy())
      this.current_chunk = res[1]

      // and adj chunks
      this.try_load_adj_chunks(curr_chunk.copy())
    }

    // init rays update
    if (this.prev_ray_length < this.rr.get_rays().length)
    {
      this.prev_ray_length = this.rr.get_rays().length;
      this.init_rays();
    }

    // init hex updates
    if (this.wire_cube.get_update())
    {
      this.render_wire_cube = true;
      this.init_wire_cube();
      this.wire_cube.got_update();
    }

    // set the player's current position
    this.gui.getCamera().setPos(this.player.get_pos());

    // set ui values 
    this.pos_ui = this.player.get_pos()
    this.chunk_ui = this.player.get_chunk()
    this.update_ui()
    
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
    gl.viewport(x, y, width, height);

    // Render multiple chunks around the player, using Perlin noise shaders
    this.blankCubeRenderPass.updateAttributeBuffer("aOffset", this.get_all_cube_pos());
    this.blankCubeRenderPass.drawInstanced(this.get_all_num_cubes());

    // draw rays
    if (this.rr.get_rays().length > 0)
    {
      this.ray_render_pass.draw();  
    }

    // draw wire cube
    if (this.render_wire_cube)
    {
      gl.disable(gl.DEPTH_TEST);
      this.wire_cube_pass.draw();
      gl.enable(gl.DEPTH_TEST);
    }
  }

  private get_all_cube_pos(): Float32Array
  {
    let float_array: number[] = new Array<number>()

    // add center chunk cube positions
    const center_chunk_pos: Float32Array = this.current_chunk.cubePositions()
    for (let i = 0; i < center_chunk_pos.length; i++) { float_array.push(center_chunk_pos[i]) }

    // add all adjecent chunk's cube positions
    for (let i = 0; i < Utils.NUM_ADJ_CHUNKS; i++)
    {
      const chunk_pos: Float32Array = this.adj_chunks[i].cubePositions()
      for (let j = 0; j < chunk_pos.length; j++) { float_array.push(chunk_pos[j]) }
    }

    // return all combined
    return new Float32Array(float_array)
  }

  // add up all number of cubes in each chunk
  private get_all_num_cubes(): number
  {
    let num_cubes_sum: number = 0
    num_cubes_sum += this.current_chunk.numCubes()
    for (let i = 0; i < Utils.NUM_ADJ_CHUNKS; i++) num_cubes_sum += this.adj_chunks[i].numCubes()
    return num_cubes_sum
  }


  public getGUI(): GUI { return this.gui; }  
}

export function initializeCanvas(): void {
  const canvas = document.getElementById("glCanvas") as HTMLCanvasElement;
  /* Start drawing */
  const canvasAnimation: MinecraftAnimation = new MinecraftAnimation(canvas);
  canvasAnimation.start();  
}
