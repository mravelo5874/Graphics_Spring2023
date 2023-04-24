export class kernels_3d
{
    private static empty_kernel(): number[][][]
    {
        let k: number[][][] = []
        for (let x = 0; x < 3; x++)
        {
            k[x] = []
            for (let y = 0; y < 3; y++)
            {
                k[x][y] = []
                for (let z = 0; z < 3; z++)
                {
                    k[x][y][z] = 0
                }
            }
        }
        return k
    }

    public static worm_kernel(): number[][][]
    {
        let k: number[][][] = this.empty_kernel()

        /* FACE 1 */
        // row 1
        k[0][0][0] =  0.0
        k[1][0][0] =  0.0
        k[2][0][0] =  0.0
        // row 2
        k[0][1][0] =  0.0
        k[1][1][0] =  1.0
        k[2][1][0] =  0.0
        // row 3
        k[0][2][0] =  0.0
        k[1][2][0] =  0.0
        k[2][2][0] =  0.0
        /* FACE 2 */
        // row 1
        k[0][0][1] =  0.0
        k[1][0][1] =  1.0
        k[2][0][1] =  0.0
        // row 2
        k[0][1][1] =  1.0
        k[1][1][1] =  9.0
        k[2][1][1] =  1.0
        // row 3
        k[0][2][1] =  0.0
        k[1][2][1] =  1.0
        k[2][2][1] =  0.0
        /* FACE 2 */
        // row 1
        k[0][0][2] =  0.0
        k[1][0][2] =  0.0
        k[2][0][2] =  0.0
        // row 2
        k[0][1][2] =  0.0
        k[1][1][2] =  1.0
        k[2][1][2] =  0.0
        // row 3
        k[0][2][2] =  0.0
        k[1][2][2] =  0.0
        k[2][2][2] =  0.0
        return k
    }
}