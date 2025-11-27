<!-- Sidebar Header Component -->
<!-- Contains the logo/branding and collapse toggle button -->
<script lang="ts">
  let { isCollapsed, onLogoClick, onToggleCollapse } = $props<{
    isCollapsed: boolean;
    onLogoClick: () => void;
    onToggleCollapse: () => void;
  }>();
</script>

<div class="sidebar-header">

  <!-- Collapse Toggle Button -->
  <button
    class="collapse-toggle"
    onclick={onToggleCollapse}
    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
  >
    <i class="fas fa-{isCollapsed ? 'angle-right' : 'angle-left'}"></i>
  </button>
</div>

<style>
  /* ============================================================================
     SIDEBAR HEADER
     ============================================================================ */
  .sidebar-header {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    background: linear-gradient(
      135deg,
      rgba(103, 126, 234, 0.08) 0%,
      rgba(118, 75, 162, 0.08) 100%
    );
    display: flex;
    flex-direction: column;
    position: relative;
  }

  /* ============================================================================
     COLLAPSE TOGGLE BUTTON
     ============================================================================ */
  .collapse-toggle {
    width: 100%;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 16px;
  }

  .collapse-toggle:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.95);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .collapse-toggle:active {
    transform: scale(0.95);
  }

  /* Focus styles for keyboard navigation */
  .collapse-toggle:focus-visible {
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
