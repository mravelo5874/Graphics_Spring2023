import { Mat4, Quat, Vec2, Vec3, Vec4 } from "../lib/TSM.js";
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
        const bone : Bone = scene.meshes[0].bones[id]
        // rotate bone using dx
        const rads : number = -dx * this.rotate_scale
        const q : Quat = (Util.create_quaternion_from_axis_and_angle(axis.copy(), rads)).normalize()
        // get new rotation and points
        const new_rot : Quat = q.copy().multiply(bone.rotation.copy())
        const new_pos : Vec3 = bone.position.copy().multiplyByQuat(q.copy())
        const new_end : Vec3 = bone.endpoint.copy().multiplyByQuat(q.copy())
        // update bone and hex
        bone.update_bone(bone.position.copy(), new_end.copy(), new_rot.copy())
        scene.hex.set_color(Util.get_color('green'))
        scene.hex.rotate(q)

        // recurssively update children
        this.update_children(bone, axis.copy(), rads, scene)
    }

    private static update_children(b : Bone, axis : Vec3, rads : number, scene : CLoader)
    {
        const children : number[] = b.children
        children.forEach(i => 
        {
            // get child bone
            const child_bone : Bone = scene.meshes[0].bones[i]
            // rotate bone using dx
            const q : Quat = (Util.create_quaternion_from_axis_and_angle(axis.copy(), rads)).normalize()
            // get new rotation and points
            const new_rot : Quat = q.copy().multiply(child_bone.rotation.copy())
            const new_pos : Vec3 = child_bone.position.copy().multiplyByQuat(q.copy())
            const new_end : Vec3 = child_bone.endpoint.copy().multiplyByQuat(q.copy())
            // update bone
            child_bone.update_bone(new_pos.copy(), new_end.copy(), new_rot.copy())
            // recurse to child bones
            this.update_children(child_bone, axis.copy(), rads, scene)
        });
    }
}