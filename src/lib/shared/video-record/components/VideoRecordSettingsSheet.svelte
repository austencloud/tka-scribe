<!--
  VideoRecordSettingsSheet.svelte

  Settings sheet for video recording options.
  Controls reference view, animation settings, and grid settings.
-->
<script lang="ts">
  import type { ReferenceViewType, AnimationSettings, GridSettings } from "../state/video-record-settings.svelte";

  let {
    isOpen = false,
    isMobile = false,
    referenceView,
    animationSettings,
    gridSettings,
    onClose = () => {},
    onReferenceViewChange = () => {},
    onAnimationSettingsChange = () => {},
    onGridSettingsChange = () => {},
  }: {
    isOpen: boolean;
    isMobile: boolean;
    referenceView: ReferenceViewType;
    animationSettings: AnimationSettings;
    gridSettings: GridSettings;
    onClose?: () => void;
    onReferenceViewChange?: (view: ReferenceViewType) => void;
    onAnimationSettingsChange?: (settings: AnimationSettings) => void;
    onGridSettingsChange?: (settings: GridSettings) => void;
  } = $props();

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
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="sheet-backdrop" onclick={handleBackdropClick}>
    <div class="sheet-content" role="dialog" aria-modal="true">
      <div class="sheet-header">
        <h3>Recording Settings</h3>
        <button class="close-btn" onclick={onClose} aria-label="Close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="sheet-body">
        <!-- Reference View Section -->
        <section class="settings-section">
          <h4>Reference View</h4>
          <p class="section-hint">Choose what to display alongside your camera feed</p>

          <div class="option-grid">
            {#if !isMobile}
              <button
                class="option-btn"
                class:active={referenceView === "none"}
                onclick={() => onReferenceViewChange("none")}
              >
                <i class="fas fa-video"></i>
                <span>Camera Only</span>
              </button>
            {/if}
            <button
              class="option-btn"
              class:active={referenceView === "animation"}
              onclick={() => onReferenceViewChange("animation")}
            >
              <i class="fas fa-play-circle"></i>
              <span>Animation</span>
            </button>
            <button
              class="option-btn"
              class:active={referenceView === "grid"}
              onclick={() => onReferenceViewChange("grid")}
            >
              <i class="fas fa-th"></i>
              <span>Grid</span>
            </button>
          </div>
        </section>

        <!-- Animation Settings (visible when animation reference is active) -->
        {#if referenceView === "animation"}
          <section class="settings-section">
            <h4>Animation Settings</h4>

            <div class="toggle-row">
              <span>Show Trails</span>
              <button
                class="toggle-switch"
                class:on={animationSettings.showTrails}
                onclick={() => onAnimationSettingsChange({ ...animationSettings, showTrails: !animationSettings.showTrails })}
                aria-pressed={animationSettings.showTrails}
              >
                <span class="toggle-knob"></span>
              </button>
            </div>

            <div class="toggle-row">
              <span>Blue Motion Visible</span>
              <button
                class="toggle-switch"
                class:on={animationSettings.blueMotionVisible}
                onclick={() => onAnimationSettingsChange({ ...animationSettings, blueMotionVisible: !animationSettings.blueMotionVisible })}
                aria-pressed={animationSettings.blueMotionVisible}
              >
                <span class="toggle-knob"></span>
              </button>
            </div>

            <div class="toggle-row">
              <span>Red Motion Visible</span>
              <button
                class="toggle-switch"
                class:on={animationSettings.redMotionVisible}
                onclick={() => onAnimationSettingsChange({ ...animationSettings, redMotionVisible: !animationSettings.redMotionVisible })}
                aria-pressed={animationSettings.redMotionVisible}
              >
                <span class="toggle-knob"></span>
              </button>
            </div>
          </section>
        {/if}

        <!-- Grid Settings (visible when grid reference is active) -->
        {#if referenceView === "grid"}
          <section class="settings-section">
            <h4>Grid Settings</h4>

            <div class="toggle-row">
              <span>Animate Grid</span>
              <button
                class="toggle-switch"
                class:on={gridSettings.animated}
                onclick={() => onGridSettingsChange({ ...gridSettings, animated: !gridSettings.animated })}
                aria-pressed={gridSettings.animated}
              >
                <span class="toggle-knob"></span>
              </button>
            </div>

            {#if gridSettings.animated}
              <div class="slider-row">
                <span>Speed (BPM)</span>
                <div class="slider-control">
                  <input
                    type="range"
                    min="30"
                    max="120"
                    step="5"
                    value={gridSettings.bpm}
                    oninput={(e) => onGridSettingsChange({ ...gridSettings, bpm: Number(e.currentTarget.value) })}
                  />
                  <span class="slider-value">{gridSettings.bpm}</span>
                </div>
              </div>
            {/if}
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
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .sheet-content {
    width: 100%;
    max-width: 480px;
    max-height: 80vh;
    background: linear-gradient(
      180deg,
      rgba(30, 30, 40, 0.98) 0%,
      rgba(20, 20, 28, 0.98) 100%
    );
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
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .sheet-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .close-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.7);
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    color: white;
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
    color: rgba(255, 255, 255, 0.9);
  }

  .section-hint {
    margin: 0 0 12px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
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
    background: rgba(255, 255, 255, 0.05);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .option-btn i {
    font-size: 20px;
  }

  .option-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.8);
  }

  .option-btn.active {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.12) 100%);
    border-color: rgba(59, 130, 246, 0.4);
    color: rgba(59, 130, 246, 1);
  }

  .option-btn.active i {
    color: rgba(59, 130, 246, 1);
  }

  /* Toggle Rows */
  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .toggle-row:last-child {
    border-bottom: none;
  }

  .toggle-row span {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  }

  /* Toggle Switch */
  .toggle-switch {
    width: 48px;
    height: 28px;
    padding: 2px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .toggle-switch.on {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  }

  .toggle-knob {
    display: block;
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s ease;
  }

  .toggle-switch.on .toggle-knob {
    transform: translateX(20px);
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
    color: rgba(255, 255, 255, 0.8);
  }

  .slider-control {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .slider-control input[type="range"] {
    flex: 1;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    appearance: none;
    cursor: pointer;
  }

  .slider-control input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-radius: 50%;
    cursor: pointer;
  }

  .slider-value {
    min-width: 40px;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    text-align: right;
  }
</style>
