export class kernels {
    static worms_kernel() {
        let kernel = new Float32Array(9);
        // 0 1 2
        kernel[0] = 0.68;
        kernel[1] = -0.90;
        kernel[2] = 0.68;
        // 3 4 5
        kernel[3] = -0.90;
        kernel[4] = -0.66;
        kernel[5] = -0.90;
        // 6 7 8
        kernel[6] = 0.68;
        kernel[7] = -0.90;
        kernel[8] = 0.68;
        return kernel;
    }
    static waves_kernel() {
        let kernel = new Float32Array(9);
        // 0 1 2
        kernel[0] = 0.565;
        kernel[1] = -0.716;
        kernel[2] = 0.565;
        // 3 4 5
        kernel[3] = -0.716;
        kernel[4] = 0.627;
        kernel[5] = -0.716;
        // 6 7 8
        kernel[6] = 0.565;
        kernel[7] = -0.716;
        kernel[8] = 0.565;
        return kernel;
    }
    static paths_kernel() {
        let kernel = new Float32Array(9);
        // 0 1 2
        kernel[0] = 0.0;
        kernel[1] = 1.0;
        kernel[2] = 0.0;
        // 3 4 5
        kernel[3] = 1.0;
        kernel[4] = 1.0;
        kernel[5] = 1.0;
        // 6 7 8
        kernel[6] = 0.0;
        kernel[7] = 1.0;
        kernel[8] = 0.0;
        return kernel;
    }
}
//# sourceMappingURL=kernels.js.map