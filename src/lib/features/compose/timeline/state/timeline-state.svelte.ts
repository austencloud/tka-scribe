/**
 * Timeline Editor State
 *
 * Svelte 5 runes-based state management for the DAW-style timeline editor.
 * Core state and mutations for project, tracks, clips, playback, viewport, and selection.
 *
 * Decomposed from 908 lines to ~550 lines + 5 action modules.
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type {
  TimelineProject,
  TimelineTrack,
  TimelineClip,
  PlayheadState,
  SelectionState,
  ViewportState,
  SnapSettings,
  TimeSeconds,
} from "../domain/timeline-types";
import {
  createProject,
  createTrack,
  createClip,
  createDefaultPlayheadState,
  createDefaultSelectionState,
  createDefaultViewportState,
  generateClipId,
  getClipEndTime,
  calculateProjectDuration,
  snapTime,
} from "../domain/timeline-types";

import { loadFromStorage, saveToStorage, TIMELINE_STORAGE_KEYS } from "./timeline-storage";
import { createPlayheadActions } from "./actions/playhead-actions";
import { createSelectionActions } from "./actions/selection-actions";
import { createViewportActions } from "./actions/viewport-actions";
import { createUIStateActions } from "./actions/ui-state-actions";

// ============================================================================
// State Factory
// ============================================================================

export type TimelineState = ReturnType<typeof createTimelineState>;

export function createTimelineState() {
  // =========================================================================
  // Core State
  // =========================================================================

  let project = $state<TimelineProject>(
    loadFromStorage(TIMELINE_STORAGE_KEYS.PROJECT, createProject())
  );

  let playhead = $state<PlayheadState>(createDefaultPlayheadState());
  let selection = $state<SelectionState>(createDefaultSelectionState());
  let viewport = $state<ViewportState>(
    loadFromStorage(TIMELINE_STORAGE_KEYS.VIEWPORT, createDefaultViewportState())
  );

  // UI State
  let isClipInspectorOpen = $state(false);
  let isTrackSettingsOpen = $state(false);
  let isProjectSettingsOpen = $state(false);
  let clipBeingEdited = $state<string | null>(null);

  // Drag state
  let isDragging = $state(false);
  let dragClipId = $state<string | null>(null);
  let dragStartX = $state(0);
  let dragStartTime = $state<TimeSeconds>(0);

  // Audio URL (not persisted)
  let audioUrl: string | null = null;

  // =========================================================================
  // Derived State
  // =========================================================================

  const selectedClips = $derived(
    project.tracks
      .flatMap((t) => t.clips)
      .filter((c) => selection.selectedClipIds.includes(c.id))
  );

  const selectedClip = $derived(selectedClips.length === 1 ? selectedClips[0] : null);
  const allClips = $derived(project.tracks.flatMap((t) => t.clips));
  const clipEdges = $derived(allClips.flatMap((c) => [c.startTime, getClipEndTime(c)]));
  const totalDuration = $derived(calculateProjectDuration(project));
  const hasSelection = $derived(selection.selectedClipIds.length > 0);
  const canUndo = $derived(false); // TODO: implement history
  const canRedo = $derived(false);

  // =========================================================================
  // Helper Functions
  // =========================================================================

  function saveProject() {
    saveToStorage(TIMELINE_STORAGE_KEYS.PROJECT, project);
  }

  // =========================================================================
  // Initialize Action Modules
  // =========================================================================

  const playheadActions = createPlayheadActions({
    getPlayhead: () => playhead,
    setPlayhead: (p) => (playhead = p),
    getTotalDuration: () => totalDuration,
    getFrameRate: () => project.frameRate,
  });

  const selectionActions = createSelectionActions({
    getSelection: () => selection,
    setSelection: (s) => (selection = s),
    getAllClips: () => allClips,
  });

  const viewportActions = createViewportActions({
    getViewport: () => viewport,
    setViewport: (v) => (viewport = v),
    getTotalDuration: () => totalDuration,
    getPlayheadPosition: () => playhead.position,
  });

  const uiStateActions = createUIStateActions({
    getClipBeingEdited: () => clipBeingEdited,
    setClipBeingEdited: (id) => (clipBeingEdited = id),
    getIsClipInspectorOpen: () => isClipInspectorOpen,
    setIsClipInspectorOpen: (open) => (isClipInspectorOpen = open),
    getIsTrackSettingsOpen: () => isTrackSettingsOpen,
    setIsTrackSettingsOpen: (open) => (isTrackSettingsOpen = open),
    getIsProjectSettingsOpen: () => isProjectSettingsOpen,
    setIsProjectSettingsOpen: (open) => (isProjectSettingsOpen = open),
    selectClip: selectionActions.selectClip,
  });

  // =========================================================================
  // Project Mutations
  // =========================================================================

  function setProjectName(name: string) {
    project = { ...project, name, updatedAt: new Date() };
    saveProject();
    console.log(`📁 Timeline: Project renamed to "${name}"`);
  }

  function setDefaultBpm(bpm: number) {
    project = { ...project, defaultBpm: bpm, updatedAt: new Date() };
    saveProject();
  }

  function setFrameRate(frameRate: 24 | 30 | 60) {
    project = { ...project, frameRate, updatedAt: new Date() };
    saveProject();
  }

  function updateSnapSettings(settings: Partial<SnapSettings>) {
    project = {
      ...project,
      snap: { ...project.snap, ...settings },
      updatedAt: new Date(),
    };
    saveProject();
  }

  function loadProject(newProject: TimelineProject) {
    project = newProject;
    selection = createDefaultSelectionState();
    playhead = createDefaultPlayheadState();
    saveProject();
    console.log(`📁 Timeline: Loaded project "${newProject.name}"`);
  }

  function resetProject() {
    project = createProject();
    selection = createDefaultSelectionState();
    playhead = createDefaultPlayheadState();
    saveProject();
    console.log("📁 Timeline: Project reset");
  }

  // =========================================================================
  // Track Mutations
  // =========================================================================

  function addTrack(name?: string): TimelineTrack {
    const newOrder = project.tracks.length;
    const trackName = name ?? `Track ${newOrder + 1}`;
    const track = createTrack(trackName, newOrder);

    project = {
      ...project,
      tracks: [...project.tracks, track],
      updatedAt: new Date(),
    };
    saveProject();
    console.log(`🎚️ Timeline: Added track "${trackName}"`);
    return track;
  }

  function removeTrack(trackId: string) {
    if (project.tracks.length <= 1) {
      console.warn("Cannot remove last track");
      return;
    }

    const track = project.tracks.find((t) => t.id === trackId);
    project = {
      ...project,
      tracks: project.tracks
        .filter((t) => t.id !== trackId)
        .map((t, i) => ({ ...t, order: i })),
      updatedAt: new Date(),
    };

    selection = {
      ...selection,
      selectedClipIds: selection.selectedClipIds.filter(
        (id) => !track?.clips.some((c) => c.id === id)
      ),
    };

    saveProject();
    console.log(`🎚️ Timeline: Removed track`);
  }

  function updateTrack(trackId: string, updates: Partial<TimelineTrack>) {
    project = {
      ...project,
      tracks: project.tracks.map((t) =>
        t.id === trackId ? { ...t, ...updates } : t
      ),
      updatedAt: new Date(),
    };
    saveProject();
  }

  function setTrackMuted(trackId: string, muted: boolean) {
    updateTrack(trackId, { muted });
  }

  function setTrackSolo(trackId: string, solo: boolean) {
    if (solo) {
      project = {
        ...project,
        tracks: project.tracks.map((t) => ({ ...t, solo: t.id === trackId })),
        updatedAt: new Date(),
      };
    } else {
      updateTrack(trackId, { solo: false });
    }
    saveProject();
  }

  function reorderTracks(trackIds: string[]) {
    const reordered = trackIds
      .map((id, i) => {
        const track = project.tracks.find((t) => t.id === id);
        return track ? { ...track, order: i } : null;
      })
      .filter((t): t is TimelineTrack => t !== null);

    project = { ...project, tracks: reordered, updatedAt: new Date() };
    saveProject();
  }

  // =========================================================================
  // Clip Mutations
  // =========================================================================

  function addClip(sequence: SequenceData, trackId: string, startTime: TimeSeconds): TimelineClip {
    const track = project.tracks.find((t) => t.id === trackId);
    if (!track) {
      console.error(`Track ${trackId} not found`);
      trackId = project.tracks[0]?.id ?? "";
    }

    const snappedStart = snapTime(startTime, project.snap, [], clipEdges, playhead.position);
    const clip = createClip(sequence, trackId, snappedStart);

    project = {
      ...project,
      tracks: project.tracks.map((t) =>
        t.id === trackId
          ? { ...t, clips: [...t.clips, clip].sort((a, b) => a.startTime - b.startTime) }
          : t
      ),
      updatedAt: new Date(),
    };

    saveProject();
    console.log(`🎬 Timeline: Added clip "${sequence.name}" at ${snappedStart}s`);
    return clip;
  }

  function removeClip(clipId: string) {
    project = {
      ...project,
      tracks: project.tracks.map((t) => ({
        ...t,
        clips: t.clips.filter((c) => c.id !== clipId),
      })),
      updatedAt: new Date(),
    };

    selection = {
      ...selection,
      selectedClipIds: selection.selectedClipIds.filter((id) => id !== clipId),
    };

    saveProject();
    console.log(`🎬 Timeline: Removed clip`);
  }

  function removeSelectedClips() {
    if (selection.selectedClipIds.length === 0) return;

    project = {
      ...project,
      tracks: project.tracks.map((t) => ({
        ...t,
        clips: t.clips.filter((c) => !selection.selectedClipIds.includes(c.id)),
      })),
      updatedAt: new Date(),
    };

    selection = { ...selection, selectedClipIds: [] };
    saveProject();
  }

  function updateClip(clipId: string, updates: Partial<TimelineClip>) {
    project = {
      ...project,
      tracks: project.tracks.map((t) => ({
        ...t,
        clips: t.clips
          .map((c) => (c.id === clipId ? { ...c, ...updates } : c))
          .sort((a, b) => a.startTime - b.startTime),
      })),
      updatedAt: new Date(),
    };
    saveProject();
  }

  function moveClip(clipId: string, newStartTime: TimeSeconds, newTrackId?: string) {
    const snappedTime = snapTime(
      newStartTime,
      project.snap,
      [],
      clipEdges.filter((t) => {
        const clip = allClips.find((c) => c.id === clipId);
        return clip ? t !== clip.startTime && t !== getClipEndTime(clip) : true;
      }),
      playhead.position
    );

    if (newTrackId) {
      const clip = allClips.find((c) => c.id === clipId);
      if (!clip) return;

      project = {
        ...project,
        tracks: project.tracks.map((t) => {
          if (t.id === clip.trackId) {
            return { ...t, clips: t.clips.filter((c) => c.id !== clipId) };
          } else if (t.id === newTrackId) {
            const movedClip = { ...clip, trackId: newTrackId, startTime: snappedTime };
            return { ...t, clips: [...t.clips, movedClip].sort((a, b) => a.startTime - b.startTime) };
          }
          return t;
        }),
        updatedAt: new Date(),
      };
    } else {
      updateClip(clipId, { startTime: snappedTime });
    }
    saveProject();
  }

  function setClipDuration(clipId: string, duration: TimeSeconds) {
    updateClip(clipId, { duration: Math.max(0.1, duration) });
  }

  function setClipInOutPoints(clipId: string, inPoint: number, outPoint: number) {
    updateClip(clipId, {
      inPoint: Math.max(0, Math.min(1, inPoint)),
      outPoint: Math.max(0, Math.min(1, outPoint)),
    });
  }

  function setClipPlaybackRate(clipId: string, rate: number) {
    updateClip(clipId, { playbackRate: Math.max(0.1, Math.min(4, rate)) });
  }

  function setClipLoop(clipId: string, loop: boolean, loopCount: number = 0) {
    updateClip(clipId, { loop, loopCount });
  }

  function duplicateClip(clipId: string): TimelineClip | null {
    const clip = allClips.find((c) => c.id === clipId);
    if (!clip) return null;

    const newClip: TimelineClip = {
      ...clip,
      id: generateClipId(),
      startTime: getClipEndTime(clip),
    };

    project = {
      ...project,
      tracks: project.tracks.map((t) =>
        t.id === clip.trackId
          ? { ...t, clips: [...t.clips, newClip].sort((a, b) => a.startTime - b.startTime) }
          : t
      ),
      updatedAt: new Date(),
    };

    saveProject();
    return newClip;
  }

  // =========================================================================
  // Audio Mutations
  // =========================================================================

  function setAudioFile(fileName: string, url: string) {
    audioUrl = url;
    project = {
      ...project,
      audio: { ...project.audio, hasAudio: true, fileName },
      updatedAt: new Date(),
    };
    saveProject();
    console.log(`🎵 Timeline: Audio file set - ${fileName}`);
  }

  function setAudioDuration(duration: TimeSeconds) {
    project = {
      ...project,
      audio: { ...project.audio, duration },
      updatedAt: new Date(),
    };
    saveProject();
  }

  function setAudioBpm(bpm: number | null) {
    project = {
      ...project,
      audio: { ...project.audio, bpm },
      updatedAt: new Date(),
    };
    saveProject();
    console.log(`🎵 Timeline: Audio BPM set to ${bpm}`);
  }

  function clearAudio() {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      audioUrl = null;
    }
    project = {
      ...project,
      audio: { hasAudio: false, fileName: null, duration: 0, bpm: null },
      updatedAt: new Date(),
    };
    saveProject();
    console.log("🎵 Timeline: Audio cleared");
  }

  function getAudioUrl(): string | null {
    return audioUrl;
  }

  // =========================================================================
  // Drag Handling
  // =========================================================================

  function startDrag(clipId: string, startX: number) {
    const clip = allClips.find((c) => c.id === clipId);
    if (!clip || clip.locked) return;

    isDragging = true;
    dragClipId = clipId;
    dragStartX = startX;
    dragStartTime = clip.startTime;
  }

  function updateDrag(currentX: number) {
    if (!isDragging || !dragClipId) return;

    const deltaX = currentX - dragStartX;
    const deltaTime = deltaX / viewport.pixelsPerSecond;
    const newTime = Math.max(0, dragStartTime + deltaTime);

    moveClip(dragClipId, newTime);
  }

  function endDrag() {
    isDragging = false;
    dragClipId = null;
    saveProject();
  }

  // =========================================================================
  // Return State Object
  // =========================================================================

  return {
    // Core state getters
    get project() { return project; },
    get playhead() { return playhead; },
    get selection() { return selection; },
    get viewport() { return viewport; },

    // Derived getters
    get selectedClips() { return selectedClips; },
    get selectedClip() { return selectedClip; },
    get allClips() { return allClips; },
    get totalDuration() { return totalDuration; },
    get hasSelection() { return hasSelection; },
    get canUndo() { return canUndo; },
    get canRedo() { return canRedo; },

    // UI state getters
    get isClipInspectorOpen() { return isClipInspectorOpen; },
    get isTrackSettingsOpen() { return isTrackSettingsOpen; },
    get isProjectSettingsOpen() { return isProjectSettingsOpen; },
    get clipBeingEdited() { return clipBeingEdited; },
    get isDragging() { return isDragging; },

    // Project mutations
    setProjectName,
    setDefaultBpm,
    setFrameRate,
    updateSnapSettings,
    loadProject,
    resetProject,

    // Track mutations
    addTrack,
    removeTrack,
    updateTrack,
    setTrackMuted,
    setTrackSolo,
    reorderTracks,

    // Clip mutations
    addClip,
    removeClip,
    removeSelectedClips,
    updateClip,
    moveClip,
    setClipDuration,
    setClipInOutPoints,
    setClipPlaybackRate,
    setClipLoop,
    duplicateClip,

    // Selection mutations (from extracted module)
    ...selectionActions,

    // Playhead mutations (from extracted module)
    ...playheadActions,

    // Viewport mutations (from extracted module)
    ...viewportActions,

    // Audio mutations
    setAudioFile,
    setAudioDuration,
    setAudioBpm,
    clearAudio,
    getAudioUrl,

    // UI state mutations (from extracted module)
    ...uiStateActions,

    // Drag handling
    startDrag,
    updateDrag,
    endDrag,
  };
}

// ============================================================================
// Singleton Instance
// ============================================================================

let timelineStateInstance: TimelineState | null = null;

export function getTimelineState(): TimelineState {
  if (!timelineStateInstance) {
    timelineStateInstance = createTimelineState();
  }
  return timelineStateInstance;
}

/**
 * Reset the singleton (useful for testing)
 */
export function resetTimelineState(): void {
  timelineStateInstance = null;
}
