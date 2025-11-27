<!--
  GridModePanel.svelte - Grid Mode (2×2 Rotated Grid)

  Shows up to 4 sequences in a 2×2 grid with rotation offsets.
  Features:
  - Engaging empty state with visual grid preview
  - Modern grid cell cards with rotation indicators
  - Intuitive sequence assignment
  - Consistent modern styling
-->
<script lang="ts">
  import type { AnimateModuleState } from "../shared/state/animate-module-state.svelte";
  import SequenceBrowserPanel from "../shared/components/SequenceBrowserPanel.svelte";

  // Props
  let {
    animateState,
  }: {
    animateState: AnimateModuleState;
  } = $props();

  // Grid position config
  const gridPositions = [
    { index: 0 as const, label: "Top-Left", shortLabel: "TL", rotation: 0, color: "#ec4899" },
    { index: 1 as const, label: "Top-Right", shortLabel: "TR", rotation: 90, color: "#8b5cf6" },
    { index: 2 as const, label: "Bottom-Left", shortLabel: "BL", rotation: 180, color: "#06b6d4" },
    { index: 3 as const, label: "Bottom-Right", shortLabel: "BR", rotation: 270, color: "#10b981" },
  ];

  // Derived state
  const hasAnySequence = $derived(
    animateState.gridSequences.some((seq: unknown) => seq !== null)
  );

  const filledCount = $derived(
    animateState.gridSequences.filter((seq: unknown) => seq !== null).length
  );

  // Features for empty state
  const features = [
    {
      icon: "fa-rotate",
      title: "Rotation Offsets",
      description: "Each quadrant has a different rotation angle",
    },
    {
      icon: "fa-clone",
      title: "Same or Different",
      description: "Use one sequence 4 times or mix different ones",
    },
    {
      icon: "fa-sync",
      title: "Synchronized Play",
      description: "All animations play together in perfect sync",
    },
  ];
</script>

