<!--
  PerformancePreview.svelte

  Performance video format preview with inline controls.
  Displays camera feed or uploaded video with record/upload toggle.

  Features:
  - Video preview (camera feed or upload)
  - Record/Upload mode toggle
  - Camera selection indicator
  - Settings button (opens PerformanceSettings panel)
  - Recording state indicator

  Domain: Share Hub - Single Media - Performance Video Format
-->
<script lang="ts">
  import { getShareHubState } from '../../state/share-hub-state.svelte';

  const state = getShareHubState();
  let recording = $state(false);

  const modeIcon = $derived(
    state.performanceSettings.mode === 'record' ? 'fa-video' : 'fa-upload'
  );

  const modeLabel = $derived(
    state.performanceSettings.mode === 'record' ? 'Record' : 'Upload'
  );

  function handleSettingsClick() {
    state.settingsPanelOpen = true;
    state.settingsContext = { format: 'performance' };
  }

  function toggleMode() {
    const newMode = state.performanceSettings.mode === 'record' ? 'upload' : 'record';
    state.performanceSettings = { ...state.performanceSettings, mode: newMode };
  }

  function handleRecordToggle() {
    recording = !recording;
    // TODO: Wire to actual video recording
  }
</script>

<div class="performance-preview">
  <!-- Preview Area -->
  <div class="preview-area">
    {#if state.performanceSettings.mode === 'record'}
      <!-- Camera feed preview -->
      <div class="camera-preview">
        {#if recording}
          <div class="recording-indicator">
            <i class="fas fa-circle"></i>
            <span>Recording</span>
          </div>
        {/if}
        <!-- TODO: Integrate actual camera feed -->
        <div class="placeholder-preview">
          <i class="fas fa-video"></i>
          <p>Camera Preview</p>
          {#if state.performanceSettings.cameraId}
            <span class="camera-label">Camera: {state.performanceSettings.cameraId}</span>
          {:else}
            <span class="camera-label">No camera selected</span>
          {/if}
        </div>
      </div>
    {:else}
      <!-- Upload preview -->
      <div class="upload-preview">
        <!-- TODO: Integrate video upload preview -->
        <div class="placeholder-preview">
          {#if state.performanceSettings.uploadedFile}
            <i class="fas fa-file-video"></i>
            <p>{state.performanceSettings.uploadedFile.name}</p>
            <span class="file-size">
              {(state.performanceSettings.uploadedFile.size / 1024 / 1024).toFixed(2)} MB
            </span>
          {:else}
            <i class="fas fa-cloud-upload-alt"></i>
            <p>No video uploaded</p>
            <span class="upload-hint">Click settings to upload a video</span>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  <!-- Inline Controls -->
  <div class="inline-controls">
    <button class="control-button mode-toggle" onclick={toggleMode}>
      <i class="fas {modeIcon}"></i>
      <span>{modeLabel} Mode</span>
    </button>

    {#if state.performanceSettings.mode === 'record'}
      <button
        class="control-button record-button"
        class:recording
        onclick={handleRecordToggle}
      >
        <i class="fas {recording ? 'fa-stop' : 'fa-circle'}"></i>
        <span>{recording ? 'Stop' : 'Record'}</span>
      </button>
    {/if}

    <button
      class="control-button settings-button"
      onclick={handleSettingsClick}
      aria-label="Performance video settings"
    >
      <i class="fas fa-cog"></i>
    </button>
  </div>
</div>

<style>
  .performance-preview {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 16px;
  }

  .preview-area {
    flex: 1;
    min-height: 0;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.02));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 12px;
    overflow: hidden;
    position: relative;
  }

  .camera-preview,
  .upload-preview {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .recording-indicator {
    position: absolute;
    top: 16px;
    left: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(220, 38, 38, 0.9);
    border-radius: 20px;
    font-size: var(--font-size-compact, 12px);
    font-weight: 600;
    color: white;
    z-index: 10;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .recording-indicator i {
    font-size: 10px;
    animation: blink 1s ease-in-out infinite;
  }

  @keyframes blink {
    0%,
    50%,
    100% {
      opacity: 1;
    }
    25%,
    75% {
      opacity: 0.3;
    }
  }

  @keyframes pulse {
    0%,
    100% {
      box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(220, 38, 38, 0);
    }
  }

  .placeholder-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .placeholder-preview i {
    font-size: 48px;
    opacity: 0.3;
  }

  .placeholder-preview p {
    font-size: var(--font-size-min, 14px);
    margin: 0;
    max-width: 200px;
    text-align: center;
    word-break: break-word;
  }

  .camera-label,
  .file-size,
  .upload-hint {
    font-size: var(--font-size-compact, 12px);
    padding: 4px 12px;
    background: var(--theme-accent, rgba(74, 158, 255, 0.2));
    border-radius: 12px;
  }

  .inline-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 12px;
    flex-wrap: wrap;
  }

  .control-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    font-size: var(--font-size-min, 14px);
    font-weight: 500;
    color: var(--theme-text, white);
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .control-button i {
    font-size: 16px;
  }

  .control-button:hover {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-accent, rgba(74, 158, 255, 0.5));
  }

  .control-button:focus-visible {
    outline: 2px solid var(--theme-accent, #4a9eff);
    outline-offset: 2px;
  }

  .mode-toggle {
    background: var(--theme-accent, #4a9eff);
    border-color: var(--theme-accent, #4a9eff);
  }

  .mode-toggle:hover {
    background: var(--theme-accent-hover, #3d8de6);
  }

  .record-button {
    background: rgba(220, 38, 38, 0.2);
    border-color: rgba(220, 38, 38, 0.5);
    color: rgb(252, 165, 165);
  }

  .record-button:hover {
    background: rgba(220, 38, 38, 0.3);
    border-color: rgba(220, 38, 38, 0.7);
  }

  .record-button.recording {
    background: rgb(220, 38, 38);
    border-color: rgb(220, 38, 38);
    color: white;
  }

  .settings-button {
    margin-left: auto;
  }

  /* Mobile optimization */
  @media (max-width: 600px) {
    .inline-controls {
      gap: 8px;
    }

    .control-button span {
      display: none;
    }

    .control-button {
      padding: 8px 12px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .control-button {
      transition: none;
    }

    .recording-indicator {
      animation: none !important;
    }

    .recording-indicator i {
      animation: none !important;
    }
  }
</style>
