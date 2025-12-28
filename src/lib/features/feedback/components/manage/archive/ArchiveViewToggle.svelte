<!-- ArchiveViewToggle - Toggle between releases and all items views -->
<script lang="ts">
  type ViewMode = "releases" | "all";

  const { viewMode, onViewModeChange } = $props<{
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
  }>();
</script>

<div class="view-toggle">
  <button
    type="button"
    class="toggle-btn"
    class:active={viewMode === "releases"}
    onclick={() => onViewModeChange("releases")}
  >
    <i class="fas fa-tags" aria-hidden="true"></i>
    By Release
  </button>
  <button
    type="button"
    class="toggle-btn"
    class:active={viewMode === "all"}
    onclick={() => onViewModeChange("all")}
  >
    <i class="fas fa-list" aria-hidden="true"></i>
    All Items
  </button>
</div>

<style>
  .view-toggle {
    display: flex;
    gap: 4px;
    background: color-mix(
      in srgb,
      var(--theme-panel-bg, #12121a) 90%,
      transparent
    );
    padding: 4px;
    border-radius: 8px;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
  }

  .toggle-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .toggle-btn:hover {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
  }

  .toggle-btn.active {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .toggle-btn i {
    font-size: 12px;
  }

  @media (max-width: 768px) {
    .view-toggle {
      width: 100%;
    }

    .toggle-btn {
      flex: 1;
      justify-content: center;
    }
  }
</style>
