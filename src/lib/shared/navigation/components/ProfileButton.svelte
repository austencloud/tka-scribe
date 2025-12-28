<!--
  ProfileButton.svelte - Global Profile/Account Button

  Features:
  - Profile picture display or initial fallback
  - Opens profile settings sheet directly via route-based navigation
  - Haptic feedback on interaction
  - 50px minimum touch target (WCAG AAA)
-->
<script lang="ts">
  import { authState } from "../../auth/state/authState.svelte";
  import { resolve } from "../../inversify/di";
  import { TYPES } from "../../inversify/types";
  import type { IHapticFeedback } from "../../application/services/contracts/IHapticFeedback";
  import type { ISheetRouter } from "$lib/shared/navigation/services/contracts/ISheetRouter";
  import { saveActiveTab } from "../../settings/utils/tab-persistence.svelte";
  import { onMount } from "svelte";

  // Props
  let {
    variant = "topbar",
    isCollapsed = false,
    showLabel = false,
  } = $props<{
    variant?: "topbar" | "sidebar" | "mobile";
    isCollapsed?: boolean;
    showLabel?: boolean;
  }>();

  // Services
  let hapticService: IHapticFeedback | null = null;
  let sheetRouterService: ISheetRouter | null = null;

  onMount(async () => {
    hapticService = await resolve<IHapticFeedback>(
      TYPES.IHapticFeedback
    );
    try {
      sheetRouterService = await resolve<ISheetRouter>(
        TYPES.ISheetRouter
      );
    } catch {
      // Service not available
    }
  });

  function handleProfileClick() {
    hapticService?.trigger("selection");

    // All variants now open Settings with Profile tab
    // Set the active tab to Profile before opening settings
    saveActiveTab("Profile");
    sheetRouterService?.openSheet("settings");
  }
</script>

<button
  class="profile-button"
  class:has-avatar={authState.isAuthenticated && authState.user?.photoURL}
  class:variant-sidebar={variant === "sidebar"}
  class:with-label={showLabel && !isCollapsed}
  class:sidebar-collapsed={isCollapsed}
  onclick={handleProfileClick}
  aria-label={authState.isAuthenticated ? "Account menu" : "Sign in"}
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
          console.error(
            "[ProfileButton] Photo failed to load:",
            authState.user?.photoURL
          );
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
      <i class="fas fa-user-circle" aria-hidden="true"></i>
    {/if}
  </div>
  {#if showLabel && !isCollapsed}
    <span class="profile-label">
      {authState.isAuthenticated && authState.user?.displayName
        ? authState.user.displayName
        : "Profile"}
    </span>
  {/if}
</button>

<style>
  /* ============================================================================
     PROFILE BUTTON - 50px minimum (WCAG AAA)
     ============================================================================ */
  .profile-button {
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    min-width: var(--min-touch-target);
    min-height: var(--min-touch-target);
    border-radius: 50%;
    border: none;
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 20px;
    position: relative;
  }

  /* When button has a label, expand to full width */
  .profile-button.with-label {
    width: 100%;
    justify-content: flex-start;
    padding: 12px 16px;
    border-radius: 10px;
    gap: 12px; /* Match Settings button gap */
  }

  .profile-button.with-label.sidebar-collapsed {
    width: var(--min-touch-target);
    justify-content: center;
    padding: 0;
  }

  .profile-button:hover:not(.variant-sidebar) {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.15));
    transform: scale(1.05);
  }

  .profile-button:active:not(.variant-sidebar) {
    transform: scale(0.95);
  }

  .profile-button:focus-visible {
    outline: 2px solid var(--theme-accent, #6366f1);
    outline-offset: 2px;
  }

  /* Icon wrapper - contains avatar or icon */
  .profile-icon-wrapper {
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    min-width: var(--min-touch-target);
    min-height: var(--min-touch-target);
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    flex-shrink: 0;
    font-size: 18px; /* Match Settings icon size */
  }

  /* When button has label, make icon smaller to match Settings icon size */
  .profile-button.with-label .profile-icon-wrapper {
    width: 28px; /* Adjusted to better match Settings icon visual weight */
    height: 28px;
    min-width: 28px;
    min-height: 28px;
    font-size: 16px; /* Slightly smaller icon for compact layout */
    position: relative;
  }

  /* Expand touch target while maintaining visual size */
  .profile-button.with-label .profile-icon-wrapper::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: var(--min-touch-target);
    min-height: var(--min-touch-target);
  }

  /* Profile avatar image - minimal, no border for cleaner look */
  .profile-button.has-avatar .profile-icon-wrapper {
    background: transparent; /* Let avatar fill the space */
  }

  .profile-avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Profile initial fallback - simplified gradient */
  .profile-initial {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    background: var(
      --theme-accent-strong,
      #8b5cf6
    ); /* Simplified, more subtle */
  }

  /* Smaller font in labeled button */
  .profile-button.with-label .profile-initial {
    font-size: 13px; /* Proportionally smaller for 28px wrapper */
  }

  /* Profile label */
  .profile-label {
    flex: 1;
    text-align: left;
    font-size: 15px; /* Match Settings button font-size */
    font-weight: 500; /* Match Settings button font-weight */
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ============================================================================
     VARIANT STYLES
     ============================================================================ */
  /* Sidebar variant - matches sidebar design language */
  .profile-button.variant-sidebar {
    border-radius: 10px; /* Match sidebar button radius */
    background: transparent; /* Transparent by default like other sidebar buttons */
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); /* Match sidebar easing */
  }

  .profile-button.variant-sidebar:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    transform: translateX(2px); /* Match sidebar hover transform */
  }

  .profile-button.variant-sidebar:active {
    transform: scale(0.98); /* Subtle press effect */
  }

  /* When sidebar variant has label, remove border-radius override */
  .profile-button.variant-sidebar.with-label {
    border-radius: 10px;
  }

  /* Icon wrapper in sidebar - needs subtle background */
  .profile-button.variant-sidebar .profile-icon-wrapper {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .profile-button.variant-sidebar:hover .profile-icon-wrapper {
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.2));
  }

  /* Avatar in sidebar icon wrapper */
  .profile-button.variant-sidebar.has-avatar .profile-icon-wrapper {
    border: 2px solid var(--theme-stroke-strong, rgba(255, 255, 255, 0.15));
    background: transparent;
  }

  .profile-button.variant-sidebar.has-avatar:hover .profile-icon-wrapper {
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.3));
  }

  /* Collapsed sidebar - center icon only */
  .profile-button.variant-sidebar.sidebar-collapsed {
    width: var(--min-touch-target);
    justify-content: center;
    padding: 0;
  }

  /* ============================================================================
     RESPONSIVE DESIGN
     ============================================================================ */
  /* Note: Button size stays 50px on all devices for accessibility (WCAG AAA) */

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .profile-button {
      transition: none;
    }

    .profile-button:hover,
    .profile-button:active {
      transform: none;
    }
  }

  @media (prefers-contrast: high) {
    .profile-button {
      background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.2));
      border: 2px solid white;
    }
  }
</style>
