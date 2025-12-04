<!--
  SimpleTrailControls.svelte

  Dramatically simplified trail controls:
  - On/Off toggle
  - Preset selector (None, Subtle, Vivid)

  That's it. No MODE, TRACK, FADE, WIDTH, OPACITY, Glow, Hide Props.
-->
<script lang="ts">
  import {
    animationSettings,
    TrailMode,
  } from "../../../../shared/animation-engine/state/animation-settings-state.svelte";

  type TrailPreset = "none" | "subtle" | "vivid";

  // Determine current preset from settings
  const currentPreset = $derived.by((): TrailPreset => {
    const trail = animationSettings.trail;
    if (!trail.enabled || trail.mode === TrailMode.OFF) return "none";
    if (trail.lineWidth <= 2.5 && trail.maxOpacity <= 0.7) return "subtle";
    return "vivid";
  });

  function setPreset(preset: TrailPreset) {
    switch (preset) {
      case "none":
        animationSettings.setTrailMode(TrailMode.OFF);
        break;
      case "subtle":
        animationSettings.setTrailMode(TrailMode.FADE);
        animationSettings.setFadeDuration(1500);
        animationSettings.setTrailAppearance({
          lineWidth: 2.5,
          maxOpacity: 0.7,
          glowEnabled: false,
        });
        break;
      case "vivid":
        animationSettings.setTrailMode(TrailMode.FADE);
        animationSettings.setFadeDuration(2500);
        animationSettings.setTrailAppearance({
          lineWidth: 4,
          maxOpacity: 0.95,
          glowEnabled: true,
        });
        break;
    }
  }
</script>

<div class="trail-controls">
  <span class="label">Trails</span>
  <div class="preset-buttons">
    <button
      class="preset-btn"
      class:active={currentPreset === "none"}
      onclick={() => setPreset("none")}
      type="button"
    >
      Off
    </button>
    <button
      class="preset-btn"
      class:active={currentPreset === "subtle"}
      onclick={() => setPreset("subtle")}
      type="button"
    >
      Subtle
    </button>
    <button
      class="preset-btn"
      class:active={currentPreset === "vivid"}
      onclick={() => setPreset("vivid")}
      type="button"
    >
      Vivid
    </button>
  </div>
</div>

<style>
  .trail-controls {
    display: flex;
    align-items: center;
    gap: clamp(8px, 2cqi, 12px);
    padding: clamp(8px, 2cqi, 12px);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: clamp(8px, 2cqi, 12px);
  }

  .label {
    font-size: clamp(11px, 3cqi, 13px);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }

  .preset-buttons {
    display: flex;
    gap: clamp(4px, 1cqi, 6px);
    flex: 1;
  }

  .preset-btn {
    flex: 1;
    min-height: var(--touch-target-min);
    padding: clamp(8px, 2cqi, 12px) clamp(12px, 3cqi, 16px);
    background: rgba(255, 255, 255, 0.06);
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: clamp(6px, 1.5cqi, 8px);
    color: rgba(255, 255, 255, 0.6);
    font-size: clamp(11px, 3cqi, 13px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .preset-btn.active {
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.4) 0%,
      rgba(37, 99, 235, 0.4) 100%
    );
    border-color: rgba(59, 130, 246, 0.7);
    color: rgba(191, 219, 254, 1);
    box-shadow: 0 2px 12px rgba(59, 130, 246, 0.3);
  }

  .preset-btn:not(.active):hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.25);
    color: rgba(255, 255, 255, 0.8);
  }

  .preset-btn:active {
    transform: scale(0.97);
  }
</style>
