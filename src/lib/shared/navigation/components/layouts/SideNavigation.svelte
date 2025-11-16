<!-- SideNavigation - Landscape/Side Navigation Layout -->
<script lang="ts">
  import type { Section } from "../../domain/types";
  import NavButton from "../buttons/NavButton.svelte";
  import ModuleSwitcherButton from "../buttons/ModuleSwitcherButton.svelte";
  import SettingsButton from "../buttons/SettingsButton.svelte";
  import { shouldHideUIForPanels } from "$shared";

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

<nav class="side-navigation" class:hidden={!isUIVisible}>
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
        gradient={section.gradient || section.color || "var(--muted-foreground)"}
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
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: var(--glass-backdrop-strong);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    width: 72px;
    min-height: 100vh;
    z-index: 100;

    transition:
      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

  /* Menu and Settings buttons match top bar style - circular */
  .side-navigation :global(.nav-button.special) {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
    padding: 0;
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
