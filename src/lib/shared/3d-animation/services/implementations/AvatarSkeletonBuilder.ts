/**
 * AvatarSkeletonBuilder
 *
 * Loads and manages GLTF rigged humanoid models.
 * Provides access to bones for IK solving and animation.
 */

import { injectable } from "inversify";
import {
  Object3D,
  Bone,
  SkinnedMesh,
  Skeleton,
  Vector3,
  Box3,
} from "three";
import { GLTFLoader, type GLTF } from "three/addons/loaders/GLTFLoader.js";
import type {
  IAvatarSkeletonBuilder,
  BoneName,
  BoneChain,
  SkeletonState,
} from "../contracts/IAvatarSkeletonBuilder";

/**
 * Mapping of standard bone names to common variations
 * GLTF models from different sources use different naming conventions
 */
const BONE_NAME_ALIASES: Record<BoneName, string[]> = {
  Hips: ["Hips", "pelvis", "hip", "root"],
  Spine: ["Spine", "spine", "spine1"],
  Spine1: ["Spine1", "spine2", "chest"],
  Spine2: ["Spine2", "spine3", "upper_chest"],
  Neck: ["Neck", "neck"],
  Head: ["Head", "head"],
  LeftShoulder: ["LeftShoulder", "l_shoulder", "shoulder.L", "clavicle_l"],
  LeftArm: ["LeftArm", "l_arm", "arm.L", "upperarm_l", "LeftUpperArm"],
  LeftForeArm: ["LeftForeArm", "l_forearm", "forearm.L", "lowerarm_l", "LeftLowerArm"],
  LeftHand: ["LeftHand", "l_hand", "hand.L", "hand_l"],
  RightShoulder: ["RightShoulder", "r_shoulder", "shoulder.R", "clavicle_r"],
  RightArm: ["RightArm", "r_arm", "arm.R", "upperarm_r", "RightUpperArm"],
  RightForeArm: ["RightForeArm", "r_forearm", "forearm.R", "lowerarm_r", "RightLowerArm"],
  RightHand: ["RightHand", "r_hand", "hand.R", "hand_r"],
  LeftUpLeg: ["LeftUpLeg", "l_thigh", "thigh.L", "upperleg_l", "LeftUpperLeg"],
  LeftLeg: ["LeftLeg", "l_shin", "shin.L", "lowerleg_l", "LeftLowerLeg"],
  LeftFoot: ["LeftFoot", "l_foot", "foot.L", "foot_l"],
  RightUpLeg: ["RightUpLeg", "r_thigh", "thigh.R", "upperleg_r", "RightUpperLeg"],
  RightLeg: ["RightLeg", "r_shin", "shin.R", "lowerleg_r", "RightLowerLeg"],
  RightFoot: ["RightFoot", "r_foot", "foot.R", "foot_r"],
};

@injectable()
export class AvatarSkeletonBuilder implements IAvatarSkeletonBuilder {
  private state: SkeletonState = {
    isLoaded: false,
    root: null,
    meshes: [],
    bones: new Map(),
    leftArmChain: null,
    rightArmChain: null,
  };

  private loader = new GLTFLoader();
  private originalHeight: number = 0;
  private skeleton: Skeleton | null = null;

