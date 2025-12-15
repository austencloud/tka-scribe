<script lang="ts">
  import type { IHapticFeedbackService } from "../../application/services/contracts/IHapticFeedbackService";
  import PasskeysSection from "./PasskeysSection.svelte";

  interface Props {
    hapticService?: IHapticFeedbackService | null;
  }

  let { hapticService = null }: Props = $props();
</script>

<div class="stack">
  <PasskeysSection {hapticService} />
</div>

<style>
  .stack {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

</style>
