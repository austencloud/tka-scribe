<!--
ActionSection.svelte - Action buttons for generation operations
Contains Auto-Complete and Generate New buttons
-->
<script lang="ts">
  import type { GenerationConfig } from "../generateConfigState.svelte";

  interface Props {
    onAutoCompleteClicked: () => void;
    onGenerateClicked: (config: GenerationConfig) => void;
    config: GenerationConfig;
    isGenerating: boolean;
  }

  let {
    onAutoCompleteClicked,
    onGenerateClicked,
    config,
    isGenerating,
  }: Props = $props();
</script>

<div class="action-section">
  <button
    class="action-button secondary"
    onclick={() => onAutoCompleteClicked()}
    disabled={isGenerating}
    type="button"
  >
    Auto-Complete
  </button>

  <button
    class="action-button primary"
    onclick={() => onGenerateClicked(config)}
    disabled={isGenerating}
    type="button"
  >
    {isGenerating ? "Generating..." : "Generate New"}
  </button>
</div>

<style>
  .action-section {
    flex-shrink: 0;
    display: flex;
    gap: var(--element-spacing);
    padding-top: var(--element-spacing);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .action-button {
    flex: 1;
    min-height: var(--min-touch-target);
    padding: 12px 20px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .action-button.secondary {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
  }

  .action-button.secondary:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .action-button.primary {
    background: rgba(70, 130, 255, 0.8);
    border: 1px solid rgba(70, 130, 255, 0.9);
    color: white;
  }

  .action-button.primary:hover:not(:disabled) {
    background: rgba(80, 140, 255, 0.9);
    border-color: rgba(80, 140, 255, 1);
  }

  /* Responsive layouts */
  :global(.generate-panel[data-layout="comfortable"]) .action-button {
    min-height: calc(var(--min-touch-target) * 1.1);
    font-size: 16px;
  }

  :global(.generate-panel[data-layout="spacious"]) .action-button {
    min-height: calc(var(--min-touch-target) * 1.3);
    font-size: 16px;
  }

  :global(.generate-panel[data-layout="compact"]) .action-button {
    min-height: var(--min-touch-target);
    font-size: 13px;
    padding: 8px 16px;
  }

  /* High DPI display adjustments */
  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .action-button {
      border-width: 0.5px;
    }
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .action-section {
      flex-direction: column;
    }

    .action-button {
      min-height: calc(var(--min-touch-target) * 1.1) !important;
      font-size: 16px !important;
    }
  }
</style>
