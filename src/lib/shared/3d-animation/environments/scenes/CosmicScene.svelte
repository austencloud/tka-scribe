<script lang="ts">
  /**
   * CosmicScene
   *
   * A cosmic space environment with drifting stars.
   * Supports night sky and aurora color variants.
   */

  import Fog3D from "../primitives/Fog3D.svelte";
  import SkyGradient from "../primitives/SkyGradient.svelte";
  import FallingParticles from "../primitives/FallingParticles.svelte";
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
      fog: "#0d0d1a",
      stars: ["#ffffff", "#e0e7ff", "#c7d2fe", "#818cf8"],
    },
    aurora: {
      // From AURORA: greens, cyans, magentas
      sky: {
        topColor: "#0a1a1a",
        midColor: "#064e3b",
        bottomColor: "#050a0a",
      },
      fog: "#0a1a18",
      stars: ["#22d3ee", "#a855f7", "#0d9488", "#f0abfc"],
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

<!-- Deep space fog (very far) -->
<Fog3D color={palette.fog} near={500} far={2000} />

<!-- Drifting stars (no ground - floating in space) -->
<FallingParticles
  type="stars"
  count={100}
  area={{ width: 1200, height: 1000, depth: 1200 }}
  speed={8}
  colors={palette.stars}
  sizeRange={[4, 12]}
  spin={false}
/>
