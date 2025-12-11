<!--
  GridSettingsInline.svelte - Inline grid settings for bento layout

  Compact inline controls for grid scale, mode, and prop visibility.
  Designed to fit within a collapsible section.
-->
<script lang="ts">
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";

  interface Props {
    gridScale: number;
    gridMode: GridMode;
    propsVisible?: boolean;
    onGridScaleChange?: (scale: number) => void;
    onGridModeChange?: (mode: GridMode) => void;
    onPropsVisibilityChange?: (visible: boolean) => void;
  }

  let {
    gridScale,
    gridMode,
    propsVisible = true,
    onGridScaleChange,
    onGridModeChange,
    onPropsVisibilityChange,
  }: Props = $props();

  function decreaseScale() {
    onGridScaleChange?.(Math.max(0.5, gridScale - 0.1));
  }

  function increaseScale() {
    onGridScaleChange?.(Math.min(1.5, gridScale + 0.1));
  }

  function resetScale() {
    onGridScaleChange?.(1.0);
  }
</script>

<div class="settings-inline">
  <!-- Grid Mode Toggle -->
  <div class="setting-row">
    <span class="setting-label">Mode</span>
    <div class="mode-toggle">
      <button
        class="toggle-option"
        class:active={gridMode === GridMode.BOX}
        onclick={() => onGridModeChange?.(GridMode.BOX)}
        aria-label="Box mode"
      >
        <i class="fas fa-square"></i>
      </button>
      <button
        class="toggle-option"
        class:active={gridMode === GridMode.DIAMOND}
        onclick={() => onGridModeChange?.(GridMode.DIAMOND)}
        aria-label="Diamond mode"
      >
        <i class="fas fa-diamond"></i>
      </button>
    </div>
  </div>

  <!-- Grid Scale -->
  <div class="setting-row">
    <span class="setting-label">Size</span>
    <div class="scale-controls">
      <button
        class="scale-btn"
        onclick={decreaseScale}
        disabled={gridScale <= 0.5}
        aria-label="Decrease grid size"
      >
        <i class="fas fa-minus"></i>
      </button>
      <span class="scale-value">{Math.round(gridScale * 100)}%</span>
      <button
        class="scale-btn"
        onclick={increaseScale}
        disabled={gridScale >= 1.5}
        aria-label="Increase grid size"
      >
        <i class="fas fa-plus"></i>
      </button>
      {#if gridScale !== 1.0}
        <button class="reset-btn" onclick={resetScale} aria-label="Reset scale">
          <i class="fas fa-undo"></i>
        </button>
      {/if}
    </div>
  </div>

  <!-- Props Visibility -->
  {#if onPropsVisibilityChange}
    <div class="setting-row">
      <span class="setting-label">Props</span>
      <button
        class="visibility-toggle"
        class:active={propsVisible}
        onclick={() => onPropsVisibilityChange?.(!propsVisible)}
        aria-label={propsVisible ? "Hide props" : "Show props"}
      >
        <i class="fas {propsVisible ? 'fa-eye' : 'fa-eye-slash'}"></i>
        <span>{propsVisible ? "Visible" : "Hidden"}</span>
      </button>
    </div>
  {/if}
</div>

<style>
  .settings-inline {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .setting-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.03em;
    min-width: 40px;
  }

  /* Mode Toggle */
  .mode-toggle {
    display: flex;
    gap: 4px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    padding: 3px;
  }

  .toggle-option {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 32px;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .toggle-option:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.8);
  }

  .toggle-option.active {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
  }

  /* Scale Controls */
  .scale-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .scale-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .scale-btn:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.4);
    color: #60a5fa;
  }

  .scale-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .scale-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .scale-value {
    min-width: 48px;
    text-align: center;
    font-size: 0.85rem;
    font-weight: 600;
    color: #60a5fa;
    font-variant-numeric: tabular-nums;
  }

  .reset-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.65rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .reset-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
  }

  /* Visibility Toggle */
  .visibility-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .visibility-toggle i {
    font-size: 0.85rem;
  }

  .visibility-toggle:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.8);
  }

  .visibility-toggle.active {
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.3);
    color: #60a5fa;
  }

  /* Focus states */
  .toggle-option:focus-visible,
  .scale-btn:focus-visible,
  .reset-btn:focus-visible,
  .visibility-toggle:focus-visible {
    outline: 2px solid rgba(59, 130, 246, 0.6);
    outline-offset: 2px;
  }
</style>
