<!-- AccessibilityTab.svelte - Modern User Experience Settings -->
<script lang="ts">
  import { browser } from "$app/environment";
  import type { IHapticFeedbackService } from "../../../application/services/contracts/IHapticFeedbackService";
  import type { IMobileFullscreenService } from "../../../mobile/services/contracts/IMobileFullscreenService";
  import { resolve } from "../../../inversify";
  import { TYPES } from "../../../inversify/types";
  import { nuclearCacheClear } from "../../../auth";
  import { onMount } from "svelte";
  import EnhancedPWAInstallGuide from "$lib/shared/mobile/components/EnhancedPWAInstallGuide.svelte";

  interface Props {
    currentSettings: {
      hapticFeedback?: boolean;
      reducedMotion?: boolean;
    };
    onSettingUpdate: (event: { key: string; value: unknown }) => void;
  }

  let { currentSettings, onSettingUpdate }: Props = $props();

  // Services
  let _hapticService: IHapticFeedbackService;
  let fullscreenService: IMobileFullscreenService | null = null;

  // Local state for immediate UI feedback
  let hapticEnabled = $state(currentSettings.hapticFeedback ?? true);
  let reducedMotion = $state(currentSettings.reducedMotion ?? false);
  let isFullscreen = $state(false);
  let isPWA = $state(false);
  let clearing = $state(false);
  let showPWAGuide = $state(false);

  // Check if device supports haptic feedback
  const isHapticSupported =
    browser &&
    ("vibrate" in navigator ||
      "mozVibrate" in navigator ||
      "webkitVibrate" in navigator);

  // Check if fullscreen is supported
  const isFullscreenSupported =
    browser &&
    !!(
      document.fullscreenEnabled ||
      (document as any).webkitFullscreenEnabled ||
      (document as any).mozFullScreenEnabled ||
      (document as any).msFullscreenEnabled
    );

  onMount(() => {
    _hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );

    try {
      fullscreenService = resolve<IMobileFullscreenService>(
        TYPES.IMobileFullscreenService
      );
      isPWA = fullscreenService.isPWA();
      isFullscreen = fullscreenService.isFullscreen();

      // Listen for fullscreen changes
      const unsubscribe = fullscreenService.onFullscreenChange(
        (fullscreen: boolean) => {
          isFullscreen = fullscreen;
        }
      );

      return () => {
        unsubscribe?.();
      };
    } catch (error) {
      console.warn("Failed to resolve fullscreen service:", error);
      fullscreenService = null;
      return undefined;
    }
  });

  // Watch for external changes to settings
  $effect(() => {
    hapticEnabled = currentSettings.hapticFeedback ?? true;
    reducedMotion = currentSettings.reducedMotion ?? false;
  });

  function triggerTestVibration() {
    if (browser && isHapticSupported) {
      try {
        navigator.vibrate([100, 30, 50]); // Success pattern
      } catch (error) {
        console.warn("Test vibration failed:", error);
      }
    }
  }

  function handleHapticToggle(event: Event) {
    const target = event.target as HTMLInputElement;
    const enabled = target.checked;
    hapticEnabled = enabled;

    // Trigger haptic feedback test if enabling
    if (enabled) {
      setTimeout(triggerTestVibration, 150);
    }

    // Update parent settings
    onSettingUpdate({ key: "hapticFeedback", value: enabled });
  }

  function handleReducedMotionToggle(event: Event) {
    const target = event.target as HTMLInputElement;
    const enabled = target.checked;
    reducedMotion = enabled;

    // Update parent settings
    onSettingUpdate({ key: "reducedMotion", value: enabled });
  }

  async function handleFullscreenToggle(event: Event) {
    const target = event.target as HTMLInputElement;
    const shouldBeFullscreen = target.checked;

    if (!fullscreenService) {
      // Fallback to direct DOM API
      try {
        if (shouldBeFullscreen) {
          const element = document.documentElement;
          if (element.requestFullscreen) {
            await element.requestFullscreen();
          } else if ((element as any).webkitRequestFullscreen) {
            await (element as any).webkitRequestFullscreen();
          } else if ((element as any).mozRequestFullScreen) {
            await (element as any).mozRequestFullScreen();
          } else if ((element as any).msRequestFullscreen) {
            await (element as any).msRequestFullscreen();
          }
        } else {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if ((document as any).webkitExitFullscreen) {
            await (document as any).webkitExitFullscreen();
          } else if ((document as any).mozCancelFullScreen) {
            await (document as any).mozCancelFullScreen();
          } else if ((document as any).msExitFullscreen) {
            await (document as any).msExitFullscreen();
          }
        }
      } catch (error) {
        console.warn("Fullscreen toggle failed:", error);
      }
    } else {
      // Use fullscreen service
      try {
        if (shouldBeFullscreen) {
          await fullscreenService.requestFullscreen();
        } else {
          await fullscreenService.exitFullscreen();
        }
      } catch (error) {
        console.warn("Fullscreen toggle failed:", error);
      }
    }
  }

  async function clearCache() {
    if (
      !confirm(
        "⚠️ CLEAR ALL CACHE ⚠️\n\n" +
          "This will DELETE ALL cached data and reload the page.\n\n" +
          "Continue?"
      )
    ) {
      return;
    }

    clearing = true;
    try {
      await nuclearCacheClear();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Failed to clear cache:", error);
      alert("Failed to clear cache. Check console.");
      clearing = false;
    }
  }
