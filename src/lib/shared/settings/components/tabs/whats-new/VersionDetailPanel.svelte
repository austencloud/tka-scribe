<!-- VersionDetailPanel - Shows full release details in a drawer -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { AppVersion, ChangelogCategory, ChangelogEntry } from "$lib/features/feedback/domain/models/version-models";
  import { PRE_RELEASE_VERSION } from "$lib/features/feedback/domain/models/version-models";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import FeedbackViewPanel from "./FeedbackViewPanel.svelte";
  import EditableChangelogItem from "./EditableChangelogItem.svelte";
  import EditableReleaseNotes from "./EditableReleaseNotes.svelte";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte";
  import { versionService } from "$lib/features/feedback/services/implementations/VersionService";

  let {
    version,
    isOpen = $bindable(false),
  }: {
    version: AppVersion | null;
    isOpen?: boolean;
  } = $props();

  // Feedback detail panel state
  let selectedFeedbackId = $state<string | null>(null);
  let feedbackPanelOpen = $state(false);

  // Track which item is currently being edited (only one at a time)
  let currentlyEditingId = $state<string | null>(null);

  function openFeedbackDetail(entry: ChangelogEntry) {
    if (entry.feedbackId) {
      selectedFeedbackId = entry.feedbackId;
      feedbackPanelOpen = true;
    }
  }

  function startEditingItem(id: string) {
    currentlyEditingId = id;
  }

  function endEditingItem() {
    currentlyEditingId = null;
  }

  function isItemEditing(id: string): boolean {
    return currentlyEditingId === id;
  }

  // Admin check
  const isAdmin = $derived(authStore.isAdmin);

  // Handle saving an edited changelog entry
  async function handleSaveEntry(category: ChangelogCategory, entryIndex: number, newText: string) {
    if (!version) return;

    // Find the absolute index in the full changelog array
    const allEntries = version.changelogEntries || [];
    const categoryEntries = allEntries.filter(e => e.category === category);
    const entry = categoryEntries[entryIndex];
    const absoluteIndex = allEntries.indexOf(entry);

    if (absoluteIndex === -1) {
      throw new Error("Entry not found");
    }

    // Update via service
    const updatedEntry: ChangelogEntry = {
      ...entry,
      text: newText,
    };

    await versionService.updateChangelogEntry(version.version, absoluteIndex, updatedEntry);

    // Update local state
    if (version.changelogEntries) {
      version.changelogEntries[absoluteIndex] = updatedEntry;
    }
  }

  // Handle saving edited release notes
  async function handleSaveReleaseNotes(newText: string) {
    if (!version) return;

    await versionService.updateReleaseNotes(version.version, newText);

    // Update local state
    version.releaseNotes = newText;
  }

  // Detect mobile for drawer placement
  let isMobile = $state(false);

  onMount(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    isMobile = mediaQuery.matches;

    const handler = (e: MediaQueryListEvent) => {
      isMobile = e.matches;
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  });

  const placement = $derived(isMobile ? "bottom" : "right");

  // Check if we have curated changelog entries
  const hasChangelog = $derived(version?.changelogEntries && version.changelogEntries.length > 0);

  // Group changelog entries by category
  const groupedChangelog = $derived.by(() => {
    if (!version?.changelogEntries) return { fixed: [], added: [], improved: [] };
    const fixed = version.changelogEntries.filter((e) => e.category === "fixed");
    const added = version.changelogEntries.filter((e) => e.category === "added");
    const improved = version.changelogEntries.filter((e) => e.category === "improved");
    return { fixed, added, improved };
  });

  // Format date
  const formattedDate = $derived(
    version?.releasedAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }) ?? ""
  );

  // Check if pre-release
  const isPreRelease = $derived(version?.version === PRE_RELEASE_VERSION);

  // Get icon for category
  function getCategoryIcon(category: ChangelogCategory): string {
    switch (category) {
      case "fixed": return "fa-bug";
      case "added": return "fa-sparkles";
      case "improved": return "fa-arrow-up";
    }
  }

  // Get label for category
  function getCategoryLabel(category: ChangelogCategory): string {
    switch (category) {
      case "fixed": return "Bug Fixes";
      case "added": return "New Features";
      case "improved": return "Improvements";
    }
  }
</script>

<Drawer
  bind:isOpen
  {placement}
  class="version-detail-drawer"
  showHandle={isMobile}
  ariaLabel={version ? `Version ${version.version} details` : "Version details"}
