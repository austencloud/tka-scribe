# Share Hub - Export Integration Guide

## Overview

This guide documents how to wire the unified Share Hub panel to actual export services. The UI is complete; this connects it to the rendering and upload pipeline.

**Current Status:** UI complete, export services not yet connected
**Files to modify:** Primarily `ShareHubCoordinator.svelte` and preview components

---

## Export Flow

### Unified Flow (All Formats)

```
User selects mode & format
     ↓
User clicks Export button
     ↓
ShareHubCoordinator.handleExport(mode, format)
     ↓
Check: Is sequence saved?
     ↓
   No → Open SaveToLibraryPanel
     ↓       ↓
     ↓   User saves sequence
     ↓       ↓
     ↓   Return to handleExport
     ↓
   Yes → performExport(mode, format)
     ↓
[Export service handles rendering/upload]
     ↓
Success/Error feedback
     ↓
Close Share Hub (on success)
```

---

## Integration Points

### 1. ShareHubCoordinator.svelte

**Location:** `src/lib/features/create/shared/components/coordinators/ShareHubCoordinator.svelte:74-80`

**Current Code:**
```typescript
async function performExport(mode: 'single' | 'composite', format?: string) {
  console.log("📱 ShareHubCoordinator: Performing export", { mode, format });
  // TODO: Wire to actual export services
  // - VideoExportOrchestrator for animation/composite
  // - ImageCompositionService for static
  // - Firebase upload service for performance video
  hapticService?.trigger("success");
}
```

**Required Changes:**

```typescript
async function performExport(mode: 'single' | 'composite', format?: string) {
  console.log("📱 ShareHubCoordinator: Performing export", { mode, format });

  try {
    if (mode === 'single') {
      switch (format) {
        case 'animation':
          await exportAnimation();
          break;
        case 'static':
          await exportStatic();
          break;
        case 'performance':
          await exportPerformance();
          break;
      }
    } else {
      await exportComposite();
    }

    hapticService?.trigger("success");
    panelState.closeShareHubPanel(); // Close on success
  } catch (error) {
    console.error("📱 ShareHubCoordinator: Export failed", error);
    hapticService?.trigger("error");
    // TODO: Show error toast to user
  }
}
```

---

## Single Media Export Integration

### Animation Export

**Service:** `VideoExportOrchestrator`
**State Access:** `state.animationSettings` (fps, loopCount, showOverlays)

**Implementation:**

```typescript
import type { IVideoExportOrchestrator } from '$lib/features/compose/services/contracts/IVideoExportOrchestrator';
import { TYPES } from '$lib/shared/inversify/types';

// Resolve service (in script setup)
const videoExportOrchestrator = resolve<IVideoExportOrchestrator>(TYPES.IVideoExportOrchestrator);

async function exportAnimation() {
  const settings = /* TODO: Get from ShareHubPanel state */;

  await videoExportOrchestrator.exportAnimation({
    sequence: currentSequence,
    fps: settings.fps,
    loopCount: settings.loopCount,
    showOverlays: settings.showOverlays,
    format: 'mp4' // or 'webm'
  });
}
```

**Challenge:** Accessing Share Hub state from coordinator

**Solution Options:**
1. Pass state as prop from `ShareHubPanel` → `ShareHubDrawer` → `ShareHubCoordinator`
2. Create shared state outside component (not recommended)
3. Refactor: Move export logic into `ShareHubPanel.svelte` itself

**Recommended:** Option 3 - Keep export logic in `ShareHubPanel`, pass result to coordinator

### Static Image Export

**Service:** `ImageCompositionService`
**State Access:** `state.staticSettings` (width, height, quality, background)

**Implementation:**

```typescript
import type { IImageCompositionService } from '$lib/shared/render/services/contracts/IImageCompositionService';

const imageCompositionService = resolve<IImageCompositionService>(TYPES.IImageCompositionService);

async function exportStatic() {
  const settings = /* TODO: Get from ShareHubPanel state */;

  const canvas = await imageCompositionService.renderSequence({
    sequence: currentSequence,
    width: settings.width,
    height: settings.height,
    background: settings.background
  });

  // Convert to blob and download
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSequence.title || 'sequence'}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png', settings.quality / 100);
}
```

### Performance Video Export

**Service:** Firebase Storage upload
**State Access:** `state.performanceSettings` (mode, cameraId, uploadedFile)

