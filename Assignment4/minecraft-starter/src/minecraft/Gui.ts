import { Camera } from "../lib/webglutils/Camera.js";
import { MinecraftAnimation } from "./App.js";
import { Mat4, Vec3, Vec4 } from "../lib/TSM.js";
import { Ray } from "./Utils.js"

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

  private animation: MinecraftAnimation;
  
  private Adown: boolean;
  private Wdown: boolean;
  private Sdown: boolean;
  private Ddown: boolean;
  private go_up: boolean;
  private go_down: boolean;

  private alt_pressed: boolean;
  private mouse_ray : Ray;

  /**
   *
   * @param canvas required to get the width and height of the canvas
   * @param animation required as a back pointer for some of the controls
   */
  constructor(canvas: HTMLCanvasElement, animation: MinecraftAnimation) {
    this.height = canvas.height;
    this.width = canvas.width;
    this.prevX = 0;
    this.prevY = 0;
    this.dragging = false;
    
    this.animation = animation;
    
    this.reset();
    
    this.registerEventListeners(canvas);
  }

  /**
   * Resets the state of the GUI
   */
  public reset(): void {
    this.camera = new Camera(
      new Vec3([0, 100, 0]),
      new Vec3([0, 100, -1]),
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
  
  public getCamera(): Camera {
    return this.camera;
  }
  
  public dragStart(mouse: MouseEvent): void {
    this.prevX = mouse.screenX;
    this.prevY = mouse.screenY;
    this.dragging = true;
  }
  public dragEnd(mouse: MouseEvent): void {
      this.dragging = false;
  }
  
  /**
   * The callback function for a drag event.
   * This event happens after dragStart and
   * before dragEnd.
   * @param mouse
   */
  public drag(mouse: MouseEvent): void {
    let x = mouse.offsetX;
    let y = mouse.offsetY;
    const dx = mouse.screenX - this.prevX;
    const dy = mouse.screenY - this.prevY;
    this.prevX = mouse.screenX;
    this.prevY = mouse.screenY;
    if (this.dragging)
    {
      const mov: number = GUI.rotationSpeed*this.animation.player.get_sense()
      const y_mov: number = mov*dy
      const x_move: number = mov*dx

      this.camera.pitch(y_mov, y_mov > 0)
      this.camera.rotate(Vec3.up, -x_move)
    }

    if (!this.dragging)
    {
      // convert mouse x y position to world ray
      this.mouse_ray = this.screen_to_world_ray(x, y)
    }
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
  
  public walkDir(): Vec3
  {
    // move player in xz direction
    let answer = new Vec3;
    if(this.Wdown)
      answer.add(this.camera.forward().negate()); 
    if(this.Adown)
      answer.add(this.camera.right().negate());
    if(this.Sdown)
      answer.add(this.camera.forward());
    if(this.Ddown)
      answer.add(this.camera.right());
    answer.y = 0;

    // if in creative mode, can float up or down
    if (this.animation.player.get_creative_mode())
    {
      if (this.go_up)
        answer.add(Vec3.up.copy());
      if (this.go_down)
        answer.add(Vec3.up.copy().negate());
    }
  
    answer.normalize();
    return answer;
  }

  private alt_controls(key: KeyboardEvent)
  {
    switch (key.code) 
    {
      case "KeyO": {
        this.animation.terrain_data.pers -= 0.1
        break;
      }
      case "KeyP": {
        this.animation.terrain_data.pers += 0.1
        break;
      }
      case "KeyK": {
        this.animation.terrain_data.lacu -= 0.1
        break;
      }
      case "KeyL": {
        this.animation.terrain_data.lacu += 0.1
        break;
      }
      case "KeyN": {
        this.animation.terrain_data.scale -= 1
        break;
      }
      case "KeyM": {
        this.animation.terrain_data.scale += 1
        break;
      }
      case "Equal": {
        this.animation.terrain_data.height += 1
        break;
      }
      case "Minus": {
        this.animation.terrain_data.height -= 1
        break;
      }

      case "KeyB":
      {
        // custom button to shoot a ray from the 
        // camera and draw it to the screen.
        let cam_dir : Vec3 = this.camera.forward()
        const cam_ray : Ray = new Ray(this.camera.pos(), cam_dir)
        this.animation.rr.add_ray(cam_ray, "cyan")
        
        console.log('new camera raycast: ' + cam_ray.print())
        console.log('total rays: ' + this.animation.rr.get_rays().length)
        break;
      }
      case "KeyV":
      {
        // return if mouse_ray has not been created
        if (!this.mouse_ray) return
        
        // custom button to shoot a ray from the 
        // mouse and draw it to the screen.
        // convert mouse x y position to world ray
        this.animation.rr.add_ray(this.mouse_ray, "pink")

        console.log('new mouse raycast: ' + this.mouse_ray.print())
        console.log('total rays: ' + this.animation.rr.get_rays().length)
        break;
      }

      default: break;
    }

    this.animation.update_terrain()
  }
  
  /**
   * Callback function for a key press event
   * @param key
   */
  public onKeydown(key: KeyboardEvent): void
  {
    // alt controls for dev stuff :3
    if (this.alt_pressed) { this.alt_controls(key) }

    switch (key.code) {
      case "KeyW": {
        this.Wdown = true;
        break;
      }
      case "KeyA": {
        this.Adown = true;
        break;
      }
      case "KeyS": {
        this.Sdown = true;
        break;
      }
      case "KeyD": {
        this.Ddown = true;
        break;
      }
      case "KeyR": {
        this.animation.reset();
        break;
      }
      case "Space": {
        // different depending if player in creative mode or not
        if (this.animation.player.get_creative_mode())
        {
          this.go_up = true;
        } 
        else
        {
          this.animation.player.jump()
        }  
        break;
      }
      case "ShiftLeft": {
        this.go_down = true;
        break;
      }
      case "KeyC": {
        // toggle player creative mode
        this.animation.player.toggle_creative_mode()
        this.animation.mode_ui = this.animation.player.get_creative_mode()
        break;
      }
      // DEV controls for perlin values
      case "AltLeft": {
        this.alt_pressed = true
        break;
      }
      default: {
        console.log("Key : '", key.code, "' was pressed.");
        break;
      }
    }
  }
  
  public onKeyup(key: KeyboardEvent): void {
    switch (key.code) {
      case "KeyW": {
        this.Wdown = false;
        break;
      }
      case "KeyA": {
        this.Adown = false;
        break;
      }
      case "KeyS": {
        this.Sdown = false;
        break;
      }
      case "KeyD": {
        this.Ddown = false;
        break;
      }
      case "Space": {
        this.go_up = false;
        break;
      }
      case "ShiftLeft": {
        this.go_down = false;
        break;
      }
      case "AltLeft": {
        this.alt_pressed = false
      }
    }
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
