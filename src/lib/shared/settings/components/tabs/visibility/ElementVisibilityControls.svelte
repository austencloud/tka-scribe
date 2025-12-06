<!--
  ElementVisibilityControls.svelte - Element Visibility Controls

  Two-column grid layout that uses horizontal space efficiently.
  Adapts to available height using container queries.
-->
<script lang="ts">
  import ChipRow from "./ChipRow.svelte";

  interface Props {
    tkaVisible: boolean;
    vtgVisible: boolean;
    elementalVisible: boolean;
    positionsVisible: boolean;
    reversalsVisible: boolean;
    turnNumbersVisible: boolean;
    nonRadialVisible: boolean;
    blueMotionVisible: boolean;
    redMotionVisible: boolean;
    onToggleTKA: () => void;
    onToggleVTG: () => void;
    onToggleElemental: () => void;
    onTogglePositions: () => void;
    onToggleReversals: () => void;
    onToggleTurnNumbers: () => void;
    onToggleNonRadial: () => void;
    onToggleBlueMotion: () => void;
    onToggleRedMotion: () => void;
  }

  let {
    tkaVisible,
    vtgVisible,
    elementalVisible,
    positionsVisible,
    reversalsVisible,
    turnNumbersVisible,
    nonRadialVisible,
    blueMotionVisible,
    redMotionVisible,
    onToggleTKA,
    onToggleVTG,
    onToggleElemental,
    onTogglePositions,
    onToggleReversals,
    onToggleTurnNumbers,
    onToggleNonRadial,
    onToggleBlueMotion,
    onToggleRedMotion,
  }: Props = $props();
</script>

<div class="element-controls">
  <!-- Element Visibility Section -->
  <h4 class="section-title">Elements</h4>
  <div class="chips-grid">
    <ChipRow
      label="TKA"
      checked={tkaVisible}
      onChange={onToggleTKA}
      ariaLabel="Toggle TKA glyph visibility"
    />
    <ChipRow
      label="Turn #s"
      checked={turnNumbersVisible}
      disabled={!tkaVisible}
      badgeText={!tkaVisible ? "Needs TKA" : undefined}
      onChange={onToggleTurnNumbers}
      ariaLabel="Toggle turn numbers visibility"
    />
    <ChipRow
      label="VTG"
      checked={vtgVisible}
      onChange={onToggleVTG}
      ariaLabel="Toggle VTG glyph visibility"
    />
    <ChipRow
      label="Elemental"
      checked={elementalVisible}
      onChange={onToggleElemental}
      ariaLabel="Toggle elemental glyph visibility"
    />
    <ChipRow
      label="Positions"
      checked={positionsVisible}
      onChange={onTogglePositions}
      ariaLabel="Toggle position glyph visibility"
    />
    <ChipRow
      label="Reversals"
      checked={reversalsVisible}
      onChange={onToggleReversals}
      ariaLabel="Toggle reversal indicators visibility"
    />
  </div>

  <!-- Motion & Grid Section -->
  <h4 class="section-title">Motion & Grid</h4>
  <div class="chips-grid">
    <ChipRow
      label="Blue Motion"
      checked={blueMotionVisible}
      onChange={onToggleBlueMotion}
      ariaLabel="Toggle blue motion visibility"
    />
    <ChipRow
      label="Red Motion"
      checked={redMotionVisible}
      onChange={onToggleRedMotion}
      ariaLabel="Toggle red motion visibility"
    />
    <ChipRow
      label="Non-radial"
      checked={nonRadialVisible}
      onChange={onToggleNonRadial}
      ariaLabel="Toggle non-radial points visibility"
    />
  </div>
</div>

<style>
  .element-controls {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    overflow: hidden; /* Ensure content is contained */
  }

  .section-title {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    padding: 0 4px;
    flex-shrink: 0;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  /* Two-column grid for chips */
  .chips-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    flex: 1;
    min-height: 0;
    align-content: start; /* Align to top, don't stretch */
  }

  /* Compact mode when height is very limited */
  @container visibility-tab (max-height: 552px) {
    .element-controls {
      gap: 8px;
    }

    .section-title {
      font-size: 11px;
      margin-bottom: -2px;
    }

    .chips-grid {
      gap: 6px;
    }
  }

  /* Ultra-compact mode */
  @container visibility-tab (max-height: 480px) {
    .element-controls {
      gap: 6px;
    }

    .section-title {
      font-size: 10px;
    }

    .chips-grid {
      gap: 4px;
    }
  }

  /* On wider containers in side-by-side mode, keep 2 columns for controls */
  /* 3 columns only when we have more horizontal space in the controls area */
  @container visibility-tab (min-width: 700px) and (min-height: 400px) {
    .chips-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
  }

  /* Very wide: can afford 3 columns in controls */
  @container visibility-tab (min-width: 900px) and (min-height: 452px) {
    .chips-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  /* Accessibility */
  @media (prefers-contrast: high) {
    .section-title {
      color: rgba(255, 255, 255, 0.9);
    }
  }
</style>
