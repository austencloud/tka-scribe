<script lang="ts">
  /**
   * GridSettingsPanel - Grid mode and plane visibility controls
   *
   * Toggle between diamond/box grid modes and show/hide individual planes.
   */

  import { Plane, PLANE_LABELS, PLANE_COLORS } from "../../domain/enums/Plane";
  import type { GridMode } from "../../domain/constants/grid-layout";

  interface Props {
    /** Current grid mode */
    gridMode: GridMode;
    /** Currently visible planes */
    visiblePlanes: Set<Plane>;
    /** Callback when grid mode changes */
    onGridModeChange: (mode: GridMode) => void;
    /** Callback when plane visibility changes */
    onPlaneToggle: (plane: Plane) => void;
  }

  let { gridMode, visiblePlanes, onGridModeChange, onPlaneToggle }: Props = $props();

  const allPlanes = [Plane.WALL, Plane.WHEEL, Plane.FLOOR];
</script>

<section class="grid-settings">
  <h3>Grid</h3>

  <!-- Grid Mode Toggle -->
  <div class="mode-toggle">
    <button
      class="mode-btn"
      class:active={gridMode === "diamond"}
      onclick={() => onGridModeChange("diamond")}
    >
      <i class="fas fa-diamond"></i>
      Diamond
    </button>
    <button
      class="mode-btn"
      class:active={gridMode === "box"}
      onclick={() => onGridModeChange("box")}
    >
      <i class="fas fa-square"></i>
      Box
    </button>
  </div>

  <!-- Plane Visibility -->
  <div class="plane-btns">
    {#each allPlanes as plane}
      <button
        class="plane-btn"
        class:active={visiblePlanes.has(plane)}
        style="--color: {PLANE_COLORS[plane]}"
        onclick={() => onPlaneToggle(plane)}
      >
        <span class="indicator"></span>
        {PLANE_LABELS[plane]}
      </button>
    {/each}
  </div>
</section>

<style>
  .grid-settings {
    padding: 1rem;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.02));
    border-radius: 12px;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.05));
  }

  h3 {
    margin: 0 0 0.75rem;
    font-size: var(--font-size-compact, 0.75rem);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .mode-toggle {
    display: flex;
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.3));
    border-radius: 10px;
    padding: 3px;
    margin-bottom: 0.75rem;
  }

  .mode-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    min-height: 40px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-size: var(--font-size-sm, 0.875rem);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .mode-btn:hover {
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
  }

  .mode-btn.active {
    background: var(--theme-accent, rgba(139, 92, 246, 0.5));
    color: white;
  }

  .mode-btn i {
    font-size: 0.75rem;
  }

  .plane-btns {
    display: flex;
    gap: 0.5rem;
  }

  .plane-btn {
    flex: 1;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 10px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-size: var(--font-size-sm, 0.8rem);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .plane-btn:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
  }

  .plane-btn.active {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.06));
    border-color: var(--color);
    color: var(--theme-text, white);
  }

  .plane-btn .indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color);
    opacity: 0.4;
    transition: opacity 0.15s;
  }

  .plane-btn.active .indicator {
    opacity: 1;
  }
</style>
