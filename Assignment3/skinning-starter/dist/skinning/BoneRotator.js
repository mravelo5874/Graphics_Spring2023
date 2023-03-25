import { Vec4 } from "../lib/TSM.js";
import { Util } from "./Utils.js";
export class BoneRotator {
    static rotate_bone(scene, id, dx, axis) {
        // get bone
        const bone = scene.meshes[0].bones[id];
        // rotate bone using dx
        const rads = -dx * this.rotate_scale;
        const q = (Util.create_quaternion_from_axis_and_angle(axis.copy(), rads));
        // get new rotation and points
        const new_rot = bone.rotation.copy().multiply(q.copy());
        const new_pos = bone.position.copy().multiplyByQuat(q.copy());
        const new_end = bone.endpoint.copy().multiplyByQuat(q.copy());
        // update bone and hex
        const pos_v4 = new Vec4([new_pos.x, new_pos.y, new_pos.z, 1.0]);
        const end_v4 = new Vec4([new_end.x, new_end.y, new_end.z, 1.0]);
        bone.update_bone(pos_v4, end_v4, new_rot.copy());
        scene.hex.set_color(Util.get_color('green'));
        scene.hex.rotate(pos_v4, q);
        // recurssively update children
        this.update_children(bone, axis.copy(), rads, scene);
    }
    static update_children(b, axis, rads, scene) {
        const children = b.children;
        children.forEach(i => {
            // get child bone
            const child_bone = scene.meshes[0].bones[i];
            // rotate bone using dx
            const q = (Util.create_quaternion_from_axis_and_angle(axis.copy(), rads));
            // get new rotation and points
            const new_rot = child_bone.rotation.copy().multiply(q.copy());
            const new_pos = child_bone.position.copy().multiplyByQuat(q.copy());
            const new_end = child_bone.endpoint.copy().multiplyByQuat(q.copy());
            // update bone and hex
            const pos_v4 = new Vec4([new_pos.x, new_pos.y, new_pos.z, 1.0]);
            const end_v4 = new Vec4([new_end.x, new_end.y, new_end.z, 1.0]);
            child_bone.update_bone(pos_v4, end_v4, new_rot.copy());
            // recurse to child bones
            this.update_children(child_bone, axis.copy(), rads, scene);
        });
    }
}
BoneRotator.rotate_scale = 0.02;
//# sourceMappingURL=BoneRotator.js.map