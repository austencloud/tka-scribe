<!-- FeedbackArchiveView - Archived feedback organized by version -->
<script lang="ts">
  import type { VersionState } from "../../state/version-state.svelte";
  import type { FeedbackItem } from "../../domain/models/feedback-models";
  import { TYPE_CONFIG } from "../../domain/models/feedback-models";
  import { feedbackService } from "../../services/implementations/FeedbackService";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import FeedbackDetailPanel from "./FeedbackDetailPanel.svelte";
  import { firestore } from "$lib/shared/auth/firebase";
  import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
  } from "firebase/firestore";

  const { versionState, onBack } = $props<{
    versionState: VersionState;
    onBack: () => void;
  }>();

  // View mode: "releases" or "all"
  let viewMode = $state<"releases" | "all">("releases");

  // All archived items (for "all" view)
  let allArchivedItems = $state<FeedbackItem[]>([]);
  let isLoadingAll = $state(false);
  let sortBy = $state<"date" | "type" | "title">("date");
  let sortOrder = $state<"asc" | "desc">("desc");

  // Load versions on mount
  $effect(() => {
    versionState.loadVersions();
  });

  // Load all archived items when switching to "all" view
  $effect(() => {
    if (viewMode === "all" && allArchivedItems.length === 0) {
      loadAllArchivedItems();
    }
  });

  // Selected version for expanded view
  let expandedVersion = $state<string | null>(null);

  // Selected feedback item for detail panel
  let selectedItem = $state<FeedbackItem | null>(null);
  let isDetailOpen = $state(false);
  let isLoadingItem = $state(false);

  // Detect mobile for drawer placement
  let isMobile = $state(false);
  $effect(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth < 768;
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  });

  async function loadAllArchivedItems() {
    isLoadingAll = true;
    try {
      // Query Firestore directly for all archived items
      const q = query(
        collection(firestore, "feedback"),
        where("status", "==", "archived"),
        orderBy("archivedAt", "desc")
      );

      const snapshot = await getDocs(q);

      allArchivedItems = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          archivedAt: data.archivedAt?.toDate?.() || undefined,
          deferredUntil: data.deferredUntil?.toDate?.() || undefined,
        } as FeedbackItem;
      });

      console.log(`Loaded ${allArchivedItems.length} archived items`);
    } catch (e) { 
      console.error("Failed to load archived items:", e);
      allArchivedItems = [];
    } finally {
      isLoadingAll = false;
    }
  }

  function toggleVersion(version: string) {
    if (expandedVersion === version) {
      expandedVersion = null;
    } else {
      expandedVersion = version;
      versionState.loadVersionFeedback(version);
    }
  }

  async function openFeedbackDetail(feedbackId: string) {
    isLoadingItem = true;
    isDetailOpen = true;

    try {
      const item = await feedbackService.getFeedback(feedbackId);
      selectedItem = item;
    } catch (e) {
      console.error("Failed to load feedback item:", e);
      selectedItem = null;
    } finally {
      isLoadingItem = false;
    }
  }

  function closeDetail() {
    isDetailOpen = false;
    selectedItem = null;
  }

  // Sorted archived items
  const sortedArchivedItems = $derived.by(() => {
    const items = [...allArchivedItems];

    items.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "date") {
        const aTime = a.archivedAt?.getTime() || a.createdAt?.getTime() || 0;
        const bTime = b.archivedAt?.getTime() || b.createdAt?.getTime() || 0;
        comparison = bTime - aTime;
      } else if (sortBy === "type") {
        comparison = a.type.localeCompare(b.type);
      } else if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return items;
  });
</script>

