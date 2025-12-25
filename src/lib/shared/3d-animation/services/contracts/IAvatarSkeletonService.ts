/**
 * IAvatarSkeletonService
 *
 * Manages the skeletal structure of the 3D avatar.
 * Responsible for loading rigged models, bone manipulation,
 * and providing access to the skeleton hierarchy.
 */

import type { Bone, SkinnedMesh, Object3D } from "three";

/**
 * Standard bone names following Mixamo/humanoid conventions
 */
export type BoneName =
  | "Hips"
  | "Spine"
  | "Spine1"
  | "Spine2"
  | "Neck"
  | "Head"
  | "LeftShoulder"
  | "LeftArm"
  | "LeftForeArm"
  | "LeftHand"
  | "RightShoulder"
  | "RightArm"
  | "RightForeArm"
  | "RightHand"
  | "LeftUpLeg"
  | "LeftLeg"
  | "LeftFoot"
  | "RightUpLeg"
  | "RightLeg"
  | "RightFoot";

/**
 * Bone chain for IK solving
 */
export interface BoneChain {
  /** Root bone of the chain (e.g., shoulder) */
  root: Bone;
  /** Middle bone (e.g., elbow) */
  middle: Bone;
  /** End effector (e.g., hand) */
  effector: Bone;
  /** Total length of the chain */
  totalLength: number;
  /** Length of first segment */
  upperLength: number;
  /** Length of second segment */
  lowerLength: number;
}

/**
 * Avatar skeleton state
 */
export interface SkeletonState {
  /** Whether the skeleton is loaded and ready */
  isLoaded: boolean;
  /** The root object containing the skeleton */
  root: Object3D | null;
  /** All skinned meshes in the model */
  meshes: SkinnedMesh[];
  /** Map of bone names to bone objects */
  bones: Map<BoneName, Bone>;
  /** Pre-computed arm chains for IK */
  leftArmChain: BoneChain | null;
  rightArmChain: BoneChain | null;
}

export interface IAvatarSkeletonService {
  /**
   * Load a rigged avatar model from a GLTF file
   * @param url Path to the GLTF/GLB file
   * @returns Promise resolving when loaded
   */
  loadModel(url: string): Promise<void>;

  /**
   * Get the current skeleton state
   */
  getState(): SkeletonState;

  /**
   * Get a specific bone by name
   * @param name Standard bone name
   */
  getBone(name: BoneName): Bone | null;

  /**
   * Get the left arm IK chain
   */
  getLeftArmChain(): BoneChain | null;

  /**
   * Get the right arm IK chain
   */
  getRightArmChain(): BoneChain | null;

  /**
   * Get the root object for adding to the scene
   */
  getRoot(): Object3D | null;

  /**
   * Update bone transforms (call after IK solving)
   */
  updateMatrices(): void;

  /**
   * Set the overall scale of the avatar
   * @param height Target height in scene units
   */
  setHeight(height: number): void;

  /**
   * Dispose of the loaded model and free resources
   */
  dispose(): void;
}
