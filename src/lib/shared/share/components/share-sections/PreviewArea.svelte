<script lang="ts">
  import type { SequenceData } from "../../../foundation/domain/models/SequenceData";
  import type { createShareState } from "../../state/share-state.svelte";

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
      <div class="placeholder-icon">
        <i class="fas fa-image" aria-hidden="true"></i>
      </div>
      <p>No sequence selected</p>
      <span>Create or select a sequence to see preview</span>
    </div>
  {:else if currentSequence.beats?.length === 0}
    <div class="preview-placeholder">
      <div class="placeholder-icon">
        <i class="fas fa-plus-circle" aria-hidden="true"></i>
      </div>
      <p>Empty sequence</p>
      <span>Add beats to generate preview</span>
    </div>
  {:else if shareState?.isGeneratingPreview}
    <div class="preview-loading">
      <div class="loading-ring">
        <div class="loading-ring-inner"></div>
      </div>
      <p>Generating preview...</p>
    </div>
  {:else if shareState?.previewError}
    <div class="preview-error">
      <div class="error-icon">
        <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
      </div>
      <p>Preview failed</p>
      <span>{shareState.previewError}</span>
      <button class="retry-button" onclick={onRetry}>
        <i class="fas fa-redo" aria-hidden="true"></i>
        Try Again
      </button>
    </div>
  {:else if shareState?.previewUrl}
    <div class="preview-container">
      <img
        src={shareState.previewUrl}
        alt="Sequence preview"
        class="preview-image"
      />
      <button
        class="regenerate-button"
        onclick={onRetry}
        title="Force regenerate preview (bypass cache)"
      >
        <i class="fas fa-sync-alt" aria-hidden="true"></i>
        <span>Refresh</span>
      </button>
    </div>
  {:else}
    <div class="preview-placeholder">
      <div class="placeholder-icon pulse">
        <i class="fas fa-image" aria-hidden="true"></i>
      </div>
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
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.25) 0%,
      rgba(0, 0, 0, 0.35) 100%
    );
    border-radius: 16px;
    overflow: hidden;
    min-height: 180px;
    position: relative;
  }

  /* Subtle grid pattern background */
  .preview-section::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: radial-gradient(
      circle at 1px 1px,
      rgba(255, 255, 255, 0.03) 1px,
      transparent 0
    );
    background-size: 24px 24px;
    pointer-events: none;
  }

  .preview-placeholder,
  .preview-loading,
  .preview-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: clamp(24px, 4cqw, 40px);
    text-align: center;
    position: relative;
    z-index: 1;
  }

  .placeholder-icon,
  .error-icon {
    width: clamp(50px, 6cqw, 64px);
    height: clamp(50px, 6cqw, 64px);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 8px;
  }

  .placeholder-icon i {
    font-size: clamp(20px, 2.5cqw, 28px);
    color: rgba(255, 255, 255, 0.4);
  }

  .placeholder-icon.pulse i {
    animation: iconPulse 2s ease-in-out infinite;
  }

  @keyframes iconPulse {
    0%,
    100% {
      opacity: 0.4;
      transform: scale(1);
    }
    50% {
      opacity: 0.6;
      transform: scale(1.05);
    }
  }

  .error-icon {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.2);
  }

  .error-icon i {
    font-size: clamp(20px, 2.5cqw, 28px);
    color: #ef4444;
  }

  .preview-placeholder p,
  .preview-loading p,
  .preview-error p {
    font-size: clamp(14px, 1.4cqw, 16px);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
    margin: 0;
  }

  .preview-placeholder span,
  .preview-error span {
    font-size: clamp(12px, 1.2cqw, 14px);
    color: rgba(255, 255, 255, 0.5);
    max-width: 200px;
  }

  /* Modern loading ring */
  .loading-ring {
    width: clamp(50px, 6cqw, 64px);
    height: clamp(50px, 6cqw, 64px);
    position: relative;
    margin-bottom: 8px;
  }

  .loading-ring::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 3px solid rgba(59, 130, 246, 0.15);
  }

  .loading-ring-inner {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 3px solid transparent;
    border-top-color: #3b82f6;
    animation: ringRotate 1s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
  }

  @keyframes ringRotate {
    to {
      transform: rotate(360deg);
    }
  }

  .retry-button {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: clamp(10px, 1.2cqh, 14px) clamp(18px, 2.5cqw, 26px);
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: clamp(13px, 1.2cqw, 15px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.35);
  }

  .retry-button:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.45);
  }

  .retry-button:active {
    transform: translateY(-1px) scale(0.98);
  }

  .preview-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }

  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.98);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .regenerate-button {
    position: absolute;
    bottom: clamp(10px, 1.5cqw, 14px);
    right: clamp(10px, 1.5cqw, 14px);
    display: flex;
    align-items: center;
    gap: 6px;
    padding: clamp(6px, 0.8cqh, 8px) clamp(10px, 1.2cqw, 14px);
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: white;
    font-size: clamp(11px, 1cqw, 13px);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    opacity: 0.6;
  }

  .regenerate-button:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.85);
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }

  .regenerate-button i {
    font-size: 0.9em;
    transition: transform 0.3s ease;
  }

  .regenerate-button:hover i {
    transform: rotate(180deg);
  }
</style>
