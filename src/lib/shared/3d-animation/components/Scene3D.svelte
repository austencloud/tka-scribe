<script module lang="ts">
  export interface CameraState {
    position: [number, number, number];
    target: [number, number, number];
  }
</script>

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
   * - Optional bloom post-processing
   */

  import { Canvas } from "@threlte/core";
  import { T } from "@threlte/core";
  import { OrbitControls } from "@threlte/extras";
  import { EffectComposer } from "threlte-postprocessing";
  import Grid3D from "./Grid3D.svelte";
  import BloomEffect from "../effects/post-processing/BloomEffect.svelte";
  import Environment3D from "../environments/components/Environment3D.svelte";
  import { BackgroundType } from "$lib/shared/background/shared/domain/enums/background-enums";
  import { Plane } from "../domain/enums/Plane";
  import type { GridMode } from "../domain/constants/grid-layout";

  import type { Snippet } from "svelte";

  interface Props {
    /** Which planes to show */
    visiblePlanes?: Set<Plane>;
    /** Whether to show the grid */
    showGrid?: boolean;
    /** Whether to show grid point labels */
    showLabels?: boolean;
    /** Grid mode: diamond or box */
    gridMode?: GridMode;
    /** Camera position preset */
    cameraPreset?: "front" | "top" | "side" | "perspective";
    /** Custom camera position (overrides preset) */
    customCameraPosition?: [number, number, number] | null;
    /** Custom camera target (overrides default) */
    customCameraTarget?: [number, number, number] | null;
    /** Callback when camera moves (for persistence) */
    onCameraChange?: (state: CameraState) => void;
    /** Enable bloom post-processing effect */
    bloomEnabled?: boolean;
    /** Bloom effect intensity (0 = none, higher = stronger glow) */
    bloomIntensity?: number;
    /** Bloom luminance threshold (0-1, only pixels brighter than this glow) */
    bloomThreshold?: number;
    /** Bloom blur radius (how far glow spreads) */
    bloomRadius?: number;
    /** Background type - controls both 2D theme and 3D environment */
    backgroundType?: BackgroundType;
    /** Children content (props, etc.) */
    children?: Snippet;
  }

  let {
    visiblePlanes = new Set([Plane.WALL, Plane.WHEEL, Plane.FLOOR]),
    showGrid = true,
    showLabels = true,
    gridMode = "diamond",
    cameraPreset = "perspective",
    customCameraPosition = null,
    customCameraTarget = null,
    onCameraChange,
    bloomEnabled = false,
    bloomIntensity = 1.5,
    bloomThreshold = 0.8,
    bloomRadius = 0.4,
    backgroundType = BackgroundType.SOLID_COLOR,
    children,
  }: Props = $props();

  // Determine if this is a night/dark environment that needs reduced lighting
  const isNightEnvironment = $derived(
    backgroundType === BackgroundType.FIREFLY_FOREST ||
    backgroundType === BackgroundType.NIGHT_SKY ||
    backgroundType === BackgroundType.AURORA ||
    backgroundType === BackgroundType.DEEP_OCEAN
  );

  // Environment-aware lighting intensities
  const ambientIntensity = $derived(isNightEnvironment ? 0.2 : 0.6);
  const mainLightIntensity = $derived(isNightEnvironment ? 0.35 : 0.8);
  const fillLightIntensity = $derived(isNightEnvironment ? 0.15 : 0.3);

  // Light colors - cool tint for night, warm neutral for day
  const ambientColor = $derived(isNightEnvironment ? "#4466aa" : "#ffffff");
  const mainLightColor = $derived(isNightEnvironment ? "#6688cc" : "#ffffff");
  const fillLightColor = $derived(isNightEnvironment ? "#334477" : "#ffffff");

  // Camera position based on preset
  // Grid radius is ~300, so camera at ~800 gives good overview with padding
  const cameraPositions = {
    front: [0, 0, 800] as [number, number, number], // Looking at Wall plane
    top: [0, 800, 0] as [number, number, number], // Looking at Floor plane
    side: [800, 0, 0] as [number, number, number], // Looking at Wheel plane
    perspective: [550, 450, 550] as [number, number, number], // Angled view
  };

  // Use custom position if provided, otherwise use preset
  let cameraPosition = $derived(customCameraPosition ?? cameraPositions[cameraPreset]);
  let cameraTarget = $derived(customCameraTarget ?? [0, 0, 0] as [number, number, number]);

  // Track if we should use custom position (set to false when preset changes)
  let useCustom = $state(false);

  // Reset custom tracking when preset changes explicitly
  $effect(() => {
    // Access cameraPreset to create dependency
    const _ = cameraPreset;
    useCustom = false;
  });

  // Reference to orbit controls for getting camera state
  let controlsRef = $state<any>(null);

  // Handle orbit control changes
  function handleCameraChange() {
    if (!onCameraChange || !controlsRef) return;

    const camera = controlsRef.object;
    const target = controlsRef.target;

    if (camera && target) {
      onCameraChange({
        position: [camera.position.x, camera.position.y, camera.position.z],
        target: [target.x, target.y, target.z],
      });
    }
  }
</script>

<div class="scene-container">
  <Canvas>
    <!-- Perspective Camera -->
    <T.PerspectiveCamera
      makeDefault
      position={cameraPosition}
      fov={65}
      near={1}
      far={6000}
    >
      <!-- Orbit controls attached to camera -->
      <OrbitControls
        bind:ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={200}
        maxDistance={1500}
        target={cameraTarget}
        onchange={handleCameraChange}
      />
    </T.PerspectiveCamera>

    <!-- Ambient light for base illumination (reduced for night environments) -->
    <T.AmbientLight intensity={ambientIntensity} color={ambientColor} />

    <!-- Directional light for depth (reduced for night environments) -->
    <T.DirectionalLight
      position={[200, 300, 200]}
      intensity={mainLightIntensity}
      color={mainLightColor}
    />

    <!-- Additional fill light from opposite side -->
    <T.DirectionalLight
      position={[-100, 100, -100]}
      intensity={fillLightIntensity}
      color={fillLightColor}
    />

    <!-- Post-processing effects (wraps scene content when enabled) -->
    {#if bloomEnabled}
      <EffectComposer>
        <!-- 3D Environment (sky, ground, particles - matches 2D theme) -->
        <Environment3D {backgroundType} />

        <!-- Grid planes -->
        {#if showGrid}
          <Grid3D {visiblePlanes} {showLabels} {gridMode} />
        {/if}

        <!-- Children content (props, etc.) -->
        {#if children}
          {@render children()}
        {/if}

        <!-- Bloom effect -->
        <BloomEffect
          enabled={bloomEnabled}
          intensity={bloomIntensity}
          luminanceThreshold={bloomThreshold}
          radius={bloomRadius}
        />
      </EffectComposer>
    {:else}
      <!-- 3D Environment (sky, ground, particles - matches 2D theme) -->
      <Environment3D {backgroundType} />

      <!-- Grid planes -->
      {#if showGrid}
        <Grid3D {visiblePlanes} {showLabels} {gridMode} />
      {/if}

      <!-- Children content (props, etc.) -->
      {#if children}
        {@render children()}
      {/if}
    {/if}
  </Canvas>
</div>

<style>
  .scene-container {
    width: 100%;
    height: 100%;
    min-height: 400px;
    /* Background now handled by SkyGradient in 3D when environment is active */
    /* Fallback gradient for NONE environment type */
    background: linear-gradient(180deg, #0a0a12 0%, #050510 100%);
    border-radius: 8px;
    overflow: hidden;
  }
</style>
