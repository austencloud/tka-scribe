/**
 * createClipMove - Composable for clip move (reposition) drag behavior
 *
 * Returns event handlers for dragging a clip to a new timeline position.
 */

import type { TimelineClip } from "../../domain/timeline-types";
import { pixelsToTime } from "../../domain/timeline-types";
import { getTimelineState } from "../../state/timeline-state.svelte";

export interface ClipMoveHandlers {
  handleMoveStart: (e: MouseEvent) => void;
}

export interface ClipMoveCallbacks {
  onDragStart: () => void;
  onDragEnd: () => void;
}

export function createClipMove(
  getClip: () => TimelineClip | null,
  getPixelsPerSecond: () => number,
  callbacks: ClipMoveCallbacks
): ClipMoveHandlers {
  let dragStartX = 0;
  let dragStartValue = 0;

  function getState() {
    return getTimelineState();
  }

  function handleMoveUpdate(e: MouseEvent) {
    const clip = getClip();
    if (!clip) return;

    const deltaX = e.clientX - dragStartX;
    const deltaTime = pixelsToTime(deltaX, getPixelsPerSecond());
    const newStartTime = Math.max(0, dragStartValue + deltaTime);
    getState().moveClip(clip.id, newStartTime);
  }

  function handleMoveEnd() {
    callbacks.onDragEnd();
    window.removeEventListener("mousemove", handleMoveUpdate);
    window.removeEventListener("mouseup", handleMoveEnd);
  }

  function handleMoveStart(e: MouseEvent) {
    const clip = getClip();
    if (!clip || clip.locked || e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    dragStartX = e.clientX;
    dragStartValue = clip.startTime;

    callbacks.onDragStart();
    getState().selectClip(clip.id);

    window.addEventListener("mousemove", handleMoveUpdate);
    window.addEventListener("mouseup", handleMoveEnd);
  }

  return { handleMoveStart };
}
