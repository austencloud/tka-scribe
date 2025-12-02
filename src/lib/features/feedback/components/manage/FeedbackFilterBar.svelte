<!-- FeedbackFilterBar - Premium responsive filters with spring animations -->
<script lang="ts">
  import type { FeedbackManageState } from "../../state/feedback-manage-state.svelte";
  import {
    TYPE_CONFIG,
    STATUS_CONFIG,
    PRIORITY_CONFIG,
  } from "../../domain/models/feedback-models";
  import type {
    FeedbackType,
    FeedbackStatus,
    FeedbackPriority,
  } from "../../domain/models/feedback-models";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";

  // Using 'manageState' to avoid conflict with $state rune
  const { manageState } = $props<{
    manageState: FeedbackManageState;
  }>();

  // Local reactive state
  let isSheetOpen = $state(false);
  let isSheetAnimating = $state(false);
  let activeSection = $state<'type' | 'status' | 'priority' | null>(null);

  // Desktop drawer state (replacing dropdowns with side panels)
  let openDrawer = $state<'status' | 'priority' | null>(null);

  function openStatusDrawer() {
    openDrawer = 'status';
  }

  function openPriorityDrawer() {
    openDrawer = 'priority';
  }

  function closeDrawer() {
    openDrawer = null;
  }

  // Get current status label for button display
  const currentStatusLabel = $derived(
    manageState.filters.status === 'all'
      ? 'All Status'
      : STATUS_CONFIG[manageState.filters.status]?.label ?? 'All Status'
  );

  // Get current priority label for button display
  const currentPriorityLabel = $derived(
    manageState.filters.priority === 'all'
      ? 'All Priority'
      : PRIORITY_CONFIG[manageState.filters.priority]?.label ?? 'All Priority'
  );

  // Count active filters
  const activeFilterCount = $derived(
    [
      manageState.filters.type !== "all",
      manageState.filters.status !== "all",
      manageState.filters.priority !== "all",
    ].filter(Boolean).length
  );

  function openSheet() {
    isSheetOpen = true;
    isSheetAnimating = true;
    document.body.style.overflow = "hidden";
    setTimeout(() => { isSheetAnimating = false; }, 350);
  }

  function closeSheet() {
    isSheetAnimating = true;
    setTimeout(() => {
      isSheetOpen = false;
      isSheetAnimating = false;
      document.body.style.overflow = "";
    }, 280);
  }

  function clearFilters() {
    manageState.setFilter("type", "all");
    manageState.setFilter("status", "all");
    manageState.setFilter("priority", "all");
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      closeSheet();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      closeSheet();
    }
  }

  // Section toggle for mobile sheet accordion
  function toggleSection(section: 'type' | 'status' | 'priority') {
    activeSection = activeSection === section ? null : section;
  }
</script>

<svelte:window onkeydown={isSheetOpen ? handleKeydown : undefined} />