**Implementation:**

```typescript
import type { IFirebaseVideoUploader } from '$lib/shared/share/services/contracts/IFirebaseVideoUploader';

const videoUploadService = resolve<IFirebaseVideoUploader>(TYPES.IFirebaseVideoUploader);

async function exportPerformance() {
  const settings = /* TODO: Get from ShareHubPanel state */;

  let videoBlob: Blob;

  if (settings.mode === 'record') {
    // Use recorded video from PerformancePreview component
    // TODO: Get blob from video recorder
    videoBlob = /* ... */;
  } else {
    // Use uploaded file
    videoBlob = settings.uploadedFile;
  }

  const downloadUrl = await videoUploadService.uploadVideo({
    sequenceId: currentSequence.id,
    videoBlob,
    metadata: {
      format: 'performance',
      timestamp: Date.now()
    }
  });

  console.log("Video uploaded:", downloadUrl);
  // TODO: Optionally save URL to sequence document
}
```

---

## Composite Export Integration

### Composite Video Export

**Service:** `CompositeVideoRenderer`
**State Access:** `state.compositeLayout`, format-specific settings

**Implementation:**

```typescript
import type { ICompositeVideoRenderer } from '$lib/features/compose/services/contracts/ICompositeVideoRenderer';

const compositeVideoRenderer = resolve<ICompositeVideoRenderer>(TYPES.ICompositeVideoRenderer);

async function exportComposite() {
  const layout = /* TODO: Get from ShareHubPanel state */;
  const animationSettings = /* ... */;
  const staticSettings = /* ... */;

  await compositeVideoRenderer.initialize(currentSequence, layout, {
    gridBeatSize: 100 // or from settings
  });

  // Cache static pieces (grid, static image)
  await compositeVideoRenderer.cacheStaticPieces();

  // Render each frame
  const frameCount = currentSequence.beats.length * animationSettings.fps;
  for (let frame = 0; frame < frameCount; frame++) {
    const piece1Canvas = /* render animation/static frame */;
    const piece2Canvas = /* render grid/performance frame */;

    await compositeVideoRenderer.renderCompositeFrame(
      piece1Canvas,
      piece2Canvas,
      Math.floor(frame / animationSettings.fps),
      targetCanvas
    );
  }

  // Encode to video using WebCodecs or WASM
  await videoExportOrchestrator.encodeVideo(frames, {
    fps: animationSettings.fps,
    format: 'mp4'
  });
}
```

---

## Preview Component Integration

### AnimationPreview.svelte

**Location:** `src/lib/shared/share-hub/components/single-media/AnimationPreview.svelte`

**Current:** Placeholder preview with play/pause controls

**TODO:**
1. Import `AnimationCanvas` from compose module
2. Wire play/pause button to animation playback
3. Display current beat indicator
4. Sync with `state.animationSettings`

**Implementation:**

```svelte
<script lang="ts">
  import AnimationCanvas from '$lib/features/compose/components/canvas/AnimationCanvas.svelte';

  // ... existing props

  let animationController: any; // TODO: Type from AnimationCanvas

  function togglePlay() {
    if (playing) {
      animationController?.pause();
    } else {
      animationController?.play();
    }
    playing = !playing;
  }
</script>

<div class="preview-canvas">
  <AnimationCanvas
    sequence={/* get from context */}
    fps={state.animationSettings.fps}
    loopCount={state.animationSettings.loopCount}
    onBeatChange={(beat) => currentBeat = beat}
    bind:controller={animationController}
  />
</div>
```

### StaticPreview.svelte

**Location:** `src/lib/shared/share-hub/components/single-media/StaticPreview.svelte`

**Current:** Placeholder preview with dimension/quality display

**TODO:**
1. Import `ImageCompositionService`
2. Render static image with current settings
3. Update preview when settings change

**Implementation:**

```svelte
<script lang="ts">
  import { resolve } from '$lib/shared/inversify/di';
  import type { IImageCompositionService } from '...';

  const imageService = resolve<IImageCompositionService>(TYPES.IImageCompositionService);

  let previewCanvas: HTMLCanvasElement;

  // Re-render when settings change
  $effect(() => {
    if (previewCanvas) {
      renderPreview();
    }
  });

  async function renderPreview() {
    const canvas = await imageService.renderSequence({
      sequence: /* get from context */,
      width: state.staticSettings.width,
      height: state.staticSettings.height,
      background: state.staticSettings.background
    });

    // Draw to preview canvas (scaled down for preview)
    const ctx = previewCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0, previewCanvas.width, previewCanvas.height);
  }
</script>

<canvas bind:this={previewCanvas} class="preview-canvas"></canvas>
```

