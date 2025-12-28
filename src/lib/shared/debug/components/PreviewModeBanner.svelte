<!--
  PreviewModeBanner - Unified debug toolbar for previewing users

  Press F9 to toggle. Single consistent bar with:
  - Search input (left)
  - Quick Access users (center)
  - Current preview info (right, if active)
-->
<script lang="ts">
  import { onMount } from "svelte";
  import {
    userPreviewState,
    loadUserPreview,
    clearUserPreview,
  } from "$lib/shared/debug/state/user-preview-state.svelte";
  import { featureFlagService } from "$lib/shared/auth/services/FeatureFlagService.svelte";
  import { roleSwitcherState } from "$lib/shared/debug/state/role-switcher-state.svelte";
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

  // Derived state
  const isOpen = $derived(roleSwitcherState.isOpen);
  const isUserPreview = $derived(userPreviewState.isActive);
  const profile = $derived(userPreviewState.data.profile);
  const actualRole = $derived(featureFlagService.userRole);
  const isAdmin = $derived(actualRole === "admin");

  // Show banner if F9 is toggled OR user is being previewed
  const showBanner = $derived(isAdmin && (isOpen || isUserPreview));

  // Check if current preview user is in quick access
  const isCurrentUserInQuickAccess = $derived(
    profile ? quickAccessUsers.some((u) => u.uid === profile.uid) : false
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
    if (!profile) return;
    const newUser: QuickAccessUser = {
      uid: profile.uid,
      displayName: profile.displayName || profile.email || "Unknown",
      email: profile.email || "",
      photoURL: profile.photoURL,
    };
    quickAccessUsers = [...quickAccessUsers, newUser];
    saveQuickAccessUsers(quickAccessUsers);
  }

  function removeFromQuickAccess(uid: string) {
    quickAccessUsers = quickAccessUsers.filter((u) => u.uid !== uid);
    saveQuickAccessUsers(quickAccessUsers);
  }

  async function selectQuickAccessUser(user: QuickAccessUser) {
    await handleUserSelect({
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
    });
  }

  async function handleUserSelect(user: {
    uid: string;
    displayName: string;
    email: string;
  }) {
    await loadUserPreview(user.uid, true);

    // Auto-apply the user's role
    const previewedRole = userPreviewState.data.profile?.role as UserRole | undefined;
    if (previewedRole) {
      featureFlagService.setDebugRoleOverride(previewedRole);
    }
  }

  function handleClearPreview() {
    clearUserPreview();
    featureFlagService.clearDebugRoleOverride();
  }

  function handleClose() {
    // Clear preview and close
    if (isUserPreview) {
      clearUserPreview();
      featureFlagService.clearDebugRoleOverride();
    }
    if (isOpen) {
      roleSwitcherState.toggle();
    }
  }

  onMount(() => {
    quickAccessUsers = loadQuickAccessUsers();
  });

  // Set CSS variable for banner height when visible
  $effect(() => {
    const root = document.documentElement;
    if (showBanner) {
      // 56px on desktop, 48px on mobile (matches CSS)
      const height = window.innerWidth <= 768 ? 48 : 56;
      root.style.setProperty("--preview-banner-height", `${height}px`);
    } else {
      root.style.removeProperty("--preview-banner-height");
    }
  });
</script>

