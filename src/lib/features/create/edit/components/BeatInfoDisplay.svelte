<!--
BeatInfoDisplay.svelte - Display beat motion information (orientations, rotation direction, etc.)

Shows:
- Start and end orientations for each color
- Motion type
- Rotation direction
- Turn amount

Primarily for desktop where we have extra space to show this information.
-->
<script lang="ts">
  import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
  import type { MotionData } from "$lib/shared/pictograph/shared/domain/models/MotionData";
  import { RotationDirection } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";

  // Props
  const { currentBeatData } = $props<{
    currentBeatData: BeatData | null;
  }>();

  // Helper to get motion by color
  function getMotion(color: "blue" | "red"): MotionData | null {
    if (!currentBeatData?.motions) return null;
    return currentBeatData.motions[color] || null;
  }

  // Display helpers
  function formatOrientation(orientation: string | undefined): string {
    if (!orientation) return "—";
    return orientation.charAt(0).toUpperCase() + orientation.slice(1);
  }

  function formatRotationDirection(
    direction: RotationDirection | undefined
  ): string {
    if (!direction || direction === RotationDirection.NO_ROTATION) return "—";
    return direction === RotationDirection.CLOCKWISE
      ? "Clockwise"
      : "Counter-Clockwise";
  }

  function formatMotionType(motionType: string | undefined): string {
    if (!motionType) return "Static";
    return motionType.charAt(0).toUpperCase() + motionType.slice(1);
  }

  function formatTurns(turns: number | "fl" | undefined): string {
    if (turns === undefined) return "0";
    if (turns === "fl") return "Float";
    return turns.toString();
  }

  // Derived motion data
  const blueMotion = $derived(getMotion("blue"));
  const redMotion = $derived(getMotion("red"));
</script>

<div class="beat-info-display" data-testid="beat-info-display">
  <div class="info-header">
    <h3>Beat Information</h3>
  </div>

  <div class="info-grid">
    <!-- Blue/Left Motion Info -->
    <div class="motion-section blue-section">
      <div class="section-header">
        <i class="fas fa-circle" style="color: #3b82f6;" aria-hidden="true"></i>
        <span>Left Hand</span>
      </div>

      <div class="info-row">
        <span class="info-label">Motion:</span>
        <span class="info-value"
          >{formatMotionType(blueMotion?.motionType)}</span
        >
      </div>

      <div class="info-row">
        <span class="info-label">Start:</span>
        <span class="info-value"
          >{formatOrientation(blueMotion?.startOrientation)}</span
        >
      </div>

      <div class="info-row">
        <span class="info-label">End:</span>
        <span class="info-value"
          >{formatOrientation(blueMotion?.endOrientation)}</span
        >
      </div>

      <div class="info-row">
        <span class="info-label">Turns:</span>
        <span class="info-value">{formatTurns(blueMotion?.turns)}</span>
      </div>

      <div class="info-row">
        <span class="info-label">Rotation:</span>
        <span class="info-value"
          >{formatRotationDirection(blueMotion?.rotationDirection)}</span
        >
      </div>
    </div>

    <!-- Red/Right Motion Info -->
    <div class="motion-section red-section">
      <div class="section-header">
        <i class="fas fa-circle" style="color: #ef4444;" aria-hidden="true"></i>
        <span>Right Hand</span>
      </div>

      <div class="info-row">
        <span class="info-label">Motion:</span>
        <span class="info-value">{formatMotionType(redMotion?.motionType)}</span
        >
      </div>

      <div class="info-row">
        <span class="info-label">Start:</span>
        <span class="info-value"
          >{formatOrientation(redMotion?.startOrientation)}</span
        >
      </div>

      <div class="info-row">
        <span class="info-label">End:</span>
        <span class="info-value"
          >{formatOrientation(redMotion?.endOrientation)}</span
        >
      </div>

      <div class="info-row">
        <span class="info-label">Turns:</span>
        <span class="info-value">{formatTurns(redMotion?.turns)}</span>
      </div>

      <div class="info-row">
        <span class="info-label">Rotation:</span>
        <span class="info-value"
          >{formatRotationDirection(redMotion?.rotationDirection)}</span
        >
      </div>
    </div>
  </div>
</div>

<style>
  .beat-info-display {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .info-header {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 8px;
  }

  .info-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .motion-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.85);
    margin-bottom: 4px;
  }

  .section-header i {
    font-size: 12px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    padding: 4px 0;
  }

  .info-label {
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
  }

  .info-value {
    color: rgba(255, 255, 255, 0.9);
    font-weight: 600;
    font-family:
      "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas,
      "Courier New", monospace;
  }

  /* Compact variant for smaller spaces */
  @container (max-width: 600px) {
    .info-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }
  }

  /* Single column stack for very narrow */
  @container (max-width: 400px) {
    .beat-info-display {
      padding: 12px;
      gap: 8px;
    }

    .info-row {
      font-size: 12px;
    }
  }
</style>
