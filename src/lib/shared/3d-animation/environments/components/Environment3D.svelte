<script lang="ts">
  /**
   * Environment3D
   *
   * Switcher component that renders the appropriate 3D environment
   * based on the selected type.
   */

  import { EnvironmentType } from "../domain/enums/environment-enums";
  import ForestScene from "../scenes/ForestScene.svelte";
  import CosmicScene from "../scenes/CosmicScene.svelte";

  interface Props {
    /** Environment type to render */
    type?: EnvironmentType;
    /** Forest variant (autumn/firefly) */
    forestVariant?: "autumn" | "firefly";
    /** Cosmic variant (night/aurora) */
    cosmicVariant?: "night" | "aurora";
  }

  let {
    type = EnvironmentType.NONE,
    forestVariant = "autumn",
    cosmicVariant = "night",
  }: Props = $props();
</script>

{#if type === EnvironmentType.FOREST}
  <ForestScene variant={forestVariant} />
{:else if type === EnvironmentType.COSMIC}
  <CosmicScene variant={cosmicVariant} />
{/if}

<!-- EnvironmentType.NONE renders nothing - just the default grid -->
