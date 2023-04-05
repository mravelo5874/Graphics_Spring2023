import { Vec2, Vec3 } from "../lib/TSM.js";
import { Utils } from "./Utils.js";
// thanks to some help:
// https://catlikecoding.com/unity/tutorials/noise/
class Noise {
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
        i0 &= Noise.MASK;
        let i1 = i0 + 1;
        let h0 = Noise.HASH[i0];
        let h1 = Noise.HASH[i1];
        t = Utils.smooth(t);
        return Utils.lerp(h0, h1, t) * (1 / Noise.MASK);
    }
    static value_2d(value, freq) {
        value.scale(freq);
        let ix0 = Math.floor(value.x);
        let iy0 = Math.floor(value.y);
        let tx = value.x - ix0;
        let ty = value.y - iy0;
        ix0 &= Noise.MASK;
        iy0 &= Noise.MASK;
        let ix1 = ix0 + 1;
        let iy1 = iy0 + 1;
        let h0 = Noise.HASH[ix0];
        let h1 = Noise.HASH[ix1];
        let h00 = Noise.HASH[h0 + iy0];
        let h10 = Noise.HASH[h1 + iy0];
        let h01 = Noise.HASH[h0 + iy1];
        let h11 = Noise.HASH[h1 + iy1];
        tx = Utils.smooth(tx);
        ty = Utils.smooth(ty);
        return Utils.lerp(Utils.lerp(h00, h10, tx), Utils.lerp(h01, h11, tx), ty) * (1 / Noise.MASK);
    }
    static perlin_2d(value, freq) {
        value.scale(freq);
        let ix0 = Math.floor(value.x);
        let iy0 = Math.floor(value.y);
        let tx0 = value.x - ix0;
        let ty0 = value.y - iy0;
        let tx1 = tx0 - 1;
        let ty1 = ty0 - 1;
        ix0 &= Noise.MASK;
        iy0 &= Noise.MASK;
        let ix1 = ix0 + 1;
        let iy1 = iy0 + 1;
        let h0 = Noise.HASH[ix0];
        let h1 = Noise.HASH[ix1];
        let g00 = Noise.grads_2d[Noise.HASH[h0 + iy0] & Noise.grads_2d_mask].copy();
        let g10 = Noise.grads_2d[Noise.HASH[h1 + iy0] & Noise.grads_2d_mask].copy();
        let g01 = Noise.grads_2d[Noise.HASH[h0 + iy1] & Noise.grads_2d_mask].copy();
        let g11 = Noise.grads_2d[Noise.HASH[h1 + iy1] & Noise.grads_2d_mask].copy();
        let v00 = Noise.dot_2d(g00, tx0, ty0);
        let v10 = Noise.dot_2d(g10, tx1, ty0);
        let v01 = Noise.dot_2d(g01, tx0, ty1);
        let v11 = Noise.dot_2d(g11, tx1, ty1);
        let tx = Utils.smooth(tx0);
        let ty = Utils.smooth(ty0);
        return Utils.lerp(Utils.lerp(v00, v10, tx), Utils.lerp(v01, v11, tx), ty) * Utils.SQRT2;
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
        ix0 &= Noise.MASK;
        iy0 &= Noise.MASK;
        iz0 &= Noise.MASK;
        let ix1 = ix0 + 1;
        let iy1 = iy0 + 1;
        let iz1 = iz0 + 1;
        let h0 = Noise.HASH[ix0];
        let h1 = Noise.HASH[ix1];
        let h00 = Noise.HASH[h0 + iy0];
        let h10 = Noise.HASH[h1 + iy0];
        let h01 = Noise.HASH[h0 + iy1];
        let h11 = Noise.HASH[h1 + iy1];
        let g000 = Noise.grads_3d[Noise.HASH[h00 + iz0] & Noise.grads_3d_mask].copy();
        let g100 = Noise.grads_3d[Noise.HASH[h10 + iz0] & Noise.grads_3d_mask].copy();
        let g010 = Noise.grads_3d[Noise.HASH[h01 + iz0] & Noise.grads_3d_mask].copy();
        let g110 = Noise.grads_3d[Noise.HASH[h11 + iz0] & Noise.grads_3d_mask].copy();
        let g001 = Noise.grads_3d[Noise.HASH[h00 + iz1] & Noise.grads_3d_mask].copy();
        let g101 = Noise.grads_3d[Noise.HASH[h10 + iz1] & Noise.grads_3d_mask].copy();
        let g011 = Noise.grads_3d[Noise.HASH[h01 + iz1] & Noise.grads_3d_mask].copy();
        let g111 = Noise.grads_3d[Noise.HASH[h11 + iz1] & Noise.grads_3d_mask].copy();
        let v000 = Noise.dot_3d(g000, tx0, ty0, tz0);
        let v100 = Noise.dot_3d(g100, tx1, ty0, tz0);
        let v010 = Noise.dot_3d(g010, tx0, ty1, tz0);
        let v110 = Noise.dot_3d(g110, tx1, ty1, tz0);
        let v001 = Noise.dot_3d(g001, tx0, ty0, tz1);
        let v101 = Noise.dot_3d(g101, tx1, ty0, tz1);
        let v011 = Noise.dot_3d(g011, tx0, ty1, tz1);
        let v111 = Noise.dot_3d(g111, tx1, ty1, tz1);
        let tx = Utils.smooth(tx0);
        let ty = Utils.smooth(ty0);
        let tz = Utils.smooth(tz0);
        return Utils.lerp(Utils.lerp(Utils.lerp(v000, v100, tx), Utils.lerp(v010, v110, tx), ty), Utils.lerp(Utils.lerp(v001, v101, tx), Utils.lerp(v011, v111, tx), ty), tz);
    }
    static generate_noise_map(size, scale, freq, octs, seed) {
        // make sure scale is not 0
        if (scale <= 0) {
            scale = 0.0001;
        }
        // let rng = new Rand(seed);
        // let rand_map: number[][] = new Array(size).fill(0).map(() => new Array(size).fill(0))
        // for (let i = 0; i < size; i++)
        // {
        //     for (let j = 0; j < size; j++)
        //     {
        //         rand_map[i][j] = rng.next()
        //     }
        // }
        let noise_map = new Array(size).fill(0).map(() => new Array(size).fill(0));
        const step_size = 1 / size;
        // fill values
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const point = new Vec3([x, y, 0]);
                noise_map[x][y] = Noise.perlin_3d(point, freq);
            }
        }
        return noise_map;
    }
}
Noise.MASK = 255;
Noise.HASH = [
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
Noise.grads_2d_mask = 7;
Noise.grads_2d = [
    new Vec2([1, 1]),
    new Vec2([-1, 1]),
    new Vec2([1, -1]),
    new Vec2([-1, -1]),
    new Vec2([1, 1]).normalize(),
    new Vec2([-1, 1]).normalize(),
    new Vec2([1, -1]).normalize(),
    new Vec2([-1, -1]).normalize()
];
Noise.grads_3d_mask = 15;
Noise.grads_3d = [
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
export { Noise };
//# sourceMappingURL=Noise.js.map