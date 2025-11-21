<!-- Sidebar Header Component -->
<!-- Contains the logo/branding and collapse toggle button -->
<script lang="ts">
  let { isCollapsed, onLogoClick, onToggleCollapse } = $props<{
    isCollapsed: boolean,
    onLogoClick: () => void,
    onToggleCollapse: () => void
  }>();
</script>

<div class="sidebar-header">
  <button
    class="studio-logo"
    onclick={onLogoClick}
    aria-label="About TKA Studio"
    title="About TKA Studio"
  >
    <div class="logo-icon">
      <i class="fas fa-circle-info"></i>
    </div>
    {#if !isCollapsed}
      <span class="studio-name">TKA Studio</span>
    {/if}
  </button>
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
    padding: 20px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    background: linear-gradient(
      135deg,
      rgba(103, 126, 234, 0.08) 0%,
      rgba(118, 75, 162, 0.08) 100%
    );
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: relative;
  }

  .studio-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    color: rgba(255, 255, 255, 0.95);
    width: 100%;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 10px;
    position: relative;
  }

  .studio-logo::before {
    content: "";
    position: absolute;
    inset: -8px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    opacity: 0;
    transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .studio-logo:hover::before {
    opacity: 1;
  }

  .studio-logo:hover {
    transform: translateX(2px);
  }

  .studio-logo:active {
    transform: scale(0.98);
  }

  .logo-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(
      135deg,
      rgba(56, 189, 248, 0.15) 0%,
      rgba(6, 182, 212, 0.1) 100%
    );
    border: 1px solid rgba(56, 189, 248, 0.25);
    box-shadow: 0 0 12px rgba(56, 189, 248, 0.2);
    font-size: 20px;
    color: rgba(56, 189, 248, 1);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .studio-logo:hover .logo-icon {
    background: linear-gradient(
      135deg,
      rgba(56, 189, 248, 0.25) 0%,
      rgba(6, 182, 212, 0.18) 100%
    );
    border-color: rgba(56, 189, 248, 0.4);
    box-shadow: 0 0 20px rgba(56, 189, 248, 0.35);
  }

  .studio-name {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.02em;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(255, 255, 255, 0.75) 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ============================================================================
     COLLAPSE TOGGLE BUTTON
     ============================================================================ */
  .collapse-toggle {
    width: 100%;
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
  .studio-logo:focus-visible,
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

    .studio-logo:hover,
    .studio-logo:active {
      transform: none !important;
    }
  }
</style>
