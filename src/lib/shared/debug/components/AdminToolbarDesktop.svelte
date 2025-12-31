<!--
  AdminToolbarDesktop - Desktop top bar admin tools

  Horizontal toolbar at top of screen with quick access chips,
  user search, and action buttons.
-->
<script lang="ts">
  import { slide } from "svelte/transition";
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
</script>

<div class="admin-toolbar" transition:slide={{ duration: 150 }}>
  <div class="toolbar-row">
    <!-- Branding -->
    <div class="toolbar-branding">
      <i class="fas fa-shield-alt" aria-hidden="true"></i>
      <span>Admin</span>
    </div>

    <!-- Quick Access Users -->
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

    <!-- First-Run Wizard Preview -->
    <button
      type="button"
      class="action-btn"
      onclick={onPreviewFirstRun}
      title="Preview first-run wizard"
    >
      <i class="fas fa-wand-magic-sparkles" aria-hidden="true"></i>
      <span class="action-label">First Run</span>
    </button>

    <!-- Tab Intro Reset -->
    <button
      type="button"
      class="action-btn"
      onclick={onResetTabIntro}
      disabled={!canResetIntro}
      title={currentIntroTitle ? `Reset "${currentIntroTitle}" intro` : "No intro for this tab"}
    >
      <i class="fas fa-door-open" aria-hidden="true"></i>
      <span class="action-label">Tab Intro</span>
    </button>

    <!-- Intro reset feedback -->
    {#if introResetMessage}
      <div class="toast">
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

  .quick-access {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .quick-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 48px;
    min-height: 48px;
    max-height: 48px;
    padding: 0 8px 0 6px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    color: var(--theme-text);
    font-size: var(--font-size-compact);
    cursor: pointer;
    transition: all 0.15s;
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
    width: 24px;
    height: 24px;
    background: transparent;
    border: none;
    border-radius: 50%;
    color: var(--theme-text-dim);
    font-size: var(--font-size-compact);
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
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--theme-stroke);
    border-radius: 24px;
    color: var(--theme-text-dim);
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: all 0.15s;
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
    height: 48px;
    min-height: 48px;
    max-height: 48px;
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 8px;
    color: #93c5fd;
    font-size: var(--font-size-compact);
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
    width: 32px;
    height: 32px;
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
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 12px 16px;
    min-height: 48px;
    background: transparent;
    border: 1px solid var(--theme-stroke);
    border-radius: 8px;
    color: var(--theme-text-dim);
    font-size: var(--font-size-compact);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .action-btn:hover:not(:disabled) {
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.4);
    color: #c4b5fd;
  }

  .action-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
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
    animation: fadeIn 0.15s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
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
</style>
