<!-- ActHeader.svelte - Act name, description, and music controls -->
<script lang="ts">
  import type { ActData } from "$wordcard/domain";

  // Props
  interface Props {
    act: ActData;
    disabled?: boolean;
    onActInfoChanged?: (name: string, description: string) => void;
    onMusicLoadRequested?: () => void;
  }

  let {
    act,
    disabled = false,
    onActInfoChanged,
    onMusicLoadRequested,
  }: Props = $props();

  // Local state for editing
  let nameInput = $state(act.name || "");
  let descriptionInput = $state(act.description || "");
  let isEditingName = $state(false);
  let isEditingDescription = $state(false);

  // Update inputs when act changes
  $effect(() => {
    nameInput = act.name || "";
    descriptionInput = act.description || "";
  });

  // Handle name editing
  function startEditingName() {
    if (disabled) return;
    isEditingName = true;
  }

  function finishEditingName() {
    isEditingName = false;
    if (nameInput !== act.name) {
      onActInfoChanged?.(nameInput, act.description || "");
    }
  }

  function handleNameKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      finishEditingName();
    } else if (event.key === "Escape") {
      nameInput = act.name || "";
      isEditingName = false;
    }
  }

  // Handle description editing
  function startEditingDescription() {
    if (disabled) return;
    isEditingDescription = true;
  }

  function finishEditingDescription() {
    isEditingDescription = false;
    if (descriptionInput !== act.description) {
      onActInfoChanged?.(act.name || "", descriptionInput);
    }
  }

  function handleDescriptionKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      finishEditingDescription();
    } else if (event.key === "Escape") {
      descriptionInput = act.description || "";
      isEditingDescription = false;
    }
  }

  // Handle music load request
  function handleMusicLoadClick() {
    if (disabled) return;
    onMusicLoadRequested?.();
  }
</script>

<div class="act-header" class:disabled>
  <!-- Act name section -->
  <div class="name-section">
    <div class="name-label">Act Name</div>
    {#if isEditingName}
      <input
        class="name-input editing"
        bind:value={nameInput}
        onblur={finishEditingName}
        onkeydown={handleNameKeydown}
        placeholder="Enter act name..."
      />
    {:else}
      <div
        class="name-display"
        class:empty={!nameInput}
        onclick={startEditingName}
        tabindex="0"
        role="button"
        onkeydown={(e) =>
          (e.key === "Enter" || e.key === " ") && startEditingName()}
      >
        {nameInput || "Untitled Act"}
      </div>
    {/if}
  </div>

  <!-- Act description section -->
  <div class="description-section">
    <div class="description-label">Description</div>
    {#if isEditingDescription}
      <textarea
        class="description-input editing"
        bind:value={descriptionInput}
        onblur={finishEditingDescription}
        onkeydown={handleDescriptionKeydown}
        placeholder="Enter act description..."
        rows="3"
      ></textarea>
    {:else}
      <div
        class="description-display"
        class:empty={!descriptionInput}
        onclick={startEditingDescription}
        tabindex="0"
        role="button"
        onkeydown={(e) =>
          (e.key === "Enter" || e.key === " ") && startEditingDescription()}
      >
        {descriptionInput || "Click to add description..."}
      </div>
    {/if}
  </div>

  <!-- Music section -->
  <div class="music-section">
    <div class="music-label">Music</div>
    <div class="music-controls">
      <button
        class="music-load-btn"
        onclick={handleMusicLoadClick}
        {disabled}
        title="Load music file for this act"
      >
        {#if act.musicFile}
          🎵 {act.musicFile.name}
        {:else}
          🎵 Load Music
        {/if}
      </button>
      {#if act.musicFile}
        <div class="music-info">
          <span class="music-duration">
            {act.musicFile.duration
              ? `${Math.floor(act.musicFile.duration / 60)}:${String(Math.floor(act.musicFile.duration % 60)).padStart(2, "0")}`
              : ""}
          </span>
        </div>
      {/if}
    </div>
  </div>

  <!-- Act stats -->
  <div class="stats-section">
    <div class="stat">
      <span class="stat-label">Sequences:</span>
      <span class="stat-value">{act.sequences?.length || 0}</span>
    </div>
    <div class="stat">
      <span class="stat-label">Duration:</span>
      <span class="stat-value">
        {act.musicFile?.duration
          ? `${Math.floor(act.musicFile.duration / 60)}:${String(Math.floor(act.musicFile.duration % 60)).padStart(2, "0")}`
          : "Unknown"}
      </span>
    </div>
  </div>
</div>

<style>
  .act-header {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all var(--transition-normal);
  }

  .act-header.disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  .name-section,
  .description-section,
  .music-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .name-label,
  .description-label,
  .music-label {
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .name-display,
  .description-display {
    padding: var(--spacing-sm);
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    transition: all var(--transition-fast);
    min-height: 24px;
    display: flex;
    align-items: center;
  }

  .name-display:hover,
  .description-display:hover {
    background: rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .name-display.empty,
  .description-display.empty {
    color: rgba(255, 255, 255, 0.5);
    font-style: italic;
  }

  .name-input,
  .description-input {
    padding: var(--spacing-sm);
    background: rgba(0, 0, 0, 0.5);
    border: 2px solid rgba(74, 144, 226, 0.8);
    border-radius: 4px;
    color: rgba(255, 255, 255, 0.9);
    font-size: var(--font-size-base);
    outline: none;
    transition: all var(--transition-fast);
  }

  .name-input.editing,
  .description-input.editing {
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.3);
  }

  .description-input {
    resize: vertical;
    min-height: 60px;
    font-family: inherit;
  }

  .music-controls {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .music-load-btn {
    padding: var(--spacing-sm) var(--spacing-md);
    background: rgba(74, 144, 226, 0.2);
    border: 1px solid rgba(74, 144, 226, 0.4);
    border-radius: 4px;
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: var(--font-size-sm);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }

  .music-load-btn:hover:not(:disabled) {
    background: rgba(74, 144, 226, 0.3);
    border-color: rgba(74, 144, 226, 0.6);
  }

  .music-load-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .music-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-sm);
    color: rgba(255, 255, 255, 0.6);
  }

  .stats-section {
    display: flex;
    gap: var(--spacing-lg);
    padding-top: var(--spacing-sm);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .stat {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
  }

  .stat-label {
    font-size: var(--font-size-sm);
    color: rgba(255, 255, 255, 0.6);
  }

  .stat-value {
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .act-header {
      padding: var(--spacing-md);
      gap: var(--spacing-sm);
    }

    .stats-section {
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .music-load-btn {
      max-width: 150px;
    }
  }

  @media (max-width: 480px) {
    .act-header {
      padding: var(--spacing-sm);
    }

    .music-controls {
      flex-direction: column;
      align-items: stretch;
    }

    .music-load-btn {
      max-width: none;
    }
  }
</style>
