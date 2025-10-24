<!--
LetterTypeModal.svelte - Modal for selecting letter types
Provides interface for selecting which letter types to include in generation
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { LetterType, resolve, TYPES } from "$shared";
  import { onMount } from "svelte";

  let { currentLetterTypes, onLetterTypesSelect, onClose } = $props<{
    currentLetterTypes: Set<LetterType>;
    onLetterTypesSelect: (letterTypes: Set<LetterType>) => void;
    onClose: () => void;
  }>();

  let hapticService: IHapticFeedbackService;
  let modalElement: HTMLElement;
  let selectedTypes = $state(new Set(currentLetterTypes));

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
    modalElement?.focus();
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  });

  // Letter type data
  const letterTypeData = [
    {
      type: LetterType.TYPE1,
      number: "1",
      name: "Type 1",
      description: "Basic movements",
      color: "#ef4444"
    },
    {
      type: LetterType.TYPE2,
      number: "2",
      name: "Type 2",
      description: "Intermediate patterns",
      color: "#f97316"
    },
    {
      type: LetterType.TYPE3,
      number: "3",
      name: "Type 3",
      description: "Advanced movements",
      color: "#eab308"
    },
    {
      type: LetterType.TYPE4,
      number: "4",
      name: "Type 4",
      description: "Complex patterns",
      color: "#22c55e"
    },
    {
      type: LetterType.TYPE5,
      number: "5",
      name: "Type 5",
      description: "Expert movements",
      color: "#3b82f6"
    },
    {
      type: LetterType.TYPE6,
      number: "6",
      name: "Type 6",
      description: "Master patterns",
      color: "#8b5cf6"
    }
  ];

  function toggleLetterType(letterType: LetterType) {
    hapticService?.trigger("selection");
    const newTypes = new Set(selectedTypes);

    if (newTypes.has(letterType)) {
      newTypes.delete(letterType);
      // Ensure at least one type is selected
      if (newTypes.size === 0) {
        newTypes.add(letterType);
      }
    } else {
      newTypes.add(letterType);
    }

    selectedTypes = newTypes;
  }

  function selectAll() {
    hapticService?.trigger("selection");
    selectedTypes = new Set(Object.values(LetterType));
  }

  function selectNone() {
    hapticService?.trigger("selection");
    // Keep at least one selected
    selectedTypes = new Set([LetterType.TYPE1]);
  }

  function confirmSelection() {
    hapticService?.trigger("success");
    onLetterTypesSelect(selectedTypes);
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

  const selectedCount = $derived(selectedTypes.size);
  const allSelected = $derived(selectedCount === 6);
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
      <h2 id="modal-title">Select Letter Types</h2>
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

    <div class="letter-description">
      <p>Choose which letter types to include in your generated sequence. Each type represents different movement complexity levels.</p>
    </div>

    <!-- Selection Summary -->
    <div class="selection-summary">
      <div class="summary-text">
        {selectedCount} of 6 types selected
      </div>
      <div class="quick-actions">
        <button
          class="quick-action-button"
          onclick={selectAll}
          disabled={allSelected}
        >
          Select All
        </button>
        <button
          class="quick-action-button"
          onclick={selectNone}
          disabled={selectedCount === 1}
        >
          Clear All
        </button>
      </div>
    </div>

    <!-- Letter Type Grid -->
    <div class="letter-type-grid">
      {#each letterTypeData as { type, number, name, description, color }}
        <button
          class="letter-type-button"
          class:selected={selectedTypes.has(type)}
          onclick={() => toggleLetterType(type)}
          style="
            {selectedTypes.has(type)
              ? `background: ${color}; border-color: ${color}; color: white;`
              : `border-color: ${color}; color: ${color};`}
          "
        >
          <div class="type-number">{number}</div>

          {#if selectedTypes.has(type)}
            <div class="selected-indicator">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20,6 9,17 4,12"></polyline>
              </svg>
            </div>
          {/if}
        </button>
      {/each}
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button class="cancel-button" onclick={onClose}>
        Cancel
      </button>
      <button class="confirm-button" onclick={confirmSelection}>
        Apply Selection
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

  .letter-description {
    margin-bottom: 24px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .letter-description p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
  }

  .selection-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .summary-text {
    color: white;
    font-size: 16px;
    font-weight: 600;
  }

  .quick-actions {
    display: flex;
    gap: 8px;
  }

  .quick-action-button {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .quick-action-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .quick-action-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .letter-type-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
  }

  .letter-type-button {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    min-height: 120px;
  }

  .letter-type-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  .letter-type-button.selected {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .type-number {
    font-size: 32px;
    font-weight: 900;
    margin-bottom: 8px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .type-name {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
  }


  .selected-indicator {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 20px;
    height: 20px;
    color: white;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .selected-indicator svg {
    width: 12px;
    height: 12px;
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

    .letter-type-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .letter-type-button {
      padding: 16px 12px;
      min-height: 100px;
    }

    .type-number {
      font-size: 24px;
    }

    .selection-summary {
      flex-direction: column;
      gap: 12px;
      text-align: center;
    }

    .action-buttons {
      flex-direction: column;
    }
  }
</style>
