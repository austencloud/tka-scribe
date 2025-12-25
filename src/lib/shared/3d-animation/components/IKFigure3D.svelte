<script lang="ts">
  /**
   * IKFigure3D Component
   *
   * A humanoid figure with 2-bone IK arms.
   * Based on real-world measurements (default: 6'3" lanky build).
   *
   * Scale: 1 unit = 0.5 cm (so 34" staff = 173 units)
   */

  import { T } from "@threlte/core";
  import { Vector3 } from "three";
  import type { PropState3D } from "../domain/models/PropState3D";
  import LimbSegment from "./LimbSegment.svelte";
  import {
    AUSTEN_MEASUREMENTS,
    deriveSceneProportions,
    type AvatarMeasurements,
  } from "../config/avatar-proportions";

  export type BodyType = "masculine" | "feminine";

  interface Props {
    bluePropState: PropState3D | null;
    redPropState: PropState3D | null;
    visible?: boolean;
    bodyType?: BodyType;
    skinTone?: string;
    measurements?: AvatarMeasurements;
  }

  let {
    bluePropState,
    redPropState,
    visible = true,
    bodyType = "masculine",
    skinTone = "#d4a574",
    measurements = AUSTEN_MEASUREMENTS,
  }: Props = $props();

  // Derive proportions from real measurements
  const props = $derived(deriveSceneProportions(measurements, bodyType));

  // Colors
  const BODY_COLOR = "#4a5568";

  // ═══════════════════════════════════════════════════════════════════════════
  // 2-BONE IK SOLVER
  // ═══════════════════════════════════════════════════════════════════════════

  function solve2BoneIK(
    shoulder: Vector3,
    target: Vector3,
    upperLen: number,
    lowerLen: number,
    poleHint: Vector3
  ): { elbow: Vector3; wrist: Vector3 } {
    const toTarget = target.clone().sub(shoulder);
    const dist = toTarget.length();
    const maxReach = upperLen + lowerLen;
    const minReach = Math.abs(upperLen - lowerLen);

    // Clamp target to reachable range
    let reachDist = dist;
    if (dist > maxReach * 0.999) {
      reachDist = maxReach * 0.999;
    } else if (dist < minReach * 1.001) {
      reachDist = minReach * 1.001;
    }

    // Law of cosines: find angle at shoulder
    const cosAngle =
      (upperLen * upperLen + reachDist * reachDist - lowerLen * lowerLen) /
      (2 * upperLen * reachDist);
    const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));

    // Direction to target
    const dir = toTarget.clone().normalize();

    // Find perpendicular axis for rotation (using pole hint)
    let perp = new Vector3().crossVectors(dir, poleHint);
    if (perp.lengthSq() < 0.0001) {
      perp = new Vector3().crossVectors(dir, new Vector3(0, 1, 0));
      if (perp.lengthSq() < 0.0001) {
        perp.set(1, 0, 0);
      }
    }
    perp.normalize();

    // Rotate direction by angle to get elbow direction
    const elbowDir = dir.clone().applyAxisAngle(perp, angle);
    const elbow = shoulder.clone().add(elbowDir.multiplyScalar(upperLen));

    // Wrist is at target (clamped)
    const wrist = shoulder.clone().add(dir.multiplyScalar(reachDist));

    return { elbow, wrist };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ARM POSITIONS (reactive)
  // ═══════════════════════════════════════════════════════════════════════════

  // Shoulder positions
  const leftShoulder = $derived(
    new Vector3(-props.shoulderX, props.shoulderY, props.figureZ)
  );
  const rightShoulder = $derived(
    new Vector3(props.shoulderX, props.shoulderY, props.figureZ)
  );

  // Hand targets from prop states
  // IMPORTANT: Screen left (-X) = performer's RIGHT (red)
  //            Screen right (+X) = performer's LEFT (blue)
  // (Because we view the performer from in front)
  const leftTarget = $derived(
    redPropState  // Performer's RIGHT hand (screen left)
      ? new Vector3(
          redPropState.worldPosition.x,
          redPropState.worldPosition.y,
          redPropState.worldPosition.z
        )
      : new Vector3(
          -props.shoulderX - props.upperArmLength * 0.5,
          props.shoulderY - props.upperArmLength * 0.5,
          props.figureZ + 40
        )
  );

  const rightTarget = $derived(
    bluePropState  // Performer's LEFT hand (screen right)
      ? new Vector3(
          bluePropState.worldPosition.x,
          bluePropState.worldPosition.y,
          bluePropState.worldPosition.z
        )
      : new Vector3(
          props.shoulderX + props.upperArmLength * 0.5,
          props.shoulderY - props.upperArmLength * 0.5,
          props.figureZ + 40
        )
  );

  // Pole hints (where elbows should bend toward - backward and outward)
  const leftPole = new Vector3(-0.5, -0.3, -1).normalize();
  const rightPole = new Vector3(0.5, -0.3, -1).normalize();

  // Solve IK for both arms
  const leftArm = $derived(
    solve2BoneIK(
      leftShoulder,
      leftTarget,
      props.upperArmLength,
      props.forearmLength,
      leftPole
    )
  );
  const rightArm = $derived(
    solve2BoneIK(
      rightShoulder,
      rightTarget,
      props.upperArmLength,
      props.forearmLength,
      rightPole
    )
  );

  // Convert to tuple format for Threlte
  const toTuple = (v: Vector3): [number, number, number] => [v.x, v.y, v.z];

  const leftShoulderPos = $derived(toTuple(leftShoulder));
  const leftElbowPos = $derived(toTuple(leftArm.elbow));
  const leftWristPos = $derived(toTuple(leftArm.wrist));

  const rightShoulderPos = $derived(toTuple(rightShoulder));
  const rightElbowPos = $derived(toTuple(rightArm.elbow));
  const rightWristPos = $derived(toTuple(rightArm.wrist));

  // Body part positions
  const headPos = $derived<[number, number, number]>([0, props.headY, props.figureZ]);
  const neckPos = $derived<[number, number, number]>([0, props.neckY, props.figureZ]);
  const torsoPos = $derived<[number, number, number]>([0, props.torsoY, props.figureZ]);
  const hipPos = $derived<[number, number, number]>([0, props.hipY, props.figureZ]);

  // Leg positions (thigh center, shin center)
  const leftThighY = $derived((props.hipY + props.kneeY) / 2);
  const rightThighY = leftThighY;
  const leftShinY = $derived((props.kneeY + props.ankleY) / 2);
  const rightShinY = leftShinY;
