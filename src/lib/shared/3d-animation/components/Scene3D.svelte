<script lang="ts">
  /**
   * Scene3D Component
   *
   * Main 3D scene container using Threlte.
   * Includes:
   * - Camera with orbit controls
   * - Lighting
   * - Grid planes
   * - Props (when provided)
   */

  import { Canvas } from "@threlte/core";
  import { T } from "@threlte/core";
  import { OrbitControls } from "@threlte/extras";
  import Grid3D from "./Grid3D.svelte";
  import { Plane } from "../domain/enums/Plane";

  import type { Snippet } from "svelte";

  interface Props {
    /** Which planes to show */
    visiblePlanes?: Set<Plane>;
    /** Whether to show the grid */
    showGrid?: boolean;
    /** Whether to show grid point labels */
    showLabels?: boolean;
    /** Camera position preset */
    cameraPreset?: "front" | "top" | "side" | "perspective";
    /** Children content (props, etc.) */
    children?: Snippet;
  }

  let {
    visiblePlanes = new Set([Plane.WALL, Plane.WHEEL, Plane.FLOOR]),
    showGrid = true,
    showLabels = true,
    cameraPreset = "perspective",
    children,
  }: Props = $props();

  // Camera position based on preset
  const cameraPositions = {
    front: [0, 0, 500] as [number, number, number], // Looking at Wall plane
    top: [0, 500, 0] as [number, number, number], // Looking at Floor plane
    side: [500, 0, 0] as [number, number, number], // Looking at Wheel plane
    perspective: [350, 280, 350] as [number, number, number], // Angled view
  };

  let cameraPosition = $derived(cameraPositions[cameraPreset]);
</script>

<div class="scene-container">
  <Canvas>
    <!-- Perspective Camera -->
    <T.PerspectiveCamera
      makeDefault
      position={cameraPosition}
      fov={50}
      near={1}
      far={2000}
    >
      <!-- Orbit controls attached to camera -->
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={100}
        maxDistance={1000}
      />
    </T.PerspectiveCamera>

    <!-- Ambient light for base illumination -->
    <T.AmbientLight intensity={0.6} color="#ffffff" />

    <!-- Directional light for depth -->
    <T.DirectionalLight
      position={[200, 300, 200]}
      intensity={0.8}
      color="#ffffff"
    />

    <!-- Additional fill light from opposite side -->
    <T.DirectionalLight
      position={[-100, 100, -100]}
      intensity={0.3}
      color="#ffffff"
    />

    <!-- Grid planes -->
    {#if showGrid}
      <Grid3D {visiblePlanes} {showLabels} />
    {/if}

    <!-- Children content (props, etc.) -->
    {#if children}
      {@render children()}
    {/if}
  </Canvas>
</div>

<style>
  .scene-container {
    width: 100%;
    height: 100%;
    min-height: 400px;
    background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 8px;
    overflow: hidden;
  }
</style>
