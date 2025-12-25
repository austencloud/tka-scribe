<!--
  PerformanceSettings.svelte

  Settings content for performance video export format.
  Rendered inside SettingsPanel when user clicks gear icon.

  Features:
  - Record/Upload mode toggle
  - Camera selection (for record mode)
  - File upload (for upload mode)
  - Camera permissions handling

  Domain: Share Hub - Settings - Performance Video Format
-->
<script lang="ts">
  import { getShareHubState } from '../../state/share-hub-state.svelte';

  // FIX: Use 'hubState' instead of 'state' to avoid collision with $state rune
  const hubState = getShareHubState();
  let availableCameras = $state<MediaDeviceInfo[]>([]);
  let cameraPermissionGranted = $state(false);

  // TODO: Initialize camera list when component mounts
  // $effect(() => {
  //   initializeCameras();
  // });

  async function initializeCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      availableCameras = devices.filter((device) => device.kind === 'videoinput');
      cameraPermissionGranted = true;

      // Auto-select first camera if none selected
      const firstCamera = availableCameras[0];
      if (firstCamera && !hubState.performanceSettings.cameraId) {
        hubState.performanceSettings = { ...hubState.performanceSettings, cameraId: firstCamera.deviceId };
      }
    } catch (error) {
      console.error('Failed to enumerate cameras:', error);
      cameraPermissionGranted = false;
    }
  }

  function handleModeToggle() {
    const newMode = hubState.performanceSettings.mode === 'record' ? 'upload' : 'record';
    hubState.performanceSettings = { ...hubState.performanceSettings, mode: newMode };
  }

  function handleCameraSelect(event: Event) {
    const cameraId = (event.target as HTMLSelectElement).value;
    hubState.performanceSettings = { ...hubState.performanceSettings, cameraId };
  }

  function handleFileUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && file.type.startsWith('video/')) {
      hubState.performanceSettings = { ...hubState.performanceSettings, uploadedFile: file };
    }
  }

  function requestCameraPermission() {
    initializeCameras();
  }
</script>

