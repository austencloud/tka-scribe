<!-- Sidebar Footer Component -->
<!-- Contains settings button and profile button -->
<script lang="ts">
  import AccountSettingsButton from "../AccountSettingsButton.svelte";

  let { isCollapsed, isSettingsActive, onSettingsClick, onDebugClick } = $props<{
    isCollapsed: boolean;
    isSettingsActive: boolean;
    onSettingsClick?: () => void;
    onDebugClick?: () => void;
  }>();
</script>

<div class="sidebar-footer">
  <!-- Settings Button (Gear Icon) -->
  <button
    class="footer-button settings-button"
    class:active={isSettingsActive}
    class:collapsed={isCollapsed}
    onclick={onSettingsClick}
    aria-label="Settings"
  >
    <div class="icon-wrapper">
      <i class="fas fa-cog"></i>
    </div>
    {#if !isCollapsed}
      <span class="button-label">Settings</span>
    {/if}
  </button>

  <!-- Profile/Account Button -->
  <AccountSettingsButton {isCollapsed} />
</div>

<style>
  /* ============================================================================
     SIDEBAR FOOTER
     ============================================================================ */
  .sidebar-footer {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 16px 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.2) 0%, transparent 100%);
  }

  /* ============================================================================
     FOOTER BUTTON (Settings)
     ============================================================================ */
  .footer-button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 14px;
    background: transparent;
    border: none;
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 15px;
    font-weight: 500;
    box-sizing: border-box;
  }

  .footer-button.collapsed {
    justify-content: center;
    padding: 10px;
    width: auto;
  }

  .footer-button:hover {
    color: rgba(255, 255, 255, 0.95);
    background: rgba(255, 255, 255, 0.08);
  }

  .footer-button:active {
    transform: scale(0.98);
  }

  .footer-button.active {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 1);
  }

  .icon-wrapper {
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    transition: all 0.25s ease;
  }

  .footer-button:hover .icon-wrapper {
    transform: scale(1.05);
  }

  .settings-button:hover .icon-wrapper i {
    transform: rotate(90deg);
  }

  .icon-wrapper i {
    transition: transform 0.3s ease;
  }

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
  .footer-button:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .footer-button,
    .icon-wrapper,
    .icon-wrapper i {
      transition: none;
    }

    .footer-button:hover,
    .footer-button:active,
    .footer-button:hover .icon-wrapper,
    .settings-button:hover .icon-wrapper i {
      transform: none;
    }
  }
</style>
