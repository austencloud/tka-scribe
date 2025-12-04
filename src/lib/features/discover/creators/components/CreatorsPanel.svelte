<script lang="ts">
  /**
   * CreatorsPanel (Discover Module)
   * Community creator browser for discovering users
   * Displays user profiles with their contributions and stats.
   *
   * Uses singleton data state for caching - data persists across tab switches.
   */

  import { onMount } from "svelte";
  import { resolve, loadFeatureModule } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte.ts";
  import { discoverNavigationState } from "../../shared/state/discover-navigation-state.svelte";
  import { creatorsDataState } from "../state/creators-data-state.svelte";
  import type { UserProfile } from "$lib/shared/community/domain/models/enhanced-user-profile";
  import type { IUserService } from "$lib/shared/community/services/contracts/IUserService";
  import PanelState from "$lib/shared/components/panel/PanelState.svelte";
  import PanelContent from "$lib/shared/components/panel/PanelContent.svelte";
  import PanelSearch from "$lib/shared/components/panel/PanelSearch.svelte";
  import PanelGrid from "$lib/shared/components/panel/PanelGrid.svelte";
  import DiscoverNavButtons from "../../shared/components/DiscoverNavButtons.svelte";
  import { getContext } from "svelte";
  import type { DiscoverLocation } from "../../shared/state/discover-navigation-state.svelte";

  // Get navigation handler from context (provided by DiscoverModule)
  const navContext = getContext<{
    onNavigate: (location: DiscoverLocation) => void;
  }>("discoverNavigation");

  const onNavigate = navContext?.onNavigate ?? (() => {});

  let searchQuery = $state("");
  let followingInProgress = $state<Set<string>>(new Set());

  // Service instances
  let userService: IUserService;
  let hapticService: IHapticFeedbackService;

  // Get current user ID
  const currentUserId = $derived(authStore.user?.uid);

  // Reactive getters from cached state
  const users = $derived(creatorsDataState.users);
  const isLoading = $derived(
    creatorsDataState.isLoading && !creatorsDataState.isLoaded
  );
  const error = $derived(creatorsDataState.error);

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
      // Ensure community module is loaded (provides IUserService)
      await loadFeatureModule("community");

      // Resolve services from DI container
      userService = resolve<IUserService>(TYPES.IUserService);
      hapticService = resolve<IHapticFeedbackService>(
        TYPES.IHapticFeedbackService
      );

      // Load creators data (uses cache if already loaded)
      await creatorsDataState.loadCreators(userService, currentUserId);
    } catch (err) {
      console.error("[CreatorsPanel] Error loading creators:", err);
    }
  });

  function handleUserClick(user: UserProfile) {
    hapticService?.trigger("selection");
    // Navigate to user profile using unified navigation state
    discoverNavigationState.viewCreatorProfile(user.id, user.displayName);
  }

  async function handleFollowToggle(user: UserProfile) {
    if (!currentUserId) {
      return;
    }

    if (currentUserId === user.id) {
      return;
    }

    // Prevent double-clicking
    if (followingInProgress.has(user.id)) {
      return;
    }

    // Add to in-progress set
    followingInProgress = new Set([...followingInProgress, user.id]);
    hapticService?.trigger("selection");

    try {
      if (user.isFollowing) {
        await userService.unfollowUser(currentUserId, user.id);
        // Optimistic update via cached state
        creatorsDataState.updateUserFollowStatus(user.id, false, -1);
      } else {
        await userService.followUser(currentUserId, user.id);
        // Optimistic update via cached state
        creatorsDataState.updateUserFollowStatus(user.id, true, 1);
      }
    } catch (err) {
      // Revert on error
      if (user.isFollowing) {
        creatorsDataState.updateUserFollowStatus(user.id, true, 1);
      } else {
        creatorsDataState.updateUserFollowStatus(user.id, false, -1);
      }
    } finally {
      // Remove from in-progress set
      const newSet = new Set(followingInProgress);
      newSet.delete(user.id);
      followingInProgress = newSet;
    }
  }
</script>

<div class="creators-panel">
  <!-- Top bar with navigation -->
  <div class="creators-topbar">
    <div class="nav-section">
      <DiscoverNavButtons {onNavigate} />
    </div>
    <div class="header-section">
      <h2 class="panel-title">
        <i class="fas fa-users"></i>
        Discover Creators
      </h2>
    </div>
    <div class="spacer"></div>
  </div>

  <PanelSearch placeholder="Search creators..." bind:value={searchQuery} />

  <PanelContent>
    {#if error}
      <PanelState type="error" title="Error" message={error} />
    {:else if isLoading}
      <PanelState type="loading" message="Loading creators..." />
    {:else if filteredUsers.length === 0}
      <PanelState
        type="empty"
        icon="fa-users"
        title="No Creators Found"
        message={searchQuery
          ? "No creators match your search"
          : "No members found"}
      />
    {:else}
      <PanelGrid columns={3} gap="16px">
        {#each filteredUsers as user (user.id)}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div
            class="user-card"
            onclick={() => handleUserClick(user)}
            role="button"
            tabindex="0"
            onkeydown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleUserClick(user);
              }
            }}
          >
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

            <!-- Actions - only show follow button if logged in and not own profile -->
            {#if currentUserId && currentUserId !== user.id}
              <div class="user-actions">
                <button
                  class="follow-button"
                  class:following={user.isFollowing}
                  class:loading={followingInProgress.has(user.id)}
                  disabled={followingInProgress.has(user.id)}
                  onclick={(e) => {
                    e.stopPropagation();
                    handleFollowToggle(user);
                  }}
                >
                  {#if followingInProgress.has(user.id)}
                    <i class="fas fa-spinner fa-spin"></i>
                  {:else}
                    {user.isFollowing ? "Following" : "Follow"}
                  {/if}
                </button>
              </div>
            {/if}
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
    gap: 16px;
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding: 0 16px;
  }

  /* Top bar with navigation */
  .creators-topbar {
    display: flex;
    align-items: center;
    padding: 10px 0;
    background: transparent;
    width: 100%;
    min-height: 48px;
  }

  .nav-section {
    flex-shrink: 0;
    min-width: 104px; /* Space for nav buttons */
  }

  .header-section {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .panel-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .panel-title i {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
  }

  .spacer {
    flex-shrink: 0;
    min-width: 104px; /* Match nav section for centering */
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
    cursor: pointer;
  }

  .user-card:hover {
    background: var(--card-hover-current, rgba(255, 255, 255, 0.06));
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .user-card:focus {
    outline: 2px solid #a855f7;
    outline-offset: 2px;
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
  }

  .follow-button {
    width: 100%;
    padding: 10px 16px;
    border: 1px solid #a855f7;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    background: #a855f7;
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

  .follow-button.loading {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .follow-button:disabled {
    pointer-events: none;
  }

  /* ============================================================================
     RESPONSIVE
     ============================================================================ */
  @media (max-width: 640px) {
    .creators-panel {
      gap: 16px;
      padding: 0 12px;
    }

    .panel-title {
      font-size: 16px;
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
