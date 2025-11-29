<!--
  SettingsTabContent.svelte

  Renders the appropriate settings tab based on activeTab.
  Keeps tab switching logic isolated from the panel orchestration.
-->
<script lang="ts">
  import type { AppSettings } from "../domain/AppSettings";
  import AccessibilityTab from "./tabs/AccessibilityTab.svelte";
  import BackgroundTab from "./tabs/background/BackgroundTab.svelte";
  import PropTypeTab from "./tabs/PropTypeTab.svelte";
  import VisibilityTab from "./tabs/VisibilityTab.svelte";
  import ProfileTab from "./tabs/ProfileTab.svelte";

  interface Props {
    activeTab: string;
    settings: AppSettings;
    onSettingUpdate: (event: { key: string; value: unknown }) => void;
  }

  let { activeTab, settings, onSettingUpdate }: Props = $props();
</script>

{#if activeTab === "Profile"}
  <ProfileTab currentSettings={settings} onSettingUpdate={onSettingUpdate} />
{:else if activeTab === "PropType"}
  <PropTypeTab {settings} onUpdate={onSettingUpdate} />
{:else if activeTab === "Background"}
  <BackgroundTab {settings} onUpdate={onSettingUpdate} />
{:else if activeTab === "Visibility"}
  <VisibilityTab currentSettings={settings} onSettingUpdate={onSettingUpdate} />
{:else if activeTab === "Accessibility"}
  <AccessibilityTab currentSettings={settings} onSettingUpdate={onSettingUpdate} />
{/if}
