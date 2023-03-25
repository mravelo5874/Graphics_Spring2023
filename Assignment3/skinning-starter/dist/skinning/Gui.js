import { Camera } from "../lib/webglutils/Camera.js";
import { Vec3, Vec4 } from "../lib/TSM.js";
import { Ray, Utils } from "./Utils.js";
import { BoneRotator } from "./BoneRotator.js";
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
        this.bone_id = -1;
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
        this.prevX = mouse.screenX;
        this.prevY = mouse.screenY;
        this.dragging = true;
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
            else {
                switch (mouse.buttons) {
                    case 1:
                        {
                            // rotate current bone
                            if (this.bone_id > -1) {
                                // roate bone based on dx
                                let cam_dir = this.camera.forward();
                                const cam_ray = new Ray(this.camera.pos(), cam_dir);
                                BoneRotator.rotate_bone(this.animation.getScene(), this.bone_id, dx, cam_ray.get_direction());
                            }
                            else {
                                let rotAxis = Vec3.cross(this.camera.forward(), mouseDir);
                                rotAxis = rotAxis.normalize();
                                if (this.fps) {
                                    this.camera.rotate(rotAxis, GUI.rotationSpeed);
                                }
                                else {
                                    this.camera.orbitTarget(rotAxis, GUI.rotationSpeed);
                                }
                            }
                            break;
                        }
                    case 2:
                        {
                            /* Right button, or secondary button */
                            this.camera.offsetDist(Math.sign(mouseDir.y) * GUI.zoomSpeed);
                            break;
                        }
                    default:
                        {
                            break;
                        }
                }
            }
        }
        // You will want logic here:
        // 1) To highlight a bone, if the mouse is hovering over a bone;
        // 2) To rotate a bone, if the mouse button is pressed and currently highlighting a bone.
        if (!this.dragging) {
            // make sure scene is finished loading
            if (!this.animation.getScene().is_loaded)
                return;
            // get all cylinders cooresponding to bones
            const cyls = this.animation.getScene().get_cylinders();
            // convert mouse x y position to world ray
            this.mouse_ray = this.screen_to_world_ray(x, y);
            // check intersections - might need BVH !!!
            let id = -1;
            let min_t = Number.MAX_VALUE;
            for (let i = 0; i < cyls.length; i++) {
                let res = cyls[i].ray_interset(this.mouse_ray);
                if (res[0] && res[1] < min_t) {
                    id = cyls[i].get_id();
                    min_t = res[1];
                }
            }
            // set bone highlight
            if (id >= 0) {
                this.animation.getScene().hex.set_color(Utils.get_color('cyan'));
                this.animation.getScene().hex.set(cyls[id].get_start(), cyls[id].get_end(), id);
                this.bone_id = id;
            }
            // no bone hightlight    
            else {
                this.animation.getScene().hex.del();
                this.bone_id = -1;
            }
        }
    }
    screen_to_world_ray(x, y) {
        // convert x y to ndc
        const x_ndc = ((2.0 * x) / this.width) - 1.0;
        const y_ndc = 1.0 - ((2.0 * y) / (this.viewPortHeight));
        //console.log('ndc: {' + x_ndc.toFixed(3) + ', ' + y_ndc.toFixed(3) + '}')
        // inverse projections
        const proj_mat = this.camera.projMatrix().inverse();
        const view_mat = this.camera.viewMatrix().inverse();
        // get to and from points
        let from_v4 = proj_mat.multiplyVec4(new Vec4([x_ndc, y_ndc, -1.0, 1.0]));
        let to_v4 = proj_mat.multiplyVec4(new Vec4([x_ndc, y_ndc, 1.0, 1.0]));
        // perspective divide
        //from_v4 = from_v4.scale(1/from_v4.w)
        //to_v4 = to_v4.scale(1/to_v4.w)
        // convert to v3
        const from_v3 = new Vec3([from_v4.at(0) / from_v4.at(3), from_v4.at(1) / from_v4.at(3), from_v4.at(2) / from_v4.at(3)]);
        const to_v3 = new Vec3([to_v4.at(0) / to_v4.at(3), to_v4.at(1) / to_v4.at(3), to_v4.at(2) / to_v4.at(3)]);
        // console.log('\n')
        // console.log('from: ' + Ray.Vec3_toFixed(from_v3))
        // console.log('to: ' + Ray.Vec3_toFixed(to_v3))
        let dir = from_v3.subtract(to_v3).normalize();
        let dir_v4 = new Vec4([dir.x, dir.y, dir.z, 0.0]);
        dir_v4 = view_mat.multiplyVec4(dir_v4);
        const dir_v3 = new Vec3(dir_v4.xyz);
        //console.log('dir: ' + Ray.Vec3_toFixed(dir_v3))
        return new Ray(this.camera.pos(), dir_v3.normalize());
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
        this.animation.getScene().hex.set_color(Utils.get_color('cyan'));
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
                    this.animation.getScene().rr.add_ray(cam_ray, "cyan");
                    console.log('new camera raycast: ' + cam_ray.print());
                    console.log('total rays: ' + this.animation.getScene().rr.get_rays().length);
                    break;
                }
            case "KeyV":
                {
                    // return if mouse_ray has not been created
                    if (!this.mouse_ray)
                        return;
                    // custom button to shoot a ray from the 
                    // mouse and draw it to the screen.
                    // convert mouse x y position to world ray
                    this.animation.getScene().rr.add_ray(this.mouse_ray, "pink");
                    // const cyls : Cylinder[] = this.animation.getScene().get_cylinders()
                    // let res : [boolean, number] = cyls[0].ray_interset(this.mouse_ray, this.animation.getScene())
                    console.log('new mouse raycast: ' + this.mouse_ray.print());
                    console.log('total rays: ' + this.animation.getScene().rr.get_rays().length);
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