export var neighborhood_type;
(function (neighborhood_type) {
    neighborhood_type[neighborhood_type["MOORE"] = 0] = "MOORE";
    neighborhood_type[neighborhood_type["VON_NEUMANN"] = 1] = "VON_NEUMANN";
})(neighborhood_type || (neighborhood_type = {}));
export class rule {
    alive_req; // how many alive neighboor cells requiured to stay alive
    born_req; // how many alive neighboor cells required to be born
    init_states; // cell is born with x amount of states (health)
    neighborhood; // what type of neighborhood to use
    constructor(_a, _b, _s, _n) {
        this.alive_req = _a;
        this.born_req = _b;
        this.init_states = _s;
        this.neighborhood = _n;
    }
}
export class rules {
    static grow() { return new rule([4], [4], 5, neighborhood_type.MOORE); }
    static amoeba() { return new rule([5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26], [12, 13, 15], 5, neighborhood_type.MOORE); }
    static clouds() { return new rule([13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26], [13, 14, 17, 18, 19], 2, neighborhood_type.MOORE); }
    static caves() { return new rule([12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26], [13, 14], 2, neighborhood_type.MOORE); }
    static crystal() { return new rule([0, 1, 2, 3, 4, 5, 6], [1, 3], 2, neighborhood_type.VON_NEUMANN); }
    static arch() { return new rule([4, 5, 6], [3], 2, neighborhood_type.MOORE); }
}
//# sourceMappingURL=rules.js.map