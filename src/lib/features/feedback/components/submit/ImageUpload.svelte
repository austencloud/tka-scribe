<!-- ImageUpload - Upload and preview images for feedback -->
<script lang="ts">
  import { onMount } from "svelte";

  // Props
  const {
    images = $bindable([]),
    maxImages = 5,
    disabled = false,
  } = $props<{
    images?: File[];
    maxImages?: number;
    disabled?: boolean;
  }>();

  let fileInput: HTMLInputElement;
  let isDragging = $state(false);
  let previews = $state<{ file: File; url: string }[]>([]);

  // Track previous URLs for cleanup
  let previousUrls: string[] = [];

  // Generate previews when images change
  $effect(() => {
    // Clean up old previews
    previousUrls.forEach(url => URL.revokeObjectURL(url));

    // Generate new previews
    const newPreviews = images.map(file => ({
      file,
      url: URL.createObjectURL(file),
    }));

    // Store URLs for next cleanup
    previousUrls = newPreviews.map(p => p.url);

    // Update previews
    previews = newPreviews;

    // Clean up on unmount
    return () => {
      previousUrls.forEach(url => URL.revokeObjectURL(url));
    };
  });

  // Handle file selection
  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      addFiles(Array.from(target.files));
      target.value = ""; // Reset input
    }
  }

  // Handle drag and drop
  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragging = false;

    if (disabled) return;

    const files = event.dataTransfer?.files;
    if (files) {
      addFiles(Array.from(files));
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    if (!disabled) {
      isDragging = true;
    }
  }

  function handleDragLeave() {
    isDragging = false;
  }

  // Handle clipboard paste
  function handlePaste(event: ClipboardEvent) {
    if (disabled) return;

    const items = event.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      event.preventDefault();
      addFiles(imageFiles);
    }
  }

  // Add files to the list
  function addFiles(newFiles: File[]) {
    const imageFiles = newFiles.filter(file => file.type.startsWith("image/"));
    const remainingSlots = maxImages - images.length;
    const filesToAdd = imageFiles.slice(0, remainingSlots);

    // Mutate in place to work with $bindable
    images.push(...filesToAdd);
  }

  // Remove a file
  function removeImage(index: number) {
    // Mutate in place to work with $bindable
    images.splice(index, 1);
  }

  // Set up paste listener
  onMount(() => {
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  });
</script>

<div class="image-upload">
  <!-- Compact upload button -->
  {#if images.length < maxImages}
    <div
      class="upload-zone"
      class:dragging={isDragging}
      class:disabled
      ondrop={handleDrop}
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
    >
      <button
        type="button"
        class="upload-button"
        onclick={() => !disabled && fileInput.click()}
        disabled={disabled}
      >
        <i class="fas fa-paperclip"></i>
        <span>Attach image</span>
      </button>
      <span class="upload-hint">or paste screenshot ({maxImages - images.length} slots)</span>
    </div>
    <input
      type="file"
      bind:this={fileInput}
      onchange={handleFileSelect}
      accept="image/*"
      multiple
      disabled={disabled}
      style="display: none;"
    />
  {/if}

  <!-- Previews -->
  {#if previews.length > 0}
    <div class="previews">
      {#each previews as { file, url }, index}
        <div class="preview-item">
          <img src={url} alt={file.name} />
          <button
            type="button"
            class="remove-btn"
            onclick={() => removeImage(index)}
            disabled={disabled}
            aria-label="Remove image"
          >
            <i class="fas fa-times"></i>
          </button>
          <div class="preview-name">{file.name}</div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .image-upload {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .upload-zone {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    transition: all 200ms ease;
  }

  .upload-zone.dragging {
    border-color: #6366f1;
    background: rgba(99, 102, 241, 0.1);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }

  .upload-zone.disabled {
    opacity: 0.5;
  }

  .upload-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 150ms ease;
    white-space: nowrap;
  }

  .upload-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .upload-button:disabled {
    cursor: not-allowed;
  }

  .upload-button i {
    font-size: 0.75rem;
  }

  .upload-hint {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
    white-space: nowrap;
  }

  .previews {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .preview-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .preview-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .remove-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: rgba(0, 0, 0, 0.7);
    border: none;
    border-radius: 50%;
    color: white;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 150ms ease;
  }

  .remove-btn:hover:not(:disabled) {
    background: #ef4444;
    transform: scale(1.1);
  }

  .remove-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .preview-name {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 4px 8px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.6875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
