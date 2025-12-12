<!-- TurnPanel - Single color turn control panel -->
<script lang="ts">
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
  import type { ITurnControlService } from "../services/TurnControlService";

  // Props
  const {
    color,
    currentBeatData,
    layoutMode = "comfortable",
    showCloseButton = false,
    onTurnAmountChanged,
    onRotationDirectionChanged,
    onEditTurnsRequested,
    onCollapse,
  } = $props<{
    color: "blue" | "red";
    currentBeatData: BeatData | null;
    layoutMode?: "compact" | "balanced" | "comfortable";
    showCloseButton?: boolean;
    onTurnAmountChanged: (color: string, turnAmount: number | "fl") => void;
    onRotationDirectionChanged?: (
      color: string,
      rotationDirection: string
    ) => void;
    onEditTurnsRequested?: () => void;
    onCollapse?: () => void;
  }>();

  // Services
  const turnControlService = resolve(
    TYPES.ITurnControlService
  ) as ITurnControlService;
  let hapticService: IHapticFeedbackService;

  // Display helpers
  const displayLabel = $derived(() => (color === "blue" ? "Left" : "Right"));

  function getCurrentTurnValue(): number | "fl" {
    return turnControlService.getCurrentTurnValue(currentBeatData, color);
  }

  function getTurnValue(): string {
    const turnValue = getCurrentTurnValue();
    return turnControlService.getTurnValue(turnValue);
  }

  function getMotionType(): string {
    if (!currentBeatData) return "Static";
    const motion =
      color === "blue"
        ? currentBeatData.motions?.blue
        : currentBeatData.motions?.red;
    if (!motion) return "Static";
    const type = motion.motionType || "static";
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  function getRawMotionType(): string | undefined {
    if (!currentBeatData) return undefined;
    const motion =
      color === "blue"
        ? currentBeatData.motions?.blue
        : currentBeatData.motions?.red;
    return motion?.motionType;
  }

  function getRotationDirection(): string {
    if (!currentBeatData) return "NO_ROTATION";
    const motion =
      color === "blue"
        ? currentBeatData.motions?.blue
        : currentBeatData.motions?.red;
    if (!motion) return "NO_ROTATION";
    return motion.rotationDirection || "NO_ROTATION";
  }

  /**
   * Determine if rotation buttons should be visible
   * Rules:
   * - HIDE when turns = "fl" (float) - no rotation direction for float
   * - SHOW when turns >= 0 (including 0) - user can set rotation even at 0 turns
   * - SHOW when turns > 0 - normal case with integer turns
   */
  function shouldShowRotationButtons(): boolean {
    const turnValue = getCurrentTurnValue();
    // Hide for float turns - float motions don't have rotation direction
    if (turnValue === "fl") {
      return false;
    }
    // Show for any numeric turn value (including 0)
    // When turns=0, user can still set rotation direction for when they add turns later
    return typeof turnValue === "number";
  }

  function canDecrementTurn(): boolean {
    const turnValue = getCurrentTurnValue();
    const motionType = getRawMotionType();
    return turnControlService.canDecrementTurn(turnValue, motionType);
  }

  function canIncrementTurn(): boolean {
    const turnValue = getCurrentTurnValue();
    return turnControlService.canIncrementTurn(turnValue);
  }

  // Handlers
  function handleTurnDecrement() {
    const currentValue = getCurrentTurnValue();
    const motionType = getRawMotionType();
    const newValue = turnControlService.decrementTurn(currentValue, motionType);
    hapticService?.trigger("selection");
    onTurnAmountChanged(color, newValue);
  }

  function handleTurnIncrement() {
    const currentValue = getCurrentTurnValue();
    const newValue = turnControlService.incrementTurn(currentValue);
    hapticService?.trigger("selection");
    onTurnAmountChanged(color, newValue);
  }

  function handleTurnLabelClick() {
    hapticService?.trigger("selection");
    onEditTurnsRequested?.();
  }

  function handleClose() {
    hapticService?.trigger("selection");
    onCollapse?.();
  }

  function handleRotationClick(direction: "cw" | "ccw") {
    // Allow rotation direction change for any numeric turns (including 0)
    // Only block for float ("fl") turns
    const turnValue = getCurrentTurnValue();
    if (turnValue === "fl") {
      return; // Float motions don't support rotation direction
    }
    hapticService?.trigger("selection");
    onRotationDirectionChanged?.(color, direction);
  }

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });
</script>

<div
  class="turn-panel"
  class:blue={color === "blue"}
  class:red={color === "red"}
  class:compact={layoutMode === "compact"}
  class:balanced={layoutMode === "balanced"}
  class:comfortable={layoutMode === "comfortable"}
  data-testid={`turn-panel-${color}`}
