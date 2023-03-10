import { Camera } from "../lib/webglutils/Camera.js";
import { CanvasAnimation } from "../lib/webglutils/CanvasAnimation.js";
import { MengerSponge } from "./MengerSponge.js";
import { Mat4, Vec3, Vec2, Vec4 } from "../lib/TSM.js";
import { JerusalemCube } from "./JerusalemCube.js";

/**
 * Might be useful for designing any animation GUI
 */
interface IGUI {
	viewMatrix(): Mat4;
	projMatrix(): Mat4;
	dragStart(me: MouseEvent): void;
	drag(me: MouseEvent): void;
	dragEnd(me: MouseEvent): void;
	onKeydown(ke: KeyboardEvent): void;
}

/**
 * Handles Mouse and Button events along with
 * the the camera.
 */
export class GUI implements IGUI {
	private static readonly rotationSpeed: number = 0.05;
	private static readonly zoomSpeed: number = 0.1;
	private static readonly rollSpeed: number = 0.1;
	private static readonly panSpeed: number = 0.1;

	private camera: Camera;
	private dragging: boolean;
	private fps: boolean;
	private prevX: number;
	private prevY: number;

	private height: number;
	private width: number;

	private sponge: MengerSponge;
	private jcube: JerusalemCube;
	private showSponge: boolean;
	private animation: CanvasAnimation;

	/**
	 *
	 * @param canvas required to get the width and height of the canvas
	 * @param animation required as a back pointer for some of the controls
	 * @param sponge required for some of the controls
	 */
	constructor(
		canvas: HTMLCanvasElement,
		animation: CanvasAnimation,
		sponge: MengerSponge,
		jcube: JerusalemCube,
	) {
		this.height = canvas.height;
		this.width = canvas.width;
		this.prevX = 0;
		this.prevY = 0;

		this.sponge = sponge;
		this.jcube = jcube
		this.animation = animation;

		this.reset();
		this.registerEventListeners(canvas);
	}

	/**
	 * Resets the state of the GUI
	 */
	public reset(): void {
		this.showSponge = true
		this.fps = false;
		this.dragging = false;
		/* Create camera setup */
		this.camera = new Camera(
			new Vec3([0, 0, -6]),
			new Vec3([0, 0, -1]),
			new Vec3([0, 1, 0]),
			45,
			this.width / this.height,
			0.1,
			1000.0
		);
	}

	/**
	 * Sets the GUI's camera to the given camera
	 * @param cam a new camera
	 */
	public setCamera(
		pos: Vec3,
		target: Vec3,
		upDir: Vec3,
		fov: number,
		aspect: number,
		zNear: number,
		zFar: number
	) {
		this.camera = new Camera(pos, target, upDir, fov, aspect, zNear, zFar);
	}

	public camera_look()
	{
		const look = this.camera.forward().copy()
		return new Vec4([look.x, look.y, look.z, 0.0])
	}

	/**
	 * Returns the view matrix of the camera
	 */
	public viewMatrix(): Mat4 {
		return this.camera.viewMatrix();
	}

	/**
	 * Returns the projection matrix of the camera
	 */
	public projMatrix(): Mat4 {
		return this.camera.projMatrix();
	}

	/**
	 * Callback function for the start of a drag event.
	 * @param mouse
	 */
	public dragStart(mouse: MouseEvent): void {
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
	public drag(mouse: MouseEvent): void 
	{
		if (!this.dragging)
			return

		const prev_pos : Vec2 = new Vec2([this.prevX, this.prevY])
		const curr_pos : Vec2 = new Vec2([mouse.screenX, mouse.screenY])
		const drag_dir : Vec2 = Vec2.direction(prev_pos, curr_pos)
		this.prevX = mouse.screenX
		this.prevY = mouse.screenY

		this.camera.yaw(GUI.rotationSpeed * drag_dir.x, drag_dir.x < 0)
		this.camera.pitch(GUI.rotationSpeed * drag_dir.y, drag_dir.y < 0)
	}

	/**
	 * Callback function for the end of a drag event
	 * @param mouse
	 */
	public dragEnd(mouse: MouseEvent): void {
		this.dragging = false;
		this.prevX = 0;
		this.prevY = 0;
	}

	/**
	 * Callback function for a key press event
	 * @param key
	 */
	public onKeydown(key: KeyboardEvent): void 
	{
		/*
			 Note: key.code uses key positions, i.e a QWERTY user uses y where
						 as a Dvorak user must press F for the same action.
			 Note: arrow keys are only registered on a KeyDown event not a
			 KeyPress event
			 We can use KeyDown due to auto repeating.
		 */

		const look : Vec3 = this.camera.forward().copy()
		const right : Vec3 = this.camera.right().copy()
		const up : Vec3 = this.camera.up().copy()

		switch (key.code)
		{
			case "KeyW": 
			{
				this.camera.offset(look, GUI.zoomSpeed * -1.0, true)
				break;
			}
			case "KeyA": 
			{
				this.camera.offset(right, GUI.zoomSpeed * -1.0, true)
				break;
			}
			case "KeyS": 
			{
				this.camera.offset(look, GUI.zoomSpeed, true)
				break;
			}
			case "KeyD": 
			{
				this.camera.offset(right, GUI.zoomSpeed, true)
				break;
			}
			case "KeyR": 
			{
				this.reset()
				break;
			}
			case "ArrowLeft": 
			{
				this.camera.roll(GUI.rollSpeed, false)
				break;
			}
			case "ArrowRight": 
			{
				this.camera.roll(GUI.rollSpeed, true)
				break;
			}
			case "ArrowUp": 
			{
				this.camera.offset(up, GUI.zoomSpeed, true)
				break;
			}
			case "ArrowDown": 
			{
				this.camera.offset(up, GUI.zoomSpeed * -1.0, true)
				break;
			}
			case "Digit0": 
			{
				if (this.showSponge)
				{
					const level = this.sponge.get_level()
					this.sponge.remove()
					this.jcube.setLevel(level)
					this.showSponge = false
				}
				else 
				{
					const level = this.jcube.get_level()
					this.jcube.remove()
					this.sponge.setLevel(level)
					this.showSponge = true
				}
				break;
			}
			case "Digit1": 
			{
				if (this.showSponge) this.sponge.setLevel(1)
				else this.jcube.setLevel(1)
				break;
			}
			case "Digit2": 
			{
				if (this.showSponge) this.sponge.setLevel(2)
				else this.jcube.setLevel(2)
				break;
			}
			case "Digit3": 
			{
				if (this.showSponge) this.sponge.setLevel(3)
				else this.jcube.setLevel(3)
				break;
			}
			case "Digit4": 
			{
				if (this.showSponge) this.sponge.setLevel(4)
				else this.jcube.setLevel(4)
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
	private registerEventListeners(canvas: HTMLCanvasElement): void {
		/* Event listener for key controls */
		window.addEventListener("keydown", (key: KeyboardEvent) =>
			this.onKeydown(key)
		);

		/* Event listener for mouse controls */
		canvas.addEventListener("mousedown", (mouse: MouseEvent) =>
			this.dragStart(mouse)
		);

		canvas.addEventListener("mousemove", (mouse: MouseEvent) =>
			this.drag(mouse)
		);

		canvas.addEventListener("mouseup", (mouse: MouseEvent) =>
			this.dragEnd(mouse)
		);

		/* Event listener to stop the right click menu */
		canvas.addEventListener("contextmenu", (event: any) =>
			event.preventDefault()
		);
	}
}
