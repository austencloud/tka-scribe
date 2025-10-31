<!--
  ProfileDropdown.svelte - Account Dropdown Menu

  Features:
  - User avatar, name, email
  - Sign out button
  - Future: Account settings link
-->
<script lang="ts">
  import { authStore } from "$shared/auth";
  import { goto } from "$app/navigation";
  import { resolve, TYPES, type IHapticFeedbackService } from "$shared";
  import { navigationState } from "$shared/navigation";
  import { onMount } from "svelte";

  // Props
  let { onClose } = $props<{
    onClose: () => void;
  }>();

  // Services
  let hapticService: IHapticFeedbackService | null = null;

  // State
  let signingOut = $state(false);

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".profile-dropdown") && !target.closest(".profile-button")) {
        onClose();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  });

  async function handleSignOut() {
    if (signingOut) return;

    hapticService?.trigger("selection");
    signingOut = true;

    try {
      await authStore.signOut();
      console.log("✅ Successfully signed out");
      onClose();
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      signingOut = false;
    }
  }

  function handleSignIn() {
    hapticService?.trigger("selection");
    goto("/auth/login");
    onClose();
  }

  function handleNavigateToLibrary() {
    hapticService?.trigger("selection");
    navigationState.setCurrentModule("library");
    onClose();
  }

  function handleMyProgress() {
    hapticService?.trigger("selection");
    // TODO: Implement My Progress view
    console.log("My Progress - Coming Soon");
    onClose();
  }

  function handleProfileSettings() {
    hapticService?.trigger("selection");
    // TODO: Implement Profile Settings
    console.log("Profile Settings - Coming Soon");
    onClose();
  }
</script>

