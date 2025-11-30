<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import { PanelTabs } from "$lib/shared/components/panel";
  import PanelState from "$lib/shared/components/panel/PanelState.svelte";
  import type { LibrarySequence } from "$lib/modules/library/domain/models/LibrarySequence";
  import type {
    EnhancedUserProfile,
    UserProfile,
  } from "../../../domain/models/enhanced-user-profile";
  import AvatarImage from "./AvatarImage.svelte";

  type ProfileTab = "sequences" | "followers" | "following" | "achievements";

  let {
    activeTab,
    userProfile,
    userSequences = [],
    followerUsers = [],
    followingUsers = [],
    followersLoading = false,
    followingLoading = false,
    onTabChange,
    onSequenceClick,
    onUserClick,
  }: {
    activeTab: ProfileTab;
    userProfile: EnhancedUserProfile;
    userSequences?: readonly LibrarySequence[];
    followerUsers?: readonly UserProfile[];
    followingUsers?: readonly UserProfile[];
    followersLoading?: boolean;
    followingLoading?: boolean;
    onTabChange: (tab: ProfileTab) => void;
    onSequenceClick: (sequence: LibrarySequence) => void;
    onUserClick: (user: UserProfile) => void;
  } = $props();
</script>

<div class="tabs-wrapper" transition:fly={{ y: 20, duration: 300, delay: 200 }}>
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
    onchange={(tab) => onTabChange(tab as ProfileTab)}
  />
</div>

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
            onclick={() => onSequenceClick(sequence)}
            transition:fade={{ duration: 200 }}
          >
            {#if sequence.thumbnails && sequence.thumbnails.length > 0}
              <div class="sequence-thumbnail">
                <img src={sequence.thumbnails[0]} alt={sequence.name} />
              </div>
            {:else}
              <div class="sequence-thumbnail-placeholder">
                <i class="fas fa-list"></i>
              </div>
            {/if}

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
            onclick={() => onUserClick(user)}
            transition:fade={{ duration: 200 }}
          >
            <div class="user-list-avatar">
              <AvatarImage src={user.avatar} alt={user.displayName} size={48} />
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
            onclick={() => onUserClick(user)}
            transition:fade={{ duration: 200 }}
          >
            <div class="user-list-avatar">
              <AvatarImage src={user.avatar} alt={user.displayName} size={48} />
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
          <div class="achievement-card" transition:fade={{ duration: 200 }}>
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

<style>
  .tabs-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }

  .profile-tab-content {
    min-height: 400px;
  }

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

  @media (max-width: 768px) {
    .sequences-grid {
      grid-template-columns: 1fr;
    }

    .user-profile-achievements-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sequence-card,
    .achievement-card,
    .user-list-card {
      transition: none;
    }

    .sequence-card:hover,
    .achievement-card:hover,
    .user-list-card:hover {
      transform: none;
    }

    .user-list-arrow,
    .user-list-card:hover .user-list-arrow {
      transition: none;
      transform: none;
    }
  }
</style>
