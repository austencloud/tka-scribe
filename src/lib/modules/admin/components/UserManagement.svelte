<script lang="ts">
  /**
   * UserManagement
   * Full user management capabilities for admin users
   *
   * Features:
   * - Browse and search users
   * - View user profiles
   * - Grant/revoke admin status
   * - Disable/enable accounts
   * - Reset user data
   */
  import { onMount } from "svelte";
  import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    writeBatch,
    where,
    startAfter,
    type DocumentData,
    type QueryDocumentSnapshot,
  } from "firebase/firestore";
  import { firestore } from "$shared/auth/firebase";
  import { AdminTwoPanelLayout, AdminModal } from "$shared/admin";

  import {
    type UserRole,
    ROLE_DISPLAY,
    ROLE_HIERARCHY,
  } from "$shared/auth/domain/models/UserRole";

  // Types
  interface UserData {
    id: string;
    email: string;
    displayName: string;
    username: string;
    photoURL: string | null;
    role: UserRole;
    isAdmin: boolean; // Kept for backwards compatibility
    isDisabled?: boolean;
    createdAt: Date | null;
    updatedAt: Date | null;
    // Stats
    sequenceCount: number;
    totalXP: number;
    currentLevel: number;
    achievementCount: number;
    currentStreak: number;
  }

  type ActionType = "changeRole" | "toggleDisabled" | "resetData" | "delete";

  // State
  let users = $state<UserData[]>([]);
  let isLoading = $state(true);
  let searchQuery = $state("");
  let filterBy = $state<"all" | "admins" | "testers" | "premium" | "disabled">("all");
  let selectedUser = $state<UserData | null>(null);
  let isActionPending = $state(false);
  let actionError = $state<string | null>(null);
  let lastDoc = $state<QueryDocumentSnapshot<DocumentData> | null>(null);
  let hasMore = $state(true);
  let confirmAction = $state<{ type: ActionType; user: UserData; newRole?: UserRole } | null>(null);
  let pendingRoleChange = $state<UserRole | null>(null);

  const PAGE_SIZE = 20;

  // Load users from Firestore
  async function loadUsers(append = false) {
    if (!append) {
      isLoading = true;
      lastDoc = null;
    }

    try {
      let q = query(
        collection(firestore, "users"),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE)
      );

      if (append && lastDoc) {
        q = query(
          collection(firestore, "users"),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        );
      }

      const snapshot = await getDocs(q);
      const newUsers: UserData[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        // Determine role - use new role field if exists, fallback to isAdmin check
        let role: UserRole = "user";
        if (data["role"]) {
          role = data["role"] as UserRole;
        } else if (data["isAdmin"] === true) {
          role = "admin";
        }

        return {
          id: doc.id,
          email: data["email"] || "",
          displayName: data["displayName"] || "Unknown User",
          username: data["username"] || "",
          photoURL: data["photoURL"] || null,
          role,
          isAdmin: role === "admin",
          isDisabled: data["isDisabled"] === true,
          createdAt: data["createdAt"]?.toDate() || null,
          updatedAt: data["updatedAt"]?.toDate() || null,
          sequenceCount: data["sequenceCount"] || 0,
          totalXP: data["totalXP"] || 0,
          currentLevel: data["currentLevel"] || 1,
          achievementCount: data["achievementCount"] || 0,
          currentStreak: data["currentStreak"] || 0,
        };
      });

      if (append) {
        users = [...users, ...newUsers];
      } else {
        users = newUsers;
      }

      lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
      hasMore = snapshot.docs.length === PAGE_SIZE;
    } catch (error) {
      console.error("Failed to load users:", error);
      actionError = "Failed to load users. Please try again.";
    } finally {
      isLoading = false;
    }
  }

  // Filter users based on search and filter
  const filteredUsers = $derived(() => {
    let result = users;

    // Apply filter
    if (filterBy === "admins") {
      result = result.filter((u) => u.role === "admin");
    } else if (filterBy === "testers") {
      result = result.filter((u) => u.role === "tester");
    } else if (filterBy === "premium") {
      result = result.filter((u) => u.role === "premium");
    } else if (filterBy === "disabled") {
      result = result.filter((u) => u.isDisabled);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.displayName.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.username.toLowerCase().includes(query)
      );
    }

    return result;
  });

  // Change user role
  async function changeRole(user: UserData, newRole: UserRole) {
    isActionPending = true;
    actionError = null;

    try {
      const userRef = doc(firestore, "users", user.id);
      await updateDoc(userRef, {
        role: newRole,
        // Keep isAdmin in sync for backwards compatibility
        isAdmin: newRole === "admin",
      });

      // Update local state
      users = users.map((u) =>
        u.id === user.id ? { ...u, role: newRole, isAdmin: newRole === "admin" } : u
      );

      if (selectedUser?.id === user.id) {
        selectedUser = { ...selectedUser, role: newRole, isAdmin: newRole === "admin" };
      }

      pendingRoleChange = null;
    } catch (error) {
      console.error("Failed to change role:", error);
      actionError = "Failed to update user role.";
    } finally {
      isActionPending = false;
      confirmAction = null;
    }
  }

  // Toggle disabled status
  async function toggleDisabled(user: UserData) {
    isActionPending = true;
    actionError = null;

    try {
      const userRef = doc(firestore, "users", user.id);
      await updateDoc(userRef, {
        isDisabled: !user.isDisabled,
      });

      // Update local state
      users = users.map((u) =>
        u.id === user.id ? { ...u, isDisabled: !u.isDisabled } : u
      );

      if (selectedUser?.id === user.id) {
        selectedUser = { ...selectedUser, isDisabled: !selectedUser.isDisabled };
      }
    } catch (error) {
      console.error("Failed to toggle disabled:", error);
      actionError = "Failed to update account status.";
    } finally {
      isActionPending = false;
      confirmAction = null;
    }
  }

  // Reset user data (XP, achievements, streaks)
  async function resetUserData(user: UserData) {
    isActionPending = true;
    actionError = null;

    try {
      const batch = writeBatch(firestore);

      // Reset user stats
      const userRef = doc(firestore, "users", user.id);
      batch.update(userRef, {
        totalXP: 0,
        currentLevel: 1,
        achievementCount: 0,
        currentStreak: 0,
        longestStreak: 0,
      });

      // Delete XP document
      const xpRef = doc(firestore, `users/${user.id}/xp/current`);
      batch.delete(xpRef);

      // Delete streak document
      const streakRef = doc(firestore, `users/${user.id}/streak/current`);
      batch.delete(streakRef);

      await batch.commit();

      // Update local state
      users = users.map((u) =>
        u.id === user.id
          ? { ...u, totalXP: 0, currentLevel: 1, achievementCount: 0, currentStreak: 0 }
          : u
      );

      if (selectedUser?.id === user.id) {
        selectedUser = {
          ...selectedUser,
          totalXP: 0,
          currentLevel: 1,
          achievementCount: 0,
          currentStreak: 0,
        };
      }
    } catch (error) {
      console.error("Failed to reset user data:", error);
      actionError = "Failed to reset user data.";
    } finally {
      isActionPending = false;
      confirmAction = null;
    }
  }

  // Delete user (careful!)
  async function deleteUser(user: UserData) {
    isActionPending = true;
    actionError = null;

    try {
      // Just delete the Firestore document
      // Note: This doesn't delete the Firebase Auth user
      await deleteDoc(doc(firestore, "users", user.id));

      // Update local state
      users = users.filter((u) => u.id !== user.id);

      if (selectedUser?.id === user.id) {
        selectedUser = null;
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      actionError = "Failed to delete user.";
    } finally {
      isActionPending = false;
      confirmAction = null;
    }
  }

  // Handle action confirmation
  function handleConfirmedAction() {
    if (!confirmAction) return;

    switch (confirmAction.type) {
      case "changeRole":
        if (confirmAction.newRole) {
          changeRole(confirmAction.user, confirmAction.newRole);
        }
        break;
      case "toggleDisabled":
        toggleDisabled(confirmAction.user);
        break;
      case "resetData":
        resetUserData(confirmAction.user);
        break;
      case "delete":
        deleteUser(confirmAction.user);
        break;
    }
  }

  // Get role badge color
  function getRoleColor(role: UserRole): string {
    return ROLE_DISPLAY[role].color;
  }

  // Get role icon
  function getRoleIcon(role: UserRole): string {
    return ROLE_DISPLAY[role].icon;
  }

  function formatDate(date: Date | null): string {
    if (!date) return "Unknown";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  onMount(() => {
    loadUsers();
  });
</script>

<div class="user-management">
  <!-- Header with search and filters -->
  <header class="management-header">
    <h2>User Management</h2>
    <div class="controls">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          placeholder="Search users..."
          bind:value={searchQuery}
        />
      </div>
      <div class="filter-buttons">
        <button
          class:active={filterBy === "all"}
          onclick={() => (filterBy = "all")}
        >
          All
        </button>
        <button
          class:active={filterBy === "admins"}
          onclick={() => (filterBy = "admins")}
        >
          <i class="fas fa-shield-halved"></i> Admins
        </button>
        <button
          class:active={filterBy === "testers"}
          onclick={() => (filterBy = "testers")}
        >
          <i class="fas fa-flask"></i> Testers
        </button>
        <button
          class:active={filterBy === "premium"}
          onclick={() => (filterBy = "premium")}
        >
          <i class="fas fa-crown"></i> Premium
        </button>
        <button
          class:active={filterBy === "disabled"}
          onclick={() => (filterBy = "disabled")}
        >
          <i class="fas fa-ban"></i> Disabled
        </button>
      </div>
    </div>
  </header>

  {#if actionError}
    <div class="error-banner">
      <i class="fas fa-exclamation-triangle"></i>
      {actionError}
      <button onclick={() => (actionError = null)} aria-label="Dismiss error">
        <i class="fas fa-times"></i>
      </button>
    </div>
  {/if}

  <div class="content-area">
    <AdminTwoPanelLayout
      hasSelection={selectedUser !== null}
      onClose={() => (selectedUser = null)}
    >
      {#snippet list()}
        <!-- User List -->
        <div class="user-list">
          {#if isLoading}
            <div class="loading-state">
              <i class="fas fa-spinner fa-spin"></i>
              <p>Loading users...</p>
            </div>
          {:else if filteredUsers().length === 0}
            <div class="empty-state">
              <i class="fas fa-users-slash"></i>
              <p>No users found</p>
            </div>
          {:else}
            {#each filteredUsers() as user}
              <button
                class="user-card"
                class:selected={selectedUser?.id === user.id}
                class:disabled={user.isDisabled}
                onclick={() => (selectedUser = user)}
              >
                <div class="user-avatar">
                  {#if user.photoURL}
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      crossorigin="anonymous"
                      referrerpolicy="no-referrer"
                    />
                  {:else}
                    <span class="initials">{getInitials(user.displayName)}</span>
                  {/if}
                  {#if user.role !== "user"}
                    <span class="role-badge" title={ROLE_DISPLAY[user.role].label} style="background: {getRoleColor(user.role)}">
                      <i class="fas {getRoleIcon(user.role)}"></i>
                    </span>
                  {/if}
                </div>
                <div class="user-info">
                  <span class="user-name">{user.displayName}</span>
                  <span class="user-email">{user.email}</span>
                </div>
                <div class="user-stats">
                  <span title="Level">Lv.{user.currentLevel}</span>
                  <span title="XP">{user.totalXP.toLocaleString()} XP</span>
                </div>
              </button>
            {/each}

            {#if hasMore}
              <button class="load-more" onclick={() => loadUsers(true)}>
                Load More
              </button>
            {/if}
          {/if}
        </div>
      {/snippet}

      {#snippet detail()}
        <!-- User Detail Panel -->
        {#if selectedUser}
          <div class="user-detail">
            <header class="detail-header">
              <div class="detail-avatar">
                {#if selectedUser.photoURL}
                  <img
                    src={selectedUser.photoURL}
                    alt={selectedUser.displayName}
                    crossorigin="anonymous"
                    referrerpolicy="no-referrer"
                  />
                {:else}
                  <span class="initials">{getInitials(selectedUser.displayName)}</span>
                {/if}
              </div>
              <h3>{selectedUser.displayName}</h3>
              <p class="detail-email">{selectedUser.email}</p>
              <div class="badges">
                <span class="badge role-{selectedUser.role}" style="background: {getRoleColor(selectedUser.role)}20; color: {getRoleColor(selectedUser.role)}; border: 1px solid {getRoleColor(selectedUser.role)}40">
                  <i class="fas {getRoleIcon(selectedUser.role)}"></i> {ROLE_DISPLAY[selectedUser.role].label}
                </span>
                {#if selectedUser.isDisabled}
                  <span class="badge disabled">
                    <i class="fas fa-ban"></i> Disabled
                  </span>
                {/if}
              </div>
            </header>

            <div class="detail-content">
              <section class="detail-section">
                <h4>Account Info</h4>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">User ID</span>
                    <span class="info-value mono">{selectedUser.id}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Username</span>
                    <span class="info-value">@{selectedUser.username}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Joined</span>
                    <span class="info-value">{formatDate(selectedUser.createdAt)}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Last Updated</span>
                    <span class="info-value">{formatDate(selectedUser.updatedAt)}</span>
                  </div>
                </div>
              </section>

              <section class="detail-section">
                <h4>Statistics</h4>
                <div class="stats-grid">
                  <div class="stat-card">
                    <i class="fas fa-layer-group"></i>
                    <span class="stat-value">{selectedUser.sequenceCount}</span>
                    <span class="stat-label">Sequences</span>
                  </div>
                  <div class="stat-card">
                    <i class="fas fa-star"></i>
                    <span class="stat-value">{selectedUser.totalXP.toLocaleString()}</span>
                    <span class="stat-label">Total XP</span>
                  </div>
                  <div class="stat-card">
                    <i class="fas fa-chart-line"></i>
                    <span class="stat-value">{selectedUser.currentLevel}</span>
                    <span class="stat-label">Level</span>
                  </div>
                  <div class="stat-card">
                    <i class="fas fa-trophy"></i>
                    <span class="stat-value">{selectedUser.achievementCount}</span>
                    <span class="stat-label">Achievements</span>
                  </div>
                  <div class="stat-card">
                    <i class="fas fa-fire"></i>
                    <span class="stat-value">{selectedUser.currentStreak}</span>
                    <span class="stat-label">Day Streak</span>
                  </div>
                </div>
              </section>

              <section class="detail-section actions">
                <h4>Role Management</h4>
                <div class="role-selector">
                  {#each ROLE_HIERARCHY as role}
                    <button
                      class="role-option"
                      class:selected={selectedUser.role === role}
                      style="--role-color: {ROLE_DISPLAY[role].color}"
                      onclick={() => {
                        if (selectedUser!.role !== role) {
                          confirmAction = { type: "changeRole", user: selectedUser!, newRole: role };
                        }
                      }}
                      disabled={isActionPending || selectedUser.role === role}
                    >
                      <i class="fas {ROLE_DISPLAY[role].icon}"></i>
                      <span>{ROLE_DISPLAY[role].label}</span>
                    </button>
                  {/each}
                </div>
              </section>

              <section class="detail-section actions">
                <h4>Account Actions</h4>
                <div class="action-buttons">
                  <button
                    class="action-btn warning"
                    class:active={selectedUser.isDisabled}
                    onclick={() =>
                      (confirmAction = { type: "toggleDisabled", user: selectedUser! })}
                    disabled={isActionPending}
                  >
                    <i class="fas fa-ban"></i>
                    {selectedUser.isDisabled ? "Enable Account" : "Disable Account"}
                  </button>

                  <button
                    class="action-btn warning"
                    onclick={() =>
                      (confirmAction = { type: "resetData", user: selectedUser! })}
                    disabled={isActionPending}
                  >
                    <i class="fas fa-eraser"></i>
                    Reset Progress
                  </button>

                  <button
                    class="action-btn danger"
                    onclick={() =>
                      (confirmAction = { type: "delete", user: selectedUser! })}
                    disabled={isActionPending}
                  >
                    <i class="fas fa-trash"></i>
                    Delete User
                  </button>
                </div>
              </section>
            </div>
          </div>
        {/if}
      {/snippet}
    </AdminTwoPanelLayout>
  </div>

  <!-- Confirmation Modal -->
  {#if confirmAction}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-overlay" onclick={() => (confirmAction = null)} onkeydown={(e) => e.key === 'Escape' && (confirmAction = null)}>
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="modal" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
        <h3>Confirm Action</h3>
        <p>
          {#if confirmAction.type === "changeRole"}
            Change {confirmAction.user.displayName}'s role from <strong>{ROLE_DISPLAY[confirmAction.user.role].label}</strong> to <strong>{ROLE_DISPLAY[confirmAction.newRole ?? "user"].label}</strong>?
          {:else if confirmAction.type === "toggleDisabled"}
            {confirmAction.user.isDisabled
              ? `Enable the account for ${confirmAction.user.displayName}?`
              : `Disable the account for ${confirmAction.user.displayName}? They won't be able to sign in.`}
          {:else if confirmAction.type === "resetData"}
            Reset all progress for {confirmAction.user.displayName}? This will clear their XP, level, achievements, and streaks. This cannot be undone.
          {:else if confirmAction.type === "delete"}
            Permanently delete {confirmAction.user.displayName}'s profile? This cannot be undone.
          {/if}
        </p>
        <div class="modal-actions">
          <button class="cancel-btn" onclick={() => (confirmAction = null)}>
            Cancel
          </button>
          <button
            class="confirm-btn"
            class:danger={confirmAction.type === "delete" ||
              confirmAction.type === "resetData"}
            onclick={handleConfirmedAction}
            disabled={isActionPending}
          >
            {#if isActionPending}
              <i class="fas fa-spinner fa-spin"></i>
            {:else}
              Confirm
            {/if}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .user-management {
    height: 100%;
    display: flex;
    flex-direction: column;
    color: rgba(255, 255, 255, 0.95);
  }

  /* Header */
  .management-header {
    padding: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .management-header h2 {
    margin: 0 0 16px 0;
    font-size: 24px;
    font-weight: 600;
  }

  .controls {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .search-box {
    flex: 1;
    min-width: 200px;
    max-width: 400px;
    position: relative;
  }

  .search-box i {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.4);
  }

  .search-box input {
    width: 100%;
    padding: 10px 12px 10px 36px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
    font-size: 14px;
  }

  .search-box input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .filter-buttons {
    display: flex;
    gap: 8px;
    background: rgba(255, 255, 255, 0.05);
    padding: 4px;
    border-radius: 8px;
  }

  .filter-buttons button {
    padding: 8px 16px;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
  }

  .filter-buttons button:hover {
    color: rgba(255, 255, 255, 0.9);
  }

  .filter-buttons button.active {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }

  /* Error Banner */
  .error-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: rgba(239, 68, 68, 0.1);
    border-bottom: 1px solid rgba(239, 68, 68, 0.2);
    color: #fca5a5;
    font-size: 14px;
  }

  .error-banner button {
    margin-left: auto;
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 4px;
  }

  /* Content Area */
  .content-area {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  /* User List */
  .user-list {
    height: 100%;
    overflow-y: auto;
    padding: 20px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 450px), 1fr));
    gap: 16px;
    align-content: start;
  }

  .loading-state,
  .empty-state {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px;
    color: rgba(255, 255, 255, 0.5);
    gap: 12px;
  }

  .loading-state i,
  .empty-state i {
    font-size: 32px;
  }

  .user-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    width: 100%;
    color: inherit;
  }

  .user-card:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .user-card.selected {
    background: rgba(59, 130, 246, 0.12);
    border-color: rgba(59, 130, 246, 0.4);
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
  }

  .user-card.disabled {
    opacity: 0.6;
  }

  .user-avatar {
    position: relative;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    overflow: visible;
    flex-shrink: 0;
  }

  .user-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .user-avatar .initials {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    font-weight: 600;
    font-size: 14px;
  }

  .role-badge {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    color: #000;
    border: 2px solid rgba(10, 10, 15, 0.9);
  }

  .user-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .user-name {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-email {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-stats {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    gap: 2px;
  }

  .load-more {
    grid-column: 1 / -1;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px dashed rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s;
  }

  .load-more:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  /* User Detail Panel */
  .user-detail {
    height: 100%;
    overflow-y: auto;
  }

  .detail-header {
    position: relative;
    padding: 24px 24px 20px;
    text-align: center;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.03) 0%,
      transparent 100%
    );
  }

  .detail-avatar {
    width: 80px;
    height: 80px;
    margin: 0 auto 16px;
    border-radius: 50%;
    overflow: hidden;
  }

  .detail-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .detail-avatar .initials {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    font-weight: 600;
    font-size: 28px;
  }

  .detail-header h3 {
    margin: 0 0 4px 0;
    font-size: 20px;
  }

  .detail-email {
    margin: 0 0 12px 0;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
  }

  .badges {
    display: flex;
    gap: 8px;
    justify-content: center;
  }

  .badge {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .badge.disabled {
    background: rgba(239, 68, 68, 0.2);
    color: #fca5a5;
  }

  /* Role Selector */
  .role-selector {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .role-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 16px 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
  }

  .role-option i {
    font-size: 20px;
    color: var(--role-color, rgba(255, 255, 255, 0.5));
    transition: all 0.2s;
  }

  .role-option:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--role-color);
  }

  .role-option:hover:not(:disabled) i {
    transform: scale(1.1);
  }

  .role-option.selected {
    background: color-mix(in srgb, var(--role-color) 15%, transparent);
    border-color: var(--role-color);
    color: white;
  }

  .role-option.selected i {
    color: var(--role-color);
  }

  .role-option:disabled {
    cursor: default;
  }

  .detail-content {
    padding: 0 24px 24px;
  }

  .detail-section {
    margin-bottom: 24px;
  }

  .detail-section h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .info-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .info-value {
    font-size: 14px;
  }

  .info-value.mono {
    font-family: monospace;
    font-size: 11px;
    word-break: break-all;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 12px;
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 8px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    gap: 6px;
  }

  .stat-card i {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.5);
  }

  .stat-card .stat-value {
    font-size: 18px;
    font-weight: 700;
  }

  .stat-card .stat-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
  }

  .action-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .action-btn.active {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.3);
  }

  .action-btn.warning:hover:not(:disabled) {
    background: rgba(245, 158, 11, 0.15);
    border-color: rgba(245, 158, 11, 0.3);
    color: #fbbf24;
  }

  .action-btn.danger:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.3);
    color: #fca5a5;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 24px;
  }

  .modal {
    background: #1a1a2e;
    border-radius: 16px;
    padding: 24px;
    max-width: 400px;
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .modal h3 {
    margin: 0 0 12px 0;
    font-size: 18px;
  }

  .modal p {
    margin: 0 0 24px 0;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.5;
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .cancel-btn,
  .confirm-btn {
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cancel-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: rgba(255, 255, 255, 0.8);
  }

  .cancel-btn:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .confirm-btn {
    background: #3b82f6;
    border: none;
    color: white;
  }

  .confirm-btn:hover:not(:disabled) {
    background: #2563eb;
  }

  .confirm-btn.danger {
    background: #ef4444;
  }

  .confirm-btn.danger:hover:not(:disabled) {
    background: #dc2626;
  }

  .confirm-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .controls {
      flex-direction: column;
    }

    .search-box {
      max-width: none;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }

    .filter-buttons {
      overflow-x: auto;
      scrollbar-width: none;
    }

    .filter-buttons::-webkit-scrollbar {
      display: none;
    }
  }
</style>
