<script lang="ts">
  /**
   * UserAvatar - Shared avatar component with two variants
   *
   * Variants:
   * - 'color': Extracts dominant color from avatar, renders gradient ring
   * - 'role': Shows role badge overlay
   *
   * Props:
   * - user: UserProfile or UserData
   * - variant: 'color' | 'role' (default: 'color')
   * - size: 'sm' | 'md' | 'lg' (default: 'md')
   * - onload: Called when image loads (for color extraction)
   * - onerror: Called when image fails to load
   */

  import type { UserProfile } from "$lib/shared/community/domain/models/enhanced-user-profile";
  import type { UserRole } from "$lib/shared/auth/domain/models/UserRole";
  import {
    getRoleIcon,
    getRoleColor,
    getRoleLabel,
    getInitials,
  } from "$lib/shared/auth/utils/role-display-utils";

  interface BaseUser {
    displayName: string;
    avatar?: string;
    photoURL?: string;
  }

  interface Props {
    user: BaseUser;
    variant?: "color" | "role";
    size?: "sm" | "md" | "lg";
    accentColor?: string;
    role?: UserRole;
    onload?: (img: HTMLImageElement) => void;
    onerror?: (img: HTMLImageElement) => void;
  }

  let {
    user,
    variant = "color",
    size = "md",
    accentColor,
    role,
    onload,
    onerror,
  }: Props = $props();

  const imageUrl = user.photoURL || user.avatar;
</script>

<div class="user-avatar" class:variant-color={variant === "color"} class:variant-role={variant === "role"} class:size-sm={size === "sm"} class:size-md={size === "md"} class:size-lg={size === "lg"} style={variant === "color" && accentColor ? `--accent-color: ${accentColor}` : ""}>
  {#if imageUrl}
    <img
      src={imageUrl}
      alt={user.displayName}
      crossorigin="anonymous"
      referrerpolicy="no-referrer"
      {onload}
      {onerror}
    />
  {/if}

  {#if !imageUrl || variant === "role"}
    <span class="initials">{getInitials(user.displayName)}</span>
  {/if}

  {#if variant === "role" && role && role !== "user"}
    <span
      class="role-badge"
      title={getRoleLabel(role)}
      style="background: {getRoleColor(role)}"
    >
      <i class="fas {getRoleIcon(role)}"></i>
    </span>
  {/if}
</div>

<style>
  .user-avatar {
    position: relative;
    border-radius: 50%;
    overflow: visible;
    flex-shrink: 0;
  }

  /* Size variants */
  .user-avatar.size-sm {
    width: 40px;
    height: 40px;
  }

  .user-avatar.size-md {
    width: 56px;
    height: 56px;
  }

  .user-avatar.size-lg {
    width: 80px;
    height: 80px;
  }

  /* Base image styling */
  .user-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  /* Color variant - gradient ring border */
  .user-avatar.variant-color {
    border: 3px solid;
    border-color: var(--accent-color, #8b5cf6);
    box-shadow: 0 0 16px color-mix(in srgb, var(--accent-color, #8b5cf6) 40%, transparent);
  }

  /* Initials fallback */
  .initials {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    font-weight: 600;
    color: white;
  }

  .user-avatar.size-sm .initials {
    font-size: 12px;
  }

  .user-avatar.size-md .initials {
    font-size: 14px;
  }

  .user-avatar.size-lg .initials {
    font-size: 18px;
  }

  /* Role badge - overlay on bottom-right */
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
</style>
