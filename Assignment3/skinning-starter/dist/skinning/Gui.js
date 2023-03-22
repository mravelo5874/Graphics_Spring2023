import { Camera } from "../lib/webglutils/Camera.js";
import { Vec3, Vec4 } from "../lib/TSM.js";
import { Ray } from "./Utils.js";
export var Mode;
(function (Mode) {
    Mode[Mode["playback"] = 0] = "playback";
    Mode[Mode["edit"] = 1] = "edit";
})(Mode || (Mode = {}));
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
    constructor(canvas, animation) {
        this.hoverX = 0;
        this.hoverY = 0;
        this.height = canvas.height;
        this.viewPortHeight = this.height - 200;
        this.width = canvas.width;
        this.prevX = 0;
        this.prevY = 0;
        this.animation = animation;
        this.reset();
        this.registerEventListeners(canvas);
    }
    getNumKeyFrames() {
        // TODO
        // Used in the status bar in the GUI
        return 0;
    }
    getTime() { return this.time; }
    getMaxTime() {
        // TODO
        // The animation should stop after the last keyframe
        return 0;
    }
    /**
     * Resets the state of the GUI
     */
    reset() {
        this.fps = false;
        this.dragging = false;
        this.time = 0;
        this.mode = Mode.edit;
        this.camera = new Camera(new Vec3([0, 0, -6]), new Vec3([0, 0, 0]), new Vec3([0, 1, 0]), 45, this.width / this.viewPortHeight, 0.1, 1000.0);
    }
    /**
     * Sets the GUI's camera to the given camera
     * @param cam a new camera
     */
    setCamera(pos, target, upDir, fov, aspect, zNear, zFar) {
        this.camera = new Camera(pos, target, upDir, fov, aspect, zNear, zFar);
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
        if (mouse.offsetY > 600) {
            // outside the main panel
            return;
        }
        // TODO
        // Some logic to rotate the bones, instead of moving the camera, if there is a currently highlighted bone
        this.dragging = true;
        this.prevX = mouse.screenX;
        this.prevY = mouse.screenY;
    }
    incrementTime(dT) {
        if (this.mode === Mode.playback) {
            this.time += dT;
            if (this.time >= this.getMaxTime()) {
                this.time = 0;
                this.mode = Mode.edit;
            }
        }
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
        //console.log('mouse.pos: {' + mouse.x + ', ' + mouse.y + '}')
        //console.log('mouse.offset: {' + mouse.offsetX + ', ' + mouse.offsetY + '}')
        if (this.dragging) {
            const dx = mouse.screenX - this.prevX;
            const dy = mouse.screenY - this.prevY;
            this.prevX = mouse.screenX;
            this.prevY = mouse.screenY;
            /* Left button, or primary button */
            const mouseDir = this.camera.right();
            mouseDir.scale(-dx);
            mouseDir.add(this.camera.up().scale(dy));
            mouseDir.normalize();
            if (dx === 0 && dy === 0) {
                return;
            }
            switch (mouse.buttons) {
                case 1: {
                    let rotAxis = Vec3.cross(this.camera.forward(), mouseDir);
                    rotAxis = rotAxis.normalize();
                    if (this.fps) {
                        this.camera.rotate(rotAxis, GUI.rotationSpeed);
                    }
                    else {
                        this.camera.orbitTarget(rotAxis, GUI.rotationSpeed);
                    }
                    break;
                }
                case 2: {
                    /* Right button, or secondary button */
                    this.camera.offsetDist(Math.sign(mouseDir.y) * GUI.zoomSpeed);
                    break;
                }
                default: {
                    break;
                }
            }
        }
        // You will want logic here:
        // 1) To highlight a bone, if the mouse is hovering over a bone;
        // 2) To rotate a bone, if the mouse button is pressed and currently highlighting a bone.
        //console.log('\n')
        const cyls = this.animation.getScene().get_cylinders();
        //console.log('cylinders: ' + cyls.length)
        // normalized device coordinates
        const x_ndc = x / this.width * 2.0 - 1.0; // -1 to +1
        const y_ndc = 1.0 - y / this.height * 2.0; // -1 to +1
        // homogeneous clip coordinates
        const vec4_clip = new Vec4([x_ndc, y_ndc, -1.0, 1.0]);
        // eye (camera) coordinates
        const proj_mat_inv = this.camera.projMatrix().inverse();
        let vec4_eye = vec4_clip.multiplyMat4(proj_mat_inv);
        vec4_eye[2] = -1.0;
        vec4_eye[3] = 0.0;
        // world coordinates
        const view_mat_inv = this.camera.viewMatrix();
        let vec4_world = vec4_eye.multiplyMat4(view_mat_inv);
        vec4_world = vec4_world.normalize();
        const vec3_world = new Vec3(vec4_world.xyz);
        // create mouse ray + add to scene rays
        const mouse_ray = new Ray(this.camera.pos(), vec3_world);
        //console.log('screen.width: ' + this.width + ', screen.height: ' + this.height)
        //console.log('mouse_scrn: {' + x_screen.toFixed(3), ', ' + y_screen.toFixed(3) + '}')
        // get vector based on mouse position
        // const z : number = -1.0 //this.camera.zNear()
        // const ray_clip : Vec4 = new Vec4([x_screen, y_screen, z, 1.0])
        // let ray_eye : Vec4 =  this.projMatrix().inverse().multiplyVec4(ray_clip)
        // ray_eye = new Vec4([ray_eye.x, ray_eye.y, z, 0.0])
        // const ray_world : Vec3 = new Vec3 (this.viewMatrix().inverse().multiplyVec4(ray_eye).xyz).normalize()
        // create mouse ray
        //const mouse_ray : Ray = new Ray(this.camera.pos(), ray_world)
        // console.log('cam_pos: {' + Ray.Vec3_toFixed(new Vec3(this.camera.pos().xyz)) + '}')
        // console.log('cam_ray: {' + Ray.Vec3_toFixed(new Vec3(this.camera.forward().xyz)) + '}')
        // console.log('mse_ray: {' + Ray.Vec3_toFixed(mouse_ray.get_direction()) + '}')
        // check cyliner intersections - (might need a BVH)
        let curr_bone = -1;
        let curr_t = Number.MAX_VALUE;
        for (let i = 0; i < cyls.length; i++) {
            let res = cyls[i].ray_interset(mouse_ray.copy());
            //console.log('res[' + i + ']: {' + res[0] + ', ' + res[1] + '}')
            if (res[0] && res[1] < curr_t) {
                //console.log('valid result!')
                curr_t = res[1];
                curr_bone = i;
            }
        }
        // print out bone
        if (curr_bone > -1) {
            //console.log('[HIT BONE] current bone: ' + cyls[curr_bone] + ' @ t=' + curr_t)
        }
    }
    getModeString() {
        switch (this.mode) {
            case Mode.edit: {
                return "edit: " + this.getNumKeyFrames() + " keyframes";
            }
            case Mode.playback: {
                return "playback: " + this.getTime().toFixed(2) + " / " + this.getMaxTime().toFixed(2);
            }
        }
    }
    /**
     * Callback function for the end of a drag event
     * @param mouse
     */
    dragEnd(mouse) {
        this.dragging = false;
        this.prevX = 0;
        this.prevY = 0;
        // TODO
        // Maybe your bone highlight/dragging logic needs to do stuff here too
    }
    /**
     * Callback function for a key press event
     * @param key
     */
    onKeydown(key) {
        switch (key.code) {
            case "Digit1": {
                this.animation.setScene("/static/assets/skinning/split_cube.dae");
                break;
            }
            case "Digit2": {
                this.animation.setScene("/static/assets/skinning/long_cubes.dae");
                break;
            }
            case "Digit3": {
                this.animation.setScene("/static/assets/skinning/simple_art.dae");
                break;
            }
            case "Digit4": {
                this.animation.setScene("/static/assets/skinning/mapped_cube.dae");
                break;
            }
            case "Digit5": {
                this.animation.setScene("/static/assets/skinning/robot.dae");
                break;
            }
            case "Digit6": {
                this.animation.setScene("/static/assets/skinning/head.dae");
                break;
            }
            case "Digit7": {
                this.animation.setScene("/static/assets/skinning/wolf.dae");
                break;
            }
            case "KeyW": {
                this.camera.offset(this.camera.forward().negate(), GUI.zoomSpeed, true);
                break;
            }
            case "KeyA": {
                this.camera.offset(this.camera.right().negate(), GUI.zoomSpeed, true);
                break;
            }
            case "KeyS": {
                this.camera.offset(this.camera.forward(), GUI.zoomSpeed, true);
                break;
            }
            case "KeyD": {
                this.camera.offset(this.camera.right(), GUI.zoomSpeed, true);
                break;
            }
            case "KeyR": {
                this.animation.reset();
                break;
            }
            case "ArrowLeft": {
                this.camera.roll(GUI.rollSpeed, false);
                break;
            }
            case "ArrowRight": {
                this.camera.roll(GUI.rollSpeed, true);
                break;
            }
            case "ArrowUp": {
                this.camera.offset(this.camera.up(), GUI.zoomSpeed, true);
                break;
            }
            case "ArrowDown": {
                this.camera.offset(this.camera.up().negate(), GUI.zoomSpeed, true);
                break;
            }
            case "KeyK": {
                if (this.mode === Mode.edit) {
                    // TODO
                    // Add keyframe
                }
                break;
            }
            case "KeyP": {
                if (this.mode === Mode.edit && this.getNumKeyFrames() > 1) {
                    this.mode = Mode.playback;
                    this.time = 0;
                }
                else if (this.mode === Mode.playback) {
                    this.mode = Mode.edit;
                }
                break;
            }
            case "KeyB":
                {
                    // custom button to shoot a ray from the 
                    // camera and draw it to the screen.
                    let cam_dir = this.camera.forward();
                    const cam_ray = new Ray(this.camera.pos(), cam_dir);
                    this.animation.getScene().add_ray(cam_ray);
                    console.log('new camera raycast: ' + cam_ray.print());
                    console.log('total rays: ' + this.animation.getScene().get_rays().length);
                    break;
                }
            default: {
                console.log("Key : '", key.code, "' was pressed.");
                break;
            }
        }
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