<!--
CAPSelectionModal.svelte - Bottom sheet for selecting CAP components
Refactored to use BottomSheet component for consistent behavior
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES, BottomSheet, SheetDragHandle } from "$shared";
  import { onMount } from "svelte";
  import { CAPComponent, generateExplanationText } from "$build/generate/shared/domain/constants/cap-components";
  import CAPComponentGrid from "./CAPComponentGrid.svelte";
  import CAPExplanationPanel from "./CAPExplanationPanel.svelte";
  import CAPModalHeader from "./CAPModalHeader.svelte";

  let {
    isOpen,
    selectedComponents,
    onToggleComponent,
    onConfirm,
    onClose
  } = $props<{
    isOpen: boolean;
    selectedComponents: Set<CAPComponent>;
    onToggleComponent: (component: CAPComponent) => void;
    onConfirm: () => void;
    onClose: () => void;
  }>();

  let hapticService: IHapticFeedbackService;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
  });

  // Generate explanation text based on selected components
  const explanationText = $derived(generateExplanationText(selectedComponents));

  // Derive selection count and adaptive button text
  const selectionCount = $derived(selectedComponents.size);
  const buttonText = $derived.by(() => {
    if (selectionCount === 0) return 'Select a CAP Type';
    if (selectionCount === 1) {
      const component = Array.from(selectedComponents)[0];
      const formatted = component.charAt(0) + component.slice(1).toLowerCase();
      return `Apply ${formatted}`;
    }
    return `Apply ${selectionCount} Components`;
  });
  const isButtonDisabled = $derived(selectionCount === 0);

  function handleToggle(component: CAPComponent) {
    hapticService?.trigger("selection");
    onToggleComponent(component);
  }

  function handleConfirm() {
    if (selectionCount === 0) return; // Prevent confirming with no selection
    hapticService?.trigger("selection");
    onConfirm();
  }

  function handleClose() {
    onClose();
  }
</script>

<BottomSheet
  {isOpen}
  on:close={handleClose}
  labelledBy="cap-title"
  closeOnBackdrop={false}
  focusTrap={true}
  lockScroll={true}
  showHandle={false}
  class="cap-selection-sheet"
  backdropClass="cap-selection-backdrop"
>
  <div class="cap-modal-content">
    <SheetDragHandle />
    <CAPModalHeader title="Select CAP Type" onClose={handleClose} />

    <CAPComponentGrid
      {selectedComponents}
      onToggleComponent={handleToggle}
    />

    <CAPExplanationPanel {explanationText} />

    <button
      class="confirm-button"
      class:disabled={isButtonDisabled}
      onclick={handleConfirm}
      disabled={isButtonDisabled}
      aria-label={buttonText}
    >
      {buttonText}
    </button>
  </div>
</BottomSheet>

<style>
  /* Custom styling for CAP selection bottom sheet */
  /* Matches height of tool panel + button panel (like Animation/Edit panels) */
  :global(.bottom-sheet.cap-selection-sheet) {
    max-width: 1200px;
    margin: 0 auto;
    border-radius: 20px 20px 0 0;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 9999;
  }

  :global(.bottom-sheet-backdrop.cap-selection-backdrop) {
    z-index: 9998 !important;
    background: rgba(0, 0, 0, 0.85) !important;
    backdrop-filter: blur(8px) !important;
    pointer-events: auto !important;
  }

  .cap-modal-content {
    /* 🎯 Container query context for intelligent layout switching */
    container-type: size;
    container-name: cap-modal;

    position: relative;
    height: 70vh;
    height: 70dvh;

    background: linear-gradient(135deg,
      #4338ca 0%,
      #6b21a8 12.5%,
      #db2777 25%,
      #f97316 37.5%,
      #eab308 50%,
      #22c55e 62.5%,
      #0891b2 75%,
      #3b82f6 87.5%,
      #6366f1 100%
    );
    background-size: 300% 300%;
    animation: meshGradientFlow 15s ease infinite;
    border-radius: 20px 20px 0 0;

    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px;

    box-shadow:
      0 0 20px rgba(139, 92, 246, 0.6),
      0 0 40px rgba(139, 92, 246, 0.4),
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);

    overflow: hidden;
  }

  .confirm-button {
    position: relative;
    z-index: 1;
    flex-shrink: 0;

    padding: 12px 20px;
    min-height: 48px;

    background: rgba(255, 255, 255, 0.25);
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-radius: 12px;
    color: white;

    font-size: 15px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    line-height: 1.2;

    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .confirm-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.35);
    border-color: white;
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  }

  .confirm-button:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  .confirm-button:disabled,
  .confirm-button.disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .cap-modal-content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.15);
    pointer-events: none;
    z-index: 0;
  }

  @keyframes meshGradientFlow {
    0%, 100% {
      background-position: 0% 50%;
    }
    25% {
      background-position: 50% 100%;
    }
    50% {
      background-position: 100% 50%;
    }
    75% {
      background-position: 50% 0%;
    }
  }
</style>
