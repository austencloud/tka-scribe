<!-- IOSTabBar.svelte - True iOS-native bottom tab bar -->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";

  interface Tab {
    id: string;
    label: string;
    icon: string;
  }

  let { tabs, activeTab, onTabSelect } = $props<{
    tabs: Tab[];
    activeTab: string;
    onTabSelect: (tabId: string) => void;
  }>();

  // Services
  let hapticService: IHapticFeedbackService | null = null;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  function handleTabClick(tabId: string) {
    // iOS uses light impact for tab selection (using "selection" pattern)
    hapticService?.trigger("selection");
    onTabSelect(tabId);
  }
</script>

<div class="ios-tab-bar" role="tablist">
  {#each tabs as tab}
    <button
      class="ios-tab-item"
      class:active={activeTab === tab.id}
      onclick={() => handleTabClick(tab.id)}
      role="tab"
      aria-selected={activeTab === tab.id}
      aria-label={tab.label}
    >
      <!-- svelte-ignore svelte/no-at-html-tags -->
      <span class="tab-icon" aria-hidden="true">{@html tab.icon}</span>
      <span class="tab-label">{tab.label}</span>
    </button>
  {/each}
</div>

<style>
  /* iOS Tab Bar - HIG 2025 Specification (systemMaterial) */
  .ios-tab-bar {
    display: flex;
    height: 49px; /* iOS standard tab bar height */
    width: 100%;
    /* systemMaterial approximation - very translucent, adapts to content */
    background: rgba(28, 28, 30, 0.72); /* iOS system material dark base */
    backdrop-filter: blur(30px) saturate(180%);
    -webkit-backdrop-filter: blur(30px) saturate(180%);
    border-top: 0.33px solid rgba(255, 255, 255, 0.16); /* iOS hairline border */
    position: relative;
    /* iOS uses system fonts */
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  /* Tab Item */
  .ios-tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px; /* Improved spacing between icon and label */
    padding: 0 4px; /* Add horizontal breathing room */
    border: none;
    background: transparent;
    cursor: pointer;
    position: relative;
    /* iOS spring animation - approximated with cubic-bezier */
    transition: transform 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);
    -webkit-tap-highlight-color: transparent;
    min-width: 0;
  }

  /* Tab Icon */
  .tab-icon {
    font-size: 22px; /* Slightly smaller for better balance and less cramping */
    line-height: 1;
    color: rgba(235, 235, 245, 0.6); /* iOS label tertiary (vibrancy) */
    transition:
      color 0.2s ease,
      transform 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);
    will-change: transform;
    /* iOS vibrancy effect - blend mode for better legibility on blurred background */
    mix-blend-mode: plus-lighter;
    text-shadow:
      0 0 1px rgba(255, 255, 255, 0.1),
      0 1px 2px rgba(0, 0, 0, 0.1);
  }

  /* Tab Label */
  .tab-label {
    font-size: 10px; /* iOS tab bar label size */
    font-weight: 500;
    letter-spacing: -0.08px; /* iOS tight tracking */
    color: rgba(235, 235, 245, 0.6); /* iOS label tertiary (vibrancy) */
    transition: color 0.2s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    /* iOS vibrancy effect - blend mode for better legibility */
    mix-blend-mode: plus-lighter;
    text-shadow:
      0 0 1px rgba(255, 255, 255, 0.1),
      0 1px 2px rgba(0, 0, 0, 0.1);
  }

  /* Active State - iOS tint color */
  .ios-tab-item.active .tab-icon,
  .ios-tab-item.active .tab-label {
    color: #007aff; /* iOS system blue tint */
  }

  /* Active state icon bounce (iOS spring effect) */
  .ios-tab-item.active .tab-icon {
    animation: ios-spring 0.4s cubic-bezier(0.36, 0.66, 0.04, 1);
  }

  @keyframes ios-spring {
    0% {
      transform: scale(1);
    }
    40% {
      transform: scale(1.15);
    }
    70% {
      transform: scale(0.95);
    }
    100% {
      transform: scale(1);
    }
  }

  /* Press Effect - iOS standard */
  .ios-tab-item:active {
    transform: scale(0.92);
  }

  .ios-tab-item:active .tab-icon {
    transform: scale(0.88);
  }

  /* Focus State for Keyboard Navigation - iOS 15+ Enhanced */
  .ios-tab-item:focus-visible {
    outline: none;
    background: rgba(0, 122, 255, 0.08);
  }

  .ios-tab-item:focus-visible::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 12px;
    border: 3px solid #007aff; /* iOS 15+ thicker focus ring */
    box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.2); /* iOS glow effect */
    pointer-events: none;
    animation: ios-focus-pulse 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);
  }

  @keyframes ios-focus-pulse {
    0% {
      transform: scale(0.95);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* Light Mode - systemMaterial light variant */
  @media (prefers-color-scheme: light) {
    .ios-tab-bar {
      /* systemMaterial light - more translucent white */
      background: rgba(249, 249, 249, 0.78);
      backdrop-filter: blur(30px) saturate(180%);
      -webkit-backdrop-filter: blur(30px) saturate(180%);
      border-top: 0.33px solid rgba(0, 0, 0, 0.12);
    }

    .tab-icon,
    .tab-label {
      color: rgba(60, 60, 67, 0.6); /* iOS label tertiary light */
      mix-blend-mode: multiply; /* iOS vibrancy for light mode */
      text-shadow:
        0 0 1px rgba(0, 0, 0, 0.05),
        0 0.5px 1px rgba(255, 255, 255, 0.8);
    }

    .ios-tab-item.active .tab-icon,
    .ios-tab-item.active .tab-label {
      color: #007aff;
      mix-blend-mode: normal; /* Remove blend mode for active state */
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .ios-tab-item,
    .tab-icon,
    .tab-label {
      transition: none;
    }

    .ios-tab-item.active .tab-icon {
      animation: none;
    }

    .ios-tab-item:active,
    .ios-tab-item:active .tab-icon {
      transform: none;
    }
  }

  /* High Contrast Mode - reduced blur for clarity while maintaining material */
  @media (prefers-contrast: high) {
    .ios-tab-bar {
      background: rgba(28, 28, 30, 0.92);
      /* iOS uses reduced blur in high contrast, not none */
      backdrop-filter: blur(12px) saturate(150%);
      -webkit-backdrop-filter: blur(12px) saturate(150%);
      border-top: 1px solid rgba(255, 255, 255, 0.4);
    }

    .tab-icon,
    .tab-label {
      color: rgba(255, 255, 255, 0.9);
      text-shadow: none;
      mix-blend-mode: normal; /* Disable blend mode in high contrast */
    }

    .ios-tab-item.active .tab-icon,
    .ios-tab-item.active .tab-label {
      color: #0a84ff; /* Higher contrast blue */
    }
  }

  /* High Contrast + Light Mode */
  @media (prefers-contrast: high) and (prefers-color-scheme: light) {
    .ios-tab-bar {
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(12px) saturate(150%);
      -webkit-backdrop-filter: blur(12px) saturate(150%);
      border-top: 1px solid rgba(0, 0, 0, 0.3);
    }

    .tab-icon,
    .tab-label {
      color: rgba(0, 0, 0, 0.9);
      mix-blend-mode: normal; /* Disable blend mode in high contrast */
    }
  }
</style>
