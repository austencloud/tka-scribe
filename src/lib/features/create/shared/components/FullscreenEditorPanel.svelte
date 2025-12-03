<!--
  FullscreenEditorPanel.svelte

  A slide-out panel for sequence editing that:
  - Slides from bottom on mobile, right on desktop (like other Create drawers)
  - Shows only controls (no beat grid) - the beat panel remains visible and clickable
  - Two modes: "Turns" (edit individual beat) vs "Transforms" (sequence transformations)

  Height covers nav + tool panel area, leaving the beat display visible.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { BeatData } from "../domain/models/BeatData";
  import {
    MotionColor,
    RotationDirection,
  } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
  import CreatePanelDrawer from "./CreatePanelDrawer.svelte";
  import PanelHeader from "$lib/features/create/shared/components/PanelHeader.svelte";
  import { getCreateModuleContext } from "../context/create-module-context";
  import { goto } from "$app/navigation";
  import type { ISequenceEncoderService } from "$lib/shared/navigation/services/contracts/ISequenceEncoderService";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";

  type EditMode = "turns" | "transforms";

  interface Props {
    show: boolean;
    onClose?: () => void;
  }

  let { show, onClose }: Props = $props();

  // Local state for bindable isOpen
  let isOpen = $state(show);

  // Sync with prop
  $effect(() => {
    isOpen = show;
  });

  // Get Create module context
  const ctx = getCreateModuleContext();
  const { CreateModuleState, panelState } = ctx;

  // Get active sequence state
  const activeSequenceState = $derived(
    CreateModuleState.getActiveTabSequenceState()
  );
  const sequence = $derived(activeSequenceState.currentSequence);
  const hasSequence = $derived(activeSequenceState.hasSequence());

  // Calculate panel height: nav bar + tool area only (NOT button panel)
  // This leaves the beat display (button panel) fully visible above the drawer
  const panelHeight = $derived(
    panelState.navigationBarHeight + panelState.toolPanelHeight
  );

  // Services
  let hapticService: IHapticFeedbackService | null = $state(null);

  // Local state
  let currentMode = $state<EditMode>("transforms");
  let isTransforming = $state(false);

  // Get selected beat from the main sequence state
  const selectedBeatNumber = $derived(activeSequenceState.selectedBeatNumber);
  const selectedBeatData = $derived(activeSequenceState.selectedBeatData);

  onMount(() => {
    try {
      hapticService = resolve<IHapticFeedbackService>(
        TYPES.IHapticFeedbackService
      );
    } catch (error) {
      console.warn(
        "FullscreenEditorPanel: Failed to resolve IHapticFeedbackService:",
        error
      );
    }
  });

  // Reset mode when panel closes
  $effect(() => {
    if (!show) {
      currentMode = "transforms";
    }
  });

  // Auto-switch to turns mode when a beat is selected
  $effect(() => {
    if (show && selectedBeatNumber !== null) {
      currentMode = "turns";
    }
  });

  // Derived state for beat editing
  const hasSelection = $derived(selectedBeatNumber !== null);
  const isStartPositionSelected = $derived(selectedBeatNumber === 0);

  // Get motion data for selected beat
  const blueMotion = $derived(selectedBeatData?.motions?.[MotionColor.BLUE]);
  const redMotion = $derived(selectedBeatData?.motions?.[MotionColor.RED]);

  const normalizeTurns = (turns: number | string | undefined): number =>
    turns === "fl" ? -0.5 : Number(turns) || 0;

  const rawBlueTurns = $derived(blueMotion?.turns);
  const rawRedTurns = $derived(redMotion?.turns);
  const currentBlueTurns = $derived(normalizeTurns(rawBlueTurns));
  const currentRedTurns = $derived(normalizeTurns(rawRedTurns));
  const displayBlueTurns = $derived(
    rawBlueTurns === "fl" ? "fl" : currentBlueTurns
  );
  const displayRedTurns = $derived(
    rawRedTurns === "fl" ? "fl" : currentRedTurns
  );
  const showBlueRotation = $derived(currentBlueTurns >= 0);
  const showRedRotation = $derived(currentRedTurns >= 0);
  const currentBlueRotation = $derived(
    blueMotion?.rotationDirection ?? RotationDirection.NO_ROTATION
  );
  const currentRedRotation = $derived(
    redMotion?.rotationDirection ?? RotationDirection.NO_ROTATION
  );

  // Beat editing handlers
  function handleTurnsChange(
    color: typeof MotionColor.BLUE | typeof MotionColor.RED,
    delta: number
  ) {
    if (selectedBeatNumber === null || !selectedBeatData?.motions) return;

    hapticService?.trigger("selection");

    const motionData = selectedBeatData.motions[color];
    if (!motionData) return;

    const currentTurns =
      color === MotionColor.BLUE ? currentBlueTurns : currentRedTurns;
    const newNumericTurns = Math.max(-0.5, currentTurns + delta);
    const newTurns: number | "fl" =
      newNumericTurns === -0.5 ? "fl" : newNumericTurns;

    const updatedMotions = {
      ...selectedBeatData.motions,
      [color]: {
        ...motionData,
        turns: newTurns,
      },
    };

    if (isStartPositionSelected) {
      activeSequenceState.setStartPosition({
        ...selectedBeatData,
        motions: updatedMotions,
      } as BeatData);
    } else {
      activeSequenceState.updateBeat(selectedBeatNumber - 1, {
        motions: updatedMotions,
      });
    }
  }

  function handleRotationChange(
    color: typeof MotionColor.BLUE | typeof MotionColor.RED,
    direction: RotationDirection
  ) {
    if (selectedBeatNumber === null || !selectedBeatData?.motions) return;

    hapticService?.trigger("selection");

    const motionData = selectedBeatData.motions[color];
    if (!motionData) return;

    const updatedMotions = {
      ...selectedBeatData.motions,
      [color]: {
        ...motionData,
        rotationDirection: direction,
      },
    };

    if (isStartPositionSelected) {
      activeSequenceState.setStartPosition({
        ...selectedBeatData,
        motions: updatedMotions,
      } as BeatData);
    } else {
      activeSequenceState.updateBeat(selectedBeatNumber - 1, {
        motions: updatedMotions,
      });
    }
  }

  // Sequence transformation handlers
  async function handleMirror() {
    if (!sequence || isTransforming) return;
    isTransforming = true;
    hapticService?.trigger("selection");
    try {
      await activeSequenceState.mirrorSequence();
    } finally {
      isTransforming = false;
    }
  }

  async function handleRotate(direction: "cw" | "ccw") {
    if (!sequence || isTransforming) return;
    isTransforming = true;
    hapticService?.trigger("selection");
    try {
      const rotationDirection =
        direction === "cw" ? "clockwise" : "counterclockwise";
      await activeSequenceState.rotateSequence(rotationDirection);
    } finally {
      isTransforming = false;
    }
  }

  async function handleSwapColors() {
    if (!sequence || isTransforming) return;
    isTransforming = true;
    hapticService?.trigger("selection");
    try {
      await activeSequenceState.swapColors();
    } finally {
      isTransforming = false;
    }
  }

  async function handleReverse() {
    if (!sequence || isTransforming) return;
    isTransforming = true;
    hapticService?.trigger("selection");
    try {
      await activeSequenceState.reverseSequence();
    } finally {
      isTransforming = false;
    }
  }

  function handlePreview() {
    if (!sequence) return;
    hapticService?.trigger("selection");
    handleClose();
    try {
      const encoderService = resolve<ISequenceEncoderService>(
        TYPES.ISequenceEncoderService
      );
      const { url } = encoderService.generateViewerURL(sequence, {
        compress: true,
      });
      const urlObj = new URL(url);
      goto(urlObj.pathname);
    } catch (err) {
      console.error("Failed to generate preview URL:", err);
    }
  }

  function handleClose() {
    hapticService?.trigger("selection");
    onClose?.();
  }

  // Get beat label for header
  const beatLabel = $derived.by(() => {
    if (selectedBeatNumber === null) return "";
    if (selectedBeatNumber === 0) return "Start Position";
    return `Beat ${selectedBeatNumber}`;
  });