>
  <!-- Header with rotation buttons -->
  <div class="turn-header">
    <!-- Left rotation button (counter-clockwise) -->
    {#if shouldShowRotationButtons()}
      <button
        type="button"
        class="rotation-btn"
        class:active={getRotationDirection() === "ccw"}
        onclick={() => handleRotationClick("ccw")}
        aria-label="Set counter-clockwise rotation"
        aria-pressed={getRotationDirection() === "ccw"}
      >
        <i class="fas fa-undo"></i>
      </button>
    {:else}
      <div class="rotation-placeholder"></div>
    {/if}

    <!-- Center title -->
    <div class="turn-title">
      <span class="turn-label">{displayLabel()}</span>
      <span class="motion-badge">{getMotionType()}</span>
    </div>

    <!-- Right rotation button (clockwise) or close button -->
    {#if shouldShowRotationButtons()}
      <button
        type="button"
        class="rotation-btn"
        class:active={getRotationDirection() === "cw"}
        onclick={() => handleRotationClick("cw")}
        aria-label="Set clockwise rotation"
        aria-pressed={getRotationDirection() === "cw"}
      >
        <i class="fas fa-redo"></i>
      </button>
    {:else if showCloseButton}
      <button class="close-btn" onclick={handleClose} aria-label="Close panel">
        <i class="fas fa-times"></i>
      </button>
    {:else}
      <div class="rotation-placeholder"></div>
    {/if}
  </div>

  <!-- Main controls -->
  <div class="turn-controls">
    <button
      class="turn-btn decrement"
      onclick={handleTurnDecrement}
      disabled={!canDecrementTurn()}
      aria-label="Decrease turn amount"
    >
      <i class="fas fa-minus"></i>
    </button>

    <button
      class="turn-display"
      onclick={handleTurnLabelClick}
      aria-label="Select specific turn amount"
    >
      {getTurnValue()}
    </button>

    <button
      class="turn-btn increment"
      onclick={handleTurnIncrement}
      disabled={!canIncrementTurn()}
      aria-label="Increase turn amount"
    >
      <i class="fas fa-plus"></i>
    </button>
  </div>
</div>

<style>
  /* Base panel */
  .turn-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    overflow: hidden;

    /* Smooth height transition for expansion/collapse */
    max-height: 500px; /* Large enough to accommodate all content */
    transition:
      max-height var(--transition-normal, 0.3s cubic-bezier(0.4, 0, 0.2, 1)),
      opacity var(--transition-normal, 0.3s cubic-bezier(0.4, 0, 0.2, 1)),
      transform var(--transition-normal, 0.3s cubic-bezier(0.4, 0, 0.2, 1));

    /* Initial animation when first rendered */
    animation: expandIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Compact mode (Desktop) */
  .turn-panel.compact {
    gap: 8px;
    padding: 8px;
    border-width: 2px;
    border-radius: 8px;
  }

  /* Balanced mode (Tablet) */
  .turn-panel.balanced {
    gap: 10px;
    padding: 12px;
    border-width: 3px;
    border-radius: 10px;
  }

  /* Comfortable mode (Mobile) */
  .turn-panel.comfortable {
    gap: 12px;
    padding: 16px;
    border-width: 4px;
    border-radius: 12px;
  }

  /* Color variants */
  .turn-panel.blue {
    border-color: var(--prop-blue, #3b82f6);
    border-style: solid;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--prop-blue, #3b82f6) 5%, transparent) 0%,
      var(--theme-panel-bg, white) 100%
    );
  }

  .turn-panel.red {
    border-color: var(--prop-red, #ef4444);
    border-style: solid;
    background: linear-gradient(135deg, color-mix(in srgb, var(--prop-red, #ef4444) 5%, transparent) 0%, var(--theme-panel-bg, white) 100%);
  }

  @keyframes expandIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Header */
  .turn-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    border-bottom: 2px solid var(--theme-stroke, rgba(0, 0, 0, 0.1));
  }

  .turn-panel.compact .turn-header {
    padding-bottom: 6px;
  }

  .turn-panel.balanced .turn-header {
    padding-bottom: 8px;
  }

  .turn-panel.comfortable .turn-header {
    padding-bottom: 10px;
  }

  .turn-title {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    gap: 4px;
  }

  /* Placeholder keeps layout balanced when rotation buttons are hidden */
  .rotation-placeholder {
    width: 52px;
    height: 52px;
    flex-shrink: 0;
  }

  .turn-label {
    font-weight: 700;
  }

  .turn-panel.compact .turn-label {
    font-size: 14px;
  }

  .turn-panel.balanced .turn-label {
    font-size: 15px;
  }

  .turn-panel.comfortable .turn-label {
    font-size: 16px;
  }

  .turn-panel.blue .turn-label {
    color: var(--prop-blue, #3b82f6);
  }

  .turn-panel.red .turn-label {
    color: var(--prop-red, #ef4444);
  }

  .motion-badge {
    background: var(--theme-card-bg, rgba(0, 0, 0, 0.08));
    border-radius: 6px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--theme-text, #333);
  }

  .turn-panel.compact .motion-badge {
    padding: 2px 6px;
    font-size: 9px;
  }

  .turn-panel.balanced .motion-badge {
    padding: 2px 6px;
    font-size: 10px;
  }

  .turn-panel.comfortable .motion-badge {
    padding: 3px 8px;
    font-size: 11px;
  }

  .close-btn {
    border: none;
    border-radius: 50%;
    background: var(--theme-card-bg, rgba(0, 0, 0, 0.08));
    color: var(--theme-text-dim, #666);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .turn-panel.compact .close-btn {
    width: 52px;
    height: 52px;
    min-width: 52px;
    min-height: 52px;
    font-size: 14px;
  }

  .turn-panel.balanced .close-btn {
    width: 52px;
    height: 52px;
    min-width: 52px;
    min-height: 52px;
    font-size: 16px;
  }

  .turn-panel.comfortable .close-btn {
    width: 52px;
    height: 52px;
    min-width: 52px;
    min-height: 52px;
    font-size: 18px;
  }

  .close-btn:hover {
    background: var(--theme-card-hover-bg, rgba(0, 0, 0, 0.12));
    transform: scale(1.1);
  }

  .close-btn:active {
    transform: scale(0.95);
  }

  /* Main controls */
  .turn-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .turn-btn {
    border-radius: 50%;
    background: var(--theme-panel-bg, white);
    color: var(--theme-text, black);
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 2px 8px var(--theme-shadow, rgba(0, 0, 0, 0.1));
  }

  .turn-panel.compact .turn-btn {
    width: 52px;
    height: 52px;
    min-width: 52px;
    min-height: 52px;
    font-size: 16px;
    border-width: 2px;
  }

  .turn-panel.balanced .turn-btn {
    width: 52px;
    height: 52px;
    font-size: 18px;
    border-width: 3px;
  }

  .turn-panel.comfortable .turn-btn {
    width: 52px;
    height: 52px;
    font-size: 20px;
    border-width: 4px;
  }

  .turn-panel.blue .turn-btn {
    border-color: var(--prop-blue, #3b82f6);
    border-style: solid;
  }

  .turn-panel.red .turn-btn {
    border-color: var(--prop-red, #ef4444);
    border-style: solid;
  }

  .turn-btn:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 4px 12px var(--theme-shadow, rgba(0, 0, 0, 0.2));
  }

  .turn-btn:active:not(:disabled) {
    transform: scale(0.95);
    box-shadow: 0 1px 4px var(--theme-shadow, rgba(0, 0, 0, 0.1));
  }

  .turn-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .turn-display {
    flex: 1;
    background: var(--theme-panel-bg, white);
    color: var(--theme-text, black);
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px var(--theme-shadow, rgba(0, 0, 0, 0.1));
  }

  .turn-panel.compact .turn-display {
    min-width: 52px;
    height: 52px;
    font-size: 24px;
    border-width: 2px;
    border-radius: 8px;
  }

  .turn-panel.balanced .turn-display {
    min-width: 52px;
    height: 52px;
    font-size: 28px;
    border-width: 3px;
    border-radius: 10px;
  }

  .turn-panel.comfortable .turn-display {
    min-width: 64px;
    height: 64px;
    font-size: 32px;
    border-width: 4px;
    border-radius: 12px;
  }

  .turn-panel.blue .turn-display {
    border-color: var(--prop-blue, #3b82f6);
    border-style: solid;
  }

  .turn-panel.red .turn-display {
    border-color: var(--prop-red, #ef4444);
    border-style: solid;
  }

  .turn-display:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px var(--theme-shadow, rgba(0, 0, 0, 0.2));
  }

  .turn-display:active {
    transform: scale(0.98);
    box-shadow: 0 1px 4px var(--theme-shadow, rgba(0, 0, 0, 0.1));
  }

  /* Rotation direction toggle buttons - in header */
  .rotation-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 2px solid var(--theme-stroke, rgba(0, 0, 0, 0.2));
    background: var(--theme-panel-bg, rgba(255, 255, 255, 0.95));
    color: var(--theme-text-dim, #666);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 16px;
    /* Minimum 52px touch target for accessibility */
    width: 52px;
    height: 52px;
    min-width: 52px;
    min-height: 52px;
    flex-shrink: 0;
    box-shadow: 0 2px 6px var(--theme-shadow, rgba(0, 0, 0, 0.1));
  }

  .rotation-btn:hover {
    background: var(--theme-panel-elevated-bg, rgba(255, 255, 255, 1));
    transform: scale(1.08);
    box-shadow: 0 4px 12px var(--theme-shadow, rgba(0, 0, 0, 0.2));
  }

  .rotation-btn:active {
    transform: scale(0.95);
  }

  /* Active state - matches panel color */
  .turn-panel.blue .rotation-btn.active {
    background: var(--prop-blue, #3b82f6);
    border-color: var(--prop-blue, #3b82f6);
    color: var(--theme-text, white);
    box-shadow: 0 3px 10px color-mix(in srgb, var(--prop-blue, #3b82f6) 50%, transparent);
  }

  .turn-panel.red .rotation-btn.active {
    background: var(--prop-red, #ef4444);
    border-color: var(--prop-red, #ef4444);
    color: var(--theme-text, white);
    box-shadow: 0 3px 10px color-mix(in srgb, var(--prop-red, #ef4444) 50%, transparent);
  }
</style>
