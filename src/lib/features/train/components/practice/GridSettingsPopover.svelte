<!--
  GridSettingsPopover.svelte - Compact popover for grid overlay settings

  Shows a scale slider to adjust how large the grid appears over the camera feed.
  Shows mode switcher to toggle between BOX (cardinal) and DIAMOND (intercardinal) detection.
  Designed to be non-intrusive - appears as a small floating panel.
-->
<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";

  interface Props {
    isOpen: boolean;
    gridScale: number;
    gridMode: GridMode;
    propsVisible?: boolean;
    onScaleChange: (scale: number) => void;
    onModeChange: (mode: GridMode) => void;
    onPropsVisibilityChange?: (visible: boolean) => void;
    onClose: () => void;
  }

  let {
    isOpen,
    gridScale,
    gridMode,
    propsVisible = true,
    onScaleChange,
    onModeChange,
    onPropsVisibilityChange,
    onClose,
  }: Props = $props();

  function handleScaleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    onScaleChange(parseFloat(target.value));
  }

  function resetScale() {
    onScaleChange(1.0);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      onClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <div
    class="popover-backdrop"
    transition:fade={{ duration: 150 }}
    onclick={onClose}
    role="presentation"
  ></div>
  <div class="popover" transition:fly={{ y: 10, duration: 200 }}>
    <div class="popover-header">
      <span class="popover-title">Grid Settings</span>
      <button class="close-btn" onclick={onClose} aria-label="Close">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div class="popover-content">
      <!-- Grid Mode Switcher -->
      <div class="mode-control">
        <span class="section-label" id="detection-mode-label"
          >Detection Mode</span
        >
        <div
          class="mode-buttons"
          role="group"
          aria-labelledby="detection-mode-label"
        >
          <button
            class="mode-btn"
            class:active={gridMode === GridMode.BOX}
            onclick={() => onModeChange(GridMode.BOX)}
          >
            <i class="fas fa-square"></i>
            <span>Box</span>
          </button>
          <button
            class="mode-btn"
            class:active={gridMode === GridMode.DIAMOND}
            onclick={() => onModeChange(GridMode.DIAMOND)}
          >
            <i class="fas fa-diamond"></i>
            <span>Diamond</span>
          </button>
        </div>
        <p class="mode-hint">
          {#if gridMode === GridMode.BOX}
            Detects intercardinal points (NE, SE, SW, NW)
          {:else}
            Detects cardinal points (N, E, S, W)
          {/if}
        </p>
      </div>

      <!-- Grid Scale Slider -->
      <div class="scale-control">
        <label class="section-label" for="grid-scale-slider">Grid Size</label>
        <input
          id="grid-scale-slider"
          type="range"
          min="0.5"
          max="1.5"
          step="0.05"
          value={gridScale}
          oninput={handleScaleInput}
          class="scale-slider"
        />
        <div class="scale-labels">
          <span class="scale-value">{Math.round(gridScale * 100)}%</span>
          {#if gridScale !== 1.0}
            <button class="reset-btn" onclick={resetScale}> Reset </button>
          {/if}
        </div>
      </div>

      <!-- Prop Visibility Toggle -->
      {#if onPropsVisibilityChange}
        <div class="visibility-control">
          <span class="section-label" id="prop-display-label">Prop Display</span
          >
          <button
            class="toggle-btn"
            class:active={propsVisible}
            onclick={() => onPropsVisibilityChange?.(!propsVisible)}
            aria-labelledby="prop-display-label"
          >
            <i class="fas {propsVisible ? 'fa-eye' : 'fa-eye-slash'}"></i>
            <span>{propsVisible ? "Props Visible" : "Props Hidden"}</span>
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .popover-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 999;
  }

  .popover {
    position: absolute;
    bottom: calc(0.5rem + 44px);
    left: 0.5rem;
    width: 220px;
    background: #252532;
    border: 1px solid var(--border-2026, rgba(255, 255, 255, 0.06));
    border-radius: var(--radius-2026-lg, 16px);
    box-shadow: var(--shadow-2026-lg, 0 4px 16px rgba(0, 0, 0, 0.12));
    z-index: 1000;
    overflow: hidden;
  }

  .popover-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .popover-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.05);
    border: none;
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .popover-content {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .section-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }

  .mode-control {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .mode-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .mode-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.75rem 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .mode-btn i {
    font-size: 1.25rem;
  }

  .mode-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.8);
  }

  .mode-btn.active {
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.2) 0%,
      rgba(37, 99, 235, 0.2) 100%
    );
    border-color: #3b82f6;
    color: #3b82f6;
  }

  .mode-hint {
    margin: 0;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.45);
    line-height: 1.3;
    text-align: center;
  }

  .scale-control {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .scale-slider {
    width: 100%;
    height: 6px;
    appearance: none;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    outline: none;
    cursor: pointer;
  }

  .scale-slider::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
    transition: transform 0.15s;
  }

  .scale-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }

  .scale-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
  }

  .scale-labels {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .scale-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: #3b82f6;
    font-variant-numeric: tabular-nums;
  }

  .reset-btn {
    padding: 0.25rem 0.5rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .reset-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.9);
  }

  .visibility-control {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .toggle-btn i {
    font-size: 1rem;
  }

  .toggle-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.8);
  }

  .toggle-btn.active {
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.2) 0%,
      rgba(37, 99, 235, 0.2) 100%
    );
    border-color: #3b82f6;
    color: #3b82f6;
  }
</style>
