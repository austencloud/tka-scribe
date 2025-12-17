<!--
  InboxModule.svelte - Inbox Module

  Two tabs:
  - Messages: Conversations with other users
  - Notifications: System alerts and updates
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import { inboxState } from "$lib/shared/inbox/state/inbox-state.svelte";
  import MessagesTab from "./components/MessagesTab.svelte";
  import NotificationsTab from "./components/NotificationsTab.svelte";

  type InboxTab = "messages" | "notifications";

  // Active tab synced with navigation state
  let activeTab = $state<InboxTab>("messages");

  // Track previous section to detect actual changes
  let prevSection: string | undefined;

  // Sync with navigation state
  $effect(() => {
    const section = navigationState.activeTab;
    if (
      section !== prevSection &&
      (section === "messages" || section === "notifications")
    ) {
      prevSection = section;
      activeTab = section;

      // Also sync inbox state for consistency
      inboxState.setTab(section);
    }
  });

  // Initialize on mount
  onMount(() => {
    const section = navigationState.activeTab;
    prevSection = section;

    // Set default tab if none set or invalid
    if (!section || (section !== "messages" && section !== "notifications")) {
      navigationState.setActiveTab("messages");
    }

    // Reset inbox view state when entering module
    inboxState.currentView = "list";
  });

  function isTabActive(tab: InboxTab): boolean {
    return activeTab === tab;
  }
</script>

<div class="inbox-module">
  <div class="content-wrapper">
    <div class="glass-card">
      <!-- Messages Tab -->
      <div class="tab-panel" class:active={isTabActive("messages")}>
        <MessagesTab />
      </div>

      <!-- Notifications Tab -->
      <div class="tab-panel" class:active={isTabActive("notifications")}>
        <NotificationsTab />
      </div>
    </div>
  </div>
</div>

<style>
  .inbox-module {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: transparent;
    color: var(--theme-text, #ffffff);
    container-type: size;
    container-name: inbox-module;
  }

  /* Wrapper provides padding and centering on desktop */
  .content-wrapper {
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding: clamp(16px, 3cqi, 32px);
    max-width: 1000px;
    margin: 0 auto;
  }

  /* Glass card container - theme-aware */
  .glass-card {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    border-radius: clamp(16px, 3cqi, 24px);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    box-shadow: var(--theme-shadow, 0 4px 24px rgba(0, 0, 0, 0.2));
    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .tab-panel {
    position: absolute;
    inset: 0;
    display: none;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .tab-panel.active {
    display: flex;
    flex-direction: column;
  }

  /* Mobile - full width, no padding, minimal border radius */
  @media (max-width: 768px) {
    .content-wrapper {
      padding: 0;
      max-width: none;
    }

    .glass-card {
      border-radius: 0;
      border-left: none;
      border-right: none;
      border-bottom: none;
    }
  }
</style>
