import { Utils } from "./Utils.js";
export class BoneRotator {
    static rotate_bone(scene, id, dx, axis) {
        // get bone
        const bone = scene.meshes[0].bones[id];
        // rotate bone using dx
        const rads = -dx * this.rotate_scale;
        const q = (Utils.create_quaternion_from_axis_and_angle(axis, rads));
        // update bone and hex
        const offset = bone.position.copy();
        bone.apply_rotation(offset.copy(), q.copy(), axis.copy(), rads);
        //scene.hex.set_color(Utils.get_color('green'))
        //scene.hex.rotate(offset.copy(), q.copy())
        // recurssively update children
        this.update_children(bone, offset.copy(), q.copy(), scene, axis.copy(), rads);
    }
    static update_children(b, offset, q, scene, axis, rads) {
        const children = b.children;
        children.forEach(i => {
            // get child bone
            const child_bone = scene.meshes[0].bones[i];
            // update bone
            child_bone.apply_rotation(offset.copy(), q.copy(), axis.copy(), rads);
            // recurse to child bones
            this.update_children(child_bone, offset.copy(), q.copy(), scene, axis.copy(), rads);
        });
    }
}
BoneRotator.rotate_scale = 0.02;
//# sourceMappingURL=BoneRotator.js.map