<!--
  StartPositionEditMode.svelte

  Orientation editing for start positions. Shows dual orientation pickers
  for blue and red props instead of turns controls.
  Styled to match PropTurnsControl for visual consistency.
-->
<script lang="ts">
  import type { BeatData } from "../../domain/models/BeatData";
  import { MotionColor } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";

  interface Props {
    startPositionData: BeatData | null;
    onOrientationChange: (color: MotionColor, orientation: string) => void;
  }

  let { startPositionData, onOrientationChange }: Props = $props();

  const orientationOptions = [
    { value: "in", label: "In", icon: "fa-arrow-down" },
    { value: "out", label: "Out", icon: "fa-arrow-up" },
    { value: "clock", label: "CW", icon: "fa-rotate-right" },
    { value: "counter", label: "CCW", icon: "fa-rotate-left" },
  ] as const;

  // Get current orientations from the start position data
  const blueOrientation = $derived(
    startPositionData?.motions?.[MotionColor.BLUE]?.startOrientation ?? "in"
  );
  const redOrientation = $derived(
    startPositionData?.motions?.[MotionColor.RED]?.startOrientation ?? "in"
  );

  function handleOrientationClick(e: MouseEvent, color: MotionColor, orientation: string) {
    e.stopPropagation();
    onOrientationChange(color, orientation);
  }
</script>

{#if !startPositionData}
  <div class="empty-state">
    <i class="fas fa-compass"></i>
    <p>No start position selected</p>
  </div>
{:else}
  <div class="orientation-controls">
    <!-- Blue prop controls -->
    <div class="prop-controls blue">
      <span class="prop-label">Blue</span>
      <div class="orientation-grid">
        {#each orientationOptions as opt}
          <button
            class="orientation-btn"
            class:active={blueOrientation === opt.value}
            onclick={(e) => handleOrientationClick(e, MotionColor.BLUE, opt.value)}
            aria-label="Set blue orientation to {opt.label}"
          >
            <i class="fas {opt.icon}"></i>
            <span class="btn-label">{opt.label}</span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Red prop controls -->
    <div class="prop-controls red">
      <span class="prop-label">Red</span>
      <div class="orientation-grid">
        {#each orientationOptions as opt}
          <button
            class="orientation-btn"
            class:active={redOrientation === opt.value}
            onclick={(e) => handleOrientationClick(e, MotionColor.RED, opt.value)}
            aria-label="Set red orientation to {opt.label}"
          >
            <i class="fas {opt.icon}"></i>
            <span class="btn-label">{opt.label}</span>
          </button>
        {/each}
      </div>
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

  .orientation-controls {
    display: flex;
    gap: 12px;
    height: 100%;
  }

  /* ============================================================================
     PROP CONTROLS - Glass-morphism colored panels matching PropTurnsControl
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

  .orientation-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    width: 100%;
  }

  /* Orientation buttons - match color theme */
  .orientation-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 10px 8px;
    border-radius: 10px;
    border: 1px solid;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .orientation-btn i {
    font-size: 1rem;
  }

  .btn-label {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .orientation-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  /* Blue button states */
  .prop-controls.blue .orientation-btn {
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.3);
    color: rgba(59, 130, 246, 0.7);
  }

  .prop-controls.blue .orientation-btn:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.25);
    border-color: rgba(59, 130, 246, 0.5);
    color: #3b82f6;
  }

  .prop-controls.blue .orientation-btn.active {
    background: rgba(59, 130, 246, 0.3);
    border-color: rgba(59, 130, 246, 0.6);
    color: #3b82f6;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
  }

  /* Red button states */
  .prop-controls.red .orientation-btn {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.3);
    color: rgba(239, 68, 68, 0.7);
  }

  .prop-controls.red .orientation-btn:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.25);
    border-color: rgba(239, 68, 68, 0.5);
    color: #ef4444;
  }

  .prop-controls.red .orientation-btn.active {
    background: rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.6);
    color: #ef4444;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
  }

  @media (prefers-reduced-motion: reduce) {
    .orientation-btn,
    .prop-controls {
      transition: none;
    }
    .orientation-btn:active:not(:disabled) {
      transform: none;
    }
  }
</style>
