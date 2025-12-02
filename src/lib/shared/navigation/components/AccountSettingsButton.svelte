<!--
  AccountSettingsButton.svelte - Profile Button

  Shows user profile info and provides access to sign in/out:
  - When signed in: Shows profile picture + user name, opens profile popover
  - When signed out: Shows user icon + "Sign In", triggers sign-in flow
  - 48px minimum touch target (WCAG AAA)
-->
<script lang="ts">
  import { authStore } from "../../auth/stores/authStore.svelte";
  import { resolve } from "../../inversify/di";
  import { TYPES } from "../../inversify/types";
  import type { IHapticFeedbackService } from "../../application/services/contracts/IHapticFeedbackService";
  import { onMount } from "svelte";
  import { openAuthDialog } from "../../auth/state/auth-ui-state.svelte";

  // Props
  let { isCollapsed = false } = $props<{
    isCollapsed?: boolean;
  }>();

  // Services
  let hapticService: IHapticFeedbackService | null = null;

  // Popover state
  let showPopover = $state(false);
  let buttonRef = $state<HTMLButtonElement | null>(null);

  onMount(() => {
    try {
      hapticService = resolve<IHapticFeedbackService>(
        TYPES.IHapticFeedbackService
      );
    } catch (error) {
      console.error("Failed to resolve haptic service", error);
      hapticService = null;
    }

    // Close popover on outside click
    function handleClickOutside(event: MouseEvent) {
      if (buttonRef && !buttonRef.contains(event.target as Node)) {
        showPopover = false;
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  });

  function handleClick() {
    hapticService?.trigger("selection");

    if (authStore.isAuthenticated) {
      // Toggle profile popover
      showPopover = !showPopover;
    } else {
      // Open sign-in dialog
      openAuthDialog();
    }
  }

  async function handleSignOut() {
    hapticService?.trigger("selection");
    showPopover = false;
    await authStore.signOut();
  }

  // Derive button label based on auth state
  const buttonLabel = $derived(
    authStore.isAuthenticated
      ? authStore.user?.displayName || "Profile"
      : "Sign In"
  );

  const ariaLabel = $derived(
    authStore.isAuthenticated ? "Open profile menu" : "Sign in"
  );
</script>

<div class="profile-button-container">
  <button
    bind:this={buttonRef}
    class="account-settings-button"
    class:collapsed={isCollapsed}
    class:has-avatar={authStore.isAuthenticated && authStore.user?.photoURL}
    onclick={handleClick}
    aria-label={ariaLabel}
    aria-expanded={showPopover}
    aria-haspopup="true"
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
      {:else if authStore.isAuthenticated && authStore.user}
        <!-- Profile Initial -->
        <div class="profile-initial">
          {(authStore.user.displayName || authStore.user.email || "?")
            .charAt(0)
            .toUpperCase()}
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

  <!-- Profile Popover (shown when signed in and clicked) -->
  {#if showPopover && authStore.isAuthenticated}
    <div class="profile-popover">
      <div class="popover-header">
        <div class="user-info">
          <span class="user-name">{authStore.user?.displayName || "User"}</span>
          <span class="user-email">{authStore.user?.email}</span>
        </div>
      </div>
      <div class="popover-divider"></div>
      <button class="popover-action sign-out" onclick={handleSignOut}>
        <i class="fas fa-sign-out-alt"></i>
        <span>Sign Out</span>
      </button>
    </div>
  {/if}
</div>

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

  /* ============================================================================
     ICON WRAPPER
     ============================================================================ */
  .icon-wrapper {
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
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
    .icon-wrapper > i {
      transition: none;
    }

    .account-settings-button:hover,
    .account-settings-button:active,
    .account-settings-button:hover .icon-wrapper,
    .account-settings-button:hover .icon-wrapper > i {
      transform: none;
    }
  }

  @media (prefers-contrast: high) {
    .account-settings-button {
      border: 2px solid rgba(255, 255, 255, 0.3);
    }
  }
</style>
