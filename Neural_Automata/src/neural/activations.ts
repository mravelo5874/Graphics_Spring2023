export class activations
{
    public static worms_activation(): string
    {
        return 'return -1.0/pow(2.0,(0.6*pow(x, 2.0)))+1.0;'
    }

    public static waves_activation(): string
    {
        return 'return abs(1.2*x);'
    }

    public static paths_activation(): string
    {
        return 'return 1.0/pow(2.0,(pow(x-3.5, 2.0)));'
    }
}