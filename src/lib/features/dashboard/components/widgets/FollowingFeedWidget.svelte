<script lang="ts">
  /**
   * FollowingFeedWidget - Activity from followed users
   *
   * Shows recent activity from creators the current user follows.
   * Displays: sequences created, sequences favorited, achievements earned
   */

  import { onMount } from "svelte";
  import { tryResolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type {
    IFollowingFeedService,
    FollowingFeedItem,
  } from "$lib/features/dashboard/services/contracts/IFollowingFeedService";
  import { handleModuleChange } from "$lib/shared/navigation-coordinator/navigation-coordinator.svelte";
  import FeedItem from "./feed/FeedItem.svelte";

  // State
  let isLoading = $state(true);
  let feedItems = $state<FollowingFeedItem[]>([]);
  let hasFollowing = $state(false);
  let error = $state<string | null>(null);

  onMount(async () => {
    try {
      const feedService = tryResolve<IFollowingFeedService>(
        TYPES.IFollowingFeedService
      );

      if (!feedService) {
        isLoading = false;
        return;
      }

      // Check if user follows anyone
      hasFollowing = await feedService.hasFollowing();

      if (hasFollowing) {
        // Fetch the feed
        feedItems = await feedService.getFollowingFeed({
          limit: 8,
          daysBack: 7,
        });
      }
    } catch (e) {
      console.warn("[FollowingFeed] Failed to load feed:", e);
      error = "Unable to load feed";
    } finally {
      isLoading = false;
    }
  });

  async function viewCreators() {
    await handleModuleChange("discover", "creators");
  }
</script>

<div class="following-widget">
  <div class="widget-header">
    <div class="header-icon">
      <i class="fas fa-user-friends"></i>
    </div>
    <h3>Following</h3>
  </div>

  <div class="widget-content">
    {#if isLoading}
      <div class="loading-state">
        <div class="skeleton-list">
          {#each Array(3) as _}
            <div class="skeleton-item">
              <div class="skeleton-avatar"></div>
              <div class="skeleton-text">
                <div class="skeleton-line short"></div>
                <div class="skeleton-line long"></div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {:else if error}
      <div class="empty-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>{error}</p>
      </div>
    {:else if !hasFollowing}
      <div class="empty-state">
        <i class="fas fa-user-plus"></i>
        <p>Not following anyone yet</p>
        <span class="empty-hint">Follow creators to see their activity here</span>
      </div>
    {:else if feedItems.length === 0}
      <div class="empty-state">
        <i class="fas fa-stream"></i>
        <p>No recent activity</p>
        <span class="empty-hint">Your followed creators haven't posted lately</span>
      </div>
    {:else}
      <div class="feed-list">
        {#each feedItems as item (item.id)}
          <FeedItem {item} />
        {/each}
      </div>
    {/if}
  </div>

  <button class="view-all-btn" onclick={viewCreators}>
    <span>Discover Creators</span>
    <i class="fas fa-arrow-right"></i>
  </button>
</div>

<style>
  .following-widget {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
    padding: 24px;
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.6));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 24px;
    overflow: hidden;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  }

  .widget-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 20px;
  }

  .header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: color-mix(
      in srgb,
      var(--theme-accent, #6366f1) 25%,
      var(--theme-card-bg, rgba(0, 0, 0, 0.3))
    );
    border-radius: 14px;
    color: var(--theme-accent, #6366f1);
    font-size: 18px;
  }

  .widget-header h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .widget-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 140px;
    overflow-y: auto;
  }

  /* Loading skeleton */
  .skeleton-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .skeleton-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: color-mix(
      in srgb,
      var(--theme-accent, #6366f1) 5%,
      transparent
    );
    border-radius: 12px;
  }

  .skeleton-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--theme-accent, #6366f1) 8%, transparent) 25%,
      color-mix(in srgb, var(--theme-accent, #6366f1) 15%, transparent) 50%,
      color-mix(in srgb, var(--theme-accent, #6366f1) 8%, transparent) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 2s infinite ease-in-out;
  }

  .skeleton-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .skeleton-line {
    height: 10px;
    border-radius: 5px;
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--theme-accent, #6366f1) 8%, transparent) 25%,
      color-mix(in srgb, var(--theme-accent, #6366f1) 15%, transparent) 50%,
      color-mix(in srgb, var(--theme-accent, #6366f1) 8%, transparent) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 2s infinite ease-in-out;
  }

  .skeleton-line.short {
    width: 60%;
  }

  .skeleton-line.long {
    width: 90%;
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    text-align: center;
    padding: 20px;
    flex: 1;
  }

  .empty-state i {
    font-size: 32px;
    color: color-mix(in srgb, var(--theme-accent, #6366f1) 40%, transparent);
  }

  .empty-state p {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .empty-hint {
    font-size: 0.8125rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  /* Feed list */
  .feed-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .view-all-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: var(--min-touch-target);
    padding: 14px 20px;
    background: linear-gradient(
      135deg,
      var(--theme-accent, #6366f1) 0%,
      color-mix(in srgb, var(--theme-accent, #6366f1) 80%, black) 100%
    );
    border: none;
    border-radius: 14px;
    color: white;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 150ms ease;
    margin-top: auto;
  }

  .view-all-btn:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  .view-all-btn i {
    font-size: 14px;
  }

  @media (max-width: 768px) {
    .following-widget {
      padding: 20px;
      border-radius: 20px;
    }

    .header-icon {
      width: 40px;
      height: 40px;
      font-size: 16px;
    }

    .widget-header h3 {
      font-size: 1rem;
    }

    .view-all-btn {
      min-height: 44px;
      padding: 12px 16px;
      font-size: 0.875rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton-avatar,
    .skeleton-line {
      animation: none;
      background: rgba(99, 102, 241, 0.1);
    }

    .view-all-btn {
      transition: none;
    }

    .view-all-btn:hover {
      transform: none;
    }
  }
</style>
