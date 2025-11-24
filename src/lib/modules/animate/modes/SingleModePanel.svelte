<!--
  SingleModePanel.svelte - Single Sequence Animation Mode

  Full-screen canvas showing one sequence with polished modern UI.
  Features:
  - Engaging empty state with feature highlights
  - Sequence stats when loaded
  - Modern playback controls
  - Clean, consistent styling
-->
<script lang="ts">
  import type { AnimateModuleState } from "../shared/state/animate-module-state.svelte";
  import { SingleModeCanvas } from "./components";
  import SequenceBrowserPanel from "../shared/components/SequenceBrowserPanel.svelte";
  import AnimationControls from "../components/AnimationControls.svelte";

  // Props
  let {
    animateState,
  }: {
    animateState: AnimateModuleState;
  } = $props();

  // Local state for animation playback
  let animatingBeatNumber = $state<number | null>(null);

  // Derived stats
  const sequenceStats = $derived.by(() => {
    const seq = animateState.primarySequence;
    if (!seq) return null;

    const beatCount = seq.beats?.length ?? 0;
    const estimatedDuration = beatCount * (60 / (animateState.speed * 60)); // Based on BPM

    return {
      beats: beatCount,
      duration: estimatedDuration.toFixed(1),
      word: seq.word || seq.name || "Untitled",
      author: seq.author,
      difficulty: (seq as unknown as { difficulty?: string }).difficulty ?? "intermediate",
    };
  });

  // Feature highlights for empty state
  const features = [
    {
      icon: "fa-play-circle",
      title: "Smooth Playback",
      description: "Watch your sequence animate with fluid transitions",
    },
    {
      icon: "fa-sliders-h",
      title: "BPM Control",
      description: "Tap tempo or adjust speed to match your rhythm",
    },
    {
      icon: "fa-repeat",
      title: "Loop Mode",
      description: "Practice by looping animations continuously",
    },
    {
      icon: "fa-download",
      title: "Export",
      description: "Save as GIF or video to share your work",
    },
  ];
</script>

