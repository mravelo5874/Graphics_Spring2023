import { utils } from "./utils.js";

export enum activation_type_3d
{
    worm
}


export class activation_3d
{
    public static perfrom_activation(val: number, type: activation_type_3d)
    {
        switch (type)
        {
            default:
            case activation_type_3d.worm: return utils.clamp01(this.worm(val))
        }
    }

    private static worm(val: number): number
    {
        return -1.0/Math.pow(2.0,(0.6*Math.pow(val, 2.0)))+1.0;
    }
}