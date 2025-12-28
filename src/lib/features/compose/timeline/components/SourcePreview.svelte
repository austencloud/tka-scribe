<!--
  SourcePreview.svelte - Source Monitor for Timeline

  Previews sequences from the library BEFORE adding them to the timeline.
  Like Premiere Pro's Source Monitor - audition clips before editing.

  Features:
  - Load any sequence for preview
  - Independent playback controls (doesn't affect timeline)
  - Scrub through beats
  - Quick add to timeline button
-->
<script lang="ts">
  import { onMount, onDestroy, untrack } from "svelte";
  import AnimatorCanvas from "$lib/shared/animation-engine/components/AnimatorCanvas.svelte";
  import { resolve, loadPixiModule, loadFeatureModule } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import type { ISequenceAnimationOrchestrator } from "../../services/contracts/ISequenceAnimationOrchestrator";
  import type { PropState } from "../../shared/domain/types/PropState";

  interface Props {
    /** Sequence to preview (from library) */
    sequence: SequenceData | null;
    /** Callback when user wants to add sequence to timeline */
    onAddToTimeline?: (sequence: SequenceData) => void;
  }

  let { sequence = null, onAddToTimeline }: Props = $props();

  // Animation orchestrator for calculating prop states
  let animationOrchestrator = $state<ISequenceAnimationOrchestrator | null>(null);
  let initialized = $state(false);
  let loading = $state(true);
  let error = $state<string | null>(null);

  // Playback state (independent from timeline)
  let currentBeat = $state(0);
  let isPlaying = $state(false);
  let playbackInterval: number | null = null;

  // Track loaded sequence
  let loadedSequenceId = $state<string | null>(null);

  // Prop states for rendering
  let bluePropState = $state<PropState | null>(null);
  let redPropState = $state<PropState | null>(null);

  // Derived values
  const totalBeats = $derived(sequence?.beats?.length || 1);
  const displayName = $derived(sequence?.word || sequence?.name || "No sequence loaded");

  const currentLetter = $derived.by(() => {
    if (!sequence) return null;
    const beatIndex = Math.floor(currentBeat);

    if (beatIndex === 0 && sequence.startPosition) {
      return (sequence.startPosition as any).letter || null;
    }

    if (sequence.beats && sequence.beats.length > 0) {
      const clampedIndex = Math.max(0, Math.min(beatIndex, sequence.beats.length - 1));
      return sequence.beats[clampedIndex]?.letter || null;
    }
    return null;
  });

  const currentBeatData = $derived.by(() => {
    if (!sequence?.beats) return null;
    const beatIndex = Math.floor(currentBeat);
    const clampedIndex = Math.max(0, Math.min(beatIndex, sequence.beats.length - 1));
    return sequence.beats[clampedIndex] || null;
  });

  // Initialize services on mount
  onMount(async () => {
    try {
      loading = true;
      await loadFeatureModule("animate");
      await loadPixiModule();
      animationOrchestrator = resolve(TYPES.ISequenceAnimationOrchestrator) as ISequenceAnimationOrchestrator;
      initialized = true;
      loading = false;
    } catch (err) {
      console.error("SourcePreview: init failed:", err);
      error = "Failed to initialize preview";
      loading = false;
    }
  });

  // Load sequence when it changes
  $effect(() => {
    if (!initialized || !animationOrchestrator || !sequence) {
      untrack(() => {
        loadedSequenceId = null;
        bluePropState = null;
        redPropState = null;
        currentBeat = 0;
        stopPlayback();
      });
      return;
    }

    // Only reinitialize if sequence changed
    if (sequence.id === loadedSequenceId) return;

    untrack(() => {
      loadedSequenceId = sequence.id ?? null;
      currentBeat = 0;
      stopPlayback();
      initializeAnimation(sequence);
    });
  });

  // Update prop states when beat changes
  $effect(() => {
    if (!animationOrchestrator || !sequence || loadedSequenceId !== sequence.id) return;

    const beat = currentBeat;

    untrack(() => {
      animationOrchestrator!.calculateState(beat);
      const propStates = animationOrchestrator!.getCurrentPropStates();
      bluePropState = propStates.blue;
      redPropState = propStates.red;

    });
  });

  function initializeAnimation(seq: SequenceData) {
    if (!animationOrchestrator || !seq) return;

    try {
      const success = animationOrchestrator.initializeWithDomainData(seq);
      if (!success) {
        throw new Error("Failed to initialize animation");
      }

      animationOrchestrator.calculateState(0);
      const propStates = animationOrchestrator.getCurrentPropStates();
      bluePropState = propStates.blue;
      redPropState = propStates.red;

    } catch (err) {
      console.error("SourcePreview: animation init failed:", err);
    }
  }

  // Playback controls
  function togglePlayback() {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  }

  function startPlayback() {
    if (playbackInterval) return;
    isPlaying = true;

    const bpm = 60; // Default BPM for preview
    const msPerBeat = (60 / bpm) * 1000;
    const stepsPerBeat = 30; // Smooth animation
    const msPerStep = msPerBeat / stepsPerBeat;

    playbackInterval = window.setInterval(() => {
      currentBeat += 1 / stepsPerBeat;
      if (currentBeat >= totalBeats) {
        currentBeat = 0; // Loop
      }
    }, msPerStep);
  }

  function stopPlayback() {
    if (playbackInterval) {
      clearInterval(playbackInterval);
      playbackInterval = null;
    }
    isPlaying = false;
  }

  function goToStart() {
    currentBeat = 0;
  }

  function goToEnd() {
    currentBeat = Math.max(0, totalBeats - 1);
  }

  function stepBackward() {
    currentBeat = Math.max(0, Math.floor(currentBeat) - 1);
  }

  function stepForward() {
    currentBeat = Math.min(totalBeats - 1, Math.floor(currentBeat) + 1);
  }

  function handleScrub(e: Event) {
    const input = e.target as HTMLInputElement;
    currentBeat = parseFloat(input.value);
  }

  function handleAddToTimeline() {
    if (sequence && onAddToTimeline) {
      onAddToTimeline(sequence);
    }
  }

  onDestroy(() => {
    stopPlayback();
    if (animationOrchestrator) {
      animationOrchestrator.dispose();
    }
  });
</script>

<div class="source-preview">
  <!-- Preview Header -->
  <div class="preview-header">
    <span class="preview-label">Source</span>
    {#if sequence}
      <span class="sequence-info" title={displayName}>
        {displayName}
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
        <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
        <span>{error}</span>
      </div>
    {:else if sequence && bluePropState && redPropState}
      <div class="canvas-container">
        <AnimatorCanvas
          blueProp={bluePropState}
          redProp={redPropState}
          gridVisible={true}
          gridMode={sequence.gridMode ?? null}
          letter={currentLetter}
          beatData={currentBeatData}
          currentBeat={Math.floor(currentBeat)}
          sequenceData={sequence}
        />
      </div>

      <!-- Beat indicator overlay -->
      <div class="beat-indicator">
        Beat {Math.floor(currentBeat) + 1} / {totalBeats}
      </div>

      <!-- Playback status overlay -->
      {#if isPlaying}
        <div class="playback-status">
          <i class="fas fa-play" aria-hidden="true"></i>
        </div>
      {/if}
    {:else}
      <div class="empty-state">
        <i class="fas fa-photo-film" aria-hidden="true"></i>
        <span>No source loaded</span>
        <span class="hint">Select a sequence from the library to preview</span>
      </div>
    {/if}
  </div>

  <!-- Transport Controls (always visible for layout consistency) -->
  <div class="transport-controls">
    <!-- Scrubber -->
    <div class="scrubber">
      <input
        type="range"
        min="0"
        max={sequence ? totalBeats - 0.01 : 1}
        step="0.01"
        value={currentBeat}
        oninput={handleScrub}
        class="scrub-slider"
        disabled={!sequence}
      />
    </div>

    <!-- Control buttons wrapper for centering -->
    <div class="control-buttons-wrapper">
      <!-- Centered transport buttons -->
      <div class="control-buttons">
        <button class="transport-btn" onclick={goToStart} title="Go to start" aria-label="Go to start" disabled={!sequence}>
          <i class="fas fa-backward-fast" aria-hidden="true"></i>
        </button>
        <button class="transport-btn" onclick={stepBackward} title="Previous beat" aria-label="Previous beat" disabled={!sequence}>
          <i class="fas fa-backward-step" aria-hidden="true"></i>
        </button>
        <button class="transport-btn play-btn" onclick={togglePlayback} title={isPlaying ? "Pause" : "Play"} aria-label={isPlaying ? "Pause" : "Play"} disabled={!sequence}>
          <i class="fas {isPlaying ? 'fa-pause' : 'fa-play'}" aria-hidden="true"></i>
        </button>
        <button class="transport-btn" onclick={stepForward} title="Next beat" aria-label="Next beat" disabled={!sequence}>
          <i class="fas fa-forward-step" aria-hidden="true"></i>
        </button>
        <button class="transport-btn" onclick={goToEnd} title="Go to end" aria-label="Go to end" disabled={!sequence}>
          <i class="fas fa-forward-fast" aria-hidden="true"></i>
        </button>
      </div>

      <!-- Add to timeline button (only when sequence loaded) -->
      {#if sequence}
        <button class="add-btn" onclick={handleAddToTimeline} title="Add to timeline at playhead">
          <i class="fas fa-plus" aria-hidden="true"></i>
          <span>Add</span>
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .source-preview {
    display: flex;
    flex-direction: column;
    background: #0e0e12;
    border: 1px solid var(--theme-stroke);
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
    font-size: var(--font-size-compact);
  }

  .preview-label {
    font-weight: 600;
    color: #ffd43b; /* Yellow to distinguish from Program monitor */
  }

  .sequence-info {
    margin-left: auto;
    color: var(--theme-text-muted, var(--theme-text-dim));
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
    font-size: var(--font-size-compact);
    color: var(--theme-text-dim);
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
    font-size: var(--font-size-3xl);
    opacity: 0.5;
  }

  .empty-state .hint {
    font-size: var(--font-size-compact);
    opacity: 0.6;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--theme-stroke);
    border-top-color: #ffd43b;
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
    background: rgba(255, 212, 59, 0.2);
    border-radius: 50%;
    backdrop-filter: blur(4px);
    color: #ffd43b;
    font-size: var(--font-size-compact);
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
    background: #ffd43b;
    cursor: pointer;
    transition: transform 0.1s ease;
  }

  .scrub-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  .scrub-slider:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .scrub-slider:disabled::-webkit-slider-thumb {
    cursor: not-allowed;
  }

  .control-buttons-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .control-buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .transport-btn {
    width: var(--min-touch-target); /* WCAG AAA touch target */
    height: var(--min-touch-target);
    border-radius: 4px;
    border: none;
    background: var(--theme-card-bg);
    color: var(--theme-text-dim);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-compact);
    transition: all 0.15s ease;
  }

  .transport-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .transport-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .transport-btn.play-btn {
    width: 52px; /* WCAG AAA touch target - slightly larger for primary */
    height: 52px;
    background: rgba(255, 212, 59, 0.2);
    color: #ffd43b;
    font-size: var(--font-size-sm);
  }

  .transport-btn.play-btn:hover:not(:disabled) {
    background: rgba(255, 212, 59, 0.3);
  }

  .add-btn {
    position: absolute;
    right: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 4px;
    border: none;
    background: var(--theme-accent);
    color: white;
    cursor: pointer;
    font-size: var(--font-size-compact);
    font-weight: 500;
    transition: all 0.15s ease;
  }

  .add-btn:hover {
    background: #5aabff;
    transform: translateY(-1px);
  }

  .add-btn i {
    font-size: var(--font-size-compact);
  }
</style>

