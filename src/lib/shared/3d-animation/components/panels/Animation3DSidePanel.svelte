<script lang="ts">
  /**
   * Animation3DSidePanel - Collapsible sidebar for 3D animation
   *
   * Contains: sequence loader, beat info, active configs, grid settings.
   * Composes smaller control components.
   */

  import type { MotionConfig3D } from "../../domain/models/MotionData3D";
  import type { GridMode } from "../../domain/constants/grid-layout";
  import { Plane } from "../../domain/enums/Plane";
  import GridSettingsPanel from "../controls/GridSettingsPanel.svelte";
  import ActiveConfigDisplay from "../controls/ActiveConfigDisplay.svelte";

  interface Props {
    /** Whether panel is collapsed */
    collapsed?: boolean;
    /** Whether a sequence is loaded */
    hasSequence: boolean;
    /** Current beat index */
    currentBeatIndex: number;
    /** Total beats */
    totalBeats: number;
    /** Blue config (null if not visible) */
    blueConfig: MotionConfig3D | null;
    /** Red config (null if not visible) */
    redConfig: MotionConfig3D | null;
    /** Grid mode */
    gridMode: GridMode;
    /** Visible planes */
    visiblePlanes: Set<Plane>;

    // Callbacks
    onLoadSequence: () => void;
    onGridModeChange: (mode: GridMode) => void;
    onPlaneToggle: (plane: Plane) => void;
  }

  let {
    collapsed = false,
    hasSequence,
    currentBeatIndex,
    totalBeats,
    blueConfig,
    redConfig,
    gridMode,
    visiblePlanes,
    onLoadSequence,
    onGridModeChange,
    onPlaneToggle,
  }: Props = $props();
</script>

<aside class="side-panel" class:collapsed>
  <!-- Load Sequence Button -->
  <div class="load-section">
    <button class="load-btn" onclick={onLoadSequence}>
      <i class="fas fa-folder-open" aria-hidden="true"></i>
      Load Sequence
    </button>
  </div>

  <!-- Sequence Info -->
  {#if hasSequence}
    <div class="sequence-header">
      <span class="mode-label">Beat {currentBeatIndex + 1} of {totalBeats}</span>
    </div>
  {:else}
    <div class="empty-state">
      <i class="fas fa-film" aria-hidden="true"></i>
      <p>Load a sequence to begin</p>
    </div>
  {/if}

  <!-- Scrollable Content -->
  <div class="panel-scroll">
    <!-- Active Configs (when sequence loaded) -->
    {#if hasSequence}
      <ActiveConfigDisplay {blueConfig} {redConfig} />
    {/if}

    <!-- Grid Settings -->
    <GridSettingsPanel
      {gridMode}
      {visiblePlanes}
      {onGridModeChange}
      {onPlaneToggle}
    />
  </div>
</aside>

<style>
  .side-panel {
    width: 420px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: var(--theme-panel-bg);
    border-left: 1px solid var(--theme-stroke);
    transition: width 0.3s ease, opacity 0.3s ease;
  }

  .side-panel.collapsed {
    width: 0;
    opacity: 0;
    overflow: hidden;
  }

  .load-section {
    padding: 1rem;
    border-bottom: 1px solid var(--theme-stroke);
  }

  .load-btn {
    width: 100%;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: var(--theme-accent, var(--theme-accent-strong));
    border: none;
    border-radius: 12px;
    color: white;
    font-size: var(--font-size-sm, 0.875rem);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }

  .load-btn:hover {
    background: #7c3aed;
    transform: translateY(-1px);
  }

  .load-btn:active {
    transform: translateY(0);
  }

  .sequence-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: var(--theme-card-bg);
    border-bottom: 1px solid var(--theme-stroke);
  }

  .mode-label {
    font-size: var(--font-size-compact, 0.75rem);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--theme-text-dim, var(--theme-text-dim));
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 2rem 1rem;
    color: var(--theme-text-dim);
    text-align: center;
  }

  .empty-state i {
    font-size: 2rem;
    opacity: 0.5;
  }

  .empty-state p {
    margin: 0;
    font-size: var(--font-size-sm, 0.875rem);
  }

  .panel-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  @media (max-width: 1024px) {
    .side-panel {
      width: 380px;
    }
  }

  @media (max-width: 800px) {
    .side-panel {
      width: 360px;
    }
  }

  @media (max-width: 600px) {
    .side-panel {
      width: 100%;
      max-height: 50vh;
      border-left: none;
      border-top: 1px solid var(--theme-stroke);
    }

    .side-panel.collapsed {
      max-height: 0;
      width: 100%;
    }
  }
</style>
