/**
 * IKSolverService
 *
 * Implements multiple IK algorithms for skeletal animation.
 * Primary use: positioning hands on staff positions.
 */

import { injectable } from "inversify";
import { Vector3, Quaternion, Matrix4, Euler } from "three";
import type { Bone } from "three";
import type {
  IIKSolverService,
  IKAlgorithm,
  JointConstraints,
  IKTarget,
  IKSolution,
  HumanoidConstraints,
} from "../contracts/IIKSolverService";
import type { BoneChain } from "../contracts/IAvatarSkeletonService";

@injectable()
export class IKSolverService implements IIKSolverService {
  private maxIterations = 10;
  private convergenceThreshold = 0.01;

  // Pre-allocated vectors for performance
  private readonly tempVec = new Vector3();

  solve(
    chain: BoneChain,
    target: IKTarget,
    algorithm: IKAlgorithm = "analytic",
    constraints?: JointConstraints[]
  ): IKSolution {
    switch (algorithm) {
      case "analytic":
        return this.solveTwoBone(chain, target.position, new Vector3(0, 0, -1));
      case "ccd":
        return this.solveCCD(chain, target, constraints);
      case "fabrik":
        return this.solveFABRIK(chain, target);
      default:
        return this.solveTwoBone(chain, target.position, new Vector3(0, 0, -1));
    }
  }

  solveAndApply(
    chain: BoneChain,
    target: IKTarget,
    constraints?: JointConstraints[]
  ): void {
    const solution = this.solve(chain, target, "analytic", constraints);
    const rootRotation = solution.rotations[0];
    const middleRotation = solution.rotations[1];

    if (solution.success && rootRotation && middleRotation) {
      chain.root.quaternion.copy(rootRotation);
      chain.middle.quaternion.copy(middleRotation);

      // Update matrices
      chain.root.updateMatrixWorld(true);
    }
  }

  /**
   * Two-bone analytic solver
   *
   * Uses the law of cosines to find the exact elbow position.
   * This is the fastest and most stable method for 2-bone chains.
   */
  solveTwoBone(
    chain: BoneChain,
    target: Vector3,
    poleHint: Vector3
  ): IKSolution {
    const rotations: Quaternion[] = [];

    // Get world positions
    const shoulderWorld = new Vector3();
    chain.root.getWorldPosition(shoulderWorld);

    // Calculate direction and distance to target
    const toTarget = target.clone().sub(shoulderWorld);
    let dist = toTarget.length();

    // Clamp to reachable range
    const maxReach = chain.upperLength + chain.lowerLength;
    const minReach = Math.abs(chain.upperLength - chain.lowerLength);

    let reachable = true;
    if (dist > maxReach * 0.999) {
      dist = maxReach * 0.999;
      reachable = false;
    } else if (dist < minReach * 1.001) {
      dist = minReach * 1.001;
      reachable = false;
    }

    // Law of cosines: find angle at shoulder
    const cosShoulderAngle =
      (chain.upperLength * chain.upperLength +
        dist * dist -
        chain.lowerLength * chain.lowerLength) /
      (2 * chain.upperLength * dist);
    const shoulderAngle = Math.acos(Math.max(-1, Math.min(1, cosShoulderAngle)));

    // Find angle at elbow
    const cosElbowAngle =
      (chain.upperLength * chain.upperLength +
        chain.lowerLength * chain.lowerLength -
        dist * dist) /
      (2 * chain.upperLength * chain.lowerLength);
    const elbowAngle = Math.acos(Math.max(-1, Math.min(1, cosElbowAngle)));

    // Direction to target
    const dir = toTarget.normalize();

    // Find perpendicular axis for rotation using pole hint
    let perp = new Vector3().crossVectors(dir, poleHint);
    if (perp.lengthSq() < 0.0001) {
      perp = new Vector3().crossVectors(dir, new Vector3(0, 1, 0));
      if (perp.lengthSq() < 0.0001) {
        perp.set(1, 0, 0);
      }
    }
    perp.normalize();

    // Calculate shoulder rotation
    // First, rotate to point at target, then adjust by shoulder angle
    const elbowDir = dir.clone().applyAxisAngle(perp, shoulderAngle);

    // Convert to local rotation for shoulder bone
    const shoulderQuat = new Quaternion();
    const shoulderParentInverse = new Matrix4();
    if (chain.root.parent) {
      chain.root.parent.updateWorldMatrix(true, false);
      shoulderParentInverse.copy(chain.root.parent.matrixWorld).invert();
    }

    // Get the local direction we need to rotate to
    const localElbowDir = elbowDir.clone().transformDirection(shoulderParentInverse);

    // Calculate the rotation needed
    const restDir = new Vector3(1, 0, 0); // Default bone direction (may vary by model)
    shoulderQuat.setFromUnitVectors(restDir, localElbowDir);
    rotations.push(shoulderQuat);

    // Calculate elbow rotation
    const elbowQuat = new Quaternion();
    elbowQuat.setFromAxisAngle(new Vector3(0, 0, 1), -(Math.PI - elbowAngle));
    rotations.push(elbowQuat);

    const error = target.distanceTo(shoulderWorld.add(toTarget.multiplyScalar(dist)));

    return {
      success: reachable,
      iterations: 1,
      error,
      rotations,
    };
  }

