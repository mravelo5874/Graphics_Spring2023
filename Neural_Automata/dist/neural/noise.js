import { Vec2, Vec3 } from "../lib/TSM.js";
import Rand from "../lib/rand-seed/Rand.js";
import { utils } from "./utils.js";
export class noise_map_data {
    constructor(
    // default terrain values
    _seed = '42', _scale = 75, _height = 24, _freq = 1, _octs = 4, _pers = 0.1, _lacu = 5) {
        this.seed = _seed;
        this.scale = _scale;
        this.height = _height;
        this.freq = _freq;
        this.octs = _octs;
        this.pers = _pers;
        this.lacu = _lacu;
    }
}
// thanks to some help:
// https://catlikecoding.com/unity/tutorials/noise/
class noise {
    static dot_2d(g, x, y) {
        return g.x * x + g.y * y;
    }
    static dot_3d(g, x, y, z) {
        return g.x + x + g.y + y + g.z + z;
    }
    static value_1d(value, freq) {
        value *= freq;
        let i0 = Math.floor(value);
        let t = value - i0;
        i0 &= noise.MASK;
        let i1 = i0 + 1;
        let h0 = noise.HASH[i0];
        let h1 = noise.HASH[i1];
        t = utils.smooth(t);
        return utils.lerp(h0, h1, t) * (1 / noise.MASK);
    }
    static value_2d(value, freq) {
        value.scale(freq);
        let ix0 = Math.floor(value.x);
        let iy0 = Math.floor(value.y);
        let tx = value.x - ix0;
        let ty = value.y - iy0;
        ix0 &= noise.MASK;
        iy0 &= noise.MASK;
        let ix1 = ix0 + 1;
        let iy1 = iy0 + 1;
        let h0 = noise.HASH[ix0];
        let h1 = noise.HASH[ix1];
        let h00 = noise.HASH[h0 + iy0];
        let h10 = noise.HASH[h1 + iy0];
        let h01 = noise.HASH[h0 + iy1];
        let h11 = noise.HASH[h1 + iy1];
        tx = utils.smooth(tx);
        ty = utils.smooth(ty);
        return utils.lerp(utils.lerp(h00, h10, tx), utils.lerp(h01, h11, tx), ty) * (1 / noise.MASK);
    }
    static perlin_2d(value, freq) {
        value.scale(freq);
        let ix0 = Math.floor(value.x);
        let iy0 = Math.floor(value.y);
        let tx0 = value.x - ix0;
        let ty0 = value.y - iy0;
        let tx1 = tx0 - 1;
        let ty1 = ty0 - 1;
        ix0 &= noise.MASK;
        iy0 &= noise.MASK;
        let ix1 = ix0 + 1;
        let iy1 = iy0 + 1;
        let h0 = noise.HASH[ix0];
        let h1 = noise.HASH[ix1];
        let g00 = noise.grads_2d[noise.HASH[h0 + iy0] & noise.grads_2d_mask].copy();
        let g10 = noise.grads_2d[noise.HASH[h1 + iy0] & noise.grads_2d_mask].copy();
        let g01 = noise.grads_2d[noise.HASH[h0 + iy1] & noise.grads_2d_mask].copy();
        let g11 = noise.grads_2d[noise.HASH[h1 + iy1] & noise.grads_2d_mask].copy();
        let v00 = noise.dot_2d(g00, tx0, ty0);
        let v10 = noise.dot_2d(g10, tx1, ty0);
        let v01 = noise.dot_2d(g01, tx0, ty1);
        let v11 = noise.dot_2d(g11, tx1, ty1);
        let tx = utils.smooth(tx0);
        let ty = utils.smooth(ty0);
        return utils.lerp(utils.lerp(v00, v10, tx), utils.lerp(v01, v11, tx), ty) * utils.SQRT2;
    }
    static perlin_3d(value, freq) {
        value.scale(freq);
        let ix0 = Math.floor(value.x);
        let iy0 = Math.floor(value.y);
        let iz0 = Math.floor(value.z);
        let tx0 = value.x - ix0;
        let ty0 = value.y - iy0;
        let tz0 = value.z - iz0;
        let tx1 = tx0 - 1;
        let ty1 = ty0 - 1;
        let tz1 = tz0 - 1;
        ix0 &= noise.MASK;
        iy0 &= noise.MASK;
        iz0 &= noise.MASK;
        let ix1 = ix0 + 1;
        let iy1 = iy0 + 1;
        let iz1 = iz0 + 1;
        let h0 = noise.HASH[ix0];
        let h1 = noise.HASH[ix1];
        let h00 = noise.HASH[h0 + iy0];
        let h10 = noise.HASH[h1 + iy0];
        let h01 = noise.HASH[h0 + iy1];
        let h11 = noise.HASH[h1 + iy1];
        let g000 = noise.grads_3d[noise.HASH[h00 + iz0] & noise.grads_3d_mask].copy();
        let g100 = noise.grads_3d[noise.HASH[h10 + iz0] & noise.grads_3d_mask].copy();
        let g010 = noise.grads_3d[noise.HASH[h01 + iz0] & noise.grads_3d_mask].copy();
        let g110 = noise.grads_3d[noise.HASH[h11 + iz0] & noise.grads_3d_mask].copy();
        let g001 = noise.grads_3d[noise.HASH[h00 + iz1] & noise.grads_3d_mask].copy();
        let g101 = noise.grads_3d[noise.HASH[h10 + iz1] & noise.grads_3d_mask].copy();
        let g011 = noise.grads_3d[noise.HASH[h01 + iz1] & noise.grads_3d_mask].copy();
        let g111 = noise.grads_3d[noise.HASH[h11 + iz1] & noise.grads_3d_mask].copy();
        let v000 = noise.dot_3d(g000, tx0, ty0, tz0);
        let v100 = noise.dot_3d(g100, tx1, ty0, tz0);
        let v010 = noise.dot_3d(g010, tx0, ty1, tz0);
        let v110 = noise.dot_3d(g110, tx1, ty1, tz0);
        let v001 = noise.dot_3d(g001, tx0, ty0, tz1);
        let v101 = noise.dot_3d(g101, tx1, ty0, tz1);
        let v011 = noise.dot_3d(g011, tx0, ty1, tz1);
        let v111 = noise.dot_3d(g111, tx1, ty1, tz1);
        let tx = utils.smooth(tx0);
        let ty = utils.smooth(ty0);
        let tz = utils.smooth(tz0);
        return utils.lerp(utils.lerp(utils.lerp(v000, v100, tx), utils.lerp(v010, v110, tx), ty), utils.lerp(utils.lerp(v001, v101, tx), utils.lerp(v011, v111, tx), ty), tz);
    }
    static generate_perlin_volume(size, noise_data, offset, normalize) {
        let scale = noise_data.scale;
        const seed = noise_data.seed;
        const freq = noise_data.freq;
        const octs = noise_data.octs;
        const persistance = noise_data.pers;
        const lacunarity = noise_data.lacu;
        // make sure scale is not 0
        if (scale <= 0) {
            scale = 0.0001;
        }
        // create RNG
        let rng = new Rand(seed);
        // create per-octave offsets
        let oct_offsets = [];
        let max_height = 0;
        let cell_ampl = 1;
        let cell_freq = 1;
        for (let i = 0; i < octs; i++) {
            let offset_x = offset.x; //+ (rng.next() * 100)
            let offset_y = offset.y; //+ (rng.next() * 100)
            let offset_z = offset.z;
            oct_offsets.push(new Vec3([offset_x, offset_y, offset_z]));
            max_height += cell_ampl;
            cell_ampl *= persistance;
        }
        let noise_map = new Array(size).fill(0).map(() => new Array(size).fill(0).map(() => new Array(size).fill(0)));
        let max_noise = Number.MIN_VALUE;
        let min_noise = Number.MAX_VALUE;
        const half_w = size / 2;
        // fill values
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                for (let z = 0; z < size; z++) {
                    cell_ampl = 1;
                    cell_freq = 1;
                    let noise_height = 0;
                    for (let oct = 0; oct < octs; oct++) {
                        const sample_x = (x - half_w + oct_offsets[oct].x) / scale * cell_freq;
                        const sample_y = (y - half_w + oct_offsets[oct].y) / scale * cell_freq;
                        const sample_z = (z - half_w + oct_offsets[oct].z) / scale * cell_freq;
                        const point = new Vec3([sample_x, sample_y, sample_z]);
                        const perlin = noise.perlin_3d(point, freq) * 2 - 1;
                        noise_height += perlin * cell_ampl;
                        cell_ampl *= persistance;
                        cell_freq *= lacunarity;
                    }
                    if (noise_height > max_noise) {
                        max_noise = noise_height;
                    }
                    else if (noise_height < min_noise) {
                        min_noise = noise_height;
                    }
                    noise_map[x][y][z] = noise_height;
                }
            }
        }
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                for (let z = 0; z < size; z++) {
                    if (normalize) {
                        let norm_height = (noise_map[x][y][z] + 1) / (2 * max_height);
                        noise_map[x][y][z] = norm_height;
                    }
                    else {
                        noise_map[x][y][z] = utils.inverse_lerp(min_noise, max_noise, noise_map[x][y][z]);
                    }
                }
            }
        }
        return noise_map;
    }
}
noise.MASK = 255;
noise.HASH = [
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
    140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148,
    247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32,
    57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
    74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122,
    60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54,
    65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169,
    200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64,
    52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212,
    207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213,
    119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
    129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104,
    218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,
    81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
    184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93,
    222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
    140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148,
    247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32,
    57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
    74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122,
    60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54,
    65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169,
    200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64,
    52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212,
    207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213,
    119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
    129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104,
    218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,
    81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
    184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93,
    222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
];
noise.grads_2d_mask = 7;
noise.grads_2d = [
    new Vec2([1, 1]),
    new Vec2([-1, 1]),
    new Vec2([1, -1]),
    new Vec2([-1, -1]),
    new Vec2([1, 1]).normalize(),
    new Vec2([-1, 1]).normalize(),
    new Vec2([1, -1]).normalize(),
    new Vec2([-1, -1]).normalize()
];
noise.grads_3d_mask = 15;
noise.grads_3d = [
    new Vec3([1, 1, 0]),
    new Vec3([-1, 1, 0]),
    new Vec3([1, -1, 0]),
    new Vec3([-1, -1, 0]),
    new Vec3([1, 0, 1]),
    new Vec3([-1, 0, 1]),
    new Vec3([1, 0, -1]),
    new Vec3([-1, 0, -1]),
    new Vec3([0, 1, 1]),
    new Vec3([0, -1, 1]),
    new Vec3([0, 1, -1]),
    new Vec3([0, -1, -1]),
    new Vec3([1, 1, 0]),
    new Vec3([-1, 1, 0]),
    new Vec3([0, -1, 1]),
    new Vec3([0, -1, -1])
];
export { noise };
//# sourceMappingURL=noise.js.map