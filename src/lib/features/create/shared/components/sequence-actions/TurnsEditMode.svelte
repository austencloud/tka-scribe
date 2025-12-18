<!--
  TurnsEditMode.svelte

  The "Turns" tab content - allows editing turns and rotation for a selected beat.
-->
<script lang="ts">
  import { MotionColor, RotationDirection } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
  import PropTurnsControl from "./PropTurnsControl.svelte";

  interface Props {
    hasSelection: boolean;
    blueTurns: number | "fl";
    redTurns: number | "fl";
    blueRotation: RotationDirection;
    redRotation: RotationDirection;
    showBlueRotation: boolean;
    showRedRotation: boolean;
    onTurnsChange: (color: MotionColor, delta: number) => void;
    onRotationChange: (color: MotionColor, direction: RotationDirection) => void;
  }

  let {
    hasSelection,
    blueTurns,
    redTurns,
    blueRotation,
    redRotation,
    showBlueRotation,
    showRedRotation,
    onTurnsChange,
    onRotationChange,
  }: Props = $props();

</script>

{#if !hasSelection}
  <div class="empty-state">
    <i class="fas fa-hand-pointer"></i>
    <p>Tap a beat in the sequence to edit its turns</p>
  </div>
{:else}
  <div class="beat-controls">
    <div class="prop-row">
      <PropTurnsControl
        color="blue"
        turns={blueTurns}
        rotationDirection={blueRotation}
        showRotation={showBlueRotation}
        onTurnsChange={(delta) => onTurnsChange(MotionColor.BLUE, delta)}
        onRotationChange={(dir) => onRotationChange(MotionColor.BLUE, dir)}
      />
      <PropTurnsControl
        color="red"
        turns={redTurns}
        rotationDirection={redRotation}
        showRotation={showRedRotation}
        onTurnsChange={(delta) => onTurnsChange(MotionColor.RED, delta)}
        onRotationChange={(dir) => onRotationChange(MotionColor.RED, dir)}
      />
    </div>
  </div>
{/if}

<style>
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

  .beat-controls {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 16px;
  }

  .prop-row {
    display: flex;
    gap: 12px;
  }
</style>