</script>

<CreatePanelDrawer
  bind:isOpen
  panelName="sequence-actions"
  combinedPanelHeight={panelHeight}
  showHandle={true}
  closeOnBackdrop={true}
  focusTrap={false}
  lockScroll={false}
  ariaLabel="Sequence editor panel"
  onClose={handleClose}
>
  <div class="editor-panel">
    <PanelHeader
      title={currentMode === "turns" && hasSelection
        ? beatLabel
        : "Sequence Actions"}
      isMobile={true}
      onClose={handleClose}
    />

    <!-- Mode Toggle -->
    <div class="mode-toggle">
      <button
        class="mode-btn"
        class:active={currentMode === "turns"}
        onclick={() => (currentMode = "turns")}
      >
        <i class="fas fa-sliders-h"></i>
        Turns
      </button>
      <button
        class="mode-btn"
        class:active={currentMode === "transforms"}
        onclick={() => (currentMode = "transforms")}
      >
        <i class="fas fa-wand-magic-sparkles"></i>
        Transforms
      </button>
    </div>

    <!-- Controls Content -->
    <div class="controls-content">
      {#if currentMode === "turns"}
        <!-- Turns Mode - Beat Edit Controls -->
        {#if !hasSelection}
          <div class="empty-state">
            <i class="fas fa-hand-pointer"></i>
            <p>Tap a beat in the sequence to edit its turns</p>
          </div>
        {:else}
          <div class="beat-controls">
            <div class="prop-row">
              <!-- Blue Prop -->
              <div class="prop-controls blue">
                <span class="prop-label">Blue</span>
                <div class="turns-row">
                  <button
                    class="ctrl-btn"
                    aria-label="Decrease blue turns"
                    onclick={() => handleTurnsChange(MotionColor.BLUE, -0.5)}
                  >
                    <i class="fas fa-minus"></i>
                  </button>
                  <span class="turns-value">{displayBlueTurns}</span>
                  <button
                    class="ctrl-btn"
                    aria-label="Increase blue turns"
                    onclick={() => handleTurnsChange(MotionColor.BLUE, 0.5)}
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
                <div class="rotation-row">
                  <button
                    class="rot-btn"
                    class:active={showBlueRotation &&
                      currentBlueRotation === RotationDirection.CLOCKWISE}
                    aria-label="Rotate blue clockwise"
                    onclick={() =>
                      handleRotationChange(
                        MotionColor.BLUE,
                        RotationDirection.CLOCKWISE
                      )}
                    disabled={!showBlueRotation}
                  >
                    <i class="fas fa-rotate-right"></i>
                  </button>
                  <button
                    class="rot-btn"
                    class:active={showBlueRotation &&
                      currentBlueRotation ===
                        RotationDirection.COUNTER_CLOCKWISE}
                    aria-label="Rotate blue counter clockwise"
                    onclick={() =>
                      handleRotationChange(
                        MotionColor.BLUE,
                        RotationDirection.COUNTER_CLOCKWISE
                      )}
                    disabled={!showBlueRotation}
                  >
                    <i class="fas fa-rotate-left"></i>
                  </button>
                </div>
              </div>

              <!-- Red Prop -->
              <div class="prop-controls red">
                <span class="prop-label">Red</span>
                <div class="turns-row">
                  <button
                    class="ctrl-btn"
                    aria-label="Decrease red turns"
                    onclick={() => handleTurnsChange(MotionColor.RED, -0.5)}
                  >
                    <i class="fas fa-minus"></i>
                  </button>
                  <span class="turns-value">{displayRedTurns}</span>
                  <button
                    class="ctrl-btn"
                    aria-label="Increase red turns"
                    onclick={() => handleTurnsChange(MotionColor.RED, 0.5)}
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
                <div class="rotation-row">
                  <button
                    class="rot-btn"
                    class:active={showRedRotation &&
                      currentRedRotation === RotationDirection.CLOCKWISE}
                    aria-label="Rotate red clockwise"
                    onclick={() =>
                      handleRotationChange(
                        MotionColor.RED,
                        RotationDirection.CLOCKWISE
                      )}
                    disabled={!showRedRotation}
                  >
                    <i class="fas fa-rotate-right"></i>
                  </button>
                  <button
                    class="rot-btn"
                    class:active={showRedRotation &&
                      currentRedRotation ===
                        RotationDirection.COUNTER_CLOCKWISE}
                    aria-label="Rotate red counter clockwise"
                    onclick={() =>
                      handleRotationChange(
                        MotionColor.RED,
                        RotationDirection.COUNTER_CLOCKWISE
                      )}
                    disabled={!showRedRotation}
                  >
                    <i class="fas fa-rotate-left"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        {/if}
      {:else}
        <!-- Transforms Mode - Sequence Transform Controls -->
        <div class="transform-grid">
          <button
            class="action-btn"
            onclick={handleMirror}
            disabled={isTransforming || !hasSequence}
          >
            <i class="fas fa-left-right"></i>
            <span>Mirror</span>
          </button>
          <button
            class="action-btn"
            onclick={() => handleRotate("cw")}
            disabled={isTransforming || !hasSequence}
          >
            <i class="fas fa-rotate-right"></i>
            <span>Rotate CW</span>
          </button>
          <button
            class="action-btn"
            onclick={() => handleRotate("ccw")}
            disabled={isTransforming || !hasSequence}
          >
            <i class="fas fa-rotate-left"></i>
            <span>Rotate CCW</span>
          </button>
          <button
            class="action-btn"
            onclick={handleSwapColors}
            disabled={isTransforming || !hasSequence}
          >
            <i class="fas fa-palette"></i>
            <span>Swap Colors</span>
          </button>
          <button
            class="action-btn"
            onclick={handleReverse}
            disabled={isTransforming || !hasSequence}
          >
            <i class="fas fa-backward"></i>
            <span>Reverse</span>
          </button>
          <button
            class="action-btn"
            onclick={handlePreview}
            disabled={!hasSequence}
          >
            <i class="fas fa-eye"></i>
            <span>Preview</span>
          </button>
        </div>
      {/if}
    </div>
  </div>
</CreatePanelDrawer>

<style>
  .editor-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  /* Mode Toggle */
  .mode-toggle {
    display: flex;
    gap: 4px;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }

  .mode-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 12px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid transparent;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.15s ease;
    min-height: 48px;
    min-width: 48px;
  }

  .mode-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .mode-btn.active {
    background: rgba(6, 182, 212, 0.2);
    border-color: rgba(6, 182, 212, 0.5);
    color: #06b6d4;
  }

  /* Controls Content */
  .controls-content {
    flex: 1;
    min-height: 0;
    padding: 12px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 12px;
    color: rgba(255, 255, 255, 0.4);
    text-align: center;
  }

  .empty-state i {
    font-size: 2rem;
    opacity: 0.5;
  }

  .empty-state p {
    font-size: 0.9rem;
    margin: 0;
  }

  /* Beat Controls */
  .beat-controls {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .prop-row {
    display: flex;
    gap: 12px;
  }

  .prop-controls {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 14px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.03);
  }

  .prop-controls.blue {
    border-left: 3px solid #3b82f6;
  }

  .prop-controls.red {
    border-left: 3px solid #ef4444;
  }

  .prop-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .turns-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .ctrl-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    font-size: 1.1rem;
    transition: all 0.15s ease;
  }

  .ctrl-btn:hover {
    background: rgba(6, 182, 212, 0.3);
  }

  .ctrl-btn:active {
    transform: scale(0.95);
  }

  .turns-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    min-width: 48px;
    text-align: center;
  }

  .rotation-row {
    display: flex;
    gap: 8px;
  }

  .rot-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    font-size: 1.1rem;
    transition: all 0.15s ease;
  }

  .rot-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
  }

  .rot-btn.active {
    background: rgba(6, 182, 212, 0.25);
    border-color: #06b6d4;
    color: #06b6d4;
  }

  .rot-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* Transform Grid */
  .transform-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    height: 100%;
    align-content: center;
  }

  .action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 16px 8px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .action-btn:hover:not(:disabled) {
    background: rgba(6, 182, 212, 0.15);
    border-color: rgba(6, 182, 212, 0.4);
    transform: translateY(-2px);
  }

  .action-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .action-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .action-btn i {
    font-size: 1.35rem;
    color: #06b6d4;
  }

  .action-btn span {
    font-size: 0.8rem;
    font-weight: 500;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .mode-btn,
    .action-btn,
    .ctrl-btn,
    .rot-btn {
      transition: none;
    }
  }
</style>
