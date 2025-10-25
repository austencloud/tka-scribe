<!--
TurnIntensityModal.svelte - Modal for selecting turn intensity
Displays available intensity values based on difficulty level
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";

  let { currentIntensity, allowedValues, onIntensitySelect, onClose } = $props<{
    currentIntensity: number;
    allowedValues: number[];
    onIntensitySelect: (intensity: number) => void;
    onClose: () => void;
  }>();

  let hapticService: IHapticFeedbackService;
  let modalElement: HTMLElement;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
    modalElement?.focus();
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  });

  function selectIntensity(intensity: number) {
    hapticService?.trigger("selection");
    onIntensitySelect(intensity);
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      onClose();
    }
  }


</script>

<div
  class="modal-backdrop"
  onclick={handleBackdropClick}
  onkeydown={handleKeydown}
  bind:this={modalElement}
  tabindex="-1"
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <div class="modal-content">
    <div class="modal-header">
      <h2 id="modal-title">Select Turn Intensity</h2>
      <button
        class="close-button"
        onclick={onClose}
        aria-label="Close modal"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div class="intensity-options">
      {#each allowedValues as intensity}
        <button
          class="intensity-button"
          class:selected={currentIntensity === intensity}
          onclick={() => selectIntensity(intensity)}
        >
          {intensity}x
          {#if currentIntensity === intensity}
            <div class="selected-indicator">✓</div>
          {/if}
        </button>
      {/each}
    </div>

    {#if allowedValues.length === 0}
      <div class="no-options">
        <div class="no-options-icon">🚫</div>
        <div class="no-options-text">
          <h3>No Turn Options Available</h3>
          <p>Turn intensity is not available for the current difficulty level. Try selecting a higher difficulty level to enable turn options.</p>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 16px;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    padding: 20px;
    width: 100%;
    max-width: 300px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .modal-header h2 {
    color: #333;
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }

  .close-button {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
    width: 24px;
    height: 24px;
  }

  .close-button:hover {
    background: #f0f0f0;
    color: #333;
  }

  .close-button svg {
    width: 100%;
    height: 100%;
  }

  .intensity-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
    gap: 8px;
    margin-top: 16px;
  }

  .intensity-button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: white;
    color: #374151;
    font-size: 16px;
    font-weight: 600;
    min-height: 48px;
  }

  .intensity-button:hover {
    border-color: #3b82f6;
    background: #f8fafc;
  }

  .intensity-button.selected {
    border-color: #3b82f6;
    background: #3b82f6;
    color: white;
  }

  .selected-indicator {
    position: absolute;
    top: 2px;
    right: 2px;
    font-size: 10px;
    color: white;
  }

  .no-options {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 20px;
    color: #666;
  }

  .no-options-icon {
    font-size: 32px;
    margin-bottom: 12px;
  }

  .no-options-text h3 {
    color: #333;
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 8px 0;
  }

  .no-options-text p {
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
  }
</style>
