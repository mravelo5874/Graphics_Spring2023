import { Utils, print } from "./Utils.js";
import { Vec3, Vec2 } from "../lib/TSM";

export class Player
{
    private pos: Vec3;
    private chunk: Vec2;
    private speed: number;
    private sense: number;

    // pos access
    public get_pos(): Vec3 { return this.pos.copy() }
    // chunk access
    public get_chunk(): Vec2 { return this.chunk.copy() }
    public set_chunk(_chunk: Vec2): void { this.chunk = _chunk.copy() }
    // settings access
    public get_sense(): number { return this.sense }

    constructor(_pos: Vec3)
    {
        this.pos = _pos.copy()
        this.chunk = Utils.pos_to_chunck(this.pos)
        this.speed = 0.25
        this.sense = 0.25
    }

    public move(dir: Vec3): void
    {
        this.pos.add(dir.copy().scale(this.speed))
    }
}