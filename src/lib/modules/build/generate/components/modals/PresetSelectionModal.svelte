<!--
PresetSelectionModal.svelte - Modal for selecting saved generation presets
Displays user-saved presets with delete option and allows loading preset configuration
-->
<script lang="ts">
  import { CAP_TYPE_LABELS } from "$build/generate/circular";
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import type { GenerationPreset } from "../../state/preset.svelte";
  import { portal } from "./portal";

  let {
    presets,
    onPresetSelect,
    onPresetDelete,
    onPresetEdit,
    onClose
  } = $props<{
    presets: GenerationPreset[];
    onPresetSelect: (preset: GenerationPreset) => void;
    onPresetDelete: (presetId: string) => void;
    onPresetEdit: (preset: GenerationPreset) => void;
    onClose: () => void;
  }>();

  let hapticService: IHapticFeedbackService;
  let modalElement: HTMLElement;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);

    // Focus the modal for accessibility
    modalElement?.focus();

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  });

  function selectPreset(preset: GenerationPreset) {
    hapticService?.trigger("selection");
    onPresetSelect(preset);
  }

  function editPreset(preset: GenerationPreset, event: MouseEvent) {
    event.stopPropagation(); // Prevent triggering the preset selection
    hapticService?.trigger("selection");
    onPresetEdit(preset);
  }

  function deletePreset(presetId: string, event: MouseEvent) {
    event.stopPropagation(); // Prevent triggering the preset selection
    hapticService?.trigger("selection");
    onPresetDelete(presetId);
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      hapticService?.trigger("navigation");
      onClose();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      hapticService?.trigger("navigation");
      onClose();
    }
  }

  function handleClose() {
    hapticService?.trigger("navigation");
    onClose();
  }

  // Format config summary for display
  function getConfigSummary(preset: GenerationPreset): string {
    const { config } = preset;

    // Capitalize first letter of gridMode and mode to match CAP type labels
    const gridMode = config.gridMode.charAt(0).toUpperCase() + config.gridMode.slice(1);
    const mode = config.mode.charAt(0).toUpperCase() + config.mode.slice(1);

    const parts = [
      `${config.length} beats`,
      gridMode,
      mode,
      CAP_TYPE_LABELS[config.capType] || config.capType,
    ];

    if (config.turnIntensity > 0) {
      parts.push(`${config.turnIntensity}x turn${config.turnIntensity !== 1 ? 's' : ''}`);
    }

    return parts.join(" • ");
  }

  // Get level-based background color for preset item
  function getLevelBackgroundColor(level: number): string {
    switch (level) {
      case 1:
        // Beginner: Light blue
        return "rgba(186, 230, 253, 0.15)";
      case 2:
        // Intermediate: Silver gray
        return "rgba(148, 163, 184, 0.15)";
      case 3:
        // Advanced: Gold
        return "rgba(250, 204, 21, 0.15)";
      default:
        return "rgba(255, 255, 255, 0.05)";
    }
  }

  // Get level-based border color for preset item
  function getLevelBorderColor(level: number): string {
    switch (level) {
      case 1:
        // Beginner: Light blue
        return "rgba(56, 189, 248, 0.3)";
      case 2:
        // Intermediate: Silver gray
        return "rgba(100, 116, 139, 0.3)";
      case 3:
        // Advanced: Gold
        return "rgba(234, 179, 8, 0.3)";
      default:
        return "rgba(255, 255, 255, 0.1)";
    }
  }

  // Get icon or default
  function getPresetIcon(preset: GenerationPreset): string {
    return preset.icon || "⚙️";
  }
</script>

