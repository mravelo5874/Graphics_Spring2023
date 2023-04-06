import { Vec3 } from "../lib/TSM.js";
import { Ray, Utils } from "./Utils.js";

export class RaycastRenderer
{
    private rays : Ray[]; // used to story rays to draw
    private ray_indices: number[];
    private ray_positions: number[];
    private ray_colors: number[];
    private ray_index_count : number = 0;

    constructor ()
    {
        this.rays = []
        this.ray_indices = new Array<number>();
        this.ray_positions = new Array<number>();
        this.ray_colors = new Array<number>();
        this.ray_index_count = 0
    }

    public get_rays()
    {
        return this.rays;
    }

    public add_ray(r : Ray, color : string, length : number = -100.0) : void
    {
        // add to ray list
        this.rays.push(r)

        // add ray indices
        const new_ray_indices = new Array<number>(this.ray_index_count, this.ray_index_count + 1)
        this.ray_index_count += 2
        for (let i = 0; i < 2; i++) this.ray_indices.push(new_ray_indices[i])
        
        // add ray positions
        const start : Vec3 = r.get_origin()
        const end : Vec3 = r.get_origin().add(r.get_direction().scale(length))
        this.ray_positions.push(start.x)
        this.ray_positions.push(start.y)
        this.ray_positions.push(start.z)
        this.ray_positions.push(end.x)
        this.ray_positions.push(end.y)
        this.ray_positions.push(end.z)

        // add ray colors
        let color_id : Vec3 = Utils.get_color(color)
        this.ray_colors.push(color_id.x)
        this.ray_colors.push(color_id.y)
        this.ray_colors.push(color_id.z)
        this.ray_colors.push(color_id.x)
        this.ray_colors.push(color_id.y)
        this.ray_colors.push(color_id.z)
    }

    public get_ray_indices(): Uint32Array 
    {
        return new Uint32Array(this.ray_indices);
    }

    public get_ray_positions(): Float32Array 
    {
        return new Float32Array(this.ray_positions);
    }

    public get_ray_colors() : Float32Array
    {
        return new Float32Array(this.ray_colors)
    }
}