import {
  CanvasAnimation,
  WebGLUtilities
} from "../lib/webglutils/CanvasAnimation.js";
import { GUI } from "./Gui.js";
import { MengerSponge } from "./MengerSponge.js";
import { JerusalemCube } from "./JerusalemCube.js";
import { ChessFloor } from "./ChessFloor.js";
import { mengerTests } from "./tests/MengerTests.js";
import {
  defaultFSText,
  defaultVSText,
  floorFSText,
  floorVSText
} from "./Shaders.js";
import { Mat4, Vec4 } from "../lib/TSM.js";

export interface MengerAnimationTest {
  reset(): void;
  setLevel(level: number): void;
  getGUI(): GUI;
  draw(): void;
}

export class MengerAnimation extends CanvasAnimation {
  private gui: GUI;
  
  /* The Menger sponge */
  private sponge: MengerSponge = new MengerSponge(1);

  /* Menger Sponge Rendering Info */
  private mengerVAO: WebGLVertexArrayObjectOES = -1;
  private mengerProgram: WebGLProgram = -1;

  /* Menger Buffers */
  private mengerPosBuffer: WebGLBuffer = -1;
  private mengerIndexBuffer: WebGLBuffer = -1;
  private mengerNormBuffer: WebGLBuffer = -1;

  /* Menger Attribute Locations */
  private mengerPosAttribLoc: GLint = -1;
  private mengerNormAttribLoc: GLint = -1;

  /* Menger Uniform Locations */
  private mengerWorldUniformLocation: WebGLUniformLocation = -1;
  private mengerViewUniformLocation: WebGLUniformLocation = -1;
  private mengerProjUniformLocation: WebGLUniformLocation = -1;
  private mengerLightUniformLocation: WebGLUniformLocation = -1;

  /* Global Rendering Info */
  private lightPosition: Vec4 = new Vec4();
  private backgroundColor: Vec4 = new Vec4();

  /* the chess floor */
  private floor: ChessFloor = new ChessFloor();
  
  /* ChessFloor Rendering Info */
  private chessFloorVAO: WebGLVertexArrayObjectOES = -1;
  private chessFloorProgram: WebGLProgram = -1;

  /* ChessFloor Buffers */
  private chessFloorPosBuffer: WebGLBuffer = -1;
  private chessFloorIndexBuffer: WebGLBuffer = -1;
  private chessFloorNormBuffer: WebGLBuffer = -1;

  /* ChessFloor Attribute Locations */
  private chessFloorPosAttribLoc: GLint = -1;
  private chessFloorNormAttribLoc: GLint = -1;

  /* ChessFloor Uniform Locations */
  private chessFloorWorldUniformLocation: WebGLUniformLocation = -1;
  private chessFloorViewUniformLocation: WebGLUniformLocation = -1;
  private chessFloorProjUniformLocation: WebGLUniformLocation = -1;
  private chessFloorLightUniformLocation: WebGLUniformLocation = -1;
  private chessFloorLookUniformLocation: WebGLUniformLocation = -1;



  /* The jcube sponge */
  private jcube: JerusalemCube = new JerusalemCube(1);

  /* jcube Sponge Rendering Info */
  private jcubeVAO: WebGLVertexArrayObjectOES = -1;
  private jcubeProgram: WebGLProgram = -1;

  /* jcube Buffers */
  private jcubePosBuffer: WebGLBuffer = -1;
  private jcubeIndexBuffer: WebGLBuffer = -1;
  private jcubeNormBuffer: WebGLBuffer = -1;

  /* jcube Attribute Locations */
  private jcubePosAttribLoc: GLint = -1;
  private jcubeNormAttribLoc: GLint = -1;

  /* jcube Uniform Locations */
  private jcubeWorldUniformLocation: WebGLUniformLocation = -1;
  private jcubeViewUniformLocation: WebGLUniformLocation = -1;
  private jcubeProjUniformLocation: WebGLUniformLocation = -1;
  private jcubeLightUniformLocation: WebGLUniformLocation = -1;




  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.gui = new GUI(canvas, this, this.sponge, this.jcube);

