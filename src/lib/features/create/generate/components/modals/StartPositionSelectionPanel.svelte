<!--
StartPositionSelectionPanel.svelte - Drawer for selecting start position
Reuses the existing StartPositionPicker component in a clean drawer interface
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
  import { resolve } from "$lib/shared/inversify";
  import { TYPES } from "$lib/shared/inversify/types";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import SheetDragHandle from "$lib/shared/foundation/ui/SheetDragHandle.svelte";
  import { tryGetCreateModuleContext } from "$create/shared/context";
  import { onMount } from "svelte";
  import { createSimplifiedStartPositionState } from "../../../construct/start-position-picker/state/start-position-state.svelte";
  import StartPositionPicker from "../../../construct/start-position-picker/components/StartPositionPicker.svelte";

  let { isOpen, currentPosition, onConfirm, onClose } = $props<{
    isOpen: boolean;
    currentPosition: PictographData | null;
    onConfirm: (position: PictographData) => void;
    onClose: () => void;
  }>();

  let hapticService: IHapticFeedbackService;

  // Create start position state for the picker
  const startPositionState = createSimplifiedStartPositionState();

  onMount(async () => {
    hapticService = await resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Sync current position when panel opens
  $effect(() => {
    if (isOpen && currentPosition) {
      startPositionState.setSelectedPosition(currentPosition);
    }
  });

  // Listen for position selection and auto-close
  $effect(() => {
    if (!isOpen) return;

    // Subscribe to position changes
    const cleanup = startPositionState.onSelectedPositionChange(
      (position, source) => {
        // Only auto-close on user selection (not sync)
        if (source === "user" && position) {
          hapticService?.trigger("selection");
          onConfirm(position);
        }
      }
    );

    return cleanup;
  });

  function handleClose() {
    onClose();
  }

  const createModuleContext = tryGetCreateModuleContext();
  const isSideBySideLayout = $derived(
    createModuleContext
      ? createModuleContext.layout.shouldUseSideBySideLayout
      : false
  );
  const drawerPlacement = $derived(isSideBySideLayout ? "right" : "bottom");
</script>

<Drawer
  {isOpen}
  onOpenChange={(open) => !open && handleClose()}
  labelledBy="start-position-title"
  closeOnBackdrop={true}
  showHandle={false}
  respectLayoutMode={true}
  placement={drawerPlacement}
  class="start-position-selection-sheet"
  backdropClass="start-position-selection-backdrop"
>
  <div
    class="start-position-modal-content"
    class:desktop-layout={isSideBySideLayout}
  >
    <SheetDragHandle class={isSideBySideLayout ? "side-handle" : ""} />

    <div class="panel-header">
      <h2 id="start-position-title" class="panel-title">
        Select Start Position
      </h2>
      <button
        class="close-button"
        onclick={handleClose}
        aria-label="Close start position selector"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="picker-container">
      <StartPositionPicker
        {startPositionState}
        isSideBySideLayout={() => isSideBySideLayout}
      />
    </div>
  </div>
</Drawer>

<style>
  /* Custom styling for start position selection drawer */
  :global(.drawer-content.start-position-selection-sheet) {
    --sheet-backdrop-bg: rgba(0, 0, 0, 0.5);
    --sheet-backdrop-filter: blur(8px);
    --sheet-backdrop-pointer-events: auto;
    --sheet-bg: var(--sheet-bg-gradient);
    --sheet-border: var(--sheet-border-medium);
    --sheet-shadow: none;
    --sheet-pointer-events: auto;
    max-width: 1200px;
    margin: 0 auto;
    height: auto !important;
    max-height: 85vh; /* Take most of the screen */
  }

  /* Slide animations for drawer */
  :global(
    .drawer-content.start-position-selection-sheet[data-placement="bottom"]
  ) {
    transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
  }

  :global(
    .drawer-content.start-position-selection-sheet[data-placement="right"]
  ) {
    transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
  }

  :global(
    .drawer-content.start-position-selection-sheet[data-state="closed"][data-placement="bottom"]
  ) {
    transform: translateY(100%);
  }

  :global(
    .drawer-content.start-position-selection-sheet[data-state="closed"][data-placement="right"]
  ) {
    transform: translateX(100%);
  }

  :global(.drawer-content.start-position-selection-sheet[data-state="open"]) {
    transform: translate(0, 0);
  }

  .start-position-modal-content {
    /* Container query context for intelligent layout switching */
    container-type: inline-size;
    container-name: start-position-modal;

    position: relative;
    height: auto;
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 0;

    /* Gradient background - teal/cyan theme */
    background: linear-gradient(
      135deg,
      #0891b2 0%,
      #06b6d4 25%,
      #06b6d4 50%,
      #0891b2 75%,
      #0e7490 100%
    );
    background-size: 300% 300%;
    animation: gradientFlow 15s ease infinite;

    overflow: hidden;
  }

  .start-position-modal-content.desktop-layout {
    height: 100vh; /* Full height on desktop side panel */
  }

  @keyframes gradientFlow {
    0%,
    100% {
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

  /* Position drag handle on the left for side-by-side layout */
  .start-position-modal-content.desktop-layout
    :global(.sheet-drag-handle.side-handle) {
    position: absolute;
    top: 50%;
    left: 18px;
    width: 4px;
    height: 48px;
    margin: 0;
    border-radius: 999px;
    transform: translateY(-50%);
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    flex-shrink: 0;
  }

  .panel-title {
    font-size: clamp(1.25rem, 3vw, 1.5rem);
    font-weight: 700;
    color: white;
    margin: 0;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    letter-spacing: 0.02em;
  }

  .close-button {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 8px;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
  }

  .close-button:active {
    transform: scale(0.95);
  }

  .close-button svg {
    width: 20px;
    height: 20px;
  }

  .picker-container {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .start-position-modal-content {
      animation: none;
      background-position: 0% 50%;
    }
  }

  /* Mobile responsiveness */
  @media (max-width: 380px) {
    .panel-header {
      padding: 16px 20px;
    }

    .panel-title {
      font-size: 1.125rem;
    }

    .close-button {
      width: 32px;
      height: 32px;
    }

    .close-button svg {
      width: 18px;
      height: 18px;
    }
  }
</style>
