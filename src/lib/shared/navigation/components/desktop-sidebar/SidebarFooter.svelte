<!-- Sidebar Footer Component -->
<!-- Contains unified account & settings button -->
<script lang="ts">
  import AccountSettingsButton from "../AccountSettingsButton.svelte";
  import { authStore } from "$shared/auth";

  let { isCollapsed, isSettingsActive, onDebugClick } = $props<{
    isCollapsed: boolean;
    isSettingsActive: boolean;
    onSettingsClick?: () => void; // Deprecated, kept for backward compatibility
    onDebugClick?: () => void;
  }>();
</script>

<div class="sidebar-footer">
  <!-- Debug Console Button (Admin Only) -->
  {#if authStore.isAdmin && onDebugClick}
    <button
      class="debug-button"
      class:collapsed={isCollapsed}
      onclick={onDebugClick}
      aria-label="Open debug console"
      title="Debug Console (Ctrl+`)"
    >
      <div class="debug-icon">
        <i class="fas fa-bug"></i>
      </div>
      {#if !isCollapsed}
        <span class="debug-label">Debug</span>
      {/if}
    </button>
  {/if}

  <!-- Unified Account & Settings Button -->
  <AccountSettingsButton {isCollapsed} isActive={isSettingsActive} />
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
     DEBUG BUTTON (Admin Only)
     ============================================================================ */
  .debug-button {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 10px 12px;
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 12px;
    background: rgba(239, 68, 68, 0.1);
    color: #f87171;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .debug-button:hover {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.3);
    transform: translateY(-1px);
  }

  .debug-button.collapsed {
    justify-content: center;
    padding: 10px;
  }

  .debug-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }

  .debug-label {
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
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
