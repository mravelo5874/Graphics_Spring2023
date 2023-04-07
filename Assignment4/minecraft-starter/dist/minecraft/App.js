import { Debugger } from "../lib/webglutils/Debugging.js";
import { CanvasAnimation } from "../lib/webglutils/CanvasAnimation.js";
import { GUI } from "./Gui.js";
import { blankCubeFSText, blankCubeVSText, ray_vertex_shader, ray_fragment_shader } from "./Shaders.js";
import { Mat4, Vec4, Vec3, Vec2 } from "../lib/TSM.js";
import { RenderPass } from "../lib/webglutils/RenderPass.js";
import { Cube } from "./Cube.js";
import { Chunk, noise_map_data } from "./Chunk.js";
// custom imports
import { Utils } from "./Utils.js";
import { Player } from "./Player.js";
import { Noise } from "./Noise.js";
import { RaycastRenderer } from "./RaycastRenderer.js";
import { WireCube } from "./WireCube.js";
class MinecraftAnimation extends CanvasAnimation {
    constructor(canvas) {
        super(canvas);
        this.cube_texture_size = 32;
        this.render_wire_cube = false;
        // render pass for rendering rays
        this.prev_ray_length = 0;
        this.canvas2d = document.getElementById("textCanvas");
        this.ctx = Debugger.makeDebugContext(this.ctx);
        let gl = this.ctx;
        this.gui = new GUI(this.canvas2d, this);
        // create player
        const player_pos = this.gui.getCamera().pos();
        this.player = new Player(player_pos);
        // create raycast renderer
        this.rr = new RaycastRenderer();
        this.ray_render_pass = new RenderPass(gl, ray_vertex_shader, ray_fragment_shader);
        // create terrain data object
        this.terrain_data = new noise_map_data();
        // update ui
        this.scale_ui = this.terrain_data.scale;
        this.height_ui = this.terrain_data.height;
        this.pers_ui = this.terrain_data.pers;
        this.lacu_ui = this.terrain_data.lacu;
        this.pos_ui = this.player.get_pos();
        this.chunk_ui = this.player.get_chunk();
        this.update_ui();
        // generate chunks
        this.current_chunk = new Chunk(0.0, 0.0, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk());
        this.adj_chunks = this.generate_adj_chunks(this.player.get_chunk());
        // get edge colliders for all 8 adjacent chunks
        this.edge_colliders = new Array();
        for (let i = 0; i < this.adj_chunks.length; i++) {
            let edges = this.adj_chunks[i].get_edge_colliders();
            for (let j = 0; j < edges.length; j++) {
                this.edge_colliders.push(edges[j]);
            }
        }
        // generate cube textures
        this.cube_texture_size = 32;
        this.cube_noise_map = new noise_map_data();
        this.cube_texture = Noise.generate_noise_map(this.cube_texture_size, this.cube_noise_map, Vec2.zero.copy(), true);
        // blank cube
        this.blankCubeRenderPass = new RenderPass(gl, blankCubeVSText, blankCubeFSText);
        this.cubeGeometry = new Cube();
        this.initBlankCube();
        // wire cube
        this.render_wire_cube = true;
        this.wire_cube = new WireCube(new Vec3([0.0, 46.0, 0.0]), Utils.CUBE_LEN, 'red');
        this.wire_cube_pass = new RenderPass(gl, ray_vertex_shader, ray_fragment_shader);
        this.init_wire_cube();
        // environment stuff
        this.lightPosition = new Vec4([-1000, 1000, -1000, 1]);
        this.backgroundColor = new Vec4([0.470588, 0.756863, 0.890196, 1.0]);
    }
    generate_adj_chunks(center_chunk) {
        // get center chunk coordinates
        const x_cen = center_chunk.x;
        const z_cen = center_chunk.y;
        // create list of 8 chunks
        const new_chunks = new Array();
        // north chunk (+Z)
        const n_cen = Utils.get_chunk_center(x_cen, z_cen + 1);
        new_chunks.push(new Chunk(n_cen.x, n_cen.y, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk().add(MinecraftAnimation.n_offset)));
        // north-east chunk (+Z)
        const ne_cen = Utils.get_chunk_center(x_cen + 1, z_cen + 1);
        new_chunks.push(new Chunk(ne_cen.x, ne_cen.y, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk().add(MinecraftAnimation.ne_offset)));
        // east chunk (+X)
        const e_cen = Utils.get_chunk_center(x_cen + 1, z_cen);
        new_chunks.push(new Chunk(e_cen.x, e_cen.y, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk().add(MinecraftAnimation.e_offset)));
        // south-east chunk (+X)
        const se_cen = Utils.get_chunk_center(x_cen + 1, z_cen - 1);
        new_chunks.push(new Chunk(se_cen.x, se_cen.y, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk().add(MinecraftAnimation.se_offset)));
        // south chunk (-Z)
        const s_cen = Utils.get_chunk_center(x_cen, z_cen - 1);
        new_chunks.push(new Chunk(s_cen.x, s_cen.y, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk().add(MinecraftAnimation.s_offset)));
        // south-west chunk (-Z)
        const sw_cen = Utils.get_chunk_center(x_cen - 1, z_cen - 1);
        new_chunks.push(new Chunk(sw_cen.x, sw_cen.y, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk().add(MinecraftAnimation.sw_offset)));
        // west chunk (-X)
        const w_cen = Utils.get_chunk_center(x_cen - 1, z_cen);
        new_chunks.push(new Chunk(w_cen.x, w_cen.y, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk().add(MinecraftAnimation.w_offset)));
        // north-west chunk (-X)
        const nw_cen = Utils.get_chunk_center(x_cen - 1, z_cen + 1);
        new_chunks.push(new Chunk(nw_cen.x, nw_cen.y, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk().add(MinecraftAnimation.nw_offset)));
        return new_chunks;
    }
    /**
     * Setup the simulation. This can be called again to reset the program.
     */
    reset() {
        // reser gui
        this.gui.reset();
        // reset player
        const player_pos = this.gui.getCamera().pos();
        this.player = new Player(player_pos);
        const curr_chunk = Utils.pos_to_chunck(this.player.get_pos());
        this.player.set_chunk(curr_chunk.copy());
        // generate chunks
        this.current_chunk = new Chunk(0.0, 0.0, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk());
        this.adj_chunks = this.generate_adj_chunks(this.player.get_chunk());
        // get edge colliders for all 8 adjacent chunks
        this.edge_colliders = new Array();
        for (let i = 0; i < this.adj_chunks.length; i++) {
            let edges = this.adj_chunks[i].get_edge_colliders();
            for (let j = 0; j < edges.length; j++) {
                this.edge_colliders.push(edges[j]);
            }
        }
        // reset rays
        this.prev_ray_length = 0;
        this.rr.clear_rays();
        this.init_rays();
        // update ui
        this.scale_ui = this.terrain_data.scale;
        this.height_ui = this.terrain_data.height;
        this.pers_ui = this.terrain_data.pers;
        this.lacu_ui = this.terrain_data.lacu;
        this.pos_ui = this.player.get_pos();
        this.chunk_ui = this.player.get_chunk();
        this.mode_ui = this.player.get_creative_mode();
        this.update_ui();
    }
    init_rays() {
        // index buffer ray is ray indices
        this.ray_render_pass.setIndexBufferData(this.rr.get_ray_indices());
        // vertex positions
        this.ray_render_pass.addAttribute("vertex_pos", 3, this.ctx.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0, undefined, this.rr.get_ray_positions());
        // vertex colors
        this.ray_render_pass.addAttribute("vertex_color", 3, this.ctx.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0, undefined, this.rr.get_ray_colors());
        // add matricies
        this.ray_render_pass.addUniform("world_mat", (gl, loc) => {
            gl.uniformMatrix4fv(loc, false, new Float32Array(Mat4.identity.all()));
        });
        this.ray_render_pass.addUniform("proj_mat", (gl, loc) => {
            gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.projMatrix().all()));
        });
        this.ray_render_pass.addUniform("view_mat", (gl, loc) => {
            gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.viewMatrix().all()));
        });
        this.ray_render_pass.setDrawData(this.ctx.LINES, this.rr.get_ray_indices().length, this.ctx.UNSIGNED_INT, 0);
        this.ray_render_pass.setup();
    }
    init_wire_cube() {
        // reset render pass
        this.wire_cube_pass = new RenderPass(this.ctx, ray_vertex_shader, ray_fragment_shader);
        // index buffer ray is ray indices
        this.wire_cube_pass.setIndexBufferData(this.wire_cube.get_indices());
        // vertex positions
        this.wire_cube_pass.addAttribute("vertex_pos", 3, this.ctx.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0, undefined, this.wire_cube.get_positions());
        // vertex colors
        this.wire_cube_pass.addAttribute("vertex_color", 3, this.ctx.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0, undefined, this.wire_cube.get_colors());
        // add matricies
        this.wire_cube_pass.addUniform("world_mat", (gl, loc) => {
            gl.uniformMatrix4fv(loc, false, new Float32Array(Mat4.identity.all()));
        });
        this.wire_cube_pass.addUniform("proj_mat", (gl, loc) => {
            gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.projMatrix().all()));
        });
        this.wire_cube_pass.addUniform("view_mat", (gl, loc) => {
            gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.viewMatrix().all()));
        });
        this.wire_cube_pass.setDrawData(this.ctx.LINES, this.wire_cube.get_indices().length, this.ctx.UNSIGNED_INT, 0);
        this.wire_cube_pass.setup();
    }
    /**
     * Sets up the blank cube drawing
     */
    initBlankCube() {
        this.blankCubeRenderPass.setIndexBufferData(this.cubeGeometry.indicesFlat());
        this.blankCubeRenderPass.addAttribute("aVertPos", 4, this.ctx.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0, undefined, this.cubeGeometry.positionsFlat());
        this.blankCubeRenderPass.addAttribute("aNorm", 4, this.ctx.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0, undefined, this.cubeGeometry.normalsFlat());
        this.blankCubeRenderPass.addAttribute("aUV", 2, this.ctx.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0, undefined, this.cubeGeometry.uvFlat());
        this.blankCubeRenderPass.addInstancedAttribute("aOffset", 4, this.ctx.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0, undefined, new Float32Array(0));
        this.blankCubeRenderPass.addInstancedAttribute("terrain_height", 1, this.ctx.FLOAT, false, 1 * Float32Array.BYTES_PER_ELEMENT, 0, undefined, new Float32Array(this.terrain_data.height));
        this.blankCubeRenderPass.addUniform("uLightPos", (gl, loc) => {
            gl.uniform4fv(loc, this.lightPosition.xyzw);
        });
        this.blankCubeRenderPass.addUniform("uProj", (gl, loc) => {
            gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.projMatrix().all()));
        });
        this.blankCubeRenderPass.addUniform("uView", (gl, loc) => {
            gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.viewMatrix().all()));
        });
        this.blankCubeRenderPass.setDrawData(this.ctx.TRIANGLES, this.cubeGeometry.indicesFlat().length, this.ctx.UNSIGNED_INT, 0);
        this.blankCubeRenderPass.setup();
    }
    // used to update chunks after terrain change has been made 
    update_terrain() {
        this.scale_ui = this.terrain_data.scale;
        this.height_ui = this.terrain_data.height;
        this.pers_ui = this.terrain_data.pers;
        this.lacu_ui = this.terrain_data.lacu;
        this.update_ui();
        // render new 3x3 chunks around player
        const new_chunk_center = Utils.get_chunk_center(this.player.get_chunk().x, this.player.get_chunk().y);
        this.current_chunk = new Chunk(new_chunk_center.x, new_chunk_center.y, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk());
        this.adj_chunks = this.generate_adj_chunks(this.player.get_chunk());
        // get edge colliders for all 8 adjacent chunks
        this.edge_colliders = new Array();
        for (let i = 0; i < this.adj_chunks.length; i++) {
            let edges = this.adj_chunks[i].get_edge_colliders();
            for (let j = 0; j < edges.length; j++) {
                this.edge_colliders.push(edges[j]);
            }
        }
        // update current terrain_height
        this.blankCubeRenderPass.updateAttributeBuffer("terrain_height", new Float32Array(this.terrain_data.height));
    }
    // send mouse raycast and chunk blocks to player
    try_destroy_block(ray) {
        const cubes = this.current_chunk.get_cube_colliders();
        let near = new Array();
        let min_t = Number.MAX_VALUE;
        let hit_idx = -1;
        // get all blocks within a certain range
        for (let i = 0; i < cubes.length; i++) {
            if (Vec3.distance(cubes[i].get_pos(), ray.get_origin()) <= Utils.PLAYER_REACH) {
                near.push(cubes[i]);
            }
        }
        console.log('near cubes: ' + near.length);
        // check each near cube for ray intersection
        for (let i = 0; i < near.length; i++) {
            const t = Utils.ray_cube_intersection(ray.copy(), near[i]);
        }
        // find cube and hightlight
        // TODO all this
        // remove cube from chunk
        if (hit_idx > -1 && min_t > -1) {
            this.current_chunk.remove_cube(near[hit_idx]);
        }
    }
    /**
     * Draws a single frame
     *
     */
    draw() {
        // Logic for a rudimentary walking simulator. Check for collisions 
        // and reject attempts to walk into a cube. Handle gravity, jumping, 
        // and loading of new chunks when necessary.
        const move_dir = this.gui.walkDir();
        // apply physics to player rigid body
        this.player.update(move_dir, this.current_chunk, this.edge_colliders, this.get_delta_time());
        // set player's current chunk
        const curr_chunk = Utils.pos_to_chunck(this.player.get_pos());
        if (!curr_chunk.equals(this.player.get_chunk())) {
            this.player.set_chunk(curr_chunk.copy());
            // render new 3x3 chunks around player
            const new_chunk_center = Utils.get_chunk_center(this.player.get_chunk().x, this.player.get_chunk().y);
            this.current_chunk = new Chunk(new_chunk_center.x, new_chunk_center.y, Utils.CHUNK_SIZE, this.terrain_data, this.player.get_chunk());
            this.adj_chunks = this.generate_adj_chunks(this.player.get_chunk());
            // get edge colliders for all 8 adjacent chunks
            this.edge_colliders = new Array();
            for (let i = 0; i < this.adj_chunks.length; i++) {
                let edges = this.adj_chunks[i].get_edge_colliders();
                for (let j = 0; j < edges.length; j++) {
                    this.edge_colliders.push(edges[j]);
                }
            }
        }
        // init rays update
        if (this.prev_ray_length < this.rr.get_rays().length) {
            this.prev_ray_length = this.rr.get_rays().length;
            this.init_rays();
        }
        // init hex updates
        if (this.wire_cube.get_update()) {
            this.render_wire_cube = true;
            this.init_wire_cube();
            this.wire_cube.got_update();
        }
        // set the player's current position
        this.gui.getCamera().setPos(this.player.get_pos());
        // set ui values 
        this.pos_ui = this.player.get_pos();
        this.chunk_ui = this.player.get_chunk();
        this.update_ui();
        // Drawing
        const gl = this.ctx;
        const bg = this.backgroundColor;
        gl.clearColor(bg.r, bg.g, bg.b, bg.a);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.BACK);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null); // null is the default frame buffer
        this.drawScene(0, 0, 1280, 960);
    }
    drawScene(x, y, width, height) {
        const gl = this.ctx;
        gl.viewport(x, y, width, height);
        // Render multiple chunks around the player, using Perlin noise shaders
        this.blankCubeRenderPass.updateAttributeBuffer("aOffset", this.get_all_cube_pos());
        this.blankCubeRenderPass.drawInstanced(this.get_all_num_cubes());
        // draw rays
        if (this.prev_ray_length > 0) {
            this.ray_render_pass.draw();
        }
        // draw wire cube
        if (this.render_wire_cube) {
            gl.disable(gl.DEPTH_TEST);
            this.wire_cube_pass.draw();
            gl.enable(gl.DEPTH_TEST);
        }
    }
    get_all_cube_pos() {
        let float_array = new Array();
        // add center chunk cube positions
        const center_chunk_pos = this.current_chunk.cubePositions();
        for (let i = 0; i < center_chunk_pos.length; i++) {
            float_array.push(center_chunk_pos[i]);
        }
        // add all adjecent chunk's cube positions
        for (let i = 0; i < Utils.NUM_ADJ_CHUNKS; i++) {
            const chunk_pos = this.adj_chunks[i].cubePositions();
            for (let j = 0; j < chunk_pos.length; j++) {
                float_array.push(chunk_pos[j]);
            }
        }
        // return all combined
        return new Float32Array(float_array);
    }
    // add up all number of cubes in each chunk
    get_all_num_cubes() {
        let num_cubes_sum = 0;
        num_cubes_sum += this.current_chunk.numCubes();
        for (let i = 0; i < Utils.NUM_ADJ_CHUNKS; i++)
            num_cubes_sum += this.adj_chunks[i].numCubes();
        return num_cubes_sum;
    }
    getGUI() { return this.gui; }
}
MinecraftAnimation.n_offset = new Vec2([0, 1]);
MinecraftAnimation.ne_offset = new Vec2([1, 1]);
MinecraftAnimation.e_offset = new Vec2([1, 0]);
MinecraftAnimation.se_offset = new Vec2([1, -1]);
MinecraftAnimation.s_offset = new Vec2([0, -1]);
MinecraftAnimation.sw_offset = new Vec2([-1, -1]);
MinecraftAnimation.w_offset = new Vec2([-1, 0]);
MinecraftAnimation.nw_offset = new Vec2([-1, 1]);
export { MinecraftAnimation };
export function initializeCanvas() {
    const canvas = document.getElementById("glCanvas");
    /* Start drawing */
    const canvasAnimation = new MinecraftAnimation(canvas);
    canvasAnimation.start();
}
//# sourceMappingURL=App.js.map