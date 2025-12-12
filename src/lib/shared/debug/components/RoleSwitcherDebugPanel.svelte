<!--
  Role Switcher Debug Panel

  Admin-only tool for testing different permission levels and previewing user data.
  Press F9 to toggle.

  Features:
  - Quick role switching (admin, tester, premium, user)
  - Full user preview with comprehensive data access
  - Visual indicator when in override/preview mode
  - Keyboard shortcut to toggle
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { featureFlagService } from "$lib/shared/auth/services/FeatureFlagService.svelte";
  import { authState } from "$lib/shared/auth/state/authState.svelte";
  import type { UserRole } from "$lib/shared/auth/domain/models/UserRole";
  import UserSearchInput from "$lib/shared/user-search/UserSearchInput.svelte";
  import {
    userPreviewState,
    loadUserPreview,
    clearUserPreview,
  } from "$lib/shared/debug/state/user-preview-state.svelte";
  import { roleSwitcherState } from "$lib/shared/debug/state/role-switcher-state.svelte";

  // Quick access users storage
  const QUICK_ACCESS_KEY = "tka-quick-access-users";

  interface QuickAccessUser {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string | null;
  }

  // State - use shared state for panel visibility (controlled by keyboard shortcut system)
  const isOpen = $derived(roleSwitcherState.isOpen);
  let quickAccessUsers = $state<QuickAccessUser[]>([]);

  // Load quick access users from localStorage
  function loadQuickAccessUsers(): QuickAccessUser[] {
    if (typeof localStorage === "undefined") return [];
    try {
      const saved = localStorage.getItem(QUICK_ACCESS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  // Save quick access users to localStorage
  function saveQuickAccessUsers(users: QuickAccessUser[]) {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(QUICK_ACCESS_KEY, JSON.stringify(users));
  }

  // Get values from service
  const actualRole = $derived(featureFlagService.userRole);
  const effectiveRole = $derived(featureFlagService.effectiveRole);
  const debugOverride = $derived(featureFlagService.debugRoleOverride);
  const isAdmin = $derived(authState.isAdmin);
  const isPreview = $derived(userPreviewState.isActive);
  const previewProfile = $derived(userPreviewState.data.profile);

  // Debug: Log when isOpen or isAdmin changes
  $effect(() => {
    console.log(`[RoleSwitcherDebugPanel] State:`, { isOpen, isAdmin });
  });

  // Check if current preview user is in quick access (must be after previewProfile)
  const isCurrentUserInQuickAccess = $derived(
    previewProfile
      ? quickAccessUsers.some((u) => u.uid === previewProfile.uid)
      : false
  );

  // Add current preview user to quick access
  function addToQuickAccess() {
    if (!previewProfile) return;
    const newUser: QuickAccessUser = {
      uid: previewProfile.uid,
      displayName:
        previewProfile.displayName || previewProfile.email || "Unknown",
      email: previewProfile.email || "",
      photoURL: previewProfile.photoURL,
    };
    quickAccessUsers = [...quickAccessUsers, newUser];
    saveQuickAccessUsers(quickAccessUsers);
  }

  // Remove user from quick access
  function removeFromQuickAccess(uid: string) {
    quickAccessUsers = quickAccessUsers.filter((u) => u.uid !== uid);
    saveQuickAccessUsers(quickAccessUsers);
  }

  // Select a quick access user
  async function selectQuickAccessUser(user: QuickAccessUser) {
    await handleUserSelect({
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
    });
  }

  // Role options
  const roles: {
    value: UserRole;
    label: string;
    color: string;
    icon: string;
  }[] = [
    { value: "admin", label: "Admin", color: "#fbbf24", icon: "fa-crown" },
    { value: "tester", label: "Tester", color: "#8b5cf6", icon: "fa-flask" },
    { value: "premium", label: "Premium", color: "#3b82f6", icon: "fa-star" },
    { value: "user", label: "User", color: "#64748b", icon: "fa-user" },
  ];

  function togglePanel() {
    roleSwitcherState.toggle();
  }

  function setRole(role: UserRole) {
    if (role === actualRole) {
      // Clear override if selecting actual role
      featureFlagService.clearDebugRoleOverride();
    } else {
      featureFlagService.setDebugRoleOverride(role);
    }
  }

  function clearOverride() {
    featureFlagService.clearDebugRoleOverride();
  }

  async function handleUserSelect(user: {
    uid: string;
    displayName: string;
    email: string;
  }) {
    // Use eager=true to load all data upfront (for banner stats and Library view)
    await loadUserPreview(user.uid, true);

    // Also set the role override to match the previewed user's role
    // This ensures module access matches what the user would see
    const previewedRole = userPreviewState.data.profile?.role as
      | UserRole
      | undefined;
    if (previewedRole) {
      featureFlagService.setDebugRoleOverride(previewedRole);
    }
  }

  function handleClearPreview() {
    clearUserPreview();
    // Also clear the role override when clearing preview
    featureFlagService.clearDebugRoleOverride();
  }

  // F9 keyboard shortcut is now handled by the formal keyboard shortcut system
  // See: register-global-shortcuts.ts → admin.role-switcher

  onMount(() => {
    quickAccessUsers = loadQuickAccessUsers();
  });
</script>

<!-- Only show for admins -->
{#if isAdmin}
  <!-- Note: Role override indicator now handled by PreviewModeBanner -->

  <!-- Debug panel -->
  {#if isOpen}
    <button
      type="button"
      class="debug-panel-backdrop"
      onclick={togglePanel}
      aria-label="Close debug panel"
    ></button>
    <div class="debug-panel">
      <div class="panel-header">
        <div class="panel-title">
          <i class="fas fa-bug"></i>
          <span>Role Switcher</span>
        </div>
        <button class="close-btn" onclick={togglePanel} aria-label="Close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="panel-content">
        <div class="two-column-layout">
          <!-- Left Column: Role Switching -->
          <div class="left-column">
            <div class="info-section">
              <div class="info-row">
                <span class="info-label">Your Role:</span>
                <span class="info-value actual">{actualRole}</span>
              </div>
              {#if debugOverride}
                <div class="info-row">
                  <span class="info-label">Viewing As:</span>
                  <span class="info-value override">{effectiveRole}</span>
                </div>
              {/if}
            </div>

            <div class="roles-section">
              <p class="section-label">Switch to:</p>
              <div class="roles-grid">
                {#each roles as role}
                  <button
                    class="role-btn"
                    class:active={effectiveRole === role.value}
                    class:actual={actualRole === role.value}
                    style="--role-color: {role.color}"
                    onclick={() => setRole(role.value)}
                  >
                    <i class="fas {role.icon}"></i>
                    <span>{role.label}</span>
                    {#if actualRole === role.value}
                      <span class="badge">You</span>
                    {/if}
                  </button>
                {/each}
              </div>
            </div>

            {#if debugOverride}
              <button class="reset-btn" onclick={clearOverride}>
                <i class="fas fa-undo"></i>
                Reset to Actual Role
              </button>
            {/if}

            <!-- Quick Access Users -->
            {#if quickAccessUsers.length > 0}
              <div class="quick-access-section">
                <p class="section-label">Quick Access:</p>
                <div class="quick-access-chips">
                  {#each quickAccessUsers as user (user.uid)}
                    <div
                      class="quick-access-chip"
                      class:active={previewProfile?.uid === user.uid}
                    >
                      <button
                        type="button"
                        class="chip-select"
                        onclick={() => selectQuickAccessUser(user)}
                        title={user.email}
                      >
                        {#if user.photoURL}
                          <img src={user.photoURL} alt="" class="chip-avatar" />
                        {:else}
                          <span class="chip-avatar-placeholder">
                            <i class="fas fa-user"></i>
                          </span>
                        {/if}
                        <span class="chip-name">{user.displayName}</span>
                      </button>
                      <button
                        type="button"
                        class="chip-remove"
                        onclick={() => removeFromQuickAccess(user.uid)}
                        aria-label="Remove from quick access"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>

          <!-- Right Column: User Preview -->
          <div class="right-column">
            <div class="preview-section">
              <div class="preview-header">
                <div class="panel-title">
                  <i class="fas fa-eye"></i>
                  <span>Preview User</span>
                </div>
                {#if isPreview && previewProfile}
                  <span class="preview-pill">
                    {previewProfile.displayName ||
                      previewProfile.email ||
                      previewProfile.uid}
                  </span>
                {/if}
              </div>

              <UserSearchInput
                onSelect={handleUserSelect}
                selectedUserId={previewProfile?.uid || ""}
                selectedUserDisplay={previewProfile?.displayName ||
                  previewProfile?.email ||
                  ""}
                placeholder="Search users..."
                disabled={userPreviewState.isLoading}
                inlineResults={true}
              />

              {#if userPreviewState.isLoading}
                <div class="loading-state">
                  <i class="fas fa-spinner fa-spin"></i>
                  <span>Loading...</span>
                </div>
              {/if}

              {#if isPreview && previewProfile}
                <div class="preview-user-card">
                  {#if previewProfile.photoURL}
                    <img
                      src={previewProfile.photoURL}
                      alt=""
                      class="preview-avatar"
                    />
                  {:else}
                    <div class="preview-avatar-placeholder">
                      <i class="fas fa-user"></i>
                    </div>
                  {/if}
                  <div class="preview-user-info">
                    <span class="preview-name"
                      >{previewProfile.displayName || "No name"}</span
                    >
                    <span class="preview-email">{previewProfile.email}</span>
                    <span class="preview-role"
                      >{previewProfile.role || "user"}</span
                    >
                  </div>
                </div>

                <div class="preview-stats">
                  {#if userPreviewState.data.gamification}
                    <div class="stat-item">
                      <i class="fas fa-star"></i>
                      <span
                        >{userPreviewState.data.gamification.totalXP} XP</span
                      >
                    </div>
                    <div class="stat-item">
                      <i class="fas fa-trophy"></i>
                      <span
                        >Lvl {userPreviewState.data.gamification
                          .currentLevel}</span
                      >
                    </div>
                  {/if}
                  <div class="stat-item">
                    <i class="fas fa-layer-group"></i>
                    <span>{userPreviewState.data.sequences.length} seq</span>
                  </div>
                  <div class="stat-item">
                    <i class="fas fa-medal"></i>
                    <span>{userPreviewState.data.achievements.length} ach</span>
                  </div>
                </div>
              {/if}

              <div class="preview-actions">
                <button
                  type="button"
                  class="ghost"
                  onclick={handleClearPreview}
                  disabled={!isPreview}
                >
                  <i class="fas fa-times"></i>
                  Clear
                </button>
                {#if isPreview && previewProfile}
                  {#if isCurrentUserInQuickAccess}
                    <button
                      type="button"
                      class="ghost remove-quick"
                      onclick={() => removeFromQuickAccess(previewProfile.uid)}
                    >
                      <i class="fas fa-bookmark"></i>
                      Remove
                    </button>
                  {:else}
                    <button
                      type="button"
                      class="ghost add-quick"
                      onclick={addToQuickAccess}
                    >
                      <i class="far fa-bookmark"></i>
                      Save
                    </button>
                  {/if}
                {/if}
                {#if userPreviewState.error}
                  <span class="error-text">{userPreviewState.error}</span>
                {/if}
              </div>
            </div>
          </div>
        </div>

        <div class="hint">
          Press <kbd>F9</kbd> to toggle
        </div>
      </div>
    </div>
  {/if}
{/if}

<style>
  /* Debug Panel */
  .debug-panel-backdrop {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
  }

  .debug-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10001;
    width: 90%;
    max-width: 780px;
    background: linear-gradient(180deg, #1a1a2e 0%, #16162a 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
    overflow: hidden;
    container-type: inline-size;
    container-name: debug-panel;
  }

  /* Header */
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .panel-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    font-weight: 700;
    color: #fbbf24;
  }

  .close-btn {
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.2s;
    margin: -10px -12px -10px 0;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  /* Content */
  .panel-content {
    padding: 20px 24px 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Two-column layout - uses container queries */
  .two-column-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }

  @container debug-panel (min-width: 600px) {
    .two-column-layout {
      grid-template-columns: 1fr 1fr;
      gap: 28px;
    }
  }

  .left-column,
  .right-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .right-column .preview-section {
    margin-top: 0;
    padding: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.02);
  }

  /* Info Section */
  .info-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 14px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 10px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .info-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
  }

  .info-value {
    font-size: 12px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 6px;
    text-transform: capitalize;
  }

  .info-value.actual {
    color: #10b981;
    background: rgba(16, 185, 129, 0.15);
  }

  .info-value.override {
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.15);
  }

  /* Roles Section */
  .roles-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .section-label {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }

  .roles-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .role-btn {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 52px;
    padding: 12px 10px;
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    color: white;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .role-btn i {
    font-size: 18px;
    color: var(--role-color);
    opacity: 0.8;
  }

  .role-btn:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: var(--role-color);
    transform: translateY(-2px);
  }

  .role-btn.active {
    background: var(--role-color);
    background: linear-gradient(
      135deg,
      var(--role-color) 0%,
      color-mix(in srgb, var(--role-color) 80%, black) 100%
    );
    border-color: var(--role-color);
    box-shadow: 0 4px 12px
      color-mix(in srgb, var(--role-color) 40%, transparent);
  }

  .role-btn.active i {
    color: white;
    opacity: 1;
  }

  .badge {
    position: absolute;
    top: 6px;
    right: 6px;
    padding: 2px 6px;
    background: rgba(16, 185, 129, 0.2);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    color: #10b981;
    text-transform: uppercase;
  }

  /* Reset Button */
  .reset-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 52px;
    padding: 12px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    color: #ef4444;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .reset-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: #ef4444;
  }

  /* Hint */
  .hint {
    text-align: center;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
  }

  kbd {
    padding: 2px 6px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    font-family: monospace;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.7);
  }

  .preview-section {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .preview-pill {
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(59, 130, 246, 0.15);
    color: #bfdbfe;
    font-size: 12px;
    border: 1px solid rgba(59, 130, 246, 0.3);
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 16px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
  }

  .preview-user-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 10px;
  }

  .preview-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .preview-avatar-placeholder {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.5);
    font-size: 18px;
    flex-shrink: 0;
  }

  .preview-user-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }

  .preview-name {
    font-size: 15px;
    font-weight: 600;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .preview-email {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .preview-role {
    font-size: 11px;
    font-weight: 600;
    color: #60a5fa;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .preview-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
  }

  .stat-item i {
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
    width: 16px;
    text-align: center;
  }

  .preview-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .preview-actions .ghost {
    display: flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.8);
    border-radius: 8px;
    min-height: 52px;
    padding: 12px 16px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s;
  }

  .preview-actions .ghost:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .preview-actions .ghost:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error-text {
    color: #f87171;
    font-size: 12px;
  }

  /* Quick Access Section */
  .quick-access-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .quick-access-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .quick-access-chip {
    display: flex;
    align-items: center;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.25);
    border-radius: 999px;
    min-height: 52px;
    transition: all 0.2s;
  }

  .quick-access-chip:hover {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.4);
  }

  .quick-access-chip.active {
    background: rgba(59, 130, 246, 0.3);
    border-color: #3b82f6;
  }

  .chip-select {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 8px 10px 14px;
    background: transparent;
    border: none;
    color: #bfdbfe;
    font-size: 14px;
    cursor: pointer;
    min-height: 52px;
  }

  .chip-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .chip-avatar-placeholder {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
    flex-shrink: 0;
  }

  .chip-name {
    max-width: 120px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chip-remove {
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.4);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    margin-right: -4px;
  }

  .chip-remove:hover {
    background: rgba(239, 68, 68, 0.3);
    color: #f87171;
  }

  /* Quick access button variants */
  .preview-actions .add-quick {
    color: #60a5fa;
    border-color: rgba(59, 130, 246, 0.3);
  }

  .preview-actions .add-quick:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.5);
  }

  .preview-actions .remove-quick {
    color: #fbbf24;
    border-color: rgba(251, 191, 36, 0.3);
  }

  .preview-actions .remove-quick:hover:not(:disabled) {
    background: rgba(251, 191, 36, 0.1);
    border-color: rgba(251, 191, 36, 0.5);
  }
</style>
