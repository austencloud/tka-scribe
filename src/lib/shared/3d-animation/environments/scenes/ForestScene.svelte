<script lang="ts">
  /**
   * ForestScene
   *
   * A forest clearing environment with KayKit 3D models arranged in a ring
   * around the performer. Includes falling leaves and supports autumn/firefly variants.
   */

  import { T, useThrelte } from "@threlte/core";
  import { useGltf } from "@threlte/extras";
  import TexturedGroundPlane from "../primitives/TexturedGroundPlane.svelte";
  import SkyGradient from "../primitives/SkyGradient.svelte";
  import FallingParticles from "../primitives/FallingParticles.svelte";
  import type { ForestVariant } from "../domain/enums/environment-enums";
  import { userProportionsState } from "../../state/user-proportions-state.svelte";
  import VolumetricFireComponent from "../../effects/volumetric-fire/VolumetricFireComponent.svelte";
  import { Vector3, FogExp2, Color } from "three";

  interface Props {
    /** Color variant: autumn (warm) or firefly (cool green) */
    variant?: ForestVariant;
  }

  let { variant = "autumn" }: Props = $props();

  // Load KayKit forest models
  const tree1 = useGltf("/models/forest/Tree_1_A_Color1.gltf");
  const tree2 = useGltf("/models/forest/Tree_2_A_Color1.gltf");
  const tree3 = useGltf("/models/forest/Tree_3_A_Color1.gltf");
  const rock1 = useGltf("/models/forest/Rock_1_A_Color1.gltf");
  const rock2 = useGltf("/models/forest/Rock_1_B_Color1.gltf");
  const bush1 = useGltf("/models/forest/Bush_1_A_Color1.gltf");
  const bush2 = useGltf("/models/forest/Bush_2_A_Color1.gltf");

  // Load camping models (Kenney Survival Kit - CC0)
  const campfire = useGltf("/models/camping/campfire-pit.glb");
  const tent = useGltf("/models/camping/tent-canvas.glb");

  // Load forest floor detail models
  const fallenLog = useGltf("/models/camping/tree-log.glb");
  const fallenLogSmall = useGltf("/models/camping/tree-log-small.glb");

  // Get scene for fog
  const { scene } = useThrelte();

  // Campfire position - to the right and forward of performer
  // Scaled up significantly to match performer size
  const campfirePosition = { x: 600, z: -450 };
  const campfireScale = 500;

  // Tent position - behind and to the left of performer
  const tentPosition = { x: -650, z: 500 };
  const tentScale = 450;

  // Point light and fire emitter heights above campfire
  const campfireLightHeight = 150;

  // Fire dimensions - fire is centered at position, so we need to raise it by half its height
  const fireScale = 180;
  const fireHeight = 2.0; // Base height before scaling
  const fireHalfHeight = (fireHeight * fireScale) / 2; // 180 units
  const fireEmitterHeight = fireHalfHeight; // Position fire so bottom touches ground

  // Clearing radius - how far the inner ring of trees is from center
  const clearingRadius = 2000;

  // Multiple rings of trees to create depth - a true forest clearing feel
  // Ring 1: Inner edge of clearing (sparse, largest trees)
  // Ring 2: Mid-distance (denser, medium trees)
  // Ring 3: Far background (densest, smaller trees due to distance)
  // Ring 4: Distant backdrop (very dense, smallest)

  const treeRings = [
    { radius: 2000, count: 16, scaleBase: 280, scaleVariation: 80, radiusJitter: 200 },
    { radius: 2600, count: 24, scaleBase: 250, scaleVariation: 70, radiusJitter: 300 },
    { radius: 3300, count: 32, scaleBase: 220, scaleVariation: 60, radiusJitter: 350 },
    { radius: 4100, count: 40, scaleBase: 180, scaleVariation: 50, radiusJitter: 400 },
  ];

  // Generate all tree placements across all rings
  // Position format: [x, z, scale, rotationY]
  const treePlacements: [number, number, number, number][] = treeRings.flatMap(
    (ring, ringIndex) =>
      Array.from({ length: ring.count }, (_, i) => {
        // Offset each ring's starting angle so trees don't line up
        const angleOffset = ringIndex * 0.4;
        const angle = (i / ring.count) * Math.PI * 2 + angleOffset;

        // Add randomness to radius for natural clustering
        const seed = ringIndex * 100 + i;
        const radiusVariation = ring.radius + Math.sin(seed * 3.7) * ring.radiusJitter;
        const x = Math.cos(angle) * radiusVariation;
        const z = Math.sin(angle) * radiusVariation;

        // Scale varies by position for natural look
        const scale = ring.scaleBase + Math.abs(Math.sin(seed * 2.3) * ring.scaleVariation);

        // Trees face roughly toward center with variation
        const rotation = angle + Math.PI + Math.sin(seed * 1.7) * 0.3;

        return [x, z, scale, rotation] as [number, number, number, number];
      })
  );

  // Rock placements - scattered around the clearing edge
  const rockPlacements: [number, number, number, number][] = Array.from(
    { length: 10 },
    (_, i) => {
      const angle = (i / 10) * Math.PI * 2 + 0.2; // Offset from trees
      const radius = clearingRadius - 400 + (Math.sin(i * 4.1) * 200);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const scale = 60 + Math.abs(Math.sin(i * 3.2) * 50);
      const rotation = Math.sin(i * 2.8) * Math.PI;
      return [x, z, scale, rotation] as [number, number, number, number];
    }
  );

  // Bush placements - scattered around clearing, more near trees
  const bushPlacements: [number, number, number, number][] = Array.from(
    { length: 16 },
    (_, i) => {
      const angle = (i / 16) * Math.PI * 2 + 0.15;
      const radius = clearingRadius - 300 + (Math.sin(i * 5.3) * 350);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const scale = 80 + Math.abs(Math.sin(i * 2.1) * 50);
      const rotation = Math.sin(i * 3.4) * Math.PI;
      return [x, z, scale, rotation] as [number, number, number, number];
    }
  );

  // Fallen log placements - scattered naturally on forest floor
  const fallenLogPlacements: [number, number, number, number, boolean][] = [
    // [x, z, scale, rotation, isLarge]
    // Near the clearing edge
    [1400, 800, 400, Math.PI * 0.3, true],
    [-1200, 1100, 350, Math.PI * 0.7, true],
    [900, -1300, 300, Math.PI * 1.2, false],
    [-1500, -600, 280, Math.PI * 0.1, false],
    // Mid-distance
    [2200, 400, 320, Math.PI * 0.5, true],
    [-2000, -1200, 300, Math.PI * 1.4, false],
    [1800, -1800, 350, Math.PI * 0.9, true],
    // Between tree rings
    [2800, 1500, 280, Math.PI * 0.2, false],
    [-2600, 1800, 300, Math.PI * 1.1, true],
  ];

  // Ground level - derived from user proportions
  const groundY = $derived(userProportionsState.groundY);

  // Fire emitter position (reactive to groundY)
  const firePosition = $derived(
    new Vector3(campfirePosition.x, groundY + fireEmitterHeight, campfirePosition.z)
  );

  // Forest floor texture paths
  const forestFloorTextures = {
    diffuse: "/textures/forest-floor/diffuse.jpg",
    normal: "/textures/forest-floor/normal.jpg",
    roughness: "/textures/forest-floor/roughness.jpg",
  };

  // Color palettes from background themeColors
  const palettes = {
    autumn: {
      // From AUTUMN_DRIFT: warm golds, oranges, deep reds
      sky: {
        topColor: "#1a0f0a",
        midColor: "#3d2010",
        bottomColor: "#0a0808",
      },
      ground: "#ddccbb", // Light warm tint - lets texture detail show through
      leaves: ["#d97706", "#dc2626", "#ea580c", "#92400e"],
      // No fireflies in autumn
      fireflies: null as string[] | null,
      // Warm amber fog for autumn morning mist
      fog: { color: "#1a1008", density: 0.00018 },
      // Smoke colors (gray with warm tint)
      smoke: ["#443322", "#332211", "#221100"],
    },
    firefly: {
      // From FIREFLY_FOREST: deep night sky transitioning to forest
      // Matching the 2D background gradient exactly
      sky: {
        topColor: "#0a0e18", // Deep night sky (dark blue)
        midColor: "#0a1612", // Transition to forest
        bottomColor: "#0a1810", // Dark green at bottom
      },
      ground: "#99aa88", // Light green tint - lets texture show in darkness
      // Subtle green leaves barely visible in the dark
      leaves: ["#1a3a1a", "#0d2a15", "#153020", "#0f2518"],
      // Single warm yellow-green like real fireflies
      fireflies: ["#d4e157"],
      // Cool blue-green fog for mysterious night atmosphere
      fog: { color: "#0a1210", density: 0.00022 },
      // Night smoke (darker, cooler)
      smoke: ["#222222", "#1a1a1a", "#111111"],
    },
  };

  const palette = $derived(palettes[variant]);

  // Apply fog to scene (reactive to variant changes)
  $effect(() => {
    const fogColor = new Color(palette.fog.color);
    scene.fog = new FogExp2(fogColor, palette.fog.density);

    return () => {
      scene.fog = null;
    };
  });
