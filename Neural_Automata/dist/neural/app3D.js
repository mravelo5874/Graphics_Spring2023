export class app3D {
    constructor(_neural) {
        this.canvas = _neural.canvas;
        this.context = _neural.context;
    }
    start() {
        this.draw();
    }
    end() {
    }
    draw() {
        let gl = this.context;
        let w = this.canvas.width;
        let h = this.canvas.height;
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.viewport(0, 0, w, h);
    }
}
//# sourceMappingURL=app3D.js.map