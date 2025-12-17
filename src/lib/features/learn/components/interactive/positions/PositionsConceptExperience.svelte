<!--
PositionsConceptExperience - 4-page hand positions learning flow
Page 1: Alpha position (hands at opposite points)
Page 2: Beta position (hands at same point)
Page 3: Gamma position (hands at right angles)
Page 4: Interactive quiz
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import PositionVisualizer from "./PositionVisualizer.svelte";
  import PositionIdentificationQuiz from "./PositionIdentificationQuiz.svelte";

  let { onComplete } = $props<{
    onComplete?: () => void;
  }>();

  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  let currentPage = $state(1);
  const totalPages = 4;

  // Demo positions for each page
  let alphaLeftHand = $state<"N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW">(
    "N"
  );
  let alphaRightHand = $state<
    "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW"
  >("S");

  let betaLeftHand = $state<"N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW">(
    "E"
  );
  let betaRightHand = $state<"N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW">(
    "E"
  );

  let gammaLeftHand = $state<"N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW">(
    "N"
  );
  let gammaRightHand = $state<
    "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW"
  >("E");

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

  // Cycle through example positions
  let alphaExampleIndex = $state(0);
  const alphaExamples = [
    { left: "N", right: "S" },
    { left: "E", right: "W" },
    { left: "NE", right: "SW" },
    { left: "NW", right: "SE" },
  ] as const;

  let betaExampleIndex = $state(0);
  const betaExamples = [
    { left: "N", right: "N" },
    { left: "E", right: "E" },
    { left: "SW", right: "SW" },
    { left: "NE", right: "NE" },
  ] as const;

  let gammaExampleIndex = $state(0);
  const gammaExamples = [
    { left: "N", right: "E" },
    { left: "N", right: "W" },
    { left: "S", right: "E" },
    { left: "NE", right: "SE" },
  ] as const;

  function cycleAlpha() {
    alphaExampleIndex = (alphaExampleIndex + 1) % alphaExamples.length;
    const example = alphaExamples[alphaExampleIndex]!;
    alphaLeftHand = example.left;
    alphaRightHand = example.right;
    hapticService?.trigger("selection");
  }

  function cycleBeta() {
    betaExampleIndex = (betaExampleIndex + 1) % betaExamples.length;
    const example = betaExamples[betaExampleIndex]!;
    betaLeftHand = example.left;
    betaRightHand = example.right;
    hapticService?.trigger("selection");
  }

  function cycleGamma() {
    gammaExampleIndex = (gammaExampleIndex + 1) % gammaExamples.length;
    const example = gammaExamples[gammaExampleIndex]!;
    gammaLeftHand = example.left;
    gammaRightHand = example.right;
    hapticService?.trigger("selection");
  }
</script>

