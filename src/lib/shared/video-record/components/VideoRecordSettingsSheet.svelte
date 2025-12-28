<!--
  VideoRecordSettingsSheet.svelte

  Settings sheet for video recording options.
  Controls reference view, animation settings, and grid settings.

  Reuses SimpleTrailControls and MotionVisibilityButtons for consistency
  with the animation panel controls.
-->
<script lang="ts">
  import type {
    ReferenceViewType,
    GridSettings,
  } from "../state/video-record-settings.svelte";
  import SimpleTrailControls from "$lib/features/compose/components/trail/SimpleTrailControls.svelte";
  import MotionVisibilityButtons from "$lib/features/compose/components/trail/MotionVisibilityButtons.svelte";
  import { getAnimationVisibilityManager } from "$lib/shared/animation-engine/state/animation-visibility-state.svelte";

  let {
    isOpen = false,
    isMobile = false,
    referenceView,
    gridSettings,
    bluePropType = null,
    redPropType = null,
    onClose = () => {},
    onReferenceViewChange = () => {},
    onGridSettingsChange = () => {},
  }: {
    isOpen: boolean;
    isMobile: boolean;
    referenceView: ReferenceViewType;
    gridSettings: GridSettings;
    bluePropType?: string | null;
    redPropType?: string | null;
    onClose?: () => void;
    onReferenceViewChange?: (view: ReferenceViewType) => void;
    onGridSettingsChange?: (settings: GridSettings) => void;
  } = $props();

  // Get the global visibility manager
  const visibilityManager = getAnimationVisibilityManager();

  // Read visibility state from the global manager
  let blueMotionVisible = $state(visibilityManager.getVisibility("blueMotion"));
  let redMotionVisible = $state(visibilityManager.getVisibility("redMotion"));

  // Sync state when sheet opens (in case visibility changed elsewhere)
  $effect(() => {
    if (isOpen) {
      blueMotionVisible = visibilityManager.getVisibility("blueMotion");
      redMotionVisible = visibilityManager.getVisibility("redMotion");
    }
  });

  function toggleBlueMotion() {
    const newValue = !blueMotionVisible;
    blueMotionVisible = newValue;
    visibilityManager.setVisibility("blueMotion", newValue);
  }

  function toggleRedMotion() {
    const newValue = !redMotionVisible;
    redMotionVisible = newValue;
    visibilityManager.setVisibility("redMotion", newValue);
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      onClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <div
    class="sheet-backdrop"
    onclick={handleBackdropClick}
    onkeydown={(e) => e.key === "Escape" && onClose()}
    role="button"
    tabindex="0"
    aria-label="Close settings"
  >
    <div class="sheet-content" role="dialog" aria-modal="true">
      <div class="sheet-header">
        <h3>Recording Settings</h3>
        <button class="close-btn" onclick={onClose} aria-label="Close">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>

      <div class="sheet-body">
        <!-- Reference View Section -->
        <section class="settings-section">
          <h4>Reference View</h4>
          <p class="section-hint">
            Choose what to display alongside your camera feed
          </p>

          <div class="option-grid">
            {#if !isMobile}
              <button
                class="option-btn"
                class:active={referenceView === "none"}
                onclick={() => onReferenceViewChange("none")}
              >
                <i class="fas fa-video" aria-hidden="true"></i>
                <span>Camera Only</span>
              </button>
            {/if}
            <button
              class="option-btn"
              class:active={referenceView === "animation"}
              onclick={() => onReferenceViewChange("animation")}
            >
              <i class="fas fa-play-circle" aria-hidden="true"></i>
              <span>Animation</span>
            </button>
            <button
              class="option-btn"
              class:active={referenceView === "grid"}
              onclick={() => onReferenceViewChange("grid")}
            >
              <i class="fas fa-th" aria-hidden="true"></i>
              <span>Grid</span>
            </button>
          </div>
        </section>

        <!-- Animation Settings (visible when animation reference is active) -->
        {#if referenceView === "animation"}
          <section class="settings-section">
            <h4>Animation Settings</h4>

            <!-- Trail Controls (Off/Subtle/Vivid) with bilateral toggle -->
            <SimpleTrailControls {bluePropType} {redPropType} />

            <!-- Motion Visibility -->
            <div class="motion-visibility-row">
              <span class="visibility-label">Motion Visibility</span>
              <div class="visibility-buttons">
                <MotionVisibilityButtons
                  {blueMotionVisible}
                  {redMotionVisible}
                  onToggleBlue={toggleBlueMotion}
                  onToggleRed={toggleRedMotion}
                />
              </div>
            </div>
          </section>
        {/if}

        <!-- Grid Settings (visible when grid reference is active) -->
        {#if referenceView === "grid"}
          <section class="settings-section">
            <h4>Grid Settings</h4>
            <p class="section-hint">
              Adjust playback speed for the animated grid
            </p>

            <div class="slider-row">
              <span>Speed (BPM)</span>
              <div class="slider-control">
                <input
                  type="range"
                  min="30"
                  max="120"
                  step="5"
                  value={gridSettings.bpm}
                  oninput={(e) =>
                    onGridSettingsChange({
                      ...gridSettings,
                      bpm: Number(e.currentTarget.value),
                      animated: true,
                    })}
                />
                <span class="slider-value">{gridSettings.bpm}</span>
              </div>
            </div>
          </section>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .sheet-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .sheet-content {
    width: 100%;
    max-width: 480px;
    max-height: 80vh;
    background: var(--theme-panel-elevated-bg, rgba(20, 20, 28, 0.98));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 20px 20px 0 0;
    overflow: hidden;
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
  }

  .sheet-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .close-btn {
    width: 48px; /* WCAG AAA touch target */
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.08));
    border: none;
    border-radius: 50%;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.12));
    color: var(--theme-text, white);
  }

  .sheet-body {
    padding: 16px 20px 32px;
    overflow-y: auto;
    max-height: calc(80vh - 70px);
  }

  .settings-section {
    margin-bottom: 24px;
  }

  .settings-section:last-child {
    margin-bottom: 0;
  }

  .settings-section h4 {
    margin: 0 0 4px;
    font-size: 14px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .section-hint {
    margin: 0 0 12px;
    font-size: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  /* Option Grid */
  .option-grid {
    display: flex;
    gap: 8px;
  }

  .option-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px 8px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .option-btn i {
    font-size: 20px;
  }

  .option-btn:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
  }

  .option-btn.active {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-accent, #3b82f6) 18%, transparent) 0%,
      color-mix(in srgb, var(--theme-accent-strong, #2563eb) 14%, transparent)
        100%
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent, #3b82f6) 45%,
      transparent
    );
    color: var(--theme-accent, #3b82f6);
  }

  .option-btn.active i {
    color: var(--theme-accent, #3b82f6);
  }

  /* Motion Visibility Row */
  .motion-visibility-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 12px;
    padding: 12px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.06));
    border-radius: 12px;
  }

  .visibility-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
  }

  .visibility-buttons {
    display: flex;
    gap: 8px;
  }

  /* Slider Rows */
  .slider-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 0;
  }

  .slider-row > span {
    font-size: 14px;
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
  }

  .slider-control {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .slider-control input[type="range"] {
    flex: 1;
    height: 4px;
    background: color-mix(
      in srgb,
      var(--theme-stroke-strong, rgba(255, 255, 255, 0.18)) 55%,
      transparent
    );
    border-radius: 2px;
    appearance: none;
    cursor: pointer;
  }

  .slider-control input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    background: linear-gradient(
      135deg,
      var(--theme-accent, #3b82f6) 0%,
      var(--theme-accent-strong, #2563eb) 100%
    );
    border-radius: 50%;
    cursor: pointer;
  }

  .slider-value {
    min-width: 40px;
    font-size: 14px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    text-align: right;
  }
</style>
