import { Vec3 } from "../lib/TSM.js";
import { Utils } from "./Utils.js";
// class used to convert bones into hex prisms
export class Hex {
    get_update() { return this.update; }
    got_update() { this.update = false; }
    constructor() {
        this.update = false;
        this.start = Vec3.zero.copy();
        this.end = Vec3.zero.copy();
        this.id = -1;
        this.deleted = false;
        this.color = new Vec3([0.0, 1.0, 0.0]); // default color is green
        this.hex_indices = new Array();
        this.hex_positions = new Array();
        this.hex_colors = new Array();
    }
    set_color(_color) {
        // return if already this color
        if (this.color == _color)
            return;
        // set color
        this.color = _color;
        // update current colors
        if (this.hex_colors.length > 0) {
            // remove colors
            this.hex_colors.splice(0, this.hex_colors.length);
            // add ray colors (should be 18 lines = 36 indices = 108 pos values = 108 color values
            for (let i = 0; i < 36; i++) {
                this.hex_colors.push(this.color.x);
                this.hex_colors.push(this.color.y);
                this.hex_colors.push(this.color.z);
            }
        }
        this.update = true;
    }
    rotate(quat) {
        let i = 0;
        while (i < this.hex_positions.length) {
            // TODO fix this :<
            // get pos
            const x = this.hex_positions[i];
            const y = this.hex_positions[i + 1];
            const z = this.hex_positions[i + 2];
            const pos = new Vec3([x, y, z]);
            // rotate pos
            const rot_pos = pos.copy().multiplyByQuat(quat);
            // re-assign pos
            this.hex_positions[i] = rot_pos.x;
            this.hex_positions[i + 1] = rot_pos.y;
            this.hex_positions[i + 2] = rot_pos.z;
            i += 3;
        }
        this.update = true;
    }
    set(_start, _end, _id) {
        // return if same id
        if (this.id == _id)
            return;
        // set new values
        this.id = _id;
        this.deleted = false;
        // console.log('Hex.set()')
        // console.log('this.start: ' + Util.Vec3_toFixed(this.start))
        // console.log('_start: ' + Util.Vec3_toFixed(_start))
        // console.log('this.end: ' + Util.Vec3_toFixed(this.end))
        // console.log('_end: ' + Util.Vec3_toFixed(_end))
        // console.log('\n')
        this.start = _start.copy();
        this.end = _end.copy();
        this.hex_indices.splice(0, this.hex_indices.length);
        this.hex_positions.splice(0, this.hex_positions.length);
        this.hex_colors.splice(0, this.hex_colors.length);
        this.convert();
        this.update = true;
    }
    del() {
        // return already deleted
        if (this.deleted)
            return;
        // set new values
        this.id = -1;
        this.deleted = true;
        // console.log('Hex.del()')
        // console.log('this.start: ' + Util.Vec3_toFixed(this.start))
        // console.log('_start: ' + Util.Vec3_toFixed(Vec3.zero.copy()))
        // console.log('this.end: ' + Util.Vec3_toFixed(this.end))
        // console.log('_end: ' + Util.Vec3_toFixed(Vec3.zero.copy()))
        // console.log('\n')
        this.start = Vec3.zero.copy();
        this.end = Vec3.zero.copy();
        this.hex_indices.splice(0, this.hex_indices.length);
        this.hex_positions.splice(0, this.hex_positions.length);
        this.hex_colors.splice(0, this.hex_colors.length);
        this.update = true;
    }
    convert() {
        const dir = this.end.copy().subtract(this.start.copy()).normalize();
        const per = Utils.find_orthonormal_vectors(dir.copy())[0].normalize();
        // console.log('[HEX]' + 
        // '\n\tstart: ' + Util.Vec3_toFixed(this.start) +
        // '\n\tend: ' + Util.Vec3_toFixed(this.end) +
        // '\n\tdir: ' + Util.Vec3_toFixed(dir) +
        // '\n\tper: ' + Util.Vec3_toFixed(per) +
        // '\n\tlen: ' + len.toFixed(3)
        // )
        // calculate 6 hex points around start point
        const init_p = per.copy().scale(Hex.radius);
        const a1 = Utils.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 0).add(this.start.copy());
        const b1 = Utils.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 1).add(this.start.copy());
        const c1 = Utils.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 2).add(this.start.copy());
        const d1 = Utils.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 3).add(this.start.copy());
        const e1 = Utils.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 4).add(this.start.copy());
        const f1 = Utils.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 5).add(this.start.copy());
        // console.log('a1: ' + Util.Vec3_toFixed(a1) +
        // '\nb1: ' + Util.Vec3_toFixed(b1) +
        // '\nc1: ' + Util.Vec3_toFixed(c1) +
        // '\nd1: ' + Util.Vec3_toFixed(d1) +
        // '\ne1: ' + Util.Vec3_toFixed(e1) +
        // '\nf1: ' + Util.Vec3_toFixed(f1))
        const a2 = Utils.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 0).add(this.end.copy());
        const b2 = Utils.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 1).add(this.end.copy());
        const c2 = Utils.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 2).add(this.end.copy());
        const d2 = Utils.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 3).add(this.end.copy());
        const e2 = Utils.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 4).add(this.end.copy());
        const f2 = Utils.rotate_point(init_p, dir.copy(), Hex.pi_over_3 * 5).add(this.end.copy());
        // console.log('a2: ' + Util.Vec3_toFixed(a2) +
        // '\nb2: ' + Util.Vec3_toFixed(b2) +
        // '\nc2: ' + Util.Vec3_toFixed(c2) +
        // '\nd2: ' + Util.Vec3_toFixed(d2) +
        // '\ne2: ' + Util.Vec3_toFixed(e2) +
        // '\nf2: ' + Util.Vec3_toFixed(f2))
        // [ create line segments and store ]
        // add ray indices (should be 18 lines = 36 indices)
        for (let i = 0; i < 36; i++)
            this.hex_indices.push(i);
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
        // add ray colors (should be 18 lines = 36 indices = 108 pos values = 108 color values
        for (let i = 0; i < 36; i++) {
            this.hex_colors.push(this.color.x);
            this.hex_colors.push(this.color.y);
            this.hex_colors.push(this.color.z);
        }
    }
    get_hex_indices() {
        return new Uint32Array(this.hex_indices);
    }
    get_hex_positions() {
        return new Float32Array(this.hex_positions);
    }
    get_hex_colors() {
        return new Float32Array(this.hex_colors);
    }
}
Hex.radius = 0.1;
Hex.pi_over_3 = Math.PI / 3;
//# sourceMappingURL=Hex.js.map