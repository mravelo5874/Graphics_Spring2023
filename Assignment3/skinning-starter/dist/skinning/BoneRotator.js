import { Quat } from "../lib/TSM.js";
export class BoneRotator {
    static rotate_bone(scene, id, mouse_ray, camera_ray) {
        const axis = camera_ray.get_direction().normalize();
        // get bone
        const bone = scene.meshes[0].bones[id];
        console.log('rotating bone: ' + id);
        // get current angle of endpoint based off of axis
        //bone.endpoint = Util.rotate_point(bone.endpoint, axis.copy(), 0.1)
        let rot = new Quat(bone.rotation.xyzw);
        rot.x += 0.1;
        bone.rotation = rot.copy();
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