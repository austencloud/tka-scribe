<script lang="ts">
  /**
   * Staff3D Component
   *
   * Renders a 3D staff/tube that properly rotates in 3D space.
   * Uses cylinder geometry with spherical end caps.
   * No billboarding - actual 3D rotation based on plane and staff angle.
   */

  import { T } from "@threlte/core";
  import { Quaternion, Euler } from "three";
  import type { PropState3D } from "../domain/models/PropState3D";
  import { GRID_RADIUS_3D } from "../domain/constants/plane-transforms";

  interface Props {
    /** Prop state with position and rotation */
    propState: PropState3D;
    /** Prop color */
    color: "blue" | "red";
    /** Whether to show the prop */
    visible?: boolean;
    /** Staff length - defaults to full diameter (center to hand * 2) */
    length?: number;
    /** Staff thickness (radius of the tube) */
    thickness?: number;
  }

  let {
    propState,
    color,
    visible = true,
    length = GRID_RADIUS_3D * 2, // Full diameter: one end at center, other end extends outward
    thickness = 8,
  }: Props = $props();

  // Color values
  const colors = {
    blue: { main: "#3b82f6", dark: "#1d4ed8", light: "#60a5fa" },
    red: { main: "#ef4444", dark: "#b91c1c", light: "#f87171" },
  };
  const palette = $derived(colors[color]);

  // Position as tuple
  const position = $derived<[number, number, number]>([
    propState.worldPosition.x,
    propState.worldPosition.y,
    propState.worldPosition.z,
  ]);

  // Convert quaternion to Euler for T.Group rotation
  // The worldRotation quaternion already includes plane + staff angle rotation
  // We need to compose it with a 90° rotation to orient the cylinder horizontally
  const rotation = $derived.by(() => {
    // The cylinder is vertical by default (along Y axis)
    // We need to rotate it 90° around Z to make it horizontal (along X)
    const horizontalQuat = new Quaternion().setFromEuler(
      new Euler(0, 0, Math.PI / 2)
    );

    // Combine: first make horizontal, then apply world rotation
    const finalQuat = propState.worldRotation.clone().multiply(horizontalQuat);

    // Convert to Euler for Three.js rotation prop
    const euler = new Euler().setFromQuaternion(finalQuat);
    return [euler.x, euler.y, euler.z] as [number, number, number];
  });

  // Half length for positioning end caps
  const halfLength = $derived(length / 2);
</script>

{#if visible}
  <T.Group {position} rotation={rotation}>
    <!-- Main staff body - cylinder along Y axis (gets rotated horizontally) -->
    <T.Mesh>
      <T.CylinderGeometry args={[thickness, thickness, length, 16, 1]} />
      <T.MeshStandardMaterial
        color={palette.main}
        roughness={0.3}
        metalness={0.2}
      />
    </T.Mesh>

    <!-- Top end cap (becomes one end when rotated) -->
    <T.Mesh position={[0, halfLength, 0]}>
      <T.SphereGeometry args={[thickness, 16, 16]} />
      <T.MeshStandardMaterial
        color={palette.dark}
        roughness={0.3}
        metalness={0.2}
      />
    </T.Mesh>

    <!-- Bottom end cap (becomes other end when rotated) -->
    <T.Mesh position={[0, -halfLength, 0]}>
      <T.SphereGeometry args={[thickness, 16, 16]} />
      <T.MeshStandardMaterial
        color={palette.dark}
        roughness={0.3}
        metalness={0.2}
      />
    </T.Mesh>

    <!-- Center grip ring -->
    <T.Mesh>
      <T.TorusGeometry args={[thickness + 2, 2, 8, 16]} />
      <T.MeshStandardMaterial
        color="white"
        roughness={0.4}
        metalness={0.1}
      />
    </T.Mesh>
  </T.Group>

  <!-- Trail indicator (small sphere at prop position for path visualization) -->
  <T.Mesh position={position}>
    <T.SphereGeometry args={[3, 8, 8]} />
    <T.MeshBasicMaterial color={palette.main} opacity={0.4} transparent />
  </T.Mesh>
{/if}
