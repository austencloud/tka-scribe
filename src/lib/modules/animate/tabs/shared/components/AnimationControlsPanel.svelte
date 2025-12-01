<!--
  AnimationControlsPanel.svelte

  Reusable playback and speed controls for animation modes.
  Can be used across Single, Tunnel, Mirror, and Grid modes.
-->
<script lang="ts">
  // Props
  let {
    isPlaying = $bindable(false),
    speed = $bindable(1.0),
    showExport = false,
    onExport,
  }: {
    isPlaying?: boolean;
    speed?: number;
    showExport?: boolean;
    onExport?: () => void;
  } = $props();

  function togglePlayback() {
    isPlaying = !isPlaying;
  }

  function stopPlayback() {
    isPlaying = false;
  }

  function handleSpeedChange(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    speed = parseFloat(target.value);
  }
</script>

<div class="controls-panel">
  <div class="playback-controls">
    <button
      class="control-button"
      class:active={isPlaying}
      onclick={togglePlayback}
      aria-label={isPlaying ? "Pause animation" : "Play animation"}
    >
      <i class={isPlaying ? "fas fa-pause" : "fas fa-play"}></i>
    </button>
    <button
      class="control-button"
      onclick={stopPlayback}
      aria-label="Stop animation"
    >
      <i class="fas fa-stop"></i>
    </button>
  </div>

  <div class="setting-group">
    <label for="animation-speed">
      <i class="fas fa-gauge"></i>
      Speed
    </label>
    <input
      id="animation-speed"
      type="range"
      min="0.5"
      max="2"
      step="0.1"
      value={speed}
      oninput={handleSpeedChange}
    />
    <span class="setting-value">{speed.toFixed(1)}x</span>
  </div>

  {#if showExport && onExport}
    <button class="export-button" onclick={onExport}>
      <i class="fas fa-download"></i>
      Export GIF
    </button>
  {/if}
</div>

<style>
  .controls-panel {
    display: flex;
    align-items: center;
    gap: var(--spacing-xl);
    padding: var(--spacing-lg);
    background: rgba(255, 255, 255, 0.05);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .playback-controls {
    display: flex;
    gap: var(--spacing-sm);
  }

  .control-button {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .control-button:hover {
    background: rgba(236, 72, 153, 0.3);
    border-color: rgba(236, 72, 153, 0.5);
  }

  .control-button.active {
    background: rgba(236, 72, 153, 0.4);
    border-color: rgba(236, 72, 153, 0.6);
  }

  .setting-group {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .setting-group label {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: 0.875rem;
    white-space: nowrap;
  }

  .setting-group input[type="range"] {
    width: 120px;
  }

  .setting-value {
    font-size: 0.875rem;
    font-weight: 600;
    min-width: 45px;
    text-align: right;
  }

  .export-button {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-lg);
    background: linear-gradient(135deg, #10b981, #059669);
    border: none;
    border-radius: var(--border-radius-md);
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .export-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .controls-panel {
      flex-wrap: wrap;
    }
  }
</style>
