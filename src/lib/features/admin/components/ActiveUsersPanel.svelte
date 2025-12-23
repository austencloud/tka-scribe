<!-- ActiveUsersPanel.svelte - Admin view of all users with activity-based presence -->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IUserActivityService } from "../services/contracts/IUserActivityService";
  import type { UserPresenceWithId } from "$lib/shared/presence/domain/models/presence-models";
  import UserPresenceCard from "./active-users/UserPresenceCard.svelte";
  import UserActivityDetail from "./active-users/UserActivityDetail.svelte";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import PanelGrid from "$lib/shared/components/panel/PanelGrid.svelte";

  // Services
  let userActivityService: IUserActivityService | null = null;

  // State
  let users = $state<UserPresenceWithId[]>([]);
  let selectedUserId = $state<string | null>(null);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let drawerOpen = $state(false);

  // Filter state: "all" | "active" | "inactive"
  let statusFilter = $state<"all" | "active" | "inactive">("all");

  // Responsive layout
  let isMobile = $state(false);
  const drawerPlacement = $derived(isMobile ? "bottom" : "right");

  // Stats computed from activity status
  let activeCount = $derived(
    users.filter((u) => u.activityStatus === "active").length
  );
  let inactiveCount = $derived(
    users.filter((u) => u.activityStatus !== "active").length
  );
  let totalUsers = $derived(users.length);

  // Filtered users based on status filter
  let filteredUsers = $derived(
    statusFilter === "all"
      ? users
      : statusFilter === "active"
        ? users.filter((u) => u.activityStatus === "active")
        : users.filter((u) => u.activityStatus !== "active")
  );

  // Unsubscribe function
  let unsubscribe: (() => void) | null = null;

  // Resize listener cleanup
  let resizeListener: (() => void) | null = null;

  onMount(async () => {
    // Check responsive layout
    const checkMobile = () => {
      isMobile = window.innerWidth < 768;
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    resizeListener = checkMobile;

    try {
      userActivityService = resolve<IUserActivityService>(
        TYPES.IUserActivityService
      );

      // Subscribe to real-time presence updates
      unsubscribe = userActivityService.subscribeToAllPresence(
        (presenceUsers) => {
          users = presenceUsers;
          isLoading = false;
        }
      );
    } catch (e) {
      console.error("Failed to initialize user activity service:", e);
      error = "Failed to load user data";
      isLoading = false;
    }
  });

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
    if (resizeListener) {
      window.removeEventListener("resize", resizeListener);
    }
  });

  function selectUser(userId: string) {
    if (selectedUserId === userId) {
      // Clicking same user - toggle drawer
      drawerOpen = !drawerOpen;
    } else {
      // Clicking different user - select and open
      selectedUserId = userId;
      drawerOpen = true;
    }
  }

  function closeDrawer() {
    drawerOpen = false;
  }

  function setFilter(filter: "all" | "active" | "inactive") {
    statusFilter = filter;
  }
</script>

