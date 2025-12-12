<!-- VersionDetailPanel - Drawer showing full release details -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { AppVersion, ChangelogCategory, ChangelogEntry } from "$lib/features/feedback/domain/models/version-models";
  import { CHANGELOG_CATEGORIES } from "$lib/features/feedback/domain/constants/changelog-constants";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import FeedbackViewPanel from "./FeedbackViewPanel.svelte";
  import EditableReleaseNotes from "./EditableReleaseNotes.svelte";
  import ChangeGroupSection from "./ChangeGroupSection.svelte";
  import VersionHeader from "./VersionHeader.svelte";
  import NoChangelogState from "./NoChangelogState.svelte";
  import ActionToast from "./ActionToast.svelte";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte";
  import { changelogEditState } from "./state/changelog-edit-state.svelte";
  import { versionService } from "$lib/features/feedback/services/implementations/VersionService";

  let { version, isOpen = $bindable(false) }: { version: AppVersion | null; isOpen?: boolean } = $props();

  // UI state
  let currentlyEditingId = $state<string | null>(null);
  let selectedFeedbackId = $state<string | null>(null);
  let feedbackPanelOpen = $state(false);
  let addingToCategory = $state<ChangelogCategory | null>(null);
  let newEntryText = $state("");
  let isMobile = $state(false);

  // Toast
  type ToastType = "action" | "undone" | "redone";
  let toastMessage = $state<string | null>(null);
  let toastType = $state<ToastType>("action");
  let toastTimeout: ReturnType<typeof setTimeout> | null = null;

  // Derived
  const isAdmin = $derived(authStore.isAdmin);
  const placement = $derived(isMobile ? "bottom" : "right");
  const hasChangelog = $derived(version?.changelogEntries && version.changelogEntries.length > 0);

  const groupedChangelog = $derived.by(() => {
    const entries = version?.changelogEntries;
    if (!entries) return { fixed: [], added: [], improved: [] };
    return {
      fixed: entries.filter((e) => e.category === "fixed"),
      added: entries.filter((e) => e.category === "added"),
      improved: entries.filter((e) => e.category === "improved"),
    };
  });

  function showToast(msg: string, type: ToastType) {
    toastMessage = msg;
    toastType = type;
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => (toastMessage = null), 3000);
  }

  // Edit state
  function startEdit(id: string) { currentlyEditingId = id; }
  function endEdit() { currentlyEditingId = null; }

  function openFeedback(entry: ChangelogEntry) {
    if (entry.feedbackId) {
      selectedFeedbackId = entry.feedbackId;
      feedbackPanelOpen = true;
    }
  }

  function handlePanelClick(e: MouseEvent) {
    if (currentlyEditingId && !(e.target as HTMLElement).closest(".edit-container")) endEdit();
  }

  // Add entry
  function startAdd(cat: ChangelogCategory) { addingToCategory = cat; newEntryText = ""; }
  function cancelAdd() { addingToCategory = null; newEntryText = ""; }

  async function confirmAdd() {
    if (!version || !addingToCategory || !newEntryText.trim()) return;
    const entry: ChangelogEntry = { category: addingToCategory, text: newEntryText.trim() };
    await versionService.addChangelogEntry(version.version, entry);
    version.changelogEntries = [...(version.changelogEntries || []), entry];
    cancelAdd();
  }

  // Save/delete
  async function handleSave(cat: ChangelogCategory, idx: number, text: string) {
    if (!version) return;
    const entries = version.changelogEntries || [];
    const catEntries = entries.filter((e) => e.category === cat);
    const entry = catEntries[idx];
    if (!entry) return;

    const absIdx = entries.indexOf(entry);
    const oldText = entry.text;
    const updated: ChangelogEntry = { category: cat, text, ...(entry.feedbackId && { feedbackId: entry.feedbackId }) };

    await versionService.updateChangelogEntry(version.version, absIdx, updated);
    version.changelogEntries![absIdx] = updated;
    changelogEditState.pushUndo({ type: "edit", oldText, absoluteIndex: absIdx });
  }

  async function handleDelete(cat: ChangelogCategory, idx: number) {
    if (!version) return;
    const entries = version.changelogEntries || [];
    const catEntries = entries.filter((e) => e.category === cat);
    const entry = catEntries[idx];
    if (!entry) return;

    const absIdx = entries.indexOf(entry);
    const deleted = { ...entry };

    await versionService.deleteChangelogEntry(version.version, absIdx);
    version.changelogEntries!.splice(absIdx, 1);
    version.changelogEntries = [...version.changelogEntries!];

    changelogEditState.pushUndo({ type: "delete", entry: deleted, absoluteIndex: absIdx });
    showToast("Entry deleted", "action");
  }

  async function handleSaveReleaseNotes(text: string) {
    if (!version) return;
    const oldText = version.releaseNotes || "";
    await versionService.updateReleaseNotes(version.version, text);
    version.releaseNotes = text;
    changelogEditState.pushUndo({ type: "editReleaseNotes", oldText });
  }

  // Undo/redo
  async function handleUndo() {
    if (!version) return;
    try {
      const msg = await changelogEditState.undo(version);
      if (msg) showToast(msg, "undone");
    } catch { showToast("Undo failed", "action"); }
  }

  async function handleRedo() {
    if (!version) return;
    try {
      const msg = await changelogEditState.redo(version);
      if (msg) showToast(msg, "redone");
    } catch { showToast("Redo failed", "action"); }
  }

  function handleKeydown(e: KeyboardEvent) {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key === "z" && !e.shiftKey && changelogEditState.canUndo) { e.preventDefault(); void handleUndo(); }
    if (mod && ((e.key === "z" && e.shiftKey) || e.key === "y") && changelogEditState.canRedo) { e.preventDefault(); void handleRedo(); }
  }

  onMount(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    isMobile = mq.matches;
    const handler = (e: MediaQueryListEvent) => (isMobile = e.matches);
    mq.addEventListener("change", handler);
    window.addEventListener("keydown", handleKeydown);
    return () => {
      mq.removeEventListener("change", handler);
      window.removeEventListener("keydown", handleKeydown);
      if (toastTimeout) clearTimeout(toastTimeout);
    };
  });