  /**
   * Cyclic Coordinate Descent solver
   *
   * Iteratively rotates each bone towards the target.
   * Works for any chain length, handles constraints well.
   */
  private solveCCD(
    chain: BoneChain,
    target: IKTarget,
    constraints?: JointConstraints[]
  ): IKSolution {
    const bones: Bone[] = [chain.root, chain.middle, chain.effector];
    const rotations: Quaternion[] = bones.map((b) => b.quaternion.clone());

    let iterations = 0;
    let error = Infinity;

    for (let iter = 0; iter < this.maxIterations; iter++) {
      iterations++;

      // Iterate from end effector back to root
      for (let i = bones.length - 2; i >= 0; i--) {
        const bone = bones[i];
        if (!bone) continue;

        const effector = chain.effector;

        // Get current positions
        const boneWorld = new Vector3();
        const effectorWorld = new Vector3();
        bone.getWorldPosition(boneWorld);
        effector.getWorldPosition(effectorWorld);

        // Vectors from bone to effector and to target
        const toEffector = effectorWorld.clone().sub(boneWorld).normalize();
        const toTarget = target.position.clone().sub(boneWorld).normalize();

        // Calculate rotation to move effector towards target
        const rotation = new Quaternion().setFromUnitVectors(toEffector, toTarget);

        // Apply rotation
        bone.quaternion.premultiply(rotation);

        // Apply constraints if provided
        const constraint = constraints?.[i];
        if (constraint) {
          this.applyConstraints(bone, constraint);
        }

        // Update matrices
        bone.updateMatrixWorld(true);
      }

      // Check convergence
      chain.effector.getWorldPosition(this.tempVec);
      error = this.tempVec.distanceTo(target.position);

      if (error < this.convergenceThreshold) {
        break;
      }
    }

    // Collect final rotations
    bones.forEach((bone, i) => {
      if (bone && rotations[i]) {
        rotations[i] = bone.quaternion.clone();
      }
    });

    return {
      success: error < this.convergenceThreshold * 10,
      iterations,
      error,
      rotations,
    };
  }

  /**
   * Forward And Backward Reaching IK (FABRIK)
   *
   * Two-pass algorithm that produces very natural motion.
   * Better for longer chains and smoother results.
   */
  private solveFABRIK(chain: BoneChain, target: IKTarget): IKSolution {
    // Get initial positions - use fixed-size array
    const pos0 = new Vector3();
    const pos1 = new Vector3();
    const pos2 = new Vector3();

    chain.root.getWorldPosition(pos0);
    chain.middle.getWorldPosition(pos1);
    chain.effector.getWorldPosition(pos2);

    const upperLen = chain.upperLength;
    const lowerLen = chain.lowerLength;
    const rootPos = pos0.clone();

    let iterations = 0;
    let error = Infinity;

    for (let iter = 0; iter < this.maxIterations; iter++) {
      iterations++;

      // Forward pass: move effector to target, work backwards
      pos2.copy(target.position);

      // Position 1 relative to position 2
      const dir1to2 = pos1.clone().sub(pos2).normalize();
      pos1.copy(pos2).add(dir1to2.multiplyScalar(lowerLen));

      // Position 0 relative to position 1
      const dir0to1 = pos0.clone().sub(pos1).normalize();
      pos0.copy(pos1).add(dir0to1.multiplyScalar(upperLen));

      // Backward pass: move root back to original, work forwards
      pos0.copy(rootPos);

      // Position 1 relative to position 0
      const dir1from0 = pos1.clone().sub(pos0).normalize();
      pos1.copy(pos0).add(dir1from0.multiplyScalar(upperLen));

      // Position 2 relative to position 1
      const dir2from1 = pos2.clone().sub(pos1).normalize();
      pos2.copy(pos1).add(dir2from1.multiplyScalar(lowerLen));

      // Check convergence
      error = pos2.distanceTo(target.position);
      if (error < this.convergenceThreshold) {
        break;
      }
    }

    // Convert positions back to rotations
    const rotations = this.positionsToRotations(pos0, pos1, pos2);

    return {
      success: error < this.convergenceThreshold * 10,
      iterations,
      error,
      rotations,
    };
  }

