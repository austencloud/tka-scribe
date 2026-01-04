<script lang="ts">
  /**
   * EmberScene
   *
   * A volcanic/fire environment with rising embers.
   * Used for EMBER_GLOW background type.
   */

  import GroundPlane from "../primitives/GroundPlane.svelte";
  import SkyGradient from "../primitives/SkyGradient.svelte";
  import FallingParticles from "../primitives/FallingParticles.svelte";

  // Ember palette - fiery oranges and reds
  const palette = {
    sky: {
      topColor: "#0a0505",
      midColor: "#2a0a0a",
      bottomColor: "#1a0808",
    },
    ground: "#1a0a0a", // Dark volcanic rock
    embers: ["#ff6b35", "#ff8c42", "#ffc145", "#ff4500"],
  };
</script>

<!-- Smoky dark sky -->
<SkyGradient
  topColor={palette.sky.topColor}
  midColor={palette.sky.midColor}
  bottomColor={palette.sky.bottomColor}
/>

<!-- Volcanic ground - uses dynamic groundY from user proportions -->
<GroundPlane color={palette.ground} opacity={0.95} size={3000} />

<!-- Rising embers -->
<FallingParticles
  type="embers"
  count={100}
  area={{ width: 600, height: 500, depth: 600 }}
  speed={30}
  colors={palette.embers}
  sizeRange={[4, 10]}
  spin={false}
/>
