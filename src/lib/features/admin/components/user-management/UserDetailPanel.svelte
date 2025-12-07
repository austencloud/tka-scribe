<script lang="ts">
  /**
   * UserDetailPanel
   * Detailed view of a selected user with info, stats, and actions
   */
  import type { UserRole } from "$lib/shared/auth/domain/models/UserRole";
  import { ROLE_DISPLAY } from "$lib/shared/auth/domain/models/UserRole";
  import type { UserData, UserActionType } from "./types";
  import { getRoleColor, getRoleIcon, getInitials, formatDate } from "./utils";
  import UserStatsGrid from "./UserStatsGrid.svelte";
  import RoleSelector from "./RoleSelector.svelte";
  import AccountActionsPanel from "./AccountActionsPanel.svelte";

  interface Props {
    user: UserData;
    isActionPending?: boolean;
    onRoleChange: (newRole: UserRole) => void;
    onAction: (type: UserActionType) => void;
  }

  let { user, isActionPending = false, onRoleChange, onAction }: Props = $props();
</script>

<div class="user-detail">
  <header class="detail-header">
    <div class="detail-avatar">
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
    </div>
    <h3>{user.displayName}</h3>
    <p class="detail-email">{user.email}</p>
    <div class="badges">
      <span
        class="badge role-{user.role}"
        style="background: {getRoleColor(user.role)}20; color: {getRoleColor(user.role)}; border: 1px solid {getRoleColor(user.role)}40"
      >
        <i class="fas {getRoleIcon(user.role)}"></i>
        {ROLE_DISPLAY[user.role].label}
      </span>
      {#if user.isDisabled}
        <span class="badge disabled">
          <i class="fas fa-ban"></i> Disabled
        </span>
      {/if}
    </div>
  </header>

  <div class="detail-content">
    <section class="detail-section">
      <h4>Account Info</h4>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">User ID</span>
          <span class="info-value mono">{user.id}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Username</span>
          <span class="info-value">@{user.username}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Joined</span>
          <span class="info-value">{formatDate(user.createdAt)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Last Updated</span>
          <span class="info-value">{formatDate(user.updatedAt)}</span>
        </div>
      </div>
    </section>

    <section class="detail-section">
      <h4>Statistics</h4>
      <UserStatsGrid {user} />
    </section>

    <section class="detail-section actions">
      <h4>Role Management</h4>
      <RoleSelector {user} isDisabled={isActionPending} {onRoleChange} />
    </section>

    <section class="detail-section actions">
      <h4>Account Actions</h4>
      <AccountActionsPanel {user} isDisabled={isActionPending} {onAction} />
    </section>
  </div>
</div>

<style>
  .user-detail {
    height: 100%;
    overflow-y: auto;
  }

  .detail-header {
    position: relative;
    padding: 24px 24px 20px;
    text-align: center;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.03) 0%,
      transparent 100%
    );
  }

  .detail-avatar {
    width: 80px;
    height: 80px;
    margin: 0 auto 16px;
    border-radius: 50%;
    overflow: hidden;
  }

  .detail-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .detail-avatar .initials {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    font-weight: 600;
    font-size: 28px;
  }

  .detail-header h3 {
    margin: 0 0 4px 0;
    font-size: 20px;
  }

  .detail-email {
    margin: 0 0 12px 0;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
  }

  .badges {
    display: flex;
    gap: 8px;
    justify-content: center;
  }

  .badge {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .badge.disabled {
    background: rgba(239, 68, 68, 0.2);
    color: #fca5a5;
  }

  .detail-content {
    padding: 0 24px 24px;
  }

  .detail-section {
    margin-bottom: 24px;
  }

  .detail-section h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .info-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .info-value {
    font-size: 14px;
  }

  .info-value.mono {
    font-family: monospace;
    font-size: 11px;
    word-break: break-all;
  }

  @media (max-width: 768px) {
    .info-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
