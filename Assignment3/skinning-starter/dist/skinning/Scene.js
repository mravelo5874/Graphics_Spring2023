import { Vec3, Vec4 } from "../lib/TSM.js";
export class Attribute {
    constructor(attr) {
        this.values = attr.values;
        this.count = attr.count;
        this.itemSize = attr.itemSize;
    }
}
export class MeshGeometry {
    constructor(mesh) {
        this.position = new Attribute(mesh.position);
        this.normal = new Attribute(mesh.normal);
        if (mesh.uv) {
            this.uv = new Attribute(mesh.uv);
        }
        this.skinIndex = new Attribute(mesh.skinIndex);
        this.skinWeight = new Attribute(mesh.skinWeight);
        this.v0 = new Attribute(mesh.v0);
        this.v1 = new Attribute(mesh.v1);
        this.v2 = new Attribute(mesh.v2);
        this.v3 = new Attribute(mesh.v3);
    }
}
export class Bone {
    constructor(bone) {
        this.parent = bone.parent;
        this.children = Array.from(bone.children);
        this.position = bone.position.copy();
        this.endpoint = bone.endpoint.copy();
        this.rotation = bone.rotation.copy();
        this.offset = bone.offset;
        this.initialPosition = bone.initialPosition.copy();
        this.initialEndpoint = bone.initialEndpoint.copy();
        this.initialTransformation = bone.initialTransformation.copy();
        this.length = Vec3.distance(this.initialPosition.copy(), this.initialEndpoint.copy());
    }
    // this should update the bone's current position, endpoint, and rotation
    apply_rotation(offset, q) {
        // update rotation
        const new_rot = this.rotation.copy().multiply(q.copy());
        this.rotation = new_rot.copy();
        // TODO fix this
        const quat = new Vec4(q.xyzw);
        // const pos0 : Vec3 = Vec3.zero.copy()
        // const end0 : Vec3 = new Vec3([this.initialEndpoint.x - this.initialPosition.x, this.initialEndpoint.y - this.initialPosition.y, this.initialEndpoint.z - this.initialPosition.z])
        // const pos_new : Vec3 = Utils.apply_quaternion(quat.copy(), pos0.copy()).add(this.position.copy())
        // const end_new : Vec3 = Utils.apply_quaternion(quat.copy(), end0.copy()).add(this.position.copy())
        // this.position = pos_new.copy()
        // this.endpoint = end_new.copy()
        let new_pos = this.position.copy().add(offset.copy()).multiplyByQuat(q.copy()).subtract(offset.copy());
        let new_end = this.endpoint.copy().add(offset.copy()).multiplyByQuat(q.copy()).subtract(offset.copy());
        // new_pos = new_pos.copy().subtract(offset.copy())
        // new_end = new_end.copy().subtract(offset.copy())
        this.position = new_pos.copy();
        this.endpoint = new_end.copy();
    }
}
export class Mesh {
    constructor(mesh) {
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
    getBoneIndices() {
        return new Uint32Array(this.boneIndices);
    }
    getBonePositions() {
        return this.bonePositions;
    }
    getBoneIndexAttribute() {
        return this.boneIndexAttribute;
    }
    getBoneTranslations() {
        let trans = new Float32Array(3 * this.bones.length);
        this.bones.forEach((bone, index) => {
            let res = bone.position.xyz;
            for (let i = 0; i < res.length; i++) {
                trans[3 * index + i] = res[i];
            }
        });
        return trans;
    }
    getBoneRotations() {
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
//# sourceMappingURL=Scene.js.map