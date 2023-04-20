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
}
//# sourceMappingURL=activations.js.map