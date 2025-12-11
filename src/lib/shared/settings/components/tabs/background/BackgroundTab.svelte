<!-- BackgroundTab.svelte - Background settings and configuration -->
<script lang="ts">
  import type { AppSettings } from "../../../domain/AppSettings";
  import { resolve } from "../../../../inversify/di";
  import { TYPES } from "../../../../inversify/types";
  import { BackgroundType } from "../../../../background/shared/domain/enums/background-enums";
  import type { IDeviceDetector } from "../../../../device/services/contracts/IDeviceDetector";
  import type { IViewportService } from "../../../../device/services/contracts/IViewportService";
  import { onMount } from "svelte";
  import IOSBackgroundCardGrid from "./IOSBackgroundCardGrid.svelte";
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

<div class="background-tab-content">
  {#if backgroundSettings.backgroundEnabled}
    <IOSBackgroundCardGrid
      selectedBackground={backgroundSettings.backgroundType}
      onBackgroundSelect={handleBackgroundSelect}
      {orientation}
    />
  {/if}
</div>

<style>
  .background-tab-content {
    width: 100%;
    display: block;
    padding: 12px 6px 6px;
    box-sizing: border-box;
  }
</style>