{#if showBanner}
  <div class="preview-banner">
    <div class="banner-content">
      <!-- Left: Search -->
      <div class="search-section">
        <div class="banner-icon">
          <i class="fas fa-eye" aria-hidden="true"></i>
        </div>
        <div class="search-container">
          <UserSearchInput
            onSelect={handleUserSelect}
            selectedUserId={profile?.uid || ""}
            selectedUserDisplay={profile?.displayName || profile?.email || ""}
            placeholder="Search users..."
            disabled={userPreviewState.isLoading}
          />
        </div>
      </div>

      <!-- Center: Quick Access -->
      <div class="quick-access-section">
        {#if quickAccessUsers.length > 0}
          {#each quickAccessUsers as user (user.uid)}
            <button
              type="button"
              class="quick-chip"
              class:active={profile?.uid === user.uid}
              onclick={() => selectQuickAccessUser(user)}
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
            </button>
          {/each}
        {/if}
      </div>

      <!-- Right: Preview Info & Actions -->
      <div class="actions-section">
        {#if isUserPreview && profile}
          <div class="preview-info">
            <span class="preview-label">Viewing:</span>
            <span class="preview-name">{profile.displayName || profile.email}</span>
            {#if profile.role && profile.role !== "user"}
              <span class="role-badge">{profile.role}</span>
            {/if}
          </div>

          <span class="read-only-badge">
            <i class="fas fa-lock" aria-hidden="true"></i>
          </span>

          {#if isCurrentUserInQuickAccess}
            <button
              type="button"
              class="action-btn saved"
              onclick={() => removeFromQuickAccess(profile.uid)}
              title="Remove from quick access"
            >
              <i class="fas fa-bookmark" aria-hidden="true"></i>
            </button>
          {:else}
            <button
              type="button"
              class="action-btn"
              onclick={addToQuickAccess}
              title="Save to quick access"
            >
              <i class="far fa-bookmark" aria-hidden="true"></i>
            </button>
          {/if}

          <button class="clear-btn" onclick={handleClearPreview} title="Exit preview">
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        {:else}
          <span class="hint-text">Select a user to preview</span>
          <button class="close-btn" onclick={handleClose} title="Close (F9)">
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .preview-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 56px;
    z-index: 9998;
    background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%);
    border-bottom: 2px solid var(--semantic-info);
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
  }

  .banner-content {
    display: flex;
    align-items: center;
    gap: 16px;
    height: 100%;
    padding: 0 16px;
  }

  /* Search Section */
  .search-section {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    width: 280px;
  }

  .banner-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: white;
    font-size: var(--font-size-sm);
    flex-shrink: 0;
  }

  .search-container {
    flex: 1;
    min-width: 0;
  }

  .search-container :global(.user-search) {
    width: 100%;
  }

  .search-container :global(.search-input) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: white;
    font-size: var(--font-size-compact);
    min-height: 36px;
    padding: 0 36px;
  }

  .search-container :global(.search-input::placeholder) {
    color: rgba(255, 255, 255, 0.75);
  }

  .search-container :global(.search-input:focus) {
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 0 2px var(--theme-stroke);
  }

  .search-container :global(.search-icon) {
    color: rgba(255, 255, 255, 0.75);
    left: 12px;
  }

  .search-container :global(.search-results) {
    background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%);
    border-color: rgba(255, 255, 255, 0.2);
  }

  /* Quick Access Section */
  .quick-access-section {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .quick-access-section::-webkit-scrollbar {
    display: none;
  }

  .quick-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px 4px 4px;
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke-strong);
    border-radius: 999px;
    color: var(--theme-text);
    font-size: var(--font-size-compact);
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .quick-chip:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .quick-chip.active {
    background: rgba(59, 130, 246, 0.4);
    border-color: var(--semantic-info);
    color: white;
  }

  .chip-avatar {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    object-fit: cover;
  }

  .chip-avatar-placeholder {
    width: 22px;
    height: 22px;
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
  }

  /* Actions Section */
  .actions-section {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .preview-info {
    display: flex;
    align-items: center;
    gap: 6px;
    padding-right: 8px;
    border-right: 1px solid var(--theme-stroke-strong);
    margin-right: 4px;
  }

  .preview-label {
    font-size: var(--font-size-compact);
    color: rgba(255, 255, 255, 0.75);
  }

  .preview-name {
    font-size: var(--font-size-compact);
    font-weight: 600;
    color: white;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .role-badge {
    padding: 2px 6px;
    background: rgba(251, 191, 36, 0.5);
    border: 1px solid rgba(251, 191, 36, 0.6);
    border-radius: 4px;
    font-size: var(--font-size-compact);
    font-weight: 700;
    text-transform: uppercase;
    color: white;
  }

  .read-only-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: rgba(239, 68, 68, 0.5);
    border: 1px solid rgba(239, 68, 68, 0.6);
    border-radius: 6px;
    color: white;
    font-size: var(--font-size-compact);
  }

  .hint-text {
    font-size: var(--font-size-compact);
    color: rgba(255, 255, 255, 0.75);
    font-style: italic;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px; /* WCAG AAA touch target */
    height: 48px;
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke-strong);
    border-radius: 6px;
    color: var(--theme-text-dim);
    font-size: var(--font-size-compact);
    cursor: pointer;
    transition: all 0.15s;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }

  .action-btn.saved {
    color: white;
    background: rgba(251, 191, 36, 0.5);
    border-color: rgba(251, 191, 36, 0.6);
  }

  .clear-btn,
  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px; /* WCAG AAA touch target */
    height: 48px;
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke-strong);
    border-radius: 6px;
    color: var(--theme-text-dim);
    font-size: var(--font-size-compact);
    cursor: pointer;
    transition: all 0.15s;
  }

  .clear-btn:hover,
  .close-btn:hover {
    background: rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.5);
    color: white;
  }

  /* Responsive */
  @media (max-width: 900px) {
    .search-section {
      width: 200px;
    }

    .preview-info {
      display: none;
    }
  }

  @media (max-width: 768px) {
    .preview-banner {
      height: 48px;
    }

    .banner-content {
      padding: 0 10px;
      gap: 8px;
    }

    .search-section {
      width: 160px;
    }

    .banner-icon {
      display: none;
    }

    .quick-access-section {
      display: none;
    }

    .hint-text {
      display: none;
    }
  }
</style>
