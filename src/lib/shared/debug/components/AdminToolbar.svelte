<!--
  AdminToolbar - Admin debug tools

  Desktop: Top bar with F9 toggle
  Mobile: Bottom sheet triggered by long-press on nav

  Features:
  - Quick access user chips
  - User search for previewing
  - Tab intro reset
  - First-run wizard preview
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { slide, fly } from "svelte/transition";
  import { featureFlagService } from "$lib/shared/auth/services/FeatureFlagService.svelte";
  import {
    userPreviewState,
    loadUserPreview,
    clearUserPreview,
  } from "$lib/shared/debug/state/user-preview-state.svelte";
  import { adminToolbarState } from "$lib/shared/debug/state/admin-toolbar-state.svelte";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import { getTabIntroContent } from "$lib/shared/onboarding/config/tab-intro-content";
  import { firstRunState } from "$lib/shared/onboarding/state/first-run-state.svelte.ts";
  import type { UserRole } from "$lib/shared/auth/domain/models/UserRole";
  import UserSearchInput from "$lib/shared/user-search/UserSearchInput.svelte";
  import RobustAvatar from "$lib/shared/components/avatar/RobustAvatar.svelte";

  // Responsive breakpoint
  const MOBILE_BREAKPOINT = 768;
  let windowWidth = $state(typeof window !== "undefined" ? window.innerWidth : 1024);
  const isMobile = $derived(windowWidth < MOBILE_BREAKPOINT);

  $effect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      windowWidth = window.innerWidth;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

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

  function previewFirstRunWizard() {
    firstRunState.forceShow();
    introResetMessage = "First-run wizard opened";
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
  {#if isMobile}
    <!-- MOBILE: Bottom sheet layout -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="mobile-backdrop"
      onclick={handleClose}
      onkeydown={(e) => { if (e.key === 'Escape') handleClose(); }}
      transition:fly={{ duration: 200, opacity: 0 }}
    ></div>
    <div class="mobile-sheet" transition:fly={{ y: 300, duration: 250 }}>
      <!-- Handle bar -->
      <div class="sheet-handle"></div>

      <!-- Header -->
      <div class="sheet-header">
        <div class="sheet-title">
          <i class="fas fa-shield-alt" aria-hidden="true"></i>
          <span>Admin Tools</span>
        </div>
        <button type="button" class="sheet-close" onclick={handleClose}>
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>

      <!-- Preview indicator -->
      {#if isUserPreview && previewProfile}
        <div class="mobile-preview-banner">
          <i class="fas fa-eye" aria-hidden="true"></i>
          <span>Previewing: {previewProfile.displayName || previewProfile.email}</span>
          <button type="button" class="banner-action" onclick={handleClearPreview}>
            <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
            <span>Exit</span>
          </button>
        </div>
      {/if}

      <!-- Quick Access Chips - Always visible, horizontal scroll -->
      <div class="sheet-section">
        <div class="section-label">Quick Access</div>
        <div class="mobile-chips-row">
          {#each quickAccessUsers as user (user.uid)}
            <div
              class="mobile-chip"
              class:active={previewProfile?.uid === user.uid}
              role="button"
              tabindex="0"
              onclick={() => selectUser(user)}
              onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectUser(user); }}
            >
              <RobustAvatar
                src={user.photoURL}
                name={user.displayName}
                customSize={36}
                alt=""
              />
              <span class="mobile-chip-name">{user.displayName}</span>
              <button
                type="button"
                class="mobile-chip-remove"
                onclick={(e) => { e.stopPropagation(); removeFromQuickAccess(user.uid); }}
                aria-label="Remove {user.displayName}"
              >
                <i class="fas fa-times" aria-hidden="true"></i>
              </button>
            </div>
          {/each}

          <!-- Search button to add users -->
          <button
            type="button"
            class="mobile-search-btn"
            class:active={isSearchOpen}
            onclick={() => adminToolbarState.toggleSearch()}
          >
            <i class="fas fa-search" aria-hidden="true"></i>
            <span>Find User</span>
          </button>
        </div>

        <!-- Search input (expandable) -->
        {#if isSearchOpen}
          <div class="mobile-search-panel">
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

      <!-- Actions Grid -->
      <div class="sheet-section">
        <div class="section-label">Debug Actions</div>
        <div class="actions-grid">
          <button type="button" class="action-card" onclick={previewFirstRunWizard}>
            <i class="fas fa-wand-magic-sparkles" aria-hidden="true"></i>
            <span>First Run Wizard</span>
          </button>

          <button
            type="button"
            class="action-card"
            onclick={resetTabIntro}
            disabled={!canResetIntro()}
          >
            <i class="fas fa-door-open" aria-hidden="true"></i>
            <span>Reset Tab Intro</span>
          </button>

          {#if isUserPreview && previewProfile && !isCurrentUserInQuickAccess}
            <button type="button" class="action-card" onclick={addToQuickAccess}>
              <i class="fas fa-bookmark" aria-hidden="true"></i>
              <span>Save to Quick Access</span>
            </button>
          {/if}
        </div>
      </div>

      <!-- Toast -->
      {#if introResetMessage}
        <div class="mobile-toast">
          <i class="fas fa-check" aria-hidden="true"></i>
          {introResetMessage}
        </div>
      {/if}
    </div>
  {:else}
    <!-- DESKTOP: Top bar layout -->
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

        <!-- First-Run Wizard Preview -->
        <button
          type="button"
          class="action-btn"
          onclick={previewFirstRunWizard}
          title="Preview first-run wizard"
        >
          <i class="fas fa-wand-magic-sparkles" aria-hidden="true"></i>
          <span class="action-label">First Run</span>
        </button>

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

  /* ============================================================================
     MOBILE STYLES - Bottom sheet layout
     ============================================================================ */

  .mobile-backdrop {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    background: rgba(0, 0, 0, 0.6) !important;
    z-index: 9997 !important;
  }

  .mobile-sheet {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    top: auto !important;
    z-index: 9998 !important;
    background: linear-gradient(180deg, rgba(20, 20, 30, 0.98) 0%, rgba(15, 15, 25, 0.99) 100%) !important;
    border-top-left-radius: 20px !important;
    border-top-right-radius: 20px !important;
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.5) !important;
    max-height: 80vh;
    overflow-y: auto;
    padding-bottom: max(16px, env(safe-area-inset-bottom));
  }

  .sheet-handle {
    width: 40px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    margin: 12px auto 8px;
  }

  .sheet-header {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 8px 16px 16px !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
    gap: 12px;
  }

  .sheet-title {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    gap: 10px !important;
    font-size: var(--font-size-lg) !important;
    font-weight: 600 !important;
    color: var(--semantic-info) !important;
  }

  .sheet-title i {
    font-size: var(--font-size-xl) !important;
  }

  .sheet-close {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 44px !important;
    height: 44px !important;
    min-width: 44px !important;
    min-height: 44px !important;
    background: rgba(255, 255, 255, 0.06) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 50% !important;
    color: var(--theme-text-dim) !important;
    font-size: var(--font-size-lg) !important;
    cursor: pointer;
    transition: all 0.15s;
    flex-shrink: 0 !important;
  }

  .sheet-close:active {
    background: rgba(239, 68, 68, 0.2);
    color: var(--semantic-error);
  }

  .mobile-preview-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 12px 16px;
    padding: 12px 16px;
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 12px;
    color: #93c5fd;
    font-size: var(--font-size-sm);
  }

  .mobile-preview-banner > i:first-child {
    color: var(--semantic-info);
    font-size: var(--font-size-lg);
  }

  .mobile-preview-banner > span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .banner-action {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.4);
    border-radius: 8px;
    color: #fca5a5;
    font-size: var(--font-size-compact);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .banner-action:active {
    background: rgba(239, 68, 68, 0.3);
  }

  .sheet-section {
    padding: 16px !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
  }

  .sheet-section:last-of-type {
    border-bottom: none !important;
  }

  .section-label {
    font-size: var(--font-size-compact) !important;
    font-weight: 600 !important;
    color: var(--theme-text-dim) !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    margin-bottom: 12px !important;
  }

  /* Quick Access Chips - Horizontal scrolling row */
  .mobile-chips-row {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: wrap !important;
    gap: 8px !important;
    align-items: center !important;
  }

  .mobile-chip {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    height: 52px !important;
    min-height: 52px !important;
    padding: 0 12px 0 8px !important;
    background: rgba(255, 255, 255, 0.08) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-radius: 26px !important;
    color: var(--theme-text) !important;
    font-size: var(--font-size-sm) !important;
    cursor: pointer;
    transition: all 0.15s;
    flex-shrink: 0;
  }

  .mobile-chip:active {
    background: rgba(255, 255, 255, 0.12) !important;
    border-color: rgba(255, 255, 255, 0.25) !important;
  }

  .mobile-chip.active {
    background: rgba(59, 130, 246, 0.3) !important;
    border-color: var(--semantic-info) !important;
  }

  .mobile-chip-name {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mobile-chip-remove {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 28px !important;
    height: 28px !important;
    background: transparent !important;
    border: none !important;
    border-radius: 50% !important;
    color: var(--theme-text-dim) !important;
    font-size: var(--font-size-compact) !important;
    cursor: pointer;
    transition: all 0.15s;
  }

  .mobile-chip-remove:active {
    background: rgba(239, 68, 68, 0.3) !important;
    color: white !important;
  }

  .mobile-search-btn {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    height: 52px !important;
    min-height: 52px !important;
    padding: 0 16px !important;
    background: rgba(59, 130, 246, 0.15) !important;
    border: 1px solid rgba(59, 130, 246, 0.3) !important;
    border-radius: 26px !important;
    color: #93c5fd !important;
    font-size: var(--font-size-sm) !important;
    font-weight: 500 !important;
    cursor: pointer;
    transition: all 0.15s;
    flex-shrink: 0;
  }

  .mobile-search-btn:active {
    background: rgba(59, 130, 246, 0.25) !important;
  }

  .mobile-search-btn.active {
    background: rgba(59, 130, 246, 0.3) !important;
    border-color: var(--semantic-info) !important;
  }

  .mobile-search-btn i {
    font-size: var(--font-size-base) !important;
  }

  .mobile-search-panel {
    margin-top: 12px !important;
  }

  .actions-grid {
    display: grid !important;
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 12px !important;
  }

  .action-card {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 10px !important;
    padding: 20px 16px !important;
    background: rgba(255, 255, 255, 0.04) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 16px !important;
    color: var(--theme-text) !important;
    font-size: var(--font-size-sm) !important;
    text-align: center !important;
    cursor: pointer;
    transition: all 0.15s;
  }

  .action-card:active:not(:disabled) {
    background: rgba(139, 92, 246, 0.2) !important;
    border-color: rgba(139, 92, 246, 0.4) !important;
  }

  .action-card:disabled {
    opacity: 0.35 !important;
    cursor: not-allowed;
  }

  .action-card i {
    font-size: 24px !important;
    color: var(--theme-accent) !important;
  }

  .action-card span {
    line-height: 1.3;
  }

  .mobile-toast {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 12px 16px;
    padding: 12px 16px;
    background: rgba(34, 197, 94, 0.2);
    border: 1px solid rgba(34, 197, 94, 0.4);
    border-radius: 12px;
    color: #86efac;
    font-size: var(--font-size-sm);
    font-weight: 500;
    animation: fadeIn 0.2s ease;
  }
</style>
