<!--
  TurnsEditMode.svelte

  The "Turns" tab content - allows editing turns and rotation for a selected beat.
  Uses PropControlPair for consistent blue/red card layout.
-->
<script lang="ts">
  import {
    MotionColor,
    RotationDirection,
  } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
  import PropControlPair from "./PropControlPair.svelte";
  import PropTurnsControl from "./PropTurnsControl.svelte";

  interface Props {
    hasSelection: boolean;
    blueTurns: number | "fl";
    redTurns: number | "fl";
    blueRotation: RotationDirection;
    redRotation: RotationDirection;
    showBlueRotation: boolean;
    showRedRotation: boolean;
    stacked?: boolean;
    onTurnsChange: (color: MotionColor, delta: number) => void;
    onRotationChange: (
      color: MotionColor,
      direction: RotationDirection
    ) => void;
  }

  let {
    hasSelection,
    blueTurns,
    redTurns,
    blueRotation,
    redRotation,
    showBlueRotation,
    showRedRotation,
    stacked = false,
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
  <PropControlPair {stacked}>
    {#snippet blueContent()}
      <PropTurnsControl
        color="blue"
        turns={blueTurns}
        rotationDirection={blueRotation}
        showRotation={showBlueRotation}
        onTurnsChange={(delta) => onTurnsChange(MotionColor.BLUE, delta)}
        onRotationChange={(dir) => onRotationChange(MotionColor.BLUE, dir)}
      />
    {/snippet}
    {#snippet redContent()}
      <PropTurnsControl
        color="red"
        turns={redTurns}
        rotationDirection={redRotation}
        showRotation={showRedRotation}
        onTurnsChange={(delta) => onTurnsChange(MotionColor.RED, delta)}
        onRotationChange={(dir) => onRotationChange(MotionColor.RED, dir)}
      />
    {/snippet}
  </PropControlPair>
{/if}

<style>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 32px 16px;
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
</style>
