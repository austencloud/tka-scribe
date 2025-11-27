<!--
  MirrorModePanel.svelte - Mirror Mode (Side-by-Side Mirrored View)

  Shows one sequence alongside its mirrored version with polished UI.
  Features:
  - Engaging empty state with mode explanation
  - Clean split-view animation display
  - Intuitive mirror axis controls
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

  // Derived stats
  const sequenceStats = $derived.by(() => {
    const seq = animateState.primarySequence;
    if (!seq) return null;

    return {
      beats: seq.beats?.length ?? 0,
      word: seq.word || seq.name || "Untitled",
      author: seq.author,
    };
  });

  // Mirror axis options
  const axisOptions = [
    {
      id: "vertical" as const,
      icon: "fa-arrows-left-right",
      label: "Vertical",
      description: "Mirror left to right",
    },
    {
      id: "horizontal" as const,
      icon: "fa-arrows-up-down",
      label: "Horizontal",
      description: "Mirror top to bottom",
    },
  ];
</script>

<div class="mirror-mode-panel">
  {#if !animateState.primarySequence}
    <!-- Empty State -->
    <div class="empty-state">
      <div class="empty-state-content">
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="hero-icon">
            <i class="fas fa-clone"></i>
          </div>
          <h1>Mirror Mode</h1>
          <p>Compare your sequence side-by-side with its mirrored reflection</p>

          <button
            class="primary-action-btn"
            onclick={() => animateState.openSequenceBrowser("primary")}
          >
            <i class="fas fa-folder-open"></i>
            Select Sequence
          </button>
        </div>

        <!-- How It Works -->
        <div class="info-section">
          <h3><i class="fas fa-info-circle"></i> How Mirror Mode Works</h3>
          <div class="info-cards">
            <div class="info-card">
              <div class="info-icon">
                <i class="fas fa-arrows-left-right"></i>
              </div>
              <div class="info-text">
                <h4>Vertical Mirror</h4>
                <p>Flips the sequence horizontally, like looking in a mirror</p>
              </div>
            </div>
            <div class="info-card">
              <div class="info-icon">
                <i class="fas fa-arrows-up-down"></i>
              </div>
              <div class="info-text">
                <h4>Horizontal Mirror</h4>
                <p>Flips the sequence vertically, top to bottom reflection</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Use Case -->
        <div class="use-case-tip">
          <i class="fas fa-lightbulb"></i>
          <span>Great for practicing ambidextrous movements or checking symmetry</span>
        </div>
      </div>
    </div>
  {:else}
    <!-- Mirror Animation View -->
    <div class="mirror-view">
      <!-- Header -->
      <div class="view-header">
        <div class="sequence-info">
          <h2>{sequenceStats?.word}</h2>
          {#if sequenceStats?.author}
            <span class="author-tag">by {sequenceStats.author}</span>
          {/if}
        </div>

        <div class="header-actions">
          <button
            class="change-btn"
            onclick={() => animateState.openSequenceBrowser("primary")}
          >
            <i class="fas fa-exchange-alt"></i>
            Change
          </button>
        </div>
      </div>

      <!-- Mirror Axis Selector -->
      <div class="axis-selector">
        <span class="axis-label">Mirror Axis:</span>
        <div class="axis-options">
          {#each axisOptions as option}
            <button
              class="axis-btn"
              class:active={animateState.mirrorAxis === option.id}
              onclick={() => animateState.setMirrorAxis(option.id)}
              title={option.description}
            >
              <i class="fas {option.icon}"></i>
              <span>{option.label}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Split Canvas View -->
      <div class="canvas-split">
        <!-- Original Side -->
        <div class="canvas-panel original">
          <div class="panel-label">
            <i class="fas fa-user"></i>
            Original
          </div>
          <div class="canvas-area">
            <div class="placeholder-visual">
              <i class="fas fa-person-walking"></i>
            </div>
          </div>
        </div>

        <!-- Divider with Indicator -->
        <div class="split-divider">
          <div class="divider-line"></div>
          <div class="divider-icon">
            <i class="fas fa-{animateState.mirrorAxis === 'vertical' ? 'arrows-left-right' : 'arrows-up-down'}"></i>
          </div>
          <div class="divider-line"></div>
        </div>

        <!-- Mirrored Side -->
        <div class="canvas-panel mirrored">
          <div class="panel-label">
            <i class="fas fa-clone"></i>
            Mirrored
          </div>
          <div class="canvas-area">
            <div
              class="placeholder-visual"
              style="transform: scale{animateState.mirrorAxis === 'vertical' ? 'X' : 'Y'}(-1);"
            >
              <i class="fas fa-person-walking"></i>
            </div>
          </div>
        </div>
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
            <label for="mirror-speed">
              <i class="fas fa-gauge"></i>
              Speed
            </label>
            <input
              id="mirror-speed"
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
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Sequence Browser -->
  <SequenceBrowserPanel
    mode="primary"
    show={animateState.isSequenceBrowserOpen}
    onSelect={(seq) => {
      animateState.setPrimarySequence(seq);
      animateState.closeSequenceBrowser();
    }}
    onClose={animateState.closeSequenceBrowser}
  />
</div>

<style>
  .mirror-mode-panel {
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
    gap: 2.5rem;
    max-width: 700px;
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
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
    border: 2px solid rgba(6, 182, 212, 0.3);
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    color: #06b6d4;
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
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
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
    box-shadow: 0 12px 32px rgba(6, 182, 212, 0.4);
  }

  /* Info Section */
  .info-section {
    width: 100%;
  }

  .info-section h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 1rem 0;
    font-size: 1rem;
    opacity: 0.8;
  }

  .info-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .info-card {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    transition: all 0.2s ease;
  }

  .info-card:hover {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
  }

  .info-icon {
    width: 44px;
    height: 44px;
    background: rgba(6, 182, 212, 0.15);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #22d3ee;
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .info-text h4 {
    margin: 0 0 0.25rem 0;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .info-text p {
    margin: 0;
    font-size: 0.85rem;
    opacity: 0.6;
    line-height: 1.4;
  }

  /* Use Case Tip */
  .use-case-tip {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.85rem 1.25rem;
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.2);
    border-radius: 10px;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .use-case-tip i {
    color: #fbbf24;
    font-size: 1.1rem;
  }

  /* ===========================
     MIRROR VIEW
     =========================== */

  .mirror-view {
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

  .sequence-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .sequence-info h2 {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 700;
  }

  .author-tag {
    padding: 0.25rem 0.6rem;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    font-size: 0.8rem;
    opacity: 0.7;
  }

  .change-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    color: white;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .change-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
  }

  /* Axis Selector */
  .axis-selector {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 0.75rem 1.25rem;
    background: rgba(0, 0, 0, 0.15);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
  }

  .axis-label {
    font-size: 0.9rem;
    opacity: 0.7;
  }

  .axis-options {
    display: flex;
    gap: 0.5rem;
  }

  .axis-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .axis-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .axis-btn.active {
    background: rgba(6, 182, 212, 0.2);
    border-color: rgba(6, 182, 212, 0.5);
    color: #22d3ee;
  }

  /* Split Canvas View */
  .canvas-split {
    flex: 1;
    display: flex;
    overflow: hidden;
    background: linear-gradient(
      135deg,
      rgba(15, 20, 30, 0.5) 0%,
      rgba(10, 15, 25, 0.5) 100%
    );
  }

  .canvas-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .panel-label {
    position: absolute;
    top: 1rem;
    left: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.8rem;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 500;
    backdrop-filter: blur(8px);
    z-index: 1;
  }

  .canvas-area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .placeholder-visual {
    font-size: 6rem;
    opacity: 0.1;
    transition: transform 0.3s ease;
  }

  /* Split Divider */
  .split-divider {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 0;
    width: 40px;
    flex-shrink: 0;
  }

  .divider-line {
    flex: 1;
    width: 2px;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(6, 182, 212, 0.4),
      transparent
    );
  }

  .divider-icon {
    width: 36px;
    height: 36px;
    background: rgba(6, 182, 212, 0.2);
    border: 1px solid rgba(6, 182, 212, 0.4);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #22d3ee;
    font-size: 0.85rem;
    flex-shrink: 0;
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
    background: rgba(6, 182, 212, 0.25);
    border-color: rgba(6, 182, 212, 0.5);
    color: #22d3ee;
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
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
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
    .info-cards {
      grid-template-columns: 1fr;
    }

    .canvas-split {
      flex-direction: column;
    }

    .split-divider {
      flex-direction: row;
      width: 100%;
      height: 40px;
      padding: 0 1rem;
    }

    .divider-line {
      flex: 1;
      height: 2px;
      width: auto;
      background: linear-gradient(
        to right,
        transparent,
        rgba(6, 182, 212, 0.4),
        transparent
      );
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
  }

  @media (max-width: 480px) {
    .empty-state {
      padding: 1rem;
    }

    .view-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .axis-selector {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>
