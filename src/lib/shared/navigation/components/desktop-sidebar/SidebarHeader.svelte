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
    <i class="fas fa-{isCollapsed ? 'indent' : 'outdent'}"></i>
  </button>
</div>

<style>
  /* ============================================================================
     SIDEBAR HEADER - Premium Glassmorphism Design
     ============================================================================ */
  .sidebar-header {
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-accent, #6366f1) 10%, transparent) 0%,
      color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 8%, transparent)
        50%,
      rgba(236, 72, 153, 0.06) 100%
    );
    display: flex;
    flex-direction: column;
    position: relative;
  }

  /* Subtle glow effect at top */
  .sidebar-header::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      color-mix(in srgb, var(--theme-accent, #6366f1) 40%, transparent),
      color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 40%, transparent),
      transparent
    );
  }

  /* ============================================================================
     COLLAPSE TOGGLE BUTTON
     ============================================================================ */
  .collapse-toggle {
    width: 100%;
    min-height: var(--min-touch-target);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 10px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 15px;
    position: relative;
    overflow: hidden;
  }

  /* Shimmer effect */
  .collapse-toggle::before {
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
  }

  .collapse-toggle:hover::before {
    opacity: 1;
    animation: header-shimmer 1s ease-in-out;
  }

  @keyframes header-shimmer {
    0% {
      transform: translateX(-100%) translateY(-100%);
    }
    100% {
      transform: translateX(100%) translateY(100%);
    }
  }

  .collapse-toggle:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 1));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.18));
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .collapse-toggle:active {
    transform: scale(0.97);
    transition-duration: 0.1s;
  }

  .collapse-toggle i {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .collapse-toggle:hover i {
    transform: scale(1.15);
  }

  /* Focus styles for keyboard navigation */
  .collapse-toggle:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--theme-accent) 70%, transparent);
    outline-offset: 2px;
  }

  /* ============================================================================
     ANIMATIONS & TRANSITIONS
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .collapse-toggle,
    .collapse-toggle::before,
    .collapse-toggle i {
      transition: none !important;
      animation: none !important;
    }
    .collapse-toggle:hover,
    .collapse-toggle:active {
      transform: none;
    }
  }
</style>
