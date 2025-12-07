<!--
  TrailSettingsSheet.svelte

  Bottom sheet for configuring trail settings per canvas.
  Includes preset selector and advanced customization options.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import ModernSlider from "../../../components/inputs/ModernSlider.svelte";
  import ToggleSwitch from "../../../components/inputs/ToggleSwitch.svelte";
  import {
    TRAIL_PRESETS,
    detectActivePreset,
    applyPreset,
    type TrailPresetId,
  } from "../../../components/trail/TrailPresets";
  import type { TrailSettings } from "../../../shared/domain/types/TrailTypes";
  import { TrailMode } from "../../../shared/domain/types/TrailTypes";

  let {
    isOpen = $bindable(false),
    canvasId,
    trailSettings,
    onSettingsChange,
  }: {
    isOpen: boolean;
    canvasId: string;
    trailSettings: TrailSettings;
    onSettingsChange: (
      canvasId: string,
      settings: Partial<TrailSettings>
    ) => void;
  } = $props();

  // Advanced settings toggle
  let showAdvanced = $state(false);

  // Mobile detection
  let isMobile = $state(false);

  onMount(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    isMobile = mediaQuery.matches;

    const handler = (e: MediaQueryListEvent) => {
      isMobile = e.matches;
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  });

  // Detect active preset
  const activePreset = $derived(detectActivePreset(trailSettings));
  const isModified = $derived(!activePreset && trailSettings.enabled);

  // Local state for smooth slider interactions
  let fadeDuration = $state(trailSettings.fadeDurationMs / 1000);
  let lineWidth = $state(trailSettings.lineWidth);
  let opacity = $state(trailSettings.maxOpacity);

  // Sync from parent
  $effect(() => {
    fadeDuration = trailSettings.fadeDurationMs / 1000;
    lineWidth = trailSettings.lineWidth;
    opacity = trailSettings.maxOpacity;
  });

  function handlePresetSelect(presetId: TrailPresetId) {
    const presetSettings = applyPreset(presetId);
    if (presetSettings) {
      onSettingsChange(canvasId, presetSettings);
      console.log(`🎨 Applied preset "${presetId}" to canvas ${canvasId}`);
    }
  }

  function handleFadeDurationChange(value: number) {
    fadeDuration = value;
    onSettingsChange(canvasId, { fadeDurationMs: value * 1000 });
  }

  function handleLineWidthChange(value: number) {
    lineWidth = value;
    onSettingsChange(canvasId, { lineWidth: value });
  }

  function handleOpacityChange(value: number) {
    opacity = value;
    onSettingsChange(canvasId, { maxOpacity: value });
  }

  function handleGlowToggle(enabled: boolean) {
    onSettingsChange(canvasId, { glowEnabled: enabled });
  }

  function handleHidePropsToggle(hide: boolean) {
    onSettingsChange(canvasId, { hideProps: hide });
  }

  function handleClose() {
    isOpen = false;
    showAdvanced = false;
  }
</script>

<Drawer
  bind:isOpen
  placement="bottom"
  snapPoints={showAdvanced ? ["50%", "80%", "95%"] : undefined}
  closeOnBackdrop={true}
  closeOnEscape={true}
  ariaLabel="Trail Settings"
  showHandle={true}
  class="trail-settings-sheet"
  backdropClass="trail-settings-backdrop"
