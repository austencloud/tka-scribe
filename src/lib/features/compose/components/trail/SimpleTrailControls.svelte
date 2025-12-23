<!--
  SimpleTrailControls.svelte

  2026 Bento Box Design - Trail presets
  - Off/Subtle/Vivid preset selector
  - Bilateral prop toggle for both ends vs single end
-->
<script lang="ts">
  import { onMount } from "svelte";
  import {
    animationSettings,
    TrailMode,
    TrackingMode,
  } from "../../../../shared/animation-engine/state/animation-settings-state.svelte";
  import {
    getAnimationVisibilityManager,
    type TrailStyle,
  } from "$lib/shared/animation-engine/state/animation-visibility-state.svelte";
  import { isBilateralProp } from "$lib/shared/pictograph/prop/domain/enums/PropClassification";
  import type { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";

  const animationVisibilityManager = getAnimationVisibilityManager();

  interface Props {
    /** @deprecated Use bluePropType and redPropType instead */
    propType?: PropType | string | null;
    bluePropType?: PropType | string | null;
    redPropType?: PropType | string | null;
  }

  let {
    propType = null,
    bluePropType = null,
    redPropType = null,
  }: Props = $props();

  // Check if EITHER prop is bilateral (staff, buugeng, etc.)
  // This allows users to track both ends even with mixed props
  const showBilateralToggle = $derived.by(() => {
    // Use new props if provided, fall back to legacy propType
    const blue = bluePropType ?? propType;
    const red = redPropType ?? propType;

    const blueIsBilateral = blue != null && isBilateralProp(blue);
    const redIsBilateral = red != null && isBilateralProp(red);

    // Show toggle if either prop is bilateral
    return blueIsBilateral || redIsBilateral;
  });

  // Check if tracking both ends
  const isBothEnds = $derived(
    animationSettings.trail.trackingMode === TrackingMode.BOTH_ENDS
  );

  // Get current trail style from visibility manager (global state)
  let currentPreset = $state<TrailStyle>(animationVisibilityManager.getTrailStyle());

  // Register as observer to get notified when trail style changes
  onMount(() => {
    const handleVisibilityChange = () => {
      currentPreset = animationVisibilityManager.getTrailStyle();
    };

    animationVisibilityManager.registerObserver(handleVisibilityChange);

    return () => {
      animationVisibilityManager.unregisterObserver(handleVisibilityChange);
    };
  });

  // Only show the bilateral toggle when trails are enabled
  const showEndToggle = $derived(
    showBilateralToggle && currentPreset !== "off"
  );

  function setPreset(preset: TrailStyle) {
    // Update global visibility state
    animationVisibilityManager.setTrailStyle(preset);

    // Apply detailed trail appearance settings
    switch (preset) {
      case "off":
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

  function toggleBothEnds() {
    const newMode = isBothEnds
      ? TrackingMode.RIGHT_END
      : TrackingMode.BOTH_ENDS;
    animationSettings.setTrackingMode(newMode);
  }
</script>

<div class="trail-controls">
  <span class="label">Trails</span>
  <div class="preset-buttons">
    <button
      class="preset-btn"
      class:active={currentPreset === "off"}
      onclick={() => setPreset("off")}
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

  {#if showEndToggle}
    <button
      class="ends-toggle"
      class:active={isBothEnds}
      onclick={toggleBothEnds}
      type="button"
      title={isBothEnds ? "Trailing both ends" : "Trailing one end"}
    >
      <i
        class="fas {isBothEnds ? 'fa-arrows-alt-h' : 'fa-long-arrow-alt-right'}"
        aria-hidden="true"
      ></i>
      <span class="ends-label">{isBothEnds ? "Both" : "One"}</span>
    </button>
  {/if}
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
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 14px;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);
  }

  .label {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
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
    min-height: var(--min-touch-target);
    padding: 8px 12px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
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
      background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
      border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.18));
      color: var(--theme-text, rgba(255, 255, 255, 0.8));
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
      color-mix(in srgb, var(--theme-accent, #3b82f6) 22%, transparent) 0%,
      color-mix(in srgb, var(--theme-accent-strong, #2563eb) 18%, transparent)
        100%
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent, #3b82f6) 55%,
      transparent
    );
    color: color-mix(in srgb, var(--theme-accent, #3b82f6) 35%, white);
    box-shadow:
      0 2px 12px
        color-mix(in srgb, var(--theme-accent, #3b82f6) 22%, transparent),
      0 0 16px color-mix(in srgb, var(--theme-accent, #3b82f6) 16%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  /* ===========================
     ENDS TOGGLE
     =========================== */

  .ends-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: var(--min-touch-target);
    padding: 8px 14px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    white-space: nowrap;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);
  }

  .ends-toggle i {
    font-size: 0.85rem;
  }

  .ends-label {
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  @media (hover: hover) and (pointer: fine) {
    .ends-toggle:not(.active):hover {
      background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
      border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.18));
      color: var(--theme-text, rgba(255, 255, 255, 0.8));
      transform: translateY(-1px);
    }
  }

  .ends-toggle:active {
    transform: scale(0.97);
  }

  .ends-toggle.active {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 22%, transparent)
        0%,
      color-mix(in srgb, var(--theme-accent-strong, #7c3aed) 18%, transparent)
        100%
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent-strong, #8b5cf6) 55%,
      transparent
    );
    color: color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 35%, white);
    box-shadow:
      0 2px 12px
        color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 22%, transparent),
      0 0 16px
        color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 16%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  /* ===========================
     ACCESSIBILITY
     =========================== */

  @media (prefers-reduced-motion: reduce) {
    .preset-btn,
    .ends-toggle {
      transition: none;
    }

    .preset-btn:hover,
    .preset-btn:active,
    .ends-toggle:hover,
    .ends-toggle:active {
      transform: none;
    }
  }
</style>
