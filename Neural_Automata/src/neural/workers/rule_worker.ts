import { Vec3 } from "../../lib/TSM.js"
import { rule, neighborhood_type } from "../rules.js"

onmessage = function(event)
{
    const work_index = event.data[0]
    const size: number = event.data[1]
    const cells: number[][][] = event.data[2]
    const my_rule: rule = event.data[3]
    const volume: number[][][] = event.data[4]

    const moore_offsets: Vec3[] = [
        new Vec3([-1, -1, -1]),
        new Vec3([ 0, -1, -1]),
        new Vec3([ 1, -1, -1]),

        new Vec3([-1,  0, -1]),
        new Vec3([ 0,  0, -1]),
        new Vec3([ 1,  0, -1]),

        new Vec3([-1,  1, -1]),
        new Vec3([ 0,  1, -1]),
        new Vec3([ 1,  1, -1]),

        new Vec3([-1, -1,  0]),
        new Vec3([ 0, -1,  0]),
        new Vec3([ 1, -1,  0]),

        new Vec3([-1,  0,  0]),
        //new Vec3([ 0,  0,  0]),
        new Vec3([ 1,  0,  0]),

        new Vec3([-1,  1,  0]),
        new Vec3([ 0,  1,  0]),
        new Vec3([ 1,  1,  0]),

        new Vec3([-1, -1,  1]),
        new Vec3([ 0, -1,  1]),
        new Vec3([ 1, -1,  1]),

        new Vec3([-1,  0,  1]),
        new Vec3([ 0,  0,  1]),
        new Vec3([ 1,  0,  1]),

        new Vec3([-1,  1,  1]),
        new Vec3([ 0,  1,  1]),
        new Vec3([ 1,  1,  1])]

    const von_neu_offsets: Vec3[] = [
        new Vec3([-1,  0,  0]),
        new Vec3([ 1,  0,  0]),

        new Vec3([ 0, -1,  0]),
        new Vec3([ 0,  1,  0]),

        new Vec3([ 0,  0, -1]),
        new Vec3([ 0,  0,  1]),
    ]

    function get_alive_neighboors(x, y, z): number
    {
        let count = 0
        const pos: Vec3 = new Vec3([x, y, z])
        if (my_rule.neighborhood == neighborhood_type.MOORE)
        {
            for (let i = 0; i < moore_offsets.length; i++)
            {
                let n = pos.copy().add(moore_offsets[i])
                // wrap indexs
                n.x = n.x % size
                n.y = n.y % size
                n.z = n.z % size
                if (n.x < 0) n.x += size
                if (n.y < 0) n.y += size
                if (n.z < 0) n.z += size
                // check if alive
                if (cells[n.x][n.y][n.z] > 0)
                    count++
            }
        }
        else // VON_NEUMANN
        {
            for (let i = 0; i < von_neu_offsets.length; i++)
            {
                let n = pos.copy().add(von_neu_offsets[i])
                // wrap indexs
                n.x = n.x % size
                n.y = n.y % size
                n.z = n.z % size
                if (n.x < 0) n.x += size
                if (n.y < 0) n.y += size
                if (n.z < 0) n.z += size
                // check if alive
                if (cells[n.x][n.y][n.z] > 0)
                    count++
            }
        }
        return count
    }

    // create empty cells
    let update: number[][][] = []
    let c: number[][][] = []
    for (let x = 0; x < size; x++)
    {
        c[x] = []
        for (let y = 0; y < size; y++)
        {
            c[x][y] = []
            for (let z = 0; z < size; z++)
            {
                c[x][y][z] = 0
            }
        }
    }
    update = c

    // TODO: change range of calculations to subset of cube based on worker index

    let change: boolean = false
    for (let x = 0; x < size; x++)
    {
        for (let y = 0; y < size; y++)
        {
            for (let z = 0; z < size; z++)
            {
                // get number of neighbooring alive cells
                const alive_neighboors: number = get_alive_neighboors(x, y, z)
                // check if cell is alive
                if (cells[x][y][z] > 0)
                {
                    // check if loose health
                    if (my_rule.alive_req.includes(alive_neighboors))
                    {   
                        update[x][y][z] = cells[x][y][z]
                        change = true
                    }
                    else
                    {
                        const new_state = cells[x][y][z] - 1
                        update[x][y][z] = new_state
                        // modify volume if dead
                        if (new_state <= 0)
                        {
                            volume[x][y][z] = 0
                            change = true
                        }
                    }
                }
                else
                {
                    // cell is dead
                    // check if can be born
                    if (my_rule.born_req.includes(alive_neighboors))
                    {
                        update[x][y][z] = my_rule.init_states
                        volume[x][y][z] = 1
                        change = true
                    }
                }
            }
        }
    }

    postMessage([update, volume])
}