  private positionsToRotations(
    pos0: Vector3,
    pos1: Vector3,
    pos2: Vector3
  ): Quaternion[] {
    const rotations: Quaternion[] = [];

    // Shoulder rotation
    const shoulderDir = pos1.clone().sub(pos0).normalize();
    const shoulderQuat = new Quaternion().setFromUnitVectors(
      new Vector3(1, 0, 0),
      shoulderDir
    );
    rotations.push(shoulderQuat);

    // Elbow rotation
    const elbowDir = pos2.clone().sub(pos1).normalize();
    const elbowQuat = new Quaternion().setFromUnitVectors(
      shoulderDir,
      elbowDir
    );
    rotations.push(elbowQuat);

    return rotations;
  }

  private applyConstraints(bone: Bone, constraints: JointConstraints): void {
    const euler = new Euler().setFromQuaternion(bone.quaternion);

    if (constraints.minX !== undefined) euler.x = Math.max(euler.x, constraints.minX);
    if (constraints.maxX !== undefined) euler.x = Math.min(euler.x, constraints.maxX);
    if (constraints.minY !== undefined) euler.y = Math.max(euler.y, constraints.minY);
    if (constraints.maxY !== undefined) euler.y = Math.min(euler.y, constraints.maxY);
    if (constraints.minZ !== undefined) euler.z = Math.max(euler.z, constraints.minZ);
    if (constraints.maxZ !== undefined) euler.z = Math.min(euler.z, constraints.maxZ);

    bone.quaternion.setFromEuler(euler);
  }

  getHumanoidConstraints(): HumanoidConstraints {
    const deg = Math.PI / 180;
    return {
      // Elbows only bend one way
      leftElbow: {
        minX: 0,
        maxX: 145 * deg,
        minY: -5 * deg,
        maxY: 5 * deg,
        minZ: -5 * deg,
        maxZ: 5 * deg,
        poleVector: new Vector3(-0.5, -0.3, -1).normalize(),
      },
      rightElbow: {
        minX: 0,
        maxX: 145 * deg,
        minY: -5 * deg,
        maxY: 5 * deg,
        minZ: -5 * deg,
        maxZ: 5 * deg,
        poleVector: new Vector3(0.5, -0.3, -1).normalize(),
      },
      // Shoulders have wide range
      leftShoulder: {
        minX: -180 * deg,
        maxX: 60 * deg,
        minY: -90 * deg,
        maxY: 90 * deg,
        minZ: -45 * deg,
        maxZ: 180 * deg,
      },
      rightShoulder: {
        minX: -180 * deg,
        maxX: 60 * deg,
        minY: -90 * deg,
        maxY: 90 * deg,
        minZ: -180 * deg,
        maxZ: 45 * deg,
      },
      // Knees only bend backwards
      leftKnee: {
        minX: 0,
        maxX: 150 * deg,
        poleVector: new Vector3(0, 0, 1).normalize(),
      },
      rightKnee: {
        minX: 0,
        maxX: 150 * deg,
        poleVector: new Vector3(0, 0, 1).normalize(),
      },
    };
  }

  setMaxIterations(count: number): void {
    this.maxIterations = count;
  }

  setConvergenceThreshold(threshold: number): void {
    this.convergenceThreshold = threshold;
  }
}
