<!--
  DashboardButton - Dashboard/Profile Navigation Button

  Features:
  - Profile picture display with initial fallback
  - Notification badge overlay
  - Navigates to dashboard module
  - Haptic feedback on interaction
  - 50px minimum touch target (WCAG AAA)
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { authState } from "$lib/shared/auth/state/authState.svelte";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import { handleModuleChange } from "$lib/shared/navigation-coordinator/navigation-coordinator.svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import NotificationBadge from "../NotificationBadge.svelte";
  import { createNotificationState } from "$lib/features/feedback/state/notification-state.svelte";

  // Props
  let { variant = "bottom-nav" } = $props<{
    variant?: "bottom-nav" | "sidebar";
  }>();

  // Services
  let hapticService: IHapticFeedbackService | null = null;

  // Notification state
  const notificationState = createNotificationState();

  onMount(() => {
    // Load haptic service synchronously
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );

    // Initialize notifications when user is authenticated
    if (authState.isAuthenticated) {
      notificationState.init();
    }

    // Cleanup on unmount
    return () => {
      notificationState.cleanup();
    };
  });

  // Watch auth state changes to init/cleanup notifications
  $effect(() => {
    if (authState.isAuthenticated) {
      notificationState.init();
    } else {
      notificationState.cleanup();
    }
  });

  function handleClick() {
    hapticService?.trigger("selection");
    handleModuleChange("dashboard");
  }

  // Check if dashboard is active
  const isActive = $derived(navigationState.currentModule === "dashboard");
</script>

<button
  class="dashboard-button"
  class:active={isActive}
  class:variant-sidebar={variant === "sidebar"}
  class:has-avatar={authState.isAuthenticated && authState.user?.photoURL}
  onclick={handleClick}
  aria-label="Dashboard"
  aria-current={isActive ? "page" : undefined}
>
  <div class="profile-icon-wrapper">
    {#if authState.isAuthenticated && authState.user?.photoURL}
      <img
        src={authState.user.photoURL}
        alt={authState.user.displayName || "User"}
        class="profile-avatar"
        crossorigin="anonymous"
        referrerpolicy="no-referrer"
        onerror={(e) => {
          // Hide the broken image and show initial instead
          const wrapper = e.currentTarget.parentElement;
          if (wrapper) {
            e.currentTarget.remove();
            const initial = document.createElement("div");
            initial.className = "profile-initial";
            initial.textContent = (
              authState.user?.displayName ||
              authState.user?.email ||
              "?"
            )
              .charAt(0)
              .toUpperCase();
            wrapper.appendChild(initial);
          }
        }}
      />
    {:else if authState.isAuthenticated && authState.user}
      <div class="profile-initial">
        {(authState.user.displayName || authState.user.email || "?")
          .charAt(0)
          .toUpperCase()}
      </div>
    {:else}
      <i class="fas fa-home"></i>
    {/if}

    <!-- Notification Badge -->
    <NotificationBadge count={notificationState.unreadCount} />
  </div>
</button>

<style>
  /* ============================================================================
     DASHBOARD BUTTON - 50px minimum (WCAG AAA)
     ============================================================================ */
  .dashboard-button {
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    min-width: var(--min-touch-target);
    min-height: var(--min-touch-target);
    border-radius: 50%;
    border: none;
    background: transparent;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    position: relative;
    padding: 0;
  }

  .dashboard-button:hover {
    transform: scale(1.05);
  }

  .dashboard-button:active {
    transform: scale(0.95);
  }

  .dashboard-button:focus-visible {
    outline: 2px solid
      color-mix(in srgb, var(--theme-accent, #6366f1) 70%, transparent);
    outline-offset: 2px;
  }

  /* Active state */
  .dashboard-button.active .profile-icon-wrapper {
    box-shadow:
      0 0 0 2px rgba(16, 185, 129, 0.5),
      0 0 12px rgba(16, 185, 129, 0.3);
  }

  /* Icon wrapper - contains avatar or icon */
  .profile-icon-wrapper {
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border: 2px solid var(--theme-stroke-strong, rgba(255, 255, 255, 0.2));
    flex-shrink: 0;
    font-size: 20px;
    position: relative;
    transition: all 0.2s ease;
  }

  .dashboard-button:hover .profile-icon-wrapper {
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.3));
  }

  /* Profile avatar image */
  .dashboard-button.has-avatar .profile-icon-wrapper {
    background: transparent;
    border-color: rgba(16, 185, 129, 0.3);
  }

  .dashboard-button.has-avatar:hover .profile-icon-wrapper {
    border-color: rgba(16, 185, 129, 0.5);
  }

  .profile-avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Profile initial fallback */
  .profile-initial {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .dashboard-button {
      transition: none;
    }

    .dashboard-button:hover,
    .dashboard-button:active {
      transform: none;
    }
  }

  @media (prefers-contrast: high) {
    .dashboard-button {
      border: 2px solid white;
    }
  }
</style>
