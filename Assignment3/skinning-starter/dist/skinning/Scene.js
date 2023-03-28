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
        // console.log('v0[' + this.v0.count + ']: ' + Utils.attribute_toFixed(this.v0, this.v0.count) + 
        // ', v1[' + this.v1.count + ']: ' + Utils.attribute_toFixed(this.v1, this.v1.count) + 
        // ', v2[' + this.v2.count + ']: ' + Utils.attribute_toFixed(this.v2, this.v2.count) + 
        // ', v3[' + this.v3.count + ']: ' + Utils.attribute_toFixed(this.v3, this.v3.count))
        // console.log('skin_index[' + this.skinIndex.count + ']: ' + Utils.attribute_toFixed(this.skinIndex, this.skinIndex.count))
        // console.log('skin_weight[' + this.skinWeight.count + ']: ' + Utils.attribute_toFixed(this.skinWeight, this.skinWeight.count))
    }
}
export class Bone {
    is_root() { return this.parent < 0; }
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
        // this.Ti = Mat4.identity
        // this.Di = Mat4.identity
        // this.Ui = Mat4.identity
        // this.Bji = Mat4.identity
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
    // TODO (does this work as intended?)
    recurse_init_bone(parent_world_pos, parent_Di_mat, scene) {
        console.log('init bone: ' + this.id);
        // init Ti as identity
        this.Ti = Mat4.identity.copy();
        // create Bji mat (maps from parent coords -> this join coords in rest pose)
        this.Bji = Mat4.identity.copy().translate(this.position.copy().subtract(parent_world_pos.copy()));
        // different inits if root joint
        if (this.is_root()) {
            this.Di = Mat4.identity.copy().translate(this.position.copy()).multiply(this.Ti.copy());
            this.Ui = Mat4.identity.copy().translate(this.position.copy()).multiply(Mat4.identity.copy());
        }
        else {
            this.Di = parent_Di_mat.copy().multiply(this.Bji.copy().multiply(this.Ti.copy()));
            this.Ui = parent_Di_mat.copy().multiply(this.Bji.copy().multiply(Mat4.identity.copy()));
        }
        // recurse to all children
        for (let i = 0; i < this.children.length; i++) {
            scene.meshes[0].bones[this.children[i]].recurse_init_bone(this.position.copy(), this.Di.copy(), scene);
        }
    }
    // updates the rotation and position / endpoint
    apply_rotation(offset, q) {
        // update rotation
        this.rotation = q.copy().multiply(this.rotation.copy());
        // update position + endpoint
        this.position = Utils.rotate_vec_using_quat(this.position.copy().subtract(offset.copy()), q.copy()).add(offset.copy());
        this.endpoint = Utils.rotate_vec_using_quat(this.endpoint.copy().subtract(offset.copy()), q.copy()).add(offset.copy());
    }
    // TODO (does this work as intended?)
    update_Ti(offset, axis, rads) {
        //this.Ti = this.Ti.copy().translate(offset.copy().negate())
        this.Ti = this.Ti.copy().rotate(rads, axis.copy());
        //this.Ti = this.Ti.copy().translate(offset.copy())
    }
    // TODO (does this work as intended?)
    update_Di_Ui(scene) {
        // update Di mat:
        // depends on if this joint is a root
        if (this.is_root()) {
            this.Di = Mat4.identity.copy().translate(this.position.copy()).multiply(this.Ti.copy());
            this.Ui = Mat4.identity.copy().translate(this.position.copy());
        }
        else {
            const parent_Di_mat = scene.meshes[0].bones[this.parent].Di.copy();
            this.Di = parent_Di_mat.copy().multiply(this.Bji.copy().multiply(this.Ti.copy()));
            this.Ui = parent_Di_mat.copy().multiply(this.Bji.copy());
        }
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
    init_bones(scene) {
        for (let i = 0; i < this.bones.length; i++) {
            if (this.bones[i].is_root()) {
                this.bones[i].recurse_init_bone(Vec3.zero.copy(), Mat4.identity.copy(), scene);
            }
        }
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
    get_D_mats() {
        // create number array
        let D_mats = new Array();
        // for each bone
        for (let i = 0; i < this.bones.length; i++) {
            // add each D mat element in order
            const bone_Di = this.bones[i].Di.copy().all();
            for (let j = 0; j < 16; j++) {
                D_mats.push(bone_Di[j]);
            }
        }
        return new Float32Array(D_mats);
    }
    get_U_mats() {
        // create number array
        let U_mats = new Array();
        // for each bone
        for (let i = 0; i < this.bones.length; i++) {
            // add each U mat element in order
            const bone_Ui = this.bones[i].Ui.copy().inverse().all();
            for (let j = 0; j < 16; j++) {
                U_mats.push(bone_Ui[j]);
            }
        }
        return new Float32Array(U_mats);
    }
}
//# sourceMappingURL=Scene.js.map