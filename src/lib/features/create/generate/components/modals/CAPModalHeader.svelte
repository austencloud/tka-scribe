<!--
CAPModalHeader.svelte - Modal header with centered title for CAP Selection Modal
Uses grid layout for perfect centering with multi-select toggle
-->
<script lang="ts">
  let { title, isMultiSelectMode, onToggleMultiSelect, onClose } = $props<{
    title: string;
    isMultiSelectMode: boolean;
    onToggleMultiSelect: () => void;
    onClose: () => void;
  }>();
</script>

<div class="cap-modal-header">
  <button
    class="multi-select-toggle"
    class:active={isMultiSelectMode}
    onclick={onToggleMultiSelect}
    aria-label={isMultiSelectMode
      ? "Exit multi-select mode"
      : "Enter multi-select mode"}
    title={isMultiSelectMode ? "Single Select" : "Multi-Select"}
  >
    {#if isMultiSelectMode}
      <!-- Multi-select mode: Multiple checkboxes (some checked) -->
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <!-- Top-left checkbox (checked) -->
        <rect x="3" y="3" width="8" height="8" rx="1.5" fill="currentColor"
        ></rect>
        <polyline
          points="5,7 7,9 11,5"
          stroke="white"
          stroke-width="1.5"
          fill="none"
        ></polyline>

        <!-- Top-right checkbox (checked) -->
        <rect x="13" y="3" width="8" height="8" rx="1.5" fill="currentColor"
        ></rect>
        <polyline
          points="15,7 17,9 21,5"
          stroke="white"
          stroke-width="1.5"
          fill="none"
        ></polyline>

        <!-- Bottom-left checkbox (unchecked) -->
        <rect x="3" y="13" width="8" height="8" rx="1.5"></rect>

        <!-- Bottom-right checkbox (unchecked) -->
        <rect x="13" y="13" width="8" height="8" rx="1.5"></rect>
      </svg>
    {:else}
      <!-- Single-select mode: One checkbox (unchecked) -->
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
      >
        <rect x="6" y="6" width="12" height="12" rx="2"></rect>
      </svg>
    {/if}
  </button>

  <h2 id="cap-title">{title}</h2>

  <button
    class="cap-modal-close-button"
    onclick={onClose}
    aria-label="Close CAP selection"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  </button>
</div>

<style>
  .cap-modal-header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    min-height: var(--min-touch-target);
  }

  .cap-modal-header h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    text-align: center;
    white-space: nowrap;
    letter-spacing: 0.5px;
    color: var(--theme-text, white);

    /* Clean text shadow for legibility on rainbow background */
    text-shadow:
      0 2px 8px color-mix(in srgb, var(--theme-shadow, #000) 60%, transparent),
      0 4px 16px color-mix(in srgb, var(--theme-shadow, #000) 40%, transparent);
  }

  @container cap-modal (min-width: 400px) {
    .cap-modal-header h2 {
      font-size: 22px;
    }
  }

  .multi-select-toggle {
    background: var(--theme-shadow, rgba(0, 0, 0, 0.3));
    border: 2px solid var(--theme-stroke-strong, rgba(255, 255, 255, 0.3));
    border-radius: 50%;
    color: var(--theme-text, white);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    padding: 10px;
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    flex-shrink: 0;
  }

  .multi-select-toggle:hover {
    background: color-mix(in srgb, var(--theme-shadow, #000) 50%, transparent);
    border-color: color-mix(in srgb, var(--theme-text, #fff) 50%, transparent);
    transform: scale(1.08);
  }

  .multi-select-toggle.active {
    background: color-mix(
      in srgb,
      var(--theme-accent-strong, #8b5cf6) 40%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent-strong, #8b5cf6) 80%,
      transparent
    );
    box-shadow: 0 0 16px
      color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 60%, transparent);
  }

  .multi-select-toggle.active:hover {
    background: color-mix(
      in srgb,
      var(--theme-accent-strong, #8b5cf6) 50%,
      transparent
    );
    border-color: var(--theme-accent-strong, #8b5cf6);
  }

  .multi-select-toggle svg {
    width: 75%;
    height: 75%;
  }

  .cap-modal-close-button {
    background: var(--theme-shadow, rgba(0, 0, 0, 0.3));
    border: none;
    border-radius: 50%;
    color: var(--theme-text, white);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    padding: 10px;
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    flex-shrink: 0;
  }

  .cap-modal-close-button:hover {
    background: color-mix(in srgb, var(--theme-shadow, #000) 50%, transparent);
    transform: scale(1.08);
  }

  .cap-modal-close-button svg {
    width: 65%;
    height: 65%;
  }
</style>
