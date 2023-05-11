import { neural_type } from "./app3D.js"
import  Rand  from "../lib/rand-seed/Rand.js"
import { utils } from "./utils.js"

export class kernels_3d
{
    public static get_kernel(type: neural_type): number[][][]
    {
        switch (type)
        {
            default:
            case neural_type.worms:
                return this.worm_kernel()
        }
    }

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
        k[0][0][0] =  0.1
        k[1][0][0] =  0.1
        k[2][0][0] =  0.1
        // row 2
        k[0][1][0] =  0.1
        k[1][1][0] = -0.1
        k[2][1][0] =  0.1
        // row 3
        k[0][2][0] =  0.1
        k[1][2][0] =  0.1
        k[2][2][0] =  0.1
        /* FACE 2 */
        // row 1
        k[0][0][1] =  0.1
        k[1][0][1] = -0.1
        k[2][0][1] =  0.1
        // row 2
        k[0][1][1] =  0.1
        k[1][1][1] =  0.1
        k[2][1][1] =  0.1
        // row 3
        k[0][2][1] =  0.1
        k[1][2][1] = -0.1
        k[2][2][1] =  0.1
        /* FACE 2 */
        // row 1
        k[0][0][2] =  0.1
        k[1][0][2] =  0.1
        k[2][0][2] =  0.1
        // row 2
        k[0][1][2] =  0.1
        k[1][1][2] = -0.1
        k[2][1][2] =  0.1
        // row 3
        k[0][2][2] =  0.1
        k[1][2][2] =  0.1
        k[2][2][2] =  0.1
        return k
    }

    public static generate_random_kernel(seed: string): number[][][]
    {
        let k: number[][][] = this.empty_kernel()
        let rng = new Rand(seed)

        /* FACE 1 */
        // row 1
        k[0][0][0] =  utils.lerp(-1, 1, rng.next())
        k[1][0][0] =  utils.lerp(-1, 1, rng.next())
        k[2][0][0] =  utils.lerp(-1, 1, rng.next())
        // row 2
        k[0][1][0] =  utils.lerp(-1, 1, rng.next())
        k[1][1][0] =  utils.lerp(-1, 1, rng.next())
        k[2][1][0] =  utils.lerp(-1, 1, rng.next())
        // row 3
        k[0][2][0] =  utils.lerp(-1, 1, rng.next())
        k[1][2][0] =  utils.lerp(-1, 1, rng.next())
        k[2][2][0] =  utils.lerp(-1, 1, rng.next())
        /* FACE 2 */
        // row 1
        k[0][0][1] =  utils.lerp(-1, 1, rng.next())
        k[1][0][1] =  utils.lerp(-1, 1, rng.next())
        k[2][0][1] =  utils.lerp(-1, 1, rng.next())
        // row 2
        k[0][1][1] =  utils.lerp(-1, 1, rng.next())
        k[1][1][1] =  utils.lerp(-1, 1, rng.next())
        k[2][1][1] =  utils.lerp(-1, 1, rng.next())
        // row 3
        k[0][2][1] =  utils.lerp(-1, 1, rng.next())
        k[1][2][1] =  utils.lerp(-1, 1, rng.next())
        k[2][2][1] =  utils.lerp(-1, 1, rng.next())
        /* FACE 2 */
        // row 1
        k[0][0][2] =  utils.lerp(-1, 1, rng.next())
        k[1][0][2] =  utils.lerp(-1, 1, rng.next())
        k[2][0][2] =  utils.lerp(-1, 1, rng.next())
        // row 2
        k[0][1][2] =  utils.lerp(-1, 1, rng.next())
        k[1][1][2] =  utils.lerp(-1, 1, rng.next())
        k[2][1][2] =  utils.lerp(-1, 1, rng.next())
        // row 3
        k[0][2][2] =  utils.lerp(-1, 1, rng.next())
        k[1][2][2] =  utils.lerp(-1, 1, rng.next())
        k[2][2][2] =  utils.lerp(-1, 1, rng.next())
        return k
    }
}