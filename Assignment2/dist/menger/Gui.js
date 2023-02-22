import { Camera } from "../lib/webglutils/Camera.js";
import { Vec3, Vec2, Vec4 } from "../lib/TSM.js";
/**
 * Handles Mouse and Button events along with
 * the the camera.
 */
export class GUI {
    /**
     *
     * @param canvas required to get the width and height of the canvas
     * @param animation required as a back pointer for some of the controls
     * @param sponge required for some of the controls
     */
    constructor(canvas, animation, sponge, jcube) {
        this.height = canvas.height;
        this.width = canvas.width;
        this.prevX = 0;
        this.prevY = 0;
        this.sponge = sponge;
        this.jcube = jcube;
        this.animation = animation;
        this.reset();
        this.registerEventListeners(canvas);
    }
    /**
     * Resets the state of the GUI
     */
    reset() {
        this.fps = false;
        this.dragging = false;
        /* Create camera setup */
        this.camera = new Camera(new Vec3([0, 0, -6]), new Vec3([0, 0, -1]), new Vec3([0, 1, 0]), 45, this.width / this.height, 0.1, 1000.0);
    }
    /**
     * Sets the GUI's camera to the given camera
     * @param cam a new camera
     */
    setCamera(pos, target, upDir, fov, aspect, zNear, zFar) {
        this.camera = new Camera(pos, target, upDir, fov, aspect, zNear, zFar);
    }
    camera_look() {
        const look = this.camera.forward().copy();
        return new Vec4([look.x, look.y, look.z, 0.0]);
    }
    /**
     * Returns the view matrix of the camera
     */
    viewMatrix() {
        return this.camera.viewMatrix();
    }
    /**
     * Returns the projection matrix of the camera
     */
    projMatrix() {
        return this.camera.projMatrix();
    }
    /**
     * Callback function for the start of a drag event.
     * @param mouse
     */
    dragStart(mouse) {
        this.dragging = true;
        this.prevX = mouse.screenX;
        this.prevY = mouse.screenY;
    }
    /**
     * The callback function for a drag event.
     * This event happens after dragStart and
     * before dragEnd.
     * @param mouse
     */
    drag(mouse) {
        if (!this.dragging)
            return;
        const prev_pos = new Vec2([this.prevX, this.prevY]);
        const curr_pos = new Vec2([mouse.screenX, mouse.screenY]);
        const drag_dir = Vec2.direction(prev_pos, curr_pos);
        this.prevX = mouse.screenX;
        this.prevY = mouse.screenY;
        this.camera.yaw(GUI.rotationSpeed * drag_dir.x, drag_dir.x < 0);
        this.camera.pitch(GUI.rotationSpeed * drag_dir.y, drag_dir.y < 0);
    }
    /**
     * Callback function for the end of a drag event
     * @param mouse
     */
    dragEnd(mouse) {
        this.dragging = false;
        this.prevX = 0;
        this.prevY = 0;
    }
    /**
     * Callback function for a key press event
     * @param key
     */
    onKeydown(key) {
        /*
             Note: key.code uses key positions, i.e a QWERTY user uses y where
                         as a Dvorak user must press F for the same action.
             Note: arrow keys are only registered on a KeyDown event not a
             KeyPress event
             We can use KeyDown due to auto repeating.
         */
        const look = this.camera.forward().copy();
        const right = this.camera.right().copy();
        const up = this.camera.up().copy();
        switch (key.code) {
            case "KeyW":
                {
                    this.camera.offset(look, GUI.zoomSpeed * -1.0, true);
                    break;
                }
            case "KeyA":
                {
                    this.camera.offset(right, GUI.zoomSpeed * -1.0, true);
                    break;
                }
            case "KeyS":
                {
                    this.camera.offset(look, GUI.zoomSpeed, true);
                    break;
                }
            case "KeyD":
                {
                    this.camera.offset(right, GUI.zoomSpeed, true);
                    break;
                }
            case "KeyR":
                {
                    this.reset();
                    break;
                }
            case "ArrowLeft":
                {
                    this.camera.roll(GUI.rollSpeed, false);
                    break;
                }
            case "ArrowRight":
                {
                    this.camera.roll(GUI.rollSpeed, true);
                    break;
                }
            case "ArrowUp":
                {
                    this.camera.offset(up, GUI.zoomSpeed, true);
                    break;
                }
            case "ArrowDown":
                {
                    this.camera.offset(up, GUI.zoomSpeed * -1.0, true);
                    break;
                }
            case "Digit1":
                {
                    this.sponge.setLevel(1);
                    this.jcube.setLevel(1);
                    break;
                }
            case "Digit2":
                {
                    this.sponge.setLevel(2);
                    this.jcube.setLevel(2);
                    break;
                }
            case "Digit3":
                {
                    this.sponge.setLevel(3);
                    this.jcube.setLevel(3);
                    break;
                }
            case "Digit4":
                {
                    this.sponge.setLevel(4);
                    this.jcube.setLevel(4);
                    break;
                }
            default:
                {
                    console.log("Key : '", key.code, "' was pressed.");
                    break;
                }
        }
        //this.camera.setPos(eye)
    }
    /**
     * Registers all event listeners for the GUI
     * @param canvas The canvas being used
     */
    registerEventListeners(canvas) {
        /* Event listener for key controls */
        window.addEventListener("keydown", (key) => this.onKeydown(key));
        /* Event listener for mouse controls */
        canvas.addEventListener("mousedown", (mouse) => this.dragStart(mouse));
        canvas.addEventListener("mousemove", (mouse) => this.drag(mouse));
        canvas.addEventListener("mouseup", (mouse) => this.dragEnd(mouse));
        /* Event listener to stop the right click menu */
        canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    }
}
GUI.rotationSpeed = 0.05;
GUI.zoomSpeed = 0.1;
GUI.rollSpeed = 0.1;
GUI.panSpeed = 0.1;
//# sourceMappingURL=Gui.js.map