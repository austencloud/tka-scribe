<script lang="ts">
  /**
   * UserCard (Admin)
   * Displays a user in the user list with avatar-based dynamic colors
   * Horizontal layout optimized for admin two-panel view
   */
  import { ROLE_DISPLAY } from "$lib/shared/auth/domain/models/UserRole";
  import type { UserData } from "./types";
  import { getRoleColor, getRoleIcon, getInitials } from "./utils";

  interface Props {
    user: UserData;
    accentColor?: string;
    isSelected?: boolean;
    onclick?: () => void;
    onAvatarLoad?: (img: HTMLImageElement) => void;
    onAvatarError?: (img: HTMLImageElement) => void;
  }

  let {
    user,
    accentColor = "#8b5cf6",
    isSelected = false,
    onclick,
    onAvatarLoad,
    onAvatarError,
  }: Props = $props();
</script>

<button
  class="user-card"
  class:selected={isSelected}
  class:disabled={user.isDisabled}
  style="--card-accent: {accentColor}"
  {onclick}
>
  <div class="user-avatar">
    {#if user.photoURL}
      <img
        src={user.photoURL}
        alt={user.displayName}
        crossorigin="anonymous"
        referrerpolicy="no-referrer"
        onload={(e) => onAvatarLoad?.(e.currentTarget as HTMLImageElement)}
        onerror={(e) => onAvatarError?.(e.currentTarget as HTMLImageElement)}
      />
      <div class="avatar-placeholder" style="display: none;">
        <span class="initials">{getInitials(user.displayName)}</span>
      </div>
    {:else}
      <div class="avatar-placeholder">
        <span class="initials">{getInitials(user.displayName)}</span>
      </div>
    {/if}
    {#if user.role !== "user"}
      <span
        class="role-badge"
        title={ROLE_DISPLAY[user.role].label}
        style="background: {getRoleColor(user.role)}"
      >
        <i class="fas {getRoleIcon(user.role)}"></i>
      </span>
    {/if}
  </div>
  <div class="user-info">
    <span class="user-name">{user.displayName}</span>
    <span class="user-email">{user.email}</span>
  </div>
  <div class="user-stats">
    <span title="Level">Lv.{user.currentLevel}</span>
    <span title="XP">{user.totalXP.toLocaleString()} XP</span>
  </div>
</button>

<style>
  .user-card {
    --card-accent: #8b5cf6;
    --card-accent-light: color-mix(in srgb, var(--card-accent) 80%, #fff);
    --card-accent-glow: color-mix(in srgb, var(--card-accent) 25%, transparent);

    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    /* Dynamic gradient background */
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--card-accent) 8%, rgba(255, 255, 255, 0.03)) 0%,
      color-mix(in srgb, var(--card-accent) 4%, rgba(255, 255, 255, 0.02)) 100%
    );
    border: 1px solid color-mix(in srgb, var(--card-accent) 15%, transparent);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    width: 100%;
    color: inherit;
  }

  .user-card:hover {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--card-accent) 14%, rgba(255, 255, 255, 0.05)) 0%,
      color-mix(in srgb, var(--card-accent) 8%, rgba(255, 255, 255, 0.03)) 100%
    );
    border-color: color-mix(in srgb, var(--card-accent) 35%, transparent);
    box-shadow: 0 4px 16px var(--card-accent-glow);
  }

  .user-card.selected {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--card-accent) 18%, rgba(255, 255, 255, 0.06)) 0%,
      color-mix(in srgb, var(--card-accent) 12%, rgba(255, 255, 255, 0.04)) 100%
    );
    border-color: color-mix(in srgb, var(--card-accent) 50%, transparent);
    box-shadow: 0 0 0 2px var(--card-accent-glow);
  }

  .user-card.disabled {
    opacity: 0.6;
  }

  .user-avatar {
    position: relative;
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    /* Gradient ring */
    padding: 2px;
    background: linear-gradient(
      135deg,
      var(--card-accent) 0%,
      var(--card-accent-light) 100%
    );
    border-radius: 50%;
    transition: background 0.3s ease;
  }

  .user-avatar img,
  .avatar-placeholder {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    background: #1a1a2e;
  }

  .avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--card-accent) 20%, #1a1a2e) 0%,
      #1a1a2e 100%
    );
  }

  .initials {
    font-weight: 600;
    font-size: 14px;
    color: var(--card-accent-light);
  }

  .role-badge {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    color: #000;
    border: 2px solid #1a1a2e;
    z-index: 1;
  }

  .user-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .user-name {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-email {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-stats {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    font-size: 12px;
    color: var(--card-accent-light);
    opacity: 0.8;
    gap: 2px;
  }

  .user-card:hover .user-stats {
    opacity: 1;
  }
</style>
