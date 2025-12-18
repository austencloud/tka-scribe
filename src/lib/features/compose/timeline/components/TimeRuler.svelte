<script lang="ts">
  /**
   * TimeRuler - Time scale header showing seconds/frames
   *
   * Displays time markers with major/minor ticks based on zoom level.
   * Adapts tick density to current zoom.
   */

  import type { TimeSeconds } from "../domain/timeline-types";

  interface Props {
    duration: TimeSeconds;
    pixelsPerSecond: number;
  }

  let { duration, pixelsPerSecond }: Props = $props();

  // Calculate appropriate tick interval based on zoom
  const tickInterval = $derived.by(() => {
    if (pixelsPerSecond > 200) return 0.5; // Every 0.5s at high zoom
    if (pixelsPerSecond > 100) return 1; // Every 1s
    if (pixelsPerSecond > 50) return 2; // Every 2s
    if (pixelsPerSecond > 25) return 5; // Every 5s
    if (pixelsPerSecond > 10) return 10; // Every 10s
    return 30; // Every 30s at low zoom
  });

  // Major tick is every 5th minor tick
  const majorInterval = $derived(tickInterval * 5);

  // Generate tick marks
  const ticks = $derived.by(() => {
    const result: Array<{ time: number; major: boolean; x: number }> = [];
    const interval = tickInterval;
    const major = majorInterval;

    for (let t = 0; t <= duration; t += interval) {
      result.push({
        time: t,
        major: t % major === 0,
        x: t * pixelsPerSecond,
      });
    }

    return result;
  });

  // Format time as MM:SS or MM:SS.ms depending on zoom
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (pixelsPerSecond > 100) {
      // Show milliseconds at high zoom
      return `${mins}:${secs.toFixed(1).padStart(4, "0")}`;
    }
    return `${mins}:${Math.floor(secs).toString().padStart(2, "0")}`;
  }
</script>

<div class="time-ruler">
  {#each ticks as tick (tick.time)}
    <div
      class="tick"
      class:major={tick.major}
      style="left: {tick.x}px"
    >
      <div class="tick-line"></div>
      {#if tick.major}
        <span class="tick-label">{formatTime(tick.time)}</span>
      {/if}
    </div>
  {/each}
</div>

<style>
  .time-ruler {
    position: relative;
    height: 100%;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.02));
  }

  .tick {
    position: absolute;
    top: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .tick-line {
    width: 1px;
    background: var(--theme-stroke, rgba(255, 255, 255, 0.15));
  }

  .tick:not(.major) .tick-line {
    height: 8px;
    margin-top: auto;
  }

  .tick.major .tick-line {
    height: 12px;
    margin-top: auto;
    background: var(--theme-stroke, rgba(255, 255, 255, 0.3));
  }

  .tick-label {
    position: absolute;
    top: 4px;
    font-size: 10px;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
    white-space: nowrap;
    transform: translateX(-50%);
    font-variant-numeric: tabular-nums;
  }
</style>
