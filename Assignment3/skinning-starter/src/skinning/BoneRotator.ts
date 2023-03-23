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
        
        // determine bone's current angle on plane created by axis (treat the axis as a normal)
        

        // determine the mouse ray's angle on the same plane

        // rotate bone using difference
        bone.rotation = Util.create_quaternion_from_axis_and_angle(axis.copy(), 0.1).multiply(bone.rotation.copy());

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