<!--
  PropTurnsControl.svelte

  Reusable control for adjusting turns and rotation direction of a single prop.
  Used for both blue and red props in TurnsEditMode.
-->
<script lang="ts">
  import { RotationDirection } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";

  interface Props {
    color: "blue" | "red";
    turns: number | "fl";
    rotationDirection: RotationDirection;
    showRotation: boolean;
    onTurnsChange: (delta: number) => void;
    onRotationChange: (direction: RotationDirection) => void;
  }

  let { color, turns, rotationDirection, showRotation, onTurnsChange, onRotationChange }: Props = $props();

  const displayTurns = $derived(turns === "fl" ? "fl" : turns);

  // Handle turns increment/decrement
  function handleTurnsChange(delta: number) {
    onTurnsChange(delta);
  }

  // Handle rotation direction change with proper validation
  // Only allow rotation when turns is numeric (not "fl" - float motions don't have rotation)
  function handleRotationClick(direction: RotationDirection) {
    // Same validation logic as TurnPanel - prevent rotation for float turns
    if (turns === "fl") {
      return; // Float motions don't support rotation direction
    }
    onRotationChange(direction);
  }
</script>

<div class="prop-controls" class:blue={color === "blue"} class:red={color === "red"}>
  <span class="prop-label">{color === "blue" ? "Blue" : "Red"}</span>

  <div class="turns-row">
    <button class="ctrl-btn" aria-label="Decrease {color} turns" onclick={() => handleTurnsChange(-0.5)}>
      <i class="fas fa-minus"></i>
    </button>
    <span class="turns-value">{displayTurns}</span>
    <button class="ctrl-btn" aria-label="Increase {color} turns" onclick={() => handleTurnsChange(0.5)}>
      <i class="fas fa-plus"></i>
    </button>
  </div>

  <div class="rotation-row">
    <button
      class="rot-btn"
      class:active={showRotation && rotationDirection === RotationDirection.CLOCKWISE}
      aria-label="Rotate {color} clockwise"
      onclick={() => handleRotationClick(RotationDirection.CLOCKWISE)}
      disabled={!showRotation}
    >
      <i class="fas fa-rotate-right"></i>
    </button>
    <button
      class="rot-btn"
      class:active={showRotation && rotationDirection === RotationDirection.COUNTER_CLOCKWISE}
      aria-label="Rotate {color} counter clockwise"
      onclick={() => handleRotationClick(RotationDirection.COUNTER_CLOCKWISE)}
      disabled={!showRotation}
    >
      <i class="fas fa-rotate-left"></i>
    </button>
  </div>
</div>

<style>
  /* ============================================================================
     PROP CONTROLS - Glass-morphism colored panels matching design system
     Using same gradient pattern as transform buttons (Mirror/Rotate/Swap/etc)
     ============================================================================ */

  .prop-controls {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 14px;
    border-radius: 12px;
    border: 1px solid;
    transition: all 0.15s ease;
  }

  /* Blue - Indigo glass pane */
  .prop-controls.blue {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%);
    border-color: rgba(59, 130, 246, 0.35);
  }

  .prop-controls.blue:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%);
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
  }

  /* Red - Rose glass pane */
  .prop-controls.red {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%);
    border-color: rgba(239, 68, 68, 0.35);
  }

  .prop-controls.red:hover {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%);
    border-color: rgba(239, 68, 68, 0.5);
    box-shadow: 0 4px 16px rgba(239, 68, 68, 0.2);
  }

  .prop-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    letter-spacing: 0.75px;
  }

  .turns-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  /* Control buttons - match color theme */
  .prop-controls.blue .ctrl-btn {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.4);
    color: #3b82f6;
  }

  .prop-controls.blue .ctrl-btn:hover {
    background: rgba(59, 130, 246, 0.3);
    border-color: rgba(59, 130, 246, 0.6);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
  }

  .prop-controls.red .ctrl-btn {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.4);
    color: #ef4444;
  }

  .prop-controls.red .ctrl-btn:hover {
    background: rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.6);
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
  }

  .ctrl-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: 10px;
    border: 1px solid;
    cursor: pointer;
    font-size: 1.1rem;
    transition: all 0.15s ease;
  }

  .ctrl-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .turns-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    min-width: 52px;
    text-align: center;
  }

  .rotation-row {
    display: flex;
    gap: 8px;
  }

  /* Rotation buttons - match color theme */
  .prop-controls.blue .rot-btn {
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.3);
    color: rgba(59, 130, 246, 0.7);
  }

  .prop-controls.blue .rot-btn:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.25);
    border-color: rgba(59, 130, 246, 0.5);
    color: #3b82f6;
  }

  .prop-controls.blue .rot-btn.active {
    background: rgba(59, 130, 246, 0.3);
    border-color: rgba(59, 130, 246, 0.6);
    color: #3b82f6;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
  }

  .prop-controls.red .rot-btn {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.3);
    color: rgba(239, 68, 68, 0.7);
  }

  .prop-controls.red .rot-btn:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.25);
    border-color: rgba(239, 68, 68, 0.5);
    color: #ef4444;
  }

  .prop-controls.red .rot-btn.active {
    background: rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.6);
    color: #ef4444;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
  }

  .rot-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: 10px;
    border: 1px solid;
    cursor: pointer;
    font-size: 1.1rem;
    transition: all 0.15s ease;
  }

  .rot-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    .ctrl-btn,
    .rot-btn,
    .prop-controls {
      transition: none;
    }
    .ctrl-btn:active:not(:disabled) {
      transform: none;
    }
  }
</style>
