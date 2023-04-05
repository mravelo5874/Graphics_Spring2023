import { Debugger } from "./Debugging.js";
export class WebGLUtilities {
    /**
     * Creates and compiles a WebGL Shader from given source
     * @param ctx a WebGL rendering context. This has methods for compiling the shader.
     * @param shaderType can only be ctx.VERTEX_SHADER or ctx.FRAGMENT_SHADER.
     * @param source the shader source code as a string.
     * @return a WebGL shader
     */
    static createShader(ctx, shaderType, source) {
        /* TODO: error checking */
        const shader = ctx.createShader(shaderType);
        ctx.shaderSource(shader, source);
        ctx.compileShader(shader);
        /* Check for Compilation Errors */
        if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
            console.error("ERROR compiling shader!", ctx.getShaderInfoLog(shader));
        }
        return shader;
    }
    /**
     * Creates a shader program from the given vertex shader and fragment shader
     * @param vsSource the vertex shader source as a string
     * @param fsSource the fragment shader source as a string
     * @return a WebGLProgram
     */
    static createProgram(ctx, vsSource, fsSource) {
        /* TODO: error checking */
        const shaderProgram = ctx.createProgram();
        const vertexShader = WebGLUtilities.createShader(ctx, ctx.VERTEX_SHADER, vsSource);
        ctx.attachShader(shaderProgram, vertexShader);
        const fragmentShader = WebGLUtilities.createShader(ctx, ctx.FRAGMENT_SHADER, fsSource);
        ctx.attachShader(shaderProgram, fragmentShader);
        ctx.linkProgram(shaderProgram);
        /* Check for Linker Errors */
        if (!ctx.getProgramParameter(shaderProgram, ctx.LINK_STATUS)) {
            console.error("ERROR linking program!", ctx.getProgramInfoLog(shaderProgram));
        }
        /* While debugging Validate Program */
        ctx.validateProgram(shaderProgram);
        if (!ctx.getProgramParameter(shaderProgram, ctx.VALIDATE_STATUS)) {
            console.error("ERROR validating program!", ctx.getProgramInfoLog(shaderProgram));
        }
        return shaderProgram;
    }
    /**
     * Returns a WebGL context for the given Canvas
     * @param canvas any HTML canvas element
     * @return the WebGL rendering context for the canvas
     */
    static requestWebGLContext(canvas) {
        /* Request WebGL Context */
        let ctx = canvas.getContext("webgl2", {
            preserveDrawingBuffer: true
        });
        if (!ctx) {
            console.log("Your browser does not support WebGL, falling back", "to Experimental WebGL");
            ctx = canvas.getContext("experimental-webgl");
        }
        if (!ctx) {
            throw new Error("Your browser does not support WebGL or Experimental-WebGL");
        }
        return ctx;
    }
}
/**
 * An abstract class that defines the interface for any
 * animation class.
 */
export class CanvasAnimation {
    get_delta_time() { return this.curr_delta_time; }
    get_elapsed_time() { return Date.now() - this.start_time; }
    constructor(canvas, debugMode = false, stopOnError = false, glErrorCallback = Debugger.throwOnError, glCallback = Debugger.throwErrorOnUndefinedArg) {
        this.frame_count = 0;
        // Create webgl rendering context
        this.c = canvas;
        this.ctx = WebGLUtilities.requestWebGLContext(this.c);
        // set current time
        this.start_time = Date.now();
        this.prev_time = Date.now();
        this.prev_fps_time = Date.now();
        this.curr_delta_time = 0;
        this.fps = 0;
        // set initial value
        this.scale_ui = 0;
        this.pers_ui = 0;
        this.lacu_ui = 0;
        if (debugMode) {
            this.ctx = Debugger.makeDebugContext(this.ctx, glErrorCallback, glCallback);
        }
        // add fps text element to screen
        const fps_element = document.querySelector("#fps");
        this.fps_node = document.createTextNode("");
        fps_element === null || fps_element === void 0 ? void 0 : fps_element.appendChild(this.fps_node);
        this.fps_node.nodeValue = this.fps.toFixed(0); // no decimal place
        // add scale text element to screen
        const scale_element = document.querySelector("#scale");
        this.scale_node = document.createTextNode("");
        scale_element === null || scale_element === void 0 ? void 0 : scale_element.appendChild(this.scale_node);
        this.scale_node.nodeValue = this.scale_ui.toFixed(2);
        // add persistance text element to screen
        const pers_element = document.querySelector("#pers");
        this.pers_node = document.createTextNode("");
        pers_element === null || pers_element === void 0 ? void 0 : pers_element.appendChild(this.pers_node);
        this.pers_node.nodeValue = this.pers_ui.toFixed(2);
        // add lacunarity text element to screen
        const lacu_element = document.querySelector("#lacu");
        this.lacu_node = document.createTextNode("");
        lacu_element === null || lacu_element === void 0 ? void 0 : lacu_element.appendChild(this.lacu_node);
        this.lacu_node.nodeValue = this.lacu_ui.toFixed(2);
    }
    update_ui() {
        this.fps_node.nodeValue = this.fps.toFixed(0); // no decimal place
        this.scale_node.nodeValue = this.scale_ui.toFixed(2);
        this.pers_node.nodeValue = this.pers_ui.toFixed(2);
        this.lacu_node.nodeValue = this.lacu_ui.toFixed(2);
    }
    /**
     * Draws and then requests a draw for the next frame.
     */
    drawLoop() {
        // calculate current delta time
        const curr_time = Date.now();
        this.curr_delta_time = (curr_time - this.prev_time);
        this.prev_time = curr_time;
        // draw to screen
        this.draw();
        this.frame_count++;
        // calculate fps
        if (Date.now() - this.prev_fps_time >= 1000) {
            this.fps = this.frame_count;
            this.frame_count = 0;
            this.prev_fps_time = Date.now();
            this.fps_node.nodeValue = this.fps.toFixed(0);
        }
        // request next frame to be drawn
        window.requestAnimationFrame(() => this.drawLoop());
    }
    /**
     * Starts the draw loop of the animation
     */
    start() {
        window.requestAnimationFrame(() => this.drawLoop());
    }
}
//# sourceMappingURL=CanvasAnimation.js.map