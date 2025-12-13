<!--
  BackgroundTab.svelte - Theme/Background Settings

  Polished glass panel layout matching Visibility and Profile tabs.
  Groups backgrounds into Animated and Simple categories.
-->
<script lang="ts">
  import type { AppSettings } from "../../../domain/AppSettings";
  import { resolve } from "../../../../inversify/di";
  import { TYPES } from "../../../../inversify/types";
  import { BackgroundType } from "../../../../background/shared/domain/enums/background-enums";
  import type { IDeviceDetector } from "../../../../device/services/contracts/IDeviceDetector";
  import type { IViewportService } from "../../../../device/services/contracts/IViewportService";
  import { onMount } from "svelte";
  import IOSBackgroundCard from "./IOSBackgroundCard.svelte";
  import { backgroundsConfig } from "./background-config";
  import { applyThemeFromColors } from "../../../utils/background-theme-calculator";

  let { settings, onUpdate } = $props<{
    settings: AppSettings;
    onUpdate?: (event: { key: string; value: unknown }) => void;
  }>();

  // Services
  let deviceDetector: IDeviceDetector | null = null;
  let viewportService: IViewportService | null = null;

  // Device orientation state
  let orientation = $state<"portrait" | "landscape" | "square">("square");

  // Entry animation
  let isVisible = $state(false);

  // Background settings state
  let backgroundSettings = $state({
    backgroundEnabled: settings?.backgroundEnabled ?? true,
    backgroundType: settings?.backgroundType || BackgroundType.NIGHT_SKY,
    backgroundQuality: settings?.backgroundQuality || "medium",
    backgroundColor: settings?.backgroundColor || "#000000",
    gradientColors: settings?.gradientColors || [
      "#0d1117",
      "#161b22",
      "#21262d",
    ],
    gradientDirection: settings?.gradientDirection || 135,
  });

  // Split backgrounds into categories
  const animatedBackgrounds = backgroundsConfig.filter(
    (bg) =>
      bg.type !== BackgroundType.SOLID_COLOR &&
      bg.type !== BackgroundType.LINEAR_GRADIENT
  );

  const simpleBackgrounds = backgroundsConfig.filter(
    (bg) =>
      bg.type === BackgroundType.SOLID_COLOR ||
      bg.type === BackgroundType.LINEAR_GRADIENT
  );

  onMount(() => {
    // Initialize services
    deviceDetector = resolve<IDeviceDetector>(TYPES.IDeviceDetector);
    viewportService = resolve<IViewportService>(TYPES.IViewportService);

    // Set initial orientation
    updateOrientation();

    // Subscribe to viewport changes
    const unsubscribe = viewportService?.onViewportChange(() => {
      updateOrientation();
    });

    // Entry animation
    setTimeout(() => (isVisible = true), 30);

    return () => {
      unsubscribe?.();
    };
  });

  function updateOrientation() {
    if (!viewportService) return;

    if (viewportService.isLandscape()) {
      orientation = "landscape";
    } else if (viewportService.isPortrait()) {
      orientation = "portrait";
    } else {
      orientation = "square";
    }
  }

  function updateBackgroundSetting<K extends keyof typeof backgroundSettings>(
    key: K,
    value: (typeof backgroundSettings)[K]
  ) {
    backgroundSettings[key] = value;
    onUpdate?.({ key, value });
  }

  function handleBackgroundSelect(selectedType: BackgroundType) {
    // Find the background config to get color/gradient info
    const bgConfig = backgroundsConfig.find((bg) => bg.type === selectedType);

    // IMPORTANT: Update colors/gradient FIRST before updating type
    // This ensures the crossfade transition has access to the custom options
    if (bgConfig) {
      if (selectedType === BackgroundType.SOLID_COLOR && bgConfig.color) {
        updateBackgroundSetting("backgroundColor", bgConfig.color);
        applyThemeFromColors(bgConfig.color);
      } else if (
        selectedType === BackgroundType.LINEAR_GRADIENT &&
        bgConfig.colors
      ) {
        updateBackgroundSetting("gradientColors", bgConfig.colors);
        updateBackgroundSetting("gradientDirection", bgConfig.direction || 135);
        applyThemeFromColors(undefined, bgConfig.colors);
      } else if (bgConfig.themeColors) {
        // Animated backgrounds: use themeColors for UI theming
        applyThemeFromColors(undefined, bgConfig.themeColors);
      }
    }

    // Update the background type LAST to trigger the crossfade with custom options
    updateBackgroundSetting("backgroundType", selectedType);
  }
</script>