<div class="positions-experience">
  {#if currentPage === 1}
    <!-- Page 1: Alpha Position -->
    <div class="page">
      <h2>Alpha Position</h2>

      <div class="position-intro alpha">
        <div class="position-icon">
          <i class="fa-solid fa-arrows-left-right"></i>
        </div>
        <p class="position-summary">
          Hands at <strong>opposite</strong> points on the grid
        </p>
      </div>

      <div class="visualizer-section">
        <PositionVisualizer
          bind:leftHand={alphaLeftHand}
          bind:rightHand={alphaRightHand}
          highlightType="alpha"
          showLabels={true}
        />
        <button class="cycle-button" onclick={cycleAlpha}>
          <i class="fa-solid fa-shuffle"></i>
          Show Another Example
        </button>
      </div>

      <div class="explanation">
        <h3>Understanding Alpha</h3>
        <ul>
          <li>
            Hands form a <strong>straight line</strong> through the center
          </li>
          <li>Think: <strong>180° apart</strong> (opposite sides)</li>
          <li>Examples: N↔S, E↔W, NE↔SW, NW↔SE</li>
        </ul>
      </div>

      <button class="next-button" onclick={handleNext}>Next</button>
    </div>
  {:else if currentPage === 2}
    <!-- Page 2: Beta Position -->
    <div class="page">
      <h2>Beta Position</h2>

      <div class="position-intro beta">
        <div class="position-icon">
          <i class="fa-solid fa-circle-dot"></i>
        </div>
        <p class="position-summary">
          Hands at the <strong>same</strong> point on the grid
        </p>
      </div>

      <div class="visualizer-section">
        <PositionVisualizer
          bind:leftHand={betaLeftHand}
          bind:rightHand={betaRightHand}
          highlightType="beta"
          showLabels={true}
        />
        <button class="cycle-button" onclick={cycleBeta}>
          <i class="fa-solid fa-shuffle"></i>
          Show Another Example
        </button>
      </div>

      <div class="explanation">
        <h3>Understanding Beta</h3>
        <ul>
          <li>Both hands occupy the <strong>identical position</strong></li>
          <li>Think: <strong>0° apart</strong> (stacked/together)</li>
          <li>Examples: Both at N, both at E, both at SW</li>
        </ul>
      </div>

      <button class="next-button" onclick={handleNext}>Next</button>
    </div>
  {:else if currentPage === 3}
    <!-- Page 3: Gamma Position -->
    <div class="page">
      <h2>Gamma Position</h2>

      <div class="position-intro gamma">
        <div class="position-icon">
          <i class="fa-solid fa-rotate-right"></i>
        </div>
        <p class="position-summary">
          Hands at <strong>right angles</strong> (90°) to each other
        </p>
      </div>

      <div class="visualizer-section">
        <PositionVisualizer
          bind:leftHand={gammaLeftHand}
          bind:rightHand={gammaRightHand}
          highlightType="gamma"
          showLabels={true}
        />
        <button class="cycle-button" onclick={cycleGamma}>
          <i class="fa-solid fa-shuffle"></i>
          Show Another Example
        </button>
      </div>

      <div class="explanation">
        <h3>Understanding Gamma</h3>
        <ul>
          <li>Hands are <strong>perpendicular</strong> to each other</li>
          <li>Think: <strong>90° apart</strong> (quarter turn)</li>
          <li>Examples: N+E, N+W, S+E, S+W, NE+NW</li>
        </ul>
      </div>

      <div class="summary-section">
        <h3>Position Summary</h3>
        <div class="position-cards">
          <div class="position-card alpha">
            <i class="fa-solid fa-arrows-left-right"></i>
            <span>Alpha</span>
            <small>Opposite (180°)</small>
          </div>
          <div class="position-card beta">
            <i class="fa-solid fa-circle-dot"></i>
            <span>Beta</span>
            <small>Same (0°)</small>
          </div>
          <div class="position-card gamma">
            <i class="fa-solid fa-rotate-right"></i>
            <span>Gamma</span>
            <small>Right Angle (90°)</small>
          </div>
        </div>
      </div>

      <button class="next-button" onclick={handleNext}>
        <i class="fa-solid fa-graduation-cap"></i>
        Take the Quiz
      </button>
    </div>
  {:else if currentPage === 4}
    <!-- Page 4: Quiz -->
    <div class="page quiz-page">
      <h2>Test Your Knowledge</h2>
      <p>Identify the hand position types!</p>

      <PositionIdentificationQuiz onComplete={handleQuizComplete} />
    </div>
  {/if}
</div>

<style>
  .positions-experience {
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
    background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
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

  /* Position intro */
  .position-intro {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem;
    border-radius: 16px;
  }

  .position-intro.alpha {
    background: linear-gradient(
      135deg,
      rgba(255, 107, 107, 0.1) 0%,
      rgba(255, 107, 107, 0.02) 100%
    );
    border: 1px solid rgba(255, 107, 107, 0.2);
  }

  .position-intro.beta {
    background: linear-gradient(
      135deg,
      rgba(78, 205, 196, 0.1) 0%,
      rgba(78, 205, 196, 0.02) 100%
    );
    border: 1px solid rgba(78, 205, 196, 0.2);
  }

  .position-intro.gamma {
    background: linear-gradient(
      135deg,
      rgba(255, 230, 109, 0.1) 0%,
      rgba(255, 230, 109, 0.02) 100%
    );
    border: 1px solid rgba(255, 230, 109, 0.2);
  }

  .position-icon {
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }

  .position-intro.alpha .position-icon {
    background: rgba(255, 107, 107, 0.2);
    color: #ff6b6b;
  }

  .position-intro.beta .position-icon {
    background: rgba(78, 205, 196, 0.2);
    color: #4ecdc4;
  }

  .position-intro.gamma .position-icon {
    background: rgba(255, 230, 109, 0.2);
    color: #ffe66d;
  }

  .position-icon i {
    font-size: 1.5rem;
  }

  .position-summary {
    font-size: 1.25rem !important;
    font-weight: 500;
  }

  /* Visualizer section */
  .visualizer-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .cycle-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cycle-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  /* Explanation */
  .explanation {
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
  }

  .explanation ul {
    margin: 0.75rem 0 0 0;
    padding-left: 1.25rem;
  }

  .explanation li {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.75);
    line-height: 1.6;
    margin-bottom: 0.5rem;
  }

  .explanation li:last-child {
    margin-bottom: 0;
  }

  /* Summary section */
  .summary-section {
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
  }

  .position-cards {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
    flex-wrap: wrap;
  }

  .position-card {
    flex: 1;
    min-width: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
    padding: 1rem;
    border-radius: 10px;
  }

  .position-card.alpha {
    background: rgba(255, 107, 107, 0.1);
    border: 1px solid rgba(255, 107, 107, 0.25);
    color: #ff6b6b;
  }

  .position-card.beta {
    background: rgba(78, 205, 196, 0.1);
    border: 1px solid rgba(78, 205, 196, 0.25);
    color: #4ecdc4;
  }

  .position-card.gamma {
    background: rgba(255, 230, 109, 0.1);
    border: 1px solid rgba(255, 230, 109, 0.25);
    color: #ffe66d;
  }

  .position-card i {
    font-size: 1.25rem;
  }

  .position-card span {
    font-weight: 600;
    font-size: 0.9375rem;
  }

  .position-card small {
    font-size: 0.75rem;
    opacity: 0.7;
  }

  /* Next button */
  .next-button {
    align-self: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
    padding: 1rem 3rem;
    background: linear-gradient(
      135deg,
      rgba(34, 211, 238, 0.3) 0%,
      rgba(6, 182, 212, 0.3) 100%
    );
    backdrop-filter: blur(20px);
    border: 2px solid rgba(34, 211, 238, 0.5);
    border-radius: 12px;
    color: white;
    font-size: 1.125rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    min-height: var(--min-touch-target);
    margin-top: 1rem;
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
    font-size: 1rem;
  }

  /* Quiz page */
  .quiz-page {
    max-width: 700px;
  }

  /* Responsive */
  @media (max-width: 600px) {
    .positions-experience {
      padding: 1rem;
    }

    h2 {
      font-size: 1.5rem;
    }

    .position-cards {
      flex-direction: column;
    }

    .position-card {
      min-width: auto;
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
