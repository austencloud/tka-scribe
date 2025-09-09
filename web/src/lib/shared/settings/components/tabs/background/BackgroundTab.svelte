<!-- BackgroundTab.svelte - Background settings and configuration -->
<script lang="ts">
  import type { AppSettings } from "$shared";
  import { BackgroundType } from "$shared";
  import SettingCard from "../../SettingCard.svelte";
  import ToggleSetting from "../../ToggleSetting.svelte";
  import BackgroundSelector from "./BackgroundSelector.svelte";
  import { backgroundsConfig } from "./background-config";

  interface Props {
    settings: AppSettings;
    onUpdate?: (event: { key: string; value: unknown }) => void;
  }

  let { settings, onUpdate }: Props = $props();

  // Background settings state
  let backgroundSettings = $state({
    backgroundEnabled: settings?.backgroundEnabled ?? true,
    backgroundType: settings?.backgroundType || BackgroundType.NIGHT_SKY,
    backgroundQuality: settings?.backgroundQuality || "medium",
  });

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
    <SettingCard
      title="Background Type"
      description="Choose your preferred animated background style"
    >
      <BackgroundSelector
        selectedBackground={backgroundSettings.backgroundType}
        onBackgroundSelect={handleBackgroundSelect}
      />

    </SettingCard>


  {/if}
</div>

<style>
  .tab-content {
    width: 100%;
    max-width: var(--max-content-width, 100%);
    margin: 0 auto;
    container-type: inline-size;
  }
</style>
