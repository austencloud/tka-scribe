<script lang="ts">
  /**
   * UserProfilePanel
   * Comprehensive user profile view with sequences, stats, and achievements
   * Responsive design for mobile and desktop
   *
   * Refactored to use shared panel components and CSS variables.
   */

  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { resolve } from "$lib/shared/inversify";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { PanelButton, PanelTabs } from "$lib/shared/components/panel";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte.ts";
  import type { IUserService } from "../../services/contracts/IUserService";
  import type { ILeaderboardService } from "../../services/contracts/ILeaderboardService";
  import type { ILibraryService } from "$lib/modules/library/services/contracts/ILibraryService";
  import type { LibrarySequence } from "$lib/modules/library/domain/models/LibrarySequence";
  import type { EnhancedUserProfile } from "../../domain/models/enhanced-user-profile";
  import { communityViewState } from "../../state/community-view-state.svelte";
  import PanelState from "$lib/shared/components/panel/PanelState.svelte";

  interface Props {
    userId: string;
  }

  let { userId }: Props = $props();

  import type { UserProfile } from "../../domain/models/enhanced-user-profile";

  let userProfile = $state<EnhancedUserProfile | null>(null);
  let userSequences = $state<LibrarySequence[]>([]);
  let followingUsers = $state<UserProfile[]>([]);
  let followingLoading = $state(false);
  let followingLoaded = $state(false);
  let followerUsers = $state<UserProfile[]>([]);
  let followersLoading = $state(false);
  let followersLoaded = $state(false);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let followInProgress = $state(false);
  let activeTab = $state<
    "sequences" | "followers" | "following" | "achievements"
  >("sequences");

  // Track image errors for avatar fallbacks
  let mainAvatarError = $state(false);
  let followerAvatarErrors = $state<Set<string>>(new Set());
  let followingAvatarErrors = $state<Set<string>>(new Set());

  function handleMainAvatarError() {
    mainAvatarError = true;
  }

  function handleFollowerAvatarError(userId: string) {
    followerAvatarErrors = new Set([...followerAvatarErrors, userId]);
  }

  function handleFollowingAvatarError(userId: string) {
    followingAvatarErrors = new Set([...followingAvatarErrors, userId]);
  }

  // Services
  let userService: IUserService;
  let libraryService: ILibraryService;
  let hapticService: IHapticFeedbackService;
  let leaderboardService: ILeaderboardService;

  // Personal rankings state (only for own profile)
  interface UserRanks {
    xp: number | null;
    level: number | null;
    sequences: number | null;
    achievements: number | null;
    streak: number | null;
  }
  let userRanks = $state<UserRanks>({
    xp: null,
    level: null,
    sequences: null,
    achievements: null,
    streak: null,
  });
  let isLoadingRanks = $state(false);
  let hasRanks = $derived(
    userRanks.xp !== null ||
      userRanks.level !== null ||
      userRanks.sequences !== null ||
      userRanks.achievements !== null ||
      userRanks.streak !== null
  );

  // Get current user ID
  const currentUserId = $derived(authStore.user?.uid);

  // Check if viewing own profile
  const isOwnProfile = $derived(currentUserId === userId);

  onMount(async () => {
    try {
      console.log(`[UserProfilePanel] Loading profile for user: ${userId}`);

      // Resolve services
      userService = resolve<IUserService>(TYPES.IUserService);
      libraryService = resolve<ILibraryService>(TYPES.ILibraryService);
      hapticService = resolve<IHapticFeedbackService>(
        TYPES.IHapticFeedbackService
      );
      leaderboardService = resolve<ILeaderboardService>(
        TYPES.ILeaderboardService
      );

      // Load user profile with current user context for follow status
      userProfile = await userService.getUserProfile(userId, currentUserId);

      if (!userProfile) {
        error = "User not found";
        isLoading = false;
        return;
      }

      // Load user's sequences from Firestore
      userSequences = await libraryService.getUserSequences(userId);

      isLoading = false;
      console.log(
        `[UserProfilePanel] Loaded profile with ${userSequences.length} sequences`
      );

      // Load user ranks in background
      loadUserRanks();
    } catch (err) {
      console.error(`[UserProfilePanel] Error loading profile:`, err);
      error = err instanceof Error ? err.message : "Failed to load profile";
      isLoading = false;
    }
  });

  function handleBack() {
    hapticService?.trigger("selection");
    communityViewState.goBack();
  }

  async function handleFollowToggle() {
    if (!currentUserId || !userProfile) {
      console.warn("[UserProfilePanel] Must be logged in to follow users");
      return;
    }

    if (isOwnProfile) {
      console.warn("[UserProfilePanel] Cannot follow yourself");
      return;
    }

    if (followInProgress) {
      return;
    }

    followInProgress = true;
    hapticService?.trigger("selection");

    try {
      if (userProfile.isFollowing) {
        await userService.unfollowUser(currentUserId, userId);
        // Optimistic update
        userProfile = {
          ...userProfile,
          isFollowing: false,
          followerCount: Math.max(0, userProfile.followerCount - 1),
        };
      } else {
        await userService.followUser(currentUserId, userId);
        // Optimistic update
        userProfile = {
          ...userProfile,
          isFollowing: true,
          followerCount: userProfile.followerCount + 1,
        };
      }
    } catch (err) {
      console.error("[UserProfilePanel] Error toggling follow:", err);
      // Reload profile to get correct state
      userProfile = await userService.getUserProfile(userId, currentUserId);
    } finally {
      followInProgress = false;
    }
  }

  function handleSequenceClick(sequence: LibrarySequence) {
    hapticService?.trigger("selection");
    console.log("Open sequence:", sequence.id);
    // TODO: Navigate to sequence detail/animator view
  }

  async function loadFollowingUsers() {
    if (followingLoaded || followingLoading) return;

    followingLoading = true;
    try {
      followingUsers = await userService.getFollowing(userId, 50);
      followingLoaded = true;
      console.log(
        `[UserProfilePanel] Loaded ${followingUsers.length} following users`
      );
    } catch (err) {
      console.error("[UserProfilePanel] Error loading following users:", err);
    } finally {
      followingLoading = false;
    }
  }

  async function loadFollowerUsers() {
    if (followersLoaded || followersLoading) return;

    followersLoading = true;
    try {
      followerUsers = await userService.getFollowers(userId, 50);
      followersLoaded = true;
      console.log(
        `[UserProfilePanel] Loaded ${followerUsers.length} followers`
      );
    } catch (err) {
      console.error("[UserProfilePanel] Error loading followers:", err);
    } finally {
      followersLoading = false;
    }
  }

  function handleUserCardClick(user: UserProfile) {
    hapticService?.trigger("selection");
    communityViewState.viewUserProfile(user.id);
  }

  // Load following/followers when tabs are selected
  $effect(() => {
    if (activeTab === "following" && !followingLoaded && userService) {
      loadFollowingUsers();
    }
    if (activeTab === "followers" && !followersLoaded && userService) {
      loadFollowerUsers();
    }
  });

  async function loadUserRanks() {
    if (!leaderboardService) return;

    isLoadingRanks = true;
    try {
      // Fetch ranks in parallel for the profile being viewed
      const [xpRank, levelRank, sequencesRank, achievementsRank, streakRank] =
        await Promise.all([
          leaderboardService.getUserRank(userId, "xp"),
          leaderboardService.getUserRank(userId, "level"),
          leaderboardService.getUserRank(userId, "sequences"),
          leaderboardService.getUserRank(userId, "achievements"),
          leaderboardService.getUserRank(userId, "streak"),
        ]);

      userRanks = {
        xp: xpRank,
        level: levelRank,
        sequences: sequencesRank,
        achievements: achievementsRank,
        streak: streakRank,
      };
    } catch (err) {
      console.error("[UserProfilePanel] Failed to load user ranks:", err);
    } finally {
      isLoadingRanks = false;
    }
  }
