export default class noise_map_data {
    seed;
    scale;
    height;
    freq;
    octs;
    pers;
    lacu;
    constructor(
    // default terrain values
    _seed = '42', _scale = 75, _height = 24, _freq = 1, _octs = 4, _pers = 0.1, _lacu = 5) {
        this.seed = _seed;
        this.scale = _scale;
        this.height = _height;
        this.freq = _freq;
        this.octs = _octs;
        this.pers = _pers;
        this.lacu = _lacu;
    }
}
//# sourceMappingURL=map_data.js.map