</script>

{#if visible}
  <!-- ═══════════════ LEFT ARM ═══════════════ -->
  <LimbSegment
    from={leftShoulderPos}
    to={leftElbowPos}
    thickness={props.armThickness}
    color={skinTone}
  />
  <LimbSegment
    from={leftElbowPos}
    to={leftWristPos}
    thickness={props.armThickness}
    color={skinTone}
  />

  <T.Mesh position={leftShoulderPos}>
    <T.SphereGeometry args={[props.jointRadius, 12, 12]} />
    <T.MeshStandardMaterial color={skinTone} roughness={0.6} />
  </T.Mesh>
  <T.Mesh position={leftElbowPos}>
    <T.SphereGeometry args={[props.jointRadius, 12, 12]} />
    <T.MeshStandardMaterial color={skinTone} roughness={0.6} />
  </T.Mesh>
  <T.Mesh position={leftWristPos}>
    <T.SphereGeometry args={[props.wristRadius, 12, 12]} />
    <T.MeshStandardMaterial color={skinTone} roughness={0.6} />
  </T.Mesh>

  <!-- ═══════════════ RIGHT ARM ═══════════════ -->
  <LimbSegment
    from={rightShoulderPos}
    to={rightElbowPos}
    thickness={props.armThickness}
    color={skinTone}
  />
  <LimbSegment
    from={rightElbowPos}
    to={rightWristPos}
    thickness={props.armThickness}
    color={skinTone}
  />

  <T.Mesh position={rightShoulderPos}>
    <T.SphereGeometry args={[props.jointRadius, 12, 12]} />
    <T.MeshStandardMaterial color={skinTone} roughness={0.6} />
  </T.Mesh>
  <T.Mesh position={rightElbowPos}>
    <T.SphereGeometry args={[props.jointRadius, 12, 12]} />
    <T.MeshStandardMaterial color={skinTone} roughness={0.6} />
  </T.Mesh>
  <T.Mesh position={rightWristPos}>
    <T.SphereGeometry args={[props.wristRadius, 12, 12]} />
    <T.MeshStandardMaterial color={skinTone} roughness={0.6} />
  </T.Mesh>

  <!-- ═══════════════ HEAD & NECK ═══════════════ -->
  <T.Mesh position={headPos}>
    <T.SphereGeometry args={[props.headRadius, 16, 16]} />
    <T.MeshStandardMaterial color={skinTone} roughness={0.6} />
  </T.Mesh>

  <T.Mesh position={neckPos}>
    <T.CylinderGeometry
      args={[props.neckRadius, props.neckRadius, props.neckLength, 8]}
    />
    <T.MeshStandardMaterial color={skinTone} roughness={0.6} />
  </T.Mesh>

  <!-- ═══════════════ TORSO ═══════════════ -->
  <T.Mesh position={torsoPos}>
    <T.CylinderGeometry
      args={[props.torsoTopRadius, props.torsoBottomRadius, props.torsoLength, 8]}
    />
    <T.MeshStandardMaterial color={BODY_COLOR} roughness={0.5} />
  </T.Mesh>

  <!-- Shoulders bar -->
  <T.Mesh
    position={[0, props.shoulderY, props.figureZ]}
    rotation={[0, 0, Math.PI / 2]}
  >
    <T.CylinderGeometry
      args={[props.shoulderBarRadius, props.shoulderBarRadius, props.shoulderX * 2, 8]}
    />
    <T.MeshStandardMaterial color={BODY_COLOR} roughness={0.5} />
  </T.Mesh>

  <!-- Hips bar -->
  <T.Mesh position={hipPos} rotation={[0, 0, Math.PI / 2]}>
    <T.CylinderGeometry
      args={[props.hipBarRadius, props.hipBarRadius, props.hipWidth * 2, 8]}
    />
    <T.MeshStandardMaterial color={BODY_COLOR} roughness={0.5} />
  </T.Mesh>

  <!-- ═══════════════ LEGS ═══════════════ -->
  <!-- Left thigh -->
  <T.Mesh position={[-props.hipWidth, leftThighY, props.figureZ]}>
    <T.CylinderGeometry
      args={[props.legThickness, props.legThickness * 0.9, props.thighLength, 8]}
    />
    <T.MeshStandardMaterial color={BODY_COLOR} roughness={0.5} />
  </T.Mesh>

  <!-- Right thigh -->
  <T.Mesh position={[props.hipWidth, rightThighY, props.figureZ]}>
    <T.CylinderGeometry
      args={[props.legThickness, props.legThickness * 0.9, props.thighLength, 8]}
    />
    <T.MeshStandardMaterial color={BODY_COLOR} roughness={0.5} />
  </T.Mesh>

  <!-- Left shin -->
  <T.Mesh position={[-props.hipWidth, leftShinY, props.figureZ]}>
    <T.CylinderGeometry
      args={[props.legThickness * 0.9, props.legThickness * 0.7, props.shinLength, 8]}
    />
    <T.MeshStandardMaterial color={BODY_COLOR} roughness={0.5} />
  </T.Mesh>

  <!-- Right shin -->
  <T.Mesh position={[props.hipWidth, rightShinY, props.figureZ]}>
    <T.CylinderGeometry
      args={[props.legThickness * 0.9, props.legThickness * 0.7, props.shinLength, 8]}
    />
    <T.MeshStandardMaterial color={BODY_COLOR} roughness={0.5} />
  </T.Mesh>

  <!-- Left foot -->
  <T.Mesh
    position={[-props.hipWidth, props.footY, props.figureZ + props.footLength / 3]}
    rotation={[Math.PI / 2, 0, 0]}
  >
    <T.CylinderGeometry
      args={[props.legThickness * 0.7, props.legThickness * 0.6, props.footLength, 8]}
    />
    <T.MeshStandardMaterial color={BODY_COLOR} roughness={0.5} />
  </T.Mesh>

  <!-- Right foot -->
  <T.Mesh
    position={[props.hipWidth, props.footY, props.figureZ + props.footLength / 3]}
    rotation={[Math.PI / 2, 0, 0]}
  >
    <T.CylinderGeometry
      args={[props.legThickness * 0.7, props.legThickness * 0.6, props.footLength, 8]}
    />
    <T.MeshStandardMaterial color={BODY_COLOR} roughness={0.5} />
  </T.Mesh>
{/if}
