<!--
  AdminToolbar - Compact admin debug bar

  Press F9 to toggle. Single row with:
  - Quick access user chips (inline)
  - Search icon for finding users
  - Tab Intro reset button
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { featureFlagService } from "$lib/shared/auth/services/FeatureFlagService.svelte";
  import {
    userPreviewState,
    loadUserPreview,
    clearUserPreview,
  } from "$lib/shared/debug/state/user-preview-state.svelte";
  import { adminToolbarState } from "$lib/shared/debug/state/admin-toolbar-state.svelte";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import { getTabIntroContent } from "$lib/shared/onboarding/config/tab-intro-content";
  import type { UserRole } from "$lib/shared/auth/domain/models/UserRole";
  import UserSearchInput from "$lib/shared/user-search/UserSearchInput.svelte";

  // Quick access storage
  const QUICK_ACCESS_KEY = "tka-quick-access-users";

  interface QuickAccessUser {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string | null;
  }

  // State
  let quickAccessUsers = $state<QuickAccessUser[]>([]);
  let introResetMessage = $state<string | null>(null);

  // Derived - Admin check
  const actualRole = $derived(featureFlagService.userRole);
  const isAdmin = $derived(actualRole === "admin");
  const isOpen = $derived(adminToolbarState.isOpen);
  const isSearchOpen = $derived(adminToolbarState.isSearchOpen);

  // Derived - Preview state
  const isUserPreview = $derived(userPreviewState.isActive);
  const previewProfile = $derived(userPreviewState.data.profile);

  // Show toolbar if F9 is toggled OR user is being previewed
  const showToolbar = $derived(isAdmin && (isOpen || isUserPreview));

  // Tab Intro
  const currentModule = $derived(navigationState.currentModule);
  const currentTab = $derived(navigationState.activeTab);
  const currentIntro = $derived(
    currentModule && currentTab
      ? getTabIntroContent(currentModule, currentTab)
      : null
  );

  const canResetIntro = $derived(() => {
    if (!currentModule || !currentTab || !currentIntro) return false;
    if (typeof localStorage === "undefined") return false;
    const key = `tabIntroSeen:${currentModule}:${currentTab}`;
    return localStorage.getItem(key) === "true";
  });

  // Check if current preview user is in quick access
  const isCurrentUserInQuickAccess = $derived(
    previewProfile ? quickAccessUsers.some((u) => u.uid === previewProfile.uid) : false
  );

  // Quick Access Functions
  function loadQuickAccessUsers(): QuickAccessUser[] {
    if (typeof localStorage === "undefined") return [];
    try {
      const saved = localStorage.getItem(QUICK_ACCESS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  function saveQuickAccessUsers(users: QuickAccessUser[]) {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(QUICK_ACCESS_KEY, JSON.stringify(users));
  }

  function addToQuickAccess() {
    if (!previewProfile) return;
    const newUser: QuickAccessUser = {
      uid: previewProfile.uid,
      displayName: previewProfile.displayName || previewProfile.email || "Unknown",
      email: previewProfile.email || "",
      photoURL: previewProfile.photoURL,
    };
    quickAccessUsers = [...quickAccessUsers, newUser];
    saveQuickAccessUsers(quickAccessUsers);
  }

  function removeFromQuickAccess(uid: string) {
    quickAccessUsers = quickAccessUsers.filter((u) => u.uid !== uid);
    saveQuickAccessUsers(quickAccessUsers);
  }

  async function selectUser(user: { uid: string; displayName: string; email: string }) {
    await loadUserPreview(user.uid, true);
    const previewedRole = userPreviewState.data.profile?.role as UserRole | undefined;
    if (previewedRole) {
      featureFlagService.setDebugRoleOverride(previewedRole);
    }
    adminToolbarState.closeSearch();
  }

  function handleClearPreview() {
    clearUserPreview();
    featureFlagService.clearDebugRoleOverride();
  }

  function resetTabIntro() {
    if (!currentModule || !currentTab || !currentIntro) return;
    const key = `tabIntroSeen:${currentModule}:${currentTab}`;
    localStorage.removeItem(key);
    introResetMessage = `Reset "${currentIntro.title}"`;
    setTimeout(() => {
      introResetMessage = null;
    }, 2000);
  }

  function handleClose() {
    adminToolbarState.close();
  }

  onMount(() => {
    quickAccessUsers = loadQuickAccessUsers();
  });
</script>

{#if showToolbar}
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
            onclick={() => selectUser(user)}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectUser(user); }}
            title={user.email}
          >
            {#if user.photoURL}
              <img src={user.photoURL} alt="" class="chip-avatar" />
            {:else}
              <span class="chip-avatar-placeholder">
                <i class="fas fa-user" aria-hidden="true"></i>
              </span>
            {/if}
            <span class="chip-name">{user.displayName}</span>
            <button
              type="button"
              class="chip-remove"
              onclick={(e) => { e.stopPropagation(); removeFromQuickAccess(user.uid); }}
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
          onclick={() => adminToolbarState.toggleSearch()}
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
              onclick={addToQuickAccess}
              title="Save to quick access"
            >
              <i class="far fa-bookmark" aria-hidden="true"></i>
            </button>
          {/if}
          <button
            type="button"
            class="badge-action exit"
            onclick={handleClearPreview}
            title="Exit preview"
          >
            <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
          </button>
        </div>
      {/if}

      <!-- Spacer -->
      <div class="spacer"></div>

      <!-- Tab Intro Reset -->
      <button
        type="button"
        class="action-btn"
        onclick={resetTabIntro}
        disabled={!canResetIntro()}
        title={currentIntro ? `Reset "${currentIntro.title}" intro` : "No intro for this tab"}
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
        onclick={handleClose}
        title="Close (F9)"
      >
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    </div>

    <!-- Search dropdown -->
    {#if isSearchOpen}
      <div class="search-panel" transition:slide={{ duration: 150 }}>
        <UserSearchInput
          onSelect={selectUser}
          selectedUserId={previewProfile?.uid || ""}
          selectedUserDisplay={previewProfile?.displayName || previewProfile?.email || ""}
          placeholder="Search users to preview..."
          disabled={userPreviewState.isLoading}
        />
      </div>
    {/if}
  </div>
{/if}

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
    padding: 6px 8px 6px 6px;
    min-height: 48px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 24px;
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

  .chip-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
  }

  .chip-avatar-placeholder {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--theme-text-dim);
    font-size: var(--font-size-compact);
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
    padding: 8px 12px;
    min-height: 48px;
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

  /* Responsive */
  @media (max-width: 768px) {
    .toolbar-row {
      padding: 4px 8px;
      flex-wrap: wrap;
    }

    .toolbar-branding span {
      display: none;
    }

    .action-label {
      display: none;
    }

    .chip-name {
      display: none;
    }

    .preview-name {
      display: none;
    }
  }
</style>
