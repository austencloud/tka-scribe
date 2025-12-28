<script lang="ts">
  import type { IHapticFeedback } from "../../../application/services/contracts/IHapticFeedback";
  import type { SequenceData } from "../../../foundation/domain/models/SequenceData";
  import type { createShareState } from "../../state/share-state.svelte";
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
    hapticService: IHapticFeedback | null;
    onBack: () => void;
    onRetry: () => void;
  } = $props();

  function handleBack() {
    hapticService?.trigger("selection");
    onBack();
  }
</script>

<div class="preview-fullscreen">
  <section class="preview-header">
    <button class="back-button" onclick={handleBack}>
      <i class="fas fa-chevron-left" aria-hidden="true"></i>
      <span>Back</span>
    </button>
    <h3>Preview & Options</h3>
  </section>

  <div class="preview-content">
    <PreviewArea {currentSequence} {shareState} {onRetry} />
  </div>

  <div class="options-footer">
    <OptionsToggles {shareState} {hapticService} />
  </div>
</div>

<style>
  .preview-fullscreen {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    gap: clamp(12px, 2cqw, 18px);
    animation: slideIn 0.25s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .preview-header {
    display: flex;
    align-items: center;
    gap: clamp(12px, 2cqw, 16px);
    width: 100%;
    flex-shrink: 0;
  }

  .back-button {
    display: flex;
    align-items: center;
    gap: clamp(6px, 1cqw, 8px);
    padding: clamp(8px, 1cqh, 12px) clamp(12px, 1.5cqw, 18px);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.9);
    font-size: clamp(13px, 1.2cqw, 15px);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .back-button i {
    font-size: 0.9em;
    transition: transform 0.2s ease;
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .back-button:hover i {
    transform: translateX(-3px);
  }

  .back-button:active {
    transform: scale(0.97);
  }

  .preview-header h3 {
    flex: 1;
    font-size: clamp(16px, 1.6cqw, 20px);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
  }

  .preview-content {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .options-footer {
    flex-shrink: 0;
    padding-top: clamp(10px, 1.5cqw, 14px);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }
</style>
