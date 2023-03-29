import { Quat, Vec3 } from "../lib/TSM.js";
import { Utils } from "./Utils.js";
export class BoneManipulator {
    static rotate_bone(scene, id, dx, axis) {
        // get bone
        const bone = scene.meshes[0].bones[id];
        // rotate bone using dx
        const rads = -dx * this.rotate_scale;
        const q = Quat.fromAxisAngle(axis.copy(), rads); //(Utils.create_quaternion_from_axis_and_angle(axis, rads))
        // update bone values
        const offset = bone.position.copy();
        bone.apply_rotation(offset.copy(), q.copy());
        // update T mat
        bone.update_Ti_Bji(axis.copy(), rads, Vec3.zero.copy());
        // update D and U matrix
        bone.update_Di_Ui(scene);
        // update hex values
        scene.hex.set_color(Utils.get_color('green'));
        scene.hex.rotate(offset.copy(), q.copy());
        // recurssively update children
        this.update_children(bone, offset.copy(), q.copy(), axis.copy(), rads, scene);
    }
    static roll_bone(scene, id, rads, cw) {
        // get bone
        const bone = scene.meshes[0].bones[id];
        // get axis
        const axis = bone.get_axis();
        // get rads
        rads = Math.abs(rads);
        if (cw === true)
            rads = -rads;
        const q = (Utils.create_quaternion_from_axis_and_angle(axis, rads));
        // update bone values
        const offset = bone.position.copy();
        bone.apply_rotation(offset.copy(), q.copy());
        // update T mat
        bone.update_Ti_Bji(axis.copy(), rads, Vec3.zero.copy());
        // update D and U matrix
        bone.update_Di_Ui(scene);
        // update hex values
        scene.hex.set_color(Utils.get_color('green'));
        scene.hex.rotate(offset.copy(), q.copy());
        // recurssively update children
        this.update_children(bone, offset.copy(), q.copy(), axis.copy(), rads, scene);
    }
    static update_children(b, offset, q, axis, rads, scene) {
        const children = b.children;
        children.forEach(i => {
            // get child bone
            const child_bone = scene.meshes[0].bones[i];
            // update bone values
            child_bone.apply_rotation(offset.copy(), q.copy());
            // update T mat
            child_bone.update_Ti_Bji(axis.copy(), 0.0, b.position.copy());
            // update D and U matrix
            child_bone.update_Di_Ui(scene);
            // recurse to child bones
            this.update_children(child_bone, offset.copy(), q.copy(), axis.copy(), rads, scene);
        });
    }
}
BoneManipulator.rotate_scale = 0.02;
//# sourceMappingURL=BoneManipulator.js.map