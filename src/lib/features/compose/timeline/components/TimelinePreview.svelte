<!--
  TimelinePreview.svelte - Program Monitor for Timeline

  Shows the animation at the current playhead position.
  Like Premiere Pro's Program Monitor - displays what's "on screen" at the playhead.

  Features:
  - Syncs to timeline playhead position
  - Renders active clip's animation with interpolated prop positions
  - Shows empty state when no clip at playhead
-->
<script lang="ts">
  import { onMount, onDestroy, untrack } from "svelte";
  import AnimatorCanvas from "$lib/shared/animation-engine/components/AnimatorCanvas.svelte";
  import { resolve, loadPixiModule, loadFeatureModule } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { getTimelinePlaybackService } from "../services/implementations/TimelinePlaybackService";
  import { getTimelineState } from "../state/timeline-state.svelte";
  import type { TimelineClip } from "../domain/timeline-types";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import type { ISequenceAnimationOrchestrator } from "../../services/contracts/ISequenceAnimationOrchestrator";
  import type { PropState } from "../../shared/domain/types/PropState";

  interface Props {
    /** Current playhead position in seconds */
    playheadPosition: number;
    /** All clips from timeline (flattened across tracks) */
    clips: TimelineClip[];
    /** Whether timeline is playing */
    isPlaying: boolean;
    /** Pixels per second (for display info) */
    pixelsPerSecond?: number;
    /** BPM for playback sync */
    bpm?: number;
  }

  let {
    playheadPosition = 0,
    clips = [],
    isPlaying = false,
    pixelsPerSecond = 50,
    bpm = 60,
  }: Props = $props();

  // Playback service access
  function getPlayback() {
    return getTimelinePlaybackService();
  }

  function getState() {
    return getTimelineState();
  }

  // Total duration for scrubber
  const totalDuration = $derived(getState().totalDuration || 60);

  // Animation orchestrator for calculating prop states
  let animationOrchestrator = $state<ISequenceAnimationOrchestrator | null>(null);
  let initialized = $state(false);
  let loading = $state(true);
  let error = $state<string | null>(null);

  // Track the currently displayed clip
  let currentClipId = $state<string | null>(null);
  let currentSequence = $state<SequenceData | null>(null);

  // Prop states for rendering
  let bluePropState = $state<PropState | null>(null);
  let redPropState = $state<PropState | null>(null);

  // Find the active clip at playhead position
  const activeClip = $derived.by(() => {
    if (clips.length === 0) return null;

    // Find first clip that contains the playhead position
    // Clips are ordered by track then by startTime
    for (const clip of clips) {
      if (clip.muted) continue;
      const clipEnd = clip.startTime + clip.duration;
      if (playheadPosition >= clip.startTime && playheadPosition < clipEnd) {
        return clip;
      }
    }

    // Debug: log when no clip is found but clips exist
    if (clips.length > 0) {
      const firstClip = clips[0];
      console.log('[TimelinePreview] No clip at playhead:', {
        playheadPosition,
        firstClipStartTime: firstClip.startTime,
        firstClipEnd: firstClip.startTime + firstClip.duration,
        clipCount: clips.length
      });
    }

    return null;
  });

  // Calculate beat position within the active clip (fractional for smooth animation)
  const clipBeatPosition = $derived.by(() => {
    if (!activeClip) return 0;

    // Time elapsed within the clip
    const timeInClip = playheadPosition - activeClip.startTime;

    // Adjust for in/out points
    const clipContentDuration = activeClip.duration; // Already adjusted for speed
    const sourceStartFraction = activeClip.inPoint;
    const sourceEndFraction = activeClip.outPoint;
    const sourceDurationFraction = sourceEndFraction - sourceStartFraction;

    // Progress through the visible portion
    const progressInClip = clipContentDuration > 0 ? timeInClip / clipContentDuration : 0;

    // Map to source position
    const sourcePosition = sourceStartFraction + (progressInClip * sourceDurationFraction);

    // Convert to beat number (fractional for interpolation)
    const totalBeats = activeClip.sequence.beats?.length || 1;
    const beat = sourcePosition * totalBeats;

    // Handle looping
    if (activeClip.loop) {
      return beat % totalBeats;
    }

    return Math.min(beat, totalBeats - 0.001);
  });

  // Current letter derived from beat position
  const currentLetter = $derived.by(() => {
    if (!activeClip?.sequence) return null;

    const seq = activeClip.sequence;
    const beatIndex = Math.floor(clipBeatPosition);

    // At beat 0, show start position
    if (beatIndex === 0 && seq.startPosition) {
      return (seq.startPosition as any).letter || null;
    }

    // Get letter from beat
    if (seq.beats && seq.beats.length > 0) {
      const clampedIndex = Math.max(0, Math.min(beatIndex, seq.beats.length - 1));
      return seq.beats[clampedIndex]?.letter || null;
    }

    return null;
  });

  // Current beat data
  const currentBeatData = $derived.by(() => {
    if (!activeClip?.sequence?.beats) return null;

    const beatIndex = Math.floor(clipBeatPosition);
    const clampedIndex = Math.max(0, Math.min(beatIndex, activeClip.sequence.beats.length - 1));
    return activeClip.sequence.beats[clampedIndex] || null;
  });

  // Initialize services on mount
  onMount(async () => {
    try {
      loading = true;

      // Ensure animator module is loaded
      await loadFeatureModule("animate");
      await loadPixiModule();

      // Resolve the animation orchestrator
      animationOrchestrator = resolve(TYPES.ISequenceAnimationOrchestrator) as ISequenceAnimationOrchestrator;
      console.log('[TimelinePreview] Orchestrator instance:', animationOrchestrator);
      initialized = true;
      loading = false;
    } catch (err) {
      console.error("TimelinePreview: init failed:", err);
      error = "Failed to initialize preview";
      loading = false;
    }
  });

  // Sync animation when active clip changes
  $effect(() => {
    if (!initialized || !animationOrchestrator) return;

    const clip = activeClip;
    if (!clip) {
      // Clear animation state when no clip
      untrack(() => {
        currentClipId = null;
        currentSequence = null;
        bluePropState = null;
        redPropState = null;
      });
      return;
    }

    // Only reinitialize if clip changed
    if (clip.id === currentClipId) return;

    untrack(() => {
      currentClipId = clip.id;
      initializeAnimation(clip.sequence);
    });
  });

  // Update prop states when playhead moves - this is the key fix!
  $effect(() => {
    if (!animationOrchestrator || !currentSequence || !activeClip) return;

    const beat = clipBeatPosition;

    untrack(() => {
      // Calculate interpolated state for this fractional beat position
      animationOrchestrator!.calculateState(beat);

      // Get the calculated prop states
      const propStates = animationOrchestrator!.getCurrentPropStates();
      bluePropState = propStates.blue;
      redPropState = propStates.red;
    });
  });

  function initializeAnimation(sequence: SequenceData) {
    if (!animationOrchestrator || !sequence) return;

    try {
      const success = animationOrchestrator.initializeWithDomainData(sequence);
      if (!success) {
        throw new Error("Failed to initialize animation");
      }

      currentSequence = sequence;

      // Get initial prop states
      animationOrchestrator.calculateState(0);
      const propStates = animationOrchestrator.getCurrentPropStates();
      bluePropState = propStates.blue;
      redPropState = propStates.red;
    } catch (err) {
      console.error("TimelinePreview: animation init failed:", err);
      currentSequence = null;
    }
  }

  // Format time display
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toFixed(2).padStart(5, "0")}`;
  }

  onDestroy(() => {
    // Cleanup
    if (animationOrchestrator) {
      animationOrchestrator.dispose();
    }
  });
</script>

<div class="timeline-preview">
  <!-- Preview Header -->
  <div class="preview-header">
    <span class="preview-label">Preview</span>
    <span class="time-display">{formatTime(playheadPosition)}</span>
    {#if activeClip}
      <span class="clip-info" title={activeClip.sequence.word || activeClip.sequence.name}>
        {activeClip.sequence.word || activeClip.sequence.name || "Clip"}
      </span>
    {/if}
  </div>

  <!-- Canvas Area -->
  <div class="preview-canvas">
    {#if loading}
      <div class="loading-state">
        <div class="spinner"></div>
        <span>Initializing...</span>
      </div>
    {:else if error}
      <div class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <span>{error}</span>
      </div>
    {:else if activeClip && currentSequence && bluePropState && redPropState}
      <div class="canvas-container">
        <AnimatorCanvas
          blueProp={bluePropState}
          redProp={redPropState}
          gridVisible={true}
          gridMode={currentSequence.gridMode ?? null}
          letter={currentLetter}
          beatData={currentBeatData}
          currentBeat={Math.floor(clipBeatPosition)}
          sequenceData={currentSequence}
        />
      </div>

      <!-- Beat indicator overlay -->
      <div class="beat-indicator">
        Beat {Math.floor(clipBeatPosition) + 1} / {activeClip.sequence.beats?.length || 1}
      </div>

      <!-- Playback status overlay -->
      {#if isPlaying}
        <div class="playback-status">
          <i class="fas fa-play"></i>
        </div>
      {/if}
    {:else}
      <div class="empty-state">
        <i class="fas fa-film"></i>
        <span>No clip at playhead</span>
        <span class="hint">Position the playhead over a clip to preview</span>
      </div>
    {/if}
  </div>

  <!-- Transport Controls -->
  <div class="transport-controls">
    <!-- Scrubber -->
    <div class="scrubber">
      <input
        type="range"
        min="0"
        max={totalDuration}
        step="0.01"
        value={playheadPosition}
        oninput={(e) => getPlayback().seek(parseFloat((e.target as HTMLInputElement).value))}
        class="scrub-slider"
      />
    </div>

    <!-- Control buttons -->
    <div class="control-buttons">
      <button class="transport-btn" onclick={() => getPlayback().goToStart()} title="Go to start (Home)">
        <i class="fas fa-backward-fast"></i>
      </button>
      <button class="transport-btn" onclick={() => getPlayback().stepBackward(1)} title="Previous frame (←)">
        <i class="fas fa-backward-step"></i>
      </button>
      <button class="transport-btn play-btn" onclick={() => getPlayback().togglePlayPause()} title={isPlaying ? "Pause (Space)" : "Play (Space)"}>
        <i class="fas {isPlaying ? 'fa-pause' : 'fa-play'}"></i>
      </button>
      <button class="transport-btn" onclick={() => getPlayback().stepForward(1)} title="Next frame (→)">
        <i class="fas fa-forward-step"></i>
      </button>
      <button class="transport-btn" onclick={() => getPlayback().goToEnd()} title="Go to end (End)">
        <i class="fas fa-forward-fast"></i>
      </button>
    </div>
  </div>
</div>

<style>
  .timeline-preview {
    display: flex;
    flex-direction: column;
    background: #0e0e12;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    overflow: hidden;
    container-type: inline-size;
  }

  .preview-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    font-size: var(--font-size-compact, 12px);
  }

  .preview-label {
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .time-display {
    font-family: "SF Mono", monospace;
    color: var(--theme-accent, #4a9eff);
    background: rgba(74, 158, 255, 0.1);
    padding: 2px 8px;
    border-radius: 4px;
  }

  .clip-info {
    margin-left: auto;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .preview-canvas {
    position: relative;
    aspect-ratio: 1;
    min-height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
  }

  .canvas-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .canvas-container :global(.canvas-wrapper) {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
  }

  .beat-indicator {
    position: absolute;
    bottom: 8px;
    left: 8px;
    padding: 4px 8px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 4px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(4px);
  }

  .loading-state,
  .error-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.4);
    text-align: center;
    padding: 20px;
  }

  .empty-state i,
  .error-state i {
    font-size: 32px;
    opacity: 0.5;
  }

  .empty-state .hint {
    font-size: 11px;
    opacity: 0.6;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: #4a9eff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .playback-status {
    position: absolute;
    bottom: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: rgba(81, 207, 102, 0.2);
    border-radius: 50%;
    backdrop-filter: blur(4px);
    color: #51cf66;
    font-size: 10px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(0.95); }
  }

  /* Transport Controls */
  .transport-controls {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.03);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .scrubber {
    width: 100%;
  }

  .scrub-slider {
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    cursor: pointer;
  }

  .scrub-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--theme-accent, #4a9eff);
    cursor: pointer;
    transition: transform 0.1s ease;
  }

  .scrub-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  .control-buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .transport-btn {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    border: none;
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    transition: all 0.15s ease;
  }

  .transport-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .transport-btn.play-btn {
    width: 36px;
    height: 36px;
    background: rgba(74, 158, 255, 0.2);
    color: var(--theme-accent, #4a9eff);
    font-size: 14px;
  }

  .transport-btn.play-btn:hover {
    background: rgba(74, 158, 255, 0.3);
  }
</style>
