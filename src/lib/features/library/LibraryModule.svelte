<!--
  LibraryModule.svelte - Main Library Module Component

  Navigation flow:
  - Dashboard (landing page) → Shows overview of sequences and favorites
  - Sequences → Full grid view of all sequences
  - Favorites → Filtered view of favorite sequences

  Uses a stack-based navigation for drill-down views with back button.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import {
    libraryState,
    type LibraryViewSection,
  } from "./state/library-state.svelte";
  import LibraryDashboard from "./components/LibraryDashboard.svelte";
  import SequencesView from "./components/SequencesView.svelte";
  import UserVideoLibraryView from "$lib/shared/video-collaboration/components/UserVideoLibraryView.svelte";
  // Navigation state
  let currentView = $state<"dashboard" | LibraryViewSection>("dashboard");
  let viewStack = $state<string[]>([]);
  let hapticService: IHapticFeedbackService | undefined;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Navigation functions
  function navigateTo(section: LibraryViewSection) {
    viewStack = [...viewStack, currentView];
    currentView = section;

    // Also update library state so filters work correctly
    libraryState.setActiveSection(section);
  }

  function navigateBack() {
    hapticService?.trigger("selection");
    if (viewStack.length > 0) {
      const previous = viewStack.pop();
      currentView =
        (previous as "dashboard" | LibraryViewSection) ?? "dashboard";
      viewStack = [...viewStack]; // Trigger reactivity

      if (previous && previous !== "dashboard") {
        libraryState.setActiveSection(previous as LibraryViewSection);
      }
    } else {
      currentView = "dashboard";
    }
  }

  function navigateToDashboard() {
    viewStack = [];
    currentView = "dashboard";
  }

  // Check if we can go back
  const canGoBack = $derived(viewStack.length > 0);

  // View titles for header
  const viewTitles: Record<string, string> = {
    dashboard: "Library",
    sequences: "All Sequences",
    collections: "Collections",
    acts: "Acts",
    favorites: "Favorites",
    videos: "My Videos",
  };

  // View icons for header
  const viewIcons: Record<string, string> = {
    dashboard: "fa-book",
    sequences: "fa-th",
    collections: "fa-folder",
    acts: "fa-film",
    favorites: "fa-star",
    videos: "fa-video",
  };
</script>

<div class="library-module">
  <!-- Header with back navigation -->
  {#if currentView !== "dashboard"}
    <div class="view-header">
      <button class="back-btn" onclick={navigateBack} aria-label="Go back">
        <i class="fas fa-arrow-left"></i>
      </button>
      <div class="header-title">
        <i class="fas {viewIcons[currentView] || 'fa-book'}"></i>
        <h1>{viewTitles[currentView] || "Library"}</h1>
      </div>
      <div class="header-spacer"></div>
    </div>
  {/if}

  <!-- Content Area - instant view switching -->
  <div class="content-area">
    {#key currentView}
      <div class="view-container">
        {#if currentView === "dashboard"}
          <LibraryDashboard onNavigate={navigateTo} />
        {:else if currentView === "videos"}
          <UserVideoLibraryView />
        {:else if currentView === "sequences" || currentView === "favorites" || currentView === "collections" || currentView === "acts"}
          <SequencesView />
        {/if}
      </div>
    {/key}
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

    /* Enable container queries for responsive design */
    container-type: size;
    container-name: library-module;
  }

  /* View Header */
  .view-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md, 16px);
    padding: var(--spacing-md, 16px);
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }

  .back-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-md, 8px);
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm, 8px);
    flex: 1;
  }

  .header-title i {
    font-size: 1.25rem;
    color: rgba(16, 185, 129, 0.8);
  }

  .header-title h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .header-spacer {
    width: 52px; /* Match back button width for centering */
  }

  /* Content Area */
  .content-area {
    position: relative;
    flex: 1;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .view-container {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
</style>
