<!-- Sidebar Footer Component -->
<!-- Footer with inbox button and settings gear/back button -->
<script lang="ts">
  import InboxButton from "$lib/shared/inbox/components/InboxButton.svelte";
  import { authState } from "$lib/shared/auth/state/authState.svelte";

  let { isCollapsed, isSettingsActive, onSettingsClick } = $props<{
    isCollapsed: boolean;
    isSettingsActive: boolean;
    onSettingsClick?: () => void;
  }>();

  // Only show inbox button for authenticated users
  const showInbox = $derived(authState.isAuthenticated);
</script>

<!-- Footer with inbox and settings -->
<div
  class="sidebar-footer"
  class:collapsed={isCollapsed}
  style="--button-accent-color: #64748b;"
>
  <!-- Inbox Button (only when authenticated) -->
  {#if showInbox}
    <InboxButton {isCollapsed} />
  {/if}

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
     SIDEBAR FOOTER - Inbox + Settings entry points
     ============================================================================ */
  .sidebar-footer {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px 12px;
    border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
  }

  .sidebar-footer.collapsed {
    padding: 12px 8px;
    align-items: center;
    gap: 12px;
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
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.06));
    border-radius: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    font-weight: 500;
  }

  .settings-button:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.12));
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .settings-button.active {
    background: color-mix(in srgb, var(--button-accent-color) 15%, transparent);
    border-color: color-mix(
      in srgb,
      var(--button-accent-color) 25%,
      transparent
    );
    color: white;
  }

  .settings-button.collapsed {
    width: 52px;
    height: 52px;
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
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    transition: all 0.2s ease;
  }

  .settings-button.collapsed .button-icon {
    width: 100%;
    height: 100%;
    background: transparent;
    border-radius: 12px;
  }

  .settings-button:hover .button-icon {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
  }

  .settings-button.active .button-icon {
    background: color-mix(in srgb, var(--button-accent-color) 20%, transparent);
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
    outline: 2px solid color-mix(in srgb, var(--theme-accent) 70%, transparent);
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
