import { Debugger } from "../lib/webglutils/Debugging.js";
import {
  CanvasAnimation,
  WebGLUtilities
} from "../lib/webglutils/CanvasAnimation.js";
import { GUI } from "./Gui.js";
import {

  blankCubeFSText,
  blankCubeVSText
} from "./Shaders.js";
import { Mat4, Vec4, Vec3, Vec2 } from "../lib/TSM.js";
import { RenderPass } from "../lib/webglutils/RenderPass.js";
import { Camera } from "../lib/webglutils/Camera.js";
import { Cube } from "./Cube.js";
import { Chunk, noise_map_data } from "./Chunk.js";

// custom imports
import { Utils, print } from "./Utils.js";
import { Player } from "./Player.js";

export class MinecraftAnimation extends CanvasAnimation 
{
  private gui: GUI;
  
  private current_chunk : Chunk; // the current chunk in which the player is in
  private adj_chunks: Chunk[]; // the 8 adjacent chuncks that surround the current_chunk
  public terrain_data: noise_map_data
  
  /*  Cube Rendering */
  private cubeGeometry: Cube;
  private blankCubeRenderPass: RenderPass;

  /* Global Rendering Info */
  private lightPosition: Vec4;
  private backgroundColor: Vec4;

  private canvas2d: HTMLCanvasElement;
  
  // Player's head position in world coordinate.
  // Player should extend two units down from this location, and 0.4 units radially.
  public player: Player;
  
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

    console.log('init pos: {' + print.v3(this.player.get_pos()) + '}')
    console.log('init chunk: {' + print.v2(this.player.get_chunk()) + '}')
    
    // create terrain data object
    this.terrain_data = new noise_map_data()

    // update ui
    this.scale_ui = this.terrain_data.scale
    this.pers_ui = this.terrain_data.pers
    this.lacu_ui = this.terrain_data.lacu
    this.pos_ui = this.player.get_pos()
    this.chunk_ui = this.player.get_chunk()
    this.update_ui()

    // generate chunks
    this.current_chunk = new Chunk(0.0, 0.0, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk());
    this.adj_chunks = this.generate_adj_chunks(this.player.get_chunk())
    
    this.blankCubeRenderPass = new RenderPass(gl, blankCubeVSText, blankCubeFSText);
    this.cubeGeometry = new Cube();
    this.initBlankCube();
    
    this.lightPosition = new Vec4([-1000, 1000, -1000, 1]);
    this.backgroundColor = new Vec4([0.0, 0.37254903, 0.37254903, 1.0]);
  }

  private generate_adj_chunks(center_chunk: Vec2): Chunk[]
  {
    // get center chunk coordinates
    const x_cen: number = center_chunk.x
    const z_cen: number = center_chunk.y

    // create list of 8 chunks
    const new_chunks: Chunk[] = new Array<Chunk>()

    // north chunk (+Z)
    const n_cen = Utils.get_chunk_center(x_cen, z_cen + 1)
    let chunk_offset: Vec2 = this.player.get_chunk().add(new Vec2([0, 1]))
    new_chunks.push(new Chunk(n_cen.x, n_cen.y, Utils.CHUNK_SIZE, this.terrain_data, chunk_offset.copy()))

    // north-east chunk (+Z)
    const ne_cen = Utils.get_chunk_center(x_cen + 1, z_cen + 1)
    chunk_offset = this.player.get_chunk().add(new Vec2([1, 1]))
    new_chunks.push(new Chunk(ne_cen.x, ne_cen.y, Utils.CHUNK_SIZE, this.terrain_data, chunk_offset.copy()))

    // east chunk (+X)
    const e_cen = Utils.get_chunk_center(x_cen + 1, z_cen)
    chunk_offset = this.player.get_chunk().add(new Vec2([1, 0]))
    new_chunks.push(new Chunk(e_cen.x, e_cen.y, Utils.CHUNK_SIZE, this.terrain_data, chunk_offset.copy()))

    // south-east chunk (+X)
    const se_cen = Utils.get_chunk_center(x_cen + 1, z_cen - 1)
    chunk_offset = this.player.get_chunk().add(new Vec2([1, -1]))
    new_chunks.push(new Chunk(se_cen.x, se_cen.y, Utils.CHUNK_SIZE, this.terrain_data, chunk_offset.copy()))

    // south chunk (-Z)
    const s_cen = Utils.get_chunk_center(x_cen, z_cen - 1)
    chunk_offset = this.player.get_chunk().add(new Vec2([0, -1]))
    new_chunks.push(new Chunk(s_cen.x, s_cen.y, Utils.CHUNK_SIZE, this.terrain_data, chunk_offset.copy()))

    // south-west chunk (-Z)
    const sw_cen = Utils.get_chunk_center(x_cen - 1, z_cen - 1)
    chunk_offset = this.player.get_chunk().add(new Vec2([-1, -1]))
    new_chunks.push(new Chunk(sw_cen.x, sw_cen.y, Utils.CHUNK_SIZE, this.terrain_data, chunk_offset.copy()))

    // west chunk (-X)
    const w_cen = Utils.get_chunk_center(x_cen - 1, z_cen)
    chunk_offset = this.player.get_chunk().add(new Vec2([-1, 0]))
    new_chunks.push(new Chunk(w_cen.x, w_cen.y, Utils.CHUNK_SIZE, this.terrain_data, chunk_offset.copy()))

    // north-west chunk (-X)
    const nw_cen = Utils.get_chunk_center(x_cen - 1, z_cen + 1)
    chunk_offset = this.player.get_chunk().add(new Vec2([-1, 1]))
    new_chunks.push(new Chunk(nw_cen.x, nw_cen.y, Utils.CHUNK_SIZE, this.terrain_data, chunk_offset.copy()))

    return new_chunks
  }

  /**
   * Setup the simulation. This can be called again to reset the program.
   */
  public reset(): void 
  {    
      this.gui.reset();
      const player_pos: Vec3 = this.gui.getCamera().pos();
      this.player = new Player(player_pos)
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
    this.pers_ui = this.terrain_data.pers
    this.lacu_ui = this.terrain_data.lacu
    this.update_ui()

    // // set player's current chunk
    // const curr_chunk: Vec2 = Utils.pos_to_chunck(this.player.get_pos())
    // this.player.set_chunk(curr_chunk.copy())
    
    // render new 3x3 chunks around player
    const new_chunk_center: Vec2 = Utils.get_chunk_center(this.player.get_chunk().x, this.player.get_chunk().y)
    this.current_chunk = new Chunk(new_chunk_center.x, new_chunk_center.y, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk());
    this.adj_chunks = this.generate_adj_chunks(this.player.get_chunk())
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
    this.player.update(move_dir, this.current_chunk, this.get_delta_time())
    
    // set player's current chunk
    const curr_chunk: Vec2 = Utils.pos_to_chunck(this.player.get_pos())
    if (!curr_chunk.equals(this.player.get_chunk()))
    {
      this.player.set_chunk(curr_chunk.copy())
      console.log('pos: {' + print.v3(this.player.get_pos()) + '}')
      console.log('chunk: {' + print.v2(this.player.get_chunk(), 0) + '}')

      // render new 3x3 chunks around player
      const new_chunk_center: Vec2 = Utils.get_chunk_center(this.player.get_chunk().x, this.player.get_chunk().y)
      this.current_chunk = new Chunk(new_chunk_center.x, new_chunk_center.y, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk());
      this.adj_chunks = this.generate_adj_chunks(this.player.get_chunk())
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
