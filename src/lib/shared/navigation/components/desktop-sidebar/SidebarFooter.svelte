<!-- Sidebar Footer Component -->
<!-- Minimal footer with just the settings gear/back button -->
<script lang="ts">
  let {
    isCollapsed,
    isSettingsActive,
    onSettingsClick,
  } = $props<{
    isCollapsed: boolean;
    isSettingsActive: boolean;
    onSettingsClick?: () => void;
  }>();
</script>

<!-- Minimal footer - just the settings gear/back button -->
<div
  class="sidebar-footer"
  class:collapsed={isCollapsed}
  style="--settings-color: #64748b;"
>
  <!-- Settings Button -->
  <button
    class="settings-button"
    class:active={isSettingsActive}
    class:collapsed={isCollapsed}
    onclick={onSettingsClick}
    aria-label={isSettingsActive ? "Exit Settings" : "Settings"}
  >
    <div class="button-icon">
      <i class="fas {isSettingsActive ? 'fa-arrow-left' : 'fa-cog'}"></i>
    </div>
    {#if !isCollapsed}
      <span class="button-label">{isSettingsActive ? "Back" : "Settings"}</span>
    {/if}
  </button>
</div>

<style>
  /* ============================================================================
     SIDEBAR FOOTER - Minimal settings entry point
     ============================================================================ */
  .sidebar-footer {
    padding: 16px 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .sidebar-footer.collapsed {
    padding: 12px 8px;
    display: flex;
    justify-content: center;
  }

  /* ============================================================================
     SETTINGS BUTTON
     ============================================================================ */
  .settings-button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    font-weight: 500;
  }

  .settings-button:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.95);
  }

  .settings-button.active {
    background: color-mix(in srgb, var(--settings-color) 15%, transparent);
    border-color: color-mix(in srgb, var(--settings-color) 25%, transparent);
    color: white;
  }

  .settings-button.collapsed {
    width: 48px;
    height: 48px;
    padding: 0;
    justify-content: center;
    border-radius: 12px;
  }

  .button-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    transition: all 0.2s ease;
  }

  .settings-button.collapsed .button-icon {
    width: 100%;
    height: 100%;
    background: transparent;
    border-radius: 12px;
  }

  .settings-button:hover .button-icon {
    background: rgba(255, 255, 255, 0.1);
  }

  .settings-button.active .button-icon {
    background: color-mix(in srgb, var(--settings-color) 20%, transparent);
  }

  .settings-button:not(.active):hover .button-icon i {
    transform: rotate(90deg);
    transition: transform 0.3s ease;
  }

  .button-label {
    flex: 1;
    text-align: left;
    font-weight: 500;
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  .settings-button:focus-visible {
    outline: 2px solid rgba(99, 102, 241, 0.7);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .sidebar-footer,
    .settings-button,
    .button-icon {
      transition: none !important;
    }
  }
</style>