<div class="performance-settings">
  <!-- Mode Toggle -->
  <div class="setting-group">
    <div class="setting-header">
      <span class="setting-label">
        <i class="fas fa-video"></i>
        Video Source
      </span>
    </div>
    <div class="mode-toggle-card">
      <button
        class="mode-option"
        class:active={hubState.performanceSettings.mode === 'record'}
        onclick={handleModeToggle}
      >
        <i class="fas fa-video"></i>
        <div>
          <span class="mode-title">Record Live</span>
          <span class="mode-description">Capture performance with your camera</span>
        </div>
      </button>
      <button
        class="mode-option"
        class:active={hubState.performanceSettings.mode === 'upload'}
        onclick={handleModeToggle}
      >
        <i class="fas fa-cloud-upload-alt"></i>
        <div>
          <span class="mode-title">Upload Video</span>
          <span class="mode-description">Use a pre-recorded video file</span>
        </div>
      </button>
    </div>
  </div>

  <!-- Record Mode Settings -->
  {#if hubState.performanceSettings.mode === 'record'}
    <div class="setting-group">
      <div class="setting-header">
        <label for="camera-select">
          <i class="fas fa-camera"></i>
          Camera Selection
        </label>
      </div>

      {#if !cameraPermissionGranted}
        <div class="permission-prompt">
          <i class="fas fa-exclamation-circle"></i>
          <p>Camera access required to record performance video</p>
          <button class="permission-button" onclick={requestCameraPermission}>
            <i class="fas fa-video"></i>
            Grant Camera Access
          </button>
        </div>
      {:else if availableCameras.length === 0}
        <div class="no-cameras-message">
          <i class="fas fa-video-slash"></i>
          <p>No cameras detected</p>
        </div>
      {:else}
        <select
          id="camera-select"
          class="camera-select"
          value={hubState.performanceSettings.cameraId || ''}
          onchange={handleCameraSelect}
        >
          {#each availableCameras as camera}
            <option value={camera.deviceId}>
              {camera.label || `Camera ${availableCameras.indexOf(camera) + 1}`}
            </option>
          {/each}
        </select>
      {/if}
    </div>
  {/if}

  <!-- Upload Mode Settings -->
  {#if hubState.performanceSettings.mode === 'upload'}
    <div class="setting-group">
      <div class="setting-header">
        <label for="file-upload">
          <i class="fas fa-file-video"></i>
          Upload Video File
        </label>
      </div>

      <label for="file-upload" class="upload-area">
        <input
          id="file-upload"
          type="file"
          accept="video/*"
          onchange={handleFileUpload}
          style="display: none;"
        />
        {#if hubState.performanceSettings.uploadedFile}
          <div class="uploaded-file-info">
            <i class="fas fa-check-circle"></i>
            <div>
              <p class="file-name">{hubState.performanceSettings.uploadedFile.name}</p>
              <p class="file-size">
                {(hubState.performanceSettings.uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        {:else}
          <i class="fas fa-cloud-upload-alt"></i>
          <p>Click to upload video</p>
          <span class="upload-hint">MP4, WebM, or MOV files accepted</span>
        {/if}
      </label>
    </div>
  {/if}
</div>

<style>
  .performance-settings {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .setting-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .setting-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .setting-header label,
  .setting-header .setting-label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: var(--font-size-min, 14px);
    font-weight: 600;
    color: var(--theme-text, white);
  }

  .setting-header i {
    font-size: 16px;
    opacity: 0.7;
  }

  .mode-toggle-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .mode-option {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .mode-option i {
    font-size: 24px;
    opacity: 0.6;
  }

  .mode-option > div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .mode-title {
    font-size: var(--font-size-min, 14px);
    font-weight: 600;
    color: var(--theme-text, white);
  }

  .mode-description {
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
  }

  .mode-option:hover {
    border-color: var(--theme-accent, rgba(74, 158, 255, 0.5));
    transform: translateY(-2px);
  }

  .mode-option:focus-visible {
    outline: 2px solid var(--theme-accent, #4a9eff);
    outline-offset: 2px;
  }

  .mode-option.active {
    background: var(--theme-accent, rgba(74, 158, 255, 0.2));
    border-color: var(--theme-accent, #4a9eff);
  }

  .mode-option.active i {
    opacity: 1;
    color: var(--theme-accent, #4a9eff);
  }

  .camera-select {
    width: 100%;
    padding: 12px 14px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    font-size: var(--font-size-min, 14px);
    color: var(--theme-text, white);
    font-family: inherit;
    cursor: pointer;
    transition: border-color 0.2s ease;
  }

  .camera-select:hover {
    border-color: var(--theme-accent, rgba(74, 158, 255, 0.5));
  }

  .camera-select:focus {
    outline: none;
    border-color: var(--theme-accent, #4a9eff);
  }

  .permission-prompt,
  .no-cameras-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 24px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1.5px dashed var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 12px;
    text-align: center;
  }

  .permission-prompt i,
  .no-cameras-message i {
    font-size: 32px;
    opacity: 0.5;
  }

  .permission-prompt p,
  .no-cameras-message p {
    margin: 0;
    font-size: var(--font-size-min, 14px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
  }

  .permission-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: var(--theme-accent, #4a9eff);
    border: none;
    border-radius: 8px;
    font-size: var(--font-size-min, 14px);
    font-weight: 600;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .permission-button:hover {
    background: var(--theme-accent-hover, #3d8de6);
    transform: translateY(-2px);
  }

  .upload-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    min-height: 150px;
    padding: 24px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 2px dashed var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .upload-area:hover {
    border-color: var(--theme-accent, rgba(74, 158, 255, 0.5));
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.06));
  }

  .upload-area i {
    font-size: 48px;
    opacity: 0.4;
  }

  .upload-area p {
    margin: 0;
    font-size: var(--font-size-min, 14px);
    color: var(--theme-text, white);
    font-weight: 500;
  }

  .upload-hint {
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .uploaded-file-info {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .uploaded-file-info i {
    font-size: 32px;
    color: var(--theme-accent, #4a9eff);
    opacity: 1;
  }

  .uploaded-file-info > div {
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-align: left;
  }

  .file-name {
    margin: 0;
    font-size: var(--font-size-min, 14px);
    color: var(--theme-text, white);
    font-weight: 600;
    word-break: break-word;
  }

  .file-size {
    margin: 0;
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
  }

  /* Mobile optimization */
  @media (max-width: 600px) {
    .performance-settings {
      gap: 20px;
    }

    .mode-option {
      padding: 14px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .mode-option,
    .permission-button {
      transition: none;
    }

    .mode-option:hover,
    .permission-button:hover {
      transform: none;
    }
  }
</style>
