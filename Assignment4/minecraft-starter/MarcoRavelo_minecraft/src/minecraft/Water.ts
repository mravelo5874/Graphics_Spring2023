import { Vec2, Vec3, Vec4 } from "../lib/TSM.js";
import { Utils } from "./Utils.js";


export class Water
{
    private current_chunk: Vec2
    private level: number

    private vertex_pos: number[]
    private indices: number[]
    private uvs: Vec3[]

    private indices_u32: Uint32Array
    private vertex_f32: Float32Array
    private uv_f32: Float32Array

    public get_indices(): Uint32Array {  return this.indices_u32 }
    public get_positions(): Float32Array {  return this.vertex_f32 }
    public get_uvs(): Float32Array {  return this.uv_f32 }

    constructor(init_chunk: Vec2, _level: number)
    {
        this.level = _level
        this.indices = [
            /* layer 1 */
            0, 1, 2, 2, 3, 0,
            0, 3, 2, 2, 1, 0]
        this.indices_u32 = new Uint32Array(this.indices)

        this.uvs = [
            /* Top */
            new Vec3([0.0, 0.0, 0.0]),
            new Vec3([0.0, 1.0, 0.0]),
            new Vec3([1.0, 1.0, 0.0]),
            new Vec3([1.0, 0.0, 0.0]),
            /* Bottom */
            new Vec3([0.0, 0.0, 0.0]),
            new Vec3([0.0, 1.0, 0.0]),
            new Vec3([1.0, 1.0, 0.0]),
            new Vec3([1.0, 0.0, 0.0]), 
            ];
            this.uv_f32 = new Float32Array(this.uvs.length * 2);
            this.uvs.forEach((v: Vec3, i: number) => {
              this.uv_f32.set(v.xy, i * 2);
            });

        this.update_chunk(init_chunk.copy())
    }

    public update_chunk(_chunk: Vec2)
    {
        this.current_chunk = _chunk.copy()
        this.vertex_pos = new Array<number>()

        // get chunk center
        const center: Vec2 = Utils.get_chunk_center(this.current_chunk.x, this.current_chunk.y)
        
        let corner_0: Vec4 = new Vec4([center.x - (Utils.CHUNK_SIZE * 1.5), this.level, center.y - (Utils.CHUNK_SIZE * 1.5), 1])
        let corner_1: Vec4 = new Vec4([center.x + (Utils.CHUNK_SIZE * 1.5), this.level, center.y - (Utils.CHUNK_SIZE * 1.5), 1])
        let corner_2: Vec4 = new Vec4([center.x + (Utils.CHUNK_SIZE * 1.5), this.level, center.y + (Utils.CHUNK_SIZE * 1.5), 1])
        let corner_3: Vec4 = new Vec4([center.x - (Utils.CHUNK_SIZE * 1.5), this.level, center.y + (Utils.CHUNK_SIZE * 1.5), 1])
        for (let i = 0; i < 4; i++) this.vertex_pos.push(corner_0.at(i))
        for (let i = 0; i < 4; i++) this.vertex_pos.push(corner_3.at(i))
        for (let i = 0; i < 4; i++) this.vertex_pos.push(corner_2.at(i))
        for (let i = 0; i < 4; i++) this.vertex_pos.push(corner_1.at(i))
        for (let i = 0; i < 4; i++) this.vertex_pos.push(corner_2.at(i))
        for (let i = 0; i < 4; i++) this.vertex_pos.push(corner_0.at(i))

        for (let i = 0; i < 4; i++) this.vertex_pos.push(corner_0.at(i))
        for (let i = 0; i < 4; i++) this.vertex_pos.push(corner_2.at(i))
        for (let i = 0; i < 4; i++) this.vertex_pos.push(corner_1.at(i))
        for (let i = 0; i < 4; i++) this.vertex_pos.push(corner_2.at(i))
        for (let i = 0; i < 4; i++) this.vertex_pos.push(corner_3.at(i))
        for (let i = 0; i < 4; i++) this.vertex_pos.push(corner_0.at(i))

        this.vertex_f32 = new Float32Array(this.vertex_pos)
    }
}