<div class="profile-dropdown glass-surface">
  {#if authStore.isAuthenticated && authStore.user}
    <!-- Logged in state -->
    <div class="profile-dropdown__header">
      {#if authStore.user.photoURL}
        <img
          src={authStore.user.photoURL}
          alt={authStore.user.displayName || "User"}
          class="profile-dropdown__avatar"
        />
      {:else}
        <div class="profile-dropdown__avatar-fallback">
          {(authStore.user.displayName || authStore.user.email || "?").charAt(0).toUpperCase()}
        </div>
      {/if}

      <div class="profile-dropdown__info">
        <div class="profile-dropdown__name">
          {authStore.user.displayName || authStore.user.email || "User"}
        </div>
        {#if authStore.user.email}
          <div class="profile-dropdown__email">{authStore.user.email}</div>
        {/if}
      </div>
    </div>

    <div class="profile-dropdown__divider"></div>

    <!-- Navigation & Settings -->
    <div class="profile-dropdown__menu">
      <button
        class="profile-dropdown__menu-item"
        onclick={handleNavigateToLibrary}
      >
        <i class="fas fa-book"></i>
        <span>My Library</span>
        <i class="fas fa-chevron-right profile-dropdown__menu-item-arrow"></i>
      </button>

      <button
        class="profile-dropdown__menu-item profile-dropdown__menu-item--disabled"
        onclick={handleMyProgress}
        disabled
        title="Coming Soon"
      >
        <i class="fas fa-chart-line"></i>
        <span>My Progress</span>
        <span class="profile-dropdown__badge">Soon</span>
      </button>

      <button
        class="profile-dropdown__menu-item profile-dropdown__menu-item--disabled"
        onclick={handleProfileSettings}
        disabled
        title="Coming Soon"
      >
        <i class="fas fa-cog"></i>
        <span>Settings</span>
        <span class="profile-dropdown__badge">Soon</span>
      </button>
    </div>

    <div class="profile-dropdown__divider"></div>

    <!-- Actions -->
    <div class="profile-dropdown__actions">
      <button
        class="profile-dropdown__action profile-dropdown__action--danger"
        onclick={handleSignOut}
        disabled={signingOut}
      >
        <i class="fas fa-sign-out-alt"></i>
        {signingOut ? "Signing out..." : "Sign Out"}
      </button>
    </div>
  {:else}
    <!-- Logged out state -->
    <div class="profile-dropdown__logged-out">
      <div class="profile-dropdown__logged-out-icon">
        <i class="fas fa-user-circle"></i>
      </div>
      <div class="profile-dropdown__logged-out-text">Not signed in</div>
      <button
        class="profile-dropdown__action profile-dropdown__action--primary"
        onclick={handleSignIn}
      >
        <i class="fas fa-sign-in-alt"></i>
        Sign In
      </button>
    </div>
  {/if}
</div>

<style>
  /* ============================================================================
     DROPDOWN CONTAINER
     ============================================================================ */
  .profile-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 280px;
    background: rgba(20, 25, 35, 0.98);
    backdrop-filter: var(--glass-backdrop-strong);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    animation: dropdownFadeIn 0.2s ease;
    z-index: 1000;
  }

  @keyframes dropdownFadeIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ============================================================================
     HEADER (Logged In)
     ============================================================================ */
  .profile-dropdown__header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
  }

  .profile-dropdown__avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.2);
    flex-shrink: 0;
  }

  .profile-dropdown__avatar-fallback {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 600;
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.2);
    flex-shrink: 0;
  }

  .profile-dropdown__info {
    flex: 1;
    min-width: 0;
  }

  .profile-dropdown__name {
    font-size: 15px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin-bottom: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .profile-dropdown__email {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ============================================================================
     DIVIDER
     ============================================================================ */
  .profile-dropdown__divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
  }

  /* ============================================================================
     MENU (Navigation & Settings)
     ============================================================================ */
  .profile-dropdown__menu {
    padding: 4px 8px;
  }

  .profile-dropdown__menu-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 12px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.9);
    text-align: left;
  }

  .profile-dropdown__menu-item i:first-child {
    font-size: 16px;
    width: 20px;
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
  }

  .profile-dropdown__menu-item span:nth-child(2) {
    flex: 1;
  }

  .profile-dropdown__menu-item-arrow {
    font-size: 12px !important;
    color: rgba(255, 255, 255, 0.4) !important;
    transition: transform 0.2s ease;
  }

  .profile-dropdown__menu-item:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
  }

  .profile-dropdown__menu-item:hover:not(:disabled) .profile-dropdown__menu-item-arrow {
    color: rgba(255, 255, 255, 0.7) !important;
    transform: translateX(2px);
  }

  .profile-dropdown__menu-item:active:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
  }

  .profile-dropdown__menu-item--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .profile-dropdown__badge {
    padding: 2px 8px;
    background: rgba(16, 185, 129, 0.2);
    border: 1px solid rgba(16, 185, 129, 0.4);
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    color: rgba(16, 185, 129, 1);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* ============================================================================
     ACTIONS
     ============================================================================ */
  .profile-dropdown__actions {
    padding: 8px;
  }

  .profile-dropdown__action {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .profile-dropdown__action i {
    font-size: 14px;
  }

  .profile-dropdown__action--primary {
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: white;
  }

  .profile-dropdown__action--primary:hover {
    background: linear-gradient(135deg, #4f46e5, #4338ca);
    transform: translateY(-1px);
  }

  .profile-dropdown__action--danger {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1.5px solid rgba(239, 68, 68, 0.3);
  }

  .profile-dropdown__action--danger:hover {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.5);
  }

  .profile-dropdown__action:active {
    transform: translateY(0);
  }

  .profile-dropdown__action:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  /* ============================================================================
     LOGGED OUT STATE
     ============================================================================ */
  .profile-dropdown__logged-out {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 24px 16px;
    gap: 12px;
  }

  .profile-dropdown__logged-out-icon {
    font-size: 48px;
    color: rgba(255, 255, 255, 0.3);
  }

  .profile-dropdown__logged-out-text {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
  }

  /* ============================================================================
     RESPONSIVE
     ============================================================================ */
  @media (max-width: 480px) {
    .profile-dropdown {
      min-width: 260px;
      right: -8px;
    }
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .profile-dropdown {
      animation: none;
    }

    .profile-dropdown__action {
      transition: none;
    }

    .profile-dropdown__action:hover {
      transform: none;
    }
  }

  @media (prefers-contrast: high) {
    .profile-dropdown {
      background: rgba(0, 0, 0, 0.98);
      border: 2px solid white;
    }

    .profile-dropdown__divider {
      background: white;
    }
  }
</style>
