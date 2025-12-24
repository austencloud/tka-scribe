<!--
  StaticSettings.svelte

  Settings content for static image export format.
  Rendered inside SettingsPanel when user clicks gear icon.

  Features:
  - Dimension inputs (width, height)
  - Quality slider (0-100%)
  - Background picker (transparent, white, black)
  - Preset dimension buttons (1080p, 4K, etc.)

  Domain: Share Hub - Settings - Static Image Format
-->
<script lang="ts">
  import { getShareHubState } from '../../state/share-hub-state.svelte';

  const state = getShareHubState();

  const presetDimensions = [
    { label: '1080p', width: 1920, height: 1080 },
    { label: '4K', width: 3840, height: 2160 },
    { label: 'Square', width: 1080, height: 1080 },
    { label: 'Portrait', width: 1080, height: 1920 },
  ];

  const backgroundOptions = [
    { value: 'transparent', label: 'Transparent', icon: 'fa-border-all' },
    { value: 'white', label: 'White', icon: 'fa-square' },
    { value: 'black', label: 'Black', icon: 'fa-square' },
  ] as const;

  function handleWidthChange(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value);
    if (!isNaN(value) && value > 0) {
      state.staticSettings = { ...state.staticSettings, width: value };
    }
  }

  function handleHeightChange(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value);
    if (!isNaN(value) && value > 0) {
      state.staticSettings = { ...state.staticSettings, height: value };
    }
  }

  function handleQualityChange(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value);
    state.staticSettings = { ...state.staticSettings, quality: value };
  }

  function handlePresetClick(width: number, height: number) {
    state.staticSettings = { ...state.staticSettings, width, height };
  }

  function handleBackgroundSelect(background: 'transparent' | 'white' | 'black') {
    state.staticSettings = { ...state.staticSettings, background };
  }
</script>

<div class="static-settings">
  <!-- Dimension Presets -->
  <div class="setting-group">
    <div class="setting-header">
      <label>
        <i class="fas fa-expand-arrows-alt"></i>
        Dimension Presets
      </label>
    </div>
    <div class="preset-grid">
      {#each presetDimensions as preset}
        <button
          class="preset-button"
          class:active={
            state.staticSettings.width === preset.width &&
            state.staticSettings.height === preset.height
          }
          onclick={() => handlePresetClick(preset.width, preset.height)}
        >
          <span class="preset-label">{preset.label}</span>
          <span class="preset-dimensions">{preset.width}×{preset.height}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Custom Dimensions -->
  <div class="setting-group">
    <div class="setting-header">
      <label>
        <i class="fas fa-ruler-combined"></i>
        Custom Dimensions
      </label>
    </div>
    <div class="dimension-inputs">
      <div class="input-group">
        <label for="width-input">Width (px)</label>
        <input
          id="width-input"
          type="number"
          min="100"
          max="7680"
          step="10"
          value={state.staticSettings.width}
          oninput={handleWidthChange}
        />
      </div>
      <div class="input-group">
        <label for="height-input">Height (px)</label>
        <input
          id="height-input"
          type="number"
          min="100"
          max="4320"
          step="10"
          value={state.staticSettings.height}
          oninput={handleHeightChange}
        />
      </div>
    </div>
  </div>

  <!-- Quality Slider -->
  <div class="setting-group">
    <div class="setting-header">
      <label for="quality-slider">
        <i class="fas fa-sliders-h"></i>
        Image Quality
      </label>
      <span class="setting-value">{state.staticSettings.quality}%</span>
    </div>
    <input
      id="quality-slider"
      type="range"
      min="10"
      max="100"
      step="5"
      value={state.staticSettings.quality}
      oninput={handleQualityChange}
      class="slider"
    />
    <div class="slider-labels">
      <span>Low (10%)</span>
      <span>High (100%)</span>
    </div>
  </div>

  <!-- Background Picker -->
  <div class="setting-group">
    <div class="setting-header">
      <label>
        <i class="fas fa-palette"></i>
        Background
      </label>
    </div>
    <div class="background-grid">
      {#each backgroundOptions as option}
        <button
          class="background-button"
          class:active={state.staticSettings.background === option.value}
          data-background={option.value}
          onclick={() => handleBackgroundSelect(option.value)}
        >
          <i class="fas {option.icon}"></i>
          <span>{option.label}</span>
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .static-settings {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .setting-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .setting-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .setting-header label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: var(--font-size-min, 14px);
    font-weight: 600;
    color: var(--theme-text, white);
  }

  .setting-header i {
    font-size: 16px;
    opacity: 0.7;
  }

  .setting-value {
    font-size: var(--font-size-min, 14px);
    font-weight: 700;
    color: var(--theme-accent, #4a9eff);
  }

  .preset-grid,
  .background-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
  }

  .preset-button,
  .background-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 14px 12px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 10px;
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text, white);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .preset-button:hover,
  .background-button:hover {
    border-color: var(--theme-accent, rgba(74, 158, 255, 0.5));
    transform: translateY(-2px);
  }

  .preset-button:focus-visible,
  .background-button:focus-visible {
    outline: 2px solid var(--theme-accent, #4a9eff);
    outline-offset: 2px;
  }

  .preset-button.active,
  .background-button.active {
    background: var(--theme-accent, #4a9eff);
    border-color: var(--theme-accent, #4a9eff);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .preset-label {
    font-weight: 600;
    font-size: var(--font-size-min, 14px);
  }

  .preset-dimensions {
    font-size: var(--font-size-compact, 12px);
    opacity: 0.7;
  }

  .background-button i {
    font-size: 24px;
  }

  .background-button[data-background='transparent'] i {
    background: repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.1) 6px,
      rgba(0, 0, 0, 0.1) 6px,
      rgba(0, 0, 0, 0.1) 12px
    );
    padding: 4px;
    border-radius: 4px;
  }

  .background-button[data-background='white'] i {
    color: white;
  }

  .background-button[data-background='black'] i {
    color: black;
    background: white;
    padding: 4px;
    border-radius: 4px;
  }

  .dimension-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .input-group label {
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    font-weight: 500;
  }

  .input-group input {
    padding: 10px 14px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    font-size: var(--font-size-min, 14px);
    color: var(--theme-text, white);
    font-family: inherit;
    transition: border-color 0.2s ease;
  }

  .input-group input:hover {
    border-color: var(--theme-accent, rgba(74, 158, 255, 0.5));
  }

  .input-group input:focus {
    outline: none;
    border-color: var(--theme-accent, #4a9eff);
  }

  .slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.08));
    border-radius: 3px;
    outline: none;
    cursor: pointer;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: var(--theme-accent, #4a9eff);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s ease;
  }

  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }

  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: var(--theme-accent, #4a9eff);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s ease;
  }

  .slider::-moz-range-thumb:hover {
    transform: scale(1.1);
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  /* Mobile optimization */
  @media (max-width: 600px) {
    .preset-grid,
    .background-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .dimension-inputs {
      grid-template-columns: 1fr;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .preset-button,
    .background-button {
      transition: none;
    }

    .preset-button:hover,
    .background-button:hover {
      transform: none;
    }

    .slider::-webkit-slider-thumb,
    .slider::-moz-range-thumb {
      transition: none;
    }
  }
</style>
