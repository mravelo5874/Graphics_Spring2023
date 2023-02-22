import { Mat3, Mat4, Vec3, Vec4 } from "../lib/TSM.js";

/* A potential interface that students should implement */
interface IChessFloor 
{
    isDirty(): boolean;
    setClean(): void;
    normalsFlat(): Float32Array;
    indicesFlat(): Uint32Array;
    positionsFlat(): Float32Array;
}

export class ChessFloor implements IChessFloor 
{
    dirty : boolean
    my_verticies: Array<number>
	my_indicies: Array<number>
	my_normals: Array<number>

    constructor() 
	{   
        this.my_verticies = new Array<number>
		this.my_indicies = new Array<number>
		this.my_normals = new Array<number>
        this.dirty = true

        this.create_floor()
    }

    public isDirty(): boolean { return this.dirty }
	public setClean(): void { this.dirty = false }

    private create_floor()
    {
        const floor_verticies = new Array<number>(
			-0.5, +0.0, -0.5, 1.0, // 0
			-0.5, +0.0, +0.5, 1.0, // 1
			+0.5, +0.0, +0.5, 1.0, // 2
			+0.5, +0.0, -0.5, 1.0, // 3
		)
		
		// order of cube triangles:
		const floor_triangles = new Array<number>(
			0, 1, 3,
            3, 1, 2,
		)
		
		
		// normals follow order of triangles
		const floor_norms = new Array<number>(
			+0.0, +1.0, +0.0, 0.0,
			+0.0, +1.0, +0.0, 0.0,
			+0.0, +1.0, +0.0, 0.0,
			+0.0, +1.0, +0.0, 0.0,
		)

		// add to arrays
		this.my_verticies = this.my_verticies.concat(floor_verticies)
		this.my_indicies = this.my_indicies.concat(floor_triangles)
		this.my_normals = this.my_normals.concat(floor_norms)
    }

    /* Returns a flat Float32Array of the sponge's vertex positions */
	public positionsFlat(): Float32Array 
	{
		//console.log("vertices: " + this.my_verticies.length);
		return new Float32Array(this.my_verticies); // new Float32Array([1.0, 0.0, 0.0, 1.0, -1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0]);
	}

	/**
	 * Returns a flat Uint32Array of the sponge's face indices
	 */
	public indicesFlat(): Uint32Array 
	{
		//console.log("indicies: " + this.my_indicies.length);
		return new Uint32Array(this.my_indicies); // new Uint32Array([0, 1, 2]);
	}

	/**
	 * Returns a flat Float32Array of the sponge's normals
	 */
	public normalsFlat(): Float32Array 
	{
		//console.log("normals: " + this.my_normals.length);
		return new Float32Array(this.my_normals); // new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0]);
	}

	/**
	 * Returns the model matrix of the sponge
	 */
	public uMatrix(): Mat4 
	{
		const ret : Mat4 = new Mat4([
            1000.0, 0.0,    0.0,    0.0,
            0.0,    1000.0, 0.0,    0.0,
            0.0,    0.0,    1000.0, 0.0,
            0.0,   -2.0,    0.0,    1.0,
        ])
		return ret;   
	}
}