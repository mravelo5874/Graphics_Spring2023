import { Mat4, Quat, Vec2, Vec3 } from "../lib/TSM.js";
import { CLoader } from "./AnimationFileLoader.js";
import { Util, Ray, Cylinder } from "./Utils.js";
import { Bone } from "./Scene.js"

export class BoneRotator
{
    private static rotate_scale : number = 0.02

    public static rotate_bone(scene : CLoader, id : number, dx : number, camera_ray : Ray)
    {
        const axis : Vec3 = camera_ray.get_direction().normalize()

        // get bone
        let bone : Bone = scene.meshes[0].bones[id]

        // rotate bone using dx
        const rads : number = -dx * this.rotate_scale
        const new_rot : Quat = Util.create_quaternion_from_axis_and_angle(axis.copy(), rads).multiply(bone.rotation.copy());
        
        // update bone and hex
        const new_end : Vec3 = Util.rotate_point(bone.endpoint.copy(), axis.copy(), rads)
        scene.meshes[0].bones[id].update_bone(bone.position.copy(), new_end.copy(), new_rot.copy())

        // TODO update hex correctly and with no lag (maybe precompute hex verticies?)
        //scene.hex.set(bone.position.copy(), new_end.copy(), id, true)
    }
}