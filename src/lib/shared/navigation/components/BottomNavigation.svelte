<!-- Bottom Navigation for Portrait Mobile - Adaptive Container Query Based -->
<script lang="ts">
  import { onMount } from "svelte";
  import { getShowSettings, toggleSettingsDialog } from "../../application/state/app-state.svelte";
  import type { ModeOption } from "../domain/types";

  let {
    subModeTabs = [],
    currentSubMode,
    onSubModeChange,
    onModuleSwitcherTap,
  } = $props<{
    subModeTabs: ModeOption[];
    currentSubMode: string;
    onSubModeChange?: (subModeId: string) => void;
    onModuleSwitcherTap?: () => void;
  }>();

  // Ref to nav element for container query support detection
  let navElement = $state<HTMLElement | null>(null);

  // Abbreviated labels for compact mode
  const abbreviations: Record<string, string> = {
    Construct: "Build",
    Generate: "Gen",
    Animate: "Play",
    Share: "Share",
    Settings: "Set",
    Menu: "Menu",
  };

  function handleSubModeTap(subMode: ModeOption) {
    if (!subMode.disabled) {
      onSubModeChange?.(subMode.id);
    }
  }

  function handleModuleSwitcher() {
    onModuleSwitcherTap?.();
  }

  function handleSettingsTap() {
    toggleSettingsDialog();
  }

  // Get abbreviated label if available
  function getCompactLabel(fullLabel: string): string {
    return abbreviations[fullLabel] || fullLabel;
  }

  onMount(() => {
    // Feature detection for container queries
    if (navElement && !CSS.supports("container-type: inline-size")) {
      console.warn("Container queries not supported - falling back to media queries");
    }
  });
</script>

<nav class="bottom-navigation glass-surface" bind:this={navElement}>
  <!-- Module Switcher Button (Left) -->
  <button
    class="nav-button module-switcher"
    onclick={handleModuleSwitcher}
    aria-label="Switch module"
  >
    <span class="nav-icon"><i class="fas fa-bars"></i></span>
    <span class="nav-label nav-label-full">Menu</span>
    <span class="nav-label nav-label-compact">{getCompactLabel("Menu")}</span>
  </button>

  <!-- Current Module's Sub-Mode Tabs -->
  <div class="sub-mode-tabs">
    {#each subModeTabs as subMode}
      <button
        class="nav-button"
        class:active={currentSubMode === subMode.id}
        class:disabled={subMode.disabled}
        onclick={() => handleSubModeTap(subMode)}
        disabled={subMode.disabled}
        aria-label={subMode.label}
      >
        <span class="nav-icon">{@html subMode.icon}</span>
        <span class="nav-label nav-label-full">{subMode.label}</span>
        <span class="nav-label nav-label-compact">{getCompactLabel(subMode.label)}</span>
      </button>
    {/each}
  </div>

  <!-- Settings Button (Right) -->
  <button
    class="nav-button settings-button"
    class:active={getShowSettings()}
    onclick={handleSettingsTap}
    aria-label="Settings"
  >
    <span class="nav-icon"><i class="fas fa-cog"></i></span>
    <span class="nav-label nav-label-full">Settings</span>
    <span class="nav-label nav-label-compact">{getCompactLabel("Settings")}</span>
  </button>
</nav>

<style>
  /* Enable container queries on the navigation */
  .bottom-navigation {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: var(--glass-backdrop-strong);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 100;
    /* Account for iOS safe area */
    padding-bottom: max(8px, env(safe-area-inset-bottom));
    min-height: 64px;

    /* Enable container queries */
    container-type: inline-size;
    container-name: bottom-nav;
  }

  /* Sub-mode tabs container - flex layout */
  .sub-mode-tabs {
    display: flex;
    gap: 4px;
    flex: 1;
    justify-content: center;
    align-items: center;
    min-width: 0; /* Allow flex shrinking */
  }

  /* Base button styles - always maintain 44px touch target */
  .nav-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 6px 8px;
    background: transparent;
    border: none;
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s ease;
    /* Minimum touch target */
    min-width: 44px;
    min-height: 44px;
    flex: 1 1 auto;
    max-width: 80px;
    position: relative;
  }

  .module-switcher,
  .settings-button {
    flex: 0 0 auto;
    min-width: 56px;
    max-width: 72px;
  }

  .nav-button:active {
    transform: scale(0.95);
  }

  .nav-button.active {
    color: rgba(255, 255, 255, 1);
    background: rgba(255, 255, 255, 0.1);
  }

  .nav-button.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .nav-button.disabled:active {
    transform: none;
  }

  .nav-icon {
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .nav-icon :global(i) {
    color: inherit;
  }

  /* Label system: full and compact versions */
  .nav-label {
    font-size: 10px;
    font-weight: 500;
    text-align: center;
    white-space: nowrap;
    line-height: 1.2;
  }

  .nav-label-full,
  .nav-label-compact {
    display: none;
  }

  /*
    Container Query Breakpoints:
    - >= 600px: Full labels (Menu, Construct, Generate, Animate, Share, Settings)
    - 450-599px: Compact labels (Menu, Build, Gen, Play, Share, Set)
    - < 450px: Icons only
  */

  /* Full labels mode (spacious - 600px+) */
  @container bottom-nav (min-width: 600px) {
    .nav-label-full {
      display: block;
    }

    .nav-button {
      max-width: 90px;
      gap: 4px;
    }

    .module-switcher,
    .settings-button {
      max-width: 80px;
    }
  }

  /* Compact labels mode (tight - 450-599px) */
  @container bottom-nav (min-width: 450px) and (max-width: 599px) {
    .nav-label-compact {
      display: block;
    }

    .nav-button {
      max-width: 70px;
      gap: 2px;
      padding: 6px 4px;
    }

    .nav-label {
      font-size: 9px;
    }
  }

  /* Icons only mode (cramped - < 450px) */
  @container bottom-nav (max-width: 449px) {
    .nav-button {
      max-width: 52px;
      padding: 6px 4px;
    }

    .nav-icon {
      font-size: 22px;
    }
  }

  /* Fallback for browsers without container query support */
  @supports not (container-type: inline-size) {
    /* Use viewport-based media queries as fallback */

    /* Full labels */
    @media (min-width: 600px) {
      .nav-label-full {
        display: block;
      }
    }

    /* Compact labels */
    @media (min-width: 450px) and (max-width: 599px) {
      .nav-label-compact {
        display: block;
      }

      .nav-button {
        max-width: 70px;
        padding: 6px 4px;
      }
    }

    /* Icons only - default state, labels already hidden */
    @media (max-width: 449px) {
      .nav-icon {
        font-size: 22px;
      }
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .bottom-navigation {
      background: rgba(0, 0, 0, 0.95);
      border-top: 2px solid white;
    }

    .nav-button.active {
      background: rgba(255, 255, 255, 0.3);
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .nav-button {
      transition: none;
    }

    .nav-button:active {
      transform: none;
    }
  }
</style>
