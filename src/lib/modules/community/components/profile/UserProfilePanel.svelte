<script lang="ts">
  /**
   * UserProfilePanel
   * Comprehensive user profile view with sequences, stats, and achievements
   * Responsive design for mobile and desktop
   */

  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { resolve, TYPES } from "$shared";
  import type { IEnhancedUserService } from "../../services/contracts/IEnhancedUserService";
  import type { ISequenceService } from "$create/shared/services/contracts";
  import type { EnhancedUserProfile } from "../../domain/models/enhanced-user-profile";
  import type { SequenceData } from "$shared";
  import { communityViewState } from "../../state/community-view-state.svelte";

  interface Props {
    userId: string;
  }

  let { userId }: Props = $props();

  let userProfile = $state<EnhancedUserProfile | null>(null);
  let userSequences = $state<SequenceData[]>([]);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let activeTab = $state<"sequences" | "collections" | "achievements">(
    "sequences"
  );

  // Services
  let userService: IEnhancedUserService;
  let sequenceService: ISequenceService;

  onMount(async () => {
    try {
      console.log(`🔍 [UserProfilePanel] Loading profile for user: ${userId}`);

      // Resolve services
      userService = resolve<IEnhancedUserService>(TYPES.IEnhancedUserService);
      sequenceService = resolve<ISequenceService>(TYPES.ISequenceService);

      // Load user profile
      userProfile = await userService.getEnhancedUserProfile(userId);

      if (!userProfile) {
        error = "User not found";
        isLoading = false;
        return;
      }

      // Load user's sequences
      // Note: Currently filtering by metadata.userId since SequenceData doesn't have a direct userId field
      const allSequences = await sequenceService.getAllSequences();
      userSequences = allSequences.filter(
        (seq) => seq.metadata?.userId === userId || seq.author === userId
      );

      isLoading = false;
      console.log(
        `✅ [UserProfilePanel] Loaded profile with ${userSequences.length} sequences`
      );
    } catch (err) {
      console.error(`❌ [UserProfilePanel] Error loading profile:`, err);
      error = err instanceof Error ? err.message : "Failed to load profile";
      isLoading = false;
    }
  });

  function handleBack() {
    communityViewState.goBack();
  }

  function handleFollowToggle() {
    console.log("Toggle follow for user:", userId);
    // TODO: Implement follow/unfollow functionality
  }

  function handleSequenceClick(sequence: SequenceData) {
    console.log("Open sequence:", sequence.id);
    // TODO: Navigate to sequence detail/animator view
  }
</script>

