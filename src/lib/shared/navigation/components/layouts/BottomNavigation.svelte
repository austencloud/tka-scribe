<!-- BottomNavigation - Portrait/Bottom Navigation Layout -->
<script lang="ts">
import { onMount } from "svelte";
import type { Section } from "$lib/shared/navigation/domain/types";
import NavButton from "$lib/shared/navigation/components/buttons/NavButton.svelte";
import ModuleSwitcherButton from "$lib/shared/navigation/components/buttons/ModuleSwitcherButton.svelte";
import SettingsButton from "$lib/shared/navigation/components/buttons/SettingsButton.svelte";
  import { shouldHideUIForPanels } from "../../../application/state/animation-visibility-state.svelte";
  import { navigationState, MODULE_DEFINITIONS } from "../../state/navigation-state.svelte";

  // Get current module color for themed navigation
  let moduleColor = $derived(() => {
    const currentModuleId = navigationState.currentModule;
    const moduleDefinition = MODULE_DEFINITIONS.find(m => m.id === currentModuleId);
    return moduleDefinition?.color ?? "#667eea"; // Default indigo
  });

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

  // Handle tap on peek indicator to reveal navigation
  function handlePeekTap() {
    onRevealNav();
  }

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
  style="--module-color: {moduleColor()}"
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
     BOTTOM LAYOUT (Portrait Mobile)
     ============================================================================ */
  .bottom-navigation {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    padding: 8px;
    /* Module-colored background with subtle sheen */
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--module-color, #667eea) 12%, rgba(255, 255, 255, 0.08)) 0%,
      color-mix(in srgb, var(--module-color, #667eea) 6%, rgba(255, 255, 255, 0.04)) 100%
    );
    backdrop-filter: var(--glass-backdrop-strong);
    /* Module-colored top border */
    border-top: 1px solid color-mix(in srgb, var(--module-color, #667eea) 30%, rgba(255, 255, 255, 0.15));
    /* Account for iOS safe area */
    padding-bottom: max(8px, env(safe-area-inset-bottom));
    min-height: 64px;
    z-index: 100;
    /* Remove bottom corners border-radius since it comes out of the bottom */
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;

    /* Enable container queries for responsive labels */
    container-type: inline-size;
    container-name: primary-nav;

    transition:
      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      background 0.4s ease-out,
      border-color 0.4s ease-out;
  }

  /* Hidden state for bottom layout - slide down */
  .bottom-navigation.hidden {
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
    gap: 4px;
    flex: 1 1 0%;
    justify-content: center;
    align-items: center;
    min-width: 0; /* Allow flex shrinking */
    max-width: calc(100% - 112px); /* Leave room for 48px buttons + gaps on each side */
    opacity: 1;
    transition: opacity 0.3s ease;
    pointer-events: auto;
    /* Ensure sections don't extend outside their bounds */
    overflow: visible;
  }

  /* Hidden state - fade to invisible while maintaining space */
  .sections.hidden {
    opacity: 0;
    pointer-events: none;
  }

  /* ============================================================================
     BUTTON SIZING FOR BOTTOM LAYOUT
     ============================================================================ */
  .bottom-navigation :global(.nav-button) {
    padding: 6px 8px;
    min-width: 44px;
    min-height: 44px;
    flex: 1 1 auto;
    max-width: 80px;
  }

  /* Menu and Settings buttons - circular with visible background */
  .bottom-navigation :global(.nav-button.special) {
    flex: 0 0 auto !important;
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
    max-width: 48px;
    padding: 0;
    /* Glass background to make button clearly tappable */
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    /* Ensure proper touch handling */
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    /* Create stacking context to prevent overlap issues */
    isolation: isolate;
    z-index: 1;
  }

  .bottom-navigation :global(.nav-button.special:hover) {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .bottom-navigation :global(.nav-button.special.active) {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    /* Override the section-style top border indicator */
    border-top: 1px solid rgba(255, 255, 255, 0.25);
    padding-top: 0;
  }

  /*
    Container Query Breakpoints:
    - >= 600px: Full labels (Menu, Construct, Generate, Animate, Share, Settings)
    - 450-599px: Compact labels (Menu, Build, Gen, Play, Share, Set)
    - < 450px: Icons only
  */

  /* Full labels mode (spacious - 600px+) */
  @container primary-nav (min-width: 600px) {
    .bottom-navigation :global(.nav-label-full) {
      display: block;
    }

    .bottom-navigation :global(.nav-button.section) {
      max-width: 90px;
      gap: 4px;
    }

    .bottom-navigation :global(.nav-button.special) {
      max-width: 80px;
    }
  }

  /* Compact labels mode (tight - 450-599px) */
  @container primary-nav (min-width: 450px) and (max-width: 599px) {
    .bottom-navigation :global(.nav-label-compact) {
      display: block;
    }

    .bottom-navigation :global(.nav-button.section) {
      max-width: 70px;
      gap: 2px;
      padding: 6px 4px;
    }

    .bottom-navigation :global(.nav-label) {
      /* Slightly smaller in compact mode */
      font-size: clamp(8px, 1.8cqi, 10px);
    }
  }

  /* Icons only mode (cramped - < 450px) */
  @container primary-nav (max-width: 449px) {
    .bottom-navigation :global(.nav-button.section) {
      max-width: 52px;
      padding: 6px 4px;
    }

    .bottom-navigation :global(.nav-icon) {
      /* Larger icons when labels are hidden */
      font-size: clamp(20px, 5cqi, 24px);
    }
  }

  /* Fallback for browsers without container query support */
  @supports not (container-type: inline-size) {
    /* Use viewport-based media queries as fallback */

    /* Full labels */
    @media (min-width: 600px) {
      .bottom-navigation :global(.nav-label-full) {
        display: block;
      }
    }

    /* Compact labels */
    @media (min-width: 450px) and (max-width: 599px) {
      .bottom-navigation :global(.nav-label-compact) {
        display: block;
      }

      .bottom-navigation :global(.nav-button.section) {
        max-width: 70px;
        padding: 6px 4px;
      }
    }

    /* Icons only - default state, labels already hidden */
    @media (max-width: 449px) {
      .bottom-navigation :global(.nav-icon) {
        font-size: 22px;
      }
    }
  }

  /* ============================================================================
     PEEK INDICATOR (shown when navigation is hidden)
     ============================================================================ */
  .peek-indicator {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 8px;
    padding-bottom: max(8px, env(safe-area-inset-bottom));
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.3) 0%,
      rgba(0, 0, 0, 0.15) 50%,
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
      rgba(0, 0, 0, 0.4) 0%,
      rgba(0, 0, 0, 0.2) 50%,
      transparent 100%
    );
  }

  .peek-indicator i {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.6);
    animation: pulse-peek 2s ease-in-out infinite;
  }

  @keyframes pulse-peek {
    0%,
    100% {
      opacity: 0.6;
      transform: translateY(0);
    }
    50% {
      opacity: 1;
      transform: translateY(-2px);
    }
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  /* High contrast mode */
  @media (prefers-contrast: high) {
    .bottom-navigation {
      background: rgba(0, 0, 0, 0.95);
      border-top: 2px solid white;
    }

    .bottom-navigation :global(.nav-button.active) {
      background: rgba(255, 255, 255, 0.3);
    }

    .peek-indicator {
      background: linear-gradient(
        to top,
        rgba(0, 0, 0, 0.9) 0%,
        transparent 100%
      );
    }

    .peek-indicator i {
      color: white;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .peek-indicator i {
      animation: none;
    }
  }
</style>
