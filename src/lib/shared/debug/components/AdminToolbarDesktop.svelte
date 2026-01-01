<!--
  AdminToolbarDesktop - Desktop top bar admin tools

  Horizontal toolbar at top of screen with quick access chips,
  user search, and debug actions in a dropdown menu.

  Progressive collapse:
  - >1200px: Full layout
  - 900-1200px: Actions collapse to dropdown, chips scroll
  - <900px: Compact mode (handled by parent switching to mobile)
-->
<script lang="ts">
  import { slide, fly } from "svelte/transition";
  import UserSearchInput from "$lib/shared/user-search/UserSearchInput.svelte";
  import RobustAvatar from "$lib/shared/components/avatar/RobustAvatar.svelte";
  import type { QuickAccessUser } from "../services/contracts/IQuickAccessPersister";
  import type { PreviewUserProfile } from "../state/user-preview-state.svelte";

  interface Props {
    quickAccessUsers: QuickAccessUser[];
    previewProfile: PreviewUserProfile | null;
    isUserPreview: boolean;
    isSearchOpen: boolean;
    isLoading: boolean;
    introResetMessage: string | null;
    canResetIntro: boolean;
    currentIntroTitle: string | null;
    isCurrentUserInQuickAccess: boolean;
    onSelectUser: (user: { uid: string; displayName: string; email: string }) => void;
    onRemoveFromQuickAccess: (uid: string) => void;
    onAddToQuickAccess: () => void;
    onClearPreview: () => void;
    onToggleSearch: () => void;
    onResetTabIntro: () => void;
    onPreviewFirstRun: () => void;
    onClose: () => void;
  }

  let {
    quickAccessUsers,
    previewProfile,
    isUserPreview,
    isSearchOpen,
    isLoading,
    introResetMessage,
    canResetIntro,
    currentIntroTitle,
    isCurrentUserInQuickAccess,
    onSelectUser,
    onRemoveFromQuickAccess,
    onAddToQuickAccess,
    onClearPreview,
    onToggleSearch,
    onResetTabIntro,
    onPreviewFirstRun,
    onClose,
  }: Props = $props();

  // Debug actions dropdown state
  let isActionsOpen = $state(false);

  function toggleActions() {
    isActionsOpen = !isActionsOpen;
  }

  function handleFirstRun() {
    onPreviewFirstRun();
    isActionsOpen = false;
  }

  function handleResetIntro() {
    onResetTabIntro();
    isActionsOpen = false;
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.actions-menu')) {
      isActionsOpen = false;
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

<div class="admin-toolbar" transition:slide={{ duration: 150 }}>
  <div class="toolbar-row">
    <!-- Branding -->
    <div class="toolbar-branding">
      <i class="fas fa-shield-alt" aria-hidden="true"></i>
      <span class="branding-text">Admin</span>
    </div>

    <!-- Quick Access Users (horizontal scroll) -->
    <div class="quick-access">
      {#each quickAccessUsers as user (user.uid)}
        <div
          class="quick-chip"
          class:active={previewProfile?.uid === user.uid}
          role="button"
          tabindex="0"
          onclick={() => onSelectUser(user)}
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectUser(user); }}
          title={user.email}
        >
          <RobustAvatar
            src={user.photoURL}
            name={user.displayName}
            customSize={28}
            alt=""
          />
          <span class="chip-name">{user.displayName}</span>
          <button
            type="button"
            class="chip-remove"
            onclick={(e) => { e.stopPropagation(); onRemoveFromQuickAccess(user.uid); }}
            onkeydown={(e) => e.stopPropagation()}
            title="Remove"
          >
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
      {/each}

      <!-- Search button -->
      <button
        type="button"
        class="search-btn"
        class:active={isSearchOpen}
        onclick={onToggleSearch}
        title="Search users"
      >
        <i class="fas fa-search" aria-hidden="true"></i>
      </button>
    </div>

    <!-- Current preview indicator + actions -->
    {#if isUserPreview && previewProfile}
      <div class="preview-badge">
        <i class="fas fa-eye" aria-hidden="true"></i>
        <span class="preview-name">{previewProfile.displayName || previewProfile.email}</span>
        {#if !isCurrentUserInQuickAccess}
          <button
            type="button"
            class="badge-action"
            onclick={onAddToQuickAccess}
            title="Save to quick access"
          >
            <i class="far fa-bookmark" aria-hidden="true"></i>
          </button>
        {/if}
        <button
          type="button"
          class="badge-action exit"
          onclick={onClearPreview}
          title="Exit preview"
        >
          <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
        </button>
      </div>
    {/if}

    <!-- Spacer -->
    <div class="spacer"></div>

    <!-- Debug Actions Dropdown -->
    <div class="actions-menu">
      <button
        type="button"
        class="actions-trigger"
        class:active={isActionsOpen}
        onclick={toggleActions}
        title="Debug actions"
      >
        <i class="fas fa-wrench" aria-hidden="true"></i>
        <span class="trigger-label">Debug</span>
        <i class="fas fa-chevron-down chevron" class:open={isActionsOpen} aria-hidden="true"></i>
      </button>

      {#if isActionsOpen}
        <div class="actions-dropdown" transition:fly={{ y: -8, duration: 150 }}>
          <button
            type="button"
            class="dropdown-item"
            onclick={handleFirstRun}
          >
            <i class="fas fa-wand-magic-sparkles" aria-hidden="true"></i>
            <span>Preview First Run Wizard</span>
          </button>

          <button
            type="button"
            class="dropdown-item"
            onclick={handleResetIntro}
            disabled={!canResetIntro}
          >
            <i class="fas fa-door-open" aria-hidden="true"></i>
            <span>
              Reset Tab Intro
              {#if currentIntroTitle}
                <span class="intro-hint">({currentIntroTitle})</span>
              {/if}
            </span>
          </button>
        </div>
      {/if}
    </div>

    <!-- Intro reset feedback toast -->
    {#if introResetMessage}
      <div class="toast" transition:fly={{ x: 20, duration: 200 }}>
        <i class="fas fa-check" aria-hidden="true"></i>
        {introResetMessage}
      </div>
    {/if}

    <!-- Close -->
    <button
      type="button"
      class="close-btn"
      onclick={onClose}
      title="Close (F9)"
    >
      <i class="fas fa-times" aria-hidden="true"></i>
    </button>
  </div>

  <!-- Search dropdown -->
  {#if isSearchOpen}
    <div class="search-panel" transition:slide={{ duration: 150 }}>
      <UserSearchInput
        onSelect={onSelectUser}
        selectedUserId={previewProfile?.uid || ""}
        selectedUserDisplay={previewProfile?.displayName || previewProfile?.email || ""}
        placeholder="Search users to preview..."
        disabled={isLoading}
        autofocus={true}
      />
    </div>
  {/if}
</div>

<style>
  .admin-toolbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9998;
    background: linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 0.95) 100%);
    border-bottom: 1px solid rgba(59, 130, 246, 0.3);
    box-shadow: 0 2px 12px var(--theme-shadow);
  }

  .toolbar-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    min-height: 56px;
  }

  .toolbar-branding {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--font-size-compact);
    font-weight: 600;
    color: var(--semantic-info);
    flex-shrink: 0;
  }

  /* Quick Access - horizontal scroll, no wrap */
  .quick-access {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 1;
    min-width: 0;
    max-width: 500px;
    overflow-x: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
    padding: 4px 0;
  }

  .quick-access::-webkit-scrollbar {
    height: 4px;
  }

  .quick-access::-webkit-scrollbar-track {
    background: transparent;
  }

  .quick-access::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }

  .quick-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 40px;
    padding: 0 8px 0 6px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    color: var(--theme-text);
    font-size: var(--font-size-compact);
    cursor: pointer;
    transition: all 0.15s;
    flex-shrink: 0;
  }

  .quick-chip:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .quick-chip.active {
    background: rgba(59, 130, 246, 0.3);
    border-color: var(--semantic-info);
  }

  .chip-name {
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chip-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: transparent;
    border: none;
    border-radius: 50%;
    color: var(--theme-text-dim);
    font-size: 10px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .chip-remove:hover {
    background: rgba(239, 68, 68, 0.3);
    color: white;
  }

  .search-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--theme-stroke);
    border-radius: 20px;
    color: var(--theme-text-dim);
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: all 0.15s;
    flex-shrink: 0;
  }

  .search-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .search-btn.active {
    background: rgba(59, 130, 246, 0.25);
    border-color: rgba(59, 130, 246, 0.5);
    color: var(--semantic-info);
  }

  .preview-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    height: 40px;
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 8px;
    color: #93c5fd;
    font-size: var(--font-size-compact);
    flex-shrink: 0;
  }

  .preview-badge > i:first-child {
    color: var(--semantic-info);
  }

  .preview-name {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .badge-action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: var(--theme-text-dim);
    font-size: var(--font-size-compact);
    cursor: pointer;
    transition: all 0.15s;
  }

  .badge-action:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .badge-action.exit:hover {
    background: rgba(239, 68, 68, 0.2);
    color: var(--semantic-error);
  }

  .spacer {
    flex: 1;
    min-width: 8px;
  }

  /* Debug Actions Dropdown */
  .actions-menu {
    position: relative;
    flex-shrink: 0;
  }

  .actions-trigger {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    height: 40px;
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 8px;
    color: #c4b5fd;
    font-size: var(--font-size-compact);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .actions-trigger:hover {
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.4);
  }

  .actions-trigger.active {
    background: rgba(139, 92, 246, 0.25);
    border-color: rgba(139, 92, 246, 0.5);
  }

  .actions-trigger .chevron {
    font-size: 10px;
    transition: transform 0.15s;
  }

  .actions-trigger .chevron.open {
    transform: rotate(180deg);
  }

  .actions-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    min-width: 220px;
    background: rgba(20, 20, 35, 0.98);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    z-index: 10;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 12px 14px;
    background: transparent;
    border: none;
    color: var(--theme-text);
    font-size: var(--font-size-sm);
    text-align: left;
    cursor: pointer;
    transition: all 0.15s;
  }

  .dropdown-item:hover:not(:disabled) {
    background: rgba(139, 92, 246, 0.15);
  }

  .dropdown-item:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .dropdown-item i {
    width: 16px;
    text-align: center;
    color: var(--theme-accent);
  }

  .dropdown-item .intro-hint {
    font-size: var(--font-size-xs);
    color: var(--theme-text-dim);
    margin-left: 4px;
  }

  .toast {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: rgba(34, 197, 94, 0.2);
    border: 1px solid rgba(34, 197, 94, 0.4);
    border-radius: 6px;
    font-size: var(--font-size-compact);
    color: #86efac;
    flex-shrink: 0;
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--theme-stroke);
    border-radius: 8px;
    color: var(--theme-text-dim);
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: all 0.15s;
    flex-shrink: 0;
  }

  .close-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.4);
    color: var(--semantic-error);
  }

  .search-panel {
    padding: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .search-panel :global(.search-input) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
    color: white;
  }

  .search-panel :global(.search-input::placeholder) {
    color: rgba(255, 255, 255, 0.5);
  }

  /* Progressive collapse: 900-1200px */
  @media (max-width: 1200px) {
    .quick-access {
      max-width: 350px;
    }

    .preview-name {
      max-width: 80px;
    }

    .trigger-label {
      display: none;
    }

    .actions-trigger {
      padding: 8px 10px;
    }
  }

  /* Compact mode: 768-900px */
  @media (max-width: 900px) {
    .toolbar-row {
      padding: 4px 8px;
      gap: 6px;
    }

    .branding-text {
      display: none;
    }

    .quick-access {
      max-width: 200px;
    }

    .chip-name {
      max-width: 60px;
    }

    .preview-badge {
      padding: 0 8px;
    }

    .preview-name {
      display: none;
    }
  }
</style>