<div class="filter-bar">
  <!-- Search input (always visible) -->
  <div class="search-wrapper">
    <i class="fas fa-search search-icon"></i>
    <input
      type="text"
      class="search-input"
      placeholder="Search feedback..."
      value={manageState.searchQuery}
      oninput={(e) => manageState.setSearchQuery(e.currentTarget.value)}
    />
    {#if manageState.searchQuery}
      <button
        type="button"
        class="search-clear"
        onclick={() => manageState.setSearchQuery("")}
        aria-label="Clear search"
      >
        <i class="fas fa-times"></i>
      </button>
    {/if}
  </div>

  <!-- Mobile: Filters button -->
  <button
    type="button"
    class="filters-button mobile-only"
    onclick={openSheet}
    aria-expanded={isSheetOpen}
  >
    <i class="fas fa-sliders-h"></i>
    <span>Filters</span>
    {#if activeFilterCount > 0}
      <span class="filter-count">{activeFilterCount}</span>
    {/if}
  </button>

  <!-- Desktop: Inline filter chips -->
  <div class="desktop-filters">
    <!-- Type chips -->
    <div class="chip-group">
      <button
        type="button"
        class="filter-chip"
        class:active={manageState.filters.type === "all"}
        onclick={() => manageState.setFilter("type", "all")}
      >
        All Types
      </button>
      {#each Object.entries(TYPE_CONFIG) as [type, config]}
        <button
          type="button"
          class="filter-chip"
          class:active={manageState.filters.type === type}
          style="--chip-color: {config.color}"
          onclick={() => manageState.setFilter("type", type as FeedbackType)}
        >
          <i class="fas {config.icon}"></i>
          <span class="chip-label">{config.label.replace(" Report", "").replace(" Request", "").replace(" Feedback", "")}</span>
        </button>
      {/each}
    </div>

    <!-- Status panel trigger -->
    <button
      type="button"
      class="filter-panel-btn"
      class:active={manageState.filters.status !== 'all'}
      onclick={openStatusDrawer}
      aria-label="Filter by status"
      aria-haspopup="dialog"
    >
      {#if manageState.filters.status !== 'all'}
        <i class="fas {STATUS_CONFIG[manageState.filters.status]?.icon ?? 'fa-circle'}"></i>
      {/if}
      <span>{currentStatusLabel}</span>
      <i class="fas fa-chevron-right panel-arrow"></i>
    </button>

    <!-- Priority panel trigger -->
    <button
      type="button"
      class="filter-panel-btn"
      class:active={manageState.filters.priority !== 'all'}
      onclick={openPriorityDrawer}
      aria-label="Filter by priority"
      aria-haspopup="dialog"
    >
      {#if manageState.filters.priority !== 'all'}
        <i class="fas {PRIORITY_CONFIG[manageState.filters.priority]?.icon ?? 'fa-circle'}"></i>
      {/if}
      <span>{currentPriorityLabel}</span>
      <i class="fas fa-chevron-right panel-arrow"></i>
    </button>

    {#if activeFilterCount > 0}
      <button
        type="button"
        class="clear-filters-btn"
        onclick={clearFilters}
        aria-label="Clear all filters"
      >
        <i class="fas fa-times"></i>
        Clear
      </button>
    {/if}
  </div>
</div>

<!-- Mobile bottom sheet -->
{#if isSheetOpen}
  <div
    class="sheet-backdrop"
    class:closing={isSheetAnimating && !isSheetOpen}
    onclick={handleBackdropClick}
    role="presentation"
  >
    <div
      class="sheet-container"
      class:closing={isSheetAnimating && !isSheetOpen}
      role="dialog"
      aria-modal="true"
      aria-label="Filter options"
    >
      <!-- Handle -->
      <button type="button" class="sheet-handle-area" onclick={closeSheet} aria-label="Close filters">
        <div class="sheet-handle"></div>
      </button>

      <!-- Header -->
      <header class="sheet-header">
        <h2 class="sheet-title">
          <i class="fas fa-filter"></i>
          Filters
        </h2>
        {#if activeFilterCount > 0}
          <span class="active-count">{activeFilterCount} active</span>
        {/if}
        <button
          type="button"
          class="sheet-close"
          onclick={closeSheet}
          aria-label="Close filters"
        >
          <i class="fas fa-times"></i>
        </button>
      </header>

      <!-- Content -->
      <div class="sheet-content">
        <!-- Type filter -->
        <div class="filter-section" class:expanded={activeSection === 'type' || activeSection === null}>
          <button
            type="button"
            class="filter-section-header"
            onclick={() => toggleSection('type')}
          >
            <h3 class="filter-section-title">Type</h3>
            {#if manageState.filters.type !== "all"}
              <span class="section-active-dot"></span>
            {/if}
            <i class="fas fa-chevron-down section-chevron"></i>
          </button>
          <div class="filter-options">
            <button
              type="button"
              class="filter-option"
              class:selected={manageState.filters.type === "all"}
              onclick={() => manageState.setFilter("type", "all")}
            >
              <span class="option-radio"></span>
              All Types
            </button>
            {#each Object.entries(TYPE_CONFIG) as [type, config]}
              <button
                type="button"
                class="filter-option"
                class:selected={manageState.filters.type === type}
                style="--option-color: {config.color}"
                onclick={() => manageState.setFilter("type", type as FeedbackType)}
              >
                <span class="option-radio"></span>
                <i class="fas {config.icon}"></i>
                {config.label.replace(" Report", "").replace(" Request", "").replace(" Feedback", "")}
              </button>
            {/each}
          </div>
        </div>

        <!-- Status filter -->
        <div class="filter-section" class:expanded={activeSection === 'status' || activeSection === null}>
          <button
            type="button"
            class="filter-section-header"
            onclick={() => toggleSection('status')}
          >
            <h3 class="filter-section-title">Status</h3>
            {#if manageState.filters.status !== "all"}
              <span class="section-active-dot"></span>
            {/if}
            <i class="fas fa-chevron-down section-chevron"></i>
          </button>
          <div class="filter-options">
            <button
              type="button"
              class="filter-option"
              class:selected={manageState.filters.status === "all"}
              onclick={() => manageState.setFilter("status", "all")}
            >
              <span class="option-radio"></span>
              All Status
            </button>
            {#each Object.entries(STATUS_CONFIG) as [status, config]}
              <button
                type="button"
                class="filter-option"
                class:selected={manageState.filters.status === status}
                style="--option-color: {config.color}"
                onclick={() => manageState.setFilter("status", status as FeedbackStatus)}
              >
                <span class="option-radio"></span>
                <i class="fas {config.icon}"></i>
                {config.label}
              </button>
            {/each}
          </div>
        </div>

        <!-- Priority filter -->
        <div class="filter-section" class:expanded={activeSection === 'priority' || activeSection === null}>
          <button
            type="button"
            class="filter-section-header"
            onclick={() => toggleSection('priority')}
          >
            <h3 class="filter-section-title">Priority</h3>
            {#if manageState.filters.priority !== "all"}
              <span class="section-active-dot"></span>
            {/if}
            <i class="fas fa-chevron-down section-chevron"></i>
          </button>
          <div class="filter-options">
            <button
              type="button"
              class="filter-option"
              class:selected={manageState.filters.priority === "all"}
              onclick={() => manageState.setFilter("priority", "all")}
            >
              <span class="option-radio"></span>
              All Priority
            </button>
            {#each Object.entries(PRIORITY_CONFIG) as [priority, config]}
              <button
                type="button"
                class="filter-option"
                class:selected={manageState.filters.priority === priority}
                style="--option-color: {config.color}"
                onclick={() => manageState.setFilter("priority", priority as FeedbackPriority)}
              >
                <span class="option-radio"></span>
                <i class="fas {config.icon}"></i>
                {config.label}
              </button>
            {/each}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="sheet-footer">
        <button
          type="button"
          class="sheet-btn secondary"
          onclick={clearFilters}
          disabled={activeFilterCount === 0}
        >
          <i class="fas fa-undo"></i>
          Clear All
        </button>
        <button
          type="button"
          class="sheet-btn primary"
          onclick={closeSheet}
        >
          <i class="fas fa-check"></i>
          Done
        </button>
      </footer>
    </div>
  </div>
{/if}

<!-- Desktop: Status Filter Drawer (Right Side Panel) -->
<Drawer
  bind:isOpen={openDrawer === 'status' ? true : false}
  placement="right"
  showHandle={false}
  ariaLabel="Status filter"
  class="filter-drawer"
  onOpenChange={(open) => { if (!open && openDrawer === 'status') openDrawer = null; }}
>
  <div class="drawer-panel">
    <header class="drawer-header">
      <h2 class="drawer-title">
        <i class="fas fa-tasks"></i>
        Filter by Status
      </h2>
      <button
        type="button"
        class="drawer-close"
        onclick={closeDrawer}
        aria-label="Close panel"
      >
        <i class="fas fa-times"></i>
      </button>
    </header>
    <div class="drawer-content">
      <button
        type="button"
        class="drawer-option"
        class:selected={manageState.filters.status === 'all'}
        onclick={() => { manageState.setFilter('status', 'all'); closeDrawer(); }}
      >
        <span class="option-radio"></span>
        <span class="option-label">All Status</span>
      </button>
      {#each Object.entries(STATUS_CONFIG) as [status, config]}
        <button
          type="button"
          class="drawer-option"
          class:selected={manageState.filters.status === status}
          style="--option-color: {config.color}"
          onclick={() => { manageState.setFilter('status', status as FeedbackStatus); closeDrawer(); }}
        >
          <span class="option-radio"></span>
          <i class="fas {config.icon}"></i>
          <span class="option-label">{config.label}</span>
        </button>
      {/each}
    </div>
  </div>
</Drawer>

<!-- Desktop: Priority Filter Drawer (Right Side Panel) -->
<Drawer
  bind:isOpen={openDrawer === 'priority' ? true : false}
  placement="right"
  showHandle={false}
  ariaLabel="Priority filter"
  class="filter-drawer"
  onOpenChange={(open) => { if (!open && openDrawer === 'priority') openDrawer = null; }}
>
  <div class="drawer-panel">
    <header class="drawer-header">
      <h2 class="drawer-title">
        <i class="fas fa-flag"></i>
        Filter by Priority
      </h2>
      <button
        type="button"
        class="drawer-close"
        onclick={closeDrawer}
        aria-label="Close panel"
      >
        <i class="fas fa-times"></i>
      </button>
    </header>
    <div class="drawer-content">
      <button
        type="button"
        class="drawer-option"
        class:selected={manageState.filters.priority === 'all'}
        onclick={() => { manageState.setFilter('priority', 'all'); closeDrawer(); }}
      >
        <span class="option-radio"></span>
        <span class="option-label">All Priority</span>
      </button>
      {#each Object.entries(PRIORITY_CONFIG) as [priority, config]}
        <button
          type="button"
          class="drawer-option"
          class:selected={manageState.filters.priority === priority}
          style="--option-color: {config.color}"
          onclick={() => { manageState.setFilter('priority', priority as FeedbackPriority); closeDrawer(); }}
        >
          <span class="option-radio"></span>
          <i class="fas {config.icon}"></i>
          <span class="option-label">{config.label}</span>
        </button>
      {/each}
    </div>
  </div>
</Drawer>

<style>
  /* ═══════════════════════════════════════════════════════════════════════════
     DESIGN TOKENS
     ═══════════════════════════════════════════════════════════════════════════ */
  .filter-bar {
    --fb-space-3xs: 4px;
    --fb-space-2xs: 6px;
    --fb-space-xs: 8px;
    --fb-space-sm: 13px;
    --fb-space-md: 21px;
    --fb-space-lg: 34px;

    --fb-text-xs: 0.75rem;
    --fb-text-sm: 0.875rem;
    --fb-text-base: 1rem;

    --fb-radius-sm: 8px;
    --fb-radius-md: 12px;
    --fb-radius-lg: 16px;
    --fb-radius-full: 999px;

    --fb-primary: #10b981;
    --fb-surface: rgba(255, 255, 255, 0.05);
    --fb-surface-hover: rgba(255, 255, 255, 0.08);
    --fb-border: rgba(255, 255, 255, 0.1);
    --fb-border-focus: rgba(255, 255, 255, 0.2);
    --fb-text: rgba(255, 255, 255, 0.95);
    --fb-text-muted: rgba(255, 255, 255, 0.6);
    --fb-text-subtle: rgba(255, 255, 255, 0.4);

    /* Spring animation */
    --spring-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
    --spring-smooth: cubic-bezier(0.4, 0, 0.2, 1);

    display: flex;
    align-items: center;
    gap: var(--fb-space-sm);
    padding: var(--fb-space-sm);
    background: var(--fb-surface);
    border-bottom: 1px solid var(--fb-border);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     SEARCH INPUT
     ═══════════════════════════════════════════════════════════════════════════ */
  .search-wrapper {
    flex: 1;
    position: relative;
    min-width: 0;
  }

  .search-icon {
    position: absolute;
    left: var(--fb-space-sm);
    top: 50%;
    transform: translateY(-50%);
    color: var(--fb-text-subtle);
    font-size: var(--fb-text-sm);
    pointer-events: none;
    transition: color 0.2s ease;
  }

  .search-input {
    width: 100%;
    height: 48px;
    padding: 0 var(--fb-space-lg) 0 calc(var(--fb-space-sm) + 24px);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-md);
    color: var(--fb-text);
    font-size: 16px; /* Prevent iOS zoom */
    font-family: inherit;
    transition: all 0.2s ease;
  }

  .search-input::placeholder {
    color: var(--fb-text-subtle);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--fb-primary);
    background: var(--fb-surface-hover);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
  }

  .search-wrapper:focus-within .search-icon {
    color: var(--fb-primary);
  }

  .search-clear {
    position: absolute;
    right: var(--fb-space-xs);
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: none;
    border: none;
    color: var(--fb-text-subtle);
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.15s ease;
  }

  .search-clear:hover {
    background: var(--fb-surface-hover);
    color: var(--fb-text-muted);
  }

  .search-clear:active {
    transform: translateY(-50%) scale(0.95);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     MOBILE FILTERS BUTTON
     ═══════════════════════════════════════════════════════════════════════════ */
  .filters-button {
    display: flex;
    align-items: center;
    gap: var(--fb-space-xs);
    height: 48px;
    min-width: 48px;
    padding: 0 var(--fb-space-md);
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-md);
    color: var(--fb-text-muted);
    font-size: var(--fb-text-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s var(--spring-smooth);
    white-space: nowrap;
  }

  .filters-button:hover {
    background: var(--fb-surface-hover);
    border-color: var(--fb-border-focus);
    color: var(--fb-text);
  }

  .filters-button:active {
    transform: scale(0.98);
  }

  .filter-count {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    background: var(--fb-primary);
    border-radius: var(--fb-radius-full);
    color: white;
    font-size: 11px;
    font-weight: 700;
    animation: popIn 0.3s var(--spring-bounce);
  }

  @keyframes popIn {
    from { transform: scale(0); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     DESKTOP INLINE FILTERS
     ═══════════════════════════════════════════════════════════════════════════ */
  .desktop-filters {
    display: none;
    align-items: center;
    gap: var(--fb-space-sm);
  }

  .chip-group {
    display: flex;
    align-items: center;
    gap: var(--fb-space-2xs);
  }

  .filter-chip {
    display: flex;
    align-items: center;
    gap: var(--fb-space-2xs);
    height: 48px;
    padding: 0 var(--fb-space-md);
    background: transparent;
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-full);
    color: var(--fb-text-muted);
    font-size: var(--fb-text-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s var(--spring-smooth);
    white-space: nowrap;
  }

  .filter-chip i {
    font-size: 0.85em;
  }

  .filter-chip:hover {
    background: var(--fb-surface-hover);
    border-color: var(--fb-border-focus);
    color: var(--fb-text);
  }

  .filter-chip:active {
    transform: scale(0.97);
  }

  .filter-chip.active {
    background: color-mix(in srgb, var(--chip-color, var(--fb-primary)) 15%, transparent);
    border-color: var(--chip-color, var(--fb-primary));
    color: var(--fb-text);
  }

  .filter-chip.active i {
    color: var(--chip-color, var(--fb-primary));
  }

  .dropdown-wrapper {
    position: relative;
  }

  .filter-select {
    height: 48px;
    padding: 0 calc(var(--fb-space-lg) + 8px) 0 var(--fb-space-md);
    background: transparent;
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-full);
    color: var(--fb-text-muted);
    font-size: var(--fb-text-sm);
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' fill='rgba(255,255,255,0.5)' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    transition: all 0.2s ease;
  }

  .filter-select:hover {
    border-color: var(--fb-border-focus);
    color: var(--fb-text);
  }

  .filter-select:focus {
    outline: none;
    border-color: var(--fb-primary);
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15);
  }

  .clear-filters-btn {
    display: flex;
    align-items: center;
    gap: var(--fb-space-xs);
    height: 48px;
    padding: 0 var(--fb-space-md);
    background: none;
    border: none;
    color: var(--fb-text-subtle);
    font-size: var(--fb-text-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    border-radius: var(--fb-radius-md);
  }

  .clear-filters-btn:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     BOTTOM SHEET
     ═══════════════════════════════════════════════════════════════════════════ */
  .sheet-backdrop {
    /* Re-declare design tokens for fixed-position context */
    --fb-space-3xs: 4px;
    --fb-space-2xs: 6px;
    --fb-space-xs: 8px;
    --fb-space-sm: 13px;
    --fb-space-md: 21px;
    --fb-space-lg: 34px;

    --fb-text-xs: 0.75rem;
    --fb-text-sm: 0.875rem;
    --fb-text-base: 1rem;

    --fb-radius-sm: 8px;
    --fb-radius-md: 12px;
    --fb-radius-lg: 16px;
    --fb-radius-full: 999px;

    --fb-primary: #10b981;
    --fb-surface: rgba(255, 255, 255, 0.05);
    --fb-surface-hover: rgba(255, 255, 255, 0.08);
    --fb-border: rgba(255, 255, 255, 0.1);
    --fb-border-focus: rgba(255, 255, 255, 0.2);
    --fb-text: rgba(255, 255, 255, 0.95);
    --fb-text-muted: rgba(255, 255, 255, 0.6);
    --fb-text-subtle: rgba(255, 255, 255, 0.4);

    --spring-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
    --spring-smooth: cubic-bezier(0.4, 0, 0.2, 1);

    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    z-index: 1000;
    animation: fadeIn 0.25s ease;
  }

  .sheet-backdrop.closing {
    animation: fadeOut 0.25s ease forwards;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  .sheet-container {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    max-height: 85vh;
    background: linear-gradient(180deg, #1e1e24 0%, #16161a 100%);
    border-radius: 20px 20px 0 0;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.35s var(--spring-bounce);
    padding-bottom: env(safe-area-inset-bottom, 0px);
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.5);
  }

  .sheet-container.closing {
    animation: slideDown 0.28s var(--spring-smooth) forwards;
  }

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  @keyframes slideDown {
    from { transform: translateY(0); }
    to { transform: translateY(100%); }
  }

  .sheet-handle-area {
    display: flex;
    justify-content: center;
    width: 100%;
    padding: var(--fb-space-sm) 0;
    background: none;
    border: none;
    cursor: pointer;
  }

  .sheet-handle {
    width: 40px;
    height: 5px;
    background: rgba(255, 255, 255, 0.25);
    border-radius: 3px;
    transition: background 0.2s ease;
  }

  .sheet-handle-area:hover .sheet-handle {
    background: rgba(255, 255, 255, 0.4);
  }

  .sheet-header {
    display: flex;
    align-items: center;
    gap: var(--fb-space-sm);
    padding: 0 var(--fb-space-md) var(--fb-space-md);
    border-bottom: 1px solid var(--fb-border);
  }

  .sheet-title {
    display: flex;
    align-items: center;
    gap: var(--fb-space-xs);
    margin: 0;
    font-size: var(--fb-text-base);
    font-weight: 600;
    color: var(--fb-text);
  }

  .sheet-title i {
    color: var(--fb-primary);
  }

  .active-count {
    margin-left: auto;
    margin-right: var(--fb-space-xs);
    padding: var(--fb-space-3xs) var(--fb-space-xs);
    background: rgba(16, 185, 129, 0.15);
    border-radius: var(--fb-radius-full);
    font-size: var(--fb-text-xs);
    font-weight: 600;
    color: var(--fb-primary);
  }

  .sheet-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    margin: calc(var(--fb-space-sm) * -1);
    margin-left: 0;
    background: none;
    border: none;
    color: var(--fb-text-muted);
    cursor: pointer;
    border-radius: var(--fb-radius-md);
    transition: all 0.15s ease;
  }

  .sheet-close:hover {
    background: var(--fb-surface-hover);
    color: var(--fb-text);
  }

  .sheet-close:active {
    transform: scale(0.95);
  }

  .sheet-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--fb-space-sm);
    display: flex;
    flex-direction: column;
    gap: var(--fb-space-2xs);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     FILTER SECTIONS (Accordion Style)
     ═══════════════════════════════════════════════════════════════════════════ */
  .filter-section {
    display: flex;
    flex-direction: column;
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-md);
    overflow: hidden;
  }

  .filter-section-header {
    display: flex;
    align-items: center;
    gap: var(--fb-space-xs);
    min-height: 48px;
    padding: 0 var(--fb-space-md);
    background: none;
    border: none;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .filter-section-header:hover {
    background: var(--fb-surface-hover);
  }

  .filter-section-title {
    margin: 0;
    font-size: var(--fb-text-sm);
    font-weight: 600;
    color: var(--fb-text);
  }

  .section-active-dot {
    width: 8px;
    height: 8px;
    background: var(--fb-primary);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .section-chevron {
    margin-left: auto;
    font-size: 0.75em;
    color: var(--fb-text-subtle);
    transition: transform 0.2s ease;
  }

  .filter-section.expanded .section-chevron {
    transform: rotate(180deg);
  }

  .filter-options {
    display: none;
    flex-direction: column;
    gap: 2px;
    padding: var(--fb-space-2xs);
    padding-top: 0;
  }

  .filter-section.expanded .filter-options {
    display: flex;
    animation: expandIn 0.2s ease;
  }

  @keyframes expandIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .filter-option {
    display: flex;
    align-items: center;
    gap: var(--fb-space-sm);
    min-height: 48px;
    padding: 0 var(--fb-space-md);
    background: transparent;
    border: none;
    border-radius: var(--fb-radius-sm);
    color: var(--fb-text-muted);
    font-size: var(--fb-text-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
  }

  .filter-option i {
    font-size: 0.9em;
    width: 18px;
    text-align: center;
  }

  .filter-option:hover {
    background: var(--fb-surface-hover);
    color: var(--fb-text);
  }

  .filter-option:active {
    transform: scale(0.99);
  }

  /* Radio indicator */
  .option-radio {
    width: 20px;
    height: 20px;
    border: 2px solid var(--fb-border-focus);
    border-radius: 50%;
    flex-shrink: 0;
    position: relative;
    transition: all 0.2s var(--spring-bounce);
  }

  .option-radio::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 10px;
    height: 10px;
    background: var(--option-color, var(--fb-primary));
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    transition: transform 0.2s var(--spring-bounce);
  }

  .filter-option.selected {
    background: color-mix(in srgb, var(--option-color, var(--fb-primary)) 10%, transparent);
    color: var(--fb-text);
  }

  .filter-option.selected .option-radio {
    border-color: var(--option-color, var(--fb-primary));
  }

  .filter-option.selected .option-radio::after {
    transform: translate(-50%, -50%) scale(1);
  }

  .filter-option.selected i {
    color: var(--option-color, var(--fb-primary));
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     SHEET FOOTER
     ═══════════════════════════════════════════════════════════════════════════ */
  .sheet-footer {
    display: flex;
    gap: var(--fb-space-sm);
    padding: var(--fb-space-md);
    border-top: 1px solid var(--fb-border);
    background: rgba(0, 0, 0, 0.2);
  }

  .sheet-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--fb-space-xs);
    height: 52px;
    border: none;
    border-radius: var(--fb-radius-md);
    font-size: var(--fb-text-sm);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s var(--spring-smooth);
  }

  .sheet-btn:active {
    transform: scale(0.98);
  }

  .sheet-btn.secondary {
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    color: var(--fb-text-muted);
  }

  .sheet-btn.secondary:hover:not(:disabled) {
    background: var(--fb-surface-hover);
    color: var(--fb-text);
  }

  .sheet-btn.secondary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .sheet-btn.primary {
    background: linear-gradient(135deg, #34d399 0%, var(--fb-primary) 100%);
    color: white;
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.25);
  }

  .sheet-btn.primary:hover {
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
    transform: translateY(-1px);
  }

  .sheet-btn.primary:active {
    transform: translateY(0) scale(0.98);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     RESPONSIVE
     ═══════════════════════════════════════════════════════════════════════════ */

  .mobile-only {
    display: flex;
  }

  /* Tablet+ (768px) - Switch to inline filters */
  @media (min-width: 768px) {
    .filter-bar {
      padding: var(--fb-space-md);
      gap: var(--fb-space-md);
    }

    .mobile-only {
      display: none;
    }

    .desktop-filters {
      display: flex;
    }

    .search-wrapper {
      flex: unset;
      width: 280px;
    }

    /* Hide bottom sheet on desktop */
    .sheet-backdrop {
      display: none;
    }
  }

  /* Desktop (1024px+) */
  @media (min-width: 1024px) {
    .search-wrapper {
      width: 320px;
    }

    .chip-label {
      display: inline;
    }
  }

  /* Wide (1440px+) */
  @media (min-width: 1440px) {
    .search-wrapper {
      width: 380px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .sheet-backdrop,
    .sheet-container,
    .filter-options,
    .filter-count,
    .option-radio::after {
      animation: none;
    }

    .section-chevron,
    .filter-chip,
    .filter-option {
      transition: none;
    }
  }
</style>
