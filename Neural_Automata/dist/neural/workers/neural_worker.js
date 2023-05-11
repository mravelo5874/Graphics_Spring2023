import { activation_3d } from "../activations_3d.js";
import { Vec3 } from "../../lib/TSM.js";
onmessage = function (event) {
    const size = event.data[0];
    const my_neural = event.data[1];
    const volume = event.data[2];
    const kernel = event.data[3];
    const moore_offsets = [
        new Vec3([-1, -1, -1]),
        new Vec3([0, -1, -1]),
        new Vec3([1, -1, -1]),
        new Vec3([-1, 0, -1]),
        new Vec3([0, 0, -1]),
        new Vec3([1, 0, -1]),
        new Vec3([-1, 1, -1]),
        new Vec3([0, 1, -1]),
        new Vec3([1, 1, -1]),
        new Vec3([-1, -1, 0]),
        new Vec3([0, -1, 0]),
        new Vec3([1, -1, 0]),
        new Vec3([-1, 0, 0]),
        new Vec3([0, 0, 0]),
        new Vec3([1, 0, 0]),
        new Vec3([-1, 1, 0]),
        new Vec3([0, 1, 0]),
        new Vec3([1, 1, 0]),
        new Vec3([-1, -1, 1]),
        new Vec3([0, -1, 1]),
        new Vec3([1, -1, 1]),
        new Vec3([-1, 0, 1]),
        new Vec3([0, 0, 1]),
        new Vec3([1, 0, 1]),
        new Vec3([-1, 1, 1]),
        new Vec3([0, 1, 1]),
        new Vec3([1, 1, 1])
    ];
    // create empty cells
    let update = [];
    let c = [];
    for (let x = 0; x < size; x++) {
        c[x] = [];
        for (let y = 0; y < size; y++) {
            c[x][y] = [];
            for (let z = 0; z < size; z++) {
                c[x][y][z] = 0;
            }
        }
    }
    update = c;
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            for (let z = 0; z < size; z++) {
                // go though each moore neighboor and 
                // apply kernel value and add to sum
                let sum = 0;
                const pos = new Vec3([x, y, z]);
                for (let i = 0; i < moore_offsets.length; i++) {
                    let n = pos.copy().add(moore_offsets[i]);
                    // wrap indexs
                    n.x = n.x % size;
                    n.y = n.y % size;
                    n.z = n.z % size;
                    if (n.x < 0)
                        n.x += size;
                    if (n.y < 0)
                        n.y += size;
                    if (n.z < 0)
                        n.z += size;
                    // get kernel value
                    const o = moore_offsets[i].copy().add(new Vec3([1, 1, 1]));
                    const k = kernel[o.x][o.y][o.z];
                    sum += volume[n.x][n.y][n.z] * k;
                }
                // apply activation function and set update
                const val = activation_3d.perfrom_activation(sum, my_neural);
                update[x][y][z] = val;
            }
        }
    }
    postMessage([update]);
};
//# sourceMappingURL=neural_worker.js.map