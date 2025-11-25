<script lang="ts">
  import type { SequenceData } from "$shared";
  import type { createShareState } from "../../state";

  let {
    currentSequence,
    shareState,
    onRetry,
  }: {
    currentSequence: SequenceData | null;
    shareState: ReturnType<typeof createShareState> | null;
    onRetry: () => void;
  } = $props();
</script>

<section class="preview-section">
  {#if !currentSequence}
    <div class="preview-placeholder">
      <p>No sequence selected</p>
      <span>Create or select a sequence to see preview</span>
    </div>
  {:else if currentSequence.beats?.length === 0}
    <div class="preview-placeholder">
      <p>Empty sequence</p>
      <span>Add beats to generate preview</span>
    </div>
  {:else if shareState?.isGeneratingPreview}
    <div class="preview-loading">
      <div class="loading-spinner"></div>
      <p>Generating preview...</p>
    </div>
  {:else if shareState?.previewError}
    <div class="preview-error">
      <p>Preview failed</p>
      <span>{shareState.previewError}</span>
      <button class="retry-button" onclick={onRetry}>Try Again</button>
    </div>
  {:else if shareState?.previewUrl}
    <div class="preview-container">
      <img
        src={shareState.previewUrl}
        alt="Sequence preview"
        class="preview-image"
      />
      <button class="regenerate-button" onclick={onRetry} title="Force regenerate preview (bypass cache)">
        <i class="fas fa-sync-alt"></i>
        <span>Regenerate</span>
      </button>
    </div>
  {:else}
    <div class="preview-placeholder">
      <p>Preview will appear here</p>
    </div>
  {/if}
</section>

<style>
  .preview-section {
    width: 100%;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    overflow: hidden;
    min-height: 200px;
  }

  .preview-placeholder,
  .preview-loading,
  .preview-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(8px, 1vh, 12px);
    padding: clamp(20px, 3vh, 32px);
    text-align: center;
  }

  .preview-placeholder p,
  .preview-loading p,
  .preview-error p {
    font-size: clamp(14px, 1.2vw, 16px);
    font-weight: 600;
    color: var(--text-color);
    margin: 0;
  }

  .preview-placeholder span,
  .preview-error span {
    font-size: clamp(12px, 1vw, 14px);
    color: var(--text-secondary);
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.2);
    border-top-color: var(--text-color);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .retry-button {
    margin-top: clamp(8px, 1vh, 12px);
    padding: clamp(8px, 1vh, 12px) clamp(16px, 2vw, 24px);
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: clamp(13px, 1.1vw, 15px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .retry-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .preview-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .regenerate-button {
    position: absolute;
    bottom: clamp(12px, 2vh, 16px);
    right: clamp(12px, 2vh, 16px);
    display: flex;
    align-items: center;
    gap: clamp(6px, 1vw, 8px);
    padding: clamp(6px, 1vh, 8px) clamp(10px, 1.5vw, 14px);
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    font-size: clamp(11px, 1vw, 13px);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    opacity: 0.7;
  }

  .regenerate-button:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.85);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  .regenerate-button i {
    font-size: clamp(10px, 0.9vw, 12px);
  }
</style>
