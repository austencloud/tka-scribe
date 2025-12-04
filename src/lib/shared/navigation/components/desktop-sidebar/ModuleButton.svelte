<!-- Module Button Component -->
<!-- Button for a module that can expand/collapse to show sections -->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import type { ModuleDefinition } from "../../domain/types";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte";

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

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
  });

  function handleClick() {
    hapticService?.trigger("selection");
    onClick();
  }

  const isDisabled = $derived(module.disabled ?? false);

  // Show user's profile picture for dashboard module when signed in
  const showProfilePicture = $derived(
    module.id === "dashboard" && authStore.isAuthenticated && authStore.user?.photoURL
  );
  const profilePictureUrl = $derived(authStore.user?.photoURL || "");
  const profileDisplayName = $derived(authStore.user?.displayName || "User");
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
  {#if !isCollapsed}
    <span class="module-label">{module.label}</span>
    {#if isDisabled && module.disabledMessage}
      <span class="disabled-badge">{module.disabledMessage}</span>
    {:else}
      <span class="expand-icon">
        <i class="fas fa-chevron-{isExpanded ? 'down' : 'right'}"></i>
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
    min-height: 48px;
    padding: 12px 14px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.7);
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
      rgba(255, 255, 255, 0.05) 50%,
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
    0% { transform: translateX(-100%) translateY(-100%); }
    100% { transform: translateX(100%) translateY(100%); }
  }

  .module-button:hover {
    color: rgba(255, 255, 255, 0.95);
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.06);
    transform: translateX(3px);
  }

  .module-button:active {
    transform: translateX(2px) scale(0.99);
    transition-duration: 0.1s;
  }

  /* Expanded state - very subtle */
  .module-button.expanded {
    color: rgba(255, 255, 255, 0.85);
    background: rgba(255, 255, 255, 0.02);
  }

  /* Active module indicator - minimal, just the accent bar */
  .module-button.active {
    color: rgba(255, 255, 255, 0.95);
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.06);
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
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.3));
  }

  .module-button.sidebar-collapsed.active::after {
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50%;
    height: 3px;
    border-radius: 3px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.3));
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
    color: rgba(255, 255, 255, 0.7);
    background: rgba(255, 255, 255, 0.03);
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
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    letter-spacing: 0.5px;
  }

  /* Focus styles for keyboard navigation */
  .module-button:focus-visible {
    outline: 2px solid rgba(99, 102, 241, 0.7);
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
