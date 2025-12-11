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
  import type { IShortcutCustomizationService, ShortcutWithBinding } from "../../services/contracts/IShortcutCustomizationService";
  import type { ShortcutContext, ShortcutScope, ShortcutConflict } from "../../domain/types/keyboard-types";
  import { keyboardShortcutState } from "../../state/keyboard-shortcut-state.svelte";
  import ShortcutSearchBar from "./ShortcutSearchBar.svelte";
  import ShortcutScopeSection from "./ShortcutScopeSection.svelte";
  import ShortcutKeyCapture from "./ShortcutKeyCapture.svelte";

  interface Props {
    currentSettings: {
      singleKeyShortcuts?: boolean;
      showShortcutHints?: boolean;
    };
    onSettingUpdate: (event: { key: string; value: unknown }) => void;
  }

  let { currentSettings, onSettingUpdate }: Props = $props();

  // Services
  let customizationService: IShortcutCustomizationService | null = $state(null);

  // Local state
  let searchQuery = $state("");
  let contextFilter = $state<ShortcutContext | "all">("all");
  let allShortcuts = $state<ShortcutWithBinding[]>([]);
  let expandedScopes = $state<Set<ShortcutScope>>(new Set(["navigation", "action", "editing"]));

  // Edit modal state
  let editingItem = $state<ShortcutWithBinding | null>(null);
  let isEditModalOpen = $state(false);

  // Settings state
  let singleKeyEnabled = $state(currentSettings.singleKeyShortcuts ?? true);
  let hintsEnabled = $state(currentSettings.showShortcutHints ?? true);

  // Detect mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Scope labels and order
  const scopeConfig: Array<{ scope: ShortcutScope; label: string }> = [
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

  // Sync with external settings changes
  $effect(() => {
    singleKeyEnabled = currentSettings.singleKeyShortcuts ?? true;
    hintsEnabled = currentSettings.showShortcutHints ?? true;
  });

  function refreshShortcuts() {
    if (!customizationService) return;
    allShortcuts = customizationService.getAllShortcutsWithBindings();
  }

  // Filter shortcuts by search and context
  const filteredShortcuts = $derived(() => {
    let filtered = allShortcuts;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.shortcut.label.toLowerCase().includes(query) ||
          item.shortcut.description?.toLowerCase().includes(query) ||
          item.shortcut.id.toLowerCase().includes(query)
      );
    }

    // Filter by context
    if (contextFilter !== "all") {
      filtered = filtered.filter((item) => {
        const contexts = item.shortcut.context;
        if (!contexts) return contextFilter === "global";
        if (Array.isArray(contexts)) {
          return contexts.includes(contextFilter) || contexts.includes("global");
        }
        return contexts === contextFilter || contexts === "global";
      });
    }

    return filtered;
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
  const customizedCount = $derived(
    customizationService?.getCustomizedCount() ?? 0
  );

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
    return customizationService.detectConflict(editingItem.shortcut.id, keyCombo);
  }

  // Settings handlers
  function handleSingleKeyToggle(event: Event) {
    const target = event.target as HTMLInputElement;
    singleKeyEnabled = target.checked;
    onSettingUpdate({ key: "singleKeyShortcuts", value: target.checked });
    keyboardShortcutState.setSingleKeyShortcutsEnabled(target.checked);
  }

  function handleHintsToggle(event: Event) {
    const target = event.target as HTMLInputElement;
    hintsEnabled = target.checked;
    onSettingUpdate({ key: "showShortcutHints", value: target.checked });
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
  <!-- Toggle Settings Section -->
  <div class="settings-toggles">
    <div class="toggle-row">
      <div class="toggle-info">
        <span class="toggle-label">Single-key shortcuts</span>
        <span class="toggle-description">Enable shortcuts without modifier keys (e.g., Space to play)</span>
      </div>
      <label class="toggle-switch">
        <input
          type="checkbox"
          checked={singleKeyEnabled}
          onchange={handleSingleKeyToggle}
          aria-label="Toggle single-key shortcuts"
        />
        <span class="toggle-slider"></span>
      </label>
    </div>

    <div class="toggle-row">
      <div class="toggle-info">
        <span class="toggle-label">Show shortcut hints</span>
        <span class="toggle-description">Display keyboard hints in tooltips and buttons</span>
      </div>
      <label class="toggle-switch">
        <input
          type="checkbox"
          checked={hintsEnabled}
          onchange={handleHintsToggle}
          aria-label="Toggle shortcut hints"
        />
        <span class="toggle-slider"></span>
      </label>
    </div>
  </div>

  <!-- Search and Filter Bar -->
  <ShortcutSearchBar
    bind:query={searchQuery}
    bind:contextFilter
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
      {#each scopeConfig as { scope, label }, scopeIndex}
        {#if groupedByScope().has(scope)}
          {@const shortcuts = groupedByScope().get(scope)!}
          <div
            class="scope-section-wrapper"
            in:fly={{ y: 16, duration: 250, delay: scopeIndex * 50, easing: cubicOut }}
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
    background: var(--background, #0f0f0f);
  }

  /* Settings Toggles Section */
  .settings-toggles {
    flex-shrink: 0;
    padding: 16px;
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 0;
  }

  .toggle-row:first-child {
    padding-top: 0;
  }

  .toggle-row:last-child {
    padding-bottom: 0;
  }

  .toggle-row:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }

  .toggle-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .toggle-label {
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
  }

  .toggle-description {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  /* iOS-style Toggle Switch */
  .toggle-switch {
    flex-shrink: 0;
    position: relative;
    display: inline-block;
    width: 51px;
    height: 31px;
    cursor: pointer;
  }

  .toggle-switch input {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
    margin: 0;
    z-index: 2;
    top: 0;
    left: 0;
  }

  .toggle-slider {
    position: absolute;
    inset: 0;
    background: rgba(120, 120, 128, 0.32);
    border-radius: 999px;
    transition: all 200ms ease;
  }

  .toggle-slider::before {
    content: "";
    position: absolute;
    height: 27px;
    width: 27px;
    left: 2px;
    top: 2px;
    background: white;
    border-radius: 50%;
    transition: all 200ms ease;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  }

  input:checked + .toggle-slider {
    background: #34c759;
  }

  input:checked + .toggle-slider::before {
    left: 22px;
  }

  /* Shortcuts List */
  .shortcuts-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
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
    gap: 12px;
    padding: 48px 24px;
    text-align: center;
    color: rgba(255, 255, 255, 0.4);
  }

  .empty-state i {
    font-size: 48px;
    opacity: 0.3;
  }

  .empty-state p {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
  }

  .empty-state span {
    font-size: 14px;
  }

  /* Mobile Adjustments */
  @media (max-width: 768px) {
    .settings-toggles {
      padding: 12px;
    }

    .shortcuts-list {
      padding: 12px;
      gap: 10px;
    }

    .toggle-description {
      display: none;
    }
  }

  /* Scope section animation wrapper */
  .scope-section-wrapper {
    /* Container for animation */
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .toggle-slider,
    .toggle-slider::before {
      transition: none;
    }

    .scope-section-wrapper {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
