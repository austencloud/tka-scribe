<script lang="ts">
  /**
   * ForestScene
   *
   * A forest clearing environment with KayKit 3D models arranged in a ring
   * around the performer. Includes falling leaves and supports autumn/firefly variants.
   */

  import { T } from "@threlte/core";
  import { useGltf } from "@threlte/extras";
  import GroundPlane from "../primitives/GroundPlane.svelte";
  import SkyGradient from "../primitives/SkyGradient.svelte";
  import FallingParticles from "../primitives/FallingParticles.svelte";
  import type { ForestVariant } from "../domain/enums/environment-enums";
  import { userProportionsState } from "../../state/user-proportions-state.svelte";

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

  // Clearing radius - how far trees are from center
  const clearingRadius = 2000;
  const treeCount = 20;

  // Generate circular tree placements around the clearing
  // Position format: [x, z, scale, rotationY]
  // Trees are ~4 units tall in model - scale 250-350 = massive ancient forest trees
  const treePlacements: [number, number, number, number][] = Array.from(
    { length: treeCount },
    (_, i) => {
      const angle = (i / treeCount) * Math.PI * 2;
      // Add slight randomness to radius and position
      const radiusVariation = clearingRadius + (Math.sin(i * 3.7) * 200);
      const x = Math.cos(angle) * radiusVariation;
      const z = Math.sin(angle) * radiusVariation;
      // Scale varies by position for natural look - towering trees
      const scale = 250 + Math.abs(Math.sin(i * 2.3) * 100);
      // Trees face roughly toward center with variation
      const rotation = angle + Math.PI + (Math.sin(i * 1.7) * 0.3);
      return [x, z, scale, rotation] as [number, number, number, number];
    }
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

  // Ground level - derived from user proportions
  const groundY = $derived(userProportionsState.groundY);

  // Color palettes from background themeColors
  const palettes = {
    autumn: {
      // From AUTUMN_DRIFT: warm golds, oranges, deep reds
      sky: {
        topColor: "#1a0f0a",
        midColor: "#3d2010",
        bottomColor: "#0a0808",
      },
      ground: "#3d2815",
      leaves: ["#d97706", "#dc2626", "#ea580c", "#92400e"],
      // No fireflies in autumn
      fireflies: null as string[] | null,
    },
    firefly: {
      // From FIREFLY_FOREST: deep night sky transitioning to forest
      // Matching the 2D background gradient exactly
      sky: {
        topColor: "#0a0e18", // Deep night sky (dark blue)
        midColor: "#0a1612", // Transition to forest
        bottomColor: "#0a1810", // Dark green at bottom
      },
      ground: "#0c1a14", // Very dark forest floor
      // Subtle green leaves barely visible in the dark
      leaves: ["#1a3a1a", "#0d2a15", "#153020", "#0f2518"],
      // Single warm yellow-green like real fireflies
      fireflies: ["#d4e157"],
    },
  };

  const palette = $derived(palettes[variant]);
</script>

<!-- Sky gradient background -->
<SkyGradient
  topColor={palette.sky.topColor}
  midColor={palette.sky.midColor}
  bottomColor={palette.sky.bottomColor}
/>

<!-- Ground plane - uses dynamic groundY from user proportions -->
<!-- Large size to cover the entire clearing and beyond -->
<GroundPlane
  color={palette.ground}
  opacity={0.9}
  size={6000}
/>

<!-- Falling leaves - covers entire massive clearing -->
<!-- In firefly mode, leaves are very subtle (dark colors) -->
<FallingParticles
  type="leaves"
  count={variant === "firefly" ? 100 : 300}
  area={{ width: 4500, height: 800, depth: 4500 }}
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
