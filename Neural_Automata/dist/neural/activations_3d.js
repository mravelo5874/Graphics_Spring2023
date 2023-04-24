import { utils } from "./utils.js";
export var activation_type_3d;
(function (activation_type_3d) {
    activation_type_3d[activation_type_3d["worm"] = 0] = "worm";
})(activation_type_3d || (activation_type_3d = {}));
export class activation_3d {
    static perfrom_activation(val, type) {
        switch (type) {
            default:
            case activation_type_3d.worm: return utils.clamp01(this.worm(val));
        }
    }
    static worm(val) {
        return -1.0 / Math.pow(2.0, (0.6 * Math.pow(val, 2.0))) + 1.0;
    }
}
//# sourceMappingURL=activations_3d.js.map