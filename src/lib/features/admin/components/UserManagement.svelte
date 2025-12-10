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
  import type { UserRole } from "$lib/shared/auth/domain/models/UserRole";
  import AdminTwoPanelLayout from "$lib/shared/admin/components/AdminTwoPanelLayout.svelte";
  import { userManagementService } from "../services/implementations/UserManagementService";
  import { di } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { ISystemStateService } from "../services/contracts/ISystemStateService";
  import UserCard from "./user-management/UserCard.svelte";
  import UserDetailPanel from "./user-management/UserDetailPanel.svelte";
  import ConfirmActionModal from "./user-management/ConfirmActionModal.svelte";
  import UserSearchBar from "./user-management/UserSearchBar.svelte";
  import UserFilterButtons from "./user-management/UserFilterButtons.svelte";
  import type {
    UserData,
    UserFilterType,
    ConfirmActionData,
    UserActionType,
  } from "./user-management/types";

  interface UserRelationalContext {
    challengeCount: number;
    announcementCount: number;
  }

  const systemStateService = di.get<ISystemStateService>(TYPES.ISystemStateService);

  // State
  let users = $state<UserData[]>([]);
  let isLoading = $state(true);
  let searchQuery = $state("");
  let filterBy = $state<UserFilterType>("all");
  let selectedUser = $state<UserData | null>(null);
  let userContext = $state<UserRelationalContext | null>(null);
  let isActionPending = $state(false);
  let actionError = $state<string | null>(null);
  let lastDocId = $state<string | null>(null);
  let hasMore = $state(true);
  let confirmAction = $state<ConfirmActionData | null>(null);

  const PAGE_SIZE = 20;

  // Load users from Firestore
  async function loadUsers(append = false) {
    if (!append) {
      isLoading = true;
      lastDocId = null;
    }

    try {
      const result = await userManagementService.loadUsers(
        PAGE_SIZE,
        append ? (lastDocId ?? undefined) : undefined
      );

      if (append) {
        users = [...users, ...result.users];
      } else {
        users = result.users;
      }

      lastDocId = result.lastDocId;
      hasMore = result.hasMore;
    } catch (error) {
      console.error("Failed to load users:", error);
      actionError = "Failed to load users. Please try again.";
    } finally {
      isLoading = false;
    }
  }

  // Load relational context for selected user
  async function loadUserContext(userId: string) {
    try {
      const systemState = await systemStateService.getSystemState();

      // Count challenges (all challenges for now - in future can be more specific)
      const userChallenges = systemState.challenges;

      // Count announcements targeting this user
      const userAnnouncements = systemState.announcements.filter(a => {
        const allUsers = a.audiences.includes("all");
        const specificUser = a.audiences.includes(`user:${userId}`);
        return allUsers || specificUser;
      });

      userContext = {
        challengeCount: userChallenges.length,
        announcementCount: userAnnouncements.length,
      };
    } catch (error) {
      console.error("Failed to load user context:", error);
      userContext = null;
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
      await userManagementService.changeRole(user.id, newRole);

      // Update local state
      users = users.map((u) =>
        u.id === user.id
          ? { ...u, role: newRole, isAdmin: newRole === "admin" }
          : u
      );

      if (selectedUser?.id === user.id) {
        selectedUser = {
          ...selectedUser,
          role: newRole,
          isAdmin: newRole === "admin",
        };
      }
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
      await userManagementService.toggleDisabled(
        user.id,
        user.isDisabled ?? false
      );

      // Update local state
      users = users.map((u) =>
        u.id === user.id ? { ...u, isDisabled: !u.isDisabled } : u
      );

      if (selectedUser?.id === user.id) {
        selectedUser = {
          ...selectedUser,
          isDisabled: !selectedUser.isDisabled,
        };
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
      await userManagementService.resetUserData(user.id);

      // Update local state
      users = users.map((u) =>
        u.id === user.id
          ? {
              ...u,
              totalXP: 0,
              currentLevel: 1,
              achievementCount: 0,
              currentStreak: 0,
            }
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
      await userManagementService.deleteUser(user.id);

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

  // Handle role change request from detail panel
  function handleRoleChangeRequest(newRole: UserRole) {
    if (selectedUser) {
      confirmAction = { type: "changeRole", user: selectedUser, newRole };
    }
  }

  // Handle action request from detail panel
  function handleActionRequest(type: UserActionType) {
    if (selectedUser) {
      confirmAction = { type, user: selectedUser };
    }
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
      <UserSearchBar value={searchQuery} onchange={(v) => (searchQuery = v)} />
      <UserFilterButtons value={filterBy} onchange={(v) => (filterBy = v)} />
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
              <UserCard
                {user}
                isSelected={selectedUser?.id === user.id}
                onclick={() => (selectedUser = user)}
              />
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
          <UserDetailPanel
            user={selectedUser}
            {isActionPending}
            onRoleChange={handleRoleChangeRequest}
            onAction={handleActionRequest}
          />
        {/if}
      {/snippet}
    </AdminTwoPanelLayout>
  </div>

  <!-- Confirmation Modal -->
  {#if confirmAction}
    <ConfirmActionModal
      action={confirmAction}
      {isActionPending}
      onConfirm={handleConfirmedAction}
      onCancel={() => (confirmAction = null)}
    />
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
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 452px), 1fr));
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
    padding: 52px;
    color: rgba(255, 255, 255, 0.5);
    gap: 12px;
  }

  .loading-state i,
  .empty-state i {
    font-size: 32px;
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

  /* Responsive */
  @media (max-width: 768px) {
    .controls {
      flex-direction: column;
    }
  }
</style>
