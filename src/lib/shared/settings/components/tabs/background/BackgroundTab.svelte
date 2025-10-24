<!-- BackgroundTab.svelte - Background settings and configuration -->
<script lang="ts">
  import type { AppSettings, IDeviceDetector, IViewportService } from "$shared";
  import { BackgroundType, resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import BackgroundSelector from "./BackgroundSelector.svelte";
  import { backgroundsConfig } from "./background-config";

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
    updateBackgroundSetting("backgroundType", selectedType);
  }

  function handleQualityChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    updateBackgroundSetting(
      "backgroundQuality",
      target.value as "low" | "medium" | "high"
    );
  }

  // Get background info for display
  const currentBackgroundInfo = $derived(() => {
    return backgroundsConfig.find(
      (bg) => bg.type === backgroundSettings.backgroundType
    );
  });
</script>

<div class="tab-content">
  {#if backgroundSettings.backgroundEnabled}
    <BackgroundSelector
      selectedBackground={backgroundSettings.backgroundType}
      onBackgroundSelect={handleBackgroundSelect}
      {orientation}
    />
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