<div class="profile-panel">
  {#if isLoading}
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading profile...</p>
    </div>
  {:else if error || !userProfile}
    <div class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>{error || "User not found"}</p>
      <button class="back-button" onclick={handleBack}>
        <i class="fas fa-arrow-left"></i>
        Go Back
      </button>
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
          {#if userProfile.avatar}
            <img
              src={userProfile.avatar}
              alt={userProfile.displayName}
              class="avatar"
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

          <!-- Action button -->
          <button
            class="follow-button"
            class:following={userProfile.isFollowing}
            onclick={handleFollowToggle}
          >
            {userProfile.isFollowing ? "Following" : "Follow"}
          </button>
        </div>
      </div>

      <!-- Stats grid -->
      <div class="stats-grid" transition:fly={{ y: 20, duration: 300, delay: 100 }}>
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
          <i class="fas fa-trophy stat-icon"></i>
          <div class="stat-content">
            <span class="stat-value">{userProfile.achievementCount}</span>
            <span class="stat-label">Achievements</span>
          </div>
        </div>

        <div class="stat-card">
          <i class="fas fa-bolt stat-icon"></i>
          <div class="stat-content">
            <span class="stat-value">{userProfile.totalXP.toLocaleString()}</span>
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

      <!-- Tab navigation -->
      <div class="tab-navigation" transition:fly={{ y: 20, duration: 300, delay: 200 }}>
        <button
          class="tab-button"
          class:active={activeTab === "sequences"}
          onclick={() => (activeTab = "sequences")}
        >
          <i class="fas fa-list"></i>
          <span>Sequences ({userSequences.length})</span>
        </button>

        <button
          class="tab-button"
          class:active={activeTab === "collections"}
          onclick={() => (activeTab = "collections")}
        >
          <i class="fas fa-folder"></i>
          <span>Collections ({userProfile.collectionCount})</span>
        </button>

        <button
          class="tab-button"
          class:active={activeTab === "achievements"}
          onclick={() => (activeTab = "achievements")}
        >
          <i class="fas fa-trophy"></i>
          <span>Achievements ({userProfile.achievementCount})</span>
        </button>
      </div>

      <!-- Tab content -->
      <div class="tab-content">
        {#if activeTab === "sequences"}
          {#if userSequences.length === 0}
            <div class="empty-state">
              <i class="fas fa-list"></i>
              <p>No sequences yet</p>
            </div>
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
                    <h3 class="sequence-name">{sequence.name || sequence.word}</h3>

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
        {:else if activeTab === "collections"}
          <div class="empty-state">
            <i class="fas fa-folder"></i>
            <p>Collections coming soon</p>
          </div>
        {:else if activeTab === "achievements"}
          {#if userProfile.topAchievements.length === 0}
            <div class="empty-state">
              <i class="fas fa-trophy"></i>
              <p>No achievements yet</p>
            </div>
          {:else}
            <div class="achievements-grid">
              {#each userProfile.topAchievements as achievement (achievement.id)}
                <div class="achievement-card" transition:fade={{ duration: 200 }}>
                  <div class="achievement-icon tier-{achievement.tier}">
                    <span class="achievement-icon-emoji">{achievement.icon}</span>
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
                        <i class="fas fa-bolt"></i> {achievement.xpReward} XP
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
     STATES
     ============================================================================ */
  .loading-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    width: 100%;
    height: 100%;
    padding: 40px 20px;
  }

  .loading-state i,
  .error-state i {
    font-size: 48px;
    color: rgba(255, 255, 255, 0.3);
  }

  .error-state i {
    color: rgba(239, 68, 68, 0.7);
  }

  .loading-state p,
  .error-state p {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }

  .back-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  /* ============================================================================
     HEADER
     ============================================================================ */
  .profile-header {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.1);
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
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
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
    color: rgba(255, 255, 255, 0.4);
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
    color: white;
    text-align: center;
  }

  .username {
    margin: 0;
    font-size: 16px;
    color: rgba(255, 255, 255, 0.6);
  }

  .bio {
    margin: 8px 0 0 0;
    font-size: 14px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.7);
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
    background: #0891b2;
    border-color: #0891b2;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
  }

  .follow-button.following {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
  }

  .follow-button.following:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
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
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    transition: all 0.2s ease;
  }

  .stat-card:hover {
    background: rgba(255, 255, 255, 0.06);
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
    color: white;
  }

  .stat-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }

  /* ============================================================================
     TAB NAVIGATION
     ============================================================================ */
  .tab-navigation {
    display: flex;
    gap: 8px;
    padding: 8px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 12px;
    margin-bottom: 24px;
    overflow-x: auto;
  }

  .tab-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .tab-button:hover {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.8);
  }

  .tab-button.active {
    background: rgba(6, 182, 212, 0.2);
    color: #06b6d4;
  }

  .tab-button i {
    font-size: 14px;
  }

  /* ============================================================================
     TAB CONTENT
     ============================================================================ */
  .tab-content {
    min-height: 400px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 60px 20px;
  }

  .empty-state i {
    font-size: 48px;
    color: rgba(255, 255, 255, 0.2);
  }

  .empty-state p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
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
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .sequence-card:hover {
    background: rgba(255, 255, 255, 0.06);
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
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .sequence-thumbnail-placeholder i {
    font-size: 32px;
    color: rgba(255, 255, 255, 0.3);
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
    color: white;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sequence-description {
    margin: 0;
    font-size: 13px;
    line-height: 1.4;
    color: rgba(255, 255, 255, 0.6);
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
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
    color: rgba(255, 255, 255, 0.5);
  }

  .meta-item i {
    font-size: 11px;
  }

  /* ============================================================================
     ACHIEVEMENTS GRID
     ============================================================================ */
  .achievements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
  }

  .achievement-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    transition: all 0.2s ease;
  }

  .achievement-card:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
  }

  .achievement-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: rgba(6, 182, 212, 0.2);
    border-radius: 50%;
    flex-shrink: 0;
    border: 2px solid rgba(6, 182, 212, 0.3);
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
    color: white;
  }

  .achievement-description {
    margin: 0 0 8px 0;
    font-size: 13px;
    line-height: 1.4;
    color: rgba(255, 255, 255, 0.6);
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
    background: rgba(6, 182, 212, 0.2);
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

    .tab-button span {
      display: none;
    }

    .tab-button {
      padding: 12px 16px;
    }

    .sequences-grid {
      grid-template-columns: 1fr;
    }

    .achievements-grid {
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
</style>
