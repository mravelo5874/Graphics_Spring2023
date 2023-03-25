import { Quat, Vec3 } from "../lib/TSM.js";
import { CLoader } from "./AnimationFileLoader.js";
import { Utils } from "./Utils.js";
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
        const q : Quat = (Utils.create_quaternion_from_axis_and_angle(axis.copy(), rads))
        // update bone and hex
        bone.apply_rotation(q)
        scene.hex.set_color(Utils.get_color('green'))
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
            const q : Quat = (Utils.create_quaternion_from_axis_and_angle(axis.copy(), rads))
            // update bone and hex
            child_bone.apply_rotation(q)
            // recurse to child bones
            this.update_children(child_bone, axis.copy(), rads, scene)
        });
    }
}