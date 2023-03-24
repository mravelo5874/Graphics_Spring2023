import { Util } from "./Utils.js";
export class RaycastRenderer {
    constructor() {
        this.ray_index_count = 0;
        this.rays = [];
        this.ray_indices = new Array();
        this.ray_positions = new Array();
        this.ray_colors = new Array();
        this.ray_index_count = 0;
    }
    get_rays() {
        return this.rays;
    }
    add_ray(r, color, length = -100.0) {
        // add to ray list
        this.rays.push(r);
        // add ray indices
        const new_ray_indices = new Array(this.ray_index_count, this.ray_index_count + 1);
        this.ray_index_count += 2;
        for (let i = 0; i < 2; i++)
            this.ray_indices.push(new_ray_indices[i]);
        // add ray positions
        const start = r.get_origin();
        const end = r.get_origin().add(r.get_direction().scale(length));
        this.ray_positions.push(start.x);
        this.ray_positions.push(start.y);
        this.ray_positions.push(start.z);
        this.ray_positions.push(end.x);
        this.ray_positions.push(end.y);
        this.ray_positions.push(end.z);
        // add ray colors
        let color_id = Util.get_color(color);
        this.ray_colors.push(color_id.x);
        this.ray_colors.push(color_id.y);
        this.ray_colors.push(color_id.z);
        this.ray_colors.push(color_id.x);
        this.ray_colors.push(color_id.y);
        this.ray_colors.push(color_id.z);
    }
    get_ray_indices() {
        return new Uint32Array(this.ray_indices);
    }
    get_ray_positions() {
        return new Float32Array(this.ray_positions);
    }
    get_ray_colors() {
        return new Float32Array(this.ray_colors);
    }
}
//# sourceMappingURL=RaycastRenderer.js.map