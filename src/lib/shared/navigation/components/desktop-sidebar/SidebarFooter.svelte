<!-- Sidebar Footer Component -->
<!-- Contains settings button and profile button -->
<script lang="ts">
  import AccountSettingsButton from "../AccountSettingsButton.svelte";

  let { isCollapsed, isSettingsActive, onSettingsClick, onDebugClick } =
    $props<{
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
     SIDEBAR FOOTER - Premium Glassmorphism Design
     ============================================================================ */
  .sidebar-footer {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.25) 0%,
      rgba(0, 0, 0, 0.1) 50%,
      transparent 100%
    );
    position: relative;
  }

  /* Subtle glow line at top */
  .sidebar-footer::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
  }

  /* ============================================================================
     FOOTER BUTTON (Settings)
     ============================================================================ */
  .footer-button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 14px;
    font-weight: 500;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
  }

  /* Shimmer effect */
  .footer-button::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      transparent 40%,
      rgba(255, 255, 255, 0.08) 50%,
      transparent 60%
    );
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
  }

  .footer-button:hover::before {
    opacity: 1;
    animation: footer-shimmer 1s ease-in-out;
  }

  @keyframes footer-shimmer {
    0% {
      transform: translateX(-100%) translateY(-100%);
    }
    100% {
      transform: translateX(100%) translateY(100%);
    }
  }

  .footer-button.collapsed {
    justify-content: center;
    padding: 10px;
    width: auto;
  }

  .footer-button:hover {
    color: rgba(255, 255, 255, 0.98);
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow:
      0 4px 16px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transform: translateX(4px);
  }

  .footer-button:active {
    transform: translateX(2px) scale(0.99);
    transition-duration: 0.1s;
  }

  .footer-button.active {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.18);
    color: rgba(255, 255, 255, 1);
    box-shadow:
      0 2px 12px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  .icon-wrapper {
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .footer-button:hover .icon-wrapper {
    transform: scale(1.1);
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .settings-button:hover .icon-wrapper i {
    transform: rotate(90deg);
  }

  .icon-wrapper i {
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  }

  .button-label {
    flex: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  .footer-button:focus-visible {
    outline: 2px solid rgba(99, 102, 241, 0.7);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .footer-button,
    .footer-button::before,
    .icon-wrapper,
    .icon-wrapper i {
      transition: none !important;
      animation: none !important;
    }

    .footer-button:hover,
    .footer-button:active,
    .footer-button:hover .icon-wrapper,
    .settings-button:hover .icon-wrapper i {
      transform: none;
    }
  }
</style>
