import { Vec3 } from "../lib/TSM.js";
import { Utils } from "./Utils.js";
export class WireCube {
    get_update() { return this.update; }
    got_update() { this.update = false; }
    // requires position (center of cube) and side length to build
    constructor(_pos, _len, _color) {
        this.update = false;
        // set indices array (will not change) 24
        this.indices = new Array();
        for (let i = 0; i < 24; i++)
            this.indices.push(i);
        this.set_color(_color);
        this.set_positions(_pos.copy(), _len);
    }
    set_positions(_pos, _len) {
        this.pos = _pos.copy();
        this.len = _len;
        this.positions = new Array();
        const p = this.pos.copy();
        const s = this.len / 2;
        const min = new Vec3([p.x - s, p.y - s, p.z - s]);
        const max = new Vec3([p.x + s, p.y + s, p.z + s]);
        // 8 verts on cube
        const a = new Vec3(min.xyz);
        const b = new Vec3([min.x, min.y, max.z]);
        const c = new Vec3([max.x, min.y, max.z]);
        const d = new Vec3([max.x, min.y, min.z]);
        const e = new Vec3([min.x, max.y, min.z]);
        const f = new Vec3([min.x, max.y, max.z]);
        const g = new Vec3(max.xyz);
        const h = new Vec3([max.x, max.y, min.z]);
        /* top face */
        for (let i = 0; i < 3; i++)
            this.positions.push(a.at(i)); // a -> b
        for (let i = 0; i < 3; i++)
            this.positions.push(b.at(i));
        for (let i = 0; i < 3; i++)
            this.positions.push(b.at(i)); // b -> c
        for (let i = 0; i < 3; i++)
            this.positions.push(c.at(i));
        for (let i = 0; i < 3; i++)
            this.positions.push(c.at(i)); // c -> d
        for (let i = 0; i < 3; i++)
            this.positions.push(d.at(i));
        for (let i = 0; i < 3; i++)
            this.positions.push(d.at(i)); // d -> a
        for (let i = 0; i < 3; i++)
            this.positions.push(a.at(i));
        /* bot face */
        for (let i = 0; i < 3; i++)
            this.positions.push(e.at(i)); // e -> f
        for (let i = 0; i < 3; i++)
            this.positions.push(f.at(i));
        for (let i = 0; i < 3; i++)
            this.positions.push(f.at(i)); // f -> g
        for (let i = 0; i < 3; i++)
            this.positions.push(g.at(i));
        for (let i = 0; i < 3; i++)
            this.positions.push(g.at(i)); // g -> h
        for (let i = 0; i < 3; i++)
            this.positions.push(h.at(i));
        for (let i = 0; i < 3; i++)
            this.positions.push(h.at(i)); // h -> e
        for (let i = 0; i < 3; i++)
            this.positions.push(e.at(i));
        /* legs */
        for (let i = 0; i < 3; i++)
            this.positions.push(a.at(i)); // a -> e
        for (let i = 0; i < 3; i++)
            this.positions.push(e.at(i));
        for (let i = 0; i < 3; i++)
            this.positions.push(b.at(i)); // b -> f
        for (let i = 0; i < 3; i++)
            this.positions.push(f.at(i));
        for (let i = 0; i < 3; i++)
            this.positions.push(c.at(i)); // c -> g
        for (let i = 0; i < 3; i++)
            this.positions.push(g.at(i));
        for (let i = 0; i < 3; i++)
            this.positions.push(d.at(i)); // d -> h
        for (let i = 0; i < 3; i++)
            this.positions.push(h.at(i));
        // update cube
        this.update = true;
    }
    set_color(_color) {
        this.colors = new Array();
        this.color = Utils.get_color(_color).copy();
        // add ray colors (will not change) 24
        for (let i = 0; i < 36; i++) {
            this.colors.push(this.color.x);
            this.colors.push(this.color.y);
            this.colors.push(this.color.z);
        }
        // update cube
        this.update = true;
    }
    get_indices() {
        return new Uint32Array(this.indices);
    }
    get_positions() {
        return new Float32Array(this.positions);
    }
    get_colors() {
        return new Float32Array(this.colors);
    }
}
//# sourceMappingURL=WireCube.js.map