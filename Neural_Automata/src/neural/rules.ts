export enum neighborhood_type
{
    MOORE, VON_NEUMANN
}

export class rule
{
    public alive_req: number[] // how many alive neighboor cells requiured to stay alive
    public born_req: number[] // how many alive neighboor cells required to be born
    public init_states: number // cell is born with x amount of states (health)
    public neighborhood: neighborhood_type // what type of neighborhood to use

    constructor(_a: number[], _b: number[], _s: number, _n: neighborhood_type)
    {
        this.alive_req = _a
        this.born_req = _b
        this.init_states = _s
        this.neighborhood = _n
    }
}

export class rules
{
    public static grow() { return new rule([4], [4], 5, neighborhood_type.MOORE) }
    public static amoeba() { return new rule([5,6,7,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26], [12,13,15], 5, neighborhood_type.MOORE) }
    public static clouds() { return new rule([13,14,15,16,17,18,19,20,21,22,23,24,25,26], [13,14,17,18,19], 2, neighborhood_type.MOORE) }
    public static caves() { return new rule([12,13,14,15,16,17,18,19,20,21,22,23,24,25,26], [13,14], 2, neighborhood_type.MOORE) }
    public static crystal() { return new rule([0,1,2,3,4,5,6], [1,3], 2, neighborhood_type.VON_NEUMANN) }
    public static arch() { return new rule([4,5,6], [3], 2, neighborhood_type.MOORE) }
}