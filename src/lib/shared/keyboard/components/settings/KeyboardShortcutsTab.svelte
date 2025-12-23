<!--
  KeyboardShortcutsTab.svelte

  Main Settings tab for managing keyboard shortcuts.
  Features search, context filtering, scope grouping, and inline editing.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type {
    IShortcutCustomizationService,
    ShortcutWithBinding,
  } from "../../services/contracts/IShortcutCustomizationService";
  import type {
    ShortcutScope,
    ShortcutConflict,
  } from "../../domain/types/keyboard-types";
  import ShortcutSearchBar from "./ShortcutSearchBar.svelte";
  import ShortcutScopeSection from "./ShortcutScopeSection.svelte";
  import ShortcutKeyCapture from "./ShortcutKeyCapture.svelte";
  import { authState } from "$lib/shared/auth/state/authState.svelte";

  // Services
  let customizationService: IShortcutCustomizationService | null = $state(null);

  // Local state
  let searchQuery = $state("");
  let allShortcuts = $state<ShortcutWithBinding[]>([]);
  let expandedScopes = $state<Set<ShortcutScope>>(
    new Set(["navigation", "action", "editing"])
  );

  // Edit modal state
  let editingItem = $state<ShortcutWithBinding | null>(null);
  let isEditModalOpen = $state(false);

  // Detect mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Check if user is admin (for showing admin shortcuts section)
  const isAdmin = $derived(authState.isAdmin);

  // Scope labels and order - admin section only shown to admins
  const scopeConfig = $derived(() => {
    const baseScopes: Array<{ scope: ShortcutScope; label: string }> = [
      { scope: "navigation", label: "Navigation" },
      { scope: "action", label: "Actions" },
      { scope: "editing", label: "Editing" },
      { scope: "playback", label: "Playback" },
      { scope: "animation", label: "Animation" },
      { scope: "view", label: "View" },
      { scope: "selection", label: "Selection" },
      { scope: "special", label: "Special" },
      { scope: "help", label: "Help" },
    ];

    // Add admin section only for admins
    if (isAdmin) {
      baseScopes.push({ scope: "admin", label: "Admin Tools" });
    }

    return baseScopes;
  });

  onMount(() => {
    try {
      customizationService = resolve<IShortcutCustomizationService>(
        TYPES.IShortcutCustomizationService
      );
      refreshShortcuts();
    } catch (error) {
      console.warn("Failed to resolve shortcut customization service:", error);
    }
  });

  function refreshShortcuts() {
    if (!customizationService) return;
    allShortcuts = customizationService.getAllShortcutsWithBindings();
  }

  // Filter shortcuts by search
  const filteredShortcuts = $derived(() => {
    if (!searchQuery.trim()) return allShortcuts;

    const query = searchQuery.toLowerCase();
    return allShortcuts.filter(
      (item) =>
        item.shortcut.label.toLowerCase().includes(query) ||
        item.shortcut.description?.toLowerCase().includes(query) ||
        item.shortcut.id.toLowerCase().includes(query)
    );
  });

  // Group filtered shortcuts by scope
  const groupedByScope = $derived(() => {
    const groups = new Map<ShortcutScope, ShortcutWithBinding[]>();

    for (const item of filteredShortcuts()) {
      const scope = item.shortcut.scope || "action";
      if (!groups.has(scope)) {
        groups.set(scope, []);
      }
      groups.get(scope)!.push(item);
    }

    return groups;
  });

  // Count customized shortcuts
  function getCustomizedCount(): number {
    return customizationService?.getCustomizedCount() ?? 0;
  }
  const customizedCount = $derived(getCustomizedCount());

  // Edit handlers
  function handleEditShortcut(item: ShortcutWithBinding) {
    editingItem = item;
    isEditModalOpen = true;
  }

  function handleResetShortcut(item: ShortcutWithBinding) {
    if (!customizationService) return;
    customizationService.resetBinding(item.shortcut.id);
    refreshShortcuts();
  }

  function handleSaveBinding(keyCombo: string) {
    if (!customizationService || !editingItem) return;
    customizationService.setCustomBinding(editingItem.shortcut.id, keyCombo);
    refreshShortcuts();
    editingItem = null;
  }

  function handleClearBinding() {
    if (!customizationService || !editingItem) return;
    customizationService.disableShortcut(editingItem.shortcut.id);
    refreshShortcuts();
    editingItem = null;
  }

  function handleResetAll() {
    if (!customizationService) return;
    if (!confirm("Reset all shortcuts to their default bindings?")) return;
    customizationService.resetAllBindings();
    refreshShortcuts();
  }

  function detectConflict(keyCombo: string): ShortcutConflict | null {
    if (!customizationService || !editingItem) return null;
    return customizationService.detectConflict(
      editingItem.shortcut.id,
      keyCombo
    );
  }

  function toggleScope(scope: ShortcutScope) {
    const newSet = new Set(expandedScopes);
    if (newSet.has(scope)) {
      newSet.delete(scope);
    } else {
      newSet.add(scope);
    }
    expandedScopes = newSet;
  }
</script>

<div class="keyboard-shortcuts-tab">
  <!-- Search Bar -->
  <ShortcutSearchBar
    bind:query={searchQuery}
    {customizedCount}
    onResetAll={handleResetAll}
  />

  <!-- Shortcuts List -->
  <div class="shortcuts-list">
    {#if filteredShortcuts().length === 0}
      <div class="empty-state">
        <i class="fas fa-keyboard"></i>
        <p>No shortcuts found</p>
        {#if searchQuery}
          <span>Try a different search term</span>
        {/if}
      </div>
    {:else}
      {#each scopeConfig() as { scope, label }, scopeIndex}
        {#if groupedByScope().has(scope)}
          {@const shortcuts = groupedByScope().get(scope)!}
          <div
            class="scope-section-wrapper"
            in:fly={{
              y: 16,
              duration: 250,
              delay: scopeIndex * 50,
              easing: cubicOut,
            }}
          >
            <ShortcutScopeSection
              {scope}
              {label}
              {shortcuts}
              isExpanded={expandedScopes.has(scope)}
              onEditShortcut={handleEditShortcut}
              onResetShortcut={handleResetShortcut}
            />
          </div>
        {/if}
      {/each}
    {/if}
  </div>

  <!-- Key Capture Modal/Sheet -->
  <ShortcutKeyCapture
    bind:isOpen={isEditModalOpen}
    item={editingItem}
    {isMobile}
    onSave={handleSaveBinding}
    onCancel={() => (isEditModalOpen = false)}
    onClear={handleClearBinding}
    {detectConflict}
  />
</div>

<style>
  .keyboard-shortcuts-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background: transparent;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  /* Shortcuts List */
  .shortcuts-list {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Empty State */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 40px 20px;
    text-align: center;
  }

  .empty-state i {
    font-size: 36px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.3));
  }

  .empty-state p {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    color: var(--theme-text, rgba(255, 255, 255, 0.7));
  }

  .empty-state span {
    font-size: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
  }

  /* Mobile Adjustments */
  @media (max-width: 768px) {
    .shortcuts-list {
      padding: 14px;
      gap: 12px;
    }
  }

  /* Scope section animation wrapper */
  .scope-section-wrapper {
    /* Container for animation */
    display: contents;
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .scope-section-wrapper {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