<div class="single-mode-panel">
  {#if !animateState.primarySequence}
    <!-- Empty State - Engaging Selection Prompt -->
    <div class="empty-state">
      <div class="empty-state-content">
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="hero-icon">
            <i class="fas fa-film"></i>
          </div>
          <h1>Single Mode Animation</h1>
          <p>Bring your sequences to life with smooth, fluid animations</p>

          <button
            class="primary-action-btn"
            onclick={() => animateState.openSequenceBrowser("primary")}
          >
            <i class="fas fa-folder-open"></i>
            Browse Sequences
          </button>
        </div>

        <!-- Feature Highlights -->
        <div class="features-grid">
          {#each features as feature}
            <div class="feature-card">
              <div class="feature-icon">
                <i class="fas {feature.icon}"></i>
              </div>
              <div class="feature-text">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          {/each}
        </div>

        <!-- Quick Tip -->
        <div class="quick-tip">
          <i class="fas fa-lightbulb"></i>
          <span>Tip: Use the tap tempo feature to match your music's BPM</span>
        </div>
      </div>
    </div>
  {:else}
    <!-- Animation View - Sequence Loaded -->
    <div class="animation-view">
      <!-- Header with Sequence Info & Stats -->
      <div class="animation-header">
        <div class="sequence-info">
          <div class="sequence-title-row">
            <h2>{sequenceStats?.word}</h2>
            {#if sequenceStats?.author}
              <span class="author-badge">by {sequenceStats.author}</span>
            {/if}
          </div>
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

      <!-- Stats Bar -->
      <div class="stats-bar">
        <div class="stat-item">
          <i class="fas fa-layer-group"></i>
          <span class="stat-value">{sequenceStats?.beats}</span>
          <span class="stat-label">Beats</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <i class="fas fa-clock"></i>
          <span class="stat-value">{sequenceStats?.duration}s</span>
          <span class="stat-label">Duration</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <i class="fas fa-gauge"></i>
          <span class="stat-value">{Math.round(animateState.speed * 60)}</span>
          <span class="stat-label">BPM</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <i class="fas fa-signal"></i>
          <span class="stat-value capitalize">{sequenceStats?.difficulty}</span>
          <span class="stat-label">Level</span>
        </div>
      </div>

      <!-- Canvas Container -->
      <div class="canvas-container">
        <SingleModeCanvas
          sequence={animateState.primarySequence}
          bind:isPlaying={animateState.isPlaying}
          bind:animatingBeatNumber
          speed={animateState.speed}
        />

        <!-- Beat Indicator Overlay -->
        {#if animatingBeatNumber !== null}
          <div class="beat-indicator">
            Beat {animatingBeatNumber + 1} / {sequenceStats?.beats}
          </div>
        {/if}
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
              onclick={() => {
                animateState.setIsPlaying(false);
                animatingBeatNumber = null;
              }}
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

          <!-- BPM Controls -->
          <div class="bpm-group">
            <AnimationControls
              speed={animateState.speed}
              onSpeedChange={(newSpeed) => animateState.setSpeed(newSpeed)}
            />
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

  <!-- Sequence Browser Panel -->
  <SequenceBrowserPanel
    mode="primary"
    show={animateState.isSequenceBrowserOpen &&
      animateState.browserMode === "primary"}
    onSelect={(sequence) => {
      animateState.setPrimarySequence(sequence);
      animateState.closeSequenceBrowser();
    }}
    onClose={animateState.closeSequenceBrowser}
  />
</div>

<style>
  .single-mode-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
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
    background: linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
    border: 2px solid rgba(236, 72, 153, 0.3);
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    color: #ec4899;
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
    background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
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
    box-shadow: 0 12px 32px rgba(236, 72, 153, 0.4);
  }

  /* Features Grid */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    width: 100%;
  }

  .feature-card {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    transition: all 0.2s ease;
  }

  .feature-card:hover {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
  }

  .feature-icon {
    width: 44px;
    height: 44px;
    background: rgba(139, 92, 246, 0.15);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a78bfa;
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .feature-text h3 {
    margin: 0 0 0.25rem 0;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .feature-text p {
    margin: 0;
    font-size: 0.85rem;
    opacity: 0.6;
    line-height: 1.4;
  }

  /* Quick Tip */
  .quick-tip {
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

  .quick-tip i {
    color: #fbbf24;
    font-size: 1.1rem;
  }

  /* ===========================
     ANIMATION VIEW
     =========================== */

  .animation-view {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* Header */
  .animation-header {
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
    flex-direction: column;
    gap: 0.25rem;
  }

  .sequence-title-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .sequence-title-row h2 {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 700;
  }

  .author-badge {
    padding: 0.25rem 0.6rem;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    font-size: 0.8rem;
    opacity: 0.7;
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
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

  /* Stats Bar */
  .stats-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    padding: 0.85rem 1.25rem;
    background: rgba(0, 0, 0, 0.15);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .stat-item i {
    font-size: 0.9rem;
    opacity: 0.5;
  }

  .stat-value {
    font-size: 1rem;
    font-weight: 600;
  }

  .stat-label {
    font-size: 0.8rem;
    opacity: 0.5;
  }

  .stat-divider {
    width: 1px;
    height: 20px;
    background: rgba(255, 255, 255, 0.1);
  }

  .capitalize {
    text-transform: capitalize;
  }

  /* Canvas Container */
  .canvas-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background: linear-gradient(
      135deg,
      rgba(15, 20, 30, 0.5) 0%,
      rgba(10, 15, 25, 0.5) 100%
    );
  }

  .beat-indicator {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.5rem 1rem;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
    backdrop-filter: blur(8px);
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
    background: rgba(139, 92, 246, 0.25);
    border-color: rgba(139, 92, 246, 0.5);
    color: #a78bfa;
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

  .bpm-group {
    flex: 1;
    display: flex;
    justify-content: center;
  }

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
    .features-grid {
      grid-template-columns: 1fr;
    }

    .hero-section h1 {
      font-size: 1.6rem;
    }

    .stats-bar {
      gap: 1rem;
      flex-wrap: wrap;
    }

    .stat-divider {
      display: none;
    }

    .controls-row {
      flex-wrap: wrap;
      justify-content: center;
    }

    .bpm-group {
      flex: 1 1 100%;
      order: 3;
      margin-top: 0.5rem;
    }

    .export-btn span {
      display: none;
    }
  }

  @media (max-width: 480px) {
    .empty-state {
      padding: 1rem;
    }

    .feature-card {
      padding: 1rem;
    }

    .animation-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .header-actions {
      width: 100%;
    }

    .change-btn {
      flex: 1;
      justify-content: center;
    }
  }
</style>
