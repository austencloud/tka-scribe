<script lang="ts">
  /**
   * Staff3D Component
   *
   * Renders a 3D staff that matches the 2D SVG design:
   * - Main cylindrical body
   * - T-bar at the thumb end (the tracked end)
   * - Rounded cap at the other end
   * - Center grip ring
   *
   * No billboarding - actual 3D rotation based on plane and staff angle.
   */

  import { T } from "@threlte/core";
  import { Quaternion, Euler } from "three";
  import type { PropState3D } from "../domain/models/PropState3D";
  import { userProportionsState } from "../state/user-proportions-state.svelte";

  interface Props {
    /** Prop state with position and rotation */
    propState: PropState3D;
    /** Prop color */
    color: "blue" | "red";
    /** Whether to show the prop */
    visible?: boolean;
    /** Staff length in scene units (default: from user proportions) */
    length?: number;
    /** Staff thickness (radius of the tube) */
    thickness?: number;
    /** Avatar world position - props are offset from this */
    avatarPosition?: { x: number; y: number; z: number };
  }

  let {
    propState,
    color,
    visible = true,
    length, // Will use user proportions if not provided
    thickness, // Will use user proportions if not provided
    avatarPosition = { x: 0, y: 0, z: 0 }, // Avatar's world position
  }: Props = $props();

  // Use user proportions as defaults if not explicitly provided
  const effectiveLength = $derived(length ?? userProportionsState.staffLength);
  const effectiveThickness = $derived(thickness ?? userProportionsState.dimensions.staffRadius * 2);

  // T-bar dimensions - proportional to staff
  // T-bar length (perpendicular extent) from SVG ratio: 57.6/252.8 = 22.8%
  const tBarLength = $derived(effectiveLength * 0.228); // ~68 for length 300
  // T-bar thickness should match shaft thickness (in SVG they're nearly equal: 18.2 vs 17)
  const tBarThickness = $derived(effectiveThickness); // Slightly thinner than main shaft

  // Color values - use hex for Three.js compatibility
  const colors = {
    blue: { main: "#3b82f6", dark: "#1d4ed8", light: "#60a5fa" },
    red: { main: "#ef4444", dark: "#b91c1c", light: "#f87171" },
  };
  const palette = $derived(colors[color]);

  // Position as tuple (prop position offset by avatar's world position)
  const position = $derived<[number, number, number]>([
    propState.worldPosition.x + avatarPosition.x,
    propState.worldPosition.y + avatarPosition.y,
    propState.worldPosition.z + avatarPosition.z,
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
  const halfLength = $derived(effectiveLength / 2);
</script>

{#if visible}
  <T.Group {position} rotation={rotation}>
    <!-- Staff CENTER (grip) is at the hand/grid point -->
    <!-- Main staff body - cylinder along Y axis -->
    <T.Mesh>
      <T.CylinderGeometry args={[effectiveThickness, effectiveThickness, effectiveLength, 16, 1]} />
      <T.MeshStandardMaterial
        color={palette.main}
        roughness={0.3}
        metalness={0.2}
      />
    </T.Mesh>

    <!-- T-bar at thumb end - PERPENDICULAR crossbar like in 2D SVG -->
    <T.Group position={[0, halfLength, 0]}>
      <!-- Perpendicular crossbar - rotated 90° around Z to cross the shaft -->
      <T.Mesh rotation={[0, 0, Math.PI / 2]}>
        <T.CylinderGeometry args={[tBarThickness, tBarThickness, tBarLength, 12, 1]} />
        <T.MeshStandardMaterial
          color={palette.main}
          roughness={0.3}
          metalness={0.2}
        />
      </T.Mesh>
      <!-- Left cap of T-bar -->
      <T.Mesh position={[-tBarLength / 2, 0, 0]}>
        <T.SphereGeometry args={[tBarThickness, 12, 12]} />
        <T.MeshStandardMaterial
          color={palette.dark}
          roughness={0.3}
          metalness={0.2}
        />
      </T.Mesh>
      <!-- Right cap of T-bar -->
      <T.Mesh position={[tBarLength / 2, 0, 0]}>
        <T.SphereGeometry args={[tBarThickness, 12, 12]} />
        <T.MeshStandardMaterial
          color={palette.dark}
          roughness={0.3}
          metalness={0.2}
        />
      </T.Mesh>
    </T.Group>

    <!-- Rounded cap at other end -->
    <T.Mesh position={[0, -halfLength, 0]}>
      <T.SphereGeometry args={[effectiveThickness, 16, 16]} />
      <T.MeshStandardMaterial
        color={palette.dark}
        roughness={0.3}
        metalness={0.2}
      />
    </T.Mesh>

    <!-- Center grip ring (white, at the hand point) -->
    <T.Mesh>
      <T.TorusGeometry args={[effectiveThickness * 1.15, effectiveThickness * 0.15, 12, 24]} />
      <T.MeshStandardMaterial
        color="white"
        roughness={0.4}
        metalness={0.1}
      />
    </T.Mesh>
  </T.Group>

  <!-- Trail indicator (small sphere at prop position for path visualization) -->
  <T.Mesh position={position}>
    <T.SphereGeometry args={[2, 8, 8]} />
    <T.MeshBasicMaterial color={palette.main} opacity={0.3} transparent />
  </T.Mesh>
{/if}