    /* Setup Animation */
    this.reset();
  }

  /**
   * Setup the animation. This can be called again to reset the animation.
   */
  public reset(): void 
  {
    /* debugger; */
    this.lightPosition = new Vec4([-10.0, 10.0, -10.0, 1.0]);
    this.backgroundColor = new Vec4([0.0, 0.37254903, 0.37254903, 1.0]);

    this.initMenger();
    this.initFloor();
    this.initJcube();

    this.gui.reset();
  }

  /**
   * Initialize the Menger sponge data structure
   */
  public initMenger(): void {
    
    this.sponge.setLevel(1);
    
    /* Alias context for syntactic convenience */
    const gl: WebGLRenderingContext = this.ctx;

    
    /* Compile Shaders */
    this.mengerProgram = WebGLUtilities.createProgram(
      gl,
      defaultVSText,
      defaultFSText
    );
    gl.useProgram(this.mengerProgram);

    /* Create VAO for Menger Sponge */
    this.mengerVAO = this.extVAO.createVertexArrayOES() as WebGLVertexArrayObjectOES;
    this.extVAO.bindVertexArrayOES(this.mengerVAO);

    /* Create and setup positions buffer*/
    // Returns a number that indicates where 'vertPosition' is in the shader program
    this.mengerPosAttribLoc = gl.getAttribLocation(
      this.mengerProgram,
      "vertPosition"
    );
    /* Ask WebGL to create a buffer */
    this.mengerPosBuffer = gl.createBuffer() as WebGLBuffer;
    /* Tell WebGL that you are operating on this buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, this.mengerPosBuffer);
    /* Fill the buffer with data */
    gl.bufferData(gl.ARRAY_BUFFER, this.sponge.positionsFlat(), gl.STATIC_DRAW);
    /* Tell WebGL how to read the buffer and where the data goes */
    gl.vertexAttribPointer(
      this.mengerPosAttribLoc /* Essentially, the destination */,
      4 /* Number of bytes per primitive */,
      gl.FLOAT /* The type of data */,
      false /* Normalize data. Should be false. */,
      4 *
        Float32Array.BYTES_PER_ELEMENT /* Number of bytes to the next element */,
      0 /* Initial offset into buffer */
    );
    /* Tell WebGL to enable to attribute */
    gl.enableVertexAttribArray(this.mengerPosAttribLoc);

    /* Create and setup normals buffer*/
    this.mengerNormAttribLoc = gl.getAttribLocation(
      this.mengerProgram,
      "aNorm"
    );
    this.mengerNormBuffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.mengerNormBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.sponge.normalsFlat(), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      this.mengerNormAttribLoc,
      4,
      gl.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(this.mengerNormAttribLoc);

    /* Create and setup index buffer*/
    this.mengerIndexBuffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mengerIndexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      this.sponge.indicesFlat(),
      gl.STATIC_DRAW
    );

    /* End VAO recording */
    this.extVAO.bindVertexArrayOES(this.mengerVAO);

    /* Get uniform locations */
    this.mengerWorldUniformLocation = gl.getUniformLocation(
      this.mengerProgram,
      "mWorld"
    ) as WebGLUniformLocation;
    this.mengerViewUniformLocation = gl.getUniformLocation(
      this.mengerProgram,
      "mView"
    ) as WebGLUniformLocation;
    this.mengerProjUniformLocation = gl.getUniformLocation(
      this.mengerProgram,
      "mProj"
    ) as WebGLUniformLocation;
    this.mengerLightUniformLocation = gl.getUniformLocation(
      this.mengerProgram,
      "lightPosition"
    ) as WebGLUniformLocation;

    /* Bind uniforms */
    gl.uniformMatrix4fv(
      this.mengerWorldUniformLocation,
      false,
      new Float32Array(this.sponge.uMatrix().all())
    );
    gl.uniformMatrix4fv(
      this.mengerViewUniformLocation,
      false,
      new Float32Array(Mat4.identity.all())
    );
    gl.uniformMatrix4fv(
      this.mengerProjUniformLocation,
      false,
      new Float32Array(Mat4.identity.all())
    );
    gl.uniform4fv(this.mengerLightUniformLocation, this.lightPosition.xyzw);
  }

  /**
   * Sets up the floor and floor drawing
   */
  public initFloor(): void 
  {
    /* Alias context for syntactic convenience */
    const gl: WebGLRenderingContext = this.ctx;

    /* Compile Shaders */
    this.chessFloorProgram = WebGLUtilities.createProgram(
      gl,
      floorVSText,
      floorFSText
    );
    gl.useProgram(this.chessFloorProgram);

    /* Create VAO for chess floor */
    this.chessFloorVAO = this.extVAO.createVertexArrayOES() as WebGLVertexArrayObjectOES;
    this.extVAO.bindVertexArrayOES(this.chessFloorVAO);

    /* Create and setup positions buffer*/
    // Returns a number that indicates where 'vertPosition' is in the shader program
    this.chessFloorPosAttribLoc = gl.getAttribLocation(
      this.chessFloorProgram,
      "vertPosition"
    );
    /* Ask WebGL to create a buffer */
    this.chessFloorPosBuffer = gl.createBuffer() as WebGLBuffer;
    /* Tell WebGL that you are operating on this buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, this.chessFloorPosBuffer);
    /* Fill the buffer with data */
    gl.bufferData(gl.ARRAY_BUFFER, this.floor.positionsFlat(), gl.STATIC_DRAW);
    /* Tell WebGL how to read the buffer and where the data goes */
    gl.vertexAttribPointer(
      this.chessFloorPosAttribLoc /* Essentially, the destination */,
      4 /* Number of bytes per primitive */,
      gl.FLOAT /* The type of data */,
      false /* Normalize data. Should be false. */,
      4 *
        Float32Array.BYTES_PER_ELEMENT /* Number of bytes to the next element */,
      0 /* Initial offset into buffer */
    );
    /* Tell WebGL to enable to attribute */
    gl.enableVertexAttribArray(this.chessFloorPosAttribLoc);

    /* Create and setup normals buffer*/
    this.chessFloorNormAttribLoc = gl.getAttribLocation(
      this.chessFloorProgram,
      "aNorm"
    );
    this.chessFloorNormBuffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.chessFloorNormBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.floor.normalsFlat(), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      this.chessFloorNormAttribLoc,
      4,
      gl.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(this.chessFloorNormAttribLoc);

    /* Create and setup index buffer*/
    this.chessFloorIndexBuffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.chessFloorIndexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      this.floor.indicesFlat(),
      gl.STATIC_DRAW
    );

    /* End VAO recording */
    this.extVAO.bindVertexArrayOES(this.chessFloorVAO);

    /* Get uniform locations */
    this.chessFloorWorldUniformLocation = gl.getUniformLocation(
      this.chessFloorProgram,
      "mWorld"
    ) as WebGLUniformLocation;
    this.chessFloorViewUniformLocation = gl.getUniformLocation(
      this.chessFloorProgram,
      "mView"
    ) as WebGLUniformLocation;
    this.chessFloorProjUniformLocation = gl.getUniformLocation(
      this.chessFloorProgram,
      "mProj"
    ) as WebGLUniformLocation;
    this.chessFloorLightUniformLocation = gl.getUniformLocation(
      this.chessFloorProgram,
      "lightPosition"
    ) as WebGLUniformLocation;
    this.chessFloorLookUniformLocation = gl.getUniformLocation(
      this.chessFloorProgram,
      "vLook"
    ) as WebGLUniformLocation;

    /* Bind uniforms */
    gl.uniformMatrix4fv(
      this.chessFloorWorldUniformLocation,
      false,
      new Float32Array(this.floor.uMatrix().all())
    );
    gl.uniformMatrix4fv(
      this.chessFloorViewUniformLocation,
      false,
      new Float32Array(Mat4.identity.all())
    );
    gl.uniformMatrix4fv(
      this.chessFloorProjUniformLocation,
      false,
      new Float32Array(Mat4.identity.all())
    );
    gl.uniform4fv(this.chessFloorLightUniformLocation, this.lightPosition.xyzw);
    gl.uniform4fv(this.chessFloorLookUniformLocation, Vec4.zero.xyzw);
  }



  /**
   * Initialize the Menger sponge data structure
   */
  public initJcube(): void {
    
    this.jcube.remove();
    
    /* Alias context for syntactic convenience */
    const gl: WebGLRenderingContext = this.ctx;

    
    /* Compile Shaders */
    this.jcubeProgram = WebGLUtilities.createProgram(
      gl,
      defaultVSText,
      defaultFSText
    );
    gl.useProgram(this.jcubeProgram);

    /* Create VAO for jcube */
    this.jcubeVAO = this.extVAO.createVertexArrayOES() as WebGLVertexArrayObjectOES;
    this.extVAO.bindVertexArrayOES(this.jcubeVAO);

    /* Create and setup positions buffer*/
    // Returns a number that indicates where 'vertPosition' is in the shader program
    this.jcubePosAttribLoc = gl.getAttribLocation(
      this.jcubeProgram,
      "vertPosition"
    );
    /* Ask WebGL to create a buffer */
    this.jcubePosBuffer = gl.createBuffer() as WebGLBuffer;
    /* Tell WebGL that you are operating on this buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, this.jcubePosBuffer);
    /* Fill the buffer with data */
    gl.bufferData(gl.ARRAY_BUFFER, this.jcube.positionsFlat(), gl.STATIC_DRAW);
    /* Tell WebGL how to read the buffer and where the data goes */
    gl.vertexAttribPointer(
      this.jcubePosAttribLoc /* Essentially, the destination */,
      4 /* Number of bytes per primitive */,
      gl.FLOAT /* The type of data */,
      false /* Normalize data. Should be false. */,
      4 *
        Float32Array.BYTES_PER_ELEMENT /* Number of bytes to the next element */,
      0 /* Initial offset into buffer */
    );
    /* Tell WebGL to enable to attribute */
    gl.enableVertexAttribArray(this.jcubePosAttribLoc);

    /* Create and setup normals buffer*/
    this.jcubeNormAttribLoc = gl.getAttribLocation(
      this.jcubeProgram,
      "aNorm"
    );
    this.jcubeNormBuffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.jcubeNormBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.jcube.normalsFlat(), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      this.jcubeNormAttribLoc,
      4,
      gl.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(this.jcubeNormAttribLoc);

    /* Create and setup index buffer*/
    this.jcubeIndexBuffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.jcubeIndexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      this.jcube.indicesFlat(),
      gl.STATIC_DRAW
    );

    /* End VAO recording */
    this.extVAO.bindVertexArrayOES(this.jcubeVAO);

    /* Get uniform locations */
    this.jcubeWorldUniformLocation = gl.getUniformLocation(
      this.jcubeProgram,
      "mWorld"
    ) as WebGLUniformLocation;
    this.jcubeViewUniformLocation = gl.getUniformLocation(
      this.jcubeProgram,
      "mView"
    ) as WebGLUniformLocation;
    this.jcubeProjUniformLocation = gl.getUniformLocation(
      this.jcubeProgram,
      "mProj"
    ) as WebGLUniformLocation;
    this.jcubeLightUniformLocation = gl.getUniformLocation(
      this.jcubeProgram,
      "lightPosition"
    ) as WebGLUniformLocation;

    /* Bind uniforms */
    gl.uniformMatrix4fv(
      this.jcubeWorldUniformLocation,
      false,
      new Float32Array(this.jcube.uMatrix().all())
    );
    gl.uniformMatrix4fv(
      this.jcubeViewUniformLocation,
      false,
      new Float32Array(Mat4.identity.all())
    );
    gl.uniformMatrix4fv(
      this.jcubeProjUniformLocation,
      false,
      new Float32Array(Mat4.identity.all())
    );
    gl.uniform4fv(this.jcubeLightUniformLocation, this.lightPosition.xyzw);
  }


  /**
   * Draws a single frame
   */
  public draw(): void {

    const gl: WebGLRenderingContext = this.ctx;

    /* Clear canvas */
    const bg: Vec4 = this.backgroundColor;
    gl.clearColor(bg.r, bg.g, bg.b, bg.a);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

    /* Menger - Update/Draw */
    const modelMatrix = this.sponge.uMatrix();
    gl.useProgram(this.mengerProgram);

    this.extVAO.bindVertexArrayOES(this.mengerVAO);

    /* Update menger buffers */
    if (this.sponge.isDirty()) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.mengerPosBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        this.sponge.positionsFlat(),
        gl.STATIC_DRAW
      );
      gl.vertexAttribPointer(
        this.mengerPosAttribLoc,
        4,
        gl.FLOAT,
        false,
        4 * Float32Array.BYTES_PER_ELEMENT,
        0
      );
      gl.enableVertexAttribArray(this.mengerPosAttribLoc);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.mengerNormBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.sponge.normalsFlat(), gl.STATIC_DRAW);
      gl.vertexAttribPointer(
        this.mengerNormAttribLoc,
        4,
        gl.FLOAT,
        false,
        4 * Float32Array.BYTES_PER_ELEMENT,
        0
      );
      gl.enableVertexAttribArray(this.mengerNormAttribLoc);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mengerIndexBuffer);
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        this.sponge.indicesFlat(),
        gl.STATIC_DRAW
      );

      this.sponge.setClean();
    }

    /* Update menger uniforms */
    gl.uniformMatrix4fv(
      this.mengerWorldUniformLocation,
      false,
      new Float32Array(modelMatrix.all())
    );
    gl.uniformMatrix4fv(
      this.mengerViewUniformLocation,
      false,
      new Float32Array(this.gui.viewMatrix().all())
    );
    gl.uniformMatrix4fv(
      this.mengerProjUniformLocation,
      false,
      new Float32Array(this.gui.projMatrix().all())
    );
	
	//console.log("Drawing ", this.sponge.indicesFlat().length, " triangles");

    /* Draw menger */
    gl.drawElements(
      gl.TRIANGLES,
      this.sponge.indicesFlat().length,
      gl.UNSIGNED_INT,
      0
    );



    // draw the floor
    /* chessFloor - Update/Draw */
    const floorModelMatrix = this.floor.uMatrix();
    gl.useProgram(this.chessFloorProgram);

    this.extVAO.bindVertexArrayOES(this.chessFloorVAO);

    /* Update chessFloor buffers */
    if (this.floor.isDirty()) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.chessFloorPosBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        this.floor.positionsFlat(),
        gl.STATIC_DRAW
      );
      gl.vertexAttribPointer(
        this.chessFloorPosAttribLoc,
        4,
        gl.FLOAT,
        false,
        4 * Float32Array.BYTES_PER_ELEMENT,
        0
      );
      gl.enableVertexAttribArray(this.chessFloorPosAttribLoc);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.chessFloorNormBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.floor.normalsFlat(), gl.STATIC_DRAW);
      gl.vertexAttribPointer(
        this.chessFloorNormAttribLoc,
        4,
        gl.FLOAT,
        false,
        4 * Float32Array.BYTES_PER_ELEMENT,
        0
      );
      gl.enableVertexAttribArray(this.chessFloorNormAttribLoc);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.chessFloorIndexBuffer);
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        this.floor.indicesFlat(),
        gl.STATIC_DRAW
      );

      this.floor.setClean();
    }

    /* Update chessFloor uniforms */
    gl.uniformMatrix4fv(
      this.chessFloorWorldUniformLocation,
      false,
      new Float32Array(floorModelMatrix.all())
    );
    gl.uniformMatrix4fv(
      this.chessFloorViewUniformLocation,
      false,
      new Float32Array(this.gui.viewMatrix().all())
    );
    gl.uniformMatrix4fv(
      this.chessFloorProjUniformLocation,
      false,
      new Float32Array(this.gui.projMatrix().all())
    );

    // set look vector
    gl.uniform4fv(
      this.chessFloorLookUniformLocation,
      new Float32Array(this.gui.camera_look().xyzw)
    );
	
	//console.log("Drawing ", this.floor.indicesFlat().length, " triangles");


    /* Draw chessFloor */
    gl.drawElements(
      gl.TRIANGLES,
      this.floor.indicesFlat().length,
      gl.UNSIGNED_INT,
      0
    );




    /* jcube - Update/Draw */
    const jcubeMatrix = this.jcube.uMatrix();
    gl.useProgram(this.jcubeProgram);

    this.extVAO.bindVertexArrayOES(this.jcubeVAO);

    /* Update jcube buffers */
    if (this.jcube.isDirty()) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.jcubePosBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        this.jcube.positionsFlat(),
        gl.STATIC_DRAW
      );
      gl.vertexAttribPointer(
        this.jcubePosAttribLoc,
        4,
        gl.FLOAT,
        false,
        4 * Float32Array.BYTES_PER_ELEMENT,
        0
      );
      gl.enableVertexAttribArray(this.jcubePosAttribLoc);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.jcubeNormBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.jcube.normalsFlat(), gl.STATIC_DRAW);
      gl.vertexAttribPointer(
        this.jcubeNormAttribLoc,
        4,
        gl.FLOAT,
        false,
        4 * Float32Array.BYTES_PER_ELEMENT,
        0
      );
      gl.enableVertexAttribArray(this.jcubeNormAttribLoc);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.jcubeIndexBuffer);
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        this.jcube.indicesFlat(),
        gl.STATIC_DRAW
      );

      this.jcube.setClean();
    }

    /* Update jcube uniforms */
    gl.uniformMatrix4fv(
      this.jcubeWorldUniformLocation,
      false,
      new Float32Array(jcubeMatrix.all())
    );
    gl.uniformMatrix4fv(
      this.jcubeViewUniformLocation,
      false,
      new Float32Array(this.gui.viewMatrix().all())
    );
    gl.uniformMatrix4fv(
      this.jcubeProjUniformLocation,
      false,
      new Float32Array(this.gui.projMatrix().all())
    );
	
	//console.log("Drawing ", this.sponge.indicesFlat().length, " triangles");

    /* Draw jcube */
    gl.drawElements(
      gl.TRIANGLES,
      this.jcube.indicesFlat().length,
      gl.UNSIGNED_INT,
      0
    );
  }

  public setLevel(level: number): void 
  {
    this.sponge.setLevel(level);
    this.jcube.setLevel(level);
  }

  public getGUI(): GUI 
  {
    return this.gui;
  }
}

export function initializeCanvas(): void {
  const canvas = document.getElementById("glCanvas") as HTMLCanvasElement;
  /* Start drawing */
  const canvasAnimation: MengerAnimation = new MengerAnimation(canvas);
  mengerTests.registerDeps(canvasAnimation);
  mengerTests.registerDeps(canvasAnimation);
  canvasAnimation.start();
}
