<!--
OptionCardContent.svelte - Desktop option card wrapper

Subscribes to Lights Off state via DI and delegates rendering to shared primitive.
Used by the desktop hierarchy: OptionSection → OptionGrid → OptionCard → OptionCardContent
-->
<script lang="ts">
  import type { PreparedPictographData } from "$lib/shared/pictograph/option/PreparedPictographData";
  import type { ILightsOffProvider } from "$lib/shared/animation-engine/services/contracts/ILightsOffProvider";
  import OptionPictograph from "$lib/shared/pictograph/option/OptionPictograph.svelte";
  import { tryResolve, TYPES } from "$lib/shared/inversify/di";
  import { onMount } from "svelte";

  interface Props {
    pictograph: PreparedPictographData;
    blueReversal?: boolean;
    redReversal?: boolean;
  }

  const {
    pictograph,
    blueReversal = false,
    redReversal = false,
  }: Props = $props();

  // Subscribe to Lights Off state via DI
  let lightsOff = $state(false);

  onMount(() => {
    // Use tryResolve to handle HMR gracefully - animator module may not be loaded yet
    const provider = tryResolve<ILightsOffProvider>(TYPES.ILightsOffProvider);
    if (!provider) {
      // Provider not available yet (e.g., during HMR rebuild)
      // Default to false
      return;
    }
    const unsubscribe = provider.subscribe((value) => {
      lightsOff = value;
    });
    return unsubscribe;
  });
</script>

<div class="option-card-content">
  <OptionPictograph
    {pictograph}
    {blueReversal}
    {redReversal}
    {lightsOff}
  />
</div>

<style>
  .option-card-content {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
