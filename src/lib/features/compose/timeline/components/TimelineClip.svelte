<script lang="ts">
  /**
   * TimelineClip - A single clip on the timeline
   *
   * Visual representation of a sequence placed in time.
   * Supports: selection, move, trim, resize operations.
   *
   * Decomposed from 627 lines to ~200 lines + 3 interaction utilities + 1 overlay component.
   */

  import type { TimelineClip as ClipType } from "../domain/timeline-types";
  import { getTimelineState } from "../state/timeline-state.svelte";
  import { timeToPixels } from "../domain/timeline-types";
  import { createClipMove } from "./clip-interactions/createClipMove";
  import { createClipTrim } from "./clip-interactions/createClipTrim";
  import { createClipResize } from "./clip-interactions/createClipResize";
  import ClipStatusOverlays from "./ClipStatusOverlays.svelte";

  interface Props {
    clip: ClipType;
    pixelsPerSecond: number;
    selected?: boolean;
  }

  let { clip, pixelsPerSecond, selected = false }: Props = $props();

  function getState() {
    return getTimelineState();
  }

  // Drag mode state
  let dragMode = $state<"move" | "trim-left" | "trim-right" | "resize" | null>(null);

  // Computed dimensions
  const left = $derived(timeToPixels(clip.startTime, pixelsPerSecond));
  const width = $derived(Math.max(20, timeToPixels(clip.duration, pixelsPerSecond)));

  // Display info
  const displayName = $derived(clip.label || clip.sequence.name || "Untitled");
  const speedLabel = $derived(clip.playbackRate !== 1 ? `${clip.playbackRate.toFixed(1)}x` : null);
  const trimLabel = $derived(
    clip.inPoint > 0 || clip.outPoint < 1
      ? `${Math.round(clip.inPoint * 100)}%-${Math.round(clip.outPoint * 100)}%`
      : null
  );

  // Visual states
  const isDragging = $derived(dragMode !== null);
  const isMoveDragging = $derived(dragMode === "move");
  const isTrimming = $derived(dragMode === "trim-left" || dragMode === "trim-right");
  const isResizing = $derived(dragMode === "resize");

  // Initialize interaction handlers
  const { handleMoveStart } = createClipMove(
    () => clip,
    () => pixelsPerSecond,
    {
      onDragStart: () => (dragMode = "move"),
      onDragEnd: () => (dragMode = null),
    }
  );

  // Separate callbacks for left and right trim to set correct mode
  const trimLeftCallbacks = {
    onDragStart: () => (dragMode = "trim-left"),
    onDragEnd: () => (dragMode = null),
  };
  const trimRightCallbacks = {
    onDragStart: () => (dragMode = "trim-right"),
    onDragEnd: () => (dragMode = null),
  };
  const { handleTrimLeftStart } = createClipTrim(() => clip, () => width, trimLeftCallbacks);
  const { handleTrimRightStart } = createClipTrim(() => clip, () => width, trimRightCallbacks);

  const { handleResizeStart } = createClipResize(
    () => clip,
    () => pixelsPerSecond,
    {
      onDragStart: () => (dragMode = "resize"),
      onDragEnd: () => (dragMode = null),
    }
  );

  // Event handlers
  function handleClick(e: MouseEvent) {
    e.stopPropagation();
    if (!isDragging) {
      getState().selectClip(clip.id, e.shiftKey || e.ctrlKey || e.metaKey);
    }
  }

  function handleDoubleClick(e: MouseEvent) {
    e.stopPropagation();
    getState().openClipInspector(clip.id);
  }

  function handleContextMenu(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    getState().selectClip(clip.id);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!selected) return;

    switch (e.key) {
      case "Delete":
      case "Backspace":
        e.preventDefault();
        getState().removeClip(clip.id);
        break;
      case "d":
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          getState().duplicateClip(clip.id);
        }
        break;
      case "m":
        e.preventDefault();
        getState().updateClip(clip.id, { muted: !clip.muted });
        break;
      case "l":
        e.preventDefault();
        getState().updateClip(clip.id, { locked: !clip.locked });
        break;
    }
  }
</script>

<div
  class="timeline-clip"
  class:selected
  class:muted={clip.muted}
  class:locked={clip.locked}
  class:looping={clip.loop}
  class:dragging={isDragging}
  class:move-dragging={isMoveDragging}
  class:trimming={isTrimming}
  class:resizing={isResizing}
  style="left: {left}px; width: {width}px; --clip-color: {clip.color};"
  onclick={handleClick}
  ondblclick={handleDoubleClick}
  oncontextmenu={handleContextMenu}
  onkeydown={handleKeyDown}
  role="listitem"
  aria-label="{displayName} clip"
  aria-selected={selected}
  tabindex="0"
