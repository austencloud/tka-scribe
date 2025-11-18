<script lang="ts">
  /**
   * CreatorsPanel
   * Community creator browser (migrated from Explore module)
   * Displays user profiles with their contributions and stats.
   */

  import { onMount, onDestroy } from "svelte";
  import { resolve, TYPES } from "$shared";
  import { communityViewState } from "../../state/community-view-state.svelte";
  import type { UserProfile } from "../../domain/models/enhanced-user-profile";
  import type { IEnhancedUserService } from "../../services/contracts/IEnhancedUserService";

  let users = $state<UserProfile[]>([]);
  let isLoading = $state(true);
  let searchQuery = $state("");
  let error = $state<string | null>(null);

  // Service instance and unsubscribe function
  let userService: IEnhancedUserService;
  let unsubscribe: (() => void) | null = null;

  // Filtered users based on search
  const filteredUsers = $derived.by(() => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(query) ||
        user.displayName.toLowerCase().includes(query)
    );
  });

  onMount(async () => {
    try {
      console.log("🔍 CreatorsPanel: Initializing user service...");

      // Resolve the user service from DI container
      userService = resolve<IEnhancedUserService>(TYPES.IEnhancedUserService);

      // Subscribe to real-time user updates
      unsubscribe = userService.subscribeToEnhancedUsers((updatedUsers) => {
        users = updatedUsers;
        isLoading = false;
        error = null;
        console.log(
          `✅ CreatorsPanel: Updated with ${updatedUsers.length} users`
        );

        // Debug: Log avatar URLs for each user
        updatedUsers.forEach((user) => {
          console.log(
            `👤 ${user.displayName} (@${user.username}):`,
            user.avatar ? `✅ ${user.avatar}` : "❌ No avatar"
          );
        });
      });

      console.log("✅ CreatorsPanel: Real-time subscription active");
    } catch (err) {
      console.error(
        "❌ CreatorsPanel: Error setting up subscription:",
        err
      );

      // Show generic error message
      error =
        err instanceof Error
          ? err.message
          : "Failed to load users. Please try again.";
      isLoading = false;
    }
  });

  onDestroy(() => {
    // Clean up the subscription when component is destroyed
    if (unsubscribe) {
      console.log("🔌 CreatorsPanel: Unsubscribing from real-time updates");
      unsubscribe();
    }
  });

  function handleUserClick(user: UserProfile) {
    console.log("📱 Navigate to user profile:", user.id);
    communityViewState.viewUserProfile(user.id);
  }

  function handleFollowToggle(user: UserProfile) {
    console.log("Toggle follow for user:", user.id);
    // TODO: Implement follow/unfollow functionality
  }
</script>

