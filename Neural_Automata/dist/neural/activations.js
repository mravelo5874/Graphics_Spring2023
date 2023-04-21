export class activations {
    static worms_activation() {
        return 'return -1.0/pow(2.0,(0.6*pow(x, 2.0)))+1.0;';
    }
    static waves_activation() {
        return 'return abs(1.2*x);';
    }
    static paths_activation() {
        return 'return 1.0/pow(2.0,(pow(x-3.5, 2.0)));';
    }
    static gol_activation() {
        return 'if(x == 3.0||x == 11.0||x == 12.0){return 1.0;}return 0.0;';
    }
    static stars_activation() {
        return 'return abs(x);';
    }
}
//# sourceMappingURL=activations.js.map