export class kernels
{
    public static worms_kernel(): Float32Array
    {
        let kernel = new Float32Array(9)
        // 0 1 2
        kernel[0] =  0.68
        kernel[1] = -0.90
        kernel[2] =  0.68
        // 3 4 5
        kernel[3] = -0.90
        kernel[4] = -0.66
        kernel[5] = -0.90
        // 6 7 8
        kernel[6] =  0.68
        kernel[7] = -0.90
        kernel[8] =  0.68
        return kernel
    }

    public static waves_kernel(): Float32Array
    {
        let kernel = new Float32Array(9)
        // 0 1 2
        kernel[0] =  0.565
        kernel[1] = -0.716
        kernel[2] =  0.565
        // 3 4 5
        kernel[3] = -0.716
        kernel[4] =  0.627
        kernel[5] = -0.716
        // 6 7 8
        kernel[6] =  0.565
        kernel[7] = -0.716
        kernel[8] =  0.565
        return kernel
    }

    public static paths_kernel(): Float32Array
    {
        let kernel = new Float32Array(9)
        // 0 1 2
        kernel[0] =  0.0
        kernel[1] =  1.0
        kernel[2] =  0.0
        // 3 4 5
        kernel[3] =  1.0
        kernel[4] =  1.0
        kernel[5] =  1.0
        // 6 7 8
        kernel[6] =  0.0
        kernel[7] =  1.0
        kernel[8] =  0.0
        return kernel
    }

    public static gol_kernel(): Float32Array
    {
        let kernel = new Float32Array(9)
        // 0 1 2
        kernel[0] =  1.0
        kernel[1] =  1.0
        kernel[2] =  1.0
        // 3 4 5
        kernel[3] =  1.0
        kernel[4] =  9.0
        kernel[5] =  1.0
        // 6 7 8
        kernel[6] =  1.0
        kernel[7] =  1.0
        kernel[8] =  1.0
        return kernel
    }
}