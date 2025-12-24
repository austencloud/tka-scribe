<script lang="ts">
  /**
   * Grid3D Component
   *
   * Renders all three orthogonal grid planes (Wall, Wheel, Floor)
   * with visibility toggles for each.
   */

  import { T } from "@threlte/core";
  import GridPlane from "./GridPlane.svelte";
  import { Plane, PLANE_COLORS } from "../domain/enums/Plane";

  interface Props {
    /** Which planes to show */
    visiblePlanes?: Set<Plane>;
    /** Size of each plane */
    size?: number;
    /** Whether to show grid point labels */
    showLabels?: boolean;
    /** Opacity for plane surfaces */
    planeOpacity?: number;
  }

  let {
    visiblePlanes = new Set([Plane.WALL, Plane.WHEEL, Plane.FLOOR]),
    size = 300,
    showLabels = true,
    planeOpacity = 0.15,
  }: Props = $props();
</script>

<T.Group>
  <!-- Wall plane (purple) -->
  {#if visiblePlanes.has(Plane.WALL)}
    <GridPlane
      plane={Plane.WALL}
      color={PLANE_COLORS[Plane.WALL]}
      opacity={planeOpacity}
      {showLabels}
      {size}
    />
  {/if}

  <!-- Wheel plane (blue) -->
  {#if visiblePlanes.has(Plane.WHEEL)}
    <GridPlane
      plane={Plane.WHEEL}
      color={PLANE_COLORS[Plane.WHEEL]}
      opacity={planeOpacity}
      {showLabels}
      {size}
    />
  {/if}

  <!-- Floor plane (green) -->
  {#if visiblePlanes.has(Plane.FLOOR)}
    <GridPlane
      plane={Plane.FLOOR}
      color={PLANE_COLORS[Plane.FLOOR]}
      opacity={planeOpacity}
      {showLabels}
      {size}
    />
  {/if}

  <!-- Center point indicator (always visible) -->
  <T.Mesh position={[0, 0, 0]}>
    <T.SphereGeometry args={[8, 32, 32]} />
    <T.MeshBasicMaterial color="#fbbf24" />
  </T.Mesh>

  <!-- Axis helpers for orientation reference -->
  <T.Group>
    <!-- X axis (red) - performer's right -->
    <T.ArrowHelper
      args={[
        [1, 0, 0],
        [0, 0, 0],
        size * 1.2,
        0xff4444,
        15,
        8
      ]}
    />
    <!-- Y axis (green) - up/sky -->
    <T.ArrowHelper
      args={[
        [0, 1, 0],
        [0, 0, 0],
        size * 1.2,
        0x44ff44,
        15,
        8
      ]}
    />
    <!-- Z axis (blue) - toward audience -->
    <T.ArrowHelper
      args={[
        [0, 0, 1],
        [0, 0, 0],
        size * 1.2,
        0x4444ff,
        15,
        8
      ]}
    />
  </T.Group>
</T.Group>