<div class="creators-panel">
  <!-- Header -->
  <div class="panel-header">
    <div class="header-title">
      <i class="fas fa-users"></i>
      <h2>Community Creators</h2>
    </div>
    <p class="header-subtitle">Discover talented members of the community</p>
  </div>

  <!-- Search bar -->
  <div class="search-container">
    <i class="fas fa-search search-icon"></i>
    <input
      type="text"
      class="search-input"
      placeholder="Search creators..."
      bind:value={searchQuery}
    />
  </div>

  <!-- Content -->
  <div class="panel-content">
    {#if error}
      <div class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>{error}</p>
      </div>
    {:else if isLoading}
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading community...</p>
      </div>
    {:else if filteredUsers.length === 0}
      <div class="empty-state">
        <i class="fas fa-users"></i>
        <p>
          {searchQuery ? "No creators match your search" : "No members found"}
        </p>
      </div>
    {:else}
      <div class="creators-grid">
        {#each filteredUsers as user (user.id)}
          <div class="user-card">
            <!-- Avatar -->
            <div class="user-avatar">
              {#if user.avatar}
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  onerror={(e) => {
                    console.error(
                      `❌ Failed to load avatar for ${user.displayName}:`,
                      user.avatar
                    );
                    // Hide the broken image and show placeholder instead
                    const img = e.currentTarget;
                    const fallback = img.nextElementSibling;
                    img.style.display = "none";
                    if (fallback) fallback.style.display = "flex";
                  }}
                  onload={() => {
                    console.log(
                      `✅ Successfully loaded avatar for ${user.displayName}`
                    );
                  }}
                />
                <!-- Fallback placeholder (shown if image fails to load) -->
                <div class="avatar-placeholder" style="display: none;">
                  <i class="fas fa-user"></i>
                </div>
              {:else}
                <div class="avatar-placeholder">
                  <i class="fas fa-user"></i>
                </div>
              {/if}
            </div>

            <!-- User info -->
            <div class="user-info">
              <h3 class="display-name">{user.displayName}</h3>
              <p class="username">@{user.username}</p>

              <!-- Stats -->
              <div class="user-stats">
                <div class="stat">
                  <i class="fas fa-list"></i>
                  <span>{user.sequenceCount}</span>
                </div>
                <div class="stat">
                  <i class="fas fa-folder"></i>
                  <span>{user.collectionCount}</span>
                </div>
                <div class="stat">
                  <i class="fas fa-users"></i>
                  <span>{user.followerCount}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="user-actions">
              <button
                class="view-profile-button"
                onclick={() => handleUserClick(user)}
              >
                View Profile
              </button>
              <button
                class="follow-button"
                class:following={user.isFollowing}
                onclick={() => handleFollowToggle(user)}
              >
                {user.isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .creators-panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* ============================================================================
     HEADER
     ============================================================================ */
  .panel-header {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 20px 20px 0;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-title i {
    font-size: 24px;
    color: #06b6d4;
  }

  .header-title h2 {
    font-size: 28px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
  }

  .header-subtitle {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    padding-left: 36px;
  }

  /* ============================================================================
     SEARCH
     ============================================================================ */
  .search-container {
    position: relative;
    width: 100%;
    max-width: 600px;
    padding: 0 20px;
  }

  .search-icon {
    position: absolute;
    left: 32px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.5);
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: 10px 12px 10px 40px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: white;
    font-size: 14px;
    transition: all 0.2s ease;
  }

  .search-input:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.05);
  }

  .search-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  /* ============================================================================
     CONTENT
     ============================================================================ */
  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 20px 20px;
    min-height: 0;
  }

  /* ============================================================================
     STATES
     ============================================================================ */
  .loading-state,
  .empty-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    gap: 12px;
    padding: 60px 20px;
  }

  .loading-state i,
  .empty-state i,
  .error-state i {
    font-size: 48px;
    color: rgba(255, 255, 255, 0.3);
  }

  .error-state i {
    color: rgba(239, 68, 68, 0.7);
  }

  .loading-state p,
  .empty-state p,
  .error-state p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
  }

  /* ============================================================================
     CREATORS GRID
     ============================================================================ */
  .creators-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    padding: 4px;
  }

  /* ============================================================================
     USER CARD
     ============================================================================ */
  .user-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    transition: all 0.2s ease;
  }

  .user-card:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  /* Avatar */
  .user-avatar {
    width: 80px;
    height: 80px;
    margin: 0 auto;
  }

  .user-avatar img,
  .avatar-placeholder {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  .avatar-placeholder i {
    font-size: 32px;
    color: rgba(255, 255, 255, 0.4);
  }

  /* User info */
  .user-info {
    text-align: center;
  }

  .display-name {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: white;
  }

  .username {
    margin: 4px 0 0 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
  }

  /* User stats */
  .user-stats {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 12px;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
  }

  .stat i {
    font-size: 12px;
  }

  /* Actions */
  .user-actions {
    display: flex;
    gap: 8px;
  }

  .view-profile-button,
  .follow-button {
    flex: 1;
    padding: 10px 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .view-profile-button {
    background: rgba(255, 255, 255, 0.08);
    color: white;
  }

  .view-profile-button:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .follow-button {
    background: #06b6d4;
    border-color: #06b6d4;
    color: white;
  }

  .follow-button:hover {
    background: #0891b2;
    border-color: #0891b2;
  }

  .follow-button.following {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.7);
  }

  .follow-button.following:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.3);
  }

  /* ============================================================================
     RESPONSIVE
     ============================================================================ */
  @media (max-width: 640px) {
    .creators-panel {
      gap: 16px;
    }

    .panel-header {
      padding: 12px 12px 0;
    }

    .header-title h2 {
      font-size: 24px;
    }

    .header-subtitle {
      font-size: 13px;
      padding-left: 32px;
    }

    .search-container {
      padding: 0 12px;
    }

    .panel-content {
      padding: 0 12px 12px;
    }

    .creators-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .user-card {
      padding: 16px;
      gap: 10px;
    }

    .user-avatar {
      width: 70px;
      height: 70px;
    }

    .display-name {
      font-size: 16px;
    }

    .username {
      font-size: 13px;
    }

    .user-stats {
      margin-top: 10px;
      gap: 12px;
    }

    .stat {
      font-size: 12px;
    }

    .user-actions {
      flex-direction: row;
      gap: 6px;
    }

    .view-profile-button,
    .follow-button {
      padding: 8px 12px;
      font-size: 12px;
    }
  }

  @media (max-width: 360px) {
    .creators-grid {
      grid-template-columns: 1fr;
    }

    .user-avatar {
      width: 64px;
      height: 64px;
    }
  }
</style>
