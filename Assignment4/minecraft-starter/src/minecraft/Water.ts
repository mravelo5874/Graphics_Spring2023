import { Vec2, Vec3 } from "../lib/TSM.js";


export class Water
{
    private current_chunk: Vec2

    private vertex_pos: Vec3[];
    private indices: Vec3[];

    // TODO this
    //public get_indices(): Uint32Array { return new Uint32Array(this.indices) }

    constructor(init_chunk: Vec2)
    {
        this.current_chunk = init_chunk.copy()
        this.indices = [new Vec3([0, 1, 2]), new Vec3([2, 3, 0])]


    }

    public update_chunk(_chunk: Vec2)
    {
        this.current_chunk = _chunk.copy()
    }
}