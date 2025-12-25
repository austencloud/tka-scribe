<script lang="ts">
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import { releaseNotesDrawerState } from "../state/release-notes-drawer-state.svelte";
  import { versionService } from "$lib/features/feedback/services/implementations/VersionService";
  import { handleModuleChange } from "$lib/shared/navigation-coordinator/navigation-coordinator.svelte";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";

  // Load version data when drawer opens
  $effect(() => {
    if (releaseNotesDrawerState.isOpen && !releaseNotesDrawerState.version) {
      loadCurrentVersion();
    }
  });

  async function loadCurrentVersion() {
    releaseNotesDrawerState.setLoading(true);
    releaseNotesDrawerState.setError(null);
    try {
      const versions = await versionService.getVersions();
      // Find the current version in the list
      const currentVersion = versions.find(v => v.version === __APP_VERSION__);
      releaseNotesDrawerState.setVersion(currentVersion || null);
    } catch (err) {
      releaseNotesDrawerState.setError("Failed to load release notes");
      console.error("Failed to load version:", err);
    } finally {
      releaseNotesDrawerState.setLoading(false);
    }
  }

  async function handleViewAllReleases() {
    releaseNotesDrawerState.close();
    // Set the tab first so settings opens to release-notes
    navigationState.setActiveTab("release-notes");
    // Then navigate to settings module
    await handleModuleChange("settings");
  }

  function handleClose() {
    releaseNotesDrawerState.close();
  }

  // Derived helpers
  const version = $derived(releaseNotesDrawerState.version);
  const isLoading = $derived(releaseNotesDrawerState.isLoading);
  const error = $derived(releaseNotesDrawerState.error);

  const groupedChangelog = $derived.by(() => {
    if (!version?.changelogEntries) return { fixed: [], added: [], improved: [] };
    return {
      fixed: version.changelogEntries.filter(e => e.category === "fixed"),
      added: version.changelogEntries.filter(e => e.category === "added"),
      improved: version.changelogEntries.filter(e => e.category === "improved"),
    };
  });
</script>

<Drawer
  bind:isOpen={releaseNotesDrawerState.isOpen}
  placement="right"
  showHandle={true}
  ariaLabel="Release Notes"
  class="release-notes-drawer"
>
  <div class="drawer-content-wrapper">
    <header class="drawer-header">
      <div class="header-content">
        <i class="fas fa-gift"></i>
        <h2>What's New in v{__APP_VERSION__}</h2>
      </div>
      <button class="close-btn" onclick={handleClose} aria-label="Close">
        <i class="fas fa-times"></i>
      </button>
    </header>

    <div class="drawer-body">
      {#if isLoading}
        <div class="loading-state">
          <div class="skeleton"></div>
          <div class="skeleton"></div>
        </div>
      {:else if error}
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
        </div>
      {:else if version}
        {#if version.releaseNotes}
          <p class="release-notes-text">{version.releaseNotes}</p>
        {/if}

        {#if version.changelogEntries && version.changelogEntries.length > 0}
          {#each [
            { key: "added", label: "Added", icon: "fa-plus", color: "#22c55e" },
            { key: "improved", label: "Improved", icon: "fa-arrow-up", color: "#3b82f6" },
            { key: "fixed", label: "Fixed", icon: "fa-wrench", color: "#f59e0b" }
          ] as cat}
            {#if groupedChangelog[cat.key].length > 0}
              <section class="changelog-section">
                <h3 style="--cat-color: {cat.color}">
                  <i class="fas {cat.icon}"></i>
                  {cat.label}
                </h3>
                <ul>
                  {#each groupedChangelog[cat.key] as entry}
                    <li>{entry.text}</li>
                  {/each}
                </ul>
              </section>
            {/if}
          {/each}
        {:else}
          <p class="no-changelog">No detailed changelog available for this version.</p>
        {/if}
      {:else}
        <p class="no-version">Version information not available.</p>
      {/if}
    </div>

    <footer class="drawer-footer">
      <button class="view-all-btn" onclick={handleViewAllReleases}>
        <i class="fas fa-history"></i>
        View All Releases
      </button>
    </footer>
  </div>
</Drawer>

<style>
  /* Solid opaque panel background - no blur, no transparency */
  :global(.drawer-content.release-notes-drawer) {
    --sheet-bg: rgb(15, 15, 20);
    --sheet-width: min(420px, 90vw);
    background: rgb(15, 15, 20) !important;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    opacity: 1;
  }

  .drawer-content-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-content i {
    font-size: 20px;
    color: var(--theme-accent, #a78bfa);
  }

  .header-content h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .close-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    cursor: pointer;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }

  .release-notes-text {
    margin: 0 0 24px 0;
    font-size: 14px;
    line-height: 1.6;
    color: var(--theme-text, rgba(255, 255, 255, 0.85));
  }

  .changelog-section {
    margin-bottom: 20px;
  }

  .changelog-section h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 12px 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--cat-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .changelog-section ul {
    margin: 0;
    padding-left: 20px;
    list-style: disc;
  }

  .changelog-section li {
    margin-bottom: 8px;
    font-size: 14px;
    line-height: 1.5;
    color: var(--theme-text, rgba(255, 255, 255, 0.85));
  }

  .no-changelog, .no-version {
    text-align: center;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-style: italic;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .skeleton {
    height: 60px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border-radius: 8px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px;
    text-align: center;
  }

  .error-state i {
    font-size: 32px;
    color: #ef4444;
    margin-bottom: 12px;
  }

  .drawer-footer {
    padding: 16px 24px;
    border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
  }

  .view-all-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .view-all-btn:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
  }
</style>