</script>

<div class="experience-tab">
  <!-- Settings List - Clean & Minimal -->
  <div class="settings-list">
    <!-- Haptic Feedback -->
    <div class="setting-row" class:disabled={!isHapticSupported}>
      <div class="setting-label">
        <span>Haptic Feedback</span>
        {#if !isHapticSupported}
          <span class="unavailable">(unavailable)</span>
        {/if}
      </div>
      <label class="toggle-switch">
        <input
          type="checkbox"
          checked={hapticEnabled && isHapticSupported}
          disabled={!isHapticSupported}
          onchange={handleHapticToggle}
          aria-label="Toggle haptic feedback"
        />
        <span class="toggle-slider"></span>
      </label>
    </div>

    <!-- Reduced Motion -->
    <div class="setting-row">
      <div class="setting-label">
        <span>Reduce Motion</span>
      </div>
      <label class="toggle-switch">
        <input
          type="checkbox"
          checked={reducedMotion}
          onchange={handleReducedMotionToggle}
          aria-label="Toggle reduced motion"
        />
        <span class="toggle-slider"></span>
      </label>
    </div>

    <!-- Fullscreen Mode -->
    {#if !isPWA}
      <div class="setting-row" class:disabled={!isFullscreenSupported}>
        <div class="setting-label">
          <span>Fullscreen Mode</span>
          {#if !isFullscreenSupported}
            <span class="unavailable">(unavailable)</span>
          {/if}
        </div>
        <label class="toggle-switch">
          <input
            type="checkbox"
            checked={isFullscreen && isFullscreenSupported}
            disabled={!isFullscreenSupported}
            onchange={handleFullscreenToggle}
            aria-label="Toggle fullscreen mode"
          />
          <span class="toggle-slider"></span>
        </label>
      </div>
    {/if}

    <!-- Cache Clear -->
    <div class="setting-row cache-row">
      <div class="setting-label">
        <span>Clear Cache</span>
      </div>
      <button
        class="clear-cache-btn"
        onclick={clearCache}
        disabled={clearing}
        aria-label="Clear all cached data and reload the app"
      >
        {clearing ? "Clearing..." : "Clear"}
      </button>
    </div>
  </div>
</div>

<!-- PWA Installation Guide -->
<EnhancedPWAInstallGuide bind:showGuide={showPWAGuide} />

<style>
  .experience-tab {
    display: flex;
    flex-direction: column;
    gap: 2cqh; /* Use container height for gaps */
    max-width: 600px;
    width: 100%;
    height: 100%;
    margin: 0 auto;
    padding: 2cqh 3cqw;
    container-type: inline-size;
    justify-content: center; /* Center content vertically */
  }

  /* Compact layout when parent container height is limited */
  @container settings-content (max-height: 600px) {
    .experience-tab {
      gap: 1.5cqh;
      padding: 1.5cqh 2cqw;
    }
  }

  @container settings-content (max-height: 500px) {
    .experience-tab {
      gap: 1cqh;
      padding: 1cqh 1.5cqw;
    }
  }

  /* Settings List Container - iOS Glass Morphism */
  .settings-list {
    background: rgba(255, 255, 255, 0.04);
    border: 0.33px solid rgba(255, 255, 255, 0.16); /* iOS hairline border */
    border-radius: 12px; /* iOS medium corner radius */
    overflow: hidden;
    box-shadow:
      0 3px 12px rgba(0, 0, 0, 0.12),
      0 1px 3px rgba(0, 0, 0, 0.08); /* iOS Photos.app shadow */
  }

  /* Individual Setting Row - iOS List Style */
  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2cqh 3cqw;
    border-bottom: 0.33px solid rgba(255, 255, 255, 0.08); /* iOS hairline */
    transition: background 0.3s cubic-bezier(0.36, 0.66, 0.04, 1); /* iOS spring */
  }

  /* Compact rows when height is limited */
  @container settings-content (max-height: 600px) {
    .setting-row {
      padding: 1.5cqh 2.5cqw;
    }
  }

  @container settings-content (max-height: 500px) {
    .setting-row {
      padding: 1.2cqh 2cqw;
    }
  }

  .setting-row:last-child {
    border-bottom: none;
  }

  .setting-row:hover:not(.disabled) {
    background: rgba(255, 255, 255, 0.02);
  }

  .setting-row.disabled {
    opacity: 0.5;
  }

  .setting-row.cache-row {
    background: rgba(255, 69, 58, 0.05); /* iOS system red tint */
  }

  /* Setting Label - iOS Typography */
  .setting-label {
    display: flex;
    align-items: center;
    gap: 1cqw;
    font-size: clamp(14px, 2.5cqw, 17px); /* iOS body text */
    font-weight: 400; /* iOS regular */
    letter-spacing: -0.41px; /* iOS body tracking - exact spec */
    line-height: 1.29; /* iOS body ratio */
    color: rgba(255, 255, 255, 0.95);
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  .setting-label .unavailable {
    font-size: clamp(11px, 2cqw, 13px); /* iOS footnote */
    font-weight: 400;
    letter-spacing: -0.08px; /* iOS footnote tracking */
    line-height: 1.38; /* iOS footnote ratio */
    color: rgba(255, 255, 255, 0.5);
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  /* iOS Toggle Switch - Exact Dimensions */
  .toggle-switch {
    flex-shrink: 0;
    position: relative;
    display: inline-block;
    width: 51px; /* iOS exact toggle width */
    height: 31px; /* iOS exact toggle height */
    cursor: pointer;
  }

  .toggle-switch input {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
    margin: 0;
    z-index: 2;
    top: 0;
    left: 0;
  }

  /* iOS Toggle Track */
  .toggle-slider {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(120, 120, 128, 0.32); /* iOS toggle off - exact */
    border-radius: 999px; /* Pill shape */
    transition: all 0.3s cubic-bezier(0.36, 0.66, 0.04, 1); /* iOS spring */
    box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.04); /* Subtle inset border */
  }

  /* iOS Toggle Knob */
  .toggle-slider:before {
    content: "";
    position: absolute;
    height: 27px; /* iOS exact knob size */
    width: 27px;
    left: 2px; /* iOS exact offset */
    top: 2px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s cubic-bezier(0.36, 0.66, 0.04, 1); /* iOS spring */
    box-shadow:
      0 3px 8px rgba(0, 0, 0, 0.15),
      0 1px 2px rgba(0, 0, 0, 0.1); /* iOS exact shadow */
  }

  /* iOS Toggle - Checked State (System Green) */
  input:checked + .toggle-slider {
    background: #34c759; /* iOS system green - exact hex */
  }

  input:checked + .toggle-slider:before {
    left: 22px; /* iOS exact checked position (51px - 27px - 2px) */
  }

  input:disabled + .toggle-slider {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Clear Cache Button - iOS System Red */
  .clear-cache-btn {
    padding: 1.5cqh 3cqw;
    border-radius: 10px; /* iOS button radius */
    border: none;
    font-size: clamp(12px, 2cqw, 15px); /* iOS footnote to body */
    font-weight: 600; /* iOS semibold */
    letter-spacing: -0.08px; /* iOS footnote tracking */
    line-height: 1.38;
    cursor: pointer;
    background: #ff3b30; /* iOS system red - exact hex */
    color: white;
    min-height: 44px; /* iOS minimum touch target */
    transition: all 0.3s cubic-bezier(0.36, 0.66, 0.04, 1); /* iOS spring */
    box-shadow:
      0 3px 12px rgba(255, 59, 48, 0.3),
      0 1px 3px rgba(255, 59, 48, 0.2);
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  /* Compact button when height is limited */
  @container settings-content (max-height: 500px) {
    .clear-cache-btn {
      padding: 1cqh 2cqw;
      min-height: 36px;
    }
  }

  .clear-cache-btn:hover:not(:disabled) {
    background: #d63026; /* iOS system red darker */
    box-shadow:
      0 6px 18px rgba(255, 59, 48, 0.4),
      0 2px 4px rgba(255, 59, 48, 0.25);
    transform: translateY(-1px);
  }

  .clear-cache-btn:active:not(:disabled) {
    transform: scale(0.98);
    transition-duration: 0.1s; /* iOS immediate feedback */
  }

  .clear-cache-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .clear-cache-btn:focus-visible {
    outline: 3px solid #ff3b30; /* iOS 15+ thicker focus ring */
    outline-offset: 2px;
    box-shadow:
      0 6px 18px rgba(255, 59, 48, 0.4),
      0 2px 4px rgba(255, 59, 48, 0.25),
      0 0 0 4px rgba(255, 59, 48, 0.2); /* iOS glow effect */
  }

  /* Desktop: Better sizing and spacing */
  @media (min-width: 769px) {
    .experience-tab {
      gap: clamp(20px, 4vh, 24px);
      padding: clamp(20px, 3vw, 32px);
      max-width: 560px; /* Better width for desktop readability */
    }

    .setting-row {
      padding: clamp(14px, 2.5vw, 16px) clamp(16px, 3vw, 20px);
    }

    .clear-cache-btn {
      max-width: 140px; /* Prevent button from stretching too wide */
    }
  }

  /* iOS Accessibility - Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .setting-row,
    .toggle-slider,
    .toggle-slider:before,
    .clear-cache-btn {
      transition: none;
      animation: none;
    }

    .clear-cache-btn:hover,
    .clear-cache-btn:active {
      transform: none;
    }
  }

  /* iOS Accessibility - High Contrast */
  @media (prefers-contrast: high) {
    .settings-list {
      border-width: 2px;
      border-color: rgba(255, 255, 255, 0.3);
    }

    .toggle-slider {
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    input:checked + .toggle-slider {
      border-color: #34c759;
    }

    .clear-cache-btn {
      border: 2px solid #ff3b30;
    }
  }
</style>
