<script lang="ts">
  /**
   * UserProfilePanel
   * Comprehensive user profile view with sequences, stats, and achievements
   * Responsive design for mobile and desktop
   *
   * Refactored to use shared panel components and CSS variables.
   */

  import { onMount } from "svelte";
  import { resolve } from "$lib/shared/inversify";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { PanelButton } from "$lib/shared/components/panel";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte.ts";
  import type { IUserService } from "../../services/contracts/IUserService";
  import type { ILeaderboardService } from "../../services/contracts/ILeaderboardService";
  import type { ILibraryService } from "$lib/features/library/services/contracts/ILibraryService";
  import type { LibrarySequence } from "$lib/features/library/domain/models/LibrarySequence";
  import type { EnhancedUserProfile } from "../../domain/models/enhanced-user-profile";
  import { communityViewState } from "../../state/community-view-state.svelte";
  import PanelState from "$lib/shared/components/panel/PanelState.svelte";
  import ProfileHeaderBar from "./components/ProfileHeaderBar.svelte";
  import ProfileHeroSection from "./components/ProfileHeroSection.svelte";
  import ProfileStatsGrid from "./components/ProfileStatsGrid.svelte";
  import ProfileRankings from "./components/ProfileRankings.svelte";
  import ProfileTabs from "./components/ProfileTabs.svelte";

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
    <ProfileHeaderBar onBack={handleBack} />

    <!-- Scrollable content -->
    <div class="profile-content">
      <ProfileHeroSection
        {userProfile}
        {currentUserId}
        {isOwnProfile}
        {followInProgress}
        onFollowToggle={handleFollowToggle}
      />

      <ProfileStatsGrid {userProfile} />

      <ProfileRankings {userRanks} {hasRanks} {isLoadingRanks} />

      <ProfileTabs
        {activeTab}
        {userProfile}
        {userSequences}
        {followerUsers}
        {followingUsers}
        {followersLoading}
        {followingLoading}
        onTabChange={(tab) => (activeTab = tab)}
        onSequenceClick={handleSequenceClick}
        onUserClick={handleUserCardClick}
      />
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

  .error-with-action {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    width: 100%;
    height: 100%;
    padding: 40px 20px;
  }

  .profile-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    min-height: 0;
  }

  @media (max-width: 768px) {
    .profile-content {
      padding: 16px;
    }
  }
</style>
