<!--
  LibraryTab.svelte - Account Library Tab

  Wraps the existing Library module content for use within the Account module.
  Shows: My Sequences, Favorites, Collections, Acts
-->
<script lang="ts">
  import { libraryState, type LibraryViewSection } from "../../library/state/library-state.svelte";
  import LibraryDashboard from "../../library/components/LibraryDashboard.svelte";
  import SequencesView from "../../library/components/SequencesView.svelte";
  import { fade, fly } from "svelte/transition";
  import { authStore } from "../../../shared/auth/stores/authStore.svelte";

  // Navigation state (local to this tab)
  let currentView = $state<"dashboard" | LibraryViewSection>("dashboard");
  let viewStack = $state<string[]>([]);

  // Navigation functions
  function navigateTo(section: LibraryViewSection) {
    viewStack = [...viewStack, currentView];
    currentView = section;
    libraryState.setActiveSection(section);
  }

  function navigateBack() {
    if (viewStack.length > 0) {
      const previous = viewStack.pop();
      currentView = (previous as "dashboard" | LibraryViewSection) ?? "dashboard";
      viewStack = [...viewStack];

      if (previous && previous !== "dashboard") {
        libraryState.setActiveSection(previous as LibraryViewSection);
      }
    } else {
      currentView = "dashboard";
    }
  }

  const canGoBack = $derived(viewStack.length > 0);

  const viewTitles: Record<string, string> = {
    dashboard: "Library",
    sequences: "All Sequences",
    collections: "Collections",
    acts: "Acts",
    favorites: "Favorites",
  };

  const viewIcons: Record<string, string> = {
    dashboard: "fa-book",
    sequences: "fa-th",
    collections: "fa-folder",
    acts: "fa-film",
    favorites: "fa-star",
  };
</script>

<div class="library-tab">
  {#if authStore.isAuthenticated}
    <!-- Header with back navigation -->
    {#if currentView !== "dashboard"}
      <div class="view-header" transition:fade={{ duration: 150 }}>
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

    <!-- Content Area -->
    <div class="content-area">
      {#key currentView}
        <div
          class="view-container"
          in:fly={{ x: currentView === "dashboard" ? -50 : 50, duration: 200 }}
          out:fly={{ x: currentView === "dashboard" ? 50 : -50, duration: 150 }}
        >
          {#if currentView === "dashboard"}
            <LibraryDashboard onNavigate={navigateTo} />
          {:else}
            <SequencesView />
          {/if}
        </div>
      {/key}
    </div>
  {:else}
    <!-- Not signed in -->
    <div class="sign-in-prompt">
      <div class="prompt-icon">
        <i class="fas fa-lock"></i>
      </div>
      <h2>Sign in to access your Library</h2>
      <p>Your saved sequences, favorites, and collections will appear here once you sign in.</p>
      <p class="hint">Go to the <strong>Security</strong> tab to sign in.</p>
    </div>
  {/if}
</div>

<style>
  .library-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  /* View Header */
  .view-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }

  .back-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
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
    gap: 8px;
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
    width: 36px;
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

  /* Sign in prompt */
  .sign-in-prompt {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 48px 24px;
    height: 100%;
  }

  .prompt-icon {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(16, 185, 129, 0.15);
    border: 2px solid rgba(16, 185, 129, 0.3);
    margin-bottom: 20px;
  }

  .prompt-icon i {
    font-size: 28px;
    color: rgba(16, 185, 129, 0.9);
  }

  .sign-in-prompt h2 {
    margin: 0 0 12px 0;
    font-size: 20px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
  }

  .sign-in-prompt p {
    margin: 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    max-width: 360px;
    line-height: 1.5;
  }

  .sign-in-prompt .hint {
    margin-top: 16px;
    color: rgba(255, 255, 255, 0.5);
  }

  .sign-in-prompt .hint strong {
    color: rgba(16, 185, 129, 0.9);
  }
</style>
