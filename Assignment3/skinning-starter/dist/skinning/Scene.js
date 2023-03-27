import { Vec3 } from "../lib/TSM.js";
import { Utils } from "./Utils.js";
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
        this.id = bone.id;
        this.Ti;
        console.log('[BONE] id: ' + this.id +
            '\nparent: ' + this.parent +
            '\nchildren: ' + this.children +
            '\ninit_pos: ' + Utils.vec3_toFixed(this.initialPosition) +
            '\ninit_end: ' + Utils.vec3_toFixed(this.initialEndpoint) +
            '\npos: ' + Utils.vec3_toFixed(this.position) +
            '\nend: ' + Utils.vec3_toFixed(this.endpoint) +
            '\nrot: ' + Utils.quat_toFixed(this.rotation) +
            '\ninit_trans: ' + Utils.mat4_toFixed(this.initialTransformation));
    }
    // this should update the bone's current position, endpoint, and rotation
    apply_rotation(offset, q) {
        // update rotation
        this.rotation = q.copy().multiply(this.rotation.copy());
        // update position
        this.position = Utils.rotate_vec_using_quat(this.position.copy().subtract(offset.copy()), q.copy()).add(offset.copy());
        this.endpoint = Utils.rotate_vec_using_quat(this.endpoint.copy().subtract(offset.copy()), q.copy()).add(offset.copy());
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