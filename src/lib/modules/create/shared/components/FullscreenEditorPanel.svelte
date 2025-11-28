<!--
  FullscreenEditorPanel.svelte

  A fullscreen editing overlay that combines:
  - Beat grid display with selection
  - Individual beat editing (turns, rotation)
  - Sequence transformations (mirror, rotate, swap, reverse)

  Replaces the partial-screen SequenceActionsPanel with a more comprehensive
  editing experience that doesn't require clicking individual beats first.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve } from "$shared/inversify";
  import { TYPES } from "$shared/inversify/types";
  import type { SequenceData } from "$shared/foundation/domain/models/SequenceData";
  import type { BeatData } from "../domain/models/BeatData";
  import type { PictographData } from "$shared/pictograph/shared/domain/models/PictographData";
  import type { ISequenceNormalizationService } from "$lib/modules/animate/services/contracts";
  import type { ISequenceTransformationService } from "../services/contracts";
  import { isStartPosition } from "$create/shared";
  import { MotionColor, RotationDirection } from "$shared/pictograph/shared/domain/enums/pictograph-enums";
  import BeatGrid from "../workspace-panel/sequence-display/components/BeatGrid.svelte";
  import { getCreateModuleContext } from "../context";
  import { goto } from "$app/navigation";
  import { container } from "$lib/shared/inversify";
  import type { ISequenceEncoderService } from "$lib/shared/navigation/services/contracts/ISequenceEncoderService";

  type EditMode = "beat" | "sequence";

  interface Props {
    show: boolean;
    onClose?: () => void;
  }

  let { show, onClose }: Props = $props();

  // Get Create module context
  const ctx = getCreateModuleContext();
  const { CreateModuleState, panelState } = ctx;

  // Get active sequence state
  const activeSequenceState = $derived(CreateModuleState.getActiveTabSequenceState());
  const sequence = $derived(activeSequenceState.currentSequence);
  const hasSequence = $derived(activeSequenceState.hasSequence());

  // Services
  let normalizationService: ISequenceNormalizationService | null = $state(null);
  let transformService: ISequenceTransformationService | null = $state(null);

  // Local state
  let currentMode = $state<EditMode>("beat");
  let selectedBeatNumber = $state<number | null>(null);
  let selectedBeatData = $state<BeatData | null>(null);
  let selectedBeatNumbers = $state<number[]>([]);
  let isTransforming = $state(false);

  onMount(() => {
    try {
      normalizationService = resolve<ISequenceNormalizationService>(
        TYPES.ISequenceNormalizationService
      );
    } catch (error) {
      console.warn("FullscreenEditorPanel: Failed to resolve ISequenceNormalizationService:", error);
    }

    try {
      transformService = resolve<ISequenceTransformationService>(
        TYPES.ISequenceTransformationService
      );
    } catch (error) {
      console.warn("FullscreenEditorPanel: Failed to resolve ISequenceTransformationService:", error);
    }
  });

  // Reset selection when panel closes
  $effect(() => {
    if (!show) {
      selectedBeatNumber = null;
      selectedBeatData = null;
      selectedBeatNumbers = [];
    }
  });

  /**
   * Fallback normalization when service isn't available
   */
  function manualNormalize(seq: SequenceData) {
    if (seq.startPosition) {
      return {
        beats: seq.beats || [],
        startPosition: seq.startPosition,
      };
    }

    if (seq.startingPositionBeat) {
      return {
        beats: seq.beats || [],
        startPosition: seq.startingPositionBeat,
      };
    }

    const allBeats = seq.beats || [];
    const startPos = allBeats.find((beat) => isStartPosition(beat)) || null;
    const beats = allBeats.filter((beat) => !isStartPosition(beat));

    return { beats, startPosition: startPos };
  }

  // Normalize sequence data
  const normalizedData = $derived.by(() => {
    if (!sequence) {
      return { beats: [], startPosition: null };
    }

    if (normalizationService) {
      return normalizationService.separateBeatsFromStartPosition(sequence);
    }

    return manualNormalize(sequence);
  });

  const beats = $derived(normalizedData.beats);
  const startPosition = $derived(normalizedData.startPosition);
  const selectedBeatNumbersSet = $derived(new Set(selectedBeatNumbers));

  // Derived state for beat editing
  const hasSelection = $derived(
    selectedBeatNumber !== null || selectedBeatNumbers.length > 0
  );
  const isMultiSelect = $derived(selectedBeatNumbers.length > 1);
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
  const displayBlueTurns = $derived(rawBlueTurns === "fl" ? "fl" : currentBlueTurns);
  const displayRedTurns = $derived(rawRedTurns === "fl" ? "fl" : currentRedTurns);
  const showBlueRotation = $derived(currentBlueTurns >= 0);
  const showRedRotation = $derived(currentRedTurns >= 0);
  const currentBlueRotation = $derived(blueMotion?.rotationDirection ?? RotationDirection.NO_ROTATION);
  const currentRedRotation = $derived(redMotion?.rotationDirection ?? RotationDirection.NO_ROTATION);

  // Beat selection handlers
  function handleBeatClick(beatNumber: number) {
    const beatData = beatNumber === 0
      ? (startPosition as BeatData | null)
      : (beats[beatNumber - 1] ?? null);
    selectedBeatNumber = beatNumber;
    selectedBeatData = beatData;
    selectedBeatNumbers = [];
  }

  function handleStartClick() {
    selectedBeatNumber = 0;
    selectedBeatData = startPosition as BeatData | null;
    selectedBeatNumbers = [];
  }

  function handleBeatLongPress(beatNumber: number) {
    const index = selectedBeatNumbers.indexOf(beatNumber);
    if (index === -1) {
      selectedBeatNumbers = [...selectedBeatNumbers, beatNumber];
    } else {
      selectedBeatNumbers = selectedBeatNumbers.filter((n) => n !== beatNumber);
    }
    selectedBeatNumber = null;
    selectedBeatData = null;
  }

  function handleStartLongPress() {
    handleBeatLongPress(0);
  }

  // Beat editing handlers
  function handleTurnsChange(color: typeof MotionColor.BLUE | typeof MotionColor.RED, delta: number) {
    if (selectedBeatNumber === null || !selectedBeatData?.motions) return;

    const motionData = selectedBeatData.motions[color];
    if (!motionData) return;

    const currentTurns = color === MotionColor.BLUE ? currentBlueTurns : currentRedTurns;
    const newNumericTurns = Math.max(-0.5, currentTurns + delta);
    const newTurns: number | "fl" = newNumericTurns === -0.5 ? "fl" : newNumericTurns;

    const updatedMotions = {
      ...selectedBeatData.motions,
      [color]: {
        ...motionData,
        turns: newTurns,
      },
    };

    if (isStartPositionSelected) {
      // Update start position
      const updatedStartPosition = {
        ...selectedBeatData,
        motions: updatedMotions,
      } as BeatData;
      activeSequenceState.setStartPosition(updatedStartPosition);
      selectedBeatData = updatedStartPosition;
    } else {
      // Update beat
      activeSequenceState.updateBeat(selectedBeatNumber - 1, { motions: updatedMotions });
      selectedBeatData = { ...selectedBeatData, motions: updatedMotions };
    }
  }

  function handleRotationChange(color: typeof MotionColor.BLUE | typeof MotionColor.RED, direction: RotationDirection) {
    if (selectedBeatNumber === null || !selectedBeatData?.motions) return;

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
      const updatedStartPosition = {
        ...selectedBeatData,
        motions: updatedMotions,
      } as BeatData;
      activeSequenceState.setStartPosition(updatedStartPosition);
      selectedBeatData = updatedStartPosition;
    } else {
      activeSequenceState.updateBeat(selectedBeatNumber - 1, { motions: updatedMotions });
      selectedBeatData = { ...selectedBeatData, motions: updatedMotions };
    }
  }

  // Sequence transformation handlers
  async function handleMirror() {
    if (!sequence || isTransforming) return;
    isTransforming = true;
    try {
      await activeSequenceState.mirrorSequence();
    } finally {
      isTransforming = false;
    }
  }

  async function handleRotate(direction: "cw" | "ccw") {
    if (!sequence || isTransforming) return;
    isTransforming = true;
    try {
      const rotationDirection = direction === "cw" ? "clockwise" : "counterclockwise";
      await activeSequenceState.rotateSequence(rotationDirection);
    } finally {
      isTransforming = false;
    }
  }

  async function handleSwapColors() {
    if (!sequence || isTransforming) return;
    isTransforming = true;
    try {
      await activeSequenceState.swapColors();
    } finally {
      isTransforming = false;
    }
  }

  async function handleReverse() {
    if (!sequence || isTransforming) return;
    isTransforming = true;
    try {
      await activeSequenceState.reverseSequence();
    } finally {
      isTransforming = false;
    }
  }

  function handleCopyJSON() {
    if (!sequence) return;
    navigator.clipboard.writeText(JSON.stringify(sequence, null, 2));
  }

  function handlePreview() {
    if (!sequence) return;
    onClose?.();
    try {
      const encoderService = container.get<ISequenceEncoderService>(TYPES.ISequenceEncoderService);
      const { url } = encoderService.generateViewerURL(sequence, { compress: true });
      const urlObj = new URL(url);
      goto(urlObj.pathname);
    } catch (err) {
      console.error("Failed to generate preview URL:", err);
    }
  }

  function handleClose() {
    onClose?.();
  }
