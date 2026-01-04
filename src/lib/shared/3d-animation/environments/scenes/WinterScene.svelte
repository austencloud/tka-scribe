<script lang="ts">
  /**
   * WinterScene
   *
   * A winter environment with falling snow.
   * Used for SNOWFALL background type.
   */

  import GroundPlane from "../primitives/GroundPlane.svelte";
  import SkyGradient from "../primitives/SkyGradient.svelte";
  import FallingParticles from "../primitives/FallingParticles.svelte";

  // Winter palette - icy blues and whites
  const palette = {
    sky: {
      topColor: "#0a1525",
      midColor: "#1e3a5f",
      bottomColor: "#0a0f15",
    },
    ground: "#e8f0f8", // Snowy white ground
    snow: ["#ffffff", "#e0f0ff", "#c8e0f0", "#a0c8e0"],
  };
</script>

<!-- Sky gradient background -->
<SkyGradient
  topColor={palette.sky.topColor}
  midColor={palette.sky.midColor}
  bottomColor={palette.sky.bottomColor}
/>

<!-- Snowy ground - uses dynamic groundY from user proportions -->
<GroundPlane color={palette.ground} opacity={0.95} size={3000} />

<!-- Falling snow -->
<FallingParticles
  type="snow"
  count={150}
  area={{ width: 800, height: 600, depth: 800 }}
  speed={20}
  colors={palette.snow}
  sizeRange={[4, 12]}
  spin={false}
/>
