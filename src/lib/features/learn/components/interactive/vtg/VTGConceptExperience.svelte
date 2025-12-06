<!--
VTGConceptExperience - Multi-page VTG (Velocity-Timing-Direction) learning experience
Teaches the 6 VTG modes: SS, TS, SO, TO, QS, QO
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import VTGVisualizer from "./VTGVisualizer.svelte";
  import VTGQuiz from "./VTGQuiz.svelte";

  let { onComplete } = $props<{
    onComplete?: () => void;
  }>();

  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  let currentPage = $state(1);
  const totalPages = 8; // Intro + 6 modes + Quiz

  type VTGMode = "SS" | "TS" | "SO" | "TO" | "QS" | "QO";

  const VTG_MODES: VTGMode[] = ["SS", "TS", "SO", "TO", "QS", "QO"];

  const MODE_INFO: Record<
    VTGMode,
    {
      name: string;
      color: string;
      icon: string;
      directionLabel: string;
      timingLabel: string;
      description: string;
      keyPoint: string;
    }
  > = {
    SS: {
      name: "Split-Same",
      color: "#22D3EE",
      icon: "fa-arrows-left-right",
      directionLabel: "Split (opposite)",
      timingLabel: "Same (together)",
      description: "Hands move in opposite directions at the same time",
      keyPoint: "Like opening a book - hands move apart simultaneously",
    },
    TS: {
      name: "Together-Same",
      color: "#4ADE80",
      icon: "fa-arrows-up-down",
      directionLabel: "Together (parallel)",
      timingLabel: "Same (together)",
      description: "Hands move in the same direction at the same time",
      keyPoint: "Like pushing forward - both hands move as one",
    },
    SO: {
      name: "Same-Opposite",
      color: "#F472B6",
      icon: "fa-clock",
      directionLabel: "Same direction",
      timingLabel: "Opposite (staggered)",
      description: "Same direction movement with staggered timing",
      keyPoint: "One hand leads, the other follows half-beat later",
    },
    TO: {
      name: "Together-Opposite",
      color: "#FB923C",
      icon: "fa-rotate",
      directionLabel: "Together (parallel)",
      timingLabel: "Opposite (alternating)",
      description: "Parallel paths but alternating start times",
      keyPoint: "Like walking - arms swing in alternating rhythm",
    },
    QS: {
      name: "Quarter-Same",
      color: "#A78BFA",
      icon: "fa-circle-quarter-stroke",
      directionLabel: "Same direction",
      timingLabel: "Quarter (90� offset)",
      description: "Same direction with quarter-beat timing offset",
      keyPoint: "One hand is always 90� ahead in the cycle",
    },
    QO: {
      name: "Quarter-Opposite",
      color: "#F59E0B",
      icon: "fa-wave-square",
      directionLabel: "Opposite directions",
      timingLabel: "Quarter (90� offset)",
      description: "Opposite directions with quarter-beat offset",
      keyPoint: "Complex cross-pattern with 90� phase difference",
    },
  };

  function handleNext() {
    hapticService?.trigger("selection");
    if (currentPage < totalPages) {
      currentPage++;
    } else {
      onComplete?.();
    }
  }

  function handleQuizComplete() {
    hapticService?.trigger("success");
    onComplete?.();
  }

  function getCurrentMode(): VTGMode | null {
    if (currentPage >= 2 && currentPage <= 7) {
      return VTG_MODES[currentPage - 2]!;
    }
    return null;
  }
</script>

