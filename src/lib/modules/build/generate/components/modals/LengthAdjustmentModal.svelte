<!--
LengthAdjustmentModal.svelte - Modal for adjusting sequence length
Provides slider and preset options for length selection
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";

  let { currentLength, onLengthSelect, onClose } = $props<{
    currentLength: number;
    onLengthSelect: (length: number) => void;
    onClose: () => void;
  }>();

  let hapticService: IHapticFeedbackService;
  let modalElement: HTMLElement;
  let selectedLength = $state(currentLength);

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
    modalElement?.focus();
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  });

  // Preset length options
  const presetLengths = [
    { value: 4, label: "Very Short", description: "Quick practice" },
    { value: 8, label: "Short", description: "Basic sequence" },
    { value: 16, label: "Medium", description: "Standard length" },
    { value: 24, label: "Long", description: "Extended practice" },
    { value: 32, label: "Very Long", description: "Full routine" },
    { value: 48, label: "Extended", description: "Performance length" }
  ];

  function selectLength(length: number) {
    hapticService?.trigger("selection");
    selectedLength = length;
  }

  function confirmSelection() {
    hapticService?.trigger("success");
    onLengthSelect(selectedLength);
  }

  function handleSliderChange(event: Event) {
    const target = event.target as HTMLInputElement;
    selectedLength = parseInt(target.value);
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

  // Get description for current length
  function getLengthDescription(length: number): string {
    if (length <= 4) return "Very short sequence";
    if (length <= 8) return "Short sequence";
    if (length <= 16) return "Medium sequence";
    if (length <= 24) return "Long sequence";
    if (length <= 32) return "Very long sequence";
    return "Extended sequence";
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
      <h2 id="modal-title">Adjust Sequence Length</h2>
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

    <!-- Current Selection Display -->
    <div class="current-selection">
      <div class="selection-value">{selectedLength} beats</div>
      <div class="selection-description">{getLengthDescription(selectedLength)}</div>
    </div>

    <!-- Slider Control -->
    <div class="slider-section">
      <label for="length-slider" class="slider-label">Custom Length</label>
      <input
        id="length-slider"
        type="range"
        min="4"
        max="64"
        step="1"
        value={selectedLength}
        oninput={handleSliderChange}
        class="length-slider"
      />
      <div class="slider-range">
        <span>4</span>
        <span>64</span>
      </div>
    </div>

    <!-- Preset Options -->
    <div class="preset-section">
      <h3>Quick Presets</h3>
      <div class="preset-grid">
        {#each presetLengths as preset}
          <button
            class="preset-button"
            class:selected={selectedLength === preset.value}
            onclick={() => selectLength(preset.value)}
          >
            <div class="preset-value">{preset.value}</div>
            <div class="preset-label">{preset.label}</div>
            <div class="preset-description">{preset.description}</div>
          </button>
        {/each}
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button class="cancel-button" onclick={onClose}>
        Cancel
      </button>
      <button class="confirm-button" onclick={confirmSelection}>
        Set Length
      </button>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 16px;
  }

  .modal-content {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.15),
      rgba(255, 255, 255, 0.05)
    );
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 16px;
    max-width: 100%;
    width: 100%;
    max-height: 100%;
    overflow-y: auto;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .modal-header h2 {
    color: white;
    font-size: 24px;
    font-weight: 700;
    margin: 0;
  }

  .close-button {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s ease;
    width: 40px;
    height: 40px;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .close-button svg {
    width: 100%;
    height: 100%;
  }

  .current-selection {
    text-align: center;
    margin-bottom: 32px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .selection-value {
    font-size: 36px;
    font-weight: 900;
    color: white;
    margin-bottom: 4px;
  }

  .selection-description {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
  }

  .slider-section {
    margin-bottom: 32px;
  }

  .slider-label {
    display: block;
    color: white;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .length-slider {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    outline: none;
    margin-bottom: 8px;
    cursor: pointer;
  }

  .length-slider::-webkit-slider-thumb {
    appearance: none;
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .length-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .slider-range {
    display: flex;
    justify-content: space-between;
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
  }

  .preset-section h3 {
    color: white;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .preset-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    margin-bottom: 32px;
  }

  .preset-button {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 16px 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    color: white;
  }

  .preset-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .preset-button.selected {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .preset-value {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .preset-label {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 2px;
  }

  .preset-description {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.7);
  }

  .action-buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .cancel-button,
  .confirm-button {
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-button {
    background: none;
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: rgba(255, 255, 255, 0.8);
  }

  .cancel-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .confirm-button {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    border: none;
    color: white;
  }

  .confirm-button:hover {
    background: linear-gradient(135deg, #2563eb, #1e40af);
    transform: translateY(-1px);
  }

  /* Mobile responsive */
  @media (max-width: 767px) {
    .modal-content {
      padding: 24px;
      margin: 10px;
    }

    .preset-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .action-buttons {
      flex-direction: column;
    }
  }
</style>
