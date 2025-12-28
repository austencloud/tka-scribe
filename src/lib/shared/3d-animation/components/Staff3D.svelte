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
  import { AUSTEN_STAFF } from "../config/avatar-proportions";

  interface Props {
    /** Prop state with position and rotation */
    propState: PropState3D;
    /** Prop color */
    color: "blue" | "red";
    /** Whether to show the prop */
    visible?: boolean;
    /** Staff length in scene units (default: 34" staff = 173 units) */
    length?: number;
    /** Staff thickness (radius of the tube) */
    thickness?: number;
  }

  let {
    propState,
    color,
    visible = true,
    length = AUSTEN_STAFF.length, // 34" staff = 86.4cm = 173 units
    thickness = AUSTEN_STAFF.radius * 2, // ~1" diameter = 5 units diameter
  }: Props = $props();

  // T-bar dimensions - proportional to staff
  // T-bar length (perpendicular extent) from SVG ratio: 57.6/252.8 = 22.8%
  const tBarLength = $derived(length * 0.228); // ~68 for length 300
  // T-bar thickness should match shaft thickness (in SVG they're nearly equal: 18.2 vs 17)
  const tBarThickness = $derived(thickness); // Slightly thinner than main shaft

  // Color values
  const colors = {
    blue: { main: "var(--semantic-info)", dark: "#1d4ed8", light: "var(--semantic-info)" },
    red: { main: "var(--semantic-error)", dark: "#b91c1c", light: "var(--semantic-error)" },
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
    <!-- Staff CENTER (grip) is at the hand/grid point -->
    <!-- Main staff body - cylinder along Y axis -->
    <T.Mesh>
      <T.CylinderGeometry args={[thickness, thickness, length, 16, 1]} />
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
      <T.SphereGeometry args={[thickness, 16, 16]} />
      <T.MeshStandardMaterial
        color={palette.dark}
        roughness={0.3}
        metalness={0.2}
      />
    </T.Mesh>

    <!-- Center grip ring (white, at the hand point) -->
    <T.Mesh>
      <T.TorusGeometry args={[thickness * 1.15, thickness * 0.15, 12, 24]} />
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
