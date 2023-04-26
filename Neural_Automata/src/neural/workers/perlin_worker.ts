import noise from "../noise.js"
import noise_map_data from "../map_data.js";

onmessage = function(event)
{
    const size: number = event.data[0]
    const o1: number = event.data[1]
    const o2: number = event.data[2]
    const o3: number = event.data[3]
    const map_data: noise_map_data = event.data[4]

    // get perlin data
    const perlin_data = noise.generate_perlin_volume_xyz(size, map_data, o1, o2, o3, true)

    // create empty volume
    let v: number[][][] = []
    for (let x = 0; x < size; x++)
    {
        v[x] = []
        for (let y = 0; y < size; y++)
        {
            v[x][y] = []
            for (let z = 0; z < size; z++)
            {
                v[x][y][z] = 0
            }
        }
    }

    // fill with perlin data
    for (let x = 0; x < size; x++)
    {
        for (let y = 0; y < size; y++)
        {
            for (let z = 0; z < size; z++)
            {
                let p = 0
                if (perlin_data[x][y][z] > 0.1)
                {
                    p = 1
                }
                v[x][y][z] = p
            }
        }
    }
        
    postMessage(v)
}