<!-- Sidebar Footer Component -->
<!-- Contains settings button and other footer actions -->
<script lang="ts">
  let {
    isCollapsed,
    isSettingsActive,
    onSettingsClick,
  } = $props<{
    isCollapsed: boolean;
    isSettingsActive: boolean;
    onSettingsClick: () => void;
  }>();
</script>

<div class="sidebar-footer">
  <button
    class="footer-button settings-button"
    class:active={isSettingsActive}
    class:sidebar-collapsed={isCollapsed}
    onclick={onSettingsClick}
    aria-label="Settings"
  >
    <i class="fas fa-cog"></i>
    {#if !isCollapsed}
      <span>Settings</span>
    {/if}
  </button>
</div>

<style>
  /* ============================================================================
     SIDEBAR FOOTER
     ============================================================================ */
  .sidebar-footer {
    padding: 16px 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.2) 0%, transparent 100%);
  }

  .footer-button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: transparent;
    border: none;
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.25s ease;
    font-size: 15px;
    font-weight: 500;
  }

  .footer-button.sidebar-collapsed {
    justify-content: center;
    padding: 12px 8px;
  }

  .footer-button:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.95);
    transform: translateX(2px);
  }

  .footer-button.active {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 1);
  }

  .footer-button i {
    font-size: 18px;
  }

  /* Focus styles for keyboard navigation */
  .footer-button:focus-visible {
    outline: 2px solid rgba(102, 126, 234, 0.6);
    outline-offset: 2px;
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
