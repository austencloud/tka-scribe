<script lang="ts">
  /**
   * ForestScene
   *
   * A misty forest environment with falling leaves.
   * Supports autumn and firefly color variants.
   */

  import GroundPlane from "../primitives/GroundPlane.svelte";
  import Fog3D from "../primitives/Fog3D.svelte";
  import SkyGradient from "../primitives/SkyGradient.svelte";
  import FallingParticles from "../primitives/FallingParticles.svelte";
  import type { ForestVariant } from "../domain/enums/environment-enums";

  interface Props {
    /** Color variant: autumn (warm) or firefly (cool green) */
    variant?: ForestVariant;
  }

  let { variant = "autumn" }: Props = $props();

  // Color palettes from background themeColors
  const palettes = {
    autumn: {
      // From AUTUMN_DRIFT: warm golds, oranges, deep reds
      sky: {
        topColor: "#1a0f0a",
        midColor: "#3d2010",
        bottomColor: "#0a0808",
      },
      fog: "#2a1810",
      ground: "#3d2815",
      leaves: ["#d97706", "#dc2626", "#ea580c", "#92400e"],
    },
    firefly: {
      // From FIREFLY_FOREST: deep greens with yellow-green glow
      sky: {
        topColor: "#0d1a0d",
        midColor: "#1a3320",
        bottomColor: "#050a05",
      },
      fog: "#0d2010",
      ground: "#1a3a1a",
      leaves: ["#22c55e", "#bef264", "#16a34a", "#84cc16"],
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

<!-- Atmospheric fog -->
<Fog3D color={palette.fog} near={300} far={1200} />

<!-- Ground plane -->
<GroundPlane
  color={palette.ground}
  opacity={0.85}
  size={600}
  position={[0, -250, 0]}
/>

<!-- Falling leaves -->
<FallingParticles
  type="leaves"
  count={60}
  area={{ width: 1000, height: 800, depth: 1000 }}
  speed={35}
  colors={palette.leaves}
  sizeRange={[10, 20]}
  spin={true}
/>
