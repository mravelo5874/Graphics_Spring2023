import { Quat, Vec2, Vec3 } from "../lib/TSM.js";
import { CLoader } from "./AnimationFileLoader.js";
import { Util, Ray } from "./Utils.js";
import { Bone } from "./Scene.js"

export class BoneRotator
{
    public static rotate_bone(scene : CLoader, id : number, mouse_ray : Ray, camera_ray : Ray)
    {
        const axis : Vec3 = camera_ray.get_direction().normalize()

        // get bone
        const bone : Bone = scene.meshes[0].bones[id]

        console.log('rotating bone: ' + id)

        // TODO this

        // get current angle of endpoint based off of axis

        //bone.endpoint = Util.rotate_point(bone.endpoint, axis.copy(), 0.1)
        let rot : Quat = new Quat(bone.rotation.xyzw)
        rot.x += 0.1
        bone.rotation = rot.copy()

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