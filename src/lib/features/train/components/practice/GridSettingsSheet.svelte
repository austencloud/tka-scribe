<!--
  GridSettingsSheet.svelte - Responsive settings sheet for grid overlay settings

  Mobile: Bottom sheet (slides up from bottom)
  Desktop: Side drawer (slides from right)

  Shows grid scale, mode, and prop visibility settings.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";

  interface Props {
    isOpen: boolean;
    gridScale: number;
    gridMode: GridMode;
    propsVisible?: boolean;
    onScaleChange: (scale: number) => void;
    onModeChange: (mode: GridMode) => void;
    onPropsVisibilityChange?: (visible: boolean) => void;
    onSwitchCamera?: () => void;
    onClose: () => void;
  }

  let {
    isOpen = $bindable(false),
    gridScale,
    gridMode,
    propsVisible = true,
    onScaleChange,
    onModeChange,
    onPropsVisibilityChange,
    onSwitchCamera,
    onClose,
  }: Props = $props();

  // Responsive placement: bottom on mobile, right on desktop
  let placement = $state<"bottom" | "right">("bottom");

  onMount(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    placement = mediaQuery.matches ? "right" : "bottom";

    const handler = (e: MediaQueryListEvent) => {
      placement = e.matches ? "right" : "bottom";
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  });

  function resetScale() {
    onScaleChange(1.0);
  }

  function handleClose() {
    isOpen = false;
    onClose();
  }
</script>

<Drawer
  bind:isOpen
  {placement}
  closeOnBackdrop={true}
  closeOnEscape={true}
  ariaLabel="Grid Settings"
  showHandle={placement === "bottom"}
  class="grid-settings-sheet"
  backdropClass="grid-settings-backdrop"
>
  <div class="settings-panel" class:side-drawer={placement === "right"}>
    <!-- Header -->
    <header class="panel-header">
      <div class="header-icon">
        <i class="fas fa-th"></i>
      </div>
      <div class="header-content">
        <h3 class="panel-title">Grid Settings</h3>
        <p class="panel-subtitle">Adjust grid overlay appearance</p>
      </div>
      <button
        class="close-btn"
        onclick={handleClose}
        aria-label="Close settings"
      >
        <i class="fas fa-times"></i>
      </button>
    </header>

    <!-- Settings Content -->
    <div class="settings-content">
      <!-- Grid Mode Switcher -->
      <div class="setting-section">
        <span class="section-label" id="detection-mode-label">Detection Mode</span>
        <div class="mode-buttons" role="group" aria-labelledby="detection-mode-label">
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

      <!-- Grid Scale Controls (using buttons to avoid swipe conflicts) -->
      <div class="setting-section">
        <span class="section-label">Grid Size</span>
        <div class="scale-controls">
          <button
            class="scale-btn"
            onclick={() => onScaleChange(Math.max(0.5, gridScale - 0.1))}
            disabled={gridScale <= 0.5}
            aria-label="Decrease grid size"
          >
            <i class="fas fa-minus"></i>
          </button>
          <span class="scale-value">{Math.round(gridScale * 100)}%</span>
          <button
            class="scale-btn"
            onclick={() => onScaleChange(Math.min(1.5, gridScale + 0.1))}
            disabled={gridScale >= 1.5}
            aria-label="Increase grid size"
          >
            <i class="fas fa-plus"></i>
          </button>
          {#if gridScale !== 1.0}
            <button class="reset-btn" onclick={resetScale}>Reset</button>
          {/if}
        </div>
      </div>

      <!-- Prop Visibility Toggle -->
      {#if onPropsVisibilityChange}
        <div class="setting-section">
          <span class="section-label" id="prop-display-label">Prop Display</span>
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

      <!-- Camera Switch -->
      {#if onSwitchCamera}
        <div class="setting-section">
          <span class="section-label">Camera</span>
          <button
            class="toggle-btn camera-btn"
            onclick={onSwitchCamera}
            aria-label="Switch camera"
          >
            <i class="fas fa-sync-alt"></i>
            <span>Switch Camera</span>
          </button>
        </div>
      {/if}
    </div>
  </div>
</Drawer>

<style>
  /* Backdrop styling */
  :global(.grid-settings-backdrop) {
    background: rgba(0, 0, 0, 0.7) !important;
  }

  /* Drawer content styling - content-aware sizing */
  :global(.grid-settings-sheet) {
    --sheet-bg: #1a1a24;
    /* Bottom sheet: fit content height, don't stretch */
    height: auto !important;
    max-height: 85vh !important;
  }

  :global(.grid-settings-sheet[data-placement="right"]) {
    /* Side drawer: fit content width */
    width: auto !important;
    min-width: 320px;
    max-width: min(400px, 90vw) !important;
    height: 100% !important;
    max-height: 100% !important;
  }

  .settings-panel {
    display: flex;
    flex-direction: column;
    padding: 0 16px 16px;
    container-type: inline-size;
  }

  .settings-panel.side-drawer {
    min-width: 280px;
    padding: 0 20px 20px;
  }

  .panel-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    margin-bottom: 16px;
  }

  .header-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 10px;
    flex-shrink: 0;
  }

  .header-icon i {
    font-size: 14px;
    color: #60a5fa;
  }

  .header-content {
    flex: 1;
    min-width: 0;
  }

  .panel-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .panel-subtitle {
    margin: 2px 0 0 0;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .close-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .settings-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .setting-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* Container query: expand spacing when there's room */
  @container (min-width: 360px) {
    .panel-header {
      gap: 14px;
      padding: 14px 0;
      margin-bottom: 18px;
    }

    .header-icon {
      width: 40px;
      height: 40px;
    }

    .header-icon i {
      font-size: 16px;
    }

    .panel-title {
      font-size: 1.05rem;
    }

    .close-btn {
      width: 40px;
      height: 40px;
    }

    .settings-content {
      gap: 20px;
    }

    .setting-section {
      gap: 12px;
    }
  }

  .section-label {
    display: block;
    font-size: 0.7rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .mode-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .mode-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px 10px;
    background: rgba(255, 255, 255, 0.05);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.8rem;
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

  .scale-controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .scale-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.05);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .scale-btn:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.2);
    border-color: #3b82f6;
    color: #3b82f6;
  }

  .scale-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .scale-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .scale-value {
    flex: 1;
    text-align: center;
    font-size: 1.1rem;
    font-weight: 600;
    color: #3b82f6;
    font-variant-numeric: tabular-nums;
  }

  /* Container query: larger elements when there's room */
  @container (min-width: 360px) {
    .section-label {
      font-size: 0.75rem;
    }

    .mode-buttons {
      gap: 10px;
    }

    .mode-btn {
      gap: 8px;
      padding: 14px 12px;
      font-size: 0.85rem;
    }

    .mode-btn i {
      font-size: 1.4rem;
    }

    .mode-hint {
      font-size: 0.75rem;
    }

    .scale-controls {
      gap: 14px;
    }

    .scale-btn {
      width: 44px;
      height: 44px;
      font-size: 1rem;
    }

    .scale-value {
      font-size: 1.2rem;
    }
  }

  .reset-btn {
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.7rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .reset-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.9);
  }

  @container (min-width: 360px) {
    .reset-btn {
      padding: 10px 14px;
      font-size: 0.75rem;
    }
  }

  .toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .toggle-btn i {
    font-size: 1rem;
  }

  @container (min-width: 360px) {
    .toggle-btn {
      gap: 12px;
      padding: 14px;
      font-size: 0.85rem;
    }

    .toggle-btn i {
      font-size: 1.1rem;
    }
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

  /* Safe area for mobile */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .settings-panel:not(.side-drawer) {
      padding-bottom: calc(16px + env(safe-area-inset-bottom));
    }
  }

  /* Focus states */
  .close-btn:focus-visible,
  .mode-btn:focus-visible,
  .toggle-btn:focus-visible,
  .reset-btn:focus-visible,
  .scale-btn:focus-visible {
    outline: 2px solid rgba(59, 130, 246, 0.8);
    outline-offset: 2px;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .close-btn,
    .mode-btn,
    .toggle-btn,
    .reset-btn,
    .scale-btn {
      transition: none;
    }
  }
</style>
