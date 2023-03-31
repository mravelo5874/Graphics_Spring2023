import { Vec3, Vec2 } from "../lib/TSM.js";

export class print
{
    public static DIGITS: number = 3

    public static v3(v: Vec3, d: number = this.DIGITS) : string { return v.x.toFixed(d) + ', ' + v.y.toFixed(d) + ', ' + v.z.toFixed(d) }
    public static v2(v: Vec2, d: number = this.DIGITS) : string { return v.x.toFixed(d) + ', ' + v.y.toFixed(d) }
}

export class Utils
{
    public static CHUNK_SIZE: number = 64
    public static HALF_CHUNK_SIZE: number = this.CHUNK_SIZE / 2
    public static NUM_ADJ_CHUNKS: number = 8

    // returns what chunk the player is in based of their position
    public static get_chunck(pos: Vec3): Vec2
    {   
        const x_chunk: number = Math.floor((pos.x + this.HALF_CHUNK_SIZE) / this.CHUNK_SIZE)
        const z_chunk: number = Math.floor((pos.z + this.HALF_CHUNK_SIZE) / this.CHUNK_SIZE)
        return new Vec2([x_chunk, z_chunk])
    }

    // gets the center of a chunk based of its chunk coordinates (given by this.get_chunk())
    public static get_chunk_center(x_coord: number, z_coord: number): Vec2
    {
        const x_center: number = x_coord * this.CHUNK_SIZE
        const z_center: number = z_coord * this.CHUNK_SIZE
        return new Vec2([x_center, z_center])
    }

    // returns a 64x64 patch of terrain heights
    public static get_chunk_heights(chunk_coords: Vec2): void
    {
        // TODO
    }
}