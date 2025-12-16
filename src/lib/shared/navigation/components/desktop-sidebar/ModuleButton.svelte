<!-- Module Button Component -->
<!-- Button for a module that can expand/collapse to show sections -->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import type { ModuleDefinition } from "../../domain/types";
  import { authState } from "$lib/shared/auth/state/authState.svelte";
  import NotificationBadge from "../NotificationBadge.svelte";
  import { createNotificationState } from "$lib/features/feedback/state/notification-state.svelte";

  let {
    module,
    isActive,
    isExpanded,
    isCollapsed,
    onClick,
    hasSections = false,
  } = $props<{
    module: ModuleDefinition;
    isActive: boolean;
    isExpanded: boolean;
    isCollapsed: boolean;
    onClick: () => void;
    hasSections?: boolean;
  }>();

  let hapticService: IHapticFeedbackService | undefined;

  // Notification state for dashboard module
  const notificationState =
    module.id === "dashboard" ? createNotificationState() : null;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );

    // Initialize notifications for dashboard module
    if (module.id === "dashboard" && authState.isAuthenticated) {
      notificationState?.init();
    }

    return () => {
      notificationState?.cleanup();
    };
  });

  // Watch auth state changes to init/cleanup notifications
  $effect(() => {
    if (module.id === "dashboard") {
      if (authState.isAuthenticated) {
        notificationState?.init();
      } else {
        notificationState?.cleanup();
      }
    }
  });

  function handleClick() {
    hapticService?.trigger("selection");
    onClick();
  }

  const isDisabled = $derived(module.disabled ?? false);

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
  class="module-button"
  class:active={isActive}
  class:expanded={isExpanded}
  class:disabled={isDisabled}
  class:sidebar-collapsed={isCollapsed}
  class:has-sections={hasSections}
  onclick={handleClick}
  aria-label={module.label}
  aria-expanded={isExpanded}
  aria-current={isActive ? "page" : undefined}
  aria-disabled={isDisabled}
  disabled={isDisabled}
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

    <!-- Notification Badge for Dashboard Module -->
    {#if module.id === "dashboard" && notificationState}
      <NotificationBadge count={notificationState.unreadCount} />
    {/if}
  </div>
  {#if !isCollapsed}
    <span class="module-label">{module.label}</span>
    {#if isDisabled && module.disabledMessage}
      <span class="disabled-badge">{module.disabledMessage}</span>
    {:else if !isExpanded && hasSections}
      <!-- Only show chevron when collapsed AND has sections to expand -->
      <span class="expand-icon">
        <i class="fas fa-chevron-right"></i>
      </span>
    {/if}
  {/if}
</button>

<style>
  /* ============================================================================
     MODULE BUTTON - Refined Minimal Design
     ============================================================================ */
  .module-button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 52px;
    padding: 12px 14px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .module-button.sidebar-collapsed {
    justify-content: center;
    padding: 12px 8px;
  }

  /* Shimmer effect layer - subtle */
  .module-button::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      transparent 40%,
      var(--theme-card-bg, rgba(255, 255, 255, 0.05)) 50%,
      transparent 60%
    );
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
  }

  .module-button:hover::before {
    opacity: 1;
    animation: shimmer 1.2s ease-in-out;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%) translateY(-100%);
    }
    100% {
      transform: translateX(100%) translateY(100%);
    }
  }

  .module-button:hover {
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border-color: var(--theme-stroke, rgba(255, 255, 255, 0.06));
    transform: translateX(3px);
  }

  .module-button:active {
    transform: translateX(2px) scale(0.99);
    transition-duration: 0.1s;
  }

  /* Expanded state - blends with surrounding panel, not interactive */
  .module-button.expanded {
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    background: transparent;
    border-color: transparent;
    cursor: default;
    pointer-events: none; /* Disable interaction when expanded */
  }

  .module-button.expanded:hover {
    transform: none;
    background: transparent;
  }

  .module-button.expanded::before {
    display: none; /* No shimmer on non-interactive state */
  }

  /* Active module indicator - minimal, just the accent bar */
  .module-button.active {
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border-color: var(--theme-stroke, rgba(255, 255, 255, 0.06));
  }

  /* When both active AND expanded, blend completely (acts as section header) */
  .module-button.active.expanded {
    background: transparent;
    border-color: transparent;
    cursor: default;
    pointer-events: none;
  }

  .module-button.active::after {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 50%;
    border-radius: 0 3px 3px 0;
    background: linear-gradient(
      180deg,
      var(--theme-accent, #6366f1),
      color-mix(in srgb, var(--theme-accent, #6366f1) 50%, transparent)
    );
  }

  /* Hide accent bar when expanded - no longer looks like a button */
  .module-button.active.expanded::after {
    display: none;
  }

  .module-button.sidebar-collapsed.active::after {
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50%;
    height: 3px;
    border-radius: 3px;
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--theme-accent, #6366f1) 50%, transparent),
      var(--theme-accent, #6366f1),
      color-mix(in srgb, var(--theme-accent, #6366f1) 50%, transparent)
    );
  }

  /* Icon wrapper - for badge positioning */
  .icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .module-icon {
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* Profile Avatar for Dashboard */
  .profile-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(16, 185, 129, 0.4);
    flex-shrink: 0;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .module-button:hover .profile-avatar {
    transform: scale(1.08);
    border-color: rgba(16, 185, 129, 0.7);
  }

  .module-button.active .profile-avatar {
    border-color: rgba(16, 185, 129, 0.8);
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.25);
  }

  .module-button:hover .module-icon {
    transform: scale(1.08);
  }

  .module-button.active .module-icon {
    filter: drop-shadow(0 1px 3px rgba(255, 255, 255, 0.15));
  }

  .module-label {
    flex: 1;
    text-align: left;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.01em;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);

    /* Delayed fade-in animation when sidebar expands (Google Calendar-style) */
    animation: label-fade-in 0.25s ease-out 0.15s both;
  }

  @keyframes label-fade-in {
    from {
      opacity: 0;
      transform: translateX(-4px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .expand-icon {
    font-size: 11px;
    opacity: 0.5;
    transition: all 0.25s ease;
  }

  .module-button.expanded .expand-icon {
    opacity: 0.8;
  }

  .module-button:hover .expand-icon {
    opacity: 1;
    transform: translateX(2px);
  }

  /* Disabled module styles */
  .module-button.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .module-button.disabled:hover {
    transform: none;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    box-shadow: none;
  }

  .module-button.disabled::before {
    display: none;
  }

  .disabled-badge {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 6px;
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    letter-spacing: 0.5px;
  }

  /* Focus styles for keyboard navigation */
  .module-button:focus-visible {
    outline: 2px solid var(--theme-accent, #6366f1);
    outline-offset: 2px;
  }

  /* ============================================================================
     ANIMATIONS & TRANSITIONS
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .module-button,
    .module-button::before,
    .module-icon,
    .expand-icon {
      transition: none !important;
      animation: none !important;
    }
    .module-button:hover {
      transform: none;
    }
  }
</style>
