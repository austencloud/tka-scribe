<!--
OptionCardContent.svelte - Desktop option card wrapper

Handles Lights Off state polling and delegates rendering to shared primitive.
Used by the desktop hierarchy: OptionSection → OptionGrid → OptionCard → OptionCardContent
-->
<script lang="ts">
  import type { PreparedPictographData } from "$lib/shared/pictograph/option/PreparedPictographData";
  import OptionPictograph from "$lib/shared/pictograph/option/OptionPictograph.svelte";
  import { getAnimationVisibilityManager } from "$lib/shared/animation-engine/state/animation-visibility-state.svelte";
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

  // Lights Off state - poll from global manager
  const animationVisibilityManager = getAnimationVisibilityManager();
  let lightsOff = $state(animationVisibilityManager.isLightsOff());
  let lastCheckedLightsOff = animationVisibilityManager.isLightsOff();

  // Poll for Lights Off changes
  onMount(() => {
    let rafId: number | null = null;
    let isPolling = true;

    const pollLightsOff = () => {
      if (!isPolling) return;
      const currentValue = animationVisibilityManager.isLightsOff();
      if (currentValue !== lastCheckedLightsOff) {
        lastCheckedLightsOff = currentValue;
        lightsOff = currentValue;
      }
      rafId = requestAnimationFrame(pollLightsOff);
    };

    rafId = requestAnimationFrame(pollLightsOff);

    return () => {
      isPolling = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
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
