<!-- BackgroundTab.svelte - Background settings and configuration -->
<script lang="ts">
  import type { AppSettings, IDeviceDetector, IViewportService } from "$shared";
  import { BackgroundType, resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import BackgroundCategorySelector from "./BackgroundCategorySelector.svelte";
  import BackgroundSelector from "./BackgroundSelector.svelte";
  import SimpleBackgroundPicker from "./SimpleBackgroundPicker.svelte";

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

  function handleCategorySelect(category: "animated" | "simple") {
    updateBackgroundSetting("backgroundCategory", category);

    // Set default background type for the category
    if (category === "animated") {
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
    } else {
      updateBackgroundSetting("backgroundType", BackgroundType.LINEAR_GRADIENT);
      updateBackgroundSetting(
        "gradientColors",
        settings.colors || ["#667eea", "#764ba2"]
      );
      updateBackgroundSetting("gradientDirection", settings.direction || 135);
    }
  }
</script>

<div class="tab-content">
  {#if backgroundSettings.backgroundEnabled}
    <!-- Category selector -->
    <BackgroundCategorySelector
      selectedCategory={backgroundSettings.backgroundCategory}
      onCategorySelect={handleCategorySelect}
    />

    <!-- Animated backgrounds -->
    {#if backgroundSettings.backgroundCategory === "animated"}
      <BackgroundSelector
        selectedBackground={backgroundSettings.backgroundType}
        onBackgroundSelect={handleBackgroundSelect}
        {orientation}
      />
    {:else}
      <!-- Simple backgrounds -->
      <SimpleBackgroundPicker
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
</style>