>
  <div class="trail-settings-panel">
    <header class="panel-header">
      <h3 class="panel-title">Trail Settings</h3>
      <button class="close-btn" onclick={handleClose} aria-label="Close">
        <i class="fas fa-times"></i>
      </button>
    </header>

    <!-- Preset Selector -->
    <div class="presets-section">
      <h4 class="section-title">Preset</h4>
      <div class="presets-grid">
        {#each TRAIL_PRESETS as preset (preset.id)}
          <button
            class="preset-card"
            class:selected={activePreset?.id === preset.id}
            onclick={() => handlePresetSelect(preset.id)}
          >
            <div class="preset-icon">
              <i class="fas {preset.icon}"></i>
            </div>
            <div class="preset-info">
              <span class="preset-name">{preset.name}</span>
              <span class="preset-description">{preset.description}</span>
            </div>
            {#if activePreset?.id === preset.id}
              <div class="check-indicator">
                <i class="fas fa-check"></i>
              </div>
            {/if}
          </button>
        {/each}
      </div>
    </div>

    <!-- Advanced Settings Toggle -->
    {#if trailSettings.enabled && trailSettings.mode !== TrailMode.OFF}
      <div class="advanced-toggle-section">
        <button
          class="advanced-toggle-btn"
          onclick={() => (showAdvanced = !showAdvanced)}
        >
          {#if isModified}
            <span class="modified-badge">Modified</span>
          {/if}
          <i class="fas fa-sliders"></i>
          <span>Advanced Settings</span>
          <i class="fas fa-chevron-{showAdvanced ? 'up' : 'down'}"></i>
        </button>
      </div>

      {#if showAdvanced}
        <div class="advanced-settings">
          <!-- Fade Duration (only for FADE mode) -->
          {#if trailSettings.mode === TrailMode.FADE}
            <div class="setting-group">
              <ModernSlider
                bind:value={fadeDuration}
                min={0.5}
                max={5}
                step={0.1}
                label="Fade Duration"
                unit="s"
                formatValue={(v) => v.toFixed(1)}
                onInput={handleFadeDurationChange}
              />
            </div>
          {/if}

          <!-- Line Width -->
          <div class="setting-group">
            <ModernSlider
              bind:value={lineWidth}
              min={1}
              max={8}
              step={0.5}
              label="Line Width"
              unit="px"
              formatValue={(v) => v.toFixed(1)}
              onInput={handleLineWidthChange}
            />
          </div>

          <!-- Opacity -->
          <div class="setting-group">
            <ModernSlider
              bind:value={opacity}
              min={0.3}
              max={1}
              step={0.05}
              label="Opacity"
              unit=""
              formatValue={(v) => v.toFixed(2)}
              onInput={handleOpacityChange}
            />
          </div>

          <!-- Toggle Switches -->
          <div class="toggles-section">
            <div class="toggle-row">
              <span class="toggle-label-text">Glow Effect</span>
              <ToggleSwitch
                checked={trailSettings.glowEnabled}
                onToggle={handleGlowToggle}
              />
            </div>

            <div class="toggle-row">
              <span class="toggle-label-text">Hide Props</span>
              <ToggleSwitch
                checked={trailSettings.hideProps}
                onToggle={handleHidePropsToggle}
              />
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</Drawer>

<style>
  /* Backdrop styling */
  :global(.trail-settings-backdrop) {
    background: rgba(0, 0, 0, 0.6) !important;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  /* Drawer content styling */
  :global(.trail-settings-sheet) {
    --sheet-bg: rgba(20, 25, 35, 0.98);
  }

  .trail-settings-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0 20px 20px;
    min-width: 280px;
    max-width: 100%;
    overflow-y: auto;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    margin-bottom: 20px;
    position: sticky;
    top: 0;
    background: rgba(20, 25, 35, 0.98);
    z-index: 1;
  }

  .panel-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
  }

  .close-btn {
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .presets-section {
    margin-bottom: 20px;
  }

  .section-title {
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.5);
    margin: 0 0 12px 0;
  }

  .presets-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .preset-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 1.5px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    width: 100%;
  }

  .preset-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .preset-card.selected {
    background: rgba(139, 92, 246, 0.15);
    border-color: rgba(139, 92, 246, 0.4);
  }

  .preset-card:active {
    transform: scale(0.98);
  }

  .preset-icon {
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.7);
    flex-shrink: 0;
  }

  .preset-card.selected .preset-icon {
    background: rgba(139, 92, 246, 0.2);
    color: rgba(167, 139, 250, 1);
  }

  .preset-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .preset-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .preset-description {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .check-indicator {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(139, 92, 246, 0.3);
    border-radius: 50%;
    color: rgba(167, 139, 250, 1);
    font-size: 0.75rem;
    flex-shrink: 0;
  }

  .advanced-toggle-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .advanced-toggle-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 14px 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .advanced-toggle-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.9);
  }

  .advanced-toggle-btn .fa-chevron-up,
  .advanced-toggle-btn .fa-chevron-down {
    margin-left: auto;
    font-size: 0.75rem;
    opacity: 0.5;
  }

  .modified-badge {
    font-size: 0.7rem;
    padding: 3px 8px;
    background: rgba(251, 191, 36, 0.2);
    color: rgba(251, 191, 36, 0.9);
    border-radius: 6px;
    font-weight: 600;
  }

  .advanced-settings {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .setting-group {
    padding: 0;
  }

  .toggles-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-top: 8px;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
  }

  .toggle-label-text {
    font-size: 0.9rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.85);
  }

  /* Safe area for mobile */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .trail-settings-panel {
      padding-bottom: calc(20px + env(safe-area-inset-bottom));
    }
  }
</style>