<div class="grid-mode-panel">
  {#if !hasAnySequence}
    <!-- Empty State -->
    <div class="empty-state">
      <div class="empty-state-content">
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="hero-icon">
            <i class="fas fa-grip"></i>
          </div>
          <h1>Grid Mode</h1>
          <p>Create stunning 2×2 compositions with rotational variations</p>

          <button
            class="primary-action-btn"
            onclick={() => animateState.openSequenceBrowser("grid-0")}
          >
            <i class="fas fa-plus"></i>
            Start Building Grid
          </button>
        </div>

        <!-- Grid Preview -->
        <div class="grid-preview">
          <div class="preview-title">
            <i class="fas fa-eye"></i>
            Preview
          </div>
          <div class="preview-grid">
            {#each gridPositions as pos}
              <div class="preview-cell" style="--cell-color: {pos.color}">
                <div class="preview-rotation">{pos.rotation}°</div>
                <i
                  class="fas fa-person-walking preview-icon"
                  style="transform: rotate({pos.rotation}deg);"
                ></i>
                <div class="preview-label">{pos.shortLabel}</div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Features -->
        <div class="features-row">
          {#each features as feature}
            <div class="feature-item">
              <div class="feature-icon">
                <i class="fas {feature.icon}"></i>
              </div>
              <div class="feature-text">
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {:else}
    <!-- Grid View -->
    <div class="grid-view">
      <!-- Header -->
      <div class="view-header">
        <div class="header-info">
          <h2>Grid Animation</h2>
          <span class="filled-count">{filledCount}/4 positions filled</span>
        </div>

        <button
          class="reset-btn"
          onclick={() => {
            animateState.setGridSequence(0, null);
            animateState.setGridSequence(1, null);
            animateState.setGridSequence(2, null);
            animateState.setGridSequence(3, null);
          }}
        >
          <i class="fas fa-redo"></i>
          Reset All
        </button>
      </div>

      <!-- 2×2 Grid Canvas -->
      <div class="grid-canvas">
        {#each gridPositions as pos}
          {@const sequence = animateState.gridSequences[pos.index]}
          {@const rotation = animateState.gridRotationOffsets[pos.index]}

          <div
            class="grid-cell"
            class:filled={sequence}
            style="--cell-color: {pos.color}"
          >
            {#if sequence}
              <!-- Filled Cell -->
              <div class="cell-header">
                <div class="rotation-badge">
                  <i class="fas fa-rotate"></i>
                  {rotation}°
                </div>
                <button
                  class="remove-btn"
                  onclick={(e) => {
                    e.stopPropagation();
                    animateState.setGridSequence(pos.index, null);
                  }}
                  aria-label="Remove sequence"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="cell-content">
                <div
                  class="sequence-visual"
                  style="transform: rotate({rotation}deg);"
                >
                  <i class="fas fa-person-walking"></i>
                </div>
                <div class="sequence-name">{sequence.word || "Untitled"}</div>
                <div class="sequence-beats">{sequence.beats?.length ?? 0} beats</div>
              </div>

              <button
                class="change-cell-btn"
                onclick={() => animateState.openSequenceBrowser(`grid-${pos.index}`)}
              >
                <i class="fas fa-exchange-alt"></i>
                Change
              </button>
            {:else}
              <!-- Empty Cell -->
              <button
                class="empty-cell-btn"
                onclick={() => animateState.openSequenceBrowser(`grid-${pos.index}`)}
              >
                <div class="empty-icon">
                  <i class="fas fa-plus"></i>
                </div>
                <div class="empty-label">{pos.label}</div>
                <div class="empty-rotation">{pos.rotation}° rotation</div>
              </button>
            {/if}
          </div>
        {/each}
      </div>

      <!-- Controls Panel -->
      <div class="controls-panel">
        <div class="controls-row">
          <!-- Playback Controls -->
          <div class="playback-group">
            <button
              class="control-btn play-btn"
              class:playing={animateState.isPlaying}
              aria-label={animateState.isPlaying ? "Pause" : "Play"}
              onclick={() => animateState.setIsPlaying(!animateState.isPlaying)}
            >
              <i class="fas fa-{animateState.isPlaying ? 'pause' : 'play'}"></i>
            </button>

            <button
              class="control-btn"
              aria-label="Stop"
              onclick={() => animateState.setIsPlaying(false)}
            >
              <i class="fas fa-stop"></i>
            </button>

            <button
              class="control-btn"
              class:active={animateState.shouldLoop}
              aria-label="Loop"
              onclick={() => animateState.setShouldLoop(!animateState.shouldLoop)}
            >
              <i class="fas fa-repeat"></i>
            </button>
          </div>

          <!-- Speed Control -->
          <div class="speed-group">
            <label for="grid-speed">
              <i class="fas fa-gauge"></i>
              Speed
            </label>
            <input
              id="grid-speed"
              type="range"
              min="0.25"
              max="2"
              step="0.25"
              value={animateState.speed}
              oninput={(e) => animateState.setSpeed(parseFloat(e.currentTarget.value))}
            />
            <span class="speed-value">{animateState.speed.toFixed(2)}x</span>
          </div>

          <!-- Export Button -->
          <button class="export-btn">
            <i class="fas fa-download"></i>
            <span>Export Grid</span>
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Sequence Browser -->
  <SequenceBrowserPanel
    mode={animateState.browserMode}
    show={animateState.isSequenceBrowserOpen}
    onSelect={(seq) => {
      const mode = animateState.browserMode;
      if (mode === "grid-0") animateState.setGridSequence(0, seq);
      else if (mode === "grid-1") animateState.setGridSequence(1, seq);
      else if (mode === "grid-2") animateState.setGridSequence(2, seq);
      else if (mode === "grid-3") animateState.setGridSequence(3, seq);
      animateState.closeSequenceBrowser();
    }}
    onClose={animateState.closeSequenceBrowser}
  />
</div>

<style>
  .grid-mode-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* ===========================
     EMPTY STATE
     =========================== */

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 2rem;
    overflow-y: auto;
  }

  .empty-state-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    max-width: 800px;
    width: 100%;
  }

  /* Hero Section */
  .hero-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
  }

  .hero-icon {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(234, 88, 12, 0.2) 100%);
    border: 2px solid rgba(251, 146, 60, 0.3);
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    color: #fb923c;
    margin-bottom: 0.5rem;
  }

  .hero-section h1 {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-section p {
    margin: 0;
    font-size: 1.1rem;
    opacity: 0.6;
    max-width: 400px;
  }

  .primary-action-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #fb923c 0%, #ea580c 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 0.5rem;
  }

  .primary-action-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(251, 146, 60, 0.4);
  }

  /* Grid Preview */
  .grid-preview {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 1.25rem;
    width: 100%;
    max-width: 400px;
  }

  .preview-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    opacity: 0.7;
  }

  .preview-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 8px;
    aspect-ratio: 1;
  }

  .preview-cell {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--cell-color, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    padding: 1rem;
    gap: 0.5rem;
  }

  .preview-rotation {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    padding: 0.2rem 0.5rem;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--cell-color);
  }

  .preview-icon {
    font-size: 2.5rem;
    opacity: 0.3;
    color: var(--cell-color);
  }

  .preview-label {
    font-size: 0.75rem;
    font-weight: 600;
    opacity: 0.5;
  }

  /* Features Row */
  .features-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    width: 100%;
  }

  .feature-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
    padding: 1.25rem 1rem;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    transition: all 0.2s ease;
  }

  .feature-item:hover {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
  }

  .feature-icon {
    width: 44px;
    height: 44px;
    background: rgba(251, 146, 60, 0.15);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fb923c;
    font-size: 1.1rem;
  }

  .feature-text h4 {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .feature-text p {
    margin: 0;
    font-size: 0.8rem;
    opacity: 0.6;
    line-height: 1.4;
  }

  /* ===========================
     GRID VIEW
     =========================== */

  .grid-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  /* Header */
  .view-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }

  .header-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .header-info h2 {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 700;
  }

  .filled-count {
    padding: 0.25rem 0.75rem;
    background: rgba(251, 146, 60, 0.15);
    border: 1px solid rgba(251, 146, 60, 0.3);
    border-radius: 20px;
    font-size: 0.8rem;
    color: #fb923c;
  }

  .reset-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    color: #f87171;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .reset-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.5);
  }

  /* Grid Canvas */
  .grid-canvas {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 12px;
    padding: 1rem;
    background: linear-gradient(
      135deg,
      rgba(15, 20, 30, 0.5) 0%,
      rgba(10, 15, 25, 0.5) 100%
    );
    overflow: hidden;
  }

  .grid-cell {
    position: relative;
    display: flex;
    flex-direction: column;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.2s ease;
  }

  .grid-cell:hover {
    border-color: var(--cell-color, rgba(255, 255, 255, 0.2));
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.05);
  }

  .grid-cell.filled {
    border-color: var(--cell-color, rgba(255, 255, 255, 0.2));
  }

  /* Filled Cell */
  .cell-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .rotation-badge {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.6rem;
    background: var(--cell-color, rgba(139, 92, 246, 0.2));
    background: color-mix(in srgb, var(--cell-color) 25%, transparent);
    border: 1px solid var(--cell-color, rgba(139, 92, 246, 0.4));
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--cell-color);
  }

  .remove-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 6px;
    color: #f87171;
    cursor: pointer;
    opacity: 0;
    transition: all 0.2s ease;
  }

  .grid-cell:hover .remove-btn {
    opacity: 1;
  }

  .remove-btn:hover {
    background: rgba(239, 68, 68, 0.4);
    border-color: rgba(239, 68, 68, 0.6);
  }

  .cell-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
  }

  .sequence-visual {
    font-size: 3.5rem;
    opacity: 0.25;
    color: var(--cell-color);
    transition: transform 0.3s ease;
  }

  .sequence-name {
    font-size: 1rem;
    font-weight: 600;
    text-align: center;
  }

  .sequence-beats {
    font-size: 0.8rem;
    opacity: 0.5;
  }

  .change-cell-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.6rem;
    background: rgba(255, 255, 255, 0.05);
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .change-cell-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  /* Empty Cell */
  .empty-cell-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .empty-cell-btn:hover {
    color: var(--cell-color, rgba(255, 255, 255, 0.8));
  }

  .empty-icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 2px dashed rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    font-size: 1.5rem;
    transition: all 0.2s ease;
  }

  .empty-cell-btn:hover .empty-icon {
    background: color-mix(in srgb, var(--cell-color) 15%, transparent);
    border-color: var(--cell-color);
    border-style: solid;
    color: var(--cell-color);
  }

  .empty-label {
    font-size: 0.95rem;
    font-weight: 500;
  }

  .empty-rotation {
    font-size: 0.8rem;
    opacity: 0.5;
  }

  /* Controls Panel */
  .controls-panel {
    padding: 1rem 1.25rem;
    background: rgba(0, 0, 0, 0.25);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }

  .controls-row {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .playback-group {
    display: flex;
    gap: 0.5rem;
  }

  .control-btn {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 50%;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .control-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }

  .control-btn.active {
    background: rgba(251, 146, 60, 0.25);
    border-color: rgba(251, 146, 60, 0.5);
    color: #fb923c;
  }

  .control-btn.play-btn {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.4) 0%, rgba(22, 163, 74, 0.4) 100%);
    border-color: rgba(34, 197, 94, 0.5);
    font-size: 1.1rem;
  }

  .control-btn.play-btn:hover {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.5) 0%, rgba(22, 163, 74, 0.5) 100%);
    box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3);
  }

  .control-btn.play-btn.playing {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.4) 0%, rgba(245, 158, 11, 0.4) 100%);
    border-color: rgba(251, 191, 36, 0.5);
  }

  /* Speed Control */
  .speed-group {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    max-width: 300px;
  }

  .speed-group label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    opacity: 0.7;
    white-space: nowrap;
  }

  .speed-group input[type="range"] {
    flex: 1;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    outline: none;
  }

  .speed-group input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    background: linear-gradient(135deg, #fb923c 0%, #ea580c 100%);
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  .speed-value {
    font-size: 0.9rem;
    font-weight: 600;
    min-width: 50px;
    text-align: right;
  }

  /* Export Button */
  .export-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border: none;
    border-radius: 10px;
    color: white;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .export-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }

  /* ===========================
     RESPONSIVE
     =========================== */

  @media (max-width: 768px) {
    .features-row {
      grid-template-columns: 1fr;
    }

    .grid-preview {
      max-width: 300px;
    }

    .controls-row {
      flex-wrap: wrap;
      justify-content: center;
    }

    .speed-group {
      flex: 1 1 100%;
      order: 3;
      margin-top: 0.5rem;
      max-width: none;
    }

    .export-btn span {
      display: none;
    }

    .sequence-visual {
      font-size: 2.5rem;
    }
  }

  @media (max-width: 480px) {
    .empty-state {
      padding: 1rem;
    }

    .grid-canvas {
      gap: 8px;
      padding: 0.75rem;
    }

    .view-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .header-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .reset-btn {
      width: 100%;
      justify-content: center;
    }
  }
</style>
