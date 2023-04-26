export default class noise_map_data
{
    public seed: string
    public scale: number
    public height: number
    public freq: number
    public octs: number
    public pers: number
    public lacu: number

    constructor(
        // default terrain values
        _seed: string = '42', 
        _scale: number = 75,
        _height: number = 24,
        _freq: number = 1,  
        _octs: number = 4,
        _pers: number = 0.1, 
        _lacu: number = 5
        )
    {
        this.seed = _seed
        this.scale = _scale
        this.height = _height
        this.freq = _freq
        this.octs = _octs
        this.pers = _pers
        this.lacu = _lacu
    }
}