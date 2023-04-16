import { Camera } from "../lib/webglutils/Camera.js";
import { NeuralAnimation } from "./App.js";
import { Mat4, Vec3, Vec4 } from "../lib/TSM.js";
import { Ray } from "./Utils.js"

/**
 * Might be useful for designing any animation GUI
 */
interface IGUI 
{
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

export class GUI implements IGUI 
{
  private static readonly rotationSpeed: number = 0.01;
  private static readonly walkSpeed: number = 1;
  private static readonly rollSpeed: number = 0.1;
  private static readonly panSpeed: number = 0.1;

  private camera: Camera;
  private prevX: number;
  private prevY: number;
  private dragging: boolean;

  private height: number;
  private width: number;

  private neural: NeuralAnimation;
  public mouse_ray : Ray;

  /**
   *
   * @param canvas required to get the width and height of the canvas
   * @param animation required as a back pointer for some of the controls
   */
  constructor(canvas: HTMLCanvasElement, animation: NeuralAnimation) 
  {
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
  public reset(): void 
  {
    this.camera = new Camera(
      new Vec3([0, 100, 0]),
      new Vec3([0, 100, -1]),
      new Vec3([0, 1, 0]),
      45,
      this.width / this.height,
      0.1,
      1000.0
    )
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


  public viewMatrix(): Mat4 { return this.camera.viewMatrix() }
  public projMatrix(): Mat4 { return this.camera.projMatrix() }
  public getCamera(): Camera { return this.camera; }
  
  public dragStart(mouse: MouseEvent): void 
  {
    this.prevX = mouse.screenX;
    this.prevY = mouse.screenY;
    this.dragging = true;
  }
  public dragEnd(mouse: MouseEvent): void 
  {
    this.dragging = false;
  }
  
  /**
   * The callback function for a drag event.
   * This event happens after dragStart and
   * before dragEnd.
   * @param mouse
   */
  public drag(mouse: MouseEvent): void 
  {
    let x = mouse.offsetX;
    let y = mouse.offsetY;
    const dx = mouse.screenX - this.prevX;
    const dy = mouse.screenY - this.prevY;
    this.prevX = mouse.screenX;
    this.prevY = mouse.screenY;

    // convert mouse x y position to world ray
    this.mouse_ray = this.screen_to_world_ray(x, y)
  }

  private screen_to_world_ray(x : number, y : number) : Ray
  {
    // convert x y to ndc
    const x_ndc = ((2.0 * x) / this.width) - 1.0
    const y_ndc = 1.0 - ((2.0 * y) / (this.height))

    // inverse projections
    const proj_mat : Mat4 = this.camera.projMatrix().inverse()
    const view_mat : Mat4 = this.camera.viewMatrix().inverse()
    // get to and from points
    let from_v4 : Vec4 = proj_mat.multiplyVec4(new Vec4([x_ndc, y_ndc, -1.0, 1.0]))
    let to_v4 : Vec4 = proj_mat.multiplyVec4(new Vec4([x_ndc, y_ndc, 1.0, 1.0]))

    // convert to v3
    const from_v3 : Vec3 = new Vec3([from_v4.at(0) / from_v4.at(3), from_v4.at(1) / from_v4.at(3), from_v4.at(2) / from_v4.at(3)])
    const to_v3 : Vec3 = new Vec3([to_v4.at(0) / to_v4.at(3), to_v4.at(1) / to_v4.at(3), to_v4.at(2) / to_v4.at(3)])
    
    let dir : Vec3 = from_v3.subtract(to_v3).normalize()
    let dir_v4 : Vec4 = new Vec4([dir.x, dir.y, dir.z, 0.0])
    dir_v4 = view_mat.multiplyVec4(dir_v4)
    const dir_v3 = new Vec3(dir_v4.xyz)

    //console.log('dir: ' + Ray.Vec3_toFixed(dir_v3))
    return new Ray(this.camera.pos(), dir_v3.normalize())
  }
  
  /**
   * Callback function for a key press event
   * @param key
   */
  public onKeydown(key: KeyboardEvent): void
  {
    const width = this.neural.get_width()
    const height = this.neural.get_height()

    switch (key.code) 
    {
      case 'Equal':
        this.neural.set_resolution(width + 1, height + 1)
        break
      case 'Minus':
        this.neural.set_resolution(width - 1, height - 1)
        break
      default: 
        console.log("Key : '", key.code, "' was pressed.")
        break
    }
  }
  
  public onKeyup(key: KeyboardEvent): void 
  {
    switch (key.code) 
    {
      default: 
        console.log("Key : '", key.code, "' was pressed.");
        break;
    }
  }  

  /**
   * Registers all event listeners for the GUI
   * @param canvas The canvas being used
   */
  private registerEventListeners(canvas: HTMLCanvasElement): void 
  {
    /* Event listener for key controls */
    window.addEventListener("keydown", (key: KeyboardEvent) =>
      this.onKeydown(key)
    );
    
    window.addEventListener("keyup", (key: KeyboardEvent) =>
      this.onKeyup(key)
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
