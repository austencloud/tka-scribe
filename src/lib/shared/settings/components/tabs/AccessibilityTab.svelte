<!-- AccessibilityTab.svelte - User Experience and Accessibility Settings -->
<script lang="ts">
  import { browser } from "$app/environment";
  import ToggleSetting from "../ToggleSetting.svelte";

  interface Props {
    currentSettings: {
      hapticFeedback?: boolean;
      reducedMotion?: boolean;
    };
    onSettingUpdate: (event: { key: string; value: unknown }) => void;
  }

  let { currentSettings, onSettingUpdate }: Props = $props();

  // Local state for immediate UI feedback
  let hapticEnabled = $state(currentSettings.hapticFeedback ?? true);
  let reducedMotion = $state(currentSettings.reducedMotion ?? false);

  // Check if device supports haptic feedback
  const isHapticSupported =
    browser &&
    ("vibrate" in navigator ||
      "mozVibrate" in navigator ||
      "webkitVibrate" in navigator);

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

  function handleHapticToggle(enabled: boolean) {
    hapticEnabled = enabled;

    // Trigger haptic feedback test if enabling
    if (enabled) {
      setTimeout(triggerTestVibration, 150);
    }

    // Update parent settings
    onSettingUpdate({ key: "hapticFeedback", value: enabled });
  }

  function handleReducedMotionToggle(enabled: boolean) {
    reducedMotion = enabled;

    // If reduced motion is enabled, also disable haptic feedback
    if (enabled && hapticEnabled) {
      handleHapticToggle(false);
    }

    // Update parent settings
    onSettingUpdate({ key: "reducedMotion", value: enabled });
  }
</script>

<div class="accessibility-tab">
  <div class="settings-section">
    <div class="section-header">
      <h3>🎯 User Experience</h3>
      <p>Customize interaction feedback and motion preferences</p>
    </div>

    <div class="setting-group">
      <!-- Haptic Feedback Setting -->
      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">
            <span class="label-text">Haptic Feedback</span>
            {#if !isHapticSupported}
              <span class="not-supported-badge">Not Supported</span>
            {/if}
          </div>
          <div class="setting-description">
            Enable vibration feedback for touch interactions on mobile devices
          </div>
        </div>
        <div class="setting-control">
          <ToggleSetting
            checked={hapticEnabled && isHapticSupported}
            disabled={!isHapticSupported}
            onchange={(enabled: boolean) => handleHapticToggle(enabled)}
            label="Toggle haptic feedback"
            compact={true}
          />
        </div>
      </div>

      <!-- Reduced Motion Setting -->
      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">
            <span class="label-text">Reduce Motion</span>
          </div>
          <div class="setting-description">
            Minimize animations and transitions throughout the app for better
            accessibility
          </div>
        </div>
        <div class="setting-control">
          <ToggleSetting
            checked={reducedMotion}
            onchange={(enabled: boolean) => handleReducedMotionToggle(enabled)}
            label="Toggle reduced motion"
            compact={true}
          />
        </div>
      </div>
    </div>

    {#if !isHapticSupported}
      <div class="info-note">
        <span class="info-icon">ℹ️</span>
        <div class="info-content">
          <strong>Haptic feedback is not available on this device.</strong>
          <br />This feature requires a mobile device with vibration support.
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .accessibility-tab {
    padding: 0;
    max-width: 100%;
    width: 100%;
    overflow-x: hidden; /* Prevent horizontal overflow */
  }

  .settings-section {
    margin-bottom: 0;
  }

  .section-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .section-header h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-color, white);
    margin: 0 0 6px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-header p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
    line-height: 1.4;
  }

  .setting-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center; /* Align center instead of flex-start for compact layout */
    gap: 12px;
    padding: 12px 10px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    transition: background-color 0.2s ease;
    max-width: 100%;
  }

  /* Mobile - even more compact */
  @media (max-width: 480px) {
    .setting-item {
      padding: 10px 8px;
      gap: 10px;
    }
  }

  .setting-item:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .setting-info {
    flex: 1;
    min-width: 0; /* Allow text to wrap properly */
    max-width: calc(100% - 70px); /* Reserve space for toggle */
  }

  .setting-label {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
    flex-wrap: wrap; /* Allow badge to wrap if needed */
  }

  .label-text {
    font-size: 15px;
    font-weight: 500;
    color: var(--text-color, white);
  }

  /* Mobile - smaller text */
  @media (max-width: 480px) {
    .label-text {
      font-size: 13px;
    }

    .setting-info {
      max-width: calc(100% - 60px); /* Less space for smaller toggle */
    }
  }

  .not-supported-badge {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    white-space: nowrap;
  }

  .setting-description {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.3;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  /* Mobile - even smaller description */
  @media (max-width: 480px) {
    .setting-description {
      font-size: 11px;
      line-height: 1.25;
    }
  }

  .setting-control {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
  }

  .info-note {
    display: flex;
    gap: 10px;
    padding: 12px;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 10px;
    margin-top: 12px;
  }

  .info-icon {
    font-size: 18px;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .info-content {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.4;
  }

  /* Mobile - smaller info note */
  @media (max-width: 480px) {
    .info-note {
      padding: 10px;
      gap: 8px;
    }

    .info-icon {
      font-size: 16px;
    }

    .info-content {
      font-size: 12px;
      line-height: 1.3;
    }
  }

  .info-content strong {
    color: var(--text-color, white);
  }

  /* Remove the mobile responsive that causes stacking */
  /* We want to keep the toggle on the right side always */

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .setting-item {
      transition: none;
    }
  }
</style>
