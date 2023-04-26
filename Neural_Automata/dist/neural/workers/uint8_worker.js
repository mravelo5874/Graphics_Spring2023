"use strict";
onmessage = function (event) {
    const size = event.data[0];
    const volume = event.data[1];
    let volume_uint8 = new Uint8Array(size * size * size);
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            for (let z = 0; z < size; z++) {
                volume_uint8[z + (y * size) + (x * size * size)] = Math.floor(volume[x][y][z] * 255);
            }
        }
    }
    postMessage(volume_uint8);
};
//# sourceMappingURL=uint8_worker.js.map