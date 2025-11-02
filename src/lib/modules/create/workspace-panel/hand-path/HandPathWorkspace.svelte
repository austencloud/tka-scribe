<!--
HandPathWorkspace.svelte - Hand Path Drawing Workspace

Workspace area for drawing hand paths via touch gestures.
Displays the swipeable grid where users trace their sequences.
Integrates with standard Workspace/ToolPanel layout.
-->
<script lang="ts">
  import { GridMode } from "$shared";
  import { fade } from "svelte/transition";
  import TouchableGrid from "../../construct/gestural-path-builder/components/TouchableGrid.svelte";
  import type { GesturalPathState } from "../../construct/gestural-path-builder/state";

  // Props
  let {
    pathState,
    isStarted = false,
    onSegmentComplete,
    onAdvancePressed,
    onAdvanceReleased,
  }: {
    pathState: GesturalPathState;
    isStarted: boolean;
    onSegmentComplete: (start: any, end: any) => void;
    onAdvancePressed: () => void;
    onAdvanceReleased: () => void;
  } = $props();

  // Computed contextual header based on state
  let contextualHeader = $derived(() => {
    if (!isStarted) return "Configure Settings";
    if (pathState.isSessionComplete) return "Sequence Complete!";
    if (pathState.currentHand === "blue") return "Draw Blue Hand Path";
    if (pathState.currentHand === "red") return "Draw Red Hand Path";
    return "Draw Hand Path";
  });

  // Computed subtitle
  let contextualSubtitle = $derived(() => {
    if (!isStarted) return "Use the settings panel to configure your sequence";
    if (pathState.isSessionComplete) return "Review your sequence and finish when ready";
    const currentBeat = pathState.currentHandBeats?.length ?? 0;
    const totalBeats = pathState.config?.beatsPerHand ?? 0;
    return `Beat ${currentBeat} of ${totalBeats}`;
  });
</script>

<div class="hand-path-workspace" data-testid="hand-path-workspace">
  {#if !isStarted}
    <!-- Setup state: Show instructions -->
    <div class="setup-instructions" in:fade={{ duration: 200 }}>
      <div class="instructions-icon">
        <i class="fas fa-hand-pointer"></i>
      </div>
      <h2>{contextualHeader()}</h2>
      <p>{contextualSubtitle()}</p>
      <div class="instructions-steps">
        <div class="instruction-step">
          <div class="step-number">1</div>
          <p>Choose your sequence length and grid mode</p>
        </div>
        <div class="instruction-step">
          <div class="step-number">2</div>
          <p>Press "Start Drawing" when ready</p>
        </div>
        <div class="instruction-step">
          <div class="step-number">3</div>
          <p>Swipe paths on the grid for each beat</p>
        </div>
      </div>
    </div>
  {:else}
    <!-- Drawing state: Show grid -->
    <div class="drawing-workspace" in:fade={{ duration: 200 }}>
      <!-- Contextual header -->
      <div class="workspace-header">
        <h2 class="title">{contextualHeader()}</h2>
        <p class="subtitle">{contextualSubtitle()}</p>
      </div>

      <!-- Swipeable grid -->
      <div class="grid-container">
        <TouchableGrid
          {pathState}
          gridMode={pathState.config?.gridMode || GridMode.DIAMOND}
          {onSegmentComplete}
          {onAdvancePressed}
          {onAdvanceReleased}
        />
      </div>
    </div>
  {/if}
</div>

<style>
  .hand-path-workspace {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    position: relative;
  }

  .setup-instructions {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: clamp(1rem, 3vh, 2rem);
    text-align: center;
    gap: clamp(1rem, 2vh, 2rem);
  }

  .instructions-icon {
    font-size: clamp(3rem, 8vh, 5rem);
    color: #10b981;
    filter: drop-shadow(0 4px 16px rgba(16, 185, 129, 0.4));
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .setup-instructions h2 {
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 700;
    color: white;
    margin: 0;
  }

  .setup-instructions p {
    font-size: clamp(0.9rem, 2.5vw, 1.1rem);
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }

  .instructions-steps {
    display: flex;
    flex-direction: column;
    gap: clamp(0.75rem, 1.5vh, 1.25rem);
    margin-top: clamp(1rem, 2vh, 2rem);
    max-width: 400px;
  }

  .instruction-step {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: clamp(0.75rem, 1.5vh, 1rem);
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .step-number {
    width: clamp(32px, 6vw, 40px);
    height: clamp(32px, 6vw, 40px);
    background: linear-gradient(135deg, #10b981, #059669);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    color: white;
    flex-shrink: 0;
  }

  .instruction-step p {
    flex: 1;
    margin: 0;
    text-align: left;
    font-size: clamp(0.875rem, 2vw, 1rem);
    color: rgba(255, 255, 255, 0.8);
  }

  .drawing-workspace {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    gap: clamp(0.75rem, 1.5vh, 1.25rem);
    padding: clamp(0.5rem, 1vh, 1rem);
  }

  .workspace-header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    text-align: center;
    flex-shrink: 0;
  }

  .title {
    font-size: clamp(1.25rem, 3vw, 1.75rem);
    font-weight: 700;
    color: white;
    margin: 0;
    line-height: 1.2;
  }

  .subtitle {
    font-size: clamp(0.8rem, 2vw, 0.95rem);
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    line-height: 1.3;
  }

  .grid-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    min-height: 0;
  }
</style>
