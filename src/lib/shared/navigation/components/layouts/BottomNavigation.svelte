<!-- BottomNavigation - Portrait/Bottom Navigation Layout -->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import type { Section } from "$lib/shared/navigation/domain/types";
  import NavButton from "$lib/shared/navigation/components/buttons/NavButton.svelte";
  import ModuleSwitcherButton from "$lib/shared/navigation/components/buttons/ModuleSwitcherButton.svelte";
  import SettingsButton from "$lib/shared/navigation/components/buttons/SettingsButton.svelte";
  import TabOverflowSelector from "$lib/shared/navigation/components/TabOverflowSelector.svelte";
  import { shouldHideUIForPanels } from "../../../application/state/animation-visibility-state.svelte";
  import {
    navigationState,
    MODULE_DEFINITIONS,
  } from "../../state/navigation-state.svelte";
  import { galleryPanelManager } from "$lib/features/discover/shared/state/gallery-panel-state.svelte";
  import { quickFeedbackState } from "$lib/features/feedback/state/quick-feedback-state.svelte";
  import { inboxState } from "$lib/shared/inbox/state/inbox-state.svelte";

  // Module color no longer needed - using global theme system

  let {
    sections = [],
    currentSection = "",
    onSectionChange = () => {},
    onModuleSwitcherTap = () => {},
    onSettingsTap = () => {},
    onHeightChange = () => {},
    showModuleSwitcher = true,
    showSettings = true,
    isSettingsActive = false,
    isUIVisible = true,
    onRevealNav = () => {},
    isDashboard = false,
  } = $props<{
    sections: Section[];
    currentSection: string;
    onSectionChange?: (sectionId: string) => void;
    onModuleSwitcherTap?: () => void;
    onSettingsTap?: () => void;
    onHeightChange?: (height: number) => void;
    showModuleSwitcher?: boolean;
    showSettings?: boolean;
    isSettingsActive?: boolean;
    isUIVisible?: boolean;
    onRevealNav?: () => void;
    isDashboard?: boolean;
  }>();

  let navElement = $state<HTMLElement | null>(null);
  let peekHasAnimated = $state(false);
  let availableWidth = $state(0);
  let backButtonLongPressTimer: ReturnType<typeof setTimeout> | null = null;
  let backButtonSuppressClick = $state(false);
  let hapticService: IHapticFeedbackService | undefined;

  // Calculate required width for all tabs
  // Each section button needs: min 48px base + 8px gap
  // Left buttons (module switcher): 48px
  // Right buttons (settings only): ~60px (48px + gap)
  // Padding and spacing: ~30px
  let requiredWidth = $derived(() => {
    const buttonWidth = 60; // 48px min + gap
    const tabsWidth = sections.length * buttonWidth;
    const fixedButtonsWidth = 140; // Module switcher + settings + gaps + padding
    return tabsWidth + fixedButtonsWidth;
  });

  // Use overflow selector when tabs don't fit in available space
  let shouldUseOverflowSelector = $derived(
    availableWidth > 0 && availableWidth < requiredWidth()
  );

  // Handle tap on peek indicator to reveal navigation
  function handlePeekTap() {
    onRevealNav();
  }

  // Trigger entrance animation once when peek becomes visible
  $effect(() => {
    if (!isUIVisible && !peekHasAnimated) {
      peekHasAnimated = true;
    } else if (isUIVisible) {
      peekHasAnimated = false;
    }
  });

  // Determine if navigation sections should be hidden (any modal panel open in side-by-side layout)
  let shouldHideNav = $derived(shouldHideUIForPanels());

  function handleSectionClick(section: Section) {
    if (!section.disabled) {
      onSectionChange(section.id);
    }
  }

  function handleSettingsLongPress() {
    quickFeedbackState.open();
  }

  function startBackButtonLongPress(event: PointerEvent) {
    if (event.pointerType === "mouse") return;
    clearBackButtonLongPress();
    backButtonLongPressTimer = setTimeout(() => {
      backButtonSuppressClick = true;
      handleSettingsLongPress();
    }, 500);
  }

  function clearBackButtonLongPress() {
    if (backButtonLongPressTimer) {
      clearTimeout(backButtonLongPressTimer);
      backButtonLongPressTimer = null;
    }
  }

  function handleBackButtonClick(event: MouseEvent | TouchEvent) {
    if (backButtonSuppressClick) {
      backButtonSuppressClick = false;
      return;
    }
    hapticService?.trigger("selection");
    onSettingsTap();
  }

  // Derived badge counts for inbox tabs - must be $derived for reactivity
  const isInboxModule = $derived(navigationState.currentModule === "inbox");
  const messagesBadgeCount = $derived(
    isInboxModule ? inboxState.unreadMessageCount : 0
  );
  const notificationsBadgeCount = $derived(
    isInboxModule ? inboxState.unreadNotificationCount : 0
  );

  /**
   * Get badge count for a section (only inbox tabs have badges)
   */
  function getSectionBadgeCount(sectionId: string): number {
    if (sectionId === "messages") {
      return messagesBadgeCount;
    }
    if (sectionId === "notifications") {
      return notificationsBadgeCount;
    }
    return 0;
  }

  onMount(() => {
    try {
      hapticService = resolve<IHapticFeedbackService>(
        TYPES.IHapticFeedbackService
      );
    } catch (error) {
      console.warn(
        "BottomNavigation: Failed to resolve IHapticFeedbackService",
        error
      );
    }

    // Set up ResizeObserver to measure navigation height and width
    let resizeObserver: ResizeObserver | null = null;
    if (navElement) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const height =
            entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
          const width =
            entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
          onHeightChange(height);
          availableWidth = width;
        }
      });
      resizeObserver.observe(navElement);

      // Report initial measurements
      const rect = navElement.getBoundingClientRect();
      if (rect.height > 0) {
        onHeightChange(rect.height);
      }
      if (rect.width > 0) {
        availableWidth = rect.width;
      }
    }

    // Return cleanup function
    return () => {
      resizeObserver?.disconnect();
    };
  });