>
  <!-- Trim handle: left (in-point) -->
  <div
    class="trim-handle left"
    onmousedown={handleTrimLeftStart}
    role="slider"
    aria-label="Trim start"
    title="Drag to trim start"
  >
    <div class="handle-grip"></div>
  </div>

  <!-- Main clip body -->
  <div class="clip-body" onmousedown={handleMoveStart}>
    <div class="clip-preview">
      {#if clip.sequence.thumbnails?.[0]}
        <img src={clip.sequence.thumbnails[0]} alt="" draggable="false" />
      {:else}
        <div class="preview-pattern"></div>
      {/if}

      {#if clip.inPoint > 0}
        <div class="trim-indicator left" style="width: {clip.inPoint * 100}%"></div>
      {/if}
      {#if clip.outPoint < 1}
        <div class="trim-indicator right" style="width: {(1 - clip.outPoint) * 100}%"></div>
      {/if}
    </div>

    <div class="clip-info">
      <span class="clip-name">{displayName}</span>
      <div class="clip-badges">
        {#if speedLabel}<span class="badge speed">{speedLabel}</span>{/if}
        {#if trimLabel}<span class="badge trim">{trimLabel}</span>{/if}
        {#if clip.loop}<span class="badge loop" title="Looping"><i class="fa-solid fa-repeat"></i></span>{/if}
      </div>
    </div>
  </div>

  <!-- Trim handle: right (out-point) -->
  <div
    class="trim-handle right"
    onmousedown={handleTrimRightStart}
    role="slider"
    aria-label="Trim end"
    title="Drag to trim end"
  >
    <div class="handle-grip"></div>
  </div>

  <!-- Resize handle -->
  <div
    class="resize-handle right"
    onmousedown={handleResizeStart}
    role="slider"
    aria-label="Resize clip"
    title="Drag to resize"
  >
    <div class="resize-grip"></div>
  </div>

  <ClipStatusOverlays muted={clip.muted} locked={clip.locked} />
</div>

<style>
  .timeline-clip {
    position: absolute;
    top: 4px;
    bottom: 4px;
    min-width: 20px;
    background: var(--clip-color, #4a9eff);
    border-radius: 4px;
    cursor: grab;
    display: flex;
    overflow: hidden;
    transition: box-shadow 0.15s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    user-select: none;
  }

  .timeline-clip:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  }

  .timeline-clip.selected {
    box-shadow: 0 0 0 2px white, 0 2px 8px rgba(0, 0, 0, 0.4);
  }

  .timeline-clip.muted {
    opacity: 0.5;
  }

  .timeline-clip.locked {
    cursor: not-allowed;
  }

  .timeline-clip.dragging {
    z-index: 100;
  }

  .timeline-clip.move-dragging {
    cursor: grabbing;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
    transform: scale(1.02);
  }

  .timeline-clip.trimming {
    box-shadow: 0 0 0 2px #ffd43b, 0 2px 8px rgba(0, 0, 0, 0.4);
  }

  .timeline-clip.resizing {
    box-shadow: 0 0 0 2px #51cf66, 0 2px 8px rgba(0, 0, 0, 0.4);
  }

  .clip-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    position: relative;
    cursor: grab;
  }

  .clip-body:active {
    cursor: grabbing;
  }

  .clip-preview {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .clip-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.3;
    pointer-events: none;
  }

  .preview-pattern {
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.1) 0px,
      rgba(255, 255, 255, 0.1) 2px,
      transparent 2px,
      transparent 8px
    );
  }

  .trim-indicator {
    position: absolute;
    top: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      45deg,
      rgba(0, 0, 0, 0.3) 0px,
      rgba(0, 0, 0, 0.3) 2px,
      transparent 2px,
      transparent 4px
    );
  }

  .trim-indicator.left {
    left: 0;
  }

  .trim-indicator.right {
    right: 0;
  }

  .clip-info {
    position: relative;
    z-index: 1;
    padding: 4px 8px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }

  .clip-name {
    font-size: var(--font-size-compact, 12px);
    font-weight: 500;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .clip-badges {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .badge {
    font-size: 9px;
    padding: 1px 4px;
    border-radius: 2px;
    background: rgba(0, 0, 0, 0.4);
    color: rgba(255, 255, 255, 0.9);
    white-space: nowrap;
  }

  .badge.speed {
    background: rgba(81, 207, 102, 0.3);
    color: #51cf66;
  }

  .badge.trim {
    background: rgba(255, 212, 59, 0.3);
    color: #ffd43b;
  }

  .badge.loop {
    background: rgba(74, 158, 255, 0.3);
    color: #4a9eff;
  }

  .trim-handle {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 12px;
    cursor: ew-resize;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.15s ease, background 0.15s ease;
    z-index: 10;
  }

  .timeline-clip:hover .trim-handle,
  .timeline-clip.selected .trim-handle,
  .timeline-clip.trimming .trim-handle {
    opacity: 1;
  }

  .trim-handle.left {
    left: 0;
    background: linear-gradient(90deg, rgba(255, 212, 59, 0.6), transparent);
    border-radius: 4px 0 0 4px;
  }

  .trim-handle.right {
    right: 12px;
    background: linear-gradient(-90deg, rgba(255, 212, 59, 0.6), transparent);
  }

  .trim-handle:hover {
    background: rgba(255, 212, 59, 0.4);
  }

  .handle-grip {
    width: 2px;
    height: 24px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 1px;
  }

  .resize-handle {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 12px;
    cursor: col-resize;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.15s ease;
    z-index: 11;
  }

  .resize-handle.right {
    right: 0;
    background: linear-gradient(-90deg, rgba(81, 207, 102, 0.6), transparent);
    border-radius: 0 4px 4px 0;
  }

  .timeline-clip:hover .resize-handle,
  .timeline-clip.selected .resize-handle,
  .timeline-clip.resizing .resize-handle {
    opacity: 1;
  }

  .resize-handle:hover {
    background: rgba(81, 207, 102, 0.4);
  }

  .resize-grip {
    width: 4px;
    height: 20px;
    background: repeating-linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.8) 0px,
      rgba(255, 255, 255, 0.8) 2px,
      transparent 2px,
      transparent 4px
    );
    border-radius: 1px;
  }
</style>
