<!-- SideNavigation - Landscape/Side Navigation Layout -->
<script lang="ts">
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
    showModuleSwitcher = true,
    showSettings = true,
    isSettingsActive = false,
    isUIVisible = true,
  } = $props<{
    sections: Section[];
    currentSection: string;
    onSectionChange?: (sectionId: string) => void;
    onModuleSwitcherTap?: () => void;
    onSettingsTap?: () => void;
    showModuleSwitcher?: boolean;
    showSettings?: boolean;
    isSettingsActive?: boolean;
    isUIVisible?: boolean;
  }>();

  // Determine if navigation sections should be hidden (any modal panel open in side-by-side layout)
  let shouldHideNav = $derived(shouldHideUIForPanels());

  function handleSectionClick(section: Section) {
    if (!section.disabled) {
      onSectionChange(section.id);
    }
  }
</script>

<nav class="side-navigation" class:hidden={!isUIVisible} style="--module-color: {moduleColor()}">
  <!-- Module Switcher Button (Top) -->
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

  <!-- Settings Button (Bottom) -->
  {#if showSettings}
    <SettingsButton active={isSettingsActive} onClick={onSettingsTap} />
  {/if}
</nav>

<style>
  /* ============================================================================
     SIDE LAYOUT (Landscape Mobile)
     ============================================================================ */
  .side-navigation {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 8px 4px;
    /* Module-colored background with subtle sheen */
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--module-color, #667eea) 12%, rgba(255, 255, 255, 0.08)) 0%,
      color-mix(in srgb, var(--module-color, #667eea) 6%, rgba(255, 255, 255, 0.04)) 100%
    );
    backdrop-filter: var(--glass-backdrop-strong);
    /* Module-colored right border */
    border-right: 1px solid color-mix(in srgb, var(--module-color, #667eea) 30%, rgba(255, 255, 255, 0.15));
    width: 72px;
    min-height: 100vh;
    z-index: 100;

    transition:
      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      background 0.4s ease-out,
      border-color 0.4s ease-out;
  }

  /* Hidden state for side layout - slide left */
  .side-navigation.hidden {
    transform: translateX(-100%);
    opacity: 0;
    pointer-events: none;
  }

  /* ============================================================================
     SECTIONS CONTAINER
     ============================================================================ */
  .sections {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    justify-content: center;
    align-items: center;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    /* Hide scrollbar but keep functionality */
    scrollbar-width: none;
    -ms-overflow-style: none;
    opacity: 1;
    transition: opacity 0.3s ease;
    pointer-events: auto;
  }

  .sections::-webkit-scrollbar {
    display: none;
  }

  /* Hidden state - fade to invisible while maintaining space */
  .sections.hidden {
    opacity: 0;
    pointer-events: none;
  }

  /* ============================================================================
     BUTTON SIZING FOR SIDE LAYOUT
     ============================================================================ */
  .side-navigation :global(.nav-button.section) {
    padding: 8px;
    min-width: 56px;
    min-height: 56px;
    width: 56px;
    flex: 0 0 auto;
  }

  /* Menu and Settings buttons - circular with visible background */
  .side-navigation :global(.nav-button.special) {
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

  .side-navigation :global(.nav-button.special:hover) {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .side-navigation :global(.nav-button.special.active) {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    /* Override the section-style top border indicator */
    border-top: 1px solid rgba(255, 255, 255, 0.25);
    padding-top: 0;
  }

  /* Side layout - always hide labels (icon-only) */
  .side-navigation :global(.nav-label) {
    display: none !important;
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  /* High contrast mode */
  @media (prefers-contrast: high) {
    .side-navigation {
      background: rgba(0, 0, 0, 0.95);
      border-right: 2px solid white;
    }

    .side-navigation :global(.nav-button.active) {
      background: rgba(255, 255, 255, 0.3);
    }
  }
</style>
