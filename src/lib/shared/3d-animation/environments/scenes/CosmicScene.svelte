<script lang="ts">
  /**
   * CosmicScene
   *
   * A cosmic space environment with drifting stars.
   * Supports night sky and aurora color variants.
   */

  import SkyGradient from "../primitives/SkyGradient.svelte";
  import FallingParticles from "../primitives/FallingParticles.svelte";
  import GroundPlane from "../primitives/GroundPlane.svelte";
  import type { CosmicVariant } from "../domain/enums/environment-enums";

  interface Props {
    /** Color variant: night (purple/indigo) or aurora (green/cyan) */
    variant?: CosmicVariant;
  }

  let { variant = "night" }: Props = $props();

  // Color palettes from background themeColors
  const palettes = {
    night: {
      // From NIGHT_SKY: deep purples and indigos
      sky: {
        topColor: "#0a0a1a",
        midColor: "#1e1b4b",
        bottomColor: "#050510",
      },
      stars: ["#ffffff", "#e0e7ff", "#c7d2fe", "#818cf8"],
      asteroid: "#2a2a35", // Dark rocky surface
    },
    aurora: {
      // From AURORA: greens, cyans, magentas
      sky: {
        topColor: "#0a1a1a",
        midColor: "#064e3b",
        bottomColor: "#050a0a",
      },
      stars: ["#22d3ee", "#a855f7", "#0d9488", "#f0abfc"],
      asteroid: "#1a2a2a", // Teal-tinted rock
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

<!-- Asteroid platform - small rocky surface at avatar feet level -->
<GroundPlane color={palette.asteroid} opacity={1} size={250} />

<!-- Drifting stars - larger and more numerous for cosmic feel -->
<FallingParticles
  type="stars"
  count={200}
  area={{ width: 1500, height: 1200, depth: 1500 }}
  speed={5}
  colors={palette.stars}
  sizeRange={[6, 18]}
  spin={false}
/>
