export class app3D {
    constructor(_neural) {
        this.neural_app = _neural;
        this.canvas = _neural.canvas;
        this.context = _neural.context;
    }
    reset() {
    }
    start() {
        this.reset();
        this.neural_app.auto_node.nodeValue = 'none';
        this.neural_app.shade_node.nodeValue = 'none';
    }
    end() {
        // idk something ?
    }
    draw_loop() {
        let gl = this.context;
        let w = this.canvas.width;
        let h = this.canvas.height;
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.viewport(0, 0, w, h);
    }
}
//# sourceMappingURL=app3D.js.map