<div class="active-users-panel">
  <header class="panel-header">
    <div class="header-content">
      <h2>Active Users</h2>
      <p class="subtitle">Real-time activity-based presence monitoring</p>
    </div>
    <div class="stats-row">
      <button
        class="stat-button"
        class:selected={statusFilter === "active"}
        onclick={() => setFilter(statusFilter === "active" ? "all" : "active")}
      >
        <span class="stat-value active">{activeCount}</span>
        <span class="stat-label">Active</span>
      </button>
      <button
        class="stat-button"
        class:selected={statusFilter === "inactive"}
        onclick={() =>
          setFilter(statusFilter === "inactive" ? "all" : "inactive")}
      >
        <span class="stat-value inactive">{inactiveCount}</span>
        <span class="stat-label">Inactive</span>
      </button>
    </div>
  </header>

  <!-- Filter indicator -->
  {#if statusFilter !== "all"}
    <div class="filter-bar">
      <span class="filter-label">
        Showing: <strong>{statusFilter}</strong> users ({filteredUsers.length})
      </span>
      <button class="clear-filter" onclick={() => setFilter("all")}>
        <i class="fas fa-times"></i>
        Show all
      </button>
    </div>
  {/if}

  <div class="active-users-body">
    {#if isLoading}
      <div class="loading">
        <div class="spinner"></div>
        <span>Loading users...</span>
      </div>
    {:else if error}
      <div class="error">
        <i class="fas fa-exclamation-circle"></i>
        <span>{error}</span>
      </div>
    {:else if users.length === 0}
      <div class="empty">
        <i class="fas fa-users"></i>
        <span>No users found</span>
        <p>Users will appear here when they sign in</p>
      </div>
    {:else if filteredUsers.length === 0}
      <div class="empty">
        <i class="fas fa-filter"></i>
        <span>No {statusFilter} users</span>
        <button class="link-button" onclick={() => setFilter("all")}>
          Show all users
        </button>
      </div>
    {:else}
      <div class="users-grid-container">
        <PanelGrid minCardWidth="200px" gap="16px">
          {#each filteredUsers as user}
            <UserPresenceCard
              {user}
              isSelected={selectedUserId === user.userId && drawerOpen}
              onSelect={() => selectUser(user.userId)}
            />
          {/each}
        </PanelGrid>
      </div>
    {/if}
  </div>

  <!-- User Activity Drawer -->
  <Drawer
    bind:isOpen={drawerOpen}
    placement={drawerPlacement}
    showHandle={true}
    class="user-activity-drawer"
    ariaLabel="User Activity"
  >
    {#if selectedUserId}
      <UserActivityDetail userId={selectedUserId} onClose={closeDrawer} />
    {/if}
  </Drawer>
</div>

<style>
  .active-users-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.2));
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 1.5rem;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    flex-shrink: 0;
  }

  .header-content h2 {
    margin: 0 0 0.25rem;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--theme-text, #fff);
  }

  .subtitle {
    margin: 0;
    font-size: 0.875rem;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.6));
  }

  .stats-row {
    display: flex;
    gap: 0.5rem;
  }

  .stat-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .stat-button:hover {
    background: var(--theme-hover, rgba(255, 255, 255, 0.08));
  }

  .stat-button.selected {
    background: var(--theme-accent-bg, rgba(99, 102, 241, 0.15));
    border-color: var(--theme-accent, #6366f1);
  }

  .stat-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--theme-text, #fff);
  }

  .stat-value.active {
    color: var(--semantic-success, #22c55e);
  }

  .stat-value.inactive {
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.5));
  }

  .stat-label {
    font-size: 0.7rem;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.6));
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .filter-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1.5rem;
    background: var(--theme-accent-bg, rgba(99, 102, 241, 0.1));
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .filter-label {
    font-size: 0.875rem;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.7));
  }

  .filter-label strong {
    color: var(--theme-accent, #6366f1);
    text-transform: capitalize;
  }

  .clear-filter {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.5rem;
    background: transparent;
    border: none;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.6));
    font-size: 0.75rem;
    cursor: pointer;
    transition: color 0.15s ease;
  }

  .clear-filter:hover {
    color: var(--theme-text, #fff);
  }

  .link-button {
    background: transparent;
    border: none;
    color: var(--theme-accent, #6366f1);
    font-size: 0.875rem;
    cursor: pointer;
    text-decoration: underline;
    padding: 0;
  }

  .link-button:hover {
    color: var(--theme-accent-hover, #818cf8);
  }

  .active-users-body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .loading,
  .error,
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    height: 100%;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.6));
    text-align: center;
  }

  .loading .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-top-color: var(--theme-accent, #6366f1);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error {
    color: var(--semantic-error, #ef4444);
  }

  .empty i,
  .error i {
    font-size: 2rem;
    opacity: 0.5;
  }

  .empty p {
    margin: 0;
    font-size: 0.875rem;
    opacity: 0.7;
  }

  .users-grid-container {
    padding: 1rem;
    overflow-y: auto;
    height: 100%;
  }

  /* Drawer styling */
  :global(.user-activity-drawer) {
    max-width: 450px;
    width: 100%;
  }

  :global(.user-activity-drawer[data-placement="bottom"]) {
    max-width: 100%;
    max-height: 80vh;
  }
</style>