  async loadModel(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf: GLTF) => {
          this.processGLTF(gltf);
          resolve();
        },
        undefined,
        (error) => {
          console.error("Failed to load avatar model:", error);
          reject(error);
        }
      );
    });
  }

  private processGLTF(gltf: GLTF): void {
    this.state.root = gltf.scene;
    this.state.meshes = [];
    this.state.bones = new Map();

    // Find all skinned meshes and bones
    gltf.scene.traverse((child) => {
      if ((child as SkinnedMesh).isSkinnedMesh) {
        const skinnedMesh = child as SkinnedMesh;
        this.state.meshes.push(skinnedMesh);
        this.skeleton = skinnedMesh.skeleton;
      }

      if ((child as Bone).isBone) {
        this.mapBone(child as Bone);
      }
    });

    // Compute original height
    const box = new Box3().setFromObject(gltf.scene);
    this.originalHeight = box.max.y - box.min.y;

    // Build arm chains
    this.buildArmChains();

    this.state.isLoaded = true;
    console.log(
      `Avatar loaded: ${this.state.meshes.length} meshes, ${this.state.bones.size} mapped bones`
    );
  }

  private mapBone(bone: Bone): void {
    const boneName = bone.name.toLowerCase();

    // Skip finger bones - they contain hand name but aren't the hand
    if (boneName.includes('thumb') || boneName.includes('index') ||
        boneName.includes('middle') || boneName.includes('ring') ||
        boneName.includes('pinky')) {
      return; // Don't map finger bones
    }

    for (const [standardName, aliases] of Object.entries(BONE_NAME_ALIASES)) {
      for (const alias of aliases) {
        // Use exact match first, then contains as fallback
        if (boneName === alias.toLowerCase()) {
          this.state.bones.set(standardName as BoneName, bone);
          console.log(`[Skeleton] Mapped bone "${bone.name}" to ${standardName} (exact)`);
          return;
        }
      }
    }

    // Fallback: check contains (but only if not already mapped)
    for (const [standardName, aliases] of Object.entries(BONE_NAME_ALIASES)) {
      if (this.state.bones.has(standardName as BoneName)) continue; // Skip if already mapped
      for (const alias of aliases) {
        if (boneName.includes(alias.toLowerCase())) {
          this.state.bones.set(standardName as BoneName, bone);
          console.log(`[Skeleton] Mapped bone "${bone.name}" to ${standardName} (contains)`);
          return;
        }
      }
    }
  }

  private buildArmChains(): void {
    // Left arm
    const leftShoulder = this.state.bones.get("LeftArm");
    const leftElbow = this.state.bones.get("LeftForeArm");
    const leftHand = this.state.bones.get("LeftHand");

    if (leftShoulder && leftElbow && leftHand) {
      const upperLen = this.getBoneLength(leftShoulder, leftElbow);
      const lowerLen = this.getBoneLength(leftElbow, leftHand);

      // Compute rest directions in local space (direction bone points in T-pose)
      const rootRestDir = this.computeRestDirection(leftShoulder, leftElbow);
      const middleRestDir = this.computeRestDirection(leftElbow, leftHand);

      console.log(`[Skeleton] Left arm root rest dir: (${rootRestDir.x.toFixed(2)}, ${rootRestDir.y.toFixed(2)}, ${rootRestDir.z.toFixed(2)})`);
      console.log(`[Skeleton] Left arm middle rest dir: (${middleRestDir.x.toFixed(2)}, ${middleRestDir.y.toFixed(2)}, ${middleRestDir.z.toFixed(2)})`);

      this.state.leftArmChain = {
        root: leftShoulder,
        middle: leftElbow,
        effector: leftHand,
        totalLength: upperLen + lowerLen,
        upperLength: upperLen,
        lowerLength: lowerLen,
        rootRestDir,
        middleRestDir,
      };
    }

    // Right arm
    const rightShoulder = this.state.bones.get("RightArm");
    const rightElbow = this.state.bones.get("RightForeArm");
    const rightHand = this.state.bones.get("RightHand");

    if (rightShoulder && rightElbow && rightHand) {
      const upperLen = this.getBoneLength(rightShoulder, rightElbow);
      const lowerLen = this.getBoneLength(rightElbow, rightHand);

      // Compute rest directions in local space
      const rootRestDir = this.computeRestDirection(rightShoulder, rightElbow);
      const middleRestDir = this.computeRestDirection(rightElbow, rightHand);

      console.log(`[Skeleton] Right arm root rest dir: (${rootRestDir.x.toFixed(2)}, ${rootRestDir.y.toFixed(2)}, ${rootRestDir.z.toFixed(2)})`);
      console.log(`[Skeleton] Right arm middle rest dir: (${middleRestDir.x.toFixed(2)}, ${middleRestDir.y.toFixed(2)}, ${middleRestDir.z.toFixed(2)})`);

      this.state.rightArmChain = {
        root: rightShoulder,
        middle: rightElbow,
        effector: rightHand,
        totalLength: upperLen + lowerLen,
        upperLength: upperLen,
        lowerLength: lowerLen,
        rootRestDir,
        middleRestDir,
      };
    }
  }

  /**
   * Compute the rest direction of a bone (direction to child in bind pose)
   * Returns the direction in the bone's LOCAL space
   */
  private computeRestDirection(parent: Bone, child: Bone): Vector3 {
    // Get world positions
    const parentWorld = new Vector3();
    const childWorld = new Vector3();
    parent.getWorldPosition(parentWorld);
    child.getWorldPosition(childWorld);

    // Direction in world space
    const worldDir = childWorld.clone().sub(parentWorld).normalize();

    // Transform to parent's local space
    // Get the parent's world matrix inverse to transform world to local
    const parentMatrixInverse = parent.matrixWorld.clone().invert();

    // Transform direction (not point) - use transformDirection
    const localDir = worldDir.clone().transformDirection(parentMatrixInverse);

    return localDir.normalize();
  }

  private getBoneLength(parent: Bone, child: Bone): number {
    const parentWorld = new Vector3();
    const childWorld = new Vector3();
    parent.getWorldPosition(parentWorld);
    child.getWorldPosition(childWorld);
    return parentWorld.distanceTo(childWorld);
  }

  getState(): SkeletonState {
    return this.state;
  }

  getBone(name: BoneName): Bone | null {
    return this.state.bones.get(name) ?? null;
  }

  getLeftArmChain(): BoneChain | null {
    return this.state.leftArmChain;
  }

  getRightArmChain(): BoneChain | null {
    return this.state.rightArmChain;
  }

  getRoot(): Object3D | null {
    return this.state.root;
  }

  updateMatrices(): void {
    if (this.skeleton) {
      this.skeleton.update();
    }
    if (this.state.root) {
      this.state.root.updateMatrixWorld(true);
    }
  }

  setHeight(height: number): void {
    if (!this.state.root || this.originalHeight === 0) return;

    const scale = height / this.originalHeight;
    this.state.root.scale.setScalar(scale);

    // Rebuild arm chains with new scale
    this.state.root.updateMatrixWorld(true);
    this.buildArmChains();
  }

  dispose(): void {
    if (this.state.root) {
      this.state.root.traverse((child) => {
        const mesh = child as SkinnedMesh;
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });
    }

    this.state = {
      isLoaded: false,
      root: null,
      meshes: [],
      bones: new Map(),
      leftArmChain: null,
      rightArmChain: null,
    };
    this.skeleton = null;
  }
}
