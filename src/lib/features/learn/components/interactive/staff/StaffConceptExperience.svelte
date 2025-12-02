<!--
StaffConceptExperience - Multi-page staff positions & rotations learning flow
Page 1: Staff Positions Introduction (thumb end marker concept)
Page 2: Thumb Orientations (in, out, mixed)
Page 3: Prospin Rotation (prop rotates same direction as handpath)
Page 4: Antispin Rotation (prop rotates opposite direction of handpath)
Page 5: Summary & Quiz
-->
<script lang="ts">
import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
import { resolve } from "$lib/shared/inversify/di";
import { TYPES } from "$lib/shared/inversify/types";
  import StaffPositionVisualizer from "./StaffPositionVisualizer.svelte";
  import StaffIdentificationQuiz from "./StaffIdentificationQuiz.svelte";

  let { onComplete } = $props<{
    onComplete?: () => void;
  }>();

  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  type HandPosition = "N" | "E" | "S" | "W";
  type ThumbOrientation = "in" | "out";

  let currentPage = $state(1);
  const totalPages = 5;

  // Page 1: Basic staff position demo
  let basicLeftPos = $state<HandPosition>("N");
  let basicRightPos = $state<HandPosition>("S");
  let basicLeftThumb = $state<ThumbOrientation>("in");
  let basicRightThumb = $state<ThumbOrientation>("in");

  // Page 2: Thumb orientation examples
  let thumbExampleIndex = $state(0);
  const thumbExamples: Array<{
    leftPos: HandPosition;
    rightPos: HandPosition;
    leftThumb: ThumbOrientation;
    rightThumb: ThumbOrientation;
    label: string;
  }> = [
    { leftPos: "N", rightPos: "S", leftThumb: "in", rightThumb: "in", label: "Both Thumbs In" },
    { leftPos: "N", rightPos: "S", leftThumb: "out", rightThumb: "out", label: "Both Thumbs Out" },
    { leftPos: "E", rightPos: "W", leftThumb: "in", rightThumb: "out", label: "Left In / Right Out" },
    { leftPos: "E", rightPos: "W", leftThumb: "out", rightThumb: "in", label: "Left Out / Right In" },
  ];

  // Page 3 & 4: Rotation demos
  let prospinDemoIndex = $state(0);
  const prospinExamples: Array<{
    leftPos: HandPosition;
    rightPos: HandPosition;
    leftThumb: ThumbOrientation;
    rightThumb: ThumbOrientation;
    description: string;
  }> = [
    {
      leftPos: "N", rightPos: "S",
      leftThumb: "in", rightThumb: "in",
      description: "Thumbs stay IN during the entire motion"
    },
    {
      leftPos: "E", rightPos: "W",
      leftThumb: "in", rightThumb: "in",
      description: "Staff rotates WITH the hand direction"
    },
  ];

  let antispinDemoIndex = $state(0);
  const antispinExamples: Array<{
    leftPos: HandPosition;
    rightPos: HandPosition;
    leftThumb: ThumbOrientation;
    rightThumb: ThumbOrientation;
    description: string;
  }> = [
    {
      leftPos: "N", rightPos: "S",
      leftThumb: "in", rightThumb: "in",
      description: "Start: Thumbs IN"
    },
    {
      leftPos: "E", rightPos: "W",
      leftThumb: "out", rightThumb: "out",
      description: "End: Thumbs OUT (swapped during motion)"
    },
  ];

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

  function cycleThumbExample() {
    thumbExampleIndex = (thumbExampleIndex + 1) % thumbExamples.length;
    hapticService?.trigger("selection");
  }

  function cycleProspinExample() {
    prospinDemoIndex = (prospinDemoIndex + 1) % prospinExamples.length;
    hapticService?.trigger("selection");
  }

  function cycleAntispinExample() {
    antispinDemoIndex = (antispinDemoIndex + 1) % antispinExamples.length;
    hapticService?.trigger("selection");
  }

  // Get current thumb example
  const currentThumbExample = $derived(thumbExamples[thumbExampleIndex]!);
  const currentProspinExample = $derived(prospinExamples[prospinDemoIndex]!);
  const currentAntispinExample = $derived(antispinExamples[antispinDemoIndex]!);
</script>

