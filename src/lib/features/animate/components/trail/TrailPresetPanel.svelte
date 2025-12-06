<!--
  TrailPresetPanel.svelte

  Panel for selecting trail presets.
  Slides from right on desktop, from bottom on mobile.
  2025 design - no dropdowns!
-->
<script lang="ts">
  import { onMount } from "svelte";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import {
    TRAIL_PRESETS,
    detectActivePreset,
    type TrailPresetId,
  } from "./TrailPresets";
  import type { TrailSettings } from "../../shared/domain/types/TrailTypes";

  let {
    isOpen = $bindable(false),
    currentSettings,
    onPresetSelect,
    onCustomize,
  }: {
    isOpen: boolean;
    currentSettings: TrailSettings;
    onPresetSelect: (presetId: TrailPresetId) => void;
    onCustomize?: () => void;
  } = $props();

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

  // Detect active preset from current settings
  const activePreset = $derived(detectActivePreset(currentSettings));
  const isModified = $derived(!activePreset && currentSettings.enabled);

  function handlePresetClick(presetId: TrailPresetId) {
    onPresetSelect(presetId);
    isOpen = false;
  }

  function handleCustomize() {
    isOpen = false;
    onCustomize?.();
  }
</script>

<Drawer
  bind:isOpen
  placement={isMobile ? "bottom" : "right"}
  closeOnBackdrop={true}
  closeOnEscape={true}
  ariaLabel="Trail Presets"
  showHandle={isMobile}
  class="trail-preset-drawer"
  backdropClass="trail-preset-backdrop"
>
  <div class="trail-preset-panel">
    <header class="panel-header">
      <h3 class="panel-title">Trail Style</h3>
      <button
        class="close-btn"
        onclick={() => (isOpen = false)}
        aria-label="Close"
      >
        <i class="fas fa-times"></i>
      </button>
    </header>

    <div class="presets-grid">
      {#each TRAIL_PRESETS as preset (preset.id)}
        <button
          class="preset-card"
          class:selected={activePreset?.id === preset.id}
          onclick={() => handlePresetClick(preset.id)}
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

    {#if onCustomize}
      <div class="customize-section">
        <button class="customize-btn" onclick={handleCustomize}>
          {#if isModified}
            <span class="modified-badge">Modified</span>
          {/if}
          <i class="fas fa-sliders"></i>
          <span>Fine-tune settings...</span>
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    {/if}
  </div>
</Drawer>

<style>
  /* Backdrop styling - dark semi-transparent overlay */
  :global(.trail-preset-backdrop) {
    background: rgba(0, 0, 0, 0.6) !important;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  /* Drawer content styling */
  :global(.trail-preset-drawer) {
    --sheet-width: min(380px, 90vw);
    --sheet-bg: rgba(20, 25, 35, 0.98);
  }

  /* Bottom placement - limit height on mobile */
  :global(.trail-preset-drawer[data-placement="bottom"]) {
    max-height: 70vh;
  }

  .trail-preset-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0 20px 20px;
    min-width: 280px;
    max-width: 100%;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    margin-bottom: 20px;
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

  .presets-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
    overflow-y: auto;
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
  }

  .customize-section {
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    margin-top: 16px;
  }

  .customize-btn {
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

  .customize-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.9);
  }

  .customize-btn .fa-chevron-right {
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

  /* Safe area for mobile */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .trail-preset-panel {
      padding-bottom: calc(20px + env(safe-area-inset-bottom));
    }
  }
</style>
