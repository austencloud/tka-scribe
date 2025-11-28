<script lang="ts">
  /**
   * UserCard
   * Displays a user in the user list with avatar, info, and stats
   */
  import { ROLE_DISPLAY } from "$shared/auth/domain/models/UserRole";
  import type { UserData } from "./types";
  import { getRoleColor, getRoleIcon, getInitials } from "./utils";

  interface Props {
    user: UserData;
    isSelected?: boolean;
    onclick?: () => void;
  }

  let { user, isSelected = false, onclick }: Props = $props();
</script>

<button
  class="user-card"
  class:selected={isSelected}
  class:disabled={user.isDisabled}
  {onclick}
>
  <div class="user-avatar">
    {#if user.photoURL}
      <img
        src={user.photoURL}
        alt={user.displayName}
        crossorigin="anonymous"
        referrerpolicy="no-referrer"
      />
    {:else}
      <span class="initials">{getInitials(user.displayName)}</span>
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
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    width: 100%;
    color: inherit;
  }

  .user-card:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .user-card.selected {
    background: rgba(59, 130, 246, 0.12);
    border-color: rgba(59, 130, 246, 0.4);
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
  }

  .user-card.disabled {
    opacity: 0.6;
  }

  .user-avatar {
    position: relative;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    overflow: visible;
    flex-shrink: 0;
  }

  .user-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .user-avatar .initials {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    font-weight: 600;
    font-size: 14px;
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
    border: 2px solid rgba(10, 10, 15, 0.9);
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
    color: rgba(255, 255, 255, 0.6);
    gap: 2px;
  }
</style>
