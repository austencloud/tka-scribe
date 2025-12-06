<!--
  SimpleTrailControls.svelte

  2026 Bento Box Design - Trail presets
  - Off/Subtle/Vivid preset selector
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
  /* ===========================
     2026 BENTO BOX DESIGN
     Trail Controls
     =========================== */

  .trail-controls {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.04);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);
  }

  .label {
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }

  .preset-buttons {
    display: flex;
    gap: 6px;
    flex: 1;
  }

  .preset-btn {
    flex: 1;
    min-height: 52px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.04);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);
  }

  @media (hover: hover) and (pointer: fine) {
    .preset-btn:not(.active):hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.18);
      color: rgba(255, 255, 255, 0.8);
      transform: translateY(-1px);
      box-shadow:
        0 2px 8px rgba(0, 0, 0, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }
  }

  .preset-btn:active {
    transform: scale(0.97);
  }

  .preset-btn.active {
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.25) 0%,
      rgba(37, 99, 235, 0.2) 100%
    );
    border-color: rgba(59, 130, 246, 0.5);
    color: rgba(191, 219, 254, 1);
    box-shadow:
      0 2px 12px rgba(59, 130, 246, 0.2),
      0 0 16px rgba(59, 130, 246, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  /* ===========================
     ACCESSIBILITY
     =========================== */

  @media (prefers-reduced-motion: reduce) {
    .preset-btn {
      transition: none;
    }

    .preset-btn:hover,
    .preset-btn:active {
      transform: none;
    }
  }
</style>
