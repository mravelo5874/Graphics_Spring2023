import { Mat4, Quat, Vec2, Vec3, Vec4 } from "../lib/TSM.js";
import { CLoader } from "./AnimationFileLoader.js";
import { Util, Ray, Cylinder } from "./Utils.js";
import { Bone } from "./Scene.js"

export class BoneRotator
{
    private static rotate_scale : number = 0.02

    public static rotate_bone(scene : CLoader, id : number, dx : number, axis: Vec3)
    {
        // get bone
        const bone : Bone = scene.meshes[0].bones[id]
        // rotate bone using dx
        const rads : number = -dx * this.rotate_scale
        const q : Quat = (Util.create_quaternion_from_axis_and_angle(axis.copy(), rads))
        // get new rotation and points
        const new_rot : Quat = bone.rotation.copy().multiply(q.copy())
        const new_pos : Vec3 = bone.position.copy().multiplyByQuat(q.copy())
        const new_end : Vec3 = bone.endpoint.copy().multiplyByQuat(q.copy())
        // update bone and hex
        const pos_v4 : Vec4 = new Vec4([new_pos.x, new_pos.y, new_pos.z, 1.0])
        const end_v4 : Vec4 = new Vec4([new_end.x, new_end.y, new_end.z, 1.0])
        bone.update_bone(pos_v4, end_v4, new_rot.copy())
        scene.hex.set_color(Util.get_color('green'))
        scene.hex.rotate(pos_v4, q)

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
            const q : Quat = (Util.create_quaternion_from_axis_and_angle(axis.copy(), rads))
            // get new rotation and points
            const new_rot : Quat = child_bone.rotation.copy().multiply(q.copy())
            const new_pos : Vec3 = child_bone.position.copy().multiplyByQuat(q.copy())
            const new_end : Vec3 = child_bone.endpoint.copy().multiplyByQuat(q.copy())
            // update bone and hex
            const pos_v4 : Vec4 = new Vec4([new_pos.x, new_pos.y, new_pos.z, 1.0])
            const end_v4 : Vec4 = new Vec4([new_end.x, new_end.y, new_end.z, 1.0])
            child_bone.update_bone(pos_v4, end_v4, new_rot.copy())
            // recurse to child bones
            this.update_children(child_bone, axis.copy(), rads, scene)
        });
    }
}