</script>

<!-- Sky gradient background -->
<SkyGradient
  topColor={palette.sky.topColor}
  midColor={palette.sky.midColor}
  bottomColor={palette.sky.bottomColor}
/>

<!-- Ground plane with PBR forest floor texture -->
<!-- Large size to cover the entire forest (all tree rings and beyond) -->
<TexturedGroundPlane
  color={palette.ground}
  size={10000}
  diffuseMap={forestFloorTextures.diffuse}
  textureRepeat={40}
/>

<!-- Falling leaves - covers the entire forest -->
<!-- In firefly mode, leaves are very subtle (dark colors) -->
<FallingParticles
  type="leaves"
  count={variant === "firefly" ? 150 : 450}
  area={{ width: 8000, height: 1000, depth: 8000 }}
  speed={variant === "firefly" ? 15 : 25}
  colors={palette.leaves}
  sizeRange={variant === "firefly" ? [15, 35] : [25, 55]}
  spin={true}
/>

<!-- Fireflies - only in firefly variant -->
{#if palette.fireflies}
  <FallingParticles
    type="fireflies"
    count={60}
    area={{ width: 1600, height: 400, depth: 1600 }}
    speed={1}
    colors={palette.fireflies}
    sizeRange={[40, 80]}
    spin={false}
  />
{/if}

<!-- KayKit Trees - ring around clearing -->
{#if $tree1 && $tree2 && $tree3}
  {#each treePlacements as [x, z, scale, rotY], i}
    {@const treeModel = i % 3 === 0 ? $tree1 : i % 3 === 1 ? $tree2 : $tree3}
    <T
      is={treeModel.scene.clone()}
      position.x={x}
      position.y={groundY}
      position.z={z}
      scale={scale}
      rotation.y={rotY}
    />
  {/each}
{/if}

<!-- KayKit Rocks - scattered around clearing edge -->
{#if $rock1 && $rock2}
  {#each rockPlacements as [x, z, scale, rotY], i}
    {@const rockModel = i % 2 === 0 ? $rock1 : $rock2}
    <T
      is={rockModel.scene.clone()}
      position.x={x}
      position.y={groundY}
      position.z={z}
      scale={scale}
      rotation.y={rotY}
    />
  {/each}
{/if}

<!-- KayKit Bushes - filling gaps in tree ring -->
{#if $bush1 && $bush2}
  {#each bushPlacements as [x, z, scale, rotY], i}
    {@const bushModel = i % 2 === 0 ? $bush1 : $bush2}
    <T
      is={bushModel.scene.clone()}
      position.x={x}
      position.y={groundY}
      position.z={z}
      scale={scale}
      rotation.y={rotY}
    />
  {/each}
{/if}

<!-- Fallen logs - natural forest floor detail -->
{#if $fallenLog && $fallenLogSmall}
  {#each fallenLogPlacements as [x, z, scale, rotY, isLarge]}
    {@const logModel = isLarge ? $fallenLog : $fallenLogSmall}
    <T
      is={logModel.scene.clone()}
      position.x={x}
      position.y={groundY}
      position.z={z}
      scale={scale}
      rotation.y={rotY}
    />
  {/each}
{/if}

<!-- Campfire with warm point lights and fire particles -->
{#if $campfire}
  <T
    is={$campfire.scene.clone()}
    position.x={campfirePosition.x}
    position.y={groundY}
    position.z={campfirePosition.z}
    scale={campfireScale}
  />
  <!-- Volumetric raymarched fire (realistic) - 3x larger -->
  <VolumetricFireComponent
    position={firePosition}
    width={1.0}
    height={fireHeight}
    depth={1.0}
    scale={fireScale}
    sliceSpacing={0.15}
  />
  <!-- Primary warm point light - STRONG illumination for ground visibility -->
  <T.PointLight
    position.x={campfirePosition.x}
    position.y={groundY + campfireLightHeight * 2}
    position.z={campfirePosition.z}
    color="#ff6622"
    intensity={variant === "firefly" ? 50 : 35}
    distance={4000}
    decay={1.2}
  />
  <!-- Secondary fill light (lower, wider spread for ground illumination) -->
  <T.PointLight
    position.x={campfirePosition.x}
    position.y={groundY + 50}
    position.z={campfirePosition.z}
    color="#ff4400"
    intensity={variant === "firefly" ? 30 : 20}
    distance={3000}
    decay={1.5}
  />
  <!-- Subtle ambient hemisphere light for overall warmth -->
  <T.HemisphereLight
    color="#ff8844"
    groundColor="#221100"
    intensity={variant === "firefly" ? 0.6 : 0.4}
  />
  <!-- Campfire smoke - gentle plume rising from fire -->
  <T.Group
    position.x={campfirePosition.x}
    position.y={groundY + fireEmitterHeight + 100}
    position.z={campfirePosition.z}
  >
    <FallingParticles
      type="smoke"
      count={40}
      area={{ width: 200, height: 800, depth: 200 }}
      speed={8}
      colors={palette.smoke}
      sizeRange={[30, 80]}
      spin={false}
    />
  </T.Group>
{/if}

<!-- Cozy tent -->
{#if $tent}
  <T
    is={$tent.scene.clone()}
    position.x={tentPosition.x}
    position.y={groundY}
    position.z={tentPosition.z}
    scale={tentScale}
    rotation.y={Math.PI * 0.3}
  />
{/if}
