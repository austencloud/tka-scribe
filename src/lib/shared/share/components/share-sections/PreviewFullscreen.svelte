<script lang="ts">
  import type { IHapticFeedbackService, SequenceData } from "$shared";
  import type { createShareState } from "../../state";
  import PreviewArea from "./PreviewArea.svelte";
  import OptionsToggles from "./OptionsToggles.svelte";

  let {
    currentSequence,
    shareState,
    hapticService = null,
    onBack,
    onRetry,
  }: {
    currentSequence: SequenceData | null;
    shareState: ReturnType<typeof createShareState> | null;
    hapticService: IHapticFeedbackService | null;
    onBack: () => void;
    onRetry: () => void;
  } = $props();

  function handleBack() {
    hapticService?.trigger("selection");
    onBack();
  }
</script>

<section class="preview-header">
  <button class="back-button" onclick={handleBack}>
    <i class="fas fa-chevron-left"></i>
    <span>Back</span>
  </button>
  <h3>Preview & Options</h3>
</section>

<PreviewArea {currentSequence} {shareState} {onRetry} />

<OptionsToggles {shareState} {hapticService} />

<style>
  .preview-header {
    display: flex;
    align-items: center;
    gap: clamp(12px, 2vw, 16px);
    width: 100%;
    padding-bottom: clamp(8px, 1vh, 12px);
  }

  .back-button {
    display: flex;
    align-items: center;
    gap: clamp(6px, 1vw, 8px);
    padding: clamp(8px, 1vh, 10px) clamp(12px, 1.5vw, 16px);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: var(--text-color);
    font-size: clamp(13px, 1.1vw, 15px);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .preview-header h3 {
    flex: 1;
    font-size: clamp(16px, 1.5vw, 20px);
    font-weight: 600;
    color: var(--text-color);
    margin: 0;
  }
</style>
