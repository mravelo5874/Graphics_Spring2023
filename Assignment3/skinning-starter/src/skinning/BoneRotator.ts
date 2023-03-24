import { Mat4, Quat, Vec2, Vec3, Vec4 } from "../lib/TSM.js";
import { CLoader } from "./AnimationFileLoader.js";
import { Util, Ray, Cylinder } from "./Utils.js";
import { Bone } from "./Scene.js"
import { Scene } from "../lib/threejs/src/Three.js";

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
        const new_rot : Quat = Util.create_quaternion_from_axis_and_angle(axis.copy(), rads).multiply(bone.rotation.copy());
        
        // update bone and hex
        const new_end : Vec3 = new_rot.copy().multiplyVec3(bone.endpoint.copy())
        scene.meshes[0].bones[id].update_bone(bone.position.copy(), new_end.copy(), new_rot.copy())

        // TODO update hex correctly and with no lag (maybe precompute hex verticies?)
        // scene.hex.set(bone.position.copy(), new_end.copy(), id, true)

        // TODO recurssively update children
        this.update_children(bone, new_rot.copy(), scene)
    }

    private static update_children(bone : Bone, new_rot : Quat, scene : CLoader)
    {
        const children : number[] = bone.children
        children.forEach(i => {
            const child_bone : Bone = scene.meshes[0].bones[i]

            const child_rot : Quat = new_rot.copy().multiply(child_bone.rotation.copy())
            const child_pos : Vec3 = child_bone.position.copy().multiplyByQuat(new_rot.copy())
            child_bone.update_bone(child_pos.copy(), Vec3.zero.copy(), child_rot.copy())
            const cyl : Cylinder = scene.get_cylinder(i)
            const t : Vec3 = cyl.get_tran()
            const q : Vec4 = cyl.get_quat()

            this.update_children(child_bone, new_rot.copy(), scene)
        });
    }
}