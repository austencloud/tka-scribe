<!-- BottomNavigation - Portrait/Bottom Navigation Layout -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { Section } from "$lib/shared/navigation/domain/types";
  import NavButton from "$lib/shared/navigation/components/buttons/NavButton.svelte";
  import ModuleSwitcherButton from "$lib/shared/navigation/components/buttons/ModuleSwitcherButton.svelte";
  import SettingsButton from "$lib/shared/navigation/components/buttons/SettingsButton.svelte";
  import { shouldHideUIForPanels } from "../../../application/state/animation-visibility-state.svelte";
  import {
    navigationState,
    MODULE_DEFINITIONS,
  } from "../../state/navigation-state.svelte";

  // Get current module color for themed navigation (fixed: was returning function)
  let moduleColor = $derived(
    MODULE_DEFINITIONS.find((m) => m.id === navigationState.currentModule)
      ?.color ?? "#667eea"
  );

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
  }>();

  let navElement = $state<HTMLElement | null>(null);
  let peekHasAnimated = $state(false);

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

  onMount(() => {
    // Set up ResizeObserver to measure and report navigation height
    let resizeObserver: ResizeObserver | null = null;
    if (navElement) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const height =
            entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
          onHeightChange(height);
        }
      });
      resizeObserver.observe(navElement);

      // Report initial height
      const initialHeight = navElement.getBoundingClientRect().height;
      if (initialHeight > 0) {
        onHeightChange(initialHeight);
      }
    }

    // Return cleanup function
    return () => {
      resizeObserver?.disconnect();
    };
  });
</script>

<!-- Peek Indicator - Shows when nav is hidden -->
{#if !isUIVisible}
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
  bind:this={navElement}
  style="--module-color: {moduleColor}"
>
  <!-- Module Switcher Button (Left) -->
  {#if showModuleSwitcher}
    <ModuleSwitcherButton onClick={onModuleSwitcherTap} />
  {/if}

  <!-- Current Module's Sections -->
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
      />
    {/each}
  </div>

  <!-- Settings Button (Right) -->
  {#if showSettings}
    <SettingsButton active={isSettingsActive} onClick={onSettingsTap} />
  {/if}
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
    padding: var(--nav-padding);
    padding-bottom: max(var(--nav-padding), env(safe-area-inset-bottom));
    min-height: var(--nav-min-height);

    /* 2026 design: Solid confident surface with subtle module tint */
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--module-color, #667eea) 8%, hsl(240 6% 10%)) 0%,
      color-mix(in srgb, var(--module-color, #667eea) 4%, hsl(240 6% 8%)) 100%
    );

    /* Subtle top edge highlight instead of harsh border */
    border-top: 1px solid
      color-mix(in srgb, var(--module-color, #667eea) 25%, hsl(0 0% 100% / 0.1));
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
    max-width: calc(100% - 96px - (var(--nav-gap) * 2));
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

  /* Special buttons (Settings) - solid module-colored */
  .bottom-navigation :global(.nav-button.special) {
    flex: 0 0 auto;
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
    padding: 0;
    background: transparent;
    border: 1px solid var(--module-color, #667eea);
    border-radius: 50%;
    box-shadow: 0 2px 8px hsl(0 0% 0% / 0.3);
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition: opacity 0.15s ease, transform 0.1s ease;
  }

  .bottom-navigation :global(.nav-button.special:hover) {
    opacity: 0.85;
  }

  .bottom-navigation :global(.nav-button.special:active) {
    transform: scale(0.95);
  }

  .bottom-navigation :global(.nav-button.special.active) {
    background: color-mix(in srgb, var(--module-color, #667eea) 15%, transparent);
  }

  /* No labels on special buttons - icon only */
  .bottom-navigation :global(.nav-button.special .nav-label-full),
  .bottom-navigation :global(.nav-button.special .nav-label-compact) {
    display: none;
  }

  /* Solid module-colored gear icon */
  .bottom-navigation :global(.nav-button.special .nav-icon) {
    font-size: 22px;
  }

  .bottom-navigation :global(.nav-button.special .nav-icon i) {
    color: var(--module-color, #667eea);
    -webkit-text-fill-color: var(--module-color, #667eea);
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
      max-width: 52px;
      padding: 6px 4px;
    }

    .bottom-navigation :global(.nav-icon) {
      font-size: var(--icon-size-large);
    }

    /* Both special buttons are already 48px round - no changes needed at small sizes */
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
    height: 48px;
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
    outline: 2px solid hsl(210 100% 60%);
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
      background: linear-gradient(to top, hsl(0 0% 0% / 0.95) 0%, transparent 100%);
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
