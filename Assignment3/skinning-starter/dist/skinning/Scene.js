import { Mat4, Vec3 } from "../lib/TSM.js";
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
        this.B_calc = false;
        this.Ti = Mat4.identity; // TODO: (does this work as intended?) this.initialTransformation
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
    apply_rotation(offset, q) {
        // update rotation
        this.rotation = q.copy().multiply(this.rotation.copy());
        // update position
        this.position = Utils.rotate_vec_using_quat(this.position.copy().subtract(offset.copy()), q.copy()).add(offset.copy());
        this.endpoint = Utils.rotate_vec_using_quat(this.endpoint.copy().subtract(offset.copy()), q.copy()).add(offset.copy());
    }
    // TODO (does this work as intended?)
    update_Ti(offset, axis, rads) {
        // update Ti mat
        this.Ti = this.Ti.copy().translate(offset.copy().negate());
        this.Ti = this.Ti.copy().rotate(rads, axis.copy());
        this.Ti = this.Ti.copy().translate(offset.copy());
    }
    // TODO (does this work as intended?)
    update_Di_Ui(D_j) {
        // update Di mat:
        // depends on if this joint is a root
        if (this.parent < 0) {
            this.Di = Mat4.identity.copy().translate(this.position.copy()).multiply(this.Ti.copy());
            this.Ui = Mat4.identity.copy().translate(this.position.copy());
        }
        else if (D_j) {
            this.Di = D_j.copy().multiply(this.Bji.copy().multiply(this.Ti.copy()));
            this.Ui = D_j.copy().multiply(this.Bji.copy());
        }
    }
    // TODO (does this work as intended?)
    calculate_Bji(parent_joint_pos) {
        this.Bji = Mat4.identity.copy().translate(this.initialPosition.copy().subtract(parent_joint_pos.copy()));
        this.B_calc = true;
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