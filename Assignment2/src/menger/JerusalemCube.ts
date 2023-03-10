import { Mat3, Mat4, Vec3, Vec4 } from "../lib/TSM.js";

/* A potential interface that students should implement */
interface IJerusalemCube {
  setLevel(level: number): void;
  isDirty(): boolean;
  setClean(): void;
  normalsFlat(): Float32Array;
  indicesFlat(): Uint32Array;
  positionsFlat(): Float32Array;
}

/**
 * Represents a Menger Sponge
 */
export class JerusalemCube implements IJerusalemCube 
{
	dirty: boolean
	cube_level: number
	cube_count: number
	vert_per_cube: number = 24;
	my_verticies: Array<number>
	my_indicies: Array<number>
	my_normals: Array<number>
  
	constructor(level: number) 
	{
		this.my_verticies = new Array<number>
		this.my_indicies = new Array<number>
		this.my_normals = new Array<number>
		this.cube_count = 0

		this.setLevel(level)
		this.dirty = true
	}

	/**
	 * Returns true if the sponge has changed.
	 */
	public isDirty(): boolean { return this.dirty }
	public setClean(): void { this.dirty = false }
	public get_level(): number { return this.cube_level }

	public remove()
	{
		// set level to 0
		this.setLevel(0)
		// clear arrays
		this.my_verticies.splice(0, this.my_verticies.length)
		this.my_indicies.splice(0, this.my_indicies.length)
		this.my_normals.splice(0, this.my_normals.length)
	}
	
	public setLevel(level: number)
	{
		if (level == this.cube_level)
			return

		this.cube_level = level
		this.cube_count = 0
		console.log("setting jerusalem cube level: " + this.cube_level)
		this.construct_cube()
		this.dirty = true
	}

