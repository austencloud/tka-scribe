<script lang="ts">
  /**
   * GridPlane Component
   *
   * Renders a single grid plane with:
   * - Semi-transparent plane surface
   * - 8 grid point markers (N, NE, E, SE, S, SW, W, NW)
   * - Center point marker
   */

  import { T } from "@threlte/core";
  import { Text } from "@threlte/extras";
  import { DoubleSide } from "three";
  import { Plane, PLANE_LABELS } from "../domain/enums/Plane";
  import { GridLocation } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import { LOCATION_ANGLES } from "$lib/features/compose/shared/domain/math-constants";
  import {
    GRID_RADIUS_3D,
    planeAngleToWorldPosition,
  } from "../domain/constants/plane-transforms";

  interface Props {
    plane: Plane;
    color?: string;
    opacity?: number;
    showLabels?: boolean;
    size?: number;
  }

  let {
    plane,
    color = "#8b5cf6",
    opacity = 0.15,
    showLabels = true,
    size = 300,
  }: Props = $props();

  // Grid point locations
  const gridLocations = [
    GridLocation.NORTH,
    GridLocation.NORTHEAST,
    GridLocation.EAST,
    GridLocation.SOUTHEAST,
    GridLocation.SOUTH,
    GridLocation.SOUTHWEST,
    GridLocation.WEST,
    GridLocation.NORTHWEST,
  ];

  // Get position for a grid location on this plane
  function getGridPointPosition(location: GridLocation): [number, number, number] {
    const angle = LOCATION_ANGLES[location];
    const pos = planeAngleToWorldPosition(plane, angle, GRID_RADIUS_3D);
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

  <!-- Grid circle outline using RingGeometry -->
  <T.Mesh position={[0, 0, 0.5]}>
    <T.RingGeometry args={[GRID_RADIUS_3D - 2, GRID_RADIUS_3D + 2, 64]} />
    <T.MeshBasicMaterial
      {color}
      opacity={0.4}
      transparent={true}
      side={DoubleSide}
    />
  </T.Mesh>

  <!-- Center point -->
  <T.Mesh position={[0, 0, 1]}>
    <T.SphereGeometry args={[5, 16, 16]} />
    <T.MeshBasicMaterial color="white" />
  </T.Mesh>
</T.Group>

<!-- Grid point markers (in world space for proper 3D positioning) -->
{#each gridLocations as location}
  {@const pos = getGridPointPosition(location)}
  <T.Mesh position={pos}>
    <T.SphereGeometry args={[6, 16, 16]} />
    <T.MeshBasicMaterial {color} />
  </T.Mesh>

  {#if showLabels}
    <Text
      text={locationLabels[location]}
      position={[pos[0] * 1.15, pos[1] * 1.15, pos[2] * 1.15]}
      fontSize={12}
      color="white"
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
