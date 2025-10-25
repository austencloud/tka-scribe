<!--
PresetCard.svelte - Individual preset card display
Displays a single preset with icon, name, summary, and action buttons
-->
<script lang="ts">
  import { CAP_TYPE_LABELS, type CAPType } from "$build/generate/circular";
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import type { GenerationPreset } from "../../state/preset.svelte";

  let {
    preset,
    onSelect,
    onEdit,
    onDelete
  } = $props<{
    preset: GenerationPreset;
    onSelect: (preset: GenerationPreset) => void;
    onEdit: (preset: GenerationPreset) => void;
    onDelete: (presetId: string) => void;
  }>();

  let hapticService: IHapticFeedbackService;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
  });

  function handleSelect() {
    hapticService?.trigger("selection");
    onSelect(preset);
  }

  function handleEdit(event: MouseEvent) {
    event.stopPropagation();
    hapticService?.trigger("selection");
    onEdit(preset);
  }

  function handleDelete(event: MouseEvent) {
    event.stopPropagation();
    hapticService?.trigger("selection");
    onDelete(preset.id);
  }

  // Format config summary for display
  const configSummary = $derived(() => {
    const { config } = preset;
    const gridMode = config.gridMode.charAt(0).toUpperCase() + config.gridMode.slice(1);
    const mode = config.mode.charAt(0).toUpperCase() + config.mode.slice(1);

    const parts = [
      `${config.length} beats`,
      gridMode,
      mode,
      CAP_TYPE_LABELS[config.capType as CAPType] || config.capType,
    ];

    if (config.turnIntensity > 0) {
      parts.push(`${config.turnIntensity}x turn${config.turnIntensity !== 1 ? 's' : ''}`);
    }

    return parts.join(" • ");
  });

  // Get level-based background color
  const backgroundColor = $derived(() => {
    switch (preset.config.level) {
      case 1:
        return "rgba(186, 230, 253, 0.15)"; // Beginner: Light blue
      case 2:
        return "rgba(148, 163, 184, 0.15)"; // Intermediate: Silver gray
      case 3:
        return "rgba(250, 204, 21, 0.15)"; // Advanced: Gold
      default:
        return "rgba(255, 255, 255, 0.05)";
    }
  });

  // Get level-based border color
  const borderColor = $derived(() => {
    switch (preset.config.level) {
      case 1:
        return "rgba(56, 189, 248, 0.3)"; // Beginner: Light blue
      case 2:
        return "rgba(100, 116, 139, 0.3)"; // Intermediate: Silver gray
      case 3:
        return "rgba(234, 179, 8, 0.3)"; // Advanced: Gold
      default:
        return "rgba(255, 255, 255, 0.1)";
    }
  });

  const icon = $derived(preset.icon || "⚙️");

  const levelLabel = $derived(() => {
    switch (preset.config.level) {
      case 1:
        return "Beginner";
      case 2:
        return "Intermediate";
      case 3:
        return "Advanced";
      default:
        return `Level ${preset.config.level}`;
    }
  });

  const levelBadgeColor = $derived(() => {
    switch (preset.config.level) {
      case 1:
        return { bg: "rgba(56, 189, 248, 0.2)", border: "rgba(56, 189, 248, 0.5)", text: "#7dd3fc" };
      case 2:
        return { bg: "rgba(148, 163, 184, 0.2)", border: "rgba(148, 163, 184, 0.5)", text: "#cbd5e1" };
      case 3:
        return { bg: "rgba(234, 179, 8, 0.2)", border: "rgba(234, 179, 8, 0.5)", text: "#fde047" };
      default:
        return { bg: "rgba(255, 255, 255, 0.1)", border: "rgba(255, 255, 255, 0.2)", text: "#ffffff" };
    }
  });
</script>

<div class="preset-item-container">
  <button
    class="preset-item"
    style="background: {backgroundColor()}; border-color: {borderColor()};"
    onclick={handleSelect}
    aria-label={`Load preset ${preset.name}: ${configSummary()}`}
  >
    <div class="preset-icon">{icon}</div>
    <div class="preset-info">
      <div class="preset-header">
        <div class="preset-name">{preset.name}</div>
        <div
          class="level-badge"
          style="background: {levelBadgeColor().bg}; border-color: {levelBadgeColor().border}; color: {levelBadgeColor().text};"
        >
          {levelLabel()}
        </div>
      </div>
      <div class="preset-summary">{configSummary()}</div>
    </div>
  </button>
  <button
    class="edit-button"
    onclick={handleEdit}
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
    onclick={handleDelete}
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

<style>
  .preset-item-container {
    display: flex;
    gap: 8px;
    align-items: stretch;
  }

  .preset-item {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    color: white;
    font-family: inherit;
    min-height: 80px;
  }

  .preset-item:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .preset-item:active {
    transform: translateY(0);
  }

  .preset-icon {
    font-size: 32px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preset-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .preset-header {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .preset-name {
    font-size: 16px;
    font-weight: 600;
    color: white;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }

  .level-badge {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border: 1px solid;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .preset-summary {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

  .edit-button:active,
  .delete-button:active {
    transform: translateY(0);
  }

  @media (max-width: 640px) {
    .preset-item {
      gap: 12px;
      padding: 12px;
      min-height: 70px;
    }

    .preset-icon {
      font-size: 28px;
    }

    .preset-name {
      font-size: 14px;
    }

    .level-badge {
      font-size: 10px;
      padding: 2px 6px;
    }

    .preset-summary {
      font-size: 12px;
    }

    .edit-button,
    .delete-button {
      width: 40px;
    }

    .edit-button svg,
    .delete-button svg {
      width: 18px;
      height: 18px;
    }
  }
</style>
