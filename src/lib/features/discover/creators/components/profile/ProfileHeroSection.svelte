<script lang="ts">
  import { fade } from "svelte/transition";
  import type { EnhancedUserProfile } from "$lib/shared/community/domain/models/enhanced-user-profile";
  import AvatarImage from "./AvatarImage.svelte";

  let {
    userProfile,
    currentUserId,
    isOwnProfile,
    followInProgress,
    onFollowToggle,
  }: {
    userProfile: EnhancedUserProfile;
    currentUserId?: string | null;
    isOwnProfile: boolean;
    followInProgress: boolean;
    onFollowToggle: () => void;
  } = $props();
</script>

<div class="hero-section" transition:fade={{ duration: 300 }}>
  <div class="avatar-container">
    <AvatarImage
      src={userProfile.avatar}
      alt={userProfile.displayName}
      size={120}
      className="avatar"
    />

    <div class="level-badge">
      <i class="fas fa-star" aria-hidden="true"></i>
      <span>{userProfile.currentLevel}</span>
    </div>
  </div>

  <div class="user-info">
    <h1 class="display-name">{userProfile.displayName}</h1>
    <p class="username">@{userProfile.username}</p>

    {#if userProfile.bio}
      <p class="bio">{userProfile.bio}</p>
    {/if}

    {#if currentUserId && !isOwnProfile}
      <button
        class="follow-button"
        class:following={userProfile.isFollowing}
        class:loading={followInProgress}
        disabled={followInProgress}
        onclick={onFollowToggle}
      >
        {#if followInProgress}
          <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
        {:else}
          {userProfile.isFollowing ? "Following" : "Follow"}
        {/if}
      </button>
    {/if}
  </div>
</div>

<style>
  .hero-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 20px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 16px;
    margin-bottom: 24px;
  }

  .avatar-container {
    position: relative;
    width: 120px;
    height: 120px;
  }

  .level-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    display: inline-flex;
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
    color: var(--theme-text, white);
    text-align: center;
  }

  .username {
    margin: 0;
    font-size: 16px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
  }

  .bio {
    margin: 8px 0 0 0;
    font-size: 14px;
    line-height: 1.5;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    text-align: center;
    max-width: 400px;
  }

  .follow-button {
    margin-top: 16px;
    padding: 12px 32px;
    background: var(--theme-accent, #a855f7);
    border: 1px solid var(--theme-accent, #a855f7);
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
    box-shadow: 0 4px 12px
      color-mix(in srgb, var(--theme-accent, #a855f7) 40%, transparent);
  }

  .follow-button.following {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.1));
    border-color: var(--theme-stroke, rgba(255, 255, 255, 0.2));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .follow-button.following:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.15));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.3));
    filter: none;
  }

  .follow-button.loading {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .follow-button:disabled {
    pointer-events: none;
  }

  @media (max-width: 768px) {
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
  }

  @media (prefers-reduced-motion: reduce) {
    .follow-button {
      transition: none;
    }

    .follow-button:hover {
      transform: none;
    }
  }
</style>
