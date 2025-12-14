<!-- ActiveUsersPanel.svelte - Admin view of all users with presence and activity -->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IUserActivityService } from "../services/contracts/IUserActivityService";
  import type { UserPresenceWithId } from "$lib/shared/presence/domain/models/presence-models";
  import UserPresenceCard from "./active-users/UserPresenceCard.svelte";
  import UserActivityDetail from "./active-users/UserActivityDetail.svelte";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";

  // Services
  let userActivityService: IUserActivityService | null = null;

  // State
  let users = $state<UserPresenceWithId[]>([]);
  let selectedUserId = $state<string | null>(null);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let drawerOpen = $state(false);

  // Responsive layout
  let isMobile = $state(false);
  const drawerPlacement = $derived(isMobile ? "bottom" : "right");

  // Stats
  let onlineCount = $state(0);
  let totalUsers = $state(0);

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
      userActivityService = resolve<IUserActivityService>(TYPES.IUserActivityService);

      // Subscribe to real-time presence updates
      unsubscribe = userActivityService.subscribeToAllPresence((presenceUsers) => {
        users = presenceUsers;
        onlineCount = presenceUsers.filter((u) => u.online).length;
        totalUsers = presenceUsers.length;
        isLoading = false;
      });
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

  function formatLastSeen(timestamp: number): string {
    if (!timestamp) return "Never";

    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  }
</script>

<div class="active-users-panel">
  <header class="panel-header">
    <div class="header-content">
      <h2>Active Users</h2>
      <p class="subtitle">Real-time user presence and activity monitoring</p>
    </div>
    <div class="stats-row">
      <div class="stat">
        <span class="stat-value online">{onlineCount}</span>
        <span class="stat-label">Online</span>
      </div>
      <div class="stat">
        <span class="stat-value">{totalUsers}</span>
        <span class="stat-label">Total</span>
      </div>
    </div>
  </header>

  <div class="panel-content">
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
    {:else}
      <div class="users-list">
        {#each users as user}
          <UserPresenceCard
            {user}
            isSelected={selectedUserId === user.userId && drawerOpen}
            onSelect={() => selectUser(user.userId)}
            {formatLastSeen}
          />
        {/each}
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
    gap: 1.5rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--theme-text, #fff);
  }

  .stat-value.online {
    color: var(--semantic-success, #22c55e);
  }

  .stat-label {
    font-size: 0.75rem;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.6));
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .panel-content {
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

  .users-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
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
