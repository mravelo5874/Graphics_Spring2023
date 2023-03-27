import { Vec3 } from "../lib/TSM.js";
import { Utils } from "./Utils.js";
export class BoneRotator {
    static rotate_bone(scene, id, dx, axis) {
        // get bone
        const bone = scene.meshes[0].bones[id];
        // rotate bone using dx
        const rads = -dx * this.rotate_scale;
        const q = (Utils.create_quaternion_from_axis_and_angle(axis, rads));
        // update bone values
        const offset = bone.position.copy();
        bone.apply_rotation(offset.copy(), q.copy());
        bone.update_Ti(offset.copy(), axis.copy(), rads);
        // calculate Bji matrix if not done already
        if (!bone.B_calc) {
            if (bone.parent < 0)
                bone.calculate_Bji(Vec3.zero.copy());
            else
                bone.calculate_Bji(scene.meshes[0].bones[bone.parent].initialPosition.copy());
        }
        // update Di matrix
        if (bone.parent < 0)
            bone.update_Di_Ui();
        else
            bone.update_Di_Ui(scene.meshes[0].bones[bone.parent].Di.copy());
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
            child_bone.update_Ti(offset.copy(), axis.copy(), rads);
            // calculate Bji matrix if not done already
            if (!child_bone.B_calc) {
                if (child_bone.parent < 0)
                    child_bone.calculate_Bji(Vec3.zero.copy());
                else
                    child_bone.calculate_Bji(scene.meshes[0].bones[child_bone.parent].initialPosition.copy());
            }
            // update Di matrix
            if (child_bone.parent < 0)
                child_bone.update_Di_Ui();
            else
                child_bone.update_Di_Ui(scene.meshes[0].bones[child_bone.parent].Di.copy());
            // recurse to child bones
            this.update_children(child_bone, offset.copy(), q.copy(), axis.copy(), rads, scene);
        });
    }
}
BoneRotator.rotate_scale = 0.02;
//# sourceMappingURL=BoneRotator.js.map