### PerformancePreview.svelte

**Location:** `src/lib/shared/share-hub/components/single-media/PerformancePreview.svelte`

**Current:** Placeholder with record/upload toggle

**TODO:**
1. Implement camera feed using MediaDevices API
2. Implement video recording using MediaRecorder
3. Store recorded blob in state
4. Preview uploaded video file

**Implementation:**

```svelte
<script lang="ts">
  let videoElement: HTMLVideoElement;
  let mediaStream: MediaStream | null = null;
  let mediaRecorder: MediaRecorder | null = null;
  let recordedChunks: Blob[] = [];

  // Initialize camera feed
  async function startCameraFeed() {
    if (!state.performanceSettings.cameraId) return;

    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: state.performanceSettings.cameraId },
      audio: true
    });

    if (videoElement) {
      videoElement.srcObject = mediaStream;
    }
  }

  // Start recording
  function handleRecordToggle() {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  function startRecording() {
    if (!mediaStream) return;

    recordedChunks = [];
    mediaRecorder = new MediaRecorder(mediaStream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      state.updatePerformanceSettings({ uploadedFile: blob });
    };

    mediaRecorder.start();
    recording = true;
  }

  function stopRecording() {
    mediaRecorder?.stop();
    recording = false;
  }

  // Cleanup on unmount
  $effect(() => {
    return () => {
      mediaStream?.getTracks().forEach(track => track.stop());
    };
  });
</script>

<video bind:this={videoElement} autoplay muted playsinline></video>
```

---

## Composite Piece Rendering

### MediaPieceCard.svelte

**Location:** `src/lib/shared/share-hub/components/composite/MediaPieceCard.svelte`

**Current:** Placeholder previews for all formats

**TODO:** Replace placeholders with actual rendering

**Implementation:**

```svelte
{#if format === 'animation'}
  <AnimationCanvas {sequence} settings={state.animationSettings} />
{:else if format === 'static'}
  <canvas bind:this={staticCanvas}></canvas>
  <!-- Render static image to canvas using ImageCompositionService -->
{:else if format === 'grid'}
  <GridCanvas {sequence} />
{:else if format === 'performance'}
  <video bind:this={videoElement}></video>
  <!-- Show camera feed or uploaded video -->
{/if}
```

---

## State Sharing Between Components

### Problem

`ShareHubPanel.svelte` creates state internally, but `ShareHubCoordinator.svelte` needs access to settings for export.

### Solution Options

**Option 1: Context API** (Recommended)
```typescript
// ShareHubPanel.svelte
import { setContext } from 'svelte';

const state = createShareHubState();
setContext('shareHubState', state);

// ShareHubCoordinator.svelte
import { getContext } from 'svelte';

const state = getContext('shareHubState');
```

**Option 2: Event-based** (simpler)
```typescript
// ShareHubPanel.svelte
async function handleExport() {
  const exportData = {
    mode: state.mode,
    format: state.selectedFormat,
    settings: {
      animation: state.animationSettings,
      static: state.staticSettings,
      performance: state.performanceSettings,
      composite: state.compositeLayout
    }
  };

  await onExport?.(exportData);
}

// ShareHubCoordinator.svelte
async function handleExport(exportData) {
  // Now has access to all settings
  await performExport(exportData);
}
```

**Option 3: Lift state up**
```typescript
// ShareHubCoordinator.svelte creates state, passes to ShareHubPanel
const state = createShareHubState();

<ShareHubPanel {state} onExport={handleExport} />
```

**Recommended:** Option 2 (Event-based) - Keeps state encapsulated in panel, passes data only when needed

---

## Service Resolution

### Required Services

All services should be resolved in `ShareHubCoordinator.svelte`:

```typescript
import { resolve } from '$lib/shared/inversify/di';
import { TYPES } from '$lib/shared/inversify/types';

// Video export
const videoExportOrchestrator = resolve<IVideoExportOrchestrator>(
  TYPES.IVideoExportOrchestrator
);

// Image export
const imageCompositionService = resolve<IImageCompositionService>(
  TYPES.IImageCompositionService
);

// Firebase uploads
const videoUploadService = resolve<IFirebaseVideoUploader>(
  TYPES.IFirebaseVideoUploader
);

// Composite rendering
const compositeVideoRenderer = resolve<ICompositeVideoRenderer>(
  TYPES.ICompositeVideoRenderer
);
```

