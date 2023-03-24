import { Util } from "./Utils.js";
export class BoneRotator {
    static rotate_bone(scene, id, dx, camera_ray) {
        const axis = camera_ray.get_direction().normalize();
        // get bone
        let bone = scene.meshes[0].bones[id];
        // rotate bone using dx
        const rads = -dx * this.rotate_scale;
        const new_rot = Util.create_quaternion_from_axis_and_angle(axis.copy(), rads).multiply(bone.rotation.copy());
        // update bone and hex
        const new_end = Util.rotate_point(bone.endpoint.copy(), axis.copy(), rads);
        scene.meshes[0].bones[id].update_bone(bone.position.copy(), new_end.copy(), new_rot.copy());
        // TODO update hex correctly and with no lag (maybe precompute hex verticies?)
        //scene.hex.set(bone.position.copy(), new_end.copy(), id, true)
    }
}
BoneRotator.rotate_scale = 0.02;
//# sourceMappingURL=BoneRotator.js.map