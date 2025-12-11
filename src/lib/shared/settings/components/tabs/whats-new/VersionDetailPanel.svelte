<!-- VersionDetailPanel - Shows full release details in a drawer -->
<script lang="ts">
  import { onMount } from "svelte";
  import type {
    AppVersion,
    ChangelogCategory,
    ChangelogEntry,
  } from "$lib/features/feedback/domain/models/version-models";
  import { PRE_RELEASE_VERSION } from "$lib/features/feedback/domain/models/version-models";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import FeedbackViewPanel from "./FeedbackViewPanel.svelte";
  import EditableChangelogItem from "./EditableChangelogItem.svelte";
  import EditableReleaseNotes from "./EditableReleaseNotes.svelte";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte";
  import { versionService } from "$lib/features/feedback/services/implementations/VersionService";

  // Undo system
  type UndoAction =
    | { type: "delete"; entry: ChangelogEntry; absoluteIndex: number }
    | { type: "edit"; oldText: string; absoluteIndex: number }
    | { type: "editReleaseNotes"; oldText: string };

  let undoStack = $state<UndoAction[]>([]);
  let undoMessage = $state<string | null>(null);
  let undoMessageTimeout: ReturnType<typeof setTimeout> | null = null;

  function showUndoMessage(message: string) {
    undoMessage = message;
    if (undoMessageTimeout) clearTimeout(undoMessageTimeout);
    undoMessageTimeout = setTimeout(() => {
      undoMessage = null;
    }, 3000);
  }

  async function handleUndo() {
    if (undoStack.length === 0 || !version) return;

    const action = undoStack.pop();
    if (!action) return;

    // Force reactivity
    undoStack = [...undoStack];

    try {
      if (action.type === "delete") {
        // Re-add the deleted entry at its original position
        const entries = version.changelogEntries || [];
        entries.splice(action.absoluteIndex, 0, action.entry);
        version.changelogEntries = [...entries];
        await versionService.updateChangelogEntries(version.version, version.changelogEntries);
        showUndoMessage("Entry restored");
      } else if (action.type === "edit") {
        // Restore the old text
        const entry = version.changelogEntries?.[action.absoluteIndex];
        if (entry) {
          const restoredEntry: ChangelogEntry = {
            category: entry.category,
            text: action.oldText,
            ...(entry.feedbackId && { feedbackId: entry.feedbackId }),
          };
          version.changelogEntries![action.absoluteIndex] = restoredEntry;
          version.changelogEntries = [...version.changelogEntries!];
          await versionService.updateChangelogEntry(version.version, action.absoluteIndex, restoredEntry);
          showUndoMessage("Edit reverted");
        }
      } else if (action.type === "editReleaseNotes") {
        version.releaseNotes = action.oldText;
        await versionService.updateReleaseNotes(version.version, action.oldText);
        showUndoMessage("Release notes reverted");
      }
    } catch (err) {
      console.error("Undo failed:", err);
      showUndoMessage("Undo failed");
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === "z" && !event.shiftKey) {
      if (undoStack.length > 0) {
        event.preventDefault();
        void handleUndo();
      }
    }
  }

  let {
    version,
    isOpen = $bindable(false),
    onVersionUpdated,
  }: {
    version: AppVersion | null;
    isOpen?: boolean;
    onVersionUpdated?: () => void;
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

  // Click-outside handler: exit edit mode when clicking outside the edit UI
  function handlePanelClick(event: MouseEvent) {
    if (!currentlyEditingId) return;

    const target = event.target as HTMLElement;

    // Exit edit mode unless clicking within the edit container or its children
    // Check if the click is within an .edit-container
    const isWithinEditContainer = target.closest(".edit-container");

    if (!isWithinEditContainer) {
      endEditingItem();
    }
  }

  function isItemEditing(id: string): boolean {
    return currentlyEditingId === id;
  }

  // Admin check
  const isAdmin = $derived(authStore.isAdmin);

  // Handle saving an edited changelog entry
  async function handleSaveEntry(
    category: ChangelogCategory,
    entryIndex: number,
    newText: string
  ) {
    if (!version) return;

    // Find the absolute index in the full changelog array
    const allEntries = version.changelogEntries || [];
    const categoryEntries = allEntries.filter((e) => e.category === category);
    const entry = categoryEntries[entryIndex];

    if (!entry) {
      throw new Error("Entry not found at index");
    }

    const absoluteIndex = allEntries.indexOf(entry);

    if (absoluteIndex === -1) {
      throw new Error("Entry not found");
    }

    // Save old text for undo
    const oldText = entry.text;

    // Update via service
    const updatedEntry: ChangelogEntry = {
      category: entry.category,
      text: newText,
      ...(entry.feedbackId && { feedbackId: entry.feedbackId }),
    };

    await versionService.updateChangelogEntry(
      version.version,
      absoluteIndex,
      updatedEntry
    );

    // Update local state
    if (version.changelogEntries) {
      version.changelogEntries[absoluteIndex] = updatedEntry;
    }

    // Push to undo stack
    undoStack = [...undoStack, { type: "edit", oldText, absoluteIndex }];
  }

  // Handle saving edited release notes
  async function handleSaveReleaseNotes(newText: string) {
    if (!version) return;

    // Save old text for undo
    const oldText = version.releaseNotes || "";

    await versionService.updateReleaseNotes(version.version, newText);

    // Update local state
    version.releaseNotes = newText;

    // Push to undo stack
    undoStack = [...undoStack, { type: "editReleaseNotes", oldText }];
  }

  // Handle deleting a changelog entry
  async function handleDeleteEntry(
    category: ChangelogCategory,
    entryIndex: number
  ) {
    if (!version) return;

    const allEntries = version.changelogEntries || [];
    const categoryEntries = allEntries.filter((e) => e.category === category);
    const entry = categoryEntries[entryIndex];

    if (!entry) {
      throw new Error("Entry not found at index");
    }

    const absoluteIndex = allEntries.indexOf(entry);

    if (absoluteIndex === -1) {
      throw new Error("Entry not found");
    }

    // Save entry for undo before deleting
    const deletedEntry = { ...entry };

    await versionService.deleteChangelogEntry(version.version, absoluteIndex);

    // Update local state
    if (version.changelogEntries) {
      version.changelogEntries.splice(absoluteIndex, 1);
      // Force reactivity by reassigning
      version.changelogEntries = [...version.changelogEntries];
    }

    // Push to undo stack
    undoStack = [...undoStack, { type: "delete", entry: deletedEntry, absoluteIndex }];
    showUndoMessage("Entry deleted • Ctrl+Z to undo");
  }

  // Handle adding a new changelog entry
  let isAddingEntry = $state(false);
  let addingToCategory = $state<ChangelogCategory | null>(null);
  let newEntryText = $state("");

  function startAddEntry(category: ChangelogCategory) {
    addingToCategory = category;
    newEntryText = "";
    isAddingEntry = true;
  }

  function cancelAddEntry() {
    isAddingEntry = false;
    addingToCategory = null;
    newEntryText = "";
  }

  async function handleAddEntry() {
    if (!version || !addingToCategory || !newEntryText.trim()) return;

    const newEntry: ChangelogEntry = {
      category: addingToCategory,
      text: newEntryText.trim(),
    };

    await versionService.addChangelogEntry(version.version, newEntry);

    // Update local state
    if (!version.changelogEntries) {
      version.changelogEntries = [];
    }
    version.changelogEntries = [...version.changelogEntries, newEntry];

    cancelAddEntry();
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

    // Add keyboard listener for undo
    window.addEventListener("keydown", handleKeydown);

    return () => {
      mediaQuery.removeEventListener("change", handler);
      window.removeEventListener("keydown", handleKeydown);
      if (undoMessageTimeout) clearTimeout(undoMessageTimeout);
    };
  });

  const placement = $derived(isMobile ? "bottom" : "right");

  // Check if we have curated changelog entries
  const hasChangelog = $derived(
    version?.changelogEntries && version.changelogEntries.length > 0
  );

  // Group changelog entries by category
  const groupedChangelog = $derived.by(() => {
    if (!version?.changelogEntries)
      return { fixed: [], added: [], improved: [] };
    const fixed = version.changelogEntries.filter(
      (e) => e.category === "fixed"
    );
    const added = version.changelogEntries.filter(
      (e) => e.category === "added"
    );
    const improved = version.changelogEntries.filter(
      (e) => e.category === "improved"
    );
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
      case "fixed":
        return "fa-bug";
      case "added":
        return "fa-sparkles";
      case "improved":
        return "fa-arrow-up";
    }
  }

  // Get label for category
  function getCategoryLabel(category: ChangelogCategory): string {
    switch (category) {
      case "fixed":
        return "Bug Fixes";
      case "added":
        return "New Features";
      case "improved":
        return "Improvements";
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
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="panel-content"
      onclick={handlePanelClick}
      onkeydown={() => {}}
      role="presentation"
    >
      <!-- Header -->
      <header class="panel-header">
        <button
          type="button"
          class="close-button"
          onclick={() => (isOpen = false)}
          aria-label="Close version details"
        >
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
          {#if groupedChangelog.fixed.length > 0 || isAdmin}
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
                      onSave={(newText) =>
                        handleSaveEntry("fixed", index, newText)}
                      onDelete={isAdmin
                        ? () => handleDeleteEntry("fixed", index)
                        : undefined}
                      onOpenFeedback={() => openFeedbackDetail(entry)}
                      {itemId}
                      isEditing={isItemEditing(itemId)}
                      onStartEdit={startEditingItem}
                      onEndEdit={endEditingItem}
                    />
                  </li>
                {/each}

                {#if isAdmin && isAddingEntry && addingToCategory === "fixed"}
                  <li class="add-entry-form">
                    <textarea
                      bind:value={newEntryText}
                      placeholder="Enter new bug fix..."
                      rows="2"
                    ></textarea>
                    <div class="add-entry-actions">
                      <button
                        type="button"
                        class="glass-btn primary"
                        onclick={() => void handleAddEntry()}
                        disabled={!newEntryText.trim()}
                      >
                        <i class="fas fa-plus"></i>
                        Add
                      </button>
                      <button
                        type="button"
                        class="glass-btn"
                        onclick={cancelAddEntry}
                      >
                        Cancel
                      </button>
                    </div>
                  </li>
                {:else if isAdmin}
                  <li>
                    <button
                      type="button"
                      class="add-entry-btn"
                      onclick={() => startAddEntry("fixed")}
                    >
                      <i class="fas fa-plus"></i>
                      Add bug fix
                    </button>
                  </li>
                {/if}
              </ul>
            </div>
          {/if}

          <!-- New Features -->
          {#if groupedChangelog.added.length > 0 || isAdmin}
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
                      onSave={(newText) =>
                        handleSaveEntry("added", index, newText)}
                      onDelete={isAdmin
                        ? () => handleDeleteEntry("added", index)
                        : undefined}
                      onOpenFeedback={() => openFeedbackDetail(entry)}
                      {itemId}
                      isEditing={isItemEditing(itemId)}
                      onStartEdit={startEditingItem}
                      onEndEdit={endEditingItem}
                    />
                  </li>
                {/each}

                {#if isAdmin && isAddingEntry && addingToCategory === "added"}
                  <li class="add-entry-form">
                    <textarea
                      bind:value={newEntryText}
                      placeholder="Enter new feature..."
                      rows="2"
                    ></textarea>
                    <div class="add-entry-actions">
                      <button
                        type="button"
                        class="glass-btn primary"
                        onclick={() => void handleAddEntry()}
                        disabled={!newEntryText.trim()}
                      >
                        <i class="fas fa-plus"></i>
                        Add
                      </button>
                      <button
                        type="button"
                        class="glass-btn"
                        onclick={cancelAddEntry}
                      >
                        Cancel
                      </button>
                    </div>
                  </li>
                {:else if isAdmin}
                  <li>
                    <button
                      type="button"
                      class="add-entry-btn"
                      onclick={() => startAddEntry("added")}
                    >
                      <i class="fas fa-plus"></i>
                      Add feature
                    </button>
                  </li>
                {/if}
              </ul>
            </div>
          {/if}

          <!-- Improvements -->
          {#if groupedChangelog.improved.length > 0 || isAdmin}
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
                      onSave={(newText) =>
                        handleSaveEntry("improved", index, newText)}
                      onDelete={isAdmin
                        ? () => handleDeleteEntry("improved", index)
                        : undefined}
                      onOpenFeedback={() => openFeedbackDetail(entry)}
                      {itemId}
                      isEditing={isItemEditing(itemId)}
                      onStartEdit={startEditingItem}
                      onEndEdit={endEditingItem}
                    />
                  </li>
                {/each}

                {#if isAdmin && isAddingEntry && addingToCategory === "improved"}
                  <li class="add-entry-form">
                    <textarea
                      bind:value={newEntryText}
                      placeholder="Enter improvement..."
                      rows="2"
                    ></textarea>
                    <div class="add-entry-actions">
                      <button
                        type="button"
                        class="glass-btn primary"
                        onclick={() => void handleAddEntry()}
                        disabled={!newEntryText.trim()}
                      >
                        <i class="fas fa-plus"></i>
                        Add
                      </button>
                      <button
                        type="button"
                        class="glass-btn"
                        onclick={cancelAddEntry}
                      >
                        Cancel
                      </button>
                    </div>
                  </li>
                {:else if isAdmin}
                  <li>
                    <button
                      type="button"
                      class="add-entry-btn"
                      onclick={() => startAddEntry("improved")}
                    >
                      <i class="fas fa-plus"></i>
                      Add improvement
                    </button>
                  </li>
                {/if}
              </ul>
            </div>
          {/if}
        </section>
      {:else if isAdmin}
        <!-- Admin can add entries even when no changelog exists -->
        <section class="changelog-section">
          <h3>What Changed</h3>
          <p class="no-entries-hint">No entries yet. Add some below:</p>

          <!-- Bug Fixes -->
          <div class="change-group">
            <h4 class="group-title fixed">
              <i class="fas {getCategoryIcon('fixed')}"></i>
              {getCategoryLabel("fixed")}
              <span class="count">0</span>
            </h4>
            <ul class="change-list">
              {#if isAddingEntry && addingToCategory === "fixed"}
                <li class="add-entry-form">
                  <textarea
                    bind:value={newEntryText}
                    placeholder="Enter new bug fix..."
                    rows="2"
                  ></textarea>
                  <div class="add-entry-actions">
                    <button
                      type="button"
                      class="glass-btn primary"
                      onclick={() => void handleAddEntry()}
                      disabled={!newEntryText.trim()}
                    >
                      <i class="fas fa-plus"></i>
                      Add
                    </button>
                    <button
                      type="button"
                      class="glass-btn"
                      onclick={cancelAddEntry}
                    >
                      Cancel
                    </button>
                  </div>
                </li>
              {:else}
                <li>
                  <button
                    type="button"
                    class="add-entry-btn"
                    onclick={() => startAddEntry("fixed")}
                  >
                    <i class="fas fa-plus"></i>
                    Add bug fix
                  </button>
                </li>
              {/if}
            </ul>
          </div>

          <!-- New Features -->
          <div class="change-group">
            <h4 class="group-title added">
              <i class="fas {getCategoryIcon('added')}"></i>
              {getCategoryLabel("added")}
              <span class="count">0</span>
            </h4>
            <ul class="change-list">
              {#if isAddingEntry && addingToCategory === "added"}
                <li class="add-entry-form">
                  <textarea
                    bind:value={newEntryText}
                    placeholder="Enter new feature..."
                    rows="2"
                  ></textarea>
                  <div class="add-entry-actions">
                    <button
                      type="button"
                      class="glass-btn primary"
                      onclick={() => void handleAddEntry()}
                      disabled={!newEntryText.trim()}
                    >
                      <i class="fas fa-plus"></i>
                      Add
                    </button>
                    <button
                      type="button"
                      class="glass-btn"
                      onclick={cancelAddEntry}
                    >
                      Cancel
                    </button>
                  </div>
                </li>
              {:else}
                <li>
                  <button
                    type="button"
                    class="add-entry-btn"
                    onclick={() => startAddEntry("added")}
                  >
                    <i class="fas fa-plus"></i>
                    Add feature
                  </button>
                </li>
              {/if}
            </ul>
          </div>

          <!-- Improvements -->
          <div class="change-group">
            <h4 class="group-title improved">
              <i class="fas {getCategoryIcon('improved')}"></i>
              {getCategoryLabel("improved")}
              <span class="count">0</span>
            </h4>
            <ul class="change-list">
              {#if isAddingEntry && addingToCategory === "improved"}
                <li class="add-entry-form">
                  <textarea
                    bind:value={newEntryText}
                    placeholder="Enter improvement..."
                    rows="2"
                  ></textarea>
                  <div class="add-entry-actions">
                    <button
                      type="button"
                      class="glass-btn primary"
                      onclick={() => void handleAddEntry()}
                      disabled={!newEntryText.trim()}
                    >
                      <i class="fas fa-plus"></i>
                      Add
                    </button>
                    <button
                      type="button"
                      class="glass-btn"
                      onclick={cancelAddEntry}
                    >
                      Cancel
                    </button>
                  </div>
                </li>
              {:else}
                <li>
                  <button
                    type="button"
                    class="add-entry-btn"
                    onclick={() => startAddEntry("improved")}
                  >
                    <i class="fas fa-plus"></i>
                    Add improvement
                  </button>
                </li>
              {/if}
            </ul>
          </div>
        </section>
      {:else}
        <!-- No changelog state for non-admins -->
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

<!-- Undo toast -->
{#if undoMessage}
  <div class="undo-toast">
    <span>{undoMessage}</span>
    {#if undoStack.length > 0}
      <button type="button" class="undo-btn" onclick={() => void handleUndo()}>
        Undo
      </button>
    {/if}
  </div>
{/if}

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
    width: 52px;
    height: 52px;
    min-width: 52px;
    min-height: 52px;
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
    background: linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.2),
      rgba(139, 92, 246, 0.1)
    );
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

  /* Add entry button */
  .add-entry-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 12px;
    background: transparent;
    border: 1px dashed rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .add-entry-btn:hover {
    background: rgba(139, 92, 246, 0.1);
    border-color: rgba(139, 92, 246, 0.3);
    color: rgba(139, 92, 246, 0.8);
  }

  .add-entry-btn i {
    font-size: 12px;
  }

  /* Add entry form */
  .add-entry-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 8px;
  }

  .add-entry-form textarea {
    width: 100%;
    padding: 8px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    line-height: 1.5;
    font-family: inherit;
    resize: vertical;
    min-height: 60px;
  }

  .add-entry-form textarea:focus {
    outline: none;
    border-color: rgba(139, 92, 246, 0.5);
  }

  .add-entry-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  /* Glass morphism buttons - unified style */
  .glass-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 34px;
    padding: 0 14px;
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .glass-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.95);
    transform: translateY(-1px);
  }

  .glass-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .glass-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .glass-btn i {
    font-size: 12px;
  }

  /* Primary variant (purple) */
  .glass-btn.primary {
    background: rgba(139, 92, 246, 0.15);
    border-color: rgba(139, 92, 246, 0.3);
    color: #c4b5fd;
  }

  .glass-btn.primary:hover:not(:disabled) {
    background: rgba(139, 92, 246, 0.25);
    border-color: rgba(139, 92, 246, 0.45);
    color: #ddd6fe;
  }

  .no-entries-hint {
    margin: 0 0 16px 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    font-style: italic;
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
    font-size: 50px;
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

  /* Undo toast */
  .undo-toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(30, 30, 35, 0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    z-index: 1000;
    animation: slideUp 0.2s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  .undo-btn {
    padding: 6px 12px;
    background: rgba(139, 92, 246, 0.2);
    border: 1px solid rgba(139, 92, 246, 0.4);
    border-radius: 6px;
    color: #c4b5fd;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }

  .undo-btn:hover {
    background: rgba(139, 92, 246, 0.3);
    color: #ddd6fe;
  }
</style>