</script>

<!-- Peek Indicator - Shows when nav is hidden AND no gallery panels are open -->
{#if !isUIVisible && !galleryPanelManager.isOpen}
  <button
    class="peek-indicator"
    class:animate-entrance={peekHasAnimated}
    onclick={handlePeekTap}
    aria-label="Show navigation"
  >
    <i class="fas fa-chevron-up"></i>
  </button>
{/if}

<nav
  class="bottom-navigation"
  class:hidden={!isUIVisible}
  class:floating={isDashboard}
  bind:this={navElement}
>
  <!-- Module Switcher Button (Left) - now shown even in settings for consistent home/back affordance -->
  {#if showModuleSwitcher}
    <ModuleSwitcherButton onClick={onModuleSwitcherTap} />
  {/if}

  <!-- Current Module's Sections - Use overflow selector for modules with >4 tabs -->
  {#if shouldUseOverflowSelector}
    <div class="sections-overflow" class:hidden={shouldHideNav}>
      <TabOverflowSelector
        {sections}
        {currentSection}
        {onSectionChange}
      />
    </div>
  {:else}
    <div class="sections" class:hidden={shouldHideNav}>
      {#each sections as section}
        <NavButton
          icon={section.icon}
          label={section.label}
          active={currentSection === section.id}
          disabled={section.disabled}
          color={section.color || "var(--muted-foreground)"}
          gradient={section.gradient ||
            section.color ||
            "var(--muted-foreground)"}
          type="section"
          onClick={() => handleSectionClick(section)}
          ariaLabel={section.label}
          badgeCount={section.id === "messages"
            ? messagesBadgeCount
            : section.id === "notifications"
              ? notificationsBadgeCount
              : 0}
        />
      {/each}
    </div>
  {/if}

  <!-- Right side buttons -->
  <div class="right-buttons">
    {#if isSettingsActive}
      <!-- Back Button - shown when in settings to return to previous module -->
      <button
        class="nav-back-button"
        onclick={handleBackButtonClick}
        onpointerdown={startBackButtonLongPress}
        onpointerup={clearBackButtonLongPress}
        onpointerleave={clearBackButtonLongPress}
        onpointercancel={clearBackButtonLongPress}
        aria-label="Go back"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
    {:else if showSettings}
      <!-- Settings Button - shown when not in settings -->
      <SettingsButton
        active={isSettingsActive}
        onClick={onSettingsTap}
        onLongPress={handleSettingsLongPress}
        longPressMs={500}
      />
    {/if}
  </div>
</nav>

<style>
  /* ============================================================================
     DESIGN TOKENS - Single source of truth for layout values
     ============================================================================ */
  .bottom-navigation {
    /* Layout tokens */
    --nav-gap: 8px; /* Minimum 8px for touch target spacing (Material 3) */
    --nav-padding: 10px;
    --nav-min-height: 64px;

    /* Button tokens */
    --section-button-min: 48px;
    --section-button-max: 72px;

    /* Typography tokens */
    --label-size-full: 10px;
    --label-size-compact: 10px;
    --icon-size-default: 20px;
    --icon-size-large: 22px;

    /* Timing */
    --transition-smooth: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ============================================================================
     BOTTOM LAYOUT (Portrait Mobile)
     ============================================================================ */
  .bottom-navigation {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--nav-gap);

    /* Use global theme system for consistent navigation appearance */
    background: var(--theme-panel-bg, rgba(255, 255, 255, 0.04));

    /* Subtle top edge with theme stroke */
    border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    box-shadow:
      0 -1px 0 0 hsl(0 0% 0% / 0.3),
      inset 0 1px 0 0 hsl(0 0% 100% / 0.05);

    /* Container queries for responsive behavior */
    container-type: inline-size;
    container-name: bottom-nav;

    /* Exclude from view transitions */
    view-transition-name: none;
    z-index: 100;

    transition:
      transform var(--transition-smooth),
      opacity var(--transition-smooth),
      background 0.4s ease-out,
      border-color 0.4s ease-out;
  }

  /* Hidden state - consistent positioning, only transform/opacity change */
  .bottom-navigation.hidden {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    transform: translateY(100%);
    opacity: 0;
    pointer-events: none;
  }

  /* ============================================================================
     FLOATING MODE (Dashboard) - Transparent, fixed position with floating buttons
     ============================================================================ */
  .bottom-navigation.floating {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: transparent;
    border-top: none;
    box-shadow: none;
    padding-bottom: max(10px, env(safe-area-inset-bottom));
    pointer-events: none; /* Let clicks pass through the bar itself */
  }

  /* Re-enable pointer events on interactive children */
  .bottom-navigation.floating :global(.nav-button),
  .bottom-navigation.floating :global(.menu-button) {
    pointer-events: auto;
  }

  /* Give floating buttons a subtle backdrop for visibility */
  .bottom-navigation.floating :global(.nav-button.special),
  .bottom-navigation.floating :global(.menu-button) {
    background: hsl(0 0% 0% / 0.6);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow:
      0 4px 12px hsl(0 0% 0% / 0.4),
      0 0 0 1px hsl(0 0% 100% / 0.05);
  }

  .bottom-navigation.floating :global(.nav-button.special),
  .bottom-navigation.floating :global(.menu-button) {
    border-color: hsl(0 0% 100% / 0.15);
  }

  /* ============================================================================
     SECTIONS CONTAINER
     ============================================================================ */
  .sections {
    display: flex;
    flex-direction: row;
    gap: var(--nav-gap);
    flex: 1 1 0%;
    justify-content: center;
    align-items: center;
    min-width: 0;
    /* Leave room for 48px avatar + 48px settings + gaps */
    max-width: calc(100% - 104px - (var(--nav-gap) * 2));
    opacity: 1;
    transition: opacity var(--transition-smooth);
    pointer-events: auto;
    overflow: visible;
  }

  .sections.hidden {
    opacity: 0;
    pointer-events: none;
  }

  /* ============================================================================
     OVERFLOW SELECTOR CONTAINER
     ============================================================================ */
  .sections-overflow {
    display: flex;
    flex-direction: row;
    flex: 1 1 0%;
    justify-content: center;
    align-items: center;
    min-width: 0;
    max-width: calc(100% - 104px - (var(--nav-gap) * 2));
    opacity: 1;
    transition: opacity var(--transition-smooth);
    pointer-events: auto;
  }

  .sections-overflow.hidden {
    opacity: 0;
    pointer-events: none;
  }

  /* ============================================================================
     RIGHT BUTTONS CONTAINER (Settings)
     ============================================================================ */
  .right-buttons {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  /* ============================================================================
     BACK BUTTON - Shown when in Settings module
     ============================================================================ */
  .nav-back-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    min-width: var(--min-touch-target);
    min-height: var(--min-touch-target);
    padding: 0;
    background: transparent;
    border: 1px solid var(--theme-accent, #6366f1);
    border-radius: 50%;
    color: var(--theme-accent, #6366f1);
    cursor: pointer;
    box-shadow: 0 2px 8px hsl(0 0% 0% / 0.3);
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition:
      opacity 0.15s ease,
      transform 0.1s ease,
      background 0.15s ease;
  }

  .nav-back-button:hover {
    opacity: 0.85;
    background: color-mix(in srgb, var(--theme-accent, #6366f1) 15%, transparent);
  }

  .nav-back-button:active {
    transform: scale(0.95);
  }

  .nav-back-button:focus-visible {
    outline: 2px solid var(--theme-accent, #6366f1);
    outline-offset: 2px;
  }

  .nav-back-button i {
    font-size: 18px;
  }

  /* ============================================================================
     BUTTON SIZING - Clean specificity, no !important
     ============================================================================ */

  /* Section buttons (tabs) */
  .bottom-navigation :global(.nav-button.section) {
    padding: 6px;
    min-width: var(--section-button-min);
    min-height: var(--section-button-min);
    flex: 1 1 auto;
    max-width: var(--section-button-max);
    border-radius: 12px;
  }

  /* Special buttons (Settings) - using global theme accent */
  .bottom-navigation :global(.nav-button.special) {
    flex: 0 0 auto;
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    min-width: var(--min-touch-target);
    min-height: var(--min-touch-target);
    padding: 0;
    background: transparent;
    border: 1px solid var(--theme-accent, #6366f1);
    border-radius: 50%;
    box-shadow: 0 2px 8px hsl(0 0% 0% / 0.3);
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition:
      opacity 0.15s ease,
      transform 0.1s ease;
  }

  .bottom-navigation :global(.nav-button.special:hover) {
    opacity: 0.85;
  }

  .bottom-navigation :global(.nav-button.special:active) {
    transform: scale(0.95);
  }

  .bottom-navigation :global(.nav-button.special.active) {
    background: color-mix(
      in srgb,
      var(--theme-accent, #6366f1) 15%,
      transparent
    );
  }

  /* No labels on special buttons - icon only */
  .bottom-navigation :global(.nav-button.special .nav-label-full),
  .bottom-navigation :global(.nav-button.special .nav-label-compact) {
    display: none;
  }

  /* Theme-colored gear icon */
  .bottom-navigation :global(.nav-button.special .nav-icon) {
    font-size: 22px;
  }

  .bottom-navigation :global(.nav-button.special .nav-icon i) {
    color: var(--theme-accent, #6366f1);
    -webkit-text-fill-color: var(--theme-accent, #6366f1);
  }

  /* ============================================================================
     CONTAINER QUERIES - Responsive label behavior

     Breakpoints rationale:
     - 520px+: Full labels visible (tablets, large phones landscape)
     - 400-519px: Compact labels (most phones portrait)
     - <400px: Icons only (iPhone SE, small devices)

     These align with actual device widths accounting for nav padding.
     ============================================================================ */

  /* Full labels mode (520px+) */
  @container bottom-nav (min-width: 520px) {
    .bottom-navigation :global(.nav-label-full) {
      display: block;
    }

    .bottom-navigation :global(.nav-button.section) {
      max-width: 80px;
      gap: 3px;
    }

    .bottom-navigation :global(.nav-label) {
      font-size: var(--label-size-full);
    }
  }

  /* Compact labels mode (400-519px) */
  @container bottom-nav (min-width: 400px) and (max-width: 519px) {
    .bottom-navigation :global(.nav-label-compact) {
      display: block;
    }

    .bottom-navigation :global(.nav-button.section) {
      max-width: 64px;
      gap: 2px;
    }

    .bottom-navigation :global(.nav-label) {
      font-size: var(--label-size-compact);
    }
  }

  /* Icons only mode (<400px) - iPhone SE territory */
  @container bottom-nav (max-width: 399px) {
    .bottom-navigation :global(.nav-button.section) {
      max-width: var(--min-touch-target);
      padding: 6px 4px;
    }

    .bottom-navigation :global(.nav-icon) {
      font-size: var(--icon-size-large);
    }

    /* Both special buttons are already 50px round - no changes needed at small sizes */
  }

  /* Fallback for browsers without container query support */
  @supports not (container-type: inline-size) {
    @media (min-width: 520px) {
      .bottom-navigation :global(.nav-label-full) {
        display: block;
      }
    }

    @media (min-width: 400px) and (max-width: 519px) {
      .bottom-navigation :global(.nav-label-compact) {
        display: block;
      }

      .bottom-navigation :global(.nav-button.section) {
        max-width: 64px;
      }
    }

    @media (max-width: 399px) {
      .bottom-navigation :global(.nav-icon) {
        font-size: 22px;
      }
    }
  }

  /* ============================================================================
     PEEK INDICATOR - Classy single entrance animation
     ============================================================================ */
  .peek-indicator {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: var(--min-touch-target);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: max(10px, env(safe-area-inset-bottom));
    /* Subtle gradient, not heavy-handed */
    background: linear-gradient(
      to top,
      hsl(0 0% 0% / 0.4) 0%,
      hsl(0 0% 0% / 0.1) 60%,
      transparent 100%
    );
    border: none;
    cursor: pointer;
    z-index: 99;
    transition: background 0.2s ease;
  }

  .peek-indicator:hover {
    background: linear-gradient(
      to top,
      hsl(0 0% 0% / 0.5) 0%,
      hsl(0 0% 0% / 0.15) 60%,
      transparent 100%
    );
  }

  /* Focus state for keyboard navigation */
  .peek-indicator:focus-visible {
    outline: 2px solid var(--theme-accent, #6366f1);
    outline-offset: -2px;
  }

  .peek-indicator i {
    font-size: 14px;
    color: hsl(0 0% 100% / 0.5);
    opacity: 0;
    transform: translateY(8px);
  }

  /* Single entrance animation - plays once when indicator appears */
  .peek-indicator.animate-entrance i {
    animation: peek-entrance 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes peek-entrance {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .bottom-navigation {
      background: hsl(0 0% 5%);
      border-top: 2px solid white;
    }

    .bottom-navigation :global(.nav-button.active) {
      background: hsl(0 0% 100% / 0.25);
    }

    .bottom-navigation :global(.nav-button.special) {
      /* High contrast: add visible background */
      background: hsl(0 0% 10%);
    }

    .peek-indicator {
      background: linear-gradient(
        to top,
        hsl(0 0% 0% / 0.95) 0%,
        transparent 100%
      );
    }

    .peek-indicator i {
      color: white;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .bottom-navigation,
    .sections,
    .peek-indicator {
      transition: none;
    }

    .peek-indicator.animate-entrance i {
      animation: none;
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
