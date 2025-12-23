<!--
  PerformanceVideoFormatPanel.svelte

  Upload new performance videos or select from existing videos.
  Two modes: "Upload New" | "Select Existing"

  TODO Phase 3:
  - Integrate VideoUploadSheet for upload mode
  - Integrate CollaborativeVideoService for fetching existing videos
  - Implement video grid display
  - Wire up share/download actions
-->
<script lang="ts">
  import type { SequenceData } from '$lib/shared/foundation/domain/models/SequenceData';

  let {
    sequence,
  }: {
    sequence: SequenceData;
  } = $props();

  type ViewMode = 'upload' | 'select';
  let viewMode = $state<ViewMode>('upload');

  // Upload state
  let selectedFile = $state<File | null>(null);
  let previewUrl = $state<string | null>(null);

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && file.type.startsWith('video/')) {
      selectedFile = file;
      previewUrl = URL.createObjectURL(file);
    }
  }

  function handleUpload() {
    if (!selectedFile) return;
    // TODO: Integrate video upload service
    console.log('Upload video:', selectedFile.name, 'for sequence:', sequence.word);
  }

  function clearSelection() {
    selectedFile = null;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }
  }
</script>

<div class="performance-video-panel">
  <!-- Mode Toggle -->
  <div class="mode-toggle">
    <button
      class="mode-button"
      class:active={viewMode === 'upload'}
      onclick={() => viewMode = 'upload'}
    >
      <i class="fas fa-cloud-upload-alt"></i>
      Upload New
    </button>
    <button
      class="mode-button"
      class:active={viewMode === 'select'}
      onclick={() => viewMode = 'select'}
    >
      <i class="fas fa-folder-open"></i>
      Select Existing
    </button>
  </div>

  {#if viewMode === 'upload'}
    <!-- Upload Mode -->
    <div class="upload-section">
      {#if !selectedFile}
        <!-- File Picker -->
        <label class="file-upload-area">
          <input
            type="file"
            accept="video/*"
            onchange={handleFileSelect}
            aria-label="Select video file to upload"
          />
          <div class="upload-prompt">
            <i class="fas fa-video"></i>
            <p class="upload-title">Upload Performance Video</p>
            <p class="upload-subtitle">Click to select a video file</p>
            <p class="upload-hint">MP4, WebM, or MOV</p>
          </div>
        </label>
      {:else}
        <!-- Video Preview -->
        <div class="preview-container">
          <div class="video-preview">
            {#if previewUrl}
              <!-- svelte-ignore a11y_media_has_caption -->
              <video src={previewUrl} controls></video>
            {/if}
          </div>

          <div class="file-info">
            <p class="file-name">{selectedFile.name}</p>
            <p class="file-size">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>

          <div class="upload-actions">
            <button class="secondary-button" onclick={clearSelection}>
              <i class="fas fa-times"></i>
              Change Video
            </button>
            <button class="primary-button" onclick={handleUpload}>
              <i class="fas fa-cloud-upload-alt"></i>
              Upload & Share
            </button>
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <!-- Select Existing Mode -->
    <div class="select-section">
      <div class="empty-state">
        <i class="fas fa-folder-open"></i>
        <p>Select Existing Videos</p>
        <p class="empty-note">Video library integration coming in Phase 3</p>
      </div>
    </div>
  {/if}
</div>

<style>
  .performance-video-panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    height: 100%;
    overflow-y: auto;
  }

  .mode-toggle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 4px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border-radius: 12px;
  }

  .mode-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 8px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: var(--font-size-min, 14px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .mode-button.active {
    background: var(--theme-accent, rgba(255, 255, 255, 0.1));
    border-color: var(--theme-stroke, rgba(255, 255, 255, 0.2));
    color: var(--theme-text, white);
  }

  .upload-section,
  .select-section {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .file-upload-area {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    padding: 40px 20px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border: 2px dashed var(--theme-stroke, rgba(255, 255, 255, 0.2));
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .file-upload-area:hover {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.05));
    border-color: var(--theme-accent, rgba(255, 255, 255, 0.3));
  }

  .file-upload-area input[type="file"] {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }

  .upload-prompt {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    pointer-events: none;
  }

  .upload-prompt i {
    font-size: 48px;
    color: var(--theme-accent, rgba(255, 255, 255, 0.4));
  }

  .upload-title {
    font-size: clamp(16px, 4cqi, 18px);
    font-weight: 700;
    color: var(--theme-text, white);
    margin: 0;
  }

  .upload-subtitle {
    font-size: var(--font-size-min, 14px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    margin: 0;
  }

  .upload-hint {
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    margin: 0;
  }

  .preview-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .video-preview {
    border-radius: 12px;
    overflow: hidden;
    background: black;
  }

  .video-preview video {
    width: 100%;
    height: auto;
    display: block;
  }

  .file-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .file-name {
    font-size: var(--font-size-min, 14px);
    font-weight: 600;
    color: var(--theme-text, white);
    margin: 0;
  }

  .file-size {
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    margin: 0;
  }

  .upload-actions {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 12px;
  }

  .secondary-button,
  .primary-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 20px;
    min-height: var(--touch-target-min, 48px);
    border: none;
    border-radius: 12px;
    font-size: var(--font-size-min, 14px);
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .secondary-button {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    color: var(--theme-text, white);
  }

  .secondary-button:hover {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.08));
  }

  .primary-button {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    color: white;
  }

  .primary-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(249, 115, 22, 0.3);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    gap: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .empty-state i {
    font-size: 48px;
  }

  .empty-state p {
    margin: 0;
    font-size: var(--font-size-min, 14px);
  }

  .empty-note {
    font-size: var(--font-size-compact, 12px) !important;
    font-style: italic;
  }

  /* Mobile responsive */
  @media (max-width: 600px) {
    .performance-video-panel {
      padding: 16px;
    }

    .upload-actions {
      grid-template-columns: 1fr;
    }
  }
</style>
