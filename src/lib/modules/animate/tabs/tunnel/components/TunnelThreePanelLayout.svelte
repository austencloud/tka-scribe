<!--
  TunnelThreePanelLayout.svelte

  The three-panel layout container showing Primary + Secondary = Result.
  Orchestrates TunnelSequencePanel components with operators between them.
-->
<script lang="ts">
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import type { NormalizedSequenceData } from "../../../services/contracts";
  import TunnelSequencePanel from "./TunnelSequencePanel.svelte";
  import TunnelResultPanel from "./TunnelResultPanel.svelte";
  import TunnelModeCanvas from "./TunnelModeCanvas.svelte";

  interface TunnelColors {
    primary: { blue: string; red: string };
    secondary: { blue: string; red: string };
  }

  let {
    // Primary sequence props
    primarySequence,
    loadedPrimarySequence,
    primaryNormalized,
    primaryWord,
    primaryColors,

    // Secondary sequence props
    secondarySequence,
    loadedSecondarySequence,
    secondaryNormalized,
    secondaryWord,
    secondaryColors,

    // Tunnel colors for canvas
    tunnelColors,

    // Visibility bindings
    primaryVisible = $bindable(true),
    primaryBlueVisible = $bindable(true),
    primaryRedVisible = $bindable(true),
    secondaryVisible = $bindable(true),
    secondaryBlueVisible = $bindable(true),
    secondaryRedVisible = $bindable(true),

    // Playback state
    isPlaying = $bindable(false),
    animatingBeatNumber = $bindable<number | null>(null),
    speed,

    // Transform handlers
    onTransformPrimary,
    onTransformSecondary,
  }: {
    // Primary sequence props
    primarySequence: SequenceData | null;
    loadedPrimarySequence: SequenceData | null;
    primaryNormalized: NormalizedSequenceData;
    primaryWord: string;
    primaryColors: { color: string; label: string }[];

    // Secondary sequence props
    secondarySequence: SequenceData | null;
    loadedSecondarySequence: SequenceData | null;
    secondaryNormalized: NormalizedSequenceData;
    secondaryWord: string;
    secondaryColors: { color: string; label: string }[];

    // Tunnel colors for canvas
    tunnelColors: TunnelColors;

    // Visibility bindings
    primaryVisible: boolean;
    primaryBlueVisible: boolean;
    primaryRedVisible: boolean;
    secondaryVisible: boolean;
    secondaryBlueVisible: boolean;
    secondaryRedVisible: boolean;

    // Playback state
    isPlaying: boolean;
    animatingBeatNumber: number | null;
    speed: number;

    // Transform handlers
    onTransformPrimary: (op: "mirror" | "rotate" | "colorSwap" | "reverse") => void;
    onTransformSecondary: (op: "mirror" | "rotate" | "colorSwap" | "reverse") => void;
  } = $props();
</script>

<div class="three-panel-container">
  <!-- Primary Sequence Panel -->
  <TunnelSequencePanel
    variant="primary"
    sequenceName={primaryWord}
    colors={primaryColors}
    beats={primaryNormalized.beats}
    startPosition={primaryNormalized.startPosition}
    selectedBeatNumber={animatingBeatNumber}
    isLoading={!loadedPrimarySequence}
    bind:visible={primaryVisible}
    bind:blueVisible={primaryBlueVisible}
    bind:redVisible={primaryRedVisible}
    onMirror={() => onTransformPrimary("mirror")}
    onRotate={() => onTransformPrimary("rotate")}
    onColorSwap={() => onTransformPrimary("colorSwap")}
    onReverse={() => onTransformPrimary("reverse")}
  />

  <!-- Plus Operator -->
  <div class="operator-icon">
    <div class="operator-badge">
      <i class="fas fa-plus"></i>
    </div>
  </div>

  <!-- Secondary Sequence Panel -->
  <TunnelSequencePanel
    variant="secondary"
    sequenceName={secondaryWord}
    colors={secondaryColors}
    beats={secondaryNormalized.beats}
    startPosition={secondaryNormalized.startPosition}
    selectedBeatNumber={animatingBeatNumber}
    isLoading={!loadedSecondarySequence}
    bind:visible={secondaryVisible}
    bind:blueVisible={secondaryBlueVisible}
    bind:redVisible={secondaryRedVisible}
    onMirror={() => onTransformSecondary("mirror")}
    onRotate={() => onTransformSecondary("rotate")}
    onColorSwap={() => onTransformSecondary("colorSwap")}
    onReverse={() => onTransformSecondary("reverse")}
  />

  <!-- Equals Operator -->
  <div class="operator-icon">
    <div class="operator-badge result-badge">
      <i class="fas fa-equals"></i>
    </div>
  </div>

  <!-- Animation Result Panel -->
  <TunnelResultPanel bind:primaryVisible bind:secondaryVisible>
    {#if loadedPrimarySequence && loadedSecondarySequence}
      <TunnelModeCanvas
        primarySequence={loadedPrimarySequence}
        secondarySequence={loadedSecondarySequence}
        {tunnelColors}
        {primaryVisible}
        {primaryBlueVisible}
        {primaryRedVisible}
        {secondaryVisible}
        {secondaryBlueVisible}
        {secondaryRedVisible}
        bind:isPlaying
        bind:animatingBeatNumber
        {speed}
      />
    {:else}
      <div class="loading-animation">
        <div class="spinner"></div>
        <p>Loading sequences...</p>
      </div>
    {/if}
  </TunnelResultPanel>
</div>

<style>
  .three-panel-container {
    flex: 1;
    display: flex;
    align-items: stretch;
    gap: 8px;
    padding: 12px;
    overflow: hidden;
    min-height: 0;
  }

  /* Operator Icons */
  .operator-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 0 4px;
  }

  .operator-badge {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .result-badge {
    background: rgba(20, 184, 166, 0.1);
    border-color: rgba(20, 184, 166, 0.3);
    color: #14b8a6;
  }

  /* Loading State */
  .loading-animation {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .spinner {
    width: 36px;
    height: 36px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: #14b8a6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-animation p {
    margin: 0;
    font-size: 0.8rem;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .three-panel-container {
      flex-direction: column;
      overflow-y: auto;
      gap: 12px;
    }

    .operator-icon {
      padding: 4px 0;
    }

    .operator-badge {
      transform: rotate(90deg);
    }
  }
</style>
