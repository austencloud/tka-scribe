<!--
  NotificationBadge - Notification Counter Badge

  Displays an unread notification count badge overlay.
  Designed to sit on top of profile photos or buttons.
-->
<script lang="ts">
  let { count = 0, max = 99 } = $props<{
    count?: number;
    max?: number;
  }>();

  // Display text: show "99+" if count exceeds max
  const displayCount = $derived(count > max ? `${max}+` : String(count));

  // Only show if there are unread notifications
  const shouldShow = $derived(count > 0);
</script>

{#if shouldShow}
  <div class="notification-badge" aria-label="{count} unread notifications">
    {displayCount}
  </div>
{/if}

<style>
  .notification-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    display: flex;
    align-items: center;
    justify-content: center;

    /* Styling */
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    font-size: 11px;
    font-weight: 700;
    border-radius: 10px;
    border: 2px solid var(--theme-panel-bg, rgba(0, 0, 0, 0.3));
    box-shadow:
      var(--theme-shadow, 0 2px 4px rgba(0, 0, 0, 0.2)),
      0 0 0 1px var(--theme-stroke, rgba(255, 255, 255, 0.1)) inset;

    /* Ensure it's always on top */
    z-index: 10;
    pointer-events: none; /* Don't interfere with button clicks */

    /* Subtle pulse animation to draw attention */
    animation: badge-pulse 2s ease-in-out infinite;
  }

  @keyframes badge-pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .notification-badge {
      animation: none;
    }
  }
</style>
