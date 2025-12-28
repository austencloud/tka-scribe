<script lang="ts">
  interface Props {
    viewMode: "global" | "users";
    onViewModeChange: (mode: "global" | "users") => void;
    stats: {
      total: number;
      enabled: number;
      disabled: number;
      byRole: Record<string, number>;
      byCategory: Record<string, number>;
    };
  }

  let { viewMode, onViewModeChange, stats }: Props = $props();
</script>

<header class="management-header">
  <div class="header-top">
    <div class="header-content">
      <h2>Feature Flag Management</h2>
      <p class="header-description">
        Control feature access and permissions across the platform
      </p>
    </div>

    <div class="view-toggle">
      <button
        class="toggle-btn"
        class:active={viewMode === "global"}
        onclick={() => onViewModeChange("global")}
      >
        <i class="fas fa-globe" aria-hidden="true"></i>
        Global Settings
      </button>
      <button
        class="toggle-btn"
        class:active={viewMode === "users"}
        onclick={() => onViewModeChange("users")}
      >
        <i class="fas fa-user-cog" aria-hidden="true"></i>
        User Overrides
      </button>
    </div>
  </div>
</header>

<style>
  .management-header {
    padding: 16px;
    background: var(--theme-panel-bg);
    border-bottom: 1px solid var(--theme-stroke);
  }

  .header-top {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .header-content {
    flex: 1;
  }

  .header-content h2 {
    margin: 0 0 4px 0;
    font-size: clamp(18px, 5vw, 24px);
    font-weight: 600;
    line-height: 1.2;
  }

  .header-description {
    margin: 0;
    font-size: clamp(12px, 3.5vw, 14px);
    color: var(--theme-text-dim);
  }

  .view-toggle {
    display: flex;
    gap: 4px;
    background: var(--theme-card-bg);
    padding: 4px;
    border-radius: 12px;
    width: 100%;
  }

  .toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex: 1;
    padding: 12px 12px;
    border: none;
    border-radius: 10px;
    background: transparent;
    color: var(--theme-text-dim);
    font-size: var(--font-size-compact);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    min-height: var(--min-touch-target); /* Touch target */
  }

  .toggle-btn:hover {
    background: var(--theme-card-hover-bg);
    color: var(--theme-text);
  }

  .toggle-btn:active {
    transform: scale(0.98);
  }

  .toggle-btn.active {
    background: color-mix(in srgb, var(--theme-accent) 20%, transparent);
    color: var(--theme-accent);
    box-shadow: 0 2px 8px
      color-mix(in srgb, var(--theme-accent) 15%, transparent);
  }

  /* Hide text on very small screens, show only icons */
  @media (max-width: 400px) {
    .toggle-btn {
      gap: 0;
      font-size: 0;
    }

    .toggle-btn i {
      font-size: var(--font-size-base);
    }
  }

  /* Tablet and up - horizontal layout */
  @media (min-width: 768px) {
    .management-header {
      padding: 24px;
    }

    .header-top {
      flex-direction: row;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
    }

    .view-toggle {
      width: auto;
    }

    .toggle-btn {
      flex: 0 0 auto;
      padding: 10px 16px;
      font-size: var(--font-size-sm);
    }
  }
</style>
