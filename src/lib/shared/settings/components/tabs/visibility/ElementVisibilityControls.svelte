<!--
  ElementVisibilityControls.svelte - Element Visibility Controls

  Controls for toggling visibility of various pictograph elements:
  - Glyphs (TKA, VTG, Elemental, Positions, Reversals)
  - Grid elements (Non-radial Points)
-->
<script lang="ts">
  import ToggleRow from "./ToggleRow.svelte";

  interface Props {
    tkaVisible: boolean;
    vtgVisible: boolean;
    elementalVisible: boolean;
    positionsVisible: boolean;
    reversalsVisible: boolean;
    turnNumbersVisible: boolean;
    nonRadialVisible: boolean;
    onToggleTKA: () => void;
    onToggleVTG: () => void;
    onToggleElemental: () => void;
    onTogglePositions: () => void;
    onToggleReversals: () => void;
    onToggleTurnNumbers: () => void;
    onToggleNonRadial: () => void;
  }

  let {
    tkaVisible,
    vtgVisible,
    elementalVisible,
    positionsVisible,
    reversalsVisible,
    turnNumbersVisible,
    nonRadialVisible,
    onToggleTKA,
    onToggleVTG,
    onToggleElemental,
    onTogglePositions,
    onToggleReversals,
    onToggleTurnNumbers,
    onToggleNonRadial,
  }: Props = $props();
</script>

<div class="element-controls">
  <h4 class="group-title">Element Visibility</h4>

  <!-- Glyphs -->
  <ToggleRow
    label="TKA"
    checked={tkaVisible}
    onChange={onToggleTKA}
    ariaLabel="Toggle TKA glyph visibility"
  />

  <!-- TKA Sub-elements (indented to show hierarchy) -->
  <div class="sub-element-group">
    <ToggleRow
      label="Turn Numbers"
      checked={turnNumbersVisible}
      disabled={!tkaVisible}
      badgeText={!tkaVisible ? "Requires TKA" : undefined}
      onChange={onToggleTurnNumbers}
      ariaLabel="Toggle turn numbers visibility"
    />
  </div>

  <ToggleRow
    label="VTG"
    checked={vtgVisible}
    onChange={onToggleVTG}
    ariaLabel="Toggle VTG glyph visibility"
  />

  <ToggleRow
    label="Elemental"
    checked={elementalVisible}
    onChange={onToggleElemental}
    ariaLabel="Toggle elemental glyph visibility"
  />

  <ToggleRow
    label="Positions"
    checked={positionsVisible}
    onChange={onTogglePositions}
    ariaLabel="Toggle position glyph visibility"
  />

  <ToggleRow
    label="Reversals"
    checked={reversalsVisible}
    onChange={onToggleReversals}
    ariaLabel="Toggle reversal indicators visibility"
  />

  <!-- Grid Elements -->
  <ToggleRow
    label="Non-radial Points"
    checked={nonRadialVisible}
    onChange={onToggleNonRadial}
    ariaLabel="Toggle non-radial points visibility"
  />
</div>

<style>
  /* iOS Glass Morphism Card */
  .element-controls {
    display: flex;
    flex-direction: column;
    flex: 1; /* Grow to fill available space */
    min-height: 0; /* Allow shrinking to prevent overflow */
    background: rgba(255, 255, 255, 0.05);
    border: 0.33px solid rgba(255, 255, 255, 0.16); /* iOS hairline border */
    border-radius: 12px; /* iOS medium corner radius */
    padding: clamp(12px, 3cqi, 24px);
    box-shadow:
      0 3px 12px rgba(0, 0, 0, 0.12),
      0 1px 3px rgba(0, 0, 0, 0.08); /* iOS Photos.app shadow */
  }

  .group-title {
    font-size: clamp(15px, 3cqi, 18px); /* iOS body to title3 */
    font-weight: 600; /* iOS semibold */
    letter-spacing: -0.41px; /* iOS body tracking */
    line-height: 1.29; /* iOS body ratio */
    color: rgba(255, 255, 255, 0.95);
    margin: 0 0 clamp(10px, 2.5cqi, 20px) 0; /* Responsive spacing that grows with available space */
    flex-shrink: 0; /* Prevent title from shrinking */
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  /* Sub-element group - indented to show hierarchy */
  .sub-element-group {
    padding-left: clamp(12px, 3cqi, 20px);
    border-left: 2px solid rgba(255, 255, 255, 0.1);
    margin-left: clamp(8px, 2cqi, 12px);
    margin-bottom: clamp(
      8px,
      2cqi,
      12px
    ); /* Add space below to separate from next element */
  }

  /* Accessibility */
  @media (prefers-contrast: high) {
    .element-controls {
      border-width: 2px;
      border-color: rgba(255, 255, 255, 0.3);
    }

    .sub-element-group {
      border-left-color: rgba(255, 255, 255, 0.3);
    }
  }
</style>
