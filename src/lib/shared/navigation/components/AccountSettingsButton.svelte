<!--
  AccountSettingsButton.svelte - Unified Profile & Account Button

  Navigates to the Account module for managing profile, library, preferences, and security:
  - When signed in: Shows profile picture + user name
  - When signed out: Shows user icon + "Account"
  - Always navigates to Account module (settings are now in Account > Preferences)
  - 44px minimum touch target (WCAG AAA)
-->
<script lang="ts">
  import { authStore } from "$shared/auth";
  import { resolve, TYPES, type IHapticFeedbackService } from "$shared";
  import { navigationState } from "../state/navigation-state.svelte";
  import { switchModule } from "$shared/application/state/ui/module-state";
  import { onMount } from "svelte";

  // Props
  let { isCollapsed = false, isActive = false } = $props<{
    isCollapsed?: boolean;
    isActive?: boolean;
  }>();

  // Services
  let hapticService: IHapticFeedbackService | null = null;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  async function handleClick() {
    hapticService?.trigger("selection");

    // Navigate to Account module
    // If signed in, go to Overview tab
    // If signed out, go to Security tab (for sign in options)
    const targetTab = authStore.isAuthenticated ? "overview" : "security";
    navigationState.setCurrentModule("account", targetTab);
    // Also switch the module in app state to sync the UI
    await switchModule("account");
  }

  // Derive button label based on auth state
  const buttonLabel = $derived(
    authStore.isAuthenticated
      ? authStore.user?.displayName || "Account"
      : "Account"
  );

  const ariaLabel = $derived("Account");
</script>

<button
  class="account-settings-button"
  class:active={isActive}
  class:collapsed={isCollapsed}
  class:has-avatar={authStore.isAuthenticated && authStore.user?.photoURL}
  onclick={handleClick}
  aria-label={ariaLabel}
>
  <!-- Icon/Avatar Section -->
  <div class="icon-wrapper">
    {#if authStore.isAuthenticated && authStore.user?.photoURL}
      <!-- Profile Picture -->
      <img
        src={authStore.user.photoURL}
        alt={authStore.user.displayName || "User"}
        class="profile-avatar"
        crossorigin="anonymous"
        referrerpolicy="no-referrer"
        onerror={(e) => {
          // Fallback to initial on error
          const wrapper = e.currentTarget.parentElement;
          if (wrapper) {
            e.currentTarget.remove();
            const initial = document.createElement("div");
            initial.className = "profile-initial";
            initial.textContent = (
              authStore.user?.displayName ||
              authStore.user?.email ||
              "?"
            )
              .charAt(0)
              .toUpperCase();
            wrapper.appendChild(initial);
          }
        }}
      />
      <!-- Settings Gear Badge -->
      <div class="settings-badge">
        <i class="fas fa-cog"></i>
      </div>
    {:else if authStore.isAuthenticated && authStore.user}
      <!-- Profile Initial -->
      <div class="profile-initial">
        {(authStore.user.displayName || authStore.user.email || "?")
          .charAt(0)
          .toUpperCase()}
      </div>
      <!-- Settings Gear Badge -->
      <div class="settings-badge">
        <i class="fas fa-cog"></i>
      </div>
    {:else}
      <!-- User Icon (signed out) -->
      <i class="fas fa-user-circle"></i>
    {/if}
  </div>

  <!-- Label (hidden when collapsed) -->
  {#if !isCollapsed}
    <span class="button-label">{buttonLabel}</span>
  {/if}
</button>

<style>
  /* ============================================================================
     ACCOUNT SETTINGS BUTTON
     ============================================================================ */
  .account-settings-button {
    width: 100%;
    height: auto;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 14px; /* Balanced padding for proper hover backdrop */
    background: transparent;
    border: none;
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 15px;
    font-weight: 500;
    /* Ensure proper box-sizing */
    box-sizing: border-box;
  }

  .account-settings-button.collapsed {
    justify-content: center;
    padding: 10px;
    width: auto; /* Let it size naturally */
  }

  .account-settings-button:hover {
    color: rgba(255, 255, 255, 0.95);
    transform: translateX(2px);
  }

  .account-settings-button:active {
    transform: scale(0.98);
  }

  .account-settings-button.active {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 1);
  }

  /* ============================================================================
     ICON WRAPPER
     ============================================================================ */
  .icon-wrapper {
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
    border-radius: 50%;
    overflow: visible; /* Changed from hidden to allow badge to overflow */
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent; /* No background - let button handle it */
    border: none; /* No border on wrapper itself */
    font-size: 20px;
    flex-shrink: 0;
    transition: all 0.25s ease;
    position: relative; /* For badge positioning */
  }

  .account-settings-button:hover .icon-wrapper {
    transform: scale(1.05);
  }

  /* Avatar styling - add border for profile pictures */
  .account-settings-button.has-avatar .icon-wrapper {
    border: 2px solid rgba(255, 255, 255, 0.2);
    background: transparent;
  }

  .account-settings-button.has-avatar:hover .icon-wrapper {
    border-color: rgba(255, 255, 255, 0.35);
  }

  .profile-avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border-radius: 50%;
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
    color: rgba(255, 255, 255, 0.95);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
  }

  /* Settings Gear Badge - appears on profile picture */
  .settings-badge {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: 2px solid rgba(20, 25, 35, 0.95); /* Match sidebar dark background */
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .settings-badge i {
    font-size: 9px;
    color: white;
    transition: all 0.25s ease;
  }

  .account-settings-button:hover .settings-badge {
    transform: scale(1.1);
  }

  .account-settings-button:hover .settings-badge i {
    transform: rotate(90deg);
  }

  /* User icon styling (when signed out) */
  .icon-wrapper > i {
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.25s ease;
  }

  .account-settings-button:hover .icon-wrapper > i {
    color: rgba(255, 255, 255, 0.95);
    transform: scale(1.1);
  }

  /* ============================================================================
     LABEL
     ============================================================================ */
  .button-label {
    flex: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  .account-settings-button:focus-visible {
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .account-settings-button,
    .icon-wrapper,
    .icon-wrapper i,
    .icon-wrapper > i,
    .settings-badge,
    .settings-badge i {
      transition: none;
    }

    .account-settings-button:hover,
    .account-settings-button:active,
    .account-settings-button:hover .icon-wrapper,
    .account-settings-button:hover .icon-wrapper > i,
    .account-settings-button:hover .settings-badge,
    .account-settings-button:hover .settings-badge i {
      transform: none;
    }
  }

  @media (prefers-contrast: high) {
    .account-settings-button {
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .account-settings-button.active {
      border-color: white;
    }
  }
</style>
