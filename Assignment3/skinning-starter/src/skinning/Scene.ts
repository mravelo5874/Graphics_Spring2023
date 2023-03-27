import { Mat4, Quat, Vec3, Vec4 } from "../lib/TSM.js";
import { AttributeLoader, MeshGeometryLoader, BoneLoader, MeshLoader } from "./AnimationFileLoader.js";
import { Utils } from "./Utils.js"

export class Attribute {
  values: Float32Array;
  count: number;
  itemSize: number;

  constructor(attr: AttributeLoader) {
    this.values = attr.values;
    this.count = attr.count;
    this.itemSize = attr.itemSize;
  }
}

export class MeshGeometry {
  position: Attribute;
  normal: Attribute;
  uv: Attribute | null;
  skinIndex: Attribute; // which bones affect each vertex?
  skinWeight: Attribute; // with what weight?
  v0: Attribute; // position of each vertex of the mesh *in the coordinate system of bone skinIndex[0]'s joint*. Perhaps useful for LBS.
  v1: Attribute;
  v2: Attribute;
  v3: Attribute;

  constructor(mesh: MeshGeometryLoader) 
  {
    this.position = new Attribute(mesh.position);
    this.normal = new Attribute(mesh.normal);
    if (mesh.uv) { this.uv = new Attribute(mesh.uv); }
    this.skinIndex = new Attribute(mesh.skinIndex);
    this.skinWeight = new Attribute(mesh.skinWeight);
    this.v0 = new Attribute(mesh.v0);
    this.v1 = new Attribute(mesh.v1);
    this.v2 = new Attribute(mesh.v2);
    this.v3 = new Attribute(mesh.v3);
  }
}

export class Bone 
{
  public parent: number;
  public children: number[];

  public position: Vec3; // current position of the bone's joint *in world coordinates*. Used by the provided skeleton shader, so you need to keep this up to date.
  public endpoint: Vec3; // current position of the bone's second (non-joint) endpoint, in world coordinates
  public rotation: Quat; // current orientation of the joint *with respect to world coordinates*
  
  public initialPosition: Vec3; // position of the bone's joint *in world coordinates*
  public initialEndpoint: Vec3; // position of the bone's second (non-joint) endpoint, in world coordinates

  public offset: number; // used when parsing the Collada file---you probably don't need to touch these
  public initialTransformation: Mat4;

  public length : number; // length of bone
  public id : number;
  public B_calc : boolean; // has the Bji mat been calculated yet?

  // importants matrices
  public Ti : Mat4;
  public Di : Mat4;
  public Ui : Mat4;
  public Bji : Mat4;

  constructor(bone: BoneLoader) 
  {
    this.parent = bone.parent;
    this.children = Array.from(bone.children);
    this.position = bone.position.copy();
    this.endpoint = bone.endpoint.copy();
    this.rotation = bone.rotation.copy();
    this.offset = bone.offset;
    this.initialPosition = bone.initialPosition.copy();
    this.initialEndpoint = bone.initialEndpoint.copy();
    this.initialTransformation = bone.initialTransformation.copy();
    this.length = Vec3.distance(this.initialPosition.copy(), this.initialEndpoint.copy())
    this.id = bone.id
    this.B_calc = false

    this.Ti = Mat4.identity // TODO: (does this work as intended?) this.initialTransformation
    // this.update_Di_Ui()


    // console.log('[BONE] id: ' + this.id + 
    // '\nparent: ' + this.parent +
    // '\nchildren: ' + this.children +
    // '\ninit_pos: ' + Utils.vec3_toFixed(this.initialPosition) + 
    // '\ninit_end: ' + Utils.vec3_toFixed(this.initialEndpoint) + 
    // '\npos: ' + Utils.vec3_toFixed(this.position) + 
    // '\nend: ' + Utils.vec3_toFixed(this.endpoint) + 
    // '\nrot: ' + Utils.quat_toFixed(this.rotation) + 
    // '\ninit_trans: ' + Utils.mat4_toFixed(this.initialTransformation))
  }

