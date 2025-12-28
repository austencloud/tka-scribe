<script lang="ts">
  /**
   * GridPlane Component
   *
   * Renders a single grid plane with:
   * - Semi-transparent plane surface
   * - Center point (largest, white)
   * - Hand points (medium, plane color)
   * - Outer points (smallest, dimmer)
   */

  import { T } from "@threlte/core";
  import { Text } from "@threlte/extras";
  import { DoubleSide } from "three";
  import { Plane, PLANE_LABELS } from "../domain/enums/Plane";
  import { GridLocation } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import { LOCATION_ANGLES } from "$lib/features/compose/shared/domain/math-constants";
  import { planeAngleToWorldPosition } from "../domain/constants/plane-transforms";
  import {
    HAND_POINT_RADIUS,
    OUTER_POINT_RADIUS,
    CENTER_POINT_SIZE,
    HAND_POINT_SIZE,
    OUTER_POINT_SIZE,
    type GridMode,
    getHandPoints,
    getOuterPoints,
  } from "../domain/constants/grid-layout";

  interface Props {
    plane: Plane;
    color?: string;
    opacity?: number;
    showLabels?: boolean;
    size?: number;
    /** Grid mode: diamond (N/E/S/W as hands) or box (NE/SE/SW/NW as hands) */
    gridMode?: GridMode;
  }

  let {
    plane,
    color = "var(--theme-accent-strong)",
    opacity = 0.15,
    showLabels = true,
    size = OUTER_POINT_RADIUS + 50, // Ensure plane contains outer points with padding
    gridMode = "diamond",
  }: Props = $props();

  // Get points based on current mode
  const handPoints = $derived(getHandPoints(gridMode));
  const outerPoints = $derived(getOuterPoints(gridMode));

  // Get position for a grid location on this plane at a given radius
  function getGridPointPosition(
    location: GridLocation,
    radius: number
  ): [number, number, number] {
    const angle = LOCATION_ANGLES[location];
    const pos = planeAngleToWorldPosition(plane, angle, radius);
    return [pos.x, pos.y, pos.z];
  }

  // Get rotation based on plane
  function getPlaneRotation(): [number, number, number] {
    switch (plane) {
      case Plane.WALL:
        return [0, 0, 0];
      case Plane.WHEEL:
        return [0, Math.PI / 2, 0];
      case Plane.FLOOR:
        return [-Math.PI / 2, 0, 0];
      default:
        return [0, 0, 0];
    }
  }

  // Short labels for grid locations
  const locationLabels: Record<GridLocation, string> = {
    [GridLocation.NORTH]: "N",
    [GridLocation.NORTHEAST]: "NE",
    [GridLocation.EAST]: "E",
    [GridLocation.SOUTHEAST]: "SE",
    [GridLocation.SOUTH]: "S",
    [GridLocation.SOUTHWEST]: "SW",
    [GridLocation.WEST]: "W",
    [GridLocation.NORTHWEST]: "NW",
  };

  // Get label position for the plane title
  function getPlaneLabelPosition(): [number, number, number] {
    switch (plane) {
      case Plane.WALL:
        return [0, size * 0.9, 0];
      case Plane.WHEEL:
        return [0, size * 0.9, 0];
      case Plane.FLOOR:
        return [0, 0, -size * 0.9];
      default:
        return [0, size * 0.9, 0];
    }
  }
</script>

<!-- Plane group with rotation -->
<T.Group rotation={getPlaneRotation()}>
  <!-- Semi-transparent plane surface -->
  <T.Mesh>
    <T.PlaneGeometry args={[size * 2, size * 2]} />
    <T.MeshBasicMaterial
      {color}
      {opacity}
      transparent={true}
      side={DoubleSide}
      depthWrite={false}
    />
  </T.Mesh>

  <!-- Hand point circle (inner ring) -->
  <T.Mesh position={[0, 0, 0.5]}>
    <T.RingGeometry args={[HAND_POINT_RADIUS - 1.5, HAND_POINT_RADIUS + 1.5, 64]} />
    <T.MeshBasicMaterial
      {color}
      opacity={0.5}
      transparent={true}
      side={DoubleSide}
    />
  </T.Mesh>

  <!-- Outer point circle -->
  <T.Mesh position={[0, 0, 0.3]}>
    <T.RingGeometry args={[OUTER_POINT_RADIUS - 1, OUTER_POINT_RADIUS + 1, 64]} />
    <T.MeshBasicMaterial
      {color}
      opacity={0.25}
      transparent={true}
      side={DoubleSide}
    />
  </T.Mesh>

  <!-- Center point (largest, white/gold) -->
  <T.Mesh position={[0, 0, 1]}>
    <T.SphereGeometry args={[CENTER_POINT_SIZE, 16, 16]} />
    <T.MeshBasicMaterial color="var(--semantic-warning)" />
  </T.Mesh>
</T.Group>

<!-- Hand point markers (medium size, at hand radius) -->
{#each handPoints as location}
  {@const pos = getGridPointPosition(location, HAND_POINT_RADIUS)}
  <T.Mesh position={pos}>
    <T.SphereGeometry args={[HAND_POINT_SIZE, 16, 16]} />
    <T.MeshBasicMaterial {color} />
  </T.Mesh>

  {#if showLabels}
    <Text
      text={locationLabels[location]}
      position={[pos[0] * 1.12, pos[1] * 1.12, pos[2] * 1.12]}
      fontSize={14}
      color="white"
      anchorX="center"
      anchorY="middle"
    />
  {/if}
{/each}

<!-- Outer point markers (smaller, at outer radius) -->
{#each outerPoints as location}
  {@const pos = getGridPointPosition(location, OUTER_POINT_RADIUS)}
  <T.Mesh position={pos}>
    <T.SphereGeometry args={[OUTER_POINT_SIZE, 12, 12]} />
    <T.MeshBasicMaterial color={color} opacity={0.6} transparent />
  </T.Mesh>

  {#if showLabels}
    <Text
      text={locationLabels[location]}
      position={[pos[0] * 1.08, pos[1] * 1.08, pos[2] * 1.08]}
      fontSize={11}
      color="var(--theme-text-dim)"
      anchorX="center"
      anchorY="middle"
    />
  {/if}
{/each}

<!-- Plane label -->
{#if showLabels}
  <Text
    text={PLANE_LABELS[plane]}
    position={getPlaneLabelPosition()}
    fontSize={16}
    {color}
    anchorX="center"
    anchorY="middle"
  />
{/if}
