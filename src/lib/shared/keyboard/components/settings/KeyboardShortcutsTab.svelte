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
      const filterContext = contextFilter as ShortcutContext;
      filtered = filtered.filter((item) => {
        const contexts = item.shortcut.context;
        if (!contexts) return filterContext === "global";
        if (Array.isArray(contexts)) {
          return contexts.includes(filterContext) || contexts.includes("global");
        }
        return contexts === filterContext || contexts === "global";
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
    return customizationService.detectConflict(editingItem.shortcut.id, keyCombo);
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
  <!-- Quick Settings Chips -->
  <div class="settings-chips">
    <button
      type="button"
      class="setting-chip"
      class:active={singleKeyEnabled}
      onclick={() => {
        singleKeyEnabled = !singleKeyEnabled;
        onSettingUpdate({ key: "singleKeyShortcuts", value: singleKeyEnabled });
        keyboardShortcutState.updateSettings({ enableSingleKeyShortcuts: singleKeyEnabled });
      }}
      aria-pressed={singleKeyEnabled}
      aria-label="Toggle single-key shortcuts"
    >
      <i class="fas fa-bolt chip-icon"></i>
      <span class="chip-label">Single-key</span>
      <span class="chip-hint">Space, J, K</span>
    </button>

    <button
      type="button"
      class="setting-chip"
      class:active={hintsEnabled}
      onclick={() => {
        hintsEnabled = !hintsEnabled;
        onSettingUpdate({ key: "showShortcutHints", value: hintsEnabled });
        keyboardShortcutState.updateSettings({ showShortcutHints: hintsEnabled });
      }}
      aria-pressed={hintsEnabled}
      aria-label="Toggle shortcut hints"
    >
      <i class="fas fa-lightbulb chip-icon"></i>
      <span class="chip-label">Show hints</span>
      <span class="chip-hint">Tooltips & buttons</span>
    </button>
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

  /* Quick Settings Chips - 2026 Bento Box Style */
  .settings-chips {
    flex-shrink: 0;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 16px;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-accent, #8b5cf6) 3%, transparent) 0%,
      color-mix(in srgb, var(--theme-accent, #6366f1) 2%, transparent) 100%
    );
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.06));
  }

  .setting-chip {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 16px 12px;
    min-height: 80px;

    /* Bento box frosted glass */
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 16px;

    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

    /* Subtle inset glow */
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.03),
      0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .setting-chip:hover:not(:disabled) {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.06));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.12));
    transform: translateY(-2px);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      0 8px 24px rgba(0, 0, 0, 0.15);
  }

  .setting-chip:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
    transition-duration: 0.1s;
  }

  /* Active (On) State - Theme accent with violet fallback */
  .setting-chip.active {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-accent, #8b5cf6) 20%, transparent) 0%,
      color-mix(in srgb, var(--theme-accent, #6366f1) 15%, transparent) 100%
    );
    border-color: color-mix(in srgb, var(--theme-accent, #8b5cf6) 40%, transparent);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      0 0 0 1px color-mix(in srgb, var(--theme-accent, #8b5cf6) 15%, transparent),
      0 4px 16px var(--theme-shadow, rgba(139, 92, 246, 0.2));
  }

  .setting-chip.active:hover:not(:disabled) {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-accent, #8b5cf6) 25%, transparent) 0%,
      color-mix(in srgb, var(--theme-accent, #6366f1) 20%, transparent) 100%
    );
    border-color: color-mix(in srgb, var(--theme-accent, #8b5cf6) 50%, transparent);
  }

  .chip-icon {
    font-size: 18px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    transition: all 0.2s ease;
  }

  .setting-chip.active .chip-icon {
    color: var(--theme-accent, rgba(167, 139, 250, 1));
    filter: drop-shadow(0 0 8px var(--theme-shadow, rgba(139, 92, 246, 0.5)));
  }

  .chip-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    transition: color 0.2s ease;
  }

  .setting-chip.active .chip-label {
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .chip-hint {
    font-size: 10px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.35));
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .setting-chip.active .chip-hint {
    color: var(--theme-accent, rgba(167, 139, 250, 0.7));
  }

  /* Focus State */
  .setting-chip:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--theme-accent, #8b5cf6) 50%, transparent);
    outline-offset: 2px;
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
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
  }

  .empty-state i {
    font-size: 48px;
    opacity: 0.3;
  }

  .empty-state p {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: var(--theme-text, rgba(255, 255, 255, 0.6));
  }

  .empty-state span {
    font-size: 14px;
  }

  /* Mobile Adjustments */
  @media (max-width: 768px) {
    .settings-chips {
      padding: 12px;
      gap: 8px;
    }

    .setting-chip {
      min-height: 72px;
      padding: 14px 10px;
    }

    .chip-icon {
      font-size: 16px;
    }

    .chip-label {
      font-size: 12px;
    }

    .shortcuts-list {
      padding: 12px;
      gap: 10px;
    }
  }

  /* Scope section animation wrapper */
  .scope-section-wrapper {
    /* Container for animation */
    display: contents;
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .setting-chip {
      transition: none;
    }

    .setting-chip:hover:not(:disabled) {
      transform: none;
    }

    .scope-section-wrapper {
      animation: none !important;
      transition: none !important;
    }
  }

  /* High Contrast Mode */
  @media (prefers-contrast: high) {
    .setting-chip {
      border-width: 2px;
    }

    .setting-chip.active {
      border-color: rgba(139, 92, 246, 0.8);
    }
  }
</style>