</script>

<div class="profile-panel">
  {#if isLoading}
    <PanelState type="loading" message="Loading profile..." />
  {:else if error || !userProfile}
    <div class="error-with-action">
      <PanelState
        type="error"
        title="Profile Not Found"
        message={error || "User not found"}
      />
      <PanelButton variant="secondary" onclick={handleBack}>
        <i class="fas fa-arrow-left"></i>
        Go Back
      </PanelButton>
    </div>
  {:else}
    <!-- Header with back button -->
    <div class="profile-header">
      <button class="back-btn" onclick={handleBack}>
        <i class="fas fa-arrow-left"></i>
        <span class="back-text">Back</span>
      </button>
    </div>

    <!-- Scrollable content -->
    <div class="profile-content">
      <!-- Hero section -->
      <div class="hero-section" transition:fade={{ duration: 300 }}>
        <!-- Avatar -->
        <div class="avatar-container">
          {#if userProfile.avatar && !mainAvatarError}
            <img
              src={userProfile.avatar}
              alt={userProfile.displayName}
              class="avatar"
              crossorigin="anonymous"
              referrerpolicy="no-referrer"
              onerror={handleMainAvatarError}
            />
          {:else}
            <div class="avatar-placeholder">
              <i class="fas fa-user"></i>
            </div>
          {/if}

          <!-- Level badge -->
          <div class="level-badge">
            <i class="fas fa-star"></i>
            <span>{userProfile.currentLevel}</span>
          </div>
        </div>

        <!-- User info -->
        <div class="user-info">
          <h1 class="display-name">{userProfile.displayName}</h1>
          <p class="username">@{userProfile.username}</p>

          {#if userProfile.bio}
            <p class="bio">{userProfile.bio}</p>
          {/if}

          <!-- Action button (only show if not own profile and logged in) -->
          {#if currentUserId && !isOwnProfile}
            <button
              class="follow-button"
              class:following={userProfile.isFollowing}
              class:loading={followInProgress}
              disabled={followInProgress}
              onclick={handleFollowToggle}
            >
              {#if followInProgress}
                <i class="fas fa-spinner fa-spin"></i>
              {:else}
                {userProfile.isFollowing ? "Following" : "Follow"}
              {/if}
            </button>
          {/if}
        </div>
      </div>

      <!-- Stats grid -->
      <div
        class="stats-grid"
        transition:fly={{ y: 20, duration: 300, delay: 100 }}
      >
        <div class="stat-card">
          <i class="fas fa-list stat-icon"></i>
          <div class="stat-content">
            <span class="stat-value">{userProfile.sequenceCount}</span>
            <span class="stat-label">Sequences</span>
          </div>
        </div>

        <div class="stat-card">
          <i class="fas fa-folder stat-icon"></i>
          <div class="stat-content">
            <span class="stat-value">{userProfile.collectionCount}</span>
            <span class="stat-label">Collections</span>
          </div>
        </div>

        <div class="stat-card">
          <i class="fas fa-users stat-icon"></i>
          <div class="stat-content">
            <span class="stat-value">{userProfile.followerCount}</span>
            <span class="stat-label">Followers</span>
          </div>
        </div>

        <div class="stat-card">
          <i class="fas fa-user-plus stat-icon"></i>
          <div class="stat-content">
            <span class="stat-value">{userProfile.followingCount}</span>
            <span class="stat-label">Following</span>
          </div>
        </div>

        <div class="stat-card">
          <i class="fas fa-trophy stat-icon"></i>
          <div class="stat-content">
            <span class="stat-value">{userProfile.achievementCount}</span>
            <span class="stat-label">Achievements</span>
          </div>
        </div>

        <div class="stat-card">
          <i class="fas fa-bolt stat-icon"></i>
          <div class="stat-content">
            <span class="stat-value"
              >{userProfile.totalXP.toLocaleString()}</span
            >
            <span class="stat-label">Total XP</span>
          </div>
        </div>

        <div class="stat-card">
          <i class="fas fa-fire stat-icon"></i>
          <div class="stat-content">
            <span class="stat-value">{userProfile.currentStreak}</span>
            <span class="stat-label">Day Streak</span>
          </div>
        </div>
      </div>

      <!-- Rankings -->
      {#if hasRanks}
        <div
          class="rankings-section"
          transition:fly={{ y: 20, duration: 300, delay: 150 }}
        >
          <h3 class="rankings-title">
            <i class="fas fa-chart-line"></i>
            Rankings
          </h3>
          <div class="rankings-badges">
            {#if userRanks.xp !== null}
              <div class="rank-badge">
                <span class="rank-value">#{userRanks.xp}</span>
                <span class="rank-label">XP</span>
              </div>
            {/if}
            {#if userRanks.level !== null}
              <div class="rank-badge">
                <span class="rank-value">#{userRanks.level}</span>
                <span class="rank-label">Level</span>
              </div>
            {/if}
            {#if userRanks.sequences !== null}
              <div class="rank-badge">
                <span class="rank-value">#{userRanks.sequences}</span>
                <span class="rank-label">Sequences</span>
              </div>
            {/if}
            {#if userRanks.achievements !== null}
              <div class="rank-badge">
                <span class="rank-value">#{userRanks.achievements}</span>
                <span class="rank-label">Achievements</span>
              </div>
            {/if}
            {#if userRanks.streak !== null}
              <div class="rank-badge">
                <span class="rank-value">#{userRanks.streak}</span>
                <span class="rank-label">Streak</span>
              </div>
            {/if}
          </div>
        </div>
      {:else if isLoadingRanks}
        <div
          class="rankings-section"
          transition:fly={{ y: 20, duration: 300, delay: 150 }}
        >
          <h3 class="rankings-title">
            <i class="fas fa-chart-line"></i>
            Rankings
          </h3>
          <div class="rankings-loading">
            <span>Loading rankings...</span>
          </div>
        </div>
      {/if}

      <!-- Tab navigation -->
      <div
        class="tabs-wrapper"
        transition:fly={{ y: 20, duration: 300, delay: 200 }}
      >
        <PanelTabs
          tabs={[
            {
              value: "sequences",
              label: `Sequences (${userSequences.length})`,
              icon: "fa-list",
            },
            {
              value: "followers",
              label: `Followers (${userProfile.followerCount})`,
              icon: "fa-users",
            },
            {
              value: "following",
              label: `Following (${userProfile.followingCount})`,
              icon: "fa-user-plus",
            },
            {
              value: "achievements",
              label: `Achievements (${userProfile.achievementCount})`,
              icon: "fa-trophy",
            },
          ]}
          {activeTab}
          onchange={(tab) =>
            (activeTab = tab as
              | "sequences"
              | "followers"
              | "following"
              | "achievements")}
        />
      </div>

      <!-- Tab content -->
      <div class="profile-tab-content">
        {#if activeTab === "sequences"}
          {#if userSequences.length === 0}
            <PanelState
              type="empty"
              icon="fa-list"
              title="No Sequences"
              message="No sequences yet"
            />
          {:else}
            <div class="sequences-grid">
              {#each userSequences as sequence (sequence.id)}
                <button
                  class="sequence-card"
                  onclick={() => handleSequenceClick(sequence)}
                  transition:fade={{ duration: 200 }}
                >
                  <!-- Sequence thumbnail (if available) -->
                  {#if sequence.thumbnails && sequence.thumbnails.length > 0}
                    <div class="sequence-thumbnail">
                      <img src={sequence.thumbnails[0]} alt={sequence.name} />
                    </div>
                  {:else}
                    <div class="sequence-thumbnail-placeholder">
                      <i class="fas fa-list"></i>
                    </div>
                  {/if}

                  <!-- Sequence info -->
                  <div class="sequence-info">
                    <h3 class="sequence-name">
                      {sequence.name || sequence.word}
                    </h3>

                    <div class="sequence-meta">
                      {#if sequence.dateAdded}
                        <span class="meta-item">
                          <i class="fas fa-clock"></i>
                          {new Date(sequence.dateAdded).toLocaleDateString()}
                        </span>
                      {/if}
                      {#if sequence.beats && sequence.beats.length > 0}
                        <span class="meta-item">
                          <i class="fas fa-music"></i>
                          {sequence.beats.length} beats
                        </span>
                      {/if}
                    </div>
                  </div>
                </button>
              {/each}
            </div>
          {/if}
        {:else if activeTab === "followers"}
          {#if followersLoading}
            <PanelState type="loading" message="Loading followers..." />
          {:else if followerUsers.length === 0}
            <PanelState
              type="empty"
              icon="fa-users"
              title="No Followers Yet"
              message="This user doesn't have any followers yet"
            />
          {:else}
            <div class="user-list-grid">
              {#each followerUsers as user (user.id)}
                <button
                  class="user-list-card"
                  onclick={() => handleUserCardClick(user)}
                  transition:fade={{ duration: 200 }}
                >
                  <div class="user-list-avatar">
                    {#if user.avatar && !followerAvatarErrors.has(user.id)}
                      <img
                        src={user.avatar}
                        alt={user.displayName}
                        crossorigin="anonymous"
                        referrerpolicy="no-referrer"
                        onerror={() => handleFollowerAvatarError(user.id)}
                      />
                    {:else}
                      <div class="user-list-avatar-placeholder">
                        <i class="fas fa-user"></i>
                      </div>
                    {/if}
                  </div>
                  <div class="user-list-info">
                    <h4 class="user-list-name">{user.displayName}</h4>
                    <p class="user-list-username">@{user.username}</p>
                  </div>
                  <div class="user-list-stats">
                    <span class="user-list-stat">
                      <i class="fas fa-list"></i>
                      {user.sequenceCount}
                    </span>
                    <span class="user-list-stat">
                      <i class="fas fa-users"></i>
                      {user.followerCount}
                    </span>
                  </div>
                  <i class="fas fa-chevron-right user-list-arrow"></i>
                </button>
              {/each}
            </div>
          {/if}
        {:else if activeTab === "following"}
          {#if followingLoading}
            <PanelState type="loading" message="Loading following..." />
          {:else if followingUsers.length === 0}
            <PanelState
              type="empty"
              icon="fa-user-plus"
              title="Not Following Anyone"
              message="This user isn't following anyone yet"
            />
          {:else}
            <div class="user-list-grid">
              {#each followingUsers as user (user.id)}
                <button
                  class="user-list-card"
                  onclick={() => handleUserCardClick(user)}
                  transition:fade={{ duration: 200 }}
                >
                  <div class="user-list-avatar">
                    {#if user.avatar && !followingAvatarErrors.has(user.id)}
                      <img
                        src={user.avatar}
                        alt={user.displayName}
                        crossorigin="anonymous"
                        referrerpolicy="no-referrer"
                        onerror={() => handleFollowingAvatarError(user.id)}
                      />
                    {:else}
                      <div class="user-list-avatar-placeholder">
                        <i class="fas fa-user"></i>
                      </div>
                    {/if}
                  </div>
                  <div class="user-list-info">
                    <h4 class="user-list-name">{user.displayName}</h4>
                    <p class="user-list-username">@{user.username}</p>
                  </div>
                  <div class="user-list-stats">
                    <span class="user-list-stat">
                      <i class="fas fa-list"></i>
                      {user.sequenceCount}
                    </span>
                    <span class="user-list-stat">
                      <i class="fas fa-users"></i>
                      {user.followerCount}
                    </span>
                  </div>
                  <i class="fas fa-chevron-right user-list-arrow"></i>
                </button>
              {/each}
            </div>
          {/if}
        {:else if activeTab === "achievements"}
          {#if userProfile.topAchievements.length === 0}
            <PanelState
              type="empty"
              icon="fa-trophy"
              title="No Achievements"
              message="No achievements yet"
            />
          {:else}
            <div class="user-profile-achievements-grid">
              {#each userProfile.topAchievements as achievement (achievement.id)}
                <div
                  class="achievement-card"
                  transition:fade={{ duration: 200 }}
                >
                  <div class="achievement-icon tier-{achievement.tier}">
                    <i class="fas {achievement.icon}"></i>
                  </div>
                  <div class="achievement-info">
                    <h4 class="achievement-name">{achievement.title}</h4>
                    <p class="achievement-description">
                      {achievement.description}
                    </p>
                    <div class="achievement-meta">
                      <span class="tier-badge tier-{achievement.tier}">
                        {achievement.tier}
                      </span>
                      <span class="xp-badge">
                        <i class="fas fa-bolt"></i>
                        {achievement.xpReward} XP
                      </span>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .profile-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: transparent;
  }

  /* ============================================================================
     ERROR WITH ACTION
     ============================================================================ */
  .error-with-action {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    width: 100%;
    height: 100%;
    padding: 40px 20px;
  }

  /* ============================================================================
     HEADER
     ============================================================================ */
  .profile-header {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid
      var(--card-border-current, rgba(255, 255, 255, 0.1));
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--card-bg-current, rgba(255, 255, 255, 0.06));
    border: 1px solid var(--card-border-current, rgba(255, 255, 255, 0.1));
    border-radius: 8px;
    color: var(--text-primary-current, white);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-btn:hover {
    background: var(--card-hover-current, rgba(255, 255, 255, 0.1));
    border-color: rgba(255, 255, 255, 0.2);
  }

  .back-btn i {
    font-size: 14px;
  }

  /* ============================================================================
     SCROLLABLE CONTENT
     ============================================================================ */
  .profile-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    min-height: 0;
  }

  /* ============================================================================
     HERO SECTION
     ============================================================================ */
  .hero-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 20px;
    background: var(--card-bg-current, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--card-border-current, rgba(255, 255, 255, 0.08));
    border-radius: 16px;
    margin-bottom: 24px;
  }

  .avatar-container {
    position: relative;
    width: 120px;
    height: 120px;
  }

  .avatar,
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
    border: 3px solid rgba(255, 255, 255, 0.2);
  }

  .avatar-placeholder i {
    font-size: 48px;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.4));
  }

  .level-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    border: 2px solid rgba(0, 0, 0, 0.2);
    border-radius: 20px;
    font-size: 14px;
    font-weight: 700;
    color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .level-badge i {
    font-size: 12px;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  .display-name {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary-current, white);
    text-align: center;
  }

  .username {
    margin: 0;
    font-size: 16px;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.6));
  }

  .bio {
    margin: 8px 0 0 0;
    font-size: 14px;
    line-height: 1.5;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.7));
    text-align: center;
    max-width: 400px;
  }

  .follow-button {
    margin-top: 16px;
    padding: 12px 32px;
    background: #06b6d4;
    border: 1px solid #06b6d4;
    border-radius: 8px;
    color: white;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .follow-button:hover {
    filter: brightness(0.9);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px color-mix(in srgb, #06b6d4 40%, transparent);
  }

  .follow-button.following {
    background: var(--card-bg-current, rgba(255, 255, 255, 0.1));
    border-color: var(--card-border-current, rgba(255, 255, 255, 0.2));
    color: var(--text-primary-current, rgba(255, 255, 255, 0.9));
  }

  .follow-button.following:hover {
    background: var(--card-hover-current, rgba(255, 255, 255, 0.15));
    border-color: rgba(255, 255, 255, 0.3);
    filter: none;
  }

  .follow-button.loading {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .follow-button:disabled {
    pointer-events: none;
  }

  /* ============================================================================
     STATS GRID
     ============================================================================ */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    margin-bottom: 24px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: var(--card-bg-current, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--card-border-current, rgba(255, 255, 255, 0.08));
    border-radius: 12px;
    transition: all 0.2s ease;
  }

  .stat-card:hover {
    background: var(--card-hover-current, rgba(255, 255, 255, 0.06));
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
  }

  .stat-icon {
    font-size: 24px;
    color: #06b6d4;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stat-value {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary-current, white);
  }

  .stat-label {
    font-size: 12px;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.6));
  }

  /* ============================================================================
     RANKINGS SECTION
     ============================================================================ */
  .rankings-section {
    margin-bottom: 24px;
    text-align: center;
  }

  .rankings-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.7));
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .rankings-title i {
    font-size: 14px;
  }

  .rankings-badges {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }

  .rank-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px 18px;
    background: var(--card-bg-current, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--card-border-current, rgba(255, 255, 255, 0.08));
    border-radius: 12px;
    min-width: 80px;
  }

  .rank-value {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary-current, white);
    line-height: 1.2;
  }

  .rank-label {
    font-size: 11px;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.5));
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 2px;
  }

  .rankings-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.5));
    font-size: 14px;
  }

  /* ============================================================================
     TABS WRAPPER
     ============================================================================ */
  .tabs-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }

  /* ============================================================================
     TAB CONTENT
     ============================================================================ */
  .profile-tab-content {
    min-height: 400px;
  }

  /* ============================================================================
     SEQUENCES GRID
     ============================================================================ */
  .sequences-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .sequence-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: var(--card-bg-current, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--card-border-current, rgba(255, 255, 255, 0.08));
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .sequence-card:hover {
    background: var(--card-hover-current, rgba(255, 255, 255, 0.06));
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .sequence-thumbnail,
  .sequence-thumbnail-placeholder {
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 8px;
    overflow: hidden;
  }

  .sequence-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .sequence-thumbnail-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--card-bg-current, rgba(255, 255, 255, 0.06));
    border: 1px solid var(--card-border-current, rgba(255, 255, 255, 0.1));
  }

  .sequence-thumbnail-placeholder i {
    font-size: 32px;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.3));
  }

  .sequence-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sequence-name {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary-current, white);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sequence-description {
    margin: 0;
    font-size: 13px;
    line-height: 1.4;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.6));
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .sequence-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.5));
  }

  .meta-item i {
    font-size: 11px;
  }

  /* ============================================================================
     USER LIST GRID (Followers / Following)
     ============================================================================ */
  .user-list-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .user-list-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: var(--card-bg-current, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--card-border-current, rgba(255, 255, 255, 0.08));
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    width: 100%;
  }

  .user-list-card:hover {
    background: var(--card-hover-current, rgba(255, 255, 255, 0.06));
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateX(4px);
  }

  .user-list-avatar {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
  }

  .user-list-avatar img,
  .user-list-avatar-placeholder {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .user-list-avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  .user-list-avatar-placeholder i {
    font-size: 20px;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.4));
  }

  .user-list-info {
    flex: 1;
    min-width: 0;
  }

  .user-list-name {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary-current, white);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-list-username {
    margin: 2px 0 0 0;
    font-size: 13px;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.6));
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-list-stats {
    display: flex;
    gap: 12px;
    flex-shrink: 0;
  }

  .user-list-stat {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.5));
  }

  .user-list-stat i {
    font-size: 11px;
  }

  .user-list-arrow {
    font-size: 12px;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.3));
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }

  .user-list-card:hover .user-list-arrow {
    transform: translateX(4px);
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.5));
  }

  /* ============================================================================
     ACHIEVEMENTS GRID
     ============================================================================ */
  .user-profile-achievements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  .achievement-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: var(--card-bg-current, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--card-border-current, rgba(255, 255, 255, 0.08));
    border-radius: 12px;
    transition: all 0.2s ease;
  }

  .achievement-card:hover {
    background: var(--card-hover-current, rgba(255, 255, 255, 0.06));
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
  }

  .achievement-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: color-mix(in srgb, #06b6d4 20%, transparent);
    border-radius: 50%;
    flex-shrink: 0;
    border: 2px solid color-mix(in srgb, #06b6d4 30%, transparent);
  }

  .achievement-icon.tier-bronze {
    background: rgba(205, 127, 50, 0.2);
    border-color: rgba(205, 127, 50, 0.4);
  }

  .achievement-icon.tier-silver {
    background: rgba(192, 192, 192, 0.2);
    border-color: rgba(192, 192, 192, 0.4);
  }

  .achievement-icon.tier-gold {
    background: rgba(255, 215, 0, 0.2);
    border-color: rgba(255, 215, 0, 0.4);
  }

  .achievement-icon.tier-platinum {
    background: rgba(229, 228, 226, 0.2);
    border-color: rgba(229, 228, 226, 0.4);
  }

  .achievement-icon-emoji {
    font-size: 32px;
  }

  .achievement-info {
    flex: 1;
  }

  .achievement-name {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary-current, white);
  }

  .achievement-description {
    margin: 0 0 8px 0;
    font-size: 13px;
    line-height: 1.4;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.6));
  }

  .achievement-meta {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .tier-badge,
  .xp-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: capitalize;
  }

  .tier-badge.tier-bronze {
    background: rgba(205, 127, 50, 0.2);
    color: rgb(205, 127, 50);
  }

  .tier-badge.tier-silver {
    background: rgba(192, 192, 192, 0.2);
    color: rgb(192, 192, 192);
  }

  .tier-badge.tier-gold {
    background: rgba(255, 215, 0, 0.2);
    color: rgb(255, 215, 0);
  }

  .tier-badge.tier-platinum {
    background: rgba(229, 228, 226, 0.2);
    color: rgb(229, 228, 226);
  }

  .xp-badge {
    background: color-mix(in srgb, #06b6d4 20%, transparent);
    color: #06b6d4;
  }

  .xp-badge i {
    font-size: 10px;
  }

  /* ============================================================================
     RESPONSIVE
     ============================================================================ */
  @media (max-width: 768px) {
    .profile-content {
      padding: 16px;
    }

    .hero-section {
      padding: 16px;
    }

    .avatar-container {
      width: 100px;
      height: 100px;
    }

    .display-name {
      font-size: 24px;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .stat-card {
      padding: 12px;
    }

    .sequences-grid {
      grid-template-columns: 1fr;
    }

    .user-profile-achievements-grid {
      grid-template-columns: 1fr;
    }

    .back-text {
      display: none;
    }
  }

  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .stat-card {
      flex-direction: column;
      text-align: center;
      padding: 10px;
    }

    .stat-icon {
      font-size: 20px;
    }

    .stat-value {
      font-size: 18px;
    }

    .stat-label {
      font-size: 11px;
    }
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .stat-card,
    .sequence-card,
    .achievement-card,
    .user-list-card,
    .follow-button,
    .back-btn {
      transition: none;
    }

    .stat-card:hover,
    .sequence-card:hover,
    .achievement-card:hover,
    .user-list-card:hover,
    .follow-button:hover {
      transform: none;
    }

    .user-list-arrow,
    .user-list-card:hover .user-list-arrow {
      transition: none;
      transform: none;
    }
  }
</style>