	private add_cube(min_corner: Vec3, max_corner: Vec3)
	{
		//console.log("adding new cube...")

		// get cube number
		const n = this.cube_count * this.vert_per_cube
		//console.log("cube_num: " + this.cube_count)
		this.cube_count = this.cube_count + 1

		// order of cube verticies:
		const cube_verticies = new Array<number>(
			min_corner.x, min_corner.y, max_corner.z, 1.0, // 0
			min_corner.x, max_corner.y, max_corner.z, 1.0, // 1
			min_corner.x, max_corner.y, min_corner.z, 1.0, // 2
			min_corner.x, min_corner.y, min_corner.z, 1.0, // 3 -> -x face

			max_corner.x, min_corner.y, min_corner.z, 1.0, // 4
			max_corner.x, max_corner.y, min_corner.z, 1.0, // 5
			max_corner.x, max_corner.y, max_corner.z, 1.0, // 6
			max_corner.x, min_corner.y, max_corner.z, 1.0, // 7 -> +x face

			min_corner.x, min_corner.y, max_corner.z, 1.0, // 8
			min_corner.x, min_corner.y, min_corner.z, 1.0, // 9
			max_corner.x, min_corner.y, min_corner.z, 1.0, // 10
			max_corner.x, min_corner.y, max_corner.z, 1.0, // 11 -> -y face

			min_corner.x, max_corner.y, min_corner.z, 1.0, // 12
			min_corner.x, max_corner.y, max_corner.z, 1.0, // 13
			max_corner.x, max_corner.y, max_corner.z, 1.0, // 14
			max_corner.x, max_corner.y, min_corner.z, 1.0, // 15 -> +y face

			min_corner.x, min_corner.y, min_corner.z, 1.0, // 16
			min_corner.x, max_corner.y, min_corner.z, 1.0, // 17
			max_corner.x, max_corner.y, min_corner.z, 1.0, // 18
			max_corner.x, min_corner.y, min_corner.z, 1.0, // 19 -> -z face

			max_corner.x, min_corner.y, max_corner.z, 1.0, // 20      		
			max_corner.x, max_corner.y, max_corner.z, 1.0, // 21			
			min_corner.x, max_corner.y, max_corner.z, 1.0, // 22			
			min_corner.x, min_corner.y, max_corner.z, 1.0, // 23 -> +z face
		)
		
		// order of cube triangles:
		const cube_triangles = new Array<number>(
			0+n, 1+n, 2+n,
			2+n, 3+n, 0+n,		// -x face

			4+n, 5+n, 6+n,
			6+n, 7+n, 4+n,		// +x face

			8+n, 9+n, 10+n,
			10+n, 11+n, 8+n,	// -y face

			12+n, 13+n, 14+n,
			14+n, 15+n, 12+n,	// +y face

			16+n, 17+n, 18+n,
			18+n, 19+n, 16+n,	// -z face

			20+n, 21+n, 22+n,
			22+n, 23+n, 20+n,	// +z face
		)
		
		
		// normals follow order of triangles
		const cube_norms = new Array<number>(
			-1.0, +0.0, +0.0, 0.0,
			-1.0, +0.0, +0.0, 0.0,
			-1.0, +0.0, +0.0, 0.0,
			-1.0, +0.0, +0.0, 0.0,	// -x face

			+1.0, +0.0, +0.0, 0.0,
			+1.0, +0.0, +0.0, 0.0,
			+1.0, +0.0, +0.0, 0.0,
			+1.0, +0.0, +0.0, 0.0,	// +x face

			+0.0, -1.0, +0.0, 0.0,
			+0.0, -1.0, +0.0, 0.0,
			+0.0, -1.0, +0.0, 0.0,
			+0.0, -1.0, +0.0, 0.0,	// -y face

			+0.0, +1.0, +0.0, 0.0,
			+0.0, +1.0, +0.0, 0.0,
			+0.0, +1.0, +0.0, 0.0,
			+0.0, +1.0, +0.0, 0.0,	// +y face

			+0.0, +0.0, -1.0, 0.0,
			+0.0, +0.0, -1.0, 0.0,
			+0.0, +0.0, -1.0, 0.0,
			+0.0, +0.0, -1.0, 0.0,	// -z face

			+0.0, +0.0, +1.0, 0.0,
			+0.0, +0.0, +1.0, 0.0,
			+0.0, +0.0, +1.0, 0.0,
			+0.0, +0.0, +1.0, 0.0,	// +z face
		)

		// add to arrays
		for (let i = 0; i < 96; i++) this.my_verticies.push(cube_verticies[i])
		for (let i = 0; i < 36; i++) this.my_indicies.push(cube_triangles[i])
		for (let i = 0; i < 96; i++) this.my_normals.push(cube_norms[i])
	}


	private construct_cube()
	{
		// clear arrays
		this.my_verticies.splice(0, this.my_verticies.length)
		this.my_indicies.splice(0, this.my_indicies.length)
		this.my_normals.splice(0, this.my_normals.length)

		console.log("creating jerusalem cube...");

		// initial min and max corners
		const min_corner : Vec3 = new Vec3([-0.5, -0.5, -0.5])
		const max_corner : Vec3 = new Vec3([+0.5, +0.5, +0.5])
		
		// being generation sub-cubes
		this.generate_sub_cubes(min_corner, max_corner, this.cube_level)

		console.log("vertices.length: " + this.my_verticies.length)
		console.log("indicies.length: " + this.my_indicies.length)
		console.log("normals.length: " + this.my_normals.length)
		
		// console.log("vertices: " + this.my_verticies)
		// console.log("indicies: " + this.my_indicies)
		// console.log("normals: " + this.my_normals)
	}