>
  {#if version}
    <div class="panel-content">
      <!-- Header -->
      <header class="panel-header">
        <button type="button" class="close-button" onclick={() => (isOpen = false)} aria-label="Close version details">
          <i class="fas fa-times"></i>
        </button>

        <div class="version-badge" class:pre-release={isPreRelease}>
          {#if isPreRelease}
            <span class="badge-text">Pre-Release</span>
          {:else}
            <span class="badge-text">v{version.version}</span>
          {/if}
        </div>

        <time class="release-date">{formattedDate}</time>
      </header>

      <!-- Release Notes -->
      {#if version.releaseNotes}
        <section class="release-notes-section">
          <h3>Release Notes</h3>
          <EditableReleaseNotes
            text={version.releaseNotes}
            canEdit={isAdmin}
            onSave={handleSaveReleaseNotes}
            itemId="release-notes"
            isEditing={isItemEditing("release-notes")}
            onStartEdit={startEditingItem}
            onEndEdit={endEditingItem}
          />
        </section>
      {/if}

      {#if hasChangelog}
        <!-- Changelog -->
        <section class="changelog-section">
          <h3>What Changed</h3>

          <!-- Bug Fixes -->
          {#if groupedChangelog.fixed.length > 0}
            <div class="change-group">
              <h4 class="group-title fixed">
                <i class="fas {getCategoryIcon('fixed')}"></i>
                {getCategoryLabel("fixed")}
                <span class="count">{groupedChangelog.fixed.length}</span>
              </h4>
              <ul class="change-list">
                {#each groupedChangelog.fixed as entry, index (entry.feedbackId ?? entry.text)}
                  {@const itemId = `fixed-${index}`}
                  <li>
                    <EditableChangelogItem
                      {entry}
                      canEdit={isAdmin}
                      onSave={(newText) => handleSaveEntry('fixed', index, newText)}
                      onOpenFeedback={() => openFeedbackDetail(entry)}
                      {itemId}
                      isEditing={isItemEditing(itemId)}
                      onStartEdit={startEditingItem}
                      onEndEdit={endEditingItem}
                    />
                  </li>
                {/each}
              </ul>
            </div>
          {/if}

          <!-- New Features -->
          {#if groupedChangelog.added.length > 0}
            <div class="change-group">
              <h4 class="group-title added">
                <i class="fas {getCategoryIcon('added')}"></i>
                {getCategoryLabel("added")}
                <span class="count">{groupedChangelog.added.length}</span>
              </h4>
              <ul class="change-list">
                {#each groupedChangelog.added as entry, index (entry.feedbackId ?? entry.text)}
                  {@const itemId = `added-${index}`}
                  <li>
                    <EditableChangelogItem
                      {entry}
                      canEdit={isAdmin}
                      onSave={(newText) => handleSaveEntry('added', index, newText)}
                      onOpenFeedback={() => openFeedbackDetail(entry)}
                      {itemId}
                      isEditing={isItemEditing(itemId)}
                      onStartEdit={startEditingItem}
                      onEndEdit={endEditingItem}
                    />
                  </li>
                {/each}
              </ul>
            </div>
          {/if}

          <!-- Improvements -->
          {#if groupedChangelog.improved.length > 0}
            <div class="change-group">
              <h4 class="group-title improved">
                <i class="fas {getCategoryIcon('improved')}"></i>
                {getCategoryLabel("improved")}
                <span class="count">{groupedChangelog.improved.length}</span>
              </h4>
              <ul class="change-list">
                {#each groupedChangelog.improved as entry, index (entry.feedbackId ?? entry.text)}
                  {@const itemId = `improved-${index}`}
                  <li>
                    <EditableChangelogItem
                      {entry}
                      canEdit={isAdmin}
                      onSave={(newText) => handleSaveEntry('improved', index, newText)}
                      onOpenFeedback={() => openFeedbackDetail(entry)}
                      {itemId}
                      isEditing={isItemEditing(itemId)}
                      onStartEdit={startEditingItem}
                      onEndEdit={endEditingItem}
                    />
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        </section>
      {:else}
        <!-- No changelog state -->
        <section class="no-changelog-section">
          <div class="no-changelog-content">
            <i class="fas fa-clipboard-list"></i>
            <h3>No Changelog Available</h3>
            <p>Detailed changes for this version weren't recorded.</p>
          </div>
        </section>
      {/if}

    </div>
  {/if}
</Drawer>

<!-- Nested drawer for feedback details -->
<FeedbackViewPanel
  feedbackId={selectedFeedbackId}
  bind:isOpen={feedbackPanelOpen}
/>

<style>
  .panel-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 24px;
    overflow-y: auto;
  }

  /* Header */
  .panel-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    position: relative;
  }

  .close-button {
    position: absolute;
    top: 0;
    right: 0;
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .version-badge {
    display: inline-flex;
    align-items: center;
    padding: 8px 20px;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1));
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 24px;
  }

  .version-badge.pre-release {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .badge-text {
    font-size: 20px;
    font-weight: 700;
    color: #a78bfa;
  }

  .pre-release .badge-text {
    color: rgba(255, 255, 255, 0.5);
    font-size: 16px;
  }

  .release-date {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
  }

  /* Sections */
  section {
    margin-bottom: 24px;
  }

  section h3 {
    margin: 0 0 12px 0;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Changelog */
  .change-group {
    margin-bottom: 20px;
  }

  .change-group:last-child {
    margin-bottom: 0;
  }

  .group-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 10px 0;
    font-size: 14px;
    font-weight: 600;
  }

  .group-title .count {
    margin-left: auto;
    padding: 2px 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    font-size: 12px;
    font-weight: 500;
  }

  .group-title.fixed {
    color: #fca5a5;
  }

  .group-title.fixed i {
    color: #ef4444;
  }

  .group-title.added {
    color: #c4b5fd;
  }

  .group-title.added i {
    color: #8b5cf6;
  }

  .group-title.improved {
    color: #93c5fd;
  }

  .group-title.improved i {
    color: #3b82f6;
  }

  .change-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .change-list li {
    margin-bottom: 6px;
  }

  .change-list li:last-child {
    margin-bottom: 0;
  }

  /* No changelog state */
  .no-changelog-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .no-changelog-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 32px;
  }

  .no-changelog-content i {
    font-size: 48px;
    color: rgba(255, 255, 255, 0.15);
    margin-bottom: 16px;
  }

  .no-changelog-content h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-transform: none;
    letter-spacing: 0;
  }

  .no-changelog-content p {
    margin: 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .panel-content {
      padding: 16px;
      max-height: 85vh;
    }

    .panel-header {
      margin-bottom: 16px;
    }

    .version-badge {
      padding: 6px 16px;
    }

    .badge-text {
      font-size: 18px;
    }
  }
</style>
