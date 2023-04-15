import { Debugger } from "../lib/webglutils/Debugging.js";
import { CanvasAnimation, } from "../lib/webglutils/CanvasAnimation.js";
import { GUI } from "./Gui.js";
import { Vec4 } from "../lib/TSM.js";
export class NeuralAnimation extends CanvasAnimation {
    getGUI() { return this.gui; }
    constructor(canvas) {
        super(canvas);
        this.canvas2d = document.getElementById("textCanvas");
        this.ctx = Debugger.makeDebugContext(this.ctx);
        let gl = this.ctx;
        this.gui = new GUI(this.canvas2d, this);
        // environment stuff
        this.lightPosition = new Vec4([-1000, 1000, -1000, 1]);
        this.backgroundColor = new Vec4([1.0, 1.0, 1.0, 1.0]);
    }
    /**
     * Setup the simulation. This can be called again to reset the program.
     */
    reset() {
        // reset gui
        this.gui.reset();
    }
    /**
     * Draws a single frame
     *
     */
    draw() {
        // Drawing
        const gl = this.ctx;
        const bg = this.backgroundColor;
        gl.clearColor(bg.r, bg.g, bg.b, bg.a);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.BACK);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null); // null is the default frame buffer
        this.drawScene(0, 0, 1280, 960);
    }
    drawScene(x, y, width, height) {
        const gl = this.ctx;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(x, y, width, height);
    }
}
export function initializeCanvas() {
    const canvas = document.getElementById("glCanvas");
    /* Start drawing */
    const canvasAnimation = new NeuralAnimation(canvas);
    canvasAnimation.start();
}
//# sourceMappingURL=App.js.map