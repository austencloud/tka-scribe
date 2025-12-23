<!--
  PremiumModule - Premium subscription as a full module

  Shown to non-premium users in the main navigation.
  Disappears after user subscribes.
-->
<script lang="ts">
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import PremiumShowcase from "./components/PremiumShowcase.svelte";

  let hapticService: IHapticFeedbackService | null = null;

  $effect(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
  });
</script>

<div class="premium-module">
  <PremiumShowcase {hapticService} />
</div>

<style>
  .premium-module {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
