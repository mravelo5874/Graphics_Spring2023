import { ColladaLoader } from "../lib/threejs/examples/jsm/loaders/ColladaLoader.js";
import { Vec3 } from "../lib/tsm/Vec3.js";
import { Mat4, Vec4 } from "../lib/TSM.js";
import { Quat } from "../lib/tsm/Quat.js";
import { Mesh } from "../skinning/Scene.js";
import { Utils } from "./Utils.js";
import { RaycastRenderer } from "./RaycastRenderer.js";
import { Hex } from "./Hex.js";
import { Cylinder } from "./Cylinder.js";
export class AttributeLoader {
    constructor(values, count, itemSize) {
        this.values = values;
        this.count = count;
        this.itemSize = itemSize;
    }
}
export class MeshGeometryLoader {
    constructor(geometry, wMat) {
        let gPosition = geometry.attributes.position;
        this.position = new AttributeLoader(gPosition.array, gPosition.count, gPosition.itemSize);
        let gNormal = geometry.attributes.normal;
        this.normal = new AttributeLoader(gNormal.array, gNormal.count, gNormal.itemSize);
        if (geometry.attributes.uv) {
            let gUV = geometry.attributes.uv;
            this.uv = new AttributeLoader(gUV.array, gUV.count, gUV.itemSize);
        }
        else {
            this.uv = null;
        }
        let gSkinIndex = geometry.attributes.skinIndex;
        this.skinIndex = new AttributeLoader(gSkinIndex.array, gSkinIndex.count, gSkinIndex.itemSize);
        let gSkinWeight = geometry.attributes.skinWeight;
        this.skinWeight = new AttributeLoader(gSkinWeight.array, gSkinWeight.count, gSkinWeight.itemSize);
        this.v0 = new AttributeLoader(new Float32Array(gPosition.array.length), gPosition.count, 4);
        this.v1 = new AttributeLoader(new Float32Array(gPosition.array.length), gPosition.count, 4);
        this.v2 = new AttributeLoader(new Float32Array(gPosition.array.length), gPosition.count, 4);
        this.v3 = new AttributeLoader(new Float32Array(gPosition.array.length), gPosition.count, 4);
        for (let i = 0; i < gPosition.count; i++) {
            let pos = this.position.values.slice(i * 3, i * 3 + 3);
            let vPos = new Vec3([pos[0], pos[1], pos[2]]);
            vPos = wMat.multiplyPt3(vPos);
            this.position.values[i * 3] = vPos.x;
            this.position.values[i * 3 + 1] = vPos.y;
            this.position.values[i * 3 + 2] = vPos.z;
            let normals = this.normal.values.slice(i * 3, i * 3 + 3);
            let vNorm = new Vec3([normals[0], normals[1], normals[2]]);
            vNorm = wMat.multiplyVec3(vNorm);
            this.normal.values[i * 3] = vNorm.x;
            this.normal.values[i * 3 + 1] = vNorm.y;
            this.normal.values[i * 3 + 2] = vNorm.z;
        }
    }
    setVectorOffsets(bones) {
        for (let i = 0; i < this.position.count; i++) {
            let bonePos = new Vec3();
            let pos = this.position.values.slice(i * 3, i * 3 + 3);
            let vertexPos = new Vec3([pos[0], pos[1], pos[2]]);
            bonePos = bones[this.skinIndex.values[i * 4 + 0]].position.copy();
            Vec3.difference(vertexPos, bonePos, bonePos);
            this.v0.values[i * 3] = bonePos.x;
            this.v0.values[i * 3 + 1] = bonePos.y;
            this.v0.values[i * 3 + 2] = bonePos.z;
            this.v0.values[i * 3 + 3] = 0;
            bonePos = bones[this.skinIndex.values[i * 4 + 1]].position.copy();
            Vec3.difference(vertexPos, bonePos, bonePos);
            this.v1.values[i * 3] = bonePos.x;
            this.v1.values[i * 3 + 1] = bonePos.y;
            this.v1.values[i * 3 + 2] = bonePos.z;
            this.v1.values[i * 3 + 3] = 0;
            bonePos = bones[this.skinIndex.values[i * 4 + 2]].position.copy();
            Vec3.difference(vertexPos, bonePos, bonePos);
            this.v2.values[i * 3] = bonePos.x;
            this.v2.values[i * 3 + 1] = bonePos.y;
            this.v2.values[i * 3 + 2] = bonePos.z;
            this.v2.values[i * 3 + 3] = 0;
            bonePos = bones[this.skinIndex.values[i * 4 + 3]].position.copy();
            Vec3.difference(vertexPos, bonePos, bonePos);
            this.v3.values[i * 3] = bonePos.x;
            this.v3.values[i * 3 + 1] = bonePos.y;
            this.v3.values[i * 3 + 2] = bonePos.z;
            this.v3.values[i * 3 + 3] = 0;
        }
    }
}
export class BoneLoader {
    constructor(parentId, childrenIds, offset, wmat, _id) {
        this.parent = parentId;
        this.children = childrenIds;
        this.position = wmat.multiplyPt3(new Vec3([0, 0, 0]));
        this.initialPosition = this.position.copy();
        this.endpoint = wmat.multiplyPt3(new Vec3([0, offset, 0]));
        this.initialEndpoint = this.endpoint.copy();
        this.rotation = new Quat().setIdentity();
        this.offset = offset;
        this.initialTransformation = wmat.copy();
        this.id = _id;
    }
}
export class MeshLoader {
    constructor(skinnedMesh) {
        this.name = skinnedMesh.name;
        let x = skinnedMesh.rotation.x;
        let y = skinnedMesh.rotation.y;
        let z = skinnedMesh.rotation.z;
        this.rotation = new Vec3([x, y, z]);
        let rotMat = new Mat4().setIdentity();
        rotMat.rotate(x, new Vec3([1, 0, 0]));
        rotMat.rotate(y, new Vec3([0, 1, 0]));
        rotMat.rotate(z, new Vec3([0, 0, 1]));
        rotMat = rotMat.multiply(new Mat4(skinnedMesh.bindMatrix.elements));
        this.worldMatrix = rotMat;
        this.geometry = new MeshGeometryLoader(skinnedMesh.geometry, this.worldMatrix);
        this.bones = [];
        this.boneIndices = [];
        this.bonePositions = new Float32Array([]);
        this.boneIndexAttribute = new Float32Array([]);
        let material = skinnedMesh.material;
        this.materialName = material.name;
        let i = 0;
        skinnedMesh.skeleton.bones.forEach(bone => {
            var _a, _b, _c;
            if (bone.rotation.order !== "XYZ") {
                console.error("BONE ORDER NOT XYZ");
            }
            let parentId = -1;
            if (((_a = bone.parent) === null || _a === void 0 ? void 0 : _a.type) !== 'SkinnedMesh') {
                let uuid = "";
                if ((_b = bone.parent) === null || _b === void 0 ? void 0 : _b.uuid) {
                    uuid = (_c = bone.parent) === null || _c === void 0 ? void 0 : _c.uuid;
                }
                for (let i = 0; i < skinnedMesh.skeleton.bones.length; i++) {
                    if (skinnedMesh.skeleton.bones[i].uuid === uuid) {
                        parentId = i;
                    }
                }
            }
            let children = [];
            bone.children.forEach(child => {
                let uuid = child.uuid;
                for (let i = 0; i < skinnedMesh.skeleton.bones.length; i++) {
                    if (skinnedMesh.skeleton.bones[i].uuid === uuid) {
                        children.push(i);
                    }
                }
            });
            let tMat = bone.matrixWorld.clone();
            let tempMat = new Mat4(tMat.elements);
            let yVal = 1;
            if (children.length > 0) {
                yVal = skinnedMesh.skeleton.bones[children[0]].position.y;
            }
            this.bones.push(new BoneLoader(parentId, children, yVal, tempMat, i));
            i++;
        });
        if (this.bones.length > 0) {
            this.initialize();
            this.geometry.setVectorOffsets(this.bones);
        }
    }
    initialize() {
        this.boneIndices = [];
        this.bonePositions = new Float32Array(6 * this.bones.length);
        this.boneIndexAttribute = new Float32Array(2 * this.bones.length);
        this.bones.forEach((bone, index) => {
            this.boneIndices.push(2 * index);
            this.boneIndices.push(2 * index + 1);
            this.boneIndexAttribute[2 * index] = index;
            this.boneIndexAttribute[2 * index + 1] = index;
            this.bonePositions[index * 6] = 0;
            this.bonePositions[index * 6 + 1] = 0;
            this.bonePositions[index * 6 + 2] = 0;
            this.bonePositions[index * 6 + 3] = bone.initialEndpoint.x - bone.initialPosition.x;
            this.bonePositions[index * 6 + 4] = bone.initialEndpoint.y - bone.initialPosition.y;
            this.bonePositions[index * 6 + 5] = bone.initialEndpoint.z - bone.initialPosition.z;
        });
    }
}
class CLoader {
    constructor(location) {
        this.is_loaded = false;
        this.fileLocation = location;
        this.loader = new ColladaLoader();
        this.scene = null;
        this.skinnedMeshes = [];
        this.meshes = [];
        this.rr = new RaycastRenderer();
        this.hex = new Hex();
    }
    load(callback) {
        this.loader.load(this.fileLocation, (collada) => {
            console.log("File loaded successfully");
            collada.scene.updateWorldMatrix(true, true);
            console.log(collada);
            this.scene = collada.scene;
            this.findSkinnedMeshes();
            this.skinnedMeshes.forEach(m => {
                this.meshes.push(new Mesh(new MeshLoader(m)));
            });
            // getting the images
            let lib = collada.library;
            let mats = lib.materials;
            let imgs = lib.images;
            let effects = lib.effects;
            let matToTexture = new Map();
            for (let property in effects) {
                let matName = "";
                for (let matProp in mats) {
                    if (mats[matProp].url === property) {
                        matName = mats[matProp].name;
                        break;
                    }
                }
                let imgName = "";
                for (let imgProp in effects[property].profile.surfaces) {
                    imgName = effects[property].profile.surfaces[imgProp].init_from;
                }
                let imgSrc = "";
                for (let imgProp in imgs) {
                    if (imgName === imgProp) {
                        imgSrc = imgs[imgProp].init_from;
                        break;
                    }
                }
                if (imgSrc === "" || !imgSrc) {
                    console.log("Image source not found");
                }
                else {
                    matToTexture.set(matName, imgSrc);
                }
                this.meshes.forEach(mesh => {
                    let imgSrc = matToTexture.get(mesh.materialName);
                    if (imgSrc) {
                        mesh.imgSrc = imgSrc;
                    }
                });
            }
            callback();
        }, undefined, (event) => {
            console.error("Loading collada file failed");
            console.error(event);
        });
        this.is_loaded = true;
    }
    findSkinnedMeshes(element) {
        if (this.scene == null) {
            console.error('Error loading scene');
            throw new Error('Scene was null when finding skinned meshes');
        }
        let objArr;
        if (element) {
            objArr = element.children;
        }
        else {
            objArr = this.scene.children;
        }
        objArr.forEach(child => {
            if (element) {
                child.rotateX(element.rotation.x);
                child.rotateY(element.rotation.y);
                child.rotateZ(element.rotation.z);
            }
            else if (this.scene) {
                child.rotateX(this.scene.rotation.x);
                child.rotateY(this.scene.rotation.y);
                child.rotateZ(this.scene.rotation.z);
            }
            if (child.type === 'SkinnedMesh') {
                this.skinnedMeshes.push(child);
            }
            else {
                this.findSkinnedMeshes(child);
            }
        });
    }
    create_cylinder(id) {
        const bone_pos = this.meshes[0].getBonePositions();
        const bone_rot = this.meshes[0].getBoneRotations();
        const bone_tra = this.meshes[0].getBoneTranslations();
        const b = id * 6;
        const q = id * 4;
        const t = id * 3;
        const a = id * 2;
        const pos0 = new Vec3([bone_pos[b], bone_pos[b + 1], bone_pos[b + 2]]);
        const pos1 = new Vec3([bone_pos[b + 3], bone_pos[b + 4], bone_pos[b + 5]]);
        // apply rotation and translation
        const quat = new Vec4([bone_rot[q], bone_rot[q + 1], bone_rot[q + 2], bone_rot[q + 3]]);
        const tran = new Vec3([bone_tra[t], bone_tra[t + 1], bone_tra[t + 2]]);
        const pos0_new = Utils.apply_quaternion(quat, pos0).add(tran);
        const pos1_new = Utils.apply_quaternion(quat, pos1).add(tran);
        return new Cylinder(id, pos0_new, pos1_new);
    }
    create_cylinders() {
        const cylinders = new Array;
        const num_bones = this.meshes[0].getBonePositions().length / 2;
        const bone_pos = this.meshes[0].getBonePositions();
        const bone_rot = this.meshes[0].getBoneRotations();
        const bone_tra = this.meshes[0].getBoneTranslations();
        const bone_atr = this.meshes[0].getBoneIndexAttribute();
        // console.log('[CYLS]:\n' + 
        // '\tnum_bones: ' + num_bones + '\n' + 
        // '\tbone_pos:' + bone_pos + '\n' + 
        // '\tbone_rot:' + bone_rot + '\n' +
        // '\tbone_tra: ' + bone_tra + '\n' +
        // '\tbone_atr: ' + bone_atr)
        let b = 0;
        let q = 0;
        let t = 0;
        let a = 0;
        for (let j = 0; j < num_bones; j++) {
            const pos0 = new Vec3([bone_pos[b], bone_pos[b + 1], bone_pos[b + 2]]);
            const pos1 = new Vec3([bone_pos[b + 3], bone_pos[b + 4], bone_pos[b + 5]]);
            // apply rotation and translation
            const quat = new Vec4([bone_rot[q], bone_rot[q + 1], bone_rot[q + 2], bone_rot[q + 3]]);
            const tran = new Vec3([bone_tra[t], bone_tra[t + 1], bone_tra[t + 2]]);
            const pos0_new = Utils.apply_quaternion(quat, pos0).add(tran);
            const pos1_new = Utils.apply_quaternion(quat, pos1).add(tran);
            const id = bone_atr[a];
            b += 6;
            q += 4;
            t += 3;
            a += 2;
            cylinders.push(new Cylinder(id, pos0_new, pos1_new));
        }
        return cylinders;
    }
}
export { CLoader as CLoader, };
//# sourceMappingURL=AnimationFileLoader.js.map