import { Util } from "./Utils.js";
export class BoneRotator {
    static rotate_bone(scene, id, dx, camera_ray) {
        const axis = camera_ray.get_direction().normalize();
        // get bone
        const bone = scene.meshes[0].bones[id];
        // rotate bone using dx
        const rads = -dx * this.rotate_scale;
        const q = (Util.create_quaternion_from_axis_and_angle(axis.copy(), rads)).normalize();
        // get new rotation and points
        const new_rot = q.copy().multiply(bone.rotation.copy());
        const new_pos = bone.position.copy().multiplyByQuat(q.copy());
        const new_end = bone.endpoint.copy().multiplyByQuat(q.copy());
        // update bone and hex
        bone.update_bone(bone.position.copy(), new_end.copy(), q.copy());
        // TODO update hex correctly and with no lag (maybe precompute hex verticies?)
        scene.hex.set_color(Util.get_color('green'));
        scene.hex.rotate(q);
        // recurssively update children
        this.update_children(bone, axis.copy(), rads, scene);
    }
    static update_children(b, axis, rads, scene) {
        const children = b.children;
        children.forEach(i => {
            // get child bone
            const child_bone = scene.meshes[0].bones[i];
            // rotate bone using dx
            const q = (Util.create_quaternion_from_axis_and_angle(axis.copy(), rads)).normalize();
            // get new rotation and points
            const new_rot = q.copy().multiply(child_bone.rotation.copy());
            const new_pos = child_bone.position.copy().multiplyByQuat(q.copy());
            const new_end = child_bone.endpoint.copy().multiplyByQuat(q.copy());
            // update bone
            child_bone.update_bone(new_pos.copy(), new_end.copy(), q.copy());
            // recurse to child bones
            this.update_children(child_bone, axis.copy(), rads, scene);
        });
    }
}
BoneRotator.rotate_scale = 0.02;
//# sourceMappingURL=BoneRotator.js.map