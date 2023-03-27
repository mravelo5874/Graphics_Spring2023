import { Vec3 } from "../lib/TSM.js";
import { Utils } from "./Utils.js";
// class used to convert bones into hex prisms
export class Hex {
    get_update() { return this.update; }
    got_update() { this.update = false; }
    constructor() {
        this.update = false;
        this.deleted = false;
        this.start = Vec3.zero.copy();
        this.end = Vec3.zero.copy();
        this.id = -1;
        this.color = new Vec3([0.0, 1.0, 0.0]); // default color is green
        this.hex_indices = new Array();
        this.hex_positions = new Array();
        this.hex_colors = new Array();
        this.hex_indices_array = new Uint32Array(0);
        this.hex_positions_array = new Float32Array(0);
        this.hex_colors_array = new Float32Array(0);
        // set indices array (will not change) (should be 18 lines = 36 indices)
        for (let i = 0; i < 36; i++)
            this.hex_indices.push(i);
        this.hex_indices_array = new Uint32Array(this.hex_indices);
        // add ray colors (should be 18 lines = 36 indices = 108 pos values = 108 color values)
        for (let i = 0; i < 36; i++) {
            this.hex_colors.push(this.color.x);
            this.hex_colors.push(this.color.y);
            this.hex_colors.push(this.color.z);
        }
        this.hex_colors_array = new Float32Array(this.hex_colors);
    }
    set_color(_color) {
        // return if already this color
        if (this.color.equals(_color))
            return;
        // set color
        this.color = _color;
        // update current colors
        if (this.hex_colors.length > 0) {
            // remove colors
            this.hex_colors = [];
            // add ray colors (should be 18 lines = 36 indices = 108 pos values = 108 color values
            for (let i = 0; i < 36; i++) {
                this.hex_colors.push(this.color.x);
                this.hex_colors.push(this.color.y);
                this.hex_colors.push(this.color.z);
            }
        }
        this.hex_colors_array = new Float32Array(this.hex_colors);
        this.update = true;
        console.log('set hex color!');
    }
    rotate(offset, quat) {
        let i = 0;
        while (i < this.hex_positions.length) {
            // get pos
            const x = this.hex_positions[i];
            const y = this.hex_positions[i + 1];
            const z = this.hex_positions[i + 2];
            const pos = new Vec3([x, y, z]);
            // rotate pos
            const rot_pos = Utils.rotate_vec_using_quat(pos.copy().subtract(offset.copy()), quat.copy()).add(offset.copy());
            // re-assign pos
            this.hex_positions[i] = rot_pos.x;
            this.hex_positions[i + 1] = rot_pos.y;
            this.hex_positions[i + 2] = rot_pos.z;
            i += 3;
        }
        this.hex_positions_array = new Float32Array(this.hex_positions);
        this.update = true;
        console.log('set hex rotate!');
    }
    set(_start, _end, _id) {
        // return if same id
        if (this.id == _id)
            return;
        // set new values
        this.id = _id;
        this.deleted = false;
        // copy new start and end pos
        this.start = _start.copy();
        this.end = _end.copy();
        // clear position arrays
        this.hex_positions = [];
        this.hex_positions_array = new Float32Array(0);
        // get new hex positions
        this.convert();
        this.update = true;
        console.log('set hex!');
    }
    del() {
        // return already deleted
        if (this.deleted)
            return;
        // set new values
        this.id = -1;
        this.deleted = true;
        this.update = true;
        console.log('del hex!');
    }
    convert() {
        const dir = this.end.copy().subtract(this.start.copy()).normalize();
        const per = Utils.find_orthonormal_vectors(dir)[0].normalize();
        const pi_over_3 = Hex.pi_over_3;
        // calculate 6 hex points around start point
        const init_p = per.copy().scale(Hex.radius);
        const a1 = Utils.rotate_point(init_p, dir, pi_over_3 * 0).add(this.start);
        const b1 = Utils.rotate_point(init_p, dir, pi_over_3 * 1).add(this.start);
        const c1 = Utils.rotate_point(init_p, dir, pi_over_3 * 2).add(this.start);
        const d1 = Utils.rotate_point(init_p, dir, pi_over_3 * 3).add(this.start);
        const e1 = Utils.rotate_point(init_p, dir, pi_over_3 * 4).add(this.start);
        const f1 = Utils.rotate_point(init_p, dir, pi_over_3 * 5).add(this.start);
        const a2 = Utils.rotate_point(init_p, dir, pi_over_3 * 0).add(this.end);
        const b2 = Utils.rotate_point(init_p, dir, pi_over_3 * 1).add(this.end);
        const c2 = Utils.rotate_point(init_p, dir, pi_over_3 * 2).add(this.end);
        const d2 = Utils.rotate_point(init_p, dir, pi_over_3 * 3).add(this.end);
        const e2 = Utils.rotate_point(init_p, dir, pi_over_3 * 4).add(this.end);
        const f2 = Utils.rotate_point(init_p, dir, pi_over_3 * 5).add(this.end);
        // add ray positions (should be 18 lines = 36 indices = 108 pos values)
        // start hexagon cap
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(a1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(b1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(b1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(c1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(c1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(d1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(d1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(e1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(e1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(f1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(f1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(a1.at(i));
        // end hexagon cap
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(a2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(b2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(b2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(c2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(c2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(d2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(d2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(e2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(e2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(f2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(f2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(a2.at(i));
        // connect caps
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(a1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(a2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(b1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(b2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(c1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(c2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(d1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(d2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(e1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(e2.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(f1.at(i));
        for (let i = 0; i < 3; i++)
            this.hex_positions.push(f2.at(i));
        // set position array
        this.hex_positions_array = new Float32Array(this.hex_positions);
        console.log('converted hex!');
    }
    get_hex_indices() {
        console.log('getting hex indices!');
        if (this.deleted)
            return new Uint32Array(0);
        else
            return this.hex_indices_array;
    }
    get_hex_positions() {
        console.log('getting hex pos!');
        if (this.deleted)
            return new Float32Array(0);
        else
            return this.hex_positions_array;
    }
    get_hex_colors() {
        console.log('getting hex colors!');
        if (this.deleted)
            return new Float32Array(0);
        else
            return this.hex_colors_array;
    }
}
Hex.radius = 0.1;
Hex.pi_over_3 = Math.PI / 3;
//# sourceMappingURL=Hex.js.map