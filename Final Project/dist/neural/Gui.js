import { Camera } from "../lib/webglutils/Camera.js";
import { Vec3, Vec4 } from "../lib/TSM.js";
import { Ray } from "./Utils.js";
/**
 * Handles Mouse and Button events along with
 * the the camera.
 */
class GUI {
    /**
     *
     * @param canvas required to get the width and height of the canvas
     * @param animation required as a back pointer for some of the controls
     */
    constructor(canvas, animation) {
        this.height = canvas.height;
        this.width = canvas.width;
        this.prevX = 0;
        this.prevY = 0;
        this.dragging = false;
        this.neural = animation;
        this.reset();
        this.registerEventListeners(canvas);
    }
    /**
     * Resets the state of the GUI
     */
    reset() {
        this.camera = new Camera(new Vec3([0, 100, 0]), new Vec3([0, 100, -1]), new Vec3([0, 1, 0]), 45, this.width / this.height, 0.1, 1000.0);
    }
    /**
     * Sets the GUI's camera to the given camera
     * @param cam a new camera
     */
    setCamera(pos, target, upDir, fov, aspect, zNear, zFar) {
        this.camera = new Camera(pos, target, upDir, fov, aspect, zNear, zFar);
    }
    viewMatrix() { return this.camera.viewMatrix(); }
    projMatrix() { return this.camera.projMatrix(); }
    getCamera() { return this.camera; }
    dragStart(mouse) {
        this.prevX = mouse.screenX;
        this.prevY = mouse.screenY;
        this.dragging = true;
    }
    dragEnd(mouse) {
        this.dragging = false;
    }
    /**
     * The callback function for a drag event.
     * This event happens after dragStart and
     * before dragEnd.
     * @param mouse
     */
    drag(mouse) {
        let x = mouse.offsetX;
        let y = mouse.offsetY;
        const dx = mouse.screenX - this.prevX;
        const dy = mouse.screenY - this.prevY;
        this.prevX = mouse.screenX;
        this.prevY = mouse.screenY;
        // convert mouse x y position to world ray
        this.mouse_ray = this.screen_to_world_ray(x, y);
    }
    screen_to_world_ray(x, y) {
        // convert x y to ndc
        const x_ndc = ((2.0 * x) / this.width) - 1.0;
        const y_ndc = 1.0 - ((2.0 * y) / (this.height));
        // inverse projections
        const proj_mat = this.camera.projMatrix().inverse();
        const view_mat = this.camera.viewMatrix().inverse();
        // get to and from points
        let from_v4 = proj_mat.multiplyVec4(new Vec4([x_ndc, y_ndc, -1.0, 1.0]));
        let to_v4 = proj_mat.multiplyVec4(new Vec4([x_ndc, y_ndc, 1.0, 1.0]));
        // convert to v3
        const from_v3 = new Vec3([from_v4.at(0) / from_v4.at(3), from_v4.at(1) / from_v4.at(3), from_v4.at(2) / from_v4.at(3)]);
        const to_v3 = new Vec3([to_v4.at(0) / to_v4.at(3), to_v4.at(1) / to_v4.at(3), to_v4.at(2) / to_v4.at(3)]);
        let dir = from_v3.subtract(to_v3).normalize();
        let dir_v4 = new Vec4([dir.x, dir.y, dir.z, 0.0]);
        dir_v4 = view_mat.multiplyVec4(dir_v4);
        const dir_v3 = new Vec3(dir_v4.xyz);
        //console.log('dir: ' + Ray.Vec3_toFixed(dir_v3))
        return new Ray(this.camera.pos(), dir_v3.normalize());
    }
    /**
     * Callback function for a key press event
     * @param key
     */
    onKeydown(key) {
        const width = this.neural.get_width();
        const height = this.neural.get_height();
        switch (key.code) {
            case 'Equal':
                this.neural.set_resolution(width + 1, height + 1);
                break;
            case 'Minus':
                this.neural.set_resolution(width - 1, height - 1);
                break;
            default:
                console.log("Key : '", key.code, "' was pressed.");
                break;
        }
    }
    onKeyup(key) {
        switch (key.code) {
            default:
                console.log("Key : '", key.code, "' was pressed.");
                break;
        }
    }
    /**
     * Registers all event listeners for the GUI
     * @param canvas The canvas being used
     */
    registerEventListeners(canvas) {
        /* Event listener for key controls */
        window.addEventListener("keydown", (key) => this.onKeydown(key));
        window.addEventListener("keyup", (key) => this.onKeyup(key));
        /* Event listener for mouse controls */
        canvas.addEventListener("mousedown", (mouse) => this.dragStart(mouse));
        canvas.addEventListener("mousemove", (mouse) => this.drag(mouse));
        canvas.addEventListener("mouseup", (mouse) => this.dragEnd(mouse));
        /* Event listener to stop the right click menu */
        canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    }
}
GUI.rotationSpeed = 0.01;
GUI.walkSpeed = 1;
GUI.rollSpeed = 0.1;
GUI.panSpeed = 0.1;
export { GUI };
//# sourceMappingURL=Gui.js.map