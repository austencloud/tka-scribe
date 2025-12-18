<script lang="ts">
  /**
   * ClipAppearanceSection - Color, rotation, and opacity controls
   */

  interface Props {
    color: string;
    rotation: number;
    opacity: number;
    onUpdateColor: (color: string) => void;
    onUpdateRotation: (degrees: number) => void;
    onUpdateOpacity: (value: number) => void;
  }

  let { color, rotation, opacity, onUpdateColor, onUpdateRotation, onUpdateOpacity }: Props = $props();

  const COLOR_PRESETS = [
    "#4a9eff", // Blue
    "#ff6b6b", // Red
    "#51cf66", // Green
    "#ffd43b", // Yellow
    "#cc5de8", // Purple
    "#ff922b", // Orange
    "#20c997", // Teal
    "#f06595", // Pink
  ];
</script>

<section class="section">
  <div class="section-header">
    <i class="fa-solid fa-palette"></i>
    <span>Appearance</span>
  </div>

  <div class="field">
    <label class="field-label">Clip Color</label>
    <div class="color-presets">
      {#each COLOR_PRESETS as presetColor}
        <button
          class="color-swatch"
          class:active={color === presetColor}
          style="background: {presetColor}"
          onclick={() => onUpdateColor(presetColor)}
          aria-label="Set color to {presetColor}"
        ></button>
      {/each}
    </div>
  </div>

  <div class="field">
    <label class="field-label">Rotation ({rotation}°)</label>
    <input
      type="range"
      class="range-input"
      min="0"
      max="360"
      step="15"
      value={rotation}
      oninput={(e) => onUpdateRotation(parseInt((e.target as HTMLInputElement).value))}
    />
  </div>

  <div class="field">
    <label class="field-label">Opacity ({Math.round(opacity * 100)}%)</label>
    <input
      type="range"
      class="range-input"
      min="0"
      max="1"
      step="0.05"
      value={opacity}
      oninput={(e) => onUpdateOpacity(parseFloat((e.target as HTMLInputElement).value))}
    />
  </div>
</section>

<style>
  @import './inspector-styles.css';

  .color-presets {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .color-swatch {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .color-swatch:hover {
    transform: scale(1.1);
  }

  .color-swatch.active {
    border-color: white;
    box-shadow: 0 0 0 2px var(--theme-accent, #4a9eff);
  }
</style>
