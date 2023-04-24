export class activations_2d {
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
    static slime_activation() {
        return 'return -1.0/(0.89*pow(x, 2.0)+1.0)+1.0;';
    }
    static cells_activation() {
        return 'return -1.0/(0.9*pow(x, 2.0)+1.0)+1.0;';
    }
    static drops_activation() {
        return 'return -1.0/pow(2.0, (pow(x, 2.0)))+1.0;';
    }
    static lands_activation() {
        return 'return (exp(2.0*x)-1.0)/(exp(2.0*x)+1.0);';
    }
}
//# sourceMappingURL=activations_2d.js.map