<div class="staff-experience">
  {#if currentPage === 1}
    <!-- Page 1: Staff Positions Introduction -->
    <div class="page">
      <h2>Staff Positions</h2>

      <div class="concept-intro staff-intro">
        <div class="concept-icon">
          <i class="fa-solid fa-wand-magic-sparkles"></i>
        </div>
        <p class="concept-summary">
          Staff positions show <strong>where your hands are</strong> and <strong>how the prop is oriented</strong>
        </p>
      </div>

      <div class="visualizer-section">
        <StaffPositionVisualizer
          leftPosition={basicLeftPos}
          rightPosition={basicRightPos}
          leftThumbOrientation={basicLeftThumb}
          rightThumbOrientation={basicRightThumb}
          showLabels={true}
          highlightType="alpha"
        />
      </div>

      <div class="explanation">
        <h3>Key Concepts</h3>
        <ul>
          <li><strong>The Thumb End</strong> is marked with a perpendicular line (T)</li>
          <li>One end of the staff is always at the <strong>center point</strong></li>
          <li>The outer end points toward <strong>N, E, S, or W</strong></li>
          <li>Tracking the thumb helps you <strong>verify rotations</strong></li>
        </ul>
      </div>

      <button class="next-button" onclick={handleNext}>
        Next: Thumb Orientations
      </button>
    </div>

  {:else if currentPage === 2}
    <!-- Page 2: Thumb Orientations -->
    <div class="page">
      <h2>Thumb Orientations</h2>

      <div class="concept-intro thumb-intro">
        <div class="concept-icon">
          <i class="fa-solid fa-hand-point-up"></i>
        </div>
        <p class="concept-summary">
          <strong>Thumbs In</strong> or <strong>Thumbs Out</strong> affects the staff's orientation
        </p>
      </div>

      <div class="visualizer-section">
        <StaffPositionVisualizer
          leftPosition={currentThumbExample.leftPos}
          rightPosition={currentThumbExample.rightPos}
          leftThumbOrientation={currentThumbExample.leftThumb}
          rightThumbOrientation={currentThumbExample.rightThumb}
          showLabels={true}
        />
        <div class="example-label">{currentThumbExample.label}</div>
        <button class="cycle-button" onclick={cycleThumbExample}>
          <i class="fa-solid fa-shuffle"></i>
          Show Another Example
        </button>
      </div>

      <div class="explanation">
        <h3>Understanding Thumb Orientation</h3>
        <ul>
          <li><strong>Thumbs In</strong>: Thumb ends point toward the center</li>
          <li><strong>Thumbs Out</strong>: Thumb ends point away from center</li>
          <li>Mixed orientations: <strong>(in/out)</strong> or <strong>(out/in)</strong></li>
          <li>Most sequences start with <strong>thumbs in</strong> for consistency</li>
        </ul>
      </div>

      <div class="thumb-cards">
        <div class="thumb-card in">
          <i class="fa-solid fa-compress-alt"></i>
          <span>Thumbs In</span>
          <small>Pointing toward center</small>
        </div>
        <div class="thumb-card out">
          <i class="fa-solid fa-expand-alt"></i>
          <span>Thumbs Out</span>
          <small>Pointing away from center</small>
        </div>
      </div>

      <button class="next-button" onclick={handleNext}>
        Next: Prospin Rotation
      </button>
    </div>

  {:else if currentPage === 3}
    <!-- Page 3: Prospin Rotation -->
    <div class="page">
      <h2>Prospin Rotation</h2>

      <div class="concept-intro prospin-intro">
        <div class="concept-icon">
          <i class="fa-solid fa-sync-alt"></i>
        </div>
        <p class="concept-summary">
          The prop rotates in the <strong>same direction</strong> as the handpath
        </p>
      </div>

      <div class="visualizer-section">
        <StaffPositionVisualizer
          leftPosition={currentProspinExample.leftPos}
          rightPosition={currentProspinExample.rightPos}
          leftThumbOrientation={currentProspinExample.leftThumb}
          rightThumbOrientation={currentProspinExample.rightThumb}
          showLabels={true}
          showRotationPath={true}
          rotationType="prospin"
        />
        <div class="example-description">{currentProspinExample.description}</div>
        <button class="cycle-button" onclick={cycleProspinExample}>
          <i class="fa-solid fa-play"></i>
          Show Motion Step
        </button>
      </div>

      <div class="explanation prospin-explanation">
        <h3>Prospin = 90° Isolation</h3>
        <ul>
          <li>Think of it as an <strong>isolation</strong>: the prop follows the hand</li>
          <li>Thumb orientation <strong>stays the same</strong> throughout</li>
          <li>If you start with thumbs IN, you end with thumbs IN</li>
          <li>The staff "rotates with" your hand movement</li>
        </ul>
      </div>

      <div class="rotation-formula">
        <div class="formula-item">
          <span class="formula-label">Start</span>
          <span class="formula-value">Thumb In</span>
        </div>
        <i class="fa-solid fa-arrow-right"></i>
        <div class="formula-item prospin-item">
          <span class="formula-label">Prospin</span>
          <i class="fa-solid fa-sync-alt"></i>
        </div>
        <i class="fa-solid fa-arrow-right"></i>
        <div class="formula-item">
          <span class="formula-label">End</span>
          <span class="formula-value">Thumb In</span>
        </div>
      </div>

      <button class="next-button" onclick={handleNext}>
        Next: Antispin Rotation
      </button>
    </div>

  {:else if currentPage === 4}
    <!-- Page 4: Antispin Rotation -->
    <div class="page">
      <h2>Antispin Rotation</h2>

      <div class="concept-intro antispin-intro">
        <div class="concept-icon">
          <i class="fa-solid fa-retweet"></i>
        </div>
        <p class="concept-summary">
          The prop rotates in the <strong>opposite direction</strong> of the handpath
        </p>
      </div>

      <div class="visualizer-section">
        <StaffPositionVisualizer
          leftPosition={currentAntispinExample.leftPos}
          rightPosition={currentAntispinExample.rightPos}
          leftThumbOrientation={currentAntispinExample.leftThumb}
          rightThumbOrientation={currentAntispinExample.rightThumb}
          showLabels={true}
          showRotationPath={true}
          rotationType="antispin"
        />
        <div class="example-description">{currentAntispinExample.description}</div>
        <button class="cycle-button" onclick={cycleAntispinExample}>
          <i class="fa-solid fa-play"></i>
          Show Motion Step
        </button>
      </div>

      <div class="explanation antispin-explanation">
        <h3>Antispin = Thumb Swap</h3>
        <ul>
          <li>The prop rotates <strong>against</strong> your hand's direction</li>
          <li>Thumb orientation <strong>swaps</strong> during the motion</li>
          <li>If you start with thumbs IN, you end with thumbs OUT</li>
          <li>A 90° antispin is the base unit of antispin motion</li>
        </ul>
      </div>

      <div class="rotation-formula">
        <div class="formula-item">
          <span class="formula-label">Start</span>
          <span class="formula-value">Thumb In</span>
        </div>
        <i class="fa-solid fa-arrow-right"></i>
        <div class="formula-item antispin-item">
          <span class="formula-label">Antispin</span>
          <i class="fa-solid fa-retweet"></i>
        </div>
        <i class="fa-solid fa-arrow-right"></i>
        <div class="formula-item">
          <span class="formula-label">End</span>
          <span class="formula-value">Thumb Out</span>
        </div>
      </div>

      <div class="summary-section">
        <h3>Pro vs Anti Summary</h3>
        <div class="comparison-cards">
          <div class="comparison-card prospin">
            <i class="fa-solid fa-sync-alt"></i>
            <span class="card-title">Prospin</span>
            <ul>
              <li>Same direction</li>
              <li>Thumb stays same</li>
              <li>Like an isolation</li>
            </ul>
          </div>
          <div class="comparison-card antispin">
            <i class="fa-solid fa-retweet"></i>
            <span class="card-title">Antispin</span>
            <ul>
              <li>Opposite direction</li>
              <li>Thumb swaps</li>
              <li>In becomes Out</li>
            </ul>
          </div>
        </div>
      </div>

      <button class="next-button" onclick={handleNext}>
        <i class="fa-solid fa-graduation-cap"></i>
        Take the Quiz
      </button>
    </div>

  {:else if currentPage === 5}
    <!-- Page 5: Quiz -->
    <div class="page quiz-page">
      <h2>Test Your Knowledge</h2>
      <p>Identify staff positions and rotation types!</p>

      <StaffIdentificationQuiz onComplete={handleQuizComplete} />
    </div>
  {/if}
</div>

<style>
  .staff-experience {
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
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  h2 {
    font-size: 1.875rem;
    font-weight: 700;
    color: white;
    margin: 0;
    text-align: center;
    background: linear-gradient(135deg, #22D3EE 0%, #06B6D4 100%);
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

  /* Concept intro */
  .concept-intro {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem;
    border-radius: 16px;
  }

  .staff-intro {
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0.02) 100%);
    border: 1px solid rgba(168, 85, 247, 0.2);
  }

  .thumb-intro {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.02) 100%);
    border: 1px solid rgba(59, 130, 246, 0.2);
  }

  .prospin-intro {
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(34, 211, 238, 0.02) 100%);
    border: 1px solid rgba(34, 211, 238, 0.2);
  }

  .antispin-intro {
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(249, 115, 22, 0.02) 100%);
    border: 1px solid rgba(249, 115, 22, 0.2);
  }

  .concept-icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 1.5rem;
  }

  .staff-intro .concept-icon {
    background: rgba(168, 85, 247, 0.2);
    color: #A855F7;
  }

  .thumb-intro .concept-icon {
    background: rgba(59, 130, 246, 0.2);
    color: #3B82F6;
  }

  .prospin-intro .concept-icon {
    background: rgba(34, 211, 238, 0.2);
    color: #22D3EE;
  }

  .antispin-intro .concept-icon {
    background: rgba(249, 115, 22, 0.2);
    color: #F97316;
  }

  .concept-summary {
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

  .example-label,
  .example-description {
    font-size: 0.9375rem;
    color: rgba(255, 255, 255, 0.7);
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
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

  .prospin-explanation {
    border-color: rgba(34, 211, 238, 0.15);
  }

  .antispin-explanation {
    border-color: rgba(249, 115, 22, 0.15);
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

  /* Thumb cards */
  .thumb-cards {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .thumb-card {
    flex: 1;
    min-width: 140px;
    max-width: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.25rem;
    border-radius: 12px;
  }

  .thumb-card.in {
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.25);
    color: #3B82F6;
  }

  .thumb-card.out {
    background: rgba(168, 85, 247, 0.1);
    border: 1px solid rgba(168, 85, 247, 0.25);
    color: #A855F7;
  }

  .thumb-card i {
    font-size: 1.5rem;
  }

  .thumb-card span {
    font-weight: 600;
    font-size: 1rem;
  }

  .thumb-card small {
    font-size: 0.75rem;
    opacity: 0.7;
    color: rgba(255, 255, 255, 0.6);
  }

  /* Rotation formula */
  .rotation-formula {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    flex-wrap: wrap;
  }

  .rotation-formula > i {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.875rem;
  }

  .formula-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }

  .formula-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
  }

  .formula-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
  }

  .prospin-item {
    background: rgba(34, 211, 238, 0.15);
    color: #22D3EE;
  }

  .antispin-item {
    background: rgba(249, 115, 22, 0.15);
    color: #F97316;
  }

  .formula-item i {
    font-size: 1.25rem;
  }

  /* Summary section */
  .summary-section {
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
  }

  .comparison-cards {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    flex-wrap: wrap;
  }

  .comparison-card {
    flex: 1;
    min-width: 150px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    border-radius: 12px;
  }

  .comparison-card.prospin {
    background: rgba(34, 211, 238, 0.1);
    border: 1px solid rgba(34, 211, 238, 0.25);
    color: #22D3EE;
  }

  .comparison-card.antispin {
    background: rgba(249, 115, 22, 0.1);
    border: 1px solid rgba(249, 115, 22, 0.25);
    color: #F97316;
  }

  .comparison-card i {
    font-size: 1.5rem;
  }

  .card-title {
    font-weight: 700;
    font-size: 1rem;
  }

  .comparison-card ul {
    margin: 0;
    padding-left: 1rem;
    text-align: left;
    width: 100%;
  }

  .comparison-card li {
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 0.25rem;
  }

  /* Next button */
  .next-button {
    align-self: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
    padding: 1rem 3rem;
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.3) 0%, rgba(6, 182, 212, 0.3) 100%);
    backdrop-filter: blur(20px);
    border: 2px solid rgba(34, 211, 238, 0.5);
    border-radius: 12px;
    color: white;
    font-size: 1.125rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    min-height: 56px;
    margin-top: 1rem;
  }

  .next-button:hover {
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.4) 0%, rgba(6, 182, 212, 0.4) 100%);
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
    .staff-experience {
      padding: 1rem;
    }

    h2 {
      font-size: 1.5rem;
    }

    .thumb-cards,
    .comparison-cards {
      flex-direction: column;
    }

    .thumb-card,
    .comparison-card {
      min-width: auto;
      max-width: none;
    }

    .rotation-formula {
      gap: 0.5rem;
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
