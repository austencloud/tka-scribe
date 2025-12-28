<!-- ModuleSwitcherButton - Menu Button for Module Navigation -->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { IHapticFeedback } from "$lib/shared/application/services/contracts/IHapticFeedback";
  import { inboxState } from "$lib/shared/inbox/state/inbox-state.svelte";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";

  let { onClick = () => {} } = $props<{
    onClick?: () => void;
  }>();

  let hapticService: IHapticFeedback | undefined;

  onMount(() => {
    hapticService = resolve<IHapticFeedback>(
      TYPES.IHapticFeedback
    );
  });

  function handleClick(event: MouseEvent | TouchEvent) {
    // Prevent double-firing on devices that support both touch and mouse
    if (event instanceof TouchEvent) {
      event.preventDefault();
    }

    hapticService?.trigger("selection");
    onClick();
  }

  // Check if currently on Dashboard
  const isOnDashboard = $derived(navigationState.currentModule === "dashboard");

  // Inbox badge count - shows notification count (only when NOT on Dashboard)
  // Once on Dashboard, the user sees the badge on the notification bell - no need for redundancy
  const badgeCount = $derived(isOnDashboard ? 0 : inboxState.unreadNotificationCount);

  function formatBadgeCount(count: number): string {
    if (count > 99) return "99+";
    return count.toString();
  }
</script>

<button
  class="menu-button"
  class:has-badge={badgeCount > 0}
  onclick={handleClick}
  ontouchend={handleClick}
  aria-label="Open menu{badgeCount > 0
    ? `, ${badgeCount} unread notifications`
    : ''}"
>
  <i class="fas fa-bars menu-icon" aria-hidden="true"></i>
  <!-- Inbox unread badge -->
  {#if badgeCount > 0}
    <span class="unread-badge" aria-hidden="true">
      {formatBadgeCount(badgeCount)}
    </span>
  {/if}
</button>

<style>
  .menu-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    min-width: var(--min-touch-target);
    min-height: var(--min-touch-target);
    padding: 0;
    background: transparent;
    border: 1px solid var(--theme-accent, #6366f1);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 8px hsl(0 0% 0% / 0.3);
    transition:
      transform 0.1s ease,
      opacity 0.15s ease,
      background 0.15s ease;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    position: relative;
  }

  .menu-button:hover {
    opacity: 0.85;
    background: color-mix(
      in srgb,
      var(--theme-accent, #6366f1) 15%,
      transparent
    );
  }

  .menu-button:active {
    transform: scale(0.95);
  }

  /* Focus state for keyboard navigation */
  .menu-button:focus-visible {
    outline: 2px solid var(--theme-accent, #6366f1);
    outline-offset: 2px;
  }

  .menu-icon {
    font-size: 20px;
    color: var(--theme-accent, #6366f1);
    pointer-events: none;
  }

  /* Unread badge */
  .unread-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    background: var(--semantic-error, #ef4444);
    border-radius: 9px;
    color: white;
    font-size: 12px;
    font-weight: 600;
    line-height: 18px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    animation: badgePop 0.3s ease;
    pointer-events: none;
    z-index: 10;
  }

  @keyframes badgePop {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .menu-button {
      border: 2px solid white;
    }

    .menu-button:focus-visible {
      outline: 3px solid white;
    }

    .menu-icon {
      color: white;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .menu-button {
      transition: none;
    }

    .menu-button:active {
      transform: none;
    }

    .unread-badge {
      animation: none;
    }
  }
</style>
