<!--
  TrailPresetPicker.svelte

  Button that triggers opening the trail preset panel.
  The panel itself is rendered at a higher level (SingleModePanel) for proper overlay.
  2025 design - no dropdowns, uses panels instead!
-->
<script lang="ts">
  import { detectActivePreset } from "./TrailPresets";
  import type { TrailSettings } from "../../shared/domain/types/TrailTypes";

  let {
    currentSettings,
    onOpenPanel,
  }: {
    currentSettings: TrailSettings;
    onOpenPanel: () => void;
  } = $props();

  // Detect active preset from current settings
  const activePreset = $derived(detectActivePreset(currentSettings));
  const isModified = $derived(!activePreset && currentSettings.enabled);

  // Display text for the button
  const displayName = $derived(
    activePreset?.name ?? (isModified ? "Custom" : "None")
  );
  const displayIcon = $derived(
    activePreset?.icon ?? (isModified ? "fa-sliders" : "fa-circle-xmark")
  );
</script>

<button
  class="preset-picker-button"
  class:modified={isModified}
  onclick={onOpenPanel}
  aria-label="Open trail preset panel"
>
  <i class="fas {displayIcon}"></i>
  <span class="preset-name">{displayName}</span>
  <i class="fas fa-chevron-right chevron"></i>
</button>

<style>
  .preset-picker-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.06);
    border: 1.5px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
    min-height: 48px;
  }

  .preset-picker-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .preset-picker-button:active {
    transform: scale(0.98);
    background: rgba(139, 92, 246, 0.15);
    border-color: rgba(139, 92, 246, 0.4);
  }

  .preset-picker-button.modified {
    border-color: rgba(251, 191, 36, 0.4);
  }

  .preset-name {
    flex: 1;
    text-align: left;
  }

  .chevron {
    font-size: 0.7rem;
    opacity: 0.5;
  }
</style>