<div class="vtg-experience">
  {#if currentPage === 1}
    <!-- Page 1: Introduction -->
    <div class="page">
      <h2>VTG Fundamentals</h2>

      <div class="intro-section">
        <p class="intro-text">
          <strong>VTG</strong> describes how your two hands coordinate together during
          movement.
        </p>

        <div class="vtg-components">
          <div class="component-card direction">
            <div class="component-icon">
              <i class="fa-solid fa-arrows-alt-h"></i>
            </div>
            <h4>Direction</h4>
            <p><strong>Split</strong> or <strong>Together</strong></p>
            <small>Do hands move apart or in parallel?</small>
          </div>

          <div class="component-card timing">
            <div class="component-icon">
              <i class="fa-solid fa-clock"></i>
            </div>
            <h4>Timing</h4>
            <p>
              <strong>Same</strong>, <strong>Opposite</strong>, or
              <strong>Quarter</strong>
            </p>
            <small>When do hands start relative to each other?</small>
          </div>
        </div>

        <div class="mode-preview">
          <h3>The 6 VTG Modes</h3>
          <div class="mode-chips">
            {#each VTG_MODES as vtgMode}
              {@const info = MODE_INFO[vtgMode]}
              <div class="mode-chip" style="--chip-color: {info.color}">
                <span class="chip-code">{vtgMode}</span>
                <span class="chip-name">{info.name}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <button class="next-button" onclick={handleNext}>
        Learn SS: Split-Same
        <i class="fa-solid fa-arrow-right"></i>
      </button>
    </div>
  {:else if currentPage >= 2 && currentPage <= 7}
    <!-- Pages 2-7: Individual VTG Modes -->
    {@const vtgMode = getCurrentMode()}
    {#if vtgMode}
      {@const info = MODE_INFO[vtgMode]}
      <div class="page">
        <h2 style="--type-color: {info.color}">{vtgMode}: {info.name}</h2>

        <div class="mode-intro" style="--type-color: {info.color}">
          <div class="mode-icon">
            <i class="fa-solid {info.icon}"></i>
          </div>
          <p class="mode-description">{info.description}</p>
        </div>

        <div class="visualizer-section">
          <VTGVisualizer mode={vtgMode} showLabels={true} />
        </div>

        <div class="mode-details" style="--type-color: {info.color}">
          <div class="detail-row">
            <span class="detail-label">Direction:</span>
            <span class="detail-value">{info.directionLabel}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Timing:</span>
            <span class="detail-value">{info.timingLabel}</span>
          </div>
        </div>

        <div class="key-point" style="--type-color: {info.color}">
          <i class="fa-solid fa-lightbulb"></i>
          <span>{info.keyPoint}</span>
        </div>

        {#if currentPage === 7}
          <!-- Summary before quiz -->
          <div class="mode-summary">
            <h3>VTG Modes Summary</h3>
            <div class="summary-grid">
              {#each VTG_MODES as m}
                {@const i = MODE_INFO[m]}
                <div class="summary-item" style="--type-color: {i.color}">
                  <span class="summary-code">{m}</span>
                  <span class="summary-name">{i.name}</span>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <button class="next-button" onclick={handleNext}>
          {#if currentPage === 7}
            <i class="fa-solid fa-graduation-cap"></i>
            Take the Quiz
          {:else}
            {@const nextMode = VTG_MODES[currentPage - 1]}
            {#if nextMode}
              Next: {nextMode}
            {:else}
              Next
            {/if}
            <i class="fa-solid fa-arrow-right"></i>
          {/if}
        </button>
      </div>
    {/if}
  {:else if currentPage === 8}
    <!-- Page 8: Quiz -->
    <div class="page quiz-page">
      <h2>Test Your Knowledge</h2>
      <p>Identify the VTG modes by watching the animations!</p>

      <VTGQuiz onComplete={handleQuizComplete} />
    </div>
  {/if}
</div>

<style>
  .vtg-experience {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 2rem;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 700px;
    margin: 0 auto;
    width: 100%;
    animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  h2 {
    font-size: 1.875rem;
    font-weight: 700;
    color: white;
    margin: 0;
    text-align: center;
    background: linear-gradient(
      135deg,
      var(--type-color, #22d3ee) 0%,
      color-mix(in srgb, var(--type-color, #22d3ee) 70%, #06b6d4) 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: white;
    margin: 0;
  }

  p {
    font-size: 1.125rem;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.85);
    margin: 0;
    text-align: center;
  }

  /* Intro section */
  .intro-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .intro-text {
    text-align: center;
  }

  /* VTG components cards */
  .vtg-components {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .component-card {
    flex: 1;
    min-width: 200px;
    max-width: 280px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.25rem;
    border-radius: 12px;
    text-align: center;
  }

  .component-card.direction {
    background: rgba(34, 211, 238, 0.1);
    border: 1px solid rgba(34, 211, 238, 0.25);
  }

  .component-card.timing {
    background: rgba(167, 139, 250, 0.1);
    border: 1px solid rgba(167, 139, 250, 0.25);
  }

  .component-icon {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 1.25rem;
  }

  .component-card.direction .component-icon {
    background: rgba(34, 211, 238, 0.2);
    color: #22d3ee;
  }

  .component-card.timing .component-icon {
    background: rgba(167, 139, 250, 0.2);
    color: #a78bfa;
  }

  .component-card h4 {
    font-size: 1rem;
    font-weight: 700;
    margin: 0;
  }

  .component-card.direction h4 {
    color: #22d3ee;
  }
  .component-card.timing h4 {
    color: #a78bfa;
  }

  .component-card p {
    font-size: 0.9375rem;
    color: rgba(255, 255, 255, 0.85);
    margin: 0;
  }

  .component-card small {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
  }

  /* Mode preview */
  .mode-preview {
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
  }

  .mode-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.75rem;
    justify-content: center;
  }

  .mode-chip {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    background: color-mix(in srgb, var(--chip-color) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--chip-color) 30%, transparent);
    border-radius: 16px;
  }

  .chip-code {
    font-family: monospace;
    font-size: 0.75rem;
    font-weight: 800;
    color: var(--chip-color);
  }

  .chip-name {
    font-size: 0.6875rem;
    color: var(--chip-color);
    opacity: 0.8;
  }

  /* Mode intro */
  .mode-intro {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem;
    border-radius: 16px;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--type-color) 10%, transparent) 0%,
      transparent 100%
    );
    border: 1px solid color-mix(in srgb, var(--type-color) 25%, transparent);
  }

  .mode-icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: color-mix(in srgb, var(--type-color) 20%, transparent);
    color: var(--type-color);
    font-size: 1.5rem;
  }

  .mode-description {
    font-size: 1.25rem !important;
    font-weight: 500;
    color: var(--type-color);
  }

  /* Visualizer section */
  .visualizer-section {
    display: flex;
    justify-content: center;
  }

  /* Mode details */
  .mode-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.9375rem;
  }

  .detail-label {
    color: rgba(255, 255, 255, 0.5);
  }

  .detail-value {
    color: var(--type-color);
    font-weight: 600;
  }

  /* Key point */
  .key-point {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: color-mix(in srgb, var(--type-color) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--type-color) 20%, transparent);
    border-radius: 10px;
  }

  .key-point i {
    color: var(--type-color);
    font-size: 1.125rem;
  }

  .key-point span {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.85);
  }

  /* Mode summary */
  .mode-summary {
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.625rem;
    margin-top: 1rem;
  }

  .summary-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem;
    background: color-mix(in srgb, var(--type-color) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--type-color) 25%, transparent);
    border-radius: 8px;
  }

  .summary-code {
    font-family: monospace;
    font-size: 0.8125rem;
    font-weight: 800;
    color: var(--type-color);
  }

  .summary-name {
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--type-color);
    opacity: 0.8;
  }

  /* Next button */
  .next-button {
    align-self: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
    padding: 1rem 2.5rem;
    background: linear-gradient(
      135deg,
      rgba(34, 211, 238, 0.3) 0%,
      rgba(6, 182, 212, 0.3) 100%
    );
    backdrop-filter: blur(20px);
    border: 2px solid rgba(34, 211, 238, 0.5);
    border-radius: 12px;
    color: white;
    font-size: 1.0625rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    min-height: 54px;
    margin-top: 0.5rem;
  }

  .next-button:hover {
    background: linear-gradient(
      135deg,
      rgba(34, 211, 238, 0.4) 0%,
      rgba(6, 182, 212, 0.4) 100%
    );
    border-color: rgba(34, 211, 238, 0.8);
    transform: translateY(-2px);
  }

  .next-button i {
    font-size: 0.9375rem;
  }

  /* Quiz page */
  .quiz-page {
    max-width: 700px;
  }

  /* Responsive */
  @media (max-width: 600px) {
    .vtg-experience {
      padding: 1rem;
    }

    h2 {
      font-size: 1.5rem;
    }

    .vtg-components {
      flex-direction: column;
      align-items: center;
    }

    .component-card {
      max-width: 100%;
      width: 100%;
    }

    .summary-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .next-button {
      width: 100%;
      max-width: 300px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .page {
      animation: none;
    }
  }
</style>