  // updates the rotation and position / endpoint
  public apply_rotation(offset : Vec3, q : Quat) : void
  {
    // update rotation
    this.rotation = q.copy().multiply(this.rotation.copy())

    // update position
    this.position = Utils.rotate_vec_using_quat(this.position.copy().subtract(offset.copy()), q.copy()).add(offset.copy())
    this.endpoint = Utils.rotate_vec_using_quat(this.endpoint.copy().subtract(offset.copy()), q.copy()).add(offset.copy())
  }

  // TODO (does this work as intended?)
  public update_Ti(offset : Vec3, axis : Vec3, rads : number) : void
  {
    // update Ti mat
    this.Ti = this.Ti.copy().translate(offset.copy().negate())
    this.Ti = this.Ti.copy().rotate(rads, axis.copy())
    this.Ti = this.Ti.copy().translate(offset.copy())
  }

  // TODO (does this work as intended?)
  public update_Di_Ui(D_j? : Mat4) : void
  {
    // update Di mat:
    // depends on if this joint is a root
    if (this.parent < 0)
    {
      this.Di = Mat4.identity.copy().translate(this.position.copy()).multiply(this.Ti.copy())
      this.Ui = Mat4.identity.copy().translate(this.position.copy())
    }
    else if (D_j)
    {
      this.Di = D_j.copy().multiply(this.Bji.copy().multiply(this.Ti.copy()))
      this.Ui = D_j.copy().multiply(this.Bji.copy())
    }
  }

  // TODO (does this work as intended?)
  public calculate_Bji(parent_joint_pos : Vec3) : void
  {
    this.Bji = Mat4.identity.copy().translate(this.initialPosition.copy().subtract(parent_joint_pos.copy()))
    
    this.B_calc = true
  }
}

export class Mesh 
{
  public geometry: MeshGeometry;
  public worldMatrix: Mat4; // in this project all meshes and rigs have been transformed into world coordinates for you
  public rotation: Vec3;
  public bones: Bone[];
  public materialName: string;
  public imgSrc: String | null;

  private boneIndices: number[];
  private bonePositions: Float32Array;
  private boneIndexAttribute: Float32Array;


  constructor(mesh: MeshLoader) 
  {
    this.geometry = new MeshGeometry(mesh.geometry);
    this.worldMatrix = mesh.worldMatrix.copy();
    this.rotation = mesh.rotation.copy();
    this.bones = [];
    mesh.bones.forEach(bone => {
      this.bones.push(new Bone(bone));
    });
    this.materialName = mesh.materialName;
    this.imgSrc = null;
    this.boneIndices = Array.from(mesh.boneIndices);
    this.bonePositions = new Float32Array(mesh.bonePositions);
    this.boneIndexAttribute = new Float32Array(mesh.boneIndexAttribute);
  }

  public getBoneIndices(): Uint32Array 
  {
    return new Uint32Array(this.boneIndices);
  }

  public getBonePositions(): Float32Array 
  {
    return this.bonePositions;
  }

  public getBoneIndexAttribute(): Float32Array
  {
    return this.boneIndexAttribute;
  }

  public getBoneTranslations(): Float32Array {
    let trans = new Float32Array(3 * this.bones.length);
    this.bones.forEach((bone, index) => {
      let res = bone.position.xyz;
      for (let i = 0; i < res.length; i++) {
        trans[3 * index + i] = res[i];
      }
    });
    return trans;
  }

  public getBoneRotations(): Float32Array {
    let trans = new Float32Array(4 * this.bones.length);
    this.bones.forEach((bone, index) => {
      let res = bone.rotation.xyzw;
      for (let i = 0; i < res.length; i++) {
        trans[4 * index + i] = res[i];
      }
    });
    return trans;
  }
}