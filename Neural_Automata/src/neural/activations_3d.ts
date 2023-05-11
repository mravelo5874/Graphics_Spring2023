import { neural_type } from "./app3D.js";
import { utils } from "./utils.js";

export class activation_3d
{
    public static perfrom_activation(val: number, type: neural_type)
    {
        switch (type)
        {
            default:
            case neural_type.worms: return utils.clamp01(this.worm(val))
        }
    }

    private static worm(val: number): number
    {
        return -1.0/Math.pow(2.0,(0.6*Math.pow(val, 2.0)))+1.0;
    }

    private static gol(val: number): number
    {
        if(val == 3.0 || val == 11.0 || val == 12.0)
        {
            return 1.0
        }
        return 0.0;
    }
}