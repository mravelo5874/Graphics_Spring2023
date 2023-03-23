import { Util } from "./Utils.js";
export class BoneRotator {
    static rotate_bone(scene, id, mouse_offset, camera_ray) {
        const axis = camera_ray.get_direction().normalize();
        const mouse = mouse_offset.copy();
        // get bone
        const bone = scene.meshes[0].bones[id];
        console.log('rotating bone: ' + id);
        // TODO this
        const angle = Math.atan2(mouse.y, mouse.x);
        bone.rotation = Util.create_quaternion_from_axis_and_angle(axis.copy(), angle).multiply(bone.rotation.copy());
        /*
        const p1 : Vec3 = bone.position.copy()  // r1
        const v1 : Vec3 = camera_ray.get_direction().normalize() // e1

        const p2 : Vec3 = mouse_ray.get_origin() // r2
        const v2 : Vec3 = mouse_ray.get_direction().normalize() // e2

        // line connecting closest points has dir vector n
        const n : Vec3 = Vec3.cross(v1.copy(), v2.copy()) // e1 x e2
        */
    }
}
//# sourceMappingURL=BoneRotator.js.map