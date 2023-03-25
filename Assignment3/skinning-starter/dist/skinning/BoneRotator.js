import { Utils } from "./Utils.js";
export class BoneRotator {
    static rotate_bone(scene, id, dx, axis) {
        // get bone
        const bone = scene.meshes[0].bones[id];
        // rotate bone using dx
        const rads = -dx * this.rotate_scale;
        const q = (Utils.create_quaternion_from_axis_and_angle(axis.copy(), rads));
        // update bone and hex
        bone.apply_rotation(q.copy());
        scene.hex.set_color(Utils.get_color('green'));
        scene.hex.rotate(q.copy());
        // recurssively update children
        this.update_children(bone, q.copy(), scene);
    }
    static update_children(b, q, scene) {
        const children = b.children;
        children.forEach(i => {
            // get child bone
            const child_bone = scene.meshes[0].bones[i];
            // update bone and hex
            child_bone.apply_rotation(q.copy());
            // recurse to child bones
            this.update_children(child_bone, q.copy(), scene);
        });
    }
}
BoneRotator.rotate_scale = 0.02;
//# sourceMappingURL=BoneRotator.js.map