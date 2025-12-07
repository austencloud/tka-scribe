<!--
  AdvancedSettingsDrawer.svelte

  Tier 4: Advanced settings drawer with sliders and toggles.
  Opens from bottom with snap points for fine-tuning trail appearance.
-->
<script lang="ts">
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import ModernSlider from "../inputs/ModernSlider.svelte";
  import ToggleSwitch from "../inputs/ToggleSwitch.svelte";
  import type { TrailSettings } from "../../shared/domain/types/TrailTypes";

  let {
    isOpen = $bindable(false),
    settings,
    onFadeDurationChange,
    onLineWidthChange,
    onOpacityChange,
    onGlowToggle,
    onHidePropsToggle,
  }: {
    isOpen: boolean;
    settings: TrailSettings;
    onFadeDurationChange?: (ms: number) => void;
    onLineWidthChange?: (width: number) => void;
    onOpacityChange?: (opacity: number) => void;
    onGlowToggle?: (enabled: boolean) => void;
    onHidePropsToggle?: (hide: boolean) => void;
  } = $props();

  // Local state for smooth slider interactions
  let fadeDuration = $state(settings.fadeDurationMs / 1000);
  let lineWidth = $state(settings.lineWidth);
  let opacity = $state(settings.maxOpacity);

  // Sync from parent
  $effect(() => {
    fadeDuration = settings.fadeDurationMs / 1000;
    lineWidth = settings.lineWidth;
    opacity = settings.maxOpacity;
  });

  // Handlers
  function handleFadeDurationInput(value: number) {
    fadeDuration = value;
    onFadeDurationChange?.(value * 1000);
  }

  function handleLineWidthInput(value: number) {
    lineWidth = value;
    onLineWidthChange?.(value);
  }

  function handleOpacityInput(value: number) {
    opacity = value;
    onOpacityChange?.(value);
  }
</script>

<Drawer
  bind:isOpen
  placement="bottom"
  snapPoints={["40%", "70%", "95%"]}
  closeOnBackdrop={true}
  closeOnEscape={true}
  ariaLabel="Trail Settings"
  class="advanced-settings-panel"
  backdropClass="advanced-settings-backdrop"
>
  <div class="advanced-settings-drawer">
    <header class="drawer-header">
      <h3 class="drawer-title">Trail Fine-Tuning</h3>
      <button
        class="close-btn"
        onclick={() => (isOpen = false)}
        aria-label="Close settings"
      >
        <i class="fas fa-times"></i>
      </button>
    </header>

    <div class="settings-content">
      <!-- Fade Duration Slider -->
      <div class="setting-group">
        <ModernSlider
          bind:value={fadeDuration}
          min={0.5}
          max={5}
          step={0.1}
          label="Fade Duration"
          unit="s"
          formatValue={(v) => v.toFixed(1)}
          onInput={handleFadeDurationInput}
        />
      </div>

      <!-- Line Width Slider -->
      <div class="setting-group">
        <ModernSlider
          bind:value={lineWidth}
          min={1}
          max={8}
          step={0.5}
          label="Line Width"
          unit="px"
          formatValue={(v) => v.toFixed(1)}
          onInput={handleLineWidthInput}
        />
      </div>

      <!-- Opacity Slider -->
      <div class="setting-group">
        <ModernSlider
          bind:value={opacity}
          min={0.3}
          max={1}
          step={0.05}
          label="Opacity"
          unit=""
          formatValue={(v) => v.toFixed(2)}
          onInput={handleOpacityInput}
        />
      </div>

      <!-- Toggle Switches -->
      <div class="toggles-section">
        <div class="toggle-row">
          <span class="toggle-label-text">Glow Effect</span>
          <ToggleSwitch
            checked={settings.glowEnabled}
            onToggle={(checked) => onGlowToggle?.(checked)}
          />
        </div>

        <div class="toggle-row">
          <span class="toggle-label-text">Hide Props</span>
          <ToggleSwitch
            checked={settings.hideProps}
            onToggle={(checked) => onHidePropsToggle?.(checked)}
          />
        </div>
      </div>
    </div>
  </div>
</Drawer>

<style>
  /* Backdrop styling - dark semi-transparent overlay */
  :global(.advanced-settings-backdrop) {
    background: rgba(0, 0, 0, 0.6) !important;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  /* Drawer content styling */
  :global(.advanced-settings-panel) {
    --sheet-bg: rgba(20, 25, 35, 0.98);
  }

  .advanced-settings-drawer {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0 20px 20px;
  }

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    margin-bottom: 20px;
  }

  .drawer-title {
    font-size: 1.1rem;
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

  .settings-content {
    flex: 1;
    overflow-y: auto;
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
    border-top: 1px solid rgba(255, 255, 255, 0.06);
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

  /* Safe area for bottom-drawer on iOS */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .advanced-settings-drawer {
      padding-bottom: calc(20px + env(safe-area-inset-bottom));
    }
  }
</style>
