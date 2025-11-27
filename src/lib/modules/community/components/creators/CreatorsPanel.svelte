<script lang="ts">
  /**
   * CreatorsPanel
   * Community creator browser (migrated from Explore module)
   * Displays user profiles with their contributions and stats.
   *
   * Refactored to use shared panel components and CSS variables.
   */

  import { onMount, onDestroy } from "svelte";
  import { resolve, TYPES, PanelHeader, PanelSearch, PanelContent, PanelState, PanelGrid } from "$shared";
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
      console.error("❌ CreatorsPanel: Error setting up subscription:", err);

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
  <PanelHeader
    title="Community Creators"
    subtitle="Discover talented members of the community"
    icon="fa-users"
  />

  <PanelSearch
    placeholder="Search creators..."
    bind:value={searchQuery}
  />

  <PanelContent>
    {#if error}
      <PanelState type="error" title="Error" message={error} />
    {:else if isLoading}
      <PanelState type="loading" message="Loading community..." />
    {:else if filteredUsers.length === 0}
      <PanelState
        type="empty"
        icon="fa-users"
        title="No Creators Found"
        message={searchQuery ? "No creators match your search" : "No members found"}
      />
    {:else}
      <PanelGrid columns={3} gap="16px">
        {#each filteredUsers as user (user.id)}
          <div class="user-card">
            <!-- Avatar -->
            <div class="user-avatar">
              {#if user.avatar}
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  crossorigin="anonymous"
                  referrerpolicy="no-referrer"
                  onerror={(e) => {
                    // Silently handle avatar load failures - this is expected for some Google URLs
                    const img = e.currentTarget as HTMLElement;
                    const fallback = img.nextElementSibling as HTMLElement;
                    img.style.display = "none";
                    if (fallback) fallback.style.display = "flex";
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
      </PanelGrid>
    {/if}
  </PanelContent>
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
     USER CARD
     ============================================================================ */
  .user-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px;
    background: var(--card-bg-current, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--card-border-current, rgba(255, 255, 255, 0.08));
    border-radius: 16px;
    transition: all 0.2s ease;
  }

  .user-card:hover {
    background: var(--card-hover-current, rgba(255, 255, 255, 0.06));
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
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.4));
  }

  /* User info */
  .user-info {
    text-align: center;
  }

  .display-name {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary-current, rgba(255, 255, 255, 0.95));
  }

  .username {
    margin: 4px 0 0 0;
    font-size: 14px;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.6));
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
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.7));
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
    border: 1px solid var(--card-border-current, rgba(255, 255, 255, 0.2));
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .view-profile-button {
    background: var(--card-bg-current, rgba(255, 255, 255, 0.08));
    color: var(--text-primary-current, white);
  }

  .view-profile-button:hover {
    background: var(--card-hover-current, rgba(255, 255, 255, 0.12));
    border-color: rgba(255, 255, 255, 0.3);
  }

  .follow-button {
    background: var(--accent-color);
    border-color: var(--accent-color);
    color: white;
  }

  .follow-button:hover {
    filter: brightness(0.9);
  }

  .follow-button.following {
    background: var(--card-bg-current, rgba(255, 255, 255, 0.08));
    border-color: var(--card-border-current, rgba(255, 255, 255, 0.2));
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.7));
  }

  .follow-button.following:hover {
    background: var(--card-hover-current, rgba(255, 255, 255, 0.12));
    border-color: rgba(255, 255, 255, 0.3);
  }

  /* ============================================================================
     RESPONSIVE
     ============================================================================ */
  @media (max-width: 640px) {
    .creators-panel {
      gap: 16px;
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
    .user-avatar {
      width: 64px;
      height: 64px;
    }
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .user-card {
      transition: none;
    }

    .user-card:hover {
      transform: none;
    }
  }
</style>
