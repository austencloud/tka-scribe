<script lang="ts">
  /**
   * OceanScene
   *
   * An underwater environment with rising bubbles.
   * Used for DEEP_OCEAN background type.
   */

  import GroundPlane from "../primitives/GroundPlane.svelte";
  import SkyGradient from "../primitives/SkyGradient.svelte";
  import FallingParticles from "../primitives/FallingParticles.svelte";

  // Ocean palette - deep blues and teals
  const palette = {
    sky: {
      topColor: "#001a2e",
      midColor: "#003366",
      bottomColor: "#000a14",
    },
    ground: "#1a3a4a", // Sandy ocean floor
    bubbles: ["#60c0e0", "#80d0f0", "#40a0c0", "#a0e0ff"],
  };
</script>

<!-- Deep water gradient -->
<SkyGradient
  topColor={palette.sky.topColor}
  midColor={palette.sky.midColor}
  bottomColor={palette.sky.bottomColor}
/>

<!-- Ocean floor - uses dynamic groundY from user proportions -->
<GroundPlane color={palette.ground} opacity={0.9} size={3000} />

<!-- Rising bubbles -->
<FallingParticles
  type="bubbles"
  count={80}
  area={{ width: 600, height: 500, depth: 600 }}
  speed={15}
  colors={palette.bubbles}
  sizeRange={[6, 18]}
  spin={false}
/>
