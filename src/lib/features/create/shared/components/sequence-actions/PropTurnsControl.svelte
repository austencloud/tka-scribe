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
</script>

<div class="prop-controls" class:blue={color === "blue"} class:red={color === "red"}>
  <span class="prop-label">{color === "blue" ? "Blue" : "Red"}</span>

  <div class="turns-row">
    <button class="ctrl-btn" aria-label="Decrease {color} turns" onclick={() => onTurnsChange(-0.5)}>
      <i class="fas fa-minus"></i>
    </button>
    <span class="turns-value">{displayTurns}</span>
    <button class="ctrl-btn" aria-label="Increase {color} turns" onclick={() => onTurnsChange(0.5)}>
      <i class="fas fa-plus"></i>
    </button>
  </div>

  <div class="rotation-row">
    <button
      class="rot-btn"
      class:active={showRotation && rotationDirection === RotationDirection.CLOCKWISE}
      aria-label="Rotate {color} clockwise"
      onclick={() => onRotationChange(RotationDirection.CLOCKWISE)}
      disabled={!showRotation}
    >
      <i class="fas fa-rotate-right"></i>
    </button>
    <button
      class="rot-btn"
      class:active={showRotation && rotationDirection === RotationDirection.COUNTER_CLOCKWISE}
      aria-label="Rotate {color} counter clockwise"
      onclick={() => onRotationChange(RotationDirection.COUNTER_CLOCKWISE)}
      disabled={!showRotation}
    >
      <i class="fas fa-rotate-left"></i>
    </button>
  </div>
</div>

<style>
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
    width: 52px;
    height: 52px;
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
    min-width: 52px;
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
    width: 52px;
    height: 52px;
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

  @media (prefers-reduced-motion: reduce) {
    .ctrl-btn,
    .rot-btn {
      transition: none;
    }
    .ctrl-btn:active {
      transform: none;
    }
  }
</style>