<div
  class="modal-backdrop"
  use:portal
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
      <h2 id="modal-title">⚙️ Load Preset</h2>
      <button
        class="close-button"
        onclick={handleClose}
        aria-label="Close modal"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    {#if presets.length === 0}
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <div class="empty-text">No saved presets yet</div>
        <div class="empty-hint">Save your current settings to create a preset</div>
      </div>
    {:else}
      <div class="preset-list">
        {#each presets as preset (preset.id)}
          <div class="preset-item-container">
            <button
              class="preset-item"
              style="background: {getLevelBackgroundColor(preset.config.level)}; border-color: {getLevelBorderColor(preset.config.level)};"
              onclick={() => selectPreset(preset)}
              aria-label={`Load preset ${preset.name}: ${getConfigSummary(preset)}`}
            >
              <div class="preset-icon">{getPresetIcon(preset)}</div>
              <div class="preset-info">
                <div class="preset-name">{preset.name}</div>
                <div class="preset-summary">{getConfigSummary(preset)}</div>
              </div>
            </button>
            <button
              class="edit-button"
              onclick={(e) => editPreset(preset, e)}
              aria-label={`Edit preset ${preset.name}`}
              title="Edit preset"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button
              class="delete-button"
              onclick={(e) => deletePreset(preset.id, e)}
              aria-label={`Delete preset ${preset.name}`}
              title="Delete preset"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    height: var(--actual-vh, 100vh);
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999;
    padding: max(16px, env(safe-area-inset-top, 16px))
      max(16px, env(safe-area-inset-right, 16px))
      max(16px, env(safe-area-inset-bottom, 16px))
      max(16px, env(safe-area-inset-left, 16px));
    animation: backdrop-appear 0.3s ease-out;
  }

  @keyframes backdrop-appear {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-content {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.05) 100%
    );
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    max-width: min(500px, 90vw);
    width: 100%;
    max-height: var(--modal-max-height, min(85dvh, calc(100dvh - 60px)));
    max-height: var(--modal-max-height, min(85vh, calc(100vh - 60px)));
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: modal-appear 0.3s ease-out;
    position: relative;
    margin: auto;
    flex-shrink: 0;
    box-sizing: border-box;
    padding-top: env(safe-area-inset-top, 0);
    padding-bottom: env(safe-area-inset-bottom, 0);
    padding-left: env(safe-area-inset-left, 0);
    padding-right: env(safe-area-inset-right, 0);
  }

  @keyframes modal-appear {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .modal-header h2 {
    color: white;
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    line-height: 1.2;
  }

  .close-button {
    background: none;
    border: none;
    color: var(--muted-foreground, #a3a3a3);
    font-size: 24px;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s ease;
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--foreground, #ffffff);
  }

  .close-button svg {
    width: 20px;
    height: 20px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    gap: 8px;
  }

  .empty-icon {
    font-size: 48px;
    opacity: 0.3;
  }

  .empty-text {
    color: rgba(255, 255, 255, 0.9);
    font-size: 16px;
    font-weight: 600;
  }

  .empty-hint {
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    text-align: center;
  }

  .preset-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px 24px;
    overflow-y: auto;
    flex: 1;
    min-height: 0;
  }

  .preset-item-container {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .preset-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.08),
      rgba(255, 255, 255, 0.03)
    );
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
    min-width: 0;
    min-height: 44px;
    text-align: left;
    font-family: inherit;
    position: relative;
  }

  .preset-item:hover {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.12),
      rgba(255, 255, 255, 0.06)
    );
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .preset-icon {
    font-size: 24px;
    flex-shrink: 0;
    line-height: 1;
  }

  .preset-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .preset-name {
    color: white;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .preset-summary {
    color: rgba(255, 255, 255, 0.6);
    font-size: 10px;
    white-space: normal;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.3;
  }

  .edit-button {
    background: linear-gradient(
      135deg,
      rgba(100, 150, 255, 0.15),
      rgba(100, 150, 255, 0.08)
    );
    border: 1px solid rgba(100, 150, 255, 0.3);
    color: rgba(100, 150, 255, 0.9);
    cursor: pointer;
    padding: 10px;
    border-radius: 8px;
    transition: all 0.2s ease;
    min-width: 44px;
    min-height: 44px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .edit-button:hover {
    background: linear-gradient(
      135deg,
      rgba(100, 150, 255, 0.25),
      rgba(100, 150, 255, 0.15)
    );
    border-color: rgba(100, 150, 255, 0.5);
    color: rgba(100, 150, 255, 1);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(100, 150, 255, 0.2);
  }

  .edit-button svg {
    width: 18px;
    height: 18px;
  }

  .delete-button {
    background: linear-gradient(
      135deg,
      rgba(255, 100, 100, 0.15),
      rgba(255, 100, 100, 0.08)
    );
    border: 1px solid rgba(255, 100, 100, 0.3);
    color: rgba(255, 100, 100, 0.9);
    cursor: pointer;
    padding: 10px;
    border-radius: 8px;
    transition: all 0.2s ease;
    min-width: 44px;
    min-height: 44px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .delete-button:hover {
    background: linear-gradient(
      135deg,
      rgba(255, 100, 100, 0.25),
      rgba(255, 100, 100, 0.15)
    );
    border-color: rgba(255, 100, 100, 0.5);
    color: rgba(255, 100, 100, 1);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(255, 100, 100, 0.2);
  }

  .delete-button svg {
    width: 18px;
    height: 18px;
  }
</style>
