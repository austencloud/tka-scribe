<!--
  BeatEditorPanel.svelte

  Panel for editing individual beats (turns, rotation, orientation).
  Opens directly when clicking a pictograph, or via "Edit Turns" in Sequence Actions.
  Non-modal - allows clicking through to other pictographs while open.
-->
<script lang="ts">
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import Pictograph from "$lib/shared/pictograph/shared/components/Pictograph.svelte";
  import TurnsEditMode from "./TurnsEditMode.svelte";
  import StartPositionEditMode from "./StartPositionEditMode.svelte";
  import type { BeatData } from "../../domain/models/BeatData";
  import {
    MotionColor,
    MotionType,
    RotationDirection,
  } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";

  interface Props {
    isOpen: boolean;
    selectedBeatNumber: number | null;
    selectedBeatData: BeatData | null;
    onClose: () => void;
    onTurnsChange: (color: MotionColor, delta: number) => void;
    onRotationChange: (color: MotionColor, direction: RotationDirection) => void;
    onOrientationChange: (color: MotionColor, orientation: string) => void;
    onDelete?: () => void;
  }

  let {
    isOpen = $bindable(),
    selectedBeatNumber,
    selectedBeatData,
    onClose,
    onTurnsChange,
    onRotationChange,
    onOrientationChange,
    onDelete,
  }: Props = $props();

  // Derived state
  const hasSelection = $derived(selectedBeatNumber !== null);
  const isStartPositionSelected = $derived(selectedBeatNumber === 0);

  const blueMotion = $derived(selectedBeatData?.motions?.[MotionColor.BLUE]);
  const redMotion = $derived(selectedBeatData?.motions?.[MotionColor.RED]);

  const normalizeTurns = (turns: number | string | undefined): number =>
    turns === "fl" ? -0.5 : Number(turns) || 0;

  const currentBlueTurns = $derived(normalizeTurns(blueMotion?.turns));
  const currentRedTurns = $derived(normalizeTurns(redMotion?.turns));

  const displayBlueTurns = $derived(
    blueMotion?.turns === "fl" ? "fl" : currentBlueTurns
  );
  const displayRedTurns = $derived(
    redMotion?.turns === "fl" ? "fl" : currentRedTurns
  );

  // Determine if rotation can be shown for each prop
  const showBlueRotation = $derived.by(() => {
    if (currentBlueTurns < 0) return false; // Float motion
    if (
      (blueMotion?.motionType === MotionType.STATIC ||
        blueMotion?.motionType === MotionType.DASH) &&
      currentBlueTurns === 0
    ) {
      return false;
    }
    return true;
  });

  const showRedRotation = $derived.by(() => {
    if (currentRedTurns < 0) return false; // Float motion
    if (
      (redMotion?.motionType === MotionType.STATIC ||
        redMotion?.motionType === MotionType.DASH) &&
      currentRedTurns === 0
    ) {
      return false;
    }
    return true;
  });

  const blueRotation = $derived(
    blueMotion?.rotationDirection ?? RotationDirection.NO_ROTATION
  );
  const redRotation = $derived(
    redMotion?.rotationDirection ?? RotationDirection.NO_ROTATION
  );

  const beatLabel = $derived.by(() => {
    if (selectedBeatNumber === null) return "";
    return selectedBeatNumber === 0
      ? "Start Position"
      : `Beat ${selectedBeatNumber}`;
  });

  function handleClose() {
    onClose();
  }
</script>

<Drawer
  bind:isOpen
  placement="right"
  onclose={handleClose}
  class="beat-editor-panel"
  trapFocus={false}
  setInertOnSiblings={false}
  closeOnBackdrop={false}
>
  <div class="drawer-content">
    <header class="drawer-header">
      <div class="header-info">
        <h2>Beat Editor</h2>
        <span class="subtitle">{beatLabel}</span>
      </div>
      <div class="header-actions">
        {#if onDelete && hasSelection}
          <button
            class="delete-btn"
            onclick={onDelete}
            aria-label={isStartPositionSelected ? "Delete start position" : "Delete beat"}
            title={isStartPositionSelected ? "Delete start position" : "Delete this beat"}
          >
            <i class="fa-solid fa-trash"></i>
          </button>
        {/if}
        <button class="close-btn" onclick={handleClose}>
          <i class="fas fa-times"></i>
        </button>
      </div>
    </header>

    <!-- Pictograph Preview -->
    {#if hasSelection && selectedBeatData}
      <div class="preview-section">
        <div class="pictograph-container">
          <Pictograph pictographData={selectedBeatData} />
        </div>
      </div>
    {/if}

    <div class="controls-container">
      {#if !hasSelection}
        <div class="no-selection">
          <i class="fas fa-hand-pointer"></i>
          <p>Select a beat to edit</p>
        </div>
      {:else if isStartPositionSelected}
        <StartPositionEditMode
          startPositionData={selectedBeatData}
          {onOrientationChange}
        />
      {:else}
        <TurnsEditMode
          {hasSelection}
          blueTurns={displayBlueTurns}
          redTurns={displayRedTurns}
          {blueRotation}
          {redRotation}
          {showBlueRotation}
          {showRedRotation}
          {onTurnsChange}
          {onRotationChange}
        />
      {/if}
    </div>
  </div>
</Drawer>

<style>
  .drawer-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background: var(--theme-panel-bg, rgba(20, 20, 25, 0.95));
    color: var(--theme-text, #fff);
  }

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    flex-shrink: 0;
  }

  .header-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .drawer-header h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .subtitle {
    font-size: 0.8rem;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .delete-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.15s ease;
    background: linear-gradient(135deg, var(--semantic-warning, #ff9800) 0%, color-mix(in srgb, var(--semantic-warning, #ff9800) 80%, #ff0000) 100%);
    border: 1px solid color-mix(in srgb, var(--semantic-warning, #ff9800) 30%, transparent);
    color: white;
  }

  .delete-btn:hover {
    background: linear-gradient(135deg, color-mix(in srgb, var(--semantic-warning, #ff9800) 80%, #ff0000) 0%, color-mix(in srgb, var(--semantic-warning, #ff9800) 60%, #ff0000) 100%);
    transform: scale(1.05);
  }

  .delete-btn i {
    font-size: 0.95rem;
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(100, 100, 120, 0.85), rgba(70, 70, 90, 0.85));
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: white;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.15s ease;
  }

  .close-btn:hover {
    background: linear-gradient(135deg, rgba(120, 120, 140, 0.95), rgba(90, 90, 110, 0.95));
  }

  /* Pictograph Preview Section */
  .preview-section {
    padding: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    background: rgba(0, 0, 0, 0.2);
    flex-shrink: 0;
  }

  .pictograph-container {
    width: min(200px, 50vw);
    aspect-ratio: 1;
  }

  .controls-container {
    padding: 16px;
    overflow-y: auto;
  }

  .no-selection {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 48px 24px;
    text-align: center;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
  }

  .no-selection i {
    font-size: 2rem;
    opacity: 0.6;
  }

  .no-selection p {
    margin: 0;
    font-size: 0.9rem;
  }
</style>
