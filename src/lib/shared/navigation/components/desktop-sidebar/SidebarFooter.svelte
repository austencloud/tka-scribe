<!-- Sidebar Footer Component -->
<!-- Contains unified account & settings button -->
<script lang="ts">
  import AccountSettingsButton from "../AccountSettingsButton.svelte";

  let { isCollapsed, isSettingsActive } = $props<{
    isCollapsed: boolean;
    isSettingsActive: boolean;
    onSettingsClick?: () => void; // Deprecated, kept for backward compatibility
  }>();
</script>

<div class="sidebar-footer">
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
     ANIMATIONS & TRANSITIONS
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
      animation: none !important;
    }
  }
</style>