</script>

<Drawer bind:isOpen {placement} showHandle={isMobile} ariaLabel={version ? `Version ${version.version} details` : "Version details"}>
  {#if version}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="panel-content" onclick={handlePanelClick} onkeydown={() => {}} role="presentation">
      <VersionHeader version={version.version} releasedAt={version.releasedAt} onClose={() => (isOpen = false)} />

      {#if version.releaseNotes}
        <section>
          <h3>Release Notes</h3>
          <EditableReleaseNotes
            text={version.releaseNotes}
            canEdit={isAdmin}
            onSave={handleSaveReleaseNotes}
            itemId="release-notes"
            isEditing={currentlyEditingId === "release-notes"}
            onStartEdit={startEdit}
            onEndEdit={endEdit}
          />
        </section>
      {/if}

      {#if hasChangelog || isAdmin}
        <section>
          <h3>What Changed</h3>
          {#if !hasChangelog && isAdmin}<p class="hint">No entries yet. Add some below:</p>{/if}
          {#each CHANGELOG_CATEGORIES as cat}
            {#if groupedChangelog[cat].length > 0 || isAdmin}
              <ChangeGroupSection
                category={cat}
                entries={groupedChangelog[cat]}
                {isAdmin}
                isAddingEntry={addingToCategory === cat}
                bind:newEntryText
                {currentlyEditingId}
                onSaveEntry={(i, t) => handleSave(cat, i, t)}
                onDeleteEntry={(i) => handleDelete(cat, i)}
                onOpenFeedback={openFeedback}
                onStartAdd={() => startAdd(cat)}
                onCancelAdd={cancelAdd}
                onConfirmAdd={confirmAdd}
                onStartEdit={startEdit}
                onEndEdit={endEdit}
              />
            {/if}
          {/each}
        </section>
      {:else}
        <NoChangelogState />
      {/if}
    </div>
  {/if}
</Drawer>

<FeedbackViewPanel feedbackId={selectedFeedbackId} bind:isOpen={feedbackPanelOpen} />

{#if toastMessage}
  <ActionToast
    message={toastMessage}
    showUndo={toastType === "action" && changelogEditState.canUndo}
    showRedo={toastType === "undone" && changelogEditState.canRedo}
    onUndo={() => void handleUndo()}
    onRedo={() => void handleRedo()}
  />
{/if}

<style>
  .panel-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 24px;
    overflow-y: auto;
  }

  section { margin-bottom: 24px; }

  section h3 {
    margin: 0 0 12px 0;
    font-size: 12px;
    font-weight: 600;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .hint {
    margin: 0 0 16px 0;
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-style: italic;
  }

  @media (max-width: 768px) {
    .panel-content { padding: 16px; max-height: 85vh; }
  }
</style>
