import { Vec3 } from "../lib/TSM.js";
import { Util } from "./Utils.js";
export class BoneRotator {
    static rotate_bone(scene, id, dx, camera_ray) {
        const axis = camera_ray.get_direction().normalize();
        // get bone
        const bone = scene.meshes[0].bones[id];
        // rotate bone using dx
        const rads = -dx * this.rotate_scale;
        const new_rot = Util.create_quaternion_from_axis_and_angle(axis.copy(), rads).multiply(bone.rotation.copy());
        // update bone and hex
        const new_end = new_rot.copy().multiplyVec3(bone.endpoint.copy());
        scene.meshes[0].bones[id].update_bone(bone.position.copy(), new_end.copy(), new_rot.copy());
        // TODO update hex correctly and with no lag (maybe precompute hex verticies?)
        // scene.hex.set(bone.position.copy(), new_end.copy(), id, true)
        // TODO recurssively update children
        this.update_children(bone, new_rot.copy(), scene);
    }
    static update_children(bone, new_rot, scene) {
        const children = bone.children;
        children.forEach(i => {
            const child_bone = scene.meshes[0].bones[i];
            const child_rot = new_rot.copy().multiply(child_bone.rotation.copy());
            const child_pos = child_bone.position.copy().multiplyByQuat(new_rot.copy());
            child_bone.update_bone(child_pos.copy(), Vec3.zero.copy(), child_rot.copy());
            const cyl = scene.get_cylinder(i);
            const t = cyl.get_tran();
            const q = cyl.get_quat();
            this.update_children(child_bone, new_rot.copy(), scene);
        });
    }
}
BoneRotator.rotate_scale = 0.02;
//# sourceMappingURL=BoneRotator.js.map