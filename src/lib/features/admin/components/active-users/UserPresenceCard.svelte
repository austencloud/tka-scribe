<!-- UserPresenceCard.svelte - Compact user card with presence indicator -->
<script lang="ts">
  import type { UserPresenceWithId } from "$lib/shared/presence/domain/models/presence-models";
  import RobustAvatar from "$lib/shared/components/avatar/RobustAvatar.svelte";

  interface Props {
    user: UserPresenceWithId;
    isSelected: boolean;
    onSelect: () => void;
    formatLastSeen: (timestamp: number) => string;
  }

  let { user, isSelected, onSelect, formatLastSeen }: Props = $props();
</script>

<button
  class="user-card"
  class:selected={isSelected}
  class:online={user.online}
  onclick={onSelect}
>
  <div class="avatar">
    <RobustAvatar
      src={user.photoURL}
      alt={user.displayName ?? "User"}
      name={user.displayName}
      customSize={40}
    />
    <span class="presence-dot" class:online={user.online}></span>
  </div>

  <div class="info">
    <span class="name">{user.displayName ?? "Unknown"}</span>
    <span class="email">{user.email ?? ""}</span>
    {#if user.online && user.currentModule}
      <span class="location">
        <i class="fas fa-location-dot"></i>
        {user.currentModule}{user.currentTab ? ` / ${user.currentTab}` : ""}
      </span>
    {:else}
      <span class="last-seen">{formatLastSeen(user.lastSeen)}</span>
    {/if}
  </div>

  <div class="device">
    {#if user.device === "mobile"}
      <i class="fas fa-mobile-screen"></i>
    {:else if user.device === "tablet"}
      <i class="fas fa-tablet-screen-button"></i>
    {:else}
      <i class="fas fa-desktop"></i>
    {/if}
  </div>
</button>

<style>
  .user-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.15s ease;
    width: 100%;
    text-align: left;
  }

  .user-card:hover {
    background: var(--theme-hover, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-stroke-hover, rgba(255, 255, 255, 0.2));
  }

  .user-card.selected {
    background: var(--theme-accent-bg, rgba(99, 102, 241, 0.15));
    border-color: var(--theme-accent, #6366f1);
  }

  .user-card.online {
    border-left: 3px solid var(--semantic-success, #22c55e);
  }

  .avatar {
    position: relative;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
  }

  .presence-dot {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--theme-text-secondary, rgba(255, 255, 255, 0.4));
    border: 2px solid var(--theme-card-bg, #1a1a1a);
  }

  .presence-dot.online {
    background: var(--semantic-success, #22c55e);
  }

  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .name {
    font-weight: 500;
    color: var(--theme-text, #fff);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .email {
    font-size: 0.75rem;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.6));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .location {
    font-size: 0.75rem;
    color: var(--semantic-success, #22c55e);
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .last-seen {
    font-size: 0.75rem;
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.5));
  }

  .device {
    color: var(--theme-text-secondary, rgba(255, 255, 255, 0.4));
    font-size: 1rem;
  }
</style>
