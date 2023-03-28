import { Quat, Vec3, Mat4 } from "../lib/TSM.js";
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
        const q : Quat = (Utils.create_quaternion_from_axis_and_angle(axis, rads))
        // update bone values
        const offset : Vec3 = bone.position.copy()
        bone.apply_rotation(offset.copy(), q.copy())
        // update T mat
        bone.update_Ti(offset.copy(), axis.copy(), rads)
        // update D and U matrix
        bone.update_Di_Ui(scene)
        // update hex values
        scene.hex.set_color(Utils.get_color('green'))
        scene.hex.rotate(offset.copy(), q.copy())
        // recurssively update children
        this.update_children(bone, offset.copy(), q.copy(), axis.copy(), rads, scene)
    }

    private static update_children(b : Bone, offset : Vec3, q : Quat, axis : Vec3, rads : number, scene : CLoader)
    {
        const children : number[] = b.children
        children.forEach(i => 
        {
            // get child bone
            const child_bone : Bone = scene.meshes[0].bones[i]
            // update bone values
            child_bone.apply_rotation(offset.copy(), q.copy())
            // update T mat
            child_bone.update_Ti(offset.copy(), axis.copy(), rads)
            // update D and U matrix
            child_bone.update_Di_Ui(scene)
            // recurse to child bones
            this.update_children(child_bone, offset.copy(), q.copy(), axis.copy(), rads, scene)
        });
    }
}