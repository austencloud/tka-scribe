<!--
EditPresetModal.svelte - Modal for editing preset name and icon
Allows user to rename a preset and change its icon
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import type { GenerationPreset } from "../../state/preset.svelte";

  let {
    preset,
    onSave,
    onClose
  } = $props<{
    preset: GenerationPreset;
    onSave: (name: string, icon?: string) => void;
    onClose: () => void;
  }>();

  let hapticService: IHapticFeedbackService;
  let modalElement: HTMLElement;
  let nameInput: HTMLInputElement;

  let presetName = $state(preset.name);
  let selectedIcon = $state(preset.icon || "⚙️");

  const availableIcons = [
    "⚙️", "⭐", "🎯", "🔥", "💫", "✨",
    "🎪", "🎭", "🎨", "🌟", "💎", "🏆"
  ];

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);

    // Focus the name input
    nameInput?.focus();
    nameInput?.select(); // Select all text for easy editing

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  });

  function handleSave() {
    const trimmedName = presetName.trim();
    if (!trimmedName) {
      return;
    }

    hapticService?.trigger("selection");
    onSave(trimmedName, selectedIcon);
  }

  function selectIcon(icon: string) {
    hapticService?.trigger("selection");
    selectedIcon = icon;
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      onClose();
    } else if (event.key === "Enter" && presetName.trim()) {
      handleSave();
    }
  }

  const canSave = $derived(presetName.trim().length > 0 && (presetName !== preset.name || selectedIcon !== preset.icon));
</script>

<div
  class="modal-backdrop"
  onclick={handleBackdropClick}
  onkeydown={handleKeydown}
  bind:this={modalElement}
  tabindex="-1"
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <div class="modal-content">
    <div class="modal-header">
      <h2 id="modal-title">Edit Preset</h2>
      <button
        class="close-button"
        onclick={onClose}
        aria-label="Close modal"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div class="form-section">
      <label for="preset-name" class="form-label">Preset Name</label>
      <input
        id="preset-name"
        type="text"
        class="name-input"
        bind:value={presetName}
        bind:this={nameInput}
        placeholder="e.g., Diamond 16, My Practice Flow"
        maxlength="50"
      />
    </div>

    <div class="form-section">
      <div class="form-label">Icon</div>
      <div class="icon-grid" role="group" aria-label="Icon selection">
        {#each availableIcons as icon}
          <button
            class="icon-button"
            class:selected={selectedIcon === icon}
            onclick={() => selectIcon(icon)}
            aria-label={`Select icon ${icon}`}
          >
            {icon}
          </button>
        {/each}
      </div>
    </div>

    <div class="modal-actions">
      <button class="cancel-button" onclick={onClose}>
        Cancel
      </button>
      <button
        class="save-button"
        onclick={handleSave}
        disabled={!canSave}
      >
        Save Changes
      </button>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 16px;
  }

  .modal-content {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.15),
      rgba(255, 255, 255, 0.05)
    );
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 20px;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .modal-header h2 {
    color: white;
    font-size: 18px;
    font-weight: 700;
    margin: 0;
    line-height: 1.2;
  }

  .close-button {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    transition: all 0.2s ease;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .close-button svg {
    width: 100%;
    height: 100%;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-label {
    color: rgba(255, 255, 255, 0.9);
    font-size: 13px;
    font-weight: 600;
  }

  .name-input {
    width: 100%;
    padding: 10px 12px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-family: inherit;
    transition: all 0.2s ease;
  }

  .name-input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(0, 0, 0, 0.4);
  }

  .name-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .icon-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
  }

  .icon-button {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
  }

  .icon-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }

  .icon-button.selected {
    background: rgba(59, 130, 246, 0.3);
    border-color: rgba(59, 130, 246, 0.6);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    margin-top: 8px;
  }

  .cancel-button,
  .save-button {
    flex: 1;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .cancel-button {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .cancel-button:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .save-button {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
  }

  .save-button:hover:not(:disabled) {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .save-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
