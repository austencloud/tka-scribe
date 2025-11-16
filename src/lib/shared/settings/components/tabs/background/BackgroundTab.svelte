<!-- BackgroundTab.svelte - Background settings and configuration -->
<script lang="ts">
  import type { AppSettings, IDeviceDetector, IViewportService } from "$shared";
  import { BackgroundType, resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import IOSSegmentedControl from "../../IOSSegmentedControl.svelte";
  import IOSBackgroundCardGrid from "./IOSBackgroundCardGrid.svelte";
  import IOSSimpleBackgroundCardGrid from "./IOSSimpleBackgroundCardGrid.svelte";
  import {
    calculateGradientLuminance,
    calculateLuminance,
    extractAccentColor,
    generateGlassMorphismTheme,
    getThemeMode,
  } from "../../../utils/background-theme-calculator";

  let { settings, onUpdate } = $props<{
    settings: AppSettings;
    onUpdate?: (event: { key: string; value: unknown }) => void;
  }>();

  // Services
  let deviceDetector: IDeviceDetector | null = null;
  let viewportService: IViewportService | null = null;

  // Device orientation state
  let orientation = $state<"portrait" | "landscape" | "square">("square");

  // Background settings state
  let backgroundSettings = $state({
    backgroundEnabled: settings?.backgroundEnabled ?? true,
    backgroundCategory: settings?.backgroundCategory || "animated",
    backgroundType: settings?.backgroundType || BackgroundType.NIGHT_SKY,
    backgroundQuality: settings?.backgroundQuality || "medium",
    backgroundColor: settings?.backgroundColor || "#1a1a2e",
    gradientColors: settings?.gradientColors || ["#667eea", "#764ba2"],
    gradientDirection: settings?.gradientDirection || 135,
  });

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

  function handleCategorySelect(category: string) {
    const validCategory = category as "animated" | "simple";
    updateBackgroundSetting("backgroundCategory", validCategory);

    // Set default background type for the category
    if (validCategory === "animated") {
      updateBackgroundSetting("backgroundType", BackgroundType.NIGHT_SKY);
    } else {
      updateBackgroundSetting("backgroundType", BackgroundType.LINEAR_GRADIENT);
    }
  }

  function handleBackgroundSelect(selectedType: BackgroundType) {
    updateBackgroundSetting("backgroundType", selectedType);
  }

  function handleSimpleBackgroundUpdate(settings: {
    type: "solid" | "gradient";
    color?: string;
    colors?: string[];
    direction?: number;
  }) {
    if (settings.type === "solid") {
      updateBackgroundSetting("backgroundType", BackgroundType.SOLID_COLOR);
      updateBackgroundSetting("backgroundColor", settings.color || "#1a1a2e");

      // Apply theme-aware glass morphism for solid colors
      if (settings.color) {
        applyDynamicGlassMorphism(settings.color);
      }
    } else {
      updateBackgroundSetting("backgroundType", BackgroundType.LINEAR_GRADIENT);
      updateBackgroundSetting(
        "gradientColors",
        settings.colors || ["#667eea", "#764ba2"]
      );
      updateBackgroundSetting("gradientDirection", settings.direction || 135);

      // Apply theme-aware glass morphism for gradients
      if (settings.colors && settings.colors.length > 0) {
        applyDynamicGlassMorphism(undefined, settings.colors);
      }
    }
  }

  /**
   * Apply dynamic glass morphism based on background luminance
   */
  function applyDynamicGlassMorphism(
    solidColor?: string,
    gradientColors?: string[]
  ) {
    if (typeof document === "undefined") return;

    // Calculate luminance
    const luminance = solidColor
      ? calculateLuminance(solidColor)
      : gradientColors
        ? calculateGradientLuminance(gradientColors)
        : 0;

    // Determine theme mode
    const mode = getThemeMode(luminance);

    // Extract accent color for borders (if gradient)
    const accentColor = gradientColors
      ? extractAccentColor(gradientColors)
      : solidColor;

    // Generate theme
    const theme = generateGlassMorphismTheme(mode, accentColor);

    // Apply CSS variables
    const root = document.documentElement;
    root.style.setProperty("--panel-bg-current", theme.panelBg);
    root.style.setProperty("--panel-border-current", theme.panelBorder);
    root.style.setProperty("--panel-hover-current", theme.panelHover);
    root.style.setProperty("--card-bg-current", theme.cardBg);
    root.style.setProperty("--card-border-current", theme.cardBorder);
    root.style.setProperty("--card-hover-current", theme.cardHover);
    root.style.setProperty("--text-primary-current", theme.textPrimary);
    root.style.setProperty("--text-secondary-current", theme.textSecondary);
    root.style.setProperty("--input-bg-current", theme.inputBg);
    root.style.setProperty("--input-border-current", theme.inputBorder);
    root.style.setProperty("--input-focus-current", theme.inputFocus);
    root.style.setProperty("--button-active-current", theme.buttonActive);
    root.style.setProperty("--glass-backdrop", theme.backdropBlur);
  }
</script>

<div class="tab-content">
  {#if backgroundSettings.backgroundEnabled}
    <!-- iOS Segmented Control for category selection -->
    <div class="category-selector-container">
      <IOSSegmentedControl
        segments={[
          {
            id: "animated",
            label: "Animated",
            icon: '<i class="fas fa-film"></i>',
          },
          {
            id: "simple",
            label: "Simple",
            icon: '<i class="fas fa-palette"></i>',
          },
        ]}
        selectedId={backgroundSettings.backgroundCategory}
        onSegmentSelect={handleCategorySelect}
      />
    </div>

    <!-- Animated backgrounds -->
    {#if backgroundSettings.backgroundCategory === "animated"}
      <IOSBackgroundCardGrid
        selectedBackground={backgroundSettings.backgroundType}
        onBackgroundSelect={handleBackgroundSelect}
        {orientation}
      />
    {:else}
      <!-- Simple backgrounds -->
      <IOSSimpleBackgroundCardGrid
        selectedType={backgroundSettings.backgroundType ===
        BackgroundType.SOLID_COLOR
          ? "solid"
          : "gradient"}
        backgroundColor={backgroundSettings.backgroundColor}
        gradientColors={backgroundSettings.gradientColors}
        gradientDirection={backgroundSettings.gradientDirection}
        onUpdate={handleSimpleBackgroundUpdate}
      />
    {/if}
  {/if}
</div>

<style>
  .tab-content {
    width: 100%;
    height: 100%;
    max-width: var(--max-content-width, 100%);
    margin: 0 auto;
    container-type: size; /* Enable both width and height container queries */
    container-name: tab-content;
    display: flex;
    flex-direction: column;
  }

  /* iOS segmented control container - Pixel Perfect */
  .category-selector-container {
    width: 100%;
    padding: clamp(12px, 2cqh, 16px) clamp(16px, 3cqw, 20px);
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