	private generate_sub_cubes(min_corner: Vec3, max_corner: Vec3, depth: number)
	{
		// stop recurrsion when depth is less than or equal to 1
		if (depth <= 1)
		{
			this.add_cube(min_corner, max_corner)
			return;
		}
		// otherwise, continue sub-dividing cube (into 20 respective cubes)
		const s : number = (max_corner.x - min_corner.x) / 5.0;
		// level 1:
		this.mini_cube(min_corner, new Vec3([0, 0, 0]), s, depth) // cube 1
		this.mini_cube(min_corner, new Vec3([1, 0, 0]), s, depth) // cube 2
		this.mini_cube(min_corner, new Vec3([2, 0, 0]), s, depth) // cube 3
		this.mini_cube(min_corner, new Vec3([3, 0, 0]), s, depth) // cube 4
		this.mini_cube(min_corner, new Vec3([4, 0, 0]), s, depth) // cube 5

		this.mini_cube(min_corner, new Vec3([0, 0, 1]), s, depth) // cube 6
		this.mini_cube(min_corner, new Vec3([1, 0, 1]), s, depth) // cube 7
		this.mini_cube(min_corner, new Vec3([3, 0, 1]), s, depth) // cube 8
		this.mini_cube(min_corner, new Vec3([4, 0, 1]), s, depth) // cube 9

		this.mini_cube(min_corner, new Vec3([0, 0, 2]), s, depth) // cube 10
		this.mini_cube(min_corner, new Vec3([4, 0, 2]), s, depth) // cube 11

        this.mini_cube(min_corner, new Vec3([0, 0, 3]), s, depth) // cube 12
		this.mini_cube(min_corner, new Vec3([1, 0, 3]), s, depth) // cube 13
		this.mini_cube(min_corner, new Vec3([3, 0, 3]), s, depth) // cube 14
		this.mini_cube(min_corner, new Vec3([4, 0, 3]), s, depth) // cube 15

        this.mini_cube(min_corner, new Vec3([0, 0, 4]), s, depth) // cube 16
		this.mini_cube(min_corner, new Vec3([1, 0, 4]), s, depth) // cube 17
		this.mini_cube(min_corner, new Vec3([2, 0, 4]), s, depth) // cube 18
		this.mini_cube(min_corner, new Vec3([3, 0, 4]), s, depth) // cube 19
		this.mini_cube(min_corner, new Vec3([4, 0, 4]), s, depth) // cube 20
		
		// level 2:
        this.mini_cube(min_corner, new Vec3([0, 1, 0]), s, depth) // cube 21
        this.mini_cube(min_corner, new Vec3([1, 1, 0]), s, depth) // cube 22
        this.mini_cube(min_corner, new Vec3([3, 1, 0]), s, depth) // cube 23
        this.mini_cube(min_corner, new Vec3([4, 1, 0]), s, depth) // cube 24

        this.mini_cube(min_corner, new Vec3([0, 1, 1]), s, depth) // cube 25
        this.mini_cube(min_corner, new Vec3([1, 1, 1]), s, depth) // cube 26
        this.mini_cube(min_corner, new Vec3([3, 1, 1]), s, depth) // cube 27
        this.mini_cube(min_corner, new Vec3([4, 1, 1]), s, depth) // cube 28

        this.mini_cube(min_corner, new Vec3([0, 1, 3]), s, depth) // cube 29
        this.mini_cube(min_corner, new Vec3([1, 1, 3]), s, depth) // cube 30
        this.mini_cube(min_corner, new Vec3([3, 1, 3]), s, depth) // cube 31
        this.mini_cube(min_corner, new Vec3([4, 1, 3]), s, depth) // cube 32

        this.mini_cube(min_corner, new Vec3([0, 1, 4]), s, depth) // cube 33
        this.mini_cube(min_corner, new Vec3([1, 1, 4]), s, depth) // cube 34
        this.mini_cube(min_corner, new Vec3([3, 1, 4]), s, depth) // cube 35
        this.mini_cube(min_corner, new Vec3([4, 1, 4]), s, depth) // cube 36
		
		// level 3:
        this.mini_cube(min_corner, new Vec3([0, 2, 0]), s, depth) // cube 37
        this.mini_cube(min_corner, new Vec3([0, 2, 4]), s, depth) // cube 38
        this.mini_cube(min_corner, new Vec3([4, 2, 0]), s, depth) // cube 39
        this.mini_cube(min_corner, new Vec3([4, 2, 4]), s, depth) // cube 40
        
        // level 4:
        this.mini_cube(min_corner, new Vec3([0, 3, 0]), s, depth) // cube 41
        this.mini_cube(min_corner, new Vec3([1, 3, 0]), s, depth) // cube 42
        this.mini_cube(min_corner, new Vec3([3, 3, 0]), s, depth) // cube 43
        this.mini_cube(min_corner, new Vec3([4, 3, 0]), s, depth) // cube 44

        this.mini_cube(min_corner, new Vec3([0, 3, 1]), s, depth) // cube 45
        this.mini_cube(min_corner, new Vec3([1, 3, 1]), s, depth) // cube 46
        this.mini_cube(min_corner, new Vec3([3, 3, 1]), s, depth) // cube 47
        this.mini_cube(min_corner, new Vec3([4, 3, 1]), s, depth) // cube 48

        this.mini_cube(min_corner, new Vec3([0, 3, 3]), s, depth) // cube 49
        this.mini_cube(min_corner, new Vec3([1, 3, 3]), s, depth) // cube 50
        this.mini_cube(min_corner, new Vec3([3, 3, 3]), s, depth) // cube 51
        this.mini_cube(min_corner, new Vec3([4, 3, 3]), s, depth) // cube 52

        this.mini_cube(min_corner, new Vec3([0, 3, 4]), s, depth) // cube 53
        this.mini_cube(min_corner, new Vec3([1, 3, 4]), s, depth) // cube 54
        this.mini_cube(min_corner, new Vec3([3, 3, 4]), s, depth) // cube 55
        this.mini_cube(min_corner, new Vec3([4, 3, 4]), s, depth) // cube 56

        // level 5:
        this.mini_cube(min_corner, new Vec3([0, 4, 0]), s, depth) // cube 57
		this.mini_cube(min_corner, new Vec3([1, 4, 0]), s, depth) // cube 58
		this.mini_cube(min_corner, new Vec3([2, 4, 0]), s, depth) // cube 59
		this.mini_cube(min_corner, new Vec3([3, 4, 0]), s, depth) // cube 60
		this.mini_cube(min_corner, new Vec3([4, 4, 0]), s, depth) // cube 61

		this.mini_cube(min_corner, new Vec3([0, 4, 1]), s, depth) // cube 62
		this.mini_cube(min_corner, new Vec3([1, 4, 1]), s, depth) // cube 63
		this.mini_cube(min_corner, new Vec3([3, 4, 1]), s, depth) // cube 64
		this.mini_cube(min_corner, new Vec3([4, 4, 1]), s, depth) // cube 65

		this.mini_cube(min_corner, new Vec3([0, 4, 2]), s, depth) // cube 66
		this.mini_cube(min_corner, new Vec3([4, 4, 2]), s, depth) // cube 67

        this.mini_cube(min_corner, new Vec3([0, 4, 3]), s, depth) // cube 68
		this.mini_cube(min_corner, new Vec3([1, 4, 3]), s, depth) // cube 68
		this.mini_cube(min_corner, new Vec3([3, 4, 3]), s, depth) // cube 70
		this.mini_cube(min_corner, new Vec3([4, 4, 3]), s, depth) // cube 71

        this.mini_cube(min_corner, new Vec3([0, 4, 4]), s, depth) // cube 72
		this.mini_cube(min_corner, new Vec3([1, 4, 4]), s, depth) // cube 73
		this.mini_cube(min_corner, new Vec3([2, 4, 4]), s, depth) // cube 74
		this.mini_cube(min_corner, new Vec3([3, 4, 4]), s, depth) // cube 75
		this.mini_cube(min_corner, new Vec3([4, 4, 4]), s, depth) // cube 76
	}	

	private mini_cube(min_corner: Vec3, m: Vec3, s: number, depth: number)
	{
		const min_1 : Vec3 = new Vec3([min_corner.x + (s * m.x), min_corner.y + (s * m.y), min_corner.z + (s * m.z)])
		const max_1 : Vec3 = new Vec3([min_corner.x + (s * (m.x + 1)), min_corner.y + (s * (m.y + 1)), min_corner.z + (s * (m.z + 1))])
		this.generate_sub_cubes(min_1, max_1, depth - 1)
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
		// const ret : Mat4 = new Mat4([
        //     1.0,    0.0,    0.0,    0.0,
        //     0.0,    1.0,    0.0,    0.0,
        //     0.0,    0.0,    1.0,    0.0,
        //     6.0,    0.0,   -6.0,    1.0,
        // ])
		return new Mat4().setIdentity(); 
	}
}
