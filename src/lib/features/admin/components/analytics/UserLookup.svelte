<script lang="ts">
  /**
   * UserLookup.svelte
   *
   * Admin component for searching and viewing user details.
   * Uses SystemStateService cached data - no additional Firebase queries.
   */
  import { onMount } from "svelte";
  import { resolve, TYPES, loadFeatureModule } from "$lib/shared/inversify/di";
  import type {
    ISystemStateService,
    CachedUserMetadata,
  } from "../../services/contracts/ISystemStateService";
  import RobustAvatar from "$lib/shared/components/avatar/RobustAvatar.svelte";

  let isLoading = $state(true);
  let users = $state<CachedUserMetadata[]>([]);
  let searchQuery = $state("");
  let selectedUser = $state<CachedUserMetadata | null>(null);

  // Filter users based on search query
  const filteredUsers = $derived(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return users
      .filter(
        (u) =>
          u.displayName?.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query)
      )
      .slice(0, 10); // Limit to 10 results
  });

  // Format relative time
  function formatRelativeTime(date: Date | null): string {
    if (!date) return "Never";
    const now = Date.now();
    const diff = now - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  // Format date nicely
  function formatDate(date: Date | null): string {
    if (!date) return "Unknown";
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function selectUser(user: CachedUserMetadata) {
    selectedUser = selectedUser?.id === user.id ? null : user;
  }

  function clearSearch() {
    searchQuery = "";
    selectedUser = null;
  }

  onMount(async () => {
    try {
      await loadFeatureModule("admin");
      const systemStateService = resolve<ISystemStateService>(
        TYPES.ISystemStateService
      );
      const state = await systemStateService.getSystemState();
      users = state.users;
    } catch (error) {
      console.error("Failed to load system state:", error);
    } finally {
      isLoading = false;
    }
  });
</script>

<section class="section">
  <h3><i class="fas fa-search"></i> User Lookup</h3>

  <div class="search-container">
    <div class="search-input-wrapper">
      <i class="fas fa-search search-icon"></i>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search by name or email..."
        class="search-input"
        disabled={isLoading}
      />
      {#if searchQuery}
        <button class="clear-btn" onclick={clearSearch} aria-label="Clear search">
          <i class="fas fa-times"></i>
        </button>
      {/if}
    </div>
  </div>

  {#if isLoading}
    <div class="loading-state">
      <div class="spinner"></div>
      <span>Loading users...</span>
    </div>
  {:else if searchQuery && filteredUsers().length === 0}
    <div class="no-results">
      <i class="fas fa-user-slash"></i>
      <span>No users found matching "{searchQuery}"</span>
    </div>
  {:else if filteredUsers().length > 0}
    <div class="results-list">
      {#each filteredUsers() as user}
        <button
          class="user-row"
          class:selected={selectedUser?.id === user.id}
          onclick={() => selectUser(user)}
        >
          <RobustAvatar
            src={user.photoURL}
            name={user.displayName}
            size="sm"
          />
          <div class="user-info">
            <span class="user-name">{user.displayName || "Anonymous"}</span>
            <span class="user-email">{user.email || "No email"}</span>
          </div>
          <span class="user-activity">{formatRelativeTime(user.lastActivityDate)}</span>
        </button>

        {#if selectedUser?.id === user.id}
          <div class="user-detail-card">
            <div class="detail-header">
              <RobustAvatar
                src={user.photoURL}
                name={user.displayName}
                size="lg"
              />
              <div class="detail-info">
                <h4>{user.displayName || "Anonymous"}</h4>
                <p class="detail-email">{user.email || "No email"}</p>
                <span class="detail-role" class:admin={user.role === "admin"}>
                  {user.role || "user"}
                </span>
              </div>
            </div>

            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-value">{user.sequenceCount}</span>
                <span class="stat-label">Sequences</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{user.publicSequenceCount}</span>
                <span class="stat-label">Public</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{user.currentStreak}</span>
                <span class="stat-label">Streak</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{(user.totalXP / 1000).toFixed(1)}k</span>
                <span class="stat-label">XP</span>
              </div>
            </div>

            <div class="detail-meta">
              <div class="meta-row">
                <span class="meta-label">Joined</span>
                <span class="meta-value">{formatDate(user.createdAt)}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Last Active</span>
                <span class="meta-value">{formatRelativeTime(user.lastActivityDate)}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Achievements</span>
                <span class="meta-value">{user.achievementCount}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Challenges</span>
                <span class="meta-value">{user.challengesCompleted}</span>
              </div>
            </div>
          </div>
        {/if}
      {/each}
    </div>
  {:else}
    <div class="empty-state">
      <i class="fas fa-users"></i>
      <span>Type to search {users.length.toLocaleString()} users</span>
    </div>
  {/if}
</section>

<style>
  .section {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border-radius: 12px;
    padding: 20px;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
  }

  .section h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .section h3 i {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .search-container {
    margin-bottom: 16px;
  }

  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: 10px 36px;
    background: var(--theme-panel-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 8px;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }

  .search-input::placeholder {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
  }

  .search-input:focus {
    border-color: var(--theme-accent, #8b5cf6);
  }

  .clear-btn {
    position: absolute;
    right: 8px;
    width: 24px;
    height: 24px;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .clear-btn:hover {
    background: var(--theme-stroke, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .loading-state,
  .empty-state,
  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 32px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    text-align: center;
  }

  .loading-state i,
  .empty-state i,
  .no-results i {
    font-size: 24px;
    opacity: 0.5;
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-top-color: var(--theme-accent, #8b5cf6);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .results-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .user-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: var(--theme-panel-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
    text-align: left;
  }

  .user-row:hover {
    background: var(--theme-hover, rgba(255, 255, 255, 0.08));
  }

  .user-row.selected {
    background: color-mix(in srgb, var(--theme-accent, #8b5cf6) 15%, transparent);
    border-color: var(--theme-accent, #8b5cf6);
  }

  .user-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .user-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-email {
    font-size: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-activity {
    font-size: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
    white-space: nowrap;
  }

  .user-detail-card {
    margin-top: 4px;
    padding: 16px;
    background: var(--theme-panel-bg, rgba(255, 255, 255, 0.03));
    border-radius: 8px;
    margin-bottom: 8px;
  }

  .detail-header {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .detail-info {
    flex: 1;
    min-width: 0;
  }

  .detail-info h4 {
    margin: 0 0 4px 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .detail-email {
    margin: 0 0 8px 0;
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
  }

  .detail-role {
    display: inline-block;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    background: var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 4px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
  }

  .detail-role.admin {
    background: color-mix(in srgb, var(--theme-accent, #8b5cf6) 20%, transparent);
    color: var(--theme-accent, #8b5cf6);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 16px;
  }

  .stat-item {
    text-align: center;
    padding: 10px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border-radius: 6px;
  }

  .stat-value {
    display: block;
    font-size: 18px;
    font-weight: 700;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    line-height: 1.2;
  }

  .stat-label {
    display: block;
    font-size: 11px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    margin-top: 2px;
  }

  .detail-meta {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .meta-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
  }

  .meta-label {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .meta-value {
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
  }

  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
