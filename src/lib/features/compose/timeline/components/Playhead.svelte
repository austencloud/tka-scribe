<script lang="ts">
  /**
   * Playhead - Current position indicator on the timeline
   *
   * Vertical line showing where playback is.
   * Can be dragged to seek.
   */

  import type { TimeSeconds } from "../domain/timeline-types";
  import { getTimelineState } from "../state/timeline-state.svelte";
  import { timeToPixels, pixelsToTime } from "../domain/timeline-types";

  interface Props {
    position: TimeSeconds;
    pixelsPerSecond: number;
    height: number;
  }

  let { position, pixelsPerSecond, height }: Props = $props();

  function getState() {
    return getTimelineState();
  }

  // Local reactive state
  let left = $state(0);
  let isDragging = $state(false);

  // Sync from props
  $effect(() => {
    left = timeToPixels(position, pixelsPerSecond);
  });

  function handleMouseDown(e: MouseEvent) {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    isDragging = true;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const rect = (e.target as HTMLElement).parentElement?.getBoundingClientRect();
      if (!rect) return;
      const x = moveEvent.clientX - rect.left;
      const time = pixelsToTime(x, pixelsPerSecond);
      getState().setPlayheadPosition(time);
    };

    const handleMouseUp = () => {
      isDragging = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }
</script>

<div
  class="playhead"
  class:dragging={isDragging}
  style="left: {left}px; height: {height}px"
  onmousedown={handleMouseDown}
  role="slider"
  aria-label="Playhead position"
  aria-valuemin={0}
  aria-valuenow={position}
  tabindex="0"
>
  <!-- Head (triangle at top) -->
  <div class="playhead-head">
    <svg viewBox="0 0 12 10" width="12" height="10">
      <polygon points="0,0 12,0 6,10" fill="currentColor" />
    </svg>
  </div>

  <!-- Line -->
  <div class="playhead-line"></div>
</div>

<style>
  .playhead {
    position: absolute;
    top: 0;
    width: 1px;
    z-index: 100;
    cursor: ew-resize;
    pointer-events: auto;
  }

  .playhead-head {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    color: #ff4444;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
    transition: transform 0.1s ease;
  }

  .playhead:hover .playhead-head,
  .playhead.dragging .playhead-head {
    transform: translateX(-50%) scale(1.2);
  }

  .playhead-line {
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 100%;
    background: #ff4444;
    box-shadow: 0 0 4px rgba(255, 68, 68, 0.5);
  }

  .playhead.dragging .playhead-line {
    width: 2px;
    left: -0.5px;
  }
</style>