<div class="background-tab" class:visible={isVisible}>
  {#if backgroundSettings.backgroundEnabled}
    <!-- Main Glass Panel -->
    <section class="settings-panel">
      <header class="panel-header">
        <span class="panel-icon"><i class="fas fa-palette"></i></span>
        <div class="panel-header-text">
          <h3 class="panel-title">Background Theme</h3>
          <p class="panel-subtitle">Choose your visual environment</p>
        </div>
      </header>

      <!-- Animated Backgrounds Section -->
      <div class="category-section">
        <div class="category-header">
          <span class="category-icon"><i class="fas fa-wand-magic-sparkles"></i></span>
          <span class="category-label">Animated</span>
        </div>
        <div class="card-grid animated-grid">
          {#each animatedBackgrounds as background}
            <IOSBackgroundCard
              {background}
              isSelected={backgroundSettings.backgroundType === background.type}
              onSelect={handleBackgroundSelect}
              {orientation}
            />
          {/each}
        </div>
      </div>

      <!-- Simple Backgrounds Section -->
      <div class="category-section">
        <div class="category-header">
          <span class="category-icon"><i class="fas fa-circle"></i></span>
          <span class="category-label">Simple</span>
        </div>
        <div class="card-grid simple-grid">
          {#each simpleBackgrounds as background}
            <IOSBackgroundCard
              {background}
              isSelected={backgroundSettings.backgroundType === background.type}
              onSelect={handleBackgroundSelect}
              {orientation}
            />
          {/each}
        </div>
      </div>
    </section>
  {/if}
</div>

<style>
  /* ═══════════════════════════════════════════════════════════════════════════
     BACKGROUND TAB - Polished Glass Panel Layout
     Matches Visibility and Profile tab styling
     ═══════════════════════════════════════════════════════════════════════════ */
  .background-tab {
    container-type: inline-size;
    container-name: background-tab;

    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    padding: clamp(16px, 3cqi, 24px);
    gap: clamp(14px, 2cqi, 20px);

    opacity: 0;
    transition: opacity 200ms ease;
  }

  .background-tab.visible {
    opacity: 1;
  }

  /* ========================================
     SETTINGS PANEL - Dark Glass Style
     ======================================== */
  .settings-panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: clamp(16px, 3cqi, 24px);
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    transition: border-color 0.2s ease;
  }

  .settings-panel:hover {
    border-color: rgba(255, 255, 255, 0.15);
  }

  /* ========================================
     PANEL HEADER
     ======================================== */
  .panel-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .panel-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    font-size: 18px;
    flex-shrink: 0;
    background: color-mix(in srgb, var(--theme-accent, #a855f7) 20%, transparent);
    border: 1px solid color-mix(in srgb, var(--theme-accent, #a855f7) 35%, transparent);
    color: var(--theme-accent, #a855f7);
    box-shadow: 0 0 12px color-mix(in srgb, var(--theme-accent, #a855f7) 20%, transparent);
    transition: all 0.15s ease;
  }

  .settings-panel:hover .panel-icon {
    box-shadow: 0 0 16px color-mix(in srgb, var(--theme-accent, #a855f7) 30%, transparent);
  }

  .panel-header-text {
    flex: 1;
    min-width: 0;
  }

  .panel-title {
    font-size: 17px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  .panel-subtitle {
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    margin: 3px 0 0 0;
  }

  /* ========================================
     CATEGORY SECTIONS
     ======================================== */
  .category-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .category-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .category-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    font-size: 12px;
    background: rgba(255, 255, 255, 0.06);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .category-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  /* ========================================
     CARD GRIDS
     ======================================== */
  .card-grid {
    display: grid;
    gap: 12px;
    width: 100%;
  }

  /* Animated grid: 3 columns on desktop, 2 on mobile */
  .animated-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  /* Simple grid: 2 columns, constrain height to match animated cards */
  .simple-grid {
    grid-template-columns: repeat(2, 1fr);
    align-items: start;
  }

  /* Responsive: 2 columns for animated on smaller containers */
  @container background-tab (max-width: 600px) {
    .animated-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* Very small: single column */
  @container background-tab (max-width: 360px) {
    .animated-grid,
    .simple-grid {
      grid-template-columns: 1fr;
    }
  }

  /* ========================================
     SCROLLBAR
     ======================================== */
  .background-tab::-webkit-scrollbar {
    width: 6px;
  }

  .background-tab::-webkit-scrollbar-track {
    background: transparent;
  }

  .background-tab::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--theme-accent, #a855f7) 20%, transparent);
    border-radius: 3px;
  }

  .background-tab::-webkit-scrollbar-thumb:hover {
    background: color-mix(in srgb, var(--theme-accent, #a855f7) 35%, transparent);
  }

  /* ========================================
     ACCESSIBILITY
     ======================================== */
  @media (prefers-reduced-motion: reduce) {
    .background-tab,
    .settings-panel,
    .panel-icon {
      transition: none;
    }
  }

  @media (prefers-contrast: high) {
    .settings-panel {
      border-width: 2px;
    }
  }
</style>
