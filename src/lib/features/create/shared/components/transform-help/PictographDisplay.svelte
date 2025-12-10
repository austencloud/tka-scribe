<!--
  PictographDisplay.svelte

  Shows the current pictograph with a shuffle button
-->
<script lang="ts">
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
  import Pictograph from "$lib/shared/pictograph/shared/components/Pictograph.svelte";

  interface Props {
    pictograph: PictographData | null;
    isLoading?: boolean;
    onShuffle?: () => void;
  }

  let { pictograph, isLoading = false, onShuffle }: Props = $props();
</script>

<div class="pictograph-container">
  <div class="pictograph-display">
    {#if isLoading}
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
    {:else if pictograph}
      <Pictograph pictographData={pictograph} />
    {:else}
      <div class="empty-state">
        <i class="fas fa-image"></i>
      </div>
    {/if}
  </div>

  <button
    class="shuffle-btn"
    onclick={onShuffle}
    disabled={isLoading}
    aria-label="Get a new random pictograph"
    type="button"
  >
    <i class="fas fa-shuffle"></i>
    <span>New Example</span>
  </button>
</div>

<style>
  .pictograph-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    flex-shrink: 0;
    width: 100%;
  }

  .pictograph-display {
    width: 100%;
    aspect-ratio: 1;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.5);
    overflow: hidden;
  }

  .pictograph-placeholder {
    text-align: center;
    font-size: 14px;
  }

  .loading-state,
  .empty-state {
    font-size: 24px;
  }

  .loading-state i {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .shuffle-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(139, 92, 246, 0.15);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 8px;
    color: rgba(167, 139, 250, 1);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .shuffle-btn:hover:not(:disabled) {
    background: rgba(139, 92, 246, 0.25);
    border-color: rgba(139, 92, 246, 0.5);
  }

  .shuffle-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Mobile: smaller display */
  @media (max-width: 767px) {
    .pictograph-display {
      max-width: 150px;
    }
  }

  /* Desktop: Use full width from parent */
  @media (min-width: 768px) {
    .pictograph-container {
      flex-shrink: 0;
      width: 100%;
      max-width: 280px;
    }

    .pictograph-display {
      width: 100%;
    }
  }
</style>
