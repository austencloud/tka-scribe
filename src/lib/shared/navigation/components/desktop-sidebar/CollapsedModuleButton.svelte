<!-- Collapsed Module Button Component -->
<!-- Icon-only module button for collapsed sidebar activity bar (VS Code style) -->
<script lang="ts">
  import { onMount } from "svelte";
  import type { ModuleDefinition } from "../../domain/types";
  import { authState } from "$lib/shared/auth/state/authState.svelte";
  import NotificationBadge from "../NotificationBadge.svelte";
  import { inboxState } from "$lib/shared/inbox/state/inbox-state.svelte";

  let {
    module,
    isActive,
    onClick,
    moduleColor,
    hasTabs = false,
  } = $props<{
    module: ModuleDefinition;
    isActive: boolean;
    onClick: () => void;
    moduleColor?: string;
    hasTabs?: boolean;
  }>();

  const isDisabled = $derived(module.disabled ?? false);

  // Get total unread count from inbox (notifications + messages)
  const inboxUnreadCount = $derived(inboxState.totalUnreadCount);

  // Show user's profile picture for dashboard module when signed in
  const showProfilePicture = $derived(
    module.id === "dashboard" &&
      authState.isAuthenticated &&
      authState.user?.photoURL
  );
  const profilePictureUrl = $derived(authState.user?.photoURL || "");
  const profileDisplayName = $derived(authState.user?.displayName || "User");
</script>

<button
  class="collapsed-module-button"
  class:active={isActive}
  class:disabled={isDisabled}
  class:has-tabs={hasTabs}
  onclick={onClick}
  disabled={isDisabled}
  aria-label={module.label}
  aria-current={isActive ? "page" : undefined}
  style="--module-color: {moduleColor || '#a855f7'};"
>
  <div class="icon-wrapper">
    {#if showProfilePicture}
      <img
        src={profilePictureUrl}
        alt={profileDisplayName}
        class="profile-avatar"
        crossorigin="anonymous"
        referrerpolicy="no-referrer"
      />
    {:else}
      <span class="module-icon">{@html module.icon}</span>
    {/if}

    <!-- Notification Badge for Inbox Module -->
    {#if module.id === "inbox" && inboxUnreadCount > 0}
      <NotificationBadge count={inboxUnreadCount} />
    {/if}
  </div>

  <!-- Hover Label -->
  <span class="hover-label">{module.label}</span>
</button>

<style>
  /* ============================================================================
     COLLAPSED MODULE BUTTON - VS CODE ACTIVITY BAR STYLE
     ============================================================================ */
  .collapsed-module-button {
    width: var(--min-touch-target); /* Larger than tabs for visual hierarchy */
    height: var(--min-touch-target);
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 10px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    margin-bottom: 0; /* No margin - controlled by context group */
    /* Subtle border for differentiation */
    box-shadow: inset 0 0 0 1px var(--theme-stroke, rgba(255, 255, 255, 0.06));
  }

  .collapsed-module-button:hover:not(.disabled) {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    box-shadow: inset 0 0 0 1px
      var(--theme-stroke-strong, rgba(255, 255, 255, 0.12));
  }

  .collapsed-module-button.active {
    color: var(--theme-text, rgba(255, 255, 255, 1));
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.12));
    box-shadow: inset 0 0 0 1px
      var(--theme-stroke-strong, rgba(255, 255, 255, 0.15));
  }

  /* Ghost the button when tabs are showing - tabs become the focus */
  .collapsed-module-button.active.has-tabs {
    background: transparent;
    box-shadow: none;
  }

  .collapsed-module-button.active.has-tabs .module-icon {
    opacity: 0.3; /* Ghosted icon */
  }

  .collapsed-module-button.disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* Icon wrapper - for badge positioning */
  .icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .module-icon {
    font-size: 22px; /* Slightly larger icon */
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }

  /* Profile Avatar for Dashboard */
  .profile-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(16, 185, 129, 0.4);
    transition: all 0.2s ease;
  }

  .collapsed-module-button:hover:not(.disabled) .profile-avatar {
    transform: scale(1.08);
    border-color: rgba(16, 185, 129, 0.7);
  }

  .collapsed-module-button.active .profile-avatar {
    border-color: rgba(16, 185, 129, 0.8);
    box-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
  }

  .collapsed-module-button:hover:not(.disabled) .module-icon {
    transform: scale(1.08);
  }

  .collapsed-module-button.active .module-icon {
    transform: scale(1.05);
  }

  /* Hover Label - slides in from right */
  .hover-label {
    position: absolute;
    left: 60px;
    padding: 6px 12px;
    background: var(--theme-panel-bg, rgba(20, 20, 30, 0.95));
    backdrop-filter: blur(10px);
    border: 1px solid var(--theme-stroke-strong, rgba(255, 255, 255, 0.15));
    border-radius: 6px;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transform: translateX(-8px);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: var(--theme-shadow, 0 4px 12px rgba(0, 0, 0, 0.4));
    z-index: 200;
  }

  .collapsed-module-button:hover .hover-label {
    opacity: 1;
    transform: translateX(0);
  }

  /* Focus styles for keyboard navigation */
  .collapsed-module-button:focus-visible {
    outline: 2px solid var(--theme-accent, #6366f1);
    outline-offset: 2px;
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-contrast: high) {
    .collapsed-module-button.active {
      background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.25));
      outline: 2px solid white;
    }
  }

  /* ============================================================================
     ANIMATIONS & TRANSITIONS
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
      animation: none !important;
    }
  }
</style>