<div class="archive-view">
  <header class="archive-header">
    <div class="header-top">
      <button type="button" class="back-btn" onclick={onBack}>
        <i class="fas fa-arrow-left"></i>
        <span>Back to Kanban</span>
      </button>

      <div class="view-toggle">
        <button
          type="button"
          class="toggle-btn"
          class:active={viewMode === "releases"}
          onclick={() => (viewMode = "releases")}
        >
          <i class="fas fa-tags"></i>
          By Release
        </button>
        <button
          type="button"
          class="toggle-btn"
          class:active={viewMode === "all"}
          onclick={() => (viewMode = "all")}
        >
          <i class="fas fa-list"></i>
          All Items
        </button>
      </div>
    </div>

    <div class="header-content">
      <h2>
        <i class="fas fa-archive"></i>
        {viewMode === "releases" ? "Release Archive" : "All Archived Feedback"}
      </h2>
      <p class="subtitle">
        {viewMode === "releases"
          ? "Feedback resolved in past releases"
          : `${allArchivedItems.length} archived items`}
      </p>
    </div>

    {#if viewMode === "all"}
      <div class="sort-controls">
        <label>
          <span>Sort by:</span>
          <select bind:value={sortBy}>
            <option value="date">Date Archived</option>
            <option value="type">Type</option>
            <option value="title">Title</option>
          </select>
        </label>
        <button
          type="button"
          class="sort-order-btn"
          onclick={() => (sortOrder = sortOrder === "asc" ? "desc" : "asc")}
          aria-label={sortOrder === "asc"
            ? "Sort ascending"
            : "Sort descending"}
        >
          <i class="fas fa-sort-amount-{sortOrder === 'asc' ? 'up' : 'down'}"
          ></i>
        </button>
      </div>
    {/if}
  </header>

  <div class="archive-content">
    {#if viewMode === "all"}
      {#if isLoadingAll}
        <div class="loading-state">
          <div class="skeleton-version"></div>
          <div class="skeleton-version"></div>
          <div class="skeleton-version"></div>
        </div>
      {:else if sortedArchivedItems.length === 0}
        <div class="empty-state">
          <i class="fas fa-box-open"></i>
          <h3>No Archived Items</h3>
          <p>Archived feedback will appear here.</p>
        </div>
      {:else}
        <div class="all-items-list">
          {#each sortedArchivedItems as item (item.id)}
            {@const typeConfig =
              TYPE_CONFIG[item.type as keyof typeof TYPE_CONFIG]}
            <button
              type="button"
              class="feedback-item-card"
              onclick={() => openFeedbackDetail(item.id)}
            >
              <div class="item-header">
                <div class="item-icon" style="--type-color: {typeConfig.color}">
                  <i class="fas {typeConfig.icon}"></i>
                </div>
                <div class="item-meta">
                  <span class="item-type" style="color: {typeConfig.color}">
                    {typeConfig.label}
                  </span>
                  {#if item.priority}
                    <span class="item-priority priority-{item.priority}">
                      {item.priority}
                    </span>
                  {/if}
                </div>
              </div>
              <div class="item-content">
                <h3 class="item-title">{item.title}</h3>
                <p class="item-description">{item.description}</p>
              </div>
              <div class="item-footer">
                <span class="item-date">
                  <i class="fas fa-archive"></i>
                  {#if item.archivedAt}
                    {item.archivedAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  {:else}
                    Unknown date
                  {/if}
                </span>
                {#if item.fixedInVersion}
                  <span class="item-version">
                    <i class="fas fa-tag"></i>
                    v{item.fixedInVersion}
                  </span>
                {/if}
              </div>
              <i class="fas fa-chevron-right item-arrow"></i>
            </button>
          {/each}
        </div>
      {/if}
    {:else if versionState.isLoading && versionState.versions.length === 0}
      <div class="loading-state">
        <div class="skeleton-version"></div>
        <div class="skeleton-version"></div>
        <div class="skeleton-version"></div>
      </div>
    {:else if versionState.versions.length === 0}
      <div class="empty-state">
        <i class="fas fa-box-open"></i>
        <h3>No Releases Yet</h3>
        <p>Completed feedback will appear here after preparing a release.</p>
      </div>
    {:else}
      <div class="versions-list">
        {#each versionState.versions as version (version.version)}
          {@const isExpanded = expandedVersion === version.version}
          <div class="version-group" class:expanded={isExpanded}>
            <button
              type="button"
              class="version-header"
              onclick={() => toggleVersion(version.version)}
            >
              <div class="version-info">
                <span class="version-number">v{version.version}</span>
                <span class="version-date">
                  {version.releasedAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div class="version-summary">
                {#if version.feedbackSummary.bugs > 0}
                  <span class="summary-badge bug">
                    <i class="fas fa-bug"></i>
                    {version.feedbackSummary.bugs}
                  </span>
                {/if}
                {#if version.feedbackSummary.features > 0}
                  <span class="summary-badge feature">
                    <i class="fas fa-lightbulb"></i>
                    {version.feedbackSummary.features}
                  </span>
                {/if}
                {#if version.feedbackSummary.general > 0}
                  <span class="summary-badge general">
                    <i class="fas fa-comment"></i>
                    {version.feedbackSummary.general}
                  </span>
                {/if}
              </div>
              <i class="fas fa-chevron-{isExpanded ? 'up' : 'down'} expand-icon"
              ></i>
            </button>

            {#if isExpanded}
              <div class="version-items">
                {#if versionState.isLoading}
                  <div class="items-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    Loading...
                  </div>
                {:else if versionState.selectedVersionFeedback.length === 0}
                  <div class="items-empty">
                    No feedback items in this release.
                  </div>
                {:else}
                  {#each versionState.selectedVersionFeedback as item (item.id)}
                    {@const typeConfig =
                      TYPE_CONFIG[item.type as keyof typeof TYPE_CONFIG]}
                    <button
                      type="button"
                      class="feedback-item"
                      onclick={() => openFeedbackDetail(item.id)}
                    >
                      <div
                        class="item-icon"
                        style="--type-color: {typeConfig.color}"
                      >
                        <i class="fas {typeConfig.icon}"></i>
                      </div>
                      <div class="item-content">
                        <span class="item-title">{item.title}</span>
                        <span class="item-description">{item.description}</span>
                      </div>
                      <i class="fas fa-chevron-right item-arrow"></i>
                    </button>
                  {/each}
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Feedback Detail Drawer -->
<Drawer
  bind:isOpen={isDetailOpen}
  placement={isMobile ? "bottom" : "right"}
  onclose={closeDetail}
>
  {#if isLoadingItem}
    <div class="detail-loading">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Loading feedback...</span>
    </div>
  {:else if selectedItem}
    <FeedbackDetailPanel
      item={selectedItem}
      manageState={null}
      onClose={closeDetail}
      readOnly={true}
    />
  {:else}
    <div class="detail-error">
      <i class="fas fa-exclamation-triangle"></i>
      <span>Failed to load feedback item</span>
      <button type="button" onclick={closeDetail}>Close</button>
    </div>
  {/if}
</Drawer>

<style>
  .archive-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: rgba(0, 0, 0, 0.2);
  }

  .archive-header {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(0, 0, 0, 0.3);
  }

  .header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .header-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .view-toggle {
    display: flex;
    gap: 4px;
    background: rgba(0, 0, 0, 0.3);
    padding: 4px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .toggle-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .toggle-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.8);
  }

  .toggle-btn.active {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.95);
  }

  .toggle-btn i {
    font-size: 12px;
  }

  .sort-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .sort-controls label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
  }

  .sort-controls select {
    padding: 4px 8px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 13px;
    cursor: pointer;
  }

  .sort-controls select:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }

  .sort-order-btn {
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s;
  }

  .sort-order-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    width: fit-content;
  }

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.9);
  }

  .archive-header h2 {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 8px 0 0 0;
    font-size: 20px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .archive-header h2 i {
    color: #6b7280;
  }

  .subtitle {
    margin: 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
  }

  .archive-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .versions-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 800px;
    margin: 0 auto;
  }

  .version-group {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s;
  }

  .version-group.expanded {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);
  }

  .version-header {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    padding: 16px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    transition: background 0.2s;
  }

  .version-header:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .version-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    text-align: left;
  }

  .version-number {
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .version-date {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .version-summary {
    display: flex;
    gap: 8px;
    flex: 1;
    justify-content: flex-end;
  }

  .summary-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
  }

  .summary-badge.bug {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
  }

  .summary-badge.feature {
    background: rgba(139, 92, 246, 0.15);
    color: #a78bfa;
  }

  .summary-badge.general {
    background: rgba(59, 130, 246, 0.15);
    color: #60a5fa;
  }

  .expand-icon {
    color: rgba(255, 255, 255, 0.4);
    font-size: 12px;
    transition: transform 0.2s;
  }

  .version-items {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .items-loading,
  .items-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 13px;
  }

  .feedback-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 10px 12px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .feedback-item:hover {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .feedback-item:active {
    transform: scale(0.99);
  }

  .item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: color-mix(in srgb, var(--type-color) 15%, transparent);
    border-radius: 6px;
    color: var(--type-color);
    font-size: 12px;
    flex-shrink: 0;
  }

  .item-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }

  .item-title {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-description {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-arrow {
    color: rgba(255, 255, 255, 0.3);
    font-size: 12px;
    flex-shrink: 0;
    transition: transform 0.2s;
  }

  .feedback-item:hover .item-arrow {
    color: rgba(255, 255, 255, 0.5);
    transform: translateX(2px);
  }

  /* All items list */
  .all-items-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 900px;
    margin: 0 auto;
  }

  .feedback-item-card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
  }

  .feedback-item-card:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }

  .feedback-item-card .item-arrow {
    position: absolute;
    top: 16px;
    right: 16px;
  }

  .item-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .item-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .item-type {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .item-priority {
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
  }

  .item-priority.priority-high {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
  }

  .item-priority.priority-medium {
    background: rgba(251, 191, 36, 0.2);
    color: #fbbf24;
  }

  .item-priority.priority-low {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
  }

  .feedback-item-card .item-content {
    gap: 6px;
    padding-right: 24px;
  }

  .feedback-item-card .item-title {
    font-size: 15px;
    font-weight: 600;
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
    line-height: 1.4;
  }

  .feedback-item-card .item-description {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .item-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .item-date,
  .item-version {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .item-version {
    padding: 2px 8px;
    background: rgba(107, 114, 128, 0.2);
    border-radius: 4px;
    color: #9ca3af;
  }

  /* Loading state */
  .loading-state {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 800px;
    margin: 0 auto;
  }

  .skeleton-version {
    height: 72px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* Empty state */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 24px;
    text-align: center;
  }

  .empty-state i {
    font-size: 52px;
    color: rgba(107, 114, 128, 0.4);
    margin-bottom: 16px;
  }

  .empty-state h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
  }

  .empty-state p {
    margin: 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton-version {
      animation: none;
    }
  }

  /* Drawer loading/error states */
  .detail-loading,
  .detail-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    height: 100%;
    padding: 52px 24px;
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
  }

  .detail-loading i,
  .detail-error i {
    font-size: 32px;
    opacity: 0.6;
  }

  .detail-error i {
    color: #f59e0b;
  }

  .detail-error button {
    margin-top: 8px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .detail-error button:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .header-top {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .view-toggle {
      width: 100%;
    }

    .toggle-btn {
      flex: 1;
      justify-content: center;
    }

    .sort-controls {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
    }

    .sort-controls label {
      width: 100%;
    }

    .sort-controls select {
      flex: 1;
    }

    .all-items-list {
      gap: 8px;
    }

    .feedback-item-card {
      padding: 12px;
    }
  }
</style>