### Type Registration

Ensure all services are registered in inversify container:

**File:** `src/lib/shared/inversify/types.ts`
**File:** `src/lib/shared/inversify/modules/*.module.ts`

---

## Error Handling

### Export Errors

```typescript
async function performExport(exportData) {
  try {
    // ... export logic

    hapticService?.trigger("success");
    showSuccessToast("Export complete!");
    panelState.closeShareHubPanel();
  } catch (error) {
    console.error("Export failed:", error);
    hapticService?.trigger("error");

    // Show user-friendly error message
    if (error.message.includes('storage quota')) {
      showErrorToast("Not enough storage space");
    } else if (error.message.includes('permission')) {
      showErrorToast("Permission denied");
    } else {
      showErrorToast("Export failed. Please try again.");
    }
  }
}
```

### Validation

**Before export:**
```typescript
function validateExportRequest(exportData) {
  if (exportData.mode === 'single') {
    if (!exportData.format) {
      throw new Error("No format selected");
    }

    if (exportData.format === 'performance') {
      if (exportData.settings.performance.mode === 'upload' &&
          !exportData.settings.performance.uploadedFile) {
        throw new Error("No video file uploaded");
      }
    }
  }

  if (exportData.mode === 'composite') {
    // Validate composite settings
  }
}
```

---

## Testing Checklist

### Unit Tests

- [ ] `performExport()` calls correct service based on mode/format
- [ ] Settings are passed correctly to export services
- [ ] Error handling works (network, storage, permission errors)
- [ ] SaveToLibraryPanel flow works when sequence not saved

### Integration Tests

- [ ] Animation export produces valid MP4/WebM file
- [ ] Static export produces valid PNG with correct dimensions
- [ ] Performance video upload succeeds
- [ ] Composite export combines pieces correctly
- [ ] Orientation (horizontal/vertical) renders correctly in composite

### Manual Testing

- [ ] Export all Single Media formats (animation, static, performance)
- [ ] Export all Composite combinations (animation+grid, static+performance, etc.)
- [ ] Test with unsaved sequence (SaveToLibraryPanel appears)
- [ ] Test with saved sequence (export proceeds directly)
- [ ] Test camera permissions (record mode)
- [ ] Test file upload (upload mode)
- [ ] Test on mobile device
- [ ] Test on slow network (performance video upload)

---

## Performance Optimization

### Large Exports

**Problem:** Exporting long sequences or high-resolution composites may freeze UI

**Solution:** Move export to Web Worker
```typescript
const exportWorker = new Worker('/workers/export-worker.js');

exportWorker.postMessage({
  type: 'exportAnimation',
  data: { sequence, settings }
});

exportWorker.onmessage = (event) => {
  if (event.data.type === 'progress') {
    updateProgress(event.data.progress);
  } else if (event.data.type === 'complete') {
    downloadFile(event.data.blob);
  }
};
```

### Preview Rendering

**Problem:** Re-rendering preview on every setting change is expensive

**Solution:** Debounce preview updates
```typescript
import { debounce } from '$lib/shared/utils/debounce';

const updatePreview = debounce(() => {
  renderPreview();
}, 300);

$effect(() => {
  // Watch settings
  state.staticSettings.width;
  state.staticSettings.height;

  updatePreview();
});
```

---

## Summary

**Key Integration Points:**
1. ✅ UI complete, settings accessible via state
2. 🔄 Wire `performExport()` in ShareHubCoordinator
3. 🔄 Replace placeholder previews with actual rendering
4. 🔄 Implement camera recording in PerformancePreview
5. 🔄 Connect to existing export services

**Recommended Approach:**
1. Start with Static export (simplest - single canvas render)
2. Then Animation export (reuse existing AnimationCanvas)
3. Then Performance export (camera + upload logic)
4. Finally Composite export (most complex)

**Estimated Effort:**
- Static: 2-4 hours
- Animation: 4-6 hours
- Performance: 6-8 hours (camera/recording complexity)
- Composite: 8-12 hours (dual rendering + encoding)

**Total:** 20-30 hours for complete export integration
