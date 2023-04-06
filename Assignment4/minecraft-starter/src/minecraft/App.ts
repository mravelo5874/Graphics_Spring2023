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
import { Chunk, noise_map_data } from "./Chunk.js";

// custom imports
import { Utils, print } from "./Utils.js";
import { Player } from "./Player.js";
import { Noise } from "./Noise.js";
import { CubeCollider } from "./Colliders.js";
import { RaycastRenderer } from "./RaycastRenderer.js";

export class MinecraftAnimation extends CanvasAnimation
{
  private gui: GUI;
  
  private current_chunk : Chunk; // the current chunk in which the player is in
  private adj_chunks: Chunk[]; // the 8 adjacent chuncks that surround the current_chunk
  public terrain_data: noise_map_data
  private edge_colliders: CubeCollider[]
  
  /*  Cube Rendering */
  private cubeGeometry: Cube;
  private blankCubeRenderPass: RenderPass;

  private cube_texture_size = 32
  private cube_noise_map: noise_map_data;
  private cube_texture: number[][];

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

    // generate chunks
    this.current_chunk = new Chunk(0.0, 0.0, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk());
    this.adj_chunks = this.generate_adj_chunks(this.player.get_chunk())

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

    // generate cube textures
    this.cube_texture_size = 32
    this.cube_noise_map = new noise_map_data()
    this.cube_texture = Noise.generate_noise_map(
      this.cube_texture_size,
      this.cube_noise_map,
      Vec2.zero.copy(),
      true)
      
    // blank cube
    this.blankCubeRenderPass = new RenderPass(gl, blankCubeVSText, blankCubeFSText);
    this.cubeGeometry = new Cube();
    this.initBlankCube();
    
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

  private generate_adj_chunks(center_chunk: Vec2): Chunk[]
  {
    // get center chunk coordinates
    const x_cen: number = center_chunk.x
    const z_cen: number = center_chunk.y

    // create list of 8 chunks
    const new_chunks: Chunk[] = new Array<Chunk>()

    // north chunk (+Z)
    const n_cen = Utils.get_chunk_center(x_cen, z_cen + 1)
    new_chunks.push(new Chunk(n_cen.x, n_cen.y, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk().add(MinecraftAnimation.n_offset)))

    // north-east chunk (+Z)
    const ne_cen = Utils.get_chunk_center(x_cen + 1, z_cen + 1)
    new_chunks.push(new Chunk(ne_cen.x, ne_cen.y, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk().add(MinecraftAnimation.ne_offset)))

    // east chunk (+X)
    const e_cen = Utils.get_chunk_center(x_cen + 1, z_cen)
    new_chunks.push(new Chunk(e_cen.x, e_cen.y, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk().add(MinecraftAnimation.e_offset)))

    // south-east chunk (+X)
    const se_cen = Utils.get_chunk_center(x_cen + 1, z_cen - 1)
    new_chunks.push(new Chunk(se_cen.x, se_cen.y, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk().add(MinecraftAnimation.se_offset)))

    // south chunk (-Z)
    const s_cen = Utils.get_chunk_center(x_cen, z_cen - 1)
    new_chunks.push(new Chunk(s_cen.x, s_cen.y, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk().add(MinecraftAnimation.s_offset)))

    // south-west chunk (-Z)
    const sw_cen = Utils.get_chunk_center(x_cen - 1, z_cen - 1)
    new_chunks.push(new Chunk(sw_cen.x, sw_cen.y, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk().add(MinecraftAnimation.sw_offset)))

    // west chunk (-X)
    const w_cen = Utils.get_chunk_center(x_cen - 1, z_cen)
    new_chunks.push(new Chunk(w_cen.x, w_cen.y, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk().add(MinecraftAnimation.w_offset)))

    // north-west chunk (-X)
    const nw_cen = Utils.get_chunk_center(x_cen - 1, z_cen + 1)
    new_chunks.push(new Chunk(nw_cen.x, nw_cen.y, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk().add(MinecraftAnimation.nw_offset)))

    return new_chunks
  }

  /**
   * Setup the simulation. This can be called again to reset the program.
   */
  public reset(): void 
  {    
    // reser gui
    this.gui.reset();

    // reset player
    const player_pos: Vec3 = this.gui.getCamera().pos();
    this.player = new Player(player_pos)
    const curr_chunk: Vec2 = Utils.pos_to_chunck(this.player.get_pos())
    this.player.set_chunk(curr_chunk.copy())

    // generate chunks
    this.current_chunk = new Chunk(0.0, 0.0, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk());
    this.adj_chunks = this.generate_adj_chunks(this.player.get_chunk())

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

    /*
    console.log('ray.init:\n\tray_indices: ' + this.scene.rr.get_ray_indices().length + 
    '\n\tray_pos: ' + this.scene.rr.get_ray_positions().length +
    '\n\tray_color: ' + this.scene.rr.get_ray_colors().length)
    */
  }

  // used to update chunks after terrain change has been made 
  public update_terrain(): void
  {
    this.scale_ui = this.terrain_data.scale
    this.height_ui = this.terrain_data.height
    this.pers_ui = this.terrain_data.pers
    this.lacu_ui = this.terrain_data.lacu
    this.update_ui()
    
    // render new 3x3 chunks around player
    const new_chunk_center: Vec2 = Utils.get_chunk_center(this.player.get_chunk().x, this.player.get_chunk().y)
    this.current_chunk = new Chunk(new_chunk_center.x, new_chunk_center.y, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk());
    this.adj_chunks = this.generate_adj_chunks(this.player.get_chunk())

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

    // update current terrain_height
    this.blankCubeRenderPass.updateAttributeBuffer("terrain_height", new Float32Array(this.terrain_data.height));
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
      this.player.set_chunk(curr_chunk.copy())

      // render new 3x3 chunks around player
      const new_chunk_center: Vec2 = Utils.get_chunk_center(this.player.get_chunk().x, this.player.get_chunk().y)
      this.current_chunk = new Chunk(new_chunk_center.x, new_chunk_center.y, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk());
      this.adj_chunks = this.generate_adj_chunks(this.player.get_chunk())

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

    // init rays update
    if (this.prev_ray_length < this.rr.get_rays().length)
    {
      this.prev_ray_length = this.rr.get_rays().length;
      this.init_rays();
      //console.log('init rays')
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
    if (this.prev_ray_length > 0)
    {
      this.ray_render_pass.draw();  
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
