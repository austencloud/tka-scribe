<!--
  PreferencesTab.svelte - Account Preferences Tab

  App settings, prop types, backgrounds, visibility, accessibility.
  Wraps existing settings tab components.
-->
<script lang="ts">
import { resolve } from "$lib/shared/inversify/di";
import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
  import {
    getSettings,
    updateSettings,
  } from "$lib/shared/application/state/app-state.svelte";
  import PropTypeTab from "$lib/shared/settings/components/tabs/PropTypeTab.svelte";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import AccessibilityTab from "../../../shared/settings/components/tabs/AccessibilityTab.svelte";
  import VisibilityTab from "../../../shared/settings/components/tabs/VisibilityTab.svelte";
  import Toast from "../../create/shared/workspace-panel/components/Toast.svelte";
  import BackgroundTab from "../../../shared/settings/components/tabs/background/BackgroundTab.svelte";

  // Settings subsections
  type PreferencesSection = "propType" | "background" | "visibility" | "misc";

  let activeSection = $state<PreferencesSection>("propType");
  let hapticService = $state<IHapticFeedbackService | null>(null);

  // Toast state
  let showToast = $state(false);
  let toastMessage = $state("Settings saved");

  // Reactive settings
  let settings = $derived(getSettings());

  const sections = [
    { id: "propType" as const, label: "Prop Type", icon: "fa-tag" },
    { id: "background" as const, label: "Background", icon: "fa-image" },
    { id: "visibility" as const, label: "Visibility", icon: "fa-eye" },
    { id: "misc" as const, label: "Miscellaneous", icon: "fa-cog" },
  ];

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
  });

  function switchSection(sectionId: PreferencesSection) {
    hapticService?.trigger("selection");
    activeSection = sectionId;
  }

  async function handleSettingUpdate(event: { key: string; value: unknown }) {
    const updatedSettings = { ...settings, [event.key]: event.value };
    await updateSettings(updatedSettings);

    showToast = true;
    setTimeout(() => {
      showToast = false;
    }, 100);
  }
</script>

<div class="preferences-tab">
  <!-- Section Navigation -->
  <div class="section-nav">
    {#each sections as section}
      <button
        class="section-btn"
        class:active={activeSection === section.id}
        onclick={() => switchSection(section.id)}
      >
        <i class="fas {section.icon}"></i>
        <span>{section.label}</span>
      </button>
    {/each}
  </div>

  <!-- Content Area -->
  <div class="content-area">
    {#if activeSection === "propType"}
      <PropTypeTab {settings} onUpdate={handleSettingUpdate} />
    {:else if activeSection === "background"}
      <BackgroundTab {settings} onUpdate={handleSettingUpdate} />
    {:else if activeSection === "visibility"}
      <VisibilityTab currentSettings={settings} onSettingUpdate={handleSettingUpdate} />
    {:else if activeSection === "misc"}
      <AccessibilityTab currentSettings={settings} onSettingUpdate={handleSettingUpdate} />
    {/if}
  </div>

  <!-- Toast -->
  {#if showToast}
    <Toast message={toastMessage} />
  {/if}
</div>

<style>
  .preferences-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  /* Section Navigation */
  .section-nav {
    display: flex;
    gap: 8px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    overflow-x: auto;
    flex-shrink: 0;
    scrollbar-width: none;
  }

  .section-nav::-webkit-scrollbar {
    display: none;
  }

  .section-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .section-btn:hover {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.8);
  }

  .section-btn.active {
    background: rgba(99, 102, 241, 0.15);
    border-color: rgba(99, 102, 241, 0.3);
    color: #a5b4fc;
  }

  .section-btn i {
    font-size: 14px;
  }

  /* Content Area */
  .content-area {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  /* Mobile: Stack sections vertically */
  @media (max-width: 600px) {
    .section-nav {
      padding: 12px;
      gap: 6px;
    }

    .section-btn {
      padding: 8px 12px;
      font-size: 13px;
    }

    .section-btn span {
      display: none;
    }

    .section-btn i {
      font-size: 16px;
    }

    .content-area {
      padding: 12px;
    }
  }
</style>