</script>

{#if show}
  <div
    class="fullscreen-editor-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="editor-title"
  >
    <div class="editor-container">
      <!-- Header -->
      <header class="editor-header">
        <h2 id="editor-title" class="editor-title">
          {sequence?.name || "Edit Sequence"}
          {#if beats.length > 0}
            <span class="beat-count">({beats.length} beats)</span>
          {/if}
        </h2>
        <button
          class="close-button"
          onclick={handleClose}
          aria-label="Close editor"
        >
          <i class="fas fa-times"></i>
        </button>
      </header>

      <!-- Main content -->
      <div class="editor-content">
        <!-- Left: Beat Grid -->
        <div class="beat-grid-section">
          {#if hasSequence}
            <div class="grid-wrapper">
              <BeatGrid
                {beats}
                {startPosition}
                {selectedBeatNumber}
                selectedBeatNumbers={selectedBeatNumbersSet}
                onBeatClick={handleBeatClick}
                onStartClick={handleStartClick}
                onBeatLongPress={handleBeatLongPress}
                onStartLongPress={handleStartLongPress}
                isMultiSelectMode={selectedBeatNumbers.length > 0}
              />
            </div>
            <p class="grid-hint">Click a beat to edit. Long-press to multi-select.</p>
          {:else}
            <div class="no-sequence">
              <i class="fas fa-layer-group"></i>
              <p>No sequence to edit</p>
              <p class="hint">Create or load a sequence first</p>
            </div>
          {/if}
        </div>

        <!-- Right: Edit Controls -->
        <div class="controls-section">
          <!-- Mode Toggle -->
          <div class="mode-toggle">
            <button
              class="mode-btn"
              class:active={currentMode === "beat"}
              onclick={() => (currentMode = "beat")}
            >
              <i class="fas fa-pen"></i>
              <span>Beat</span>
            </button>
            <button
              class="mode-btn"
              class:active={currentMode === "sequence"}
              onclick={() => (currentMode = "sequence")}
            >
              <i class="fas fa-layer-group"></i>
              <span>Sequence</span>
            </button>
          </div>

          <!-- Edit Controls Container -->
          <div class="controls-container">
            {#if currentMode === "beat"}
              <!-- Beat Edit Panel -->
              <div class="beat-edit-panel">
                {#if !hasSelection}
                  <div class="no-selection">
                    <i class="fas fa-hand-pointer"></i>
                    <p>Select a beat to edit</p>
                  </div>
                {:else if isMultiSelect}
                  <div class="multi-select-info">
                    <i class="fas fa-layer-group"></i>
                    <p>{selectedBeatNumbers.length} beats selected</p>
                    <p class="hint">Batch editing coming soon</p>
                  </div>
                {:else}
                  <div class="edit-controls">
                    <h3 class="panel-title">
                      {isStartPositionSelected ? "Edit Start Position" : `Edit Beat ${selectedBeatNumber}`}
                    </h3>

                    <!-- Blue Prop Section -->
                    <div class="prop-section blue">
                      <h4 class="section-title">
                        <span class="color-indicator blue"></span>
                        Blue Prop
                      </h4>

                      <div class="control-group">
                        <span class="control-label">Turns</span>
                        <div class="turns-control">
                          <button
                            class="control-btn"
                            onclick={() => handleTurnsChange(MotionColor.BLUE, -0.5)}
                            aria-label="Decrease turns"
                          >
                            <i class="fas fa-minus"></i>
                          </button>
                          <span class="turns-value">{displayBlueTurns}</span>
                          <button
                            class="control-btn"
                            onclick={() => handleTurnsChange(MotionColor.BLUE, 0.5)}
                            aria-label="Increase turns"
                          >
                            <i class="fas fa-plus"></i>
                          </button>
                        </div>
                      </div>

                      <div class="control-group">
                        <span class="control-label">Rotation</span>
                        <div class="rotation-control">
                          <button
                            class="rotation-btn"
                            class:active={showBlueRotation && currentBlueRotation === RotationDirection.CLOCKWISE}
                            onclick={() => handleRotationChange(MotionColor.BLUE, RotationDirection.CLOCKWISE)}
                            disabled={!showBlueRotation}
                            aria-label="Clockwise rotation"
                          >
                            <i class="fas fa-rotate-right"></i>
                          </button>
                          <button
                            class="rotation-btn"
                            class:active={showBlueRotation && currentBlueRotation === RotationDirection.COUNTER_CLOCKWISE}
                            onclick={() => handleRotationChange(MotionColor.BLUE, RotationDirection.COUNTER_CLOCKWISE)}
                            disabled={!showBlueRotation}
                            aria-label="Counter-clockwise rotation"
                          >
                            <i class="fas fa-rotate-left"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Red Prop Section -->
                    <div class="prop-section red">
                      <h4 class="section-title">
                        <span class="color-indicator red"></span>
                        Red Prop
                      </h4>

                      <div class="control-group">
                        <span class="control-label">Turns</span>
                        <div class="turns-control">
                          <button
                            class="control-btn"
                            onclick={() => handleTurnsChange(MotionColor.RED, -0.5)}
                            aria-label="Decrease turns"
                          >
                            <i class="fas fa-minus"></i>
                          </button>
                          <span class="turns-value">{displayRedTurns}</span>
                          <button
                            class="control-btn"
                            onclick={() => handleTurnsChange(MotionColor.RED, 0.5)}
                            aria-label="Increase turns"
                          >
                            <i class="fas fa-plus"></i>
                          </button>
                        </div>
                      </div>

                      <div class="control-group">
                        <span class="control-label">Rotation</span>
                        <div class="rotation-control">
                          <button
                            class="rotation-btn"
                            class:active={showRedRotation && currentRedRotation === RotationDirection.CLOCKWISE}
                            onclick={() => handleRotationChange(MotionColor.RED, RotationDirection.CLOCKWISE)}
                            disabled={!showRedRotation}
                            aria-label="Clockwise rotation"
                          >
                            <i class="fas fa-rotate-right"></i>
                          </button>
                          <button
                            class="rotation-btn"
                            class:active={showRedRotation && currentRedRotation === RotationDirection.COUNTER_CLOCKWISE}
                            onclick={() => handleRotationChange(MotionColor.RED, RotationDirection.COUNTER_CLOCKWISE)}
                            disabled={!showRedRotation}
                            aria-label="Counter-clockwise rotation"
                          >
                            <i class="fas fa-rotate-left"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                {/if}
              </div>
            {:else}
              <!-- Sequence Edit Panel -->
              <div class="sequence-edit-panel">
                <h3 class="panel-title">Sequence Transformations</h3>

                {#if !hasSequence}
                  <div class="no-sequence-msg">
                    <p>No sequence loaded</p>
                  </div>
                {:else}
                  <div class="transform-grid">
                    <button class="transform-btn" onclick={handlePreview} disabled={isTransforming}>
                      <div class="btn-icon"><i class="fas fa-eye"></i></div>
                      <span class="btn-label">Preview</span>
                      <span class="btn-description">View fullscreen</span>
                    </button>

                    <button class="transform-btn" onclick={handleMirror} disabled={isTransforming}>
                      <div class="btn-icon"><i class="fas fa-left-right"></i></div>
                      <span class="btn-label">Mirror</span>
                      <span class="btn-description">Flip vertically</span>
                    </button>

                    <button class="transform-btn" onclick={() => handleRotate("cw")} disabled={isTransforming}>
                      <div class="btn-icon"><i class="fas fa-rotate-right"></i></div>
                      <span class="btn-label">Rotate CW</span>
                      <span class="btn-description">45° clockwise</span>
                    </button>

                    <button class="transform-btn" onclick={() => handleRotate("ccw")} disabled={isTransforming}>
                      <div class="btn-icon"><i class="fas fa-rotate-left"></i></div>
                      <span class="btn-label">Rotate CCW</span>
                      <span class="btn-description">45° counter-clockwise</span>
                    </button>

                    <button class="transform-btn" onclick={handleSwapColors} disabled={isTransforming}>
                      <div class="btn-icon swap-icon">
                        <span class="color-dot blue"></span>
                        <i class="fas fa-arrows-rotate"></i>
                        <span class="color-dot red"></span>
                      </div>
                      <span class="btn-label">Swap Colors</span>
                      <span class="btn-description">Exchange blue & red</span>
                    </button>

                    <button class="transform-btn" onclick={handleReverse} disabled={isTransforming}>
                      <div class="btn-icon"><i class="fas fa-backward"></i></div>
                      <span class="btn-label">Reverse</span>
                      <span class="btn-description">Play backwards</span>
                    </button>

                    <button class="transform-btn" onclick={handleCopyJSON} disabled={isTransforming}>
                      <div class="btn-icon"><i class="fas fa-code"></i></div>
                      <span class="btn-label">Copy JSON</span>
                      <span class="btn-description">Debug data</span>
                    </button>
                  </div>

                  {#if isTransforming}
                    <div class="transforming-indicator">
                      <div class="spinner"></div>
                      <span>Applying transformation...</span>
                    </div>
                  {/if}
                {/if}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .fullscreen-editor-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    flex-direction: column;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .editor-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
  }

  /* Header */
  .editor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .editor-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
  }

  .beat-count {
    font-size: 0.9rem;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.5);
    margin-left: 8px;
  }

  .close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }

  .close-button i {
    font-size: 20px;
  }

  /* Main content layout */
  .editor-content {
    display: grid;
    grid-template-rows: 1fr 1fr;
    flex: 1;
    min-height: 0;
    gap: 12px;
    padding: 12px;
    overflow: hidden;
  }

  /* Side-by-side on wider/landscape screens */
  @media (min-width: 768px) and (min-aspect-ratio: 1/1) {
    .editor-content {
      grid-template-rows: 1fr;
      grid-template-columns: 1fr 1fr;
    }
  }

  /* Beat Grid Section */
  .beat-grid-section {
    display: flex;
    flex-direction: column;
    min-height: 0;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(6, 182, 212, 0.2);
    padding: 12px;
    overflow: hidden;
  }

  .grid-wrapper {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .grid-hint {
    text-align: center;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
    margin: 8px 0 0;
    flex-shrink: 0;
  }

  .no-sequence {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .no-sequence i {
    font-size: 48px;
    opacity: 0.5;
  }

  .no-sequence .hint {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.4);
  }

  /* Controls Section */
  .controls-section {
    display: flex;
    flex-direction: column;
    min-height: 0;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(6, 182, 212, 0.2);
    overflow: hidden;
  }

  /* Mode Toggle */
  .mode-toggle {
    display: flex;
    gap: 4px;
    padding: 8px;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .mode-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid transparent;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
  }

  .mode-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
  }

  .mode-btn.active {
    background: rgba(6, 182, 212, 0.15);
    border-color: rgba(6, 182, 212, 0.5);
    color: #06b6d4;
  }

  .controls-container {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 12px;
  }

  /* Beat Edit Panel Styles */
  .beat-edit-panel {
    height: 100%;
  }

  .no-selection,
  .multi-select-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .no-selection i,
  .multi-select-info i {
    font-size: 32px;
    opacity: 0.5;
  }

  .edit-controls {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .panel-title {
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .prop-section {
    padding: 12px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.02);
  }

  .prop-section.blue {
    border-left: 3px solid #3b82f6;
  }

  .prop-section.red {
    border-left: 3px solid #ef4444;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 12px 0;
  }

  .color-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .color-indicator.blue {
    background: #3b82f6;
  }

  .color-indicator.red {
    background: #ef4444;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }

  .control-group:last-child {
    margin-bottom: 0;
  }

  .control-label {
    font-size: 0.8rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
  }

  .turns-control {
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: center;
  }

  .control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .control-btn:hover:not(:disabled) {
    background: rgba(6, 182, 212, 0.2);
    border-color: #06b6d4;
  }

  .control-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .turns-value {
    font-size: 1.25rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    min-width: 50px;
    text-align: center;
  }

  .rotation-control {
    display: flex;
    gap: 8px;
  }

  .rotation-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .rotation-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
  }

  .rotation-btn.active {
    background: rgba(6, 182, 212, 0.2);
    border-color: #06b6d4;
    color: #06b6d4;
  }

  .rotation-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .hint {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.4);
    text-align: center;
    font-style: italic;
  }

  /* Sequence Edit Panel Styles */
  .sequence-edit-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .no-sequence-msg {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    color: rgba(255, 255, 255, 0.5);
  }

  .transform-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    flex: 1;
  }

  @media (min-width: 500px) {
    .transform-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .transform-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .transform-btn:hover:not(:disabled) {
    background: rgba(6, 182, 212, 0.1);
    border-color: rgba(6, 182, 212, 0.3);
    transform: translateY(-2px);
  }

  .transform-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .transform-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #06b6d4;
    height: 40px;
  }

  .swap-icon {
    gap: 8px;
  }

  .swap-icon i {
    font-size: 16px;
  }

  .color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .color-dot.blue {
    background: #3b82f6;
  }

  .color-dot.red {
    background: #ef4444;
  }

  .btn-label {
    font-size: 0.9rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
  }

  .btn-description {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .transforming-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 16px;
    padding: 12px;
    background: rgba(6, 182, 212, 0.1);
    border-radius: 8px;
    color: #06b6d4;
    font-size: 0.9rem;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top-color: #06b6d4;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .fullscreen-editor-overlay {
      animation: none;
    }

    .transform-btn:hover:not(:disabled),
    .close-button:hover {
      transform: none;
    }
  }
</style>
