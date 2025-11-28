<!-- Primary Navigation - Responsive Bottom/Side Navigation Orchestrator -->
<!-- Automatically adapts between bottom (portrait) and side (landscape) layouts -->
<script lang="ts">
import { resolve } from "../../inversify";
import { TYPES } from "../../inversify/types";
  import type { IDeviceDetector } from "../../device/services/contracts/IDeviceDetector";
  import type { ResponsiveSettings } from "../../device/domain/models/device-models";
  import { onMount } from "svelte";
  import { toggleSettingsDialog } from "../../application/state/app-state.svelte";
  import { uiState } from "../../application/state/ui/ui-state.svelte";
  import type { Section } from "../domain/types";
  import BottomNavigation from "./layouts/BottomNavigation.svelte";
  import SideNavigation from "./layouts/SideNavigation.svelte";

  let {
    sections = [],
    currentSection,
    onSectionChange,
    onModuleSwitcherTap,
    onLayoutChange,
    onHeightChange,
    showModuleSwitcher = true,
    showSettings = true,
    isUIVisible = true,
    onRevealNav = () => {},
  } = $props<{
    sections: Section[];
    currentSection: string;
    onSectionChange?: (sectionId: string) => void;
    onModuleSwitcherTap?: () => void;
    onLayoutChange?: (isLandscape: boolean) => void;
    onHeightChange?: (height: number) => void;
    showModuleSwitcher?: boolean;
    showSettings?: boolean;
    isUIVisible?: boolean;
    onRevealNav?: () => void;
  }>();

  // Services
  let deviceDetector: IDeviceDetector | null = null;

  // Responsive settings from DeviceDetector (single source of truth)
  let responsiveSettings = $state<ResponsiveSettings | null>(null);

  // Layout state - use DeviceDetector instead of duplicating logic
  let isLandscape = $derived(responsiveSettings?.isLandscapeMobile ?? false);

  // Reactive state for settings dialog visibility
  let isSettingsActive = $derived(uiState.showSettings);

  function handleSettingsTap() {
    // Pass the mode based on current navigation layout:
    // - Side navigation (landscape) → desktop mode (side panel from left)
    // - Bottom navigation (portrait) → mobile mode (bottom sheet)
    const mode = isLandscape ? "desktop" : "mobile";
    toggleSettingsDialog(mode);
  }

  // Notify parent when layout changes (reactive to isLandscape derived value)
  $effect(() => {
    // Notify parent of current layout state when it changes
    onLayoutChange?.(isLandscape);
    return undefined;
  });

  onMount(() => {
    // Resolve DeviceDetector service
    let deviceCleanup: (() => void) | undefined;
    try {
      deviceDetector = resolve<IDeviceDetector>(TYPES.IDeviceDetector);

      // Get initial responsive settings
      responsiveSettings = deviceDetector.getResponsiveSettings();

      // Return cleanup function from onCapabilitiesChanged
      deviceCleanup = deviceDetector.onCapabilitiesChanged(() => {
        responsiveSettings = deviceDetector!.getResponsiveSettings();
      });
    } catch (error) {
      console.warn(
        "PrimaryNavigation: Failed to resolve DeviceDetector",
        error
      );
    }

    // Return cleanup function
    return () => {
      deviceCleanup?.();
    };
  });
</script>

{#if isLandscape}
  <SideNavigation
    {sections}
    {currentSection}
    {onSectionChange}
    {onModuleSwitcherTap}
    onSettingsTap={handleSettingsTap}
    {showModuleSwitcher}
    {showSettings}
    {isSettingsActive}
    {isUIVisible}
  />
{:else}
  <BottomNavigation
    {sections}
    {currentSection}
    {onSectionChange}
    {onModuleSwitcherTap}
    onSettingsTap={handleSettingsTap}
    {onHeightChange}
    {showModuleSwitcher}
    {showSettings}
    {isSettingsActive}
    {isUIVisible}
    {onRevealNav}
  />
{/if}
