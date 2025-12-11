<!--
  LibraryModule.svelte - Personal Content Library

  Three tabs:
  - Sequences: User's saved sequences
  - Collections: Folders for organizing content
  - Compositions: Saved compositions from Compose module
-->
<script lang="ts">
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import { onMount } from "svelte";
  import SequencesView from "./components/SequencesView.svelte";
  import CollectionsView from "./components/CollectionsView.svelte";
  import CompositionsView from "./components/CompositionsView.svelte";

  type LibraryTab = "sequences" | "collections" | "compositions";

  // Active tab synced with navigation state
  let activeTab = $state<LibraryTab>("sequences");

  // Track previous section to detect actual changes
  let prevSection: string | undefined;

  // Sync with navigation state
  $effect(() => {
    const section = navigationState.activeTab;
    if (
      section !== prevSection &&
      (section === "sequences" ||
        section === "collections" ||
        section === "compositions")
    ) {
      prevSection = section;
      activeTab = section;
    }
  });

  // Initialize on mount
  onMount(() => {
    const section = navigationState.activeTab;
    prevSection = section;
    // Set default tab if none set or invalid
    if (
      !section ||
      (section !== "sequences" &&
        section !== "collections" &&
        section !== "compositions")
    ) {
      navigationState.setActiveTab("sequences");
    }
  });

  function isTabActive(tab: LibraryTab): boolean {
    return activeTab === tab;
  }
</script>

<div class="library-module">
  <div class="content-container">
    <!-- Sequences Tab -->
    <div class="tab-panel" class:active={isTabActive("sequences")}>
      <SequencesView />
    </div>

    <!-- Collections Tab -->
    <div class="tab-panel" class:active={isTabActive("collections")}>
      <CollectionsView />
    </div>

    <!-- Compositions Tab -->
    <div class="tab-panel" class:active={isTabActive("compositions")}>
      <CompositionsView />
    </div>
  </div>
</div>

<style>
  .library-module {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: transparent;
    color: var(--foreground, #ffffff);
    container-type: size;
    container-name: library-module;
  }

  .content-container {
    position: relative;
    flex: 1;
    width: 100%;
    height: 100%;
    overflow: hidden;
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
</style>
