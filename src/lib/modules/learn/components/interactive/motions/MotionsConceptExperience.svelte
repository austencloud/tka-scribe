<!--
MotionsConceptExperience - 7-page hand motions learning flow
Pages 1-6: Each motion type with examples and animations
Page 7: Interactive quiz
-->
<script lang="ts">
import type { IHapticFeedbackService } from "$shared/application/services/contracts/IHapticFeedbackService";
import { resolve } from "$shared/inversify";
import { TYPES } from "$shared/inversify/types";
  import MotionVisualizer from "./MotionVisualizer.svelte";
  import MotionIdentificationQuiz from "./MotionIdentificationQuiz.svelte";

  let { onComplete } = $props<{
    onComplete?: () => void;
  }>();

  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  let currentPage = $state(1);
  const totalPages = 8; // 1 intro + 6 types + 1 quiz

  type HandPosition = "N" | "E" | "S" | "W";
  type MotionType = "shift" | "dash" | "static";

  interface MotionExample {
    leftStart: HandPosition;
    leftEnd: HandPosition;
    rightStart: HandPosition;
    rightEnd: HandPosition;
    leftMotion: MotionType;
    rightMotion: MotionType;
  }

  // Examples for each motion type
  const TYPE_EXAMPLES: Record<number, MotionExample[]> = {
    1: [ // Dual-Shift
      { leftStart: "N", leftEnd: "E", rightStart: "S", rightEnd: "W", leftMotion: "shift", rightMotion: "shift" },
      { leftStart: "E", leftEnd: "S", rightStart: "W", rightEnd: "N", leftMotion: "shift", rightMotion: "shift" },
      { leftStart: "W", leftEnd: "N", rightStart: "E", rightEnd: "S", leftMotion: "shift", rightMotion: "shift" },
    ],
    2: [ // Shift (one shifts, one static)
      { leftStart: "N", leftEnd: "E", rightStart: "S", rightEnd: "S", leftMotion: "shift", rightMotion: "static" },
      { leftStart: "W", leftEnd: "W", rightStart: "E", rightEnd: "S", leftMotion: "static", rightMotion: "shift" },
      { leftStart: "S", leftEnd: "W", rightStart: "N", rightEnd: "N", leftMotion: "shift", rightMotion: "static" },
    ],
    3: [ // Cross-Shift (one shifts, one dashes)
      { leftStart: "N", leftEnd: "E", rightStart: "S", rightEnd: "N", leftMotion: "shift", rightMotion: "dash" },
      { leftStart: "E", leftEnd: "W", rightStart: "S", rightEnd: "W", leftMotion: "dash", rightMotion: "shift" },
      { leftStart: "W", leftEnd: "N", rightStart: "E", rightEnd: "W", leftMotion: "shift", rightMotion: "dash" },
    ],
    4: [ // Dash (one dashes, one static)
      { leftStart: "N", leftEnd: "S", rightStart: "E", rightEnd: "E", leftMotion: "dash", rightMotion: "static" },
      { leftStart: "W", leftEnd: "W", rightStart: "S", rightEnd: "N", leftMotion: "static", rightMotion: "dash" },
      { leftStart: "E", leftEnd: "W", rightStart: "N", rightEnd: "N", leftMotion: "dash", rightMotion: "static" },
    ],
    5: [ // Dual-Dash
      { leftStart: "N", leftEnd: "S", rightStart: "S", rightEnd: "N", leftMotion: "dash", rightMotion: "dash" },
      { leftStart: "E", leftEnd: "W", rightStart: "W", rightEnd: "E", leftMotion: "dash", rightMotion: "dash" },
      { leftStart: "N", leftEnd: "S", rightStart: "E", rightEnd: "W", leftMotion: "dash", rightMotion: "dash" },
    ],
    6: [ // Static
      { leftStart: "N", leftEnd: "N", rightStart: "S", rightEnd: "S", leftMotion: "static", rightMotion: "static" },
      { leftStart: "E", leftEnd: "E", rightStart: "W", rightEnd: "W", leftMotion: "static", rightMotion: "static" },
      { leftStart: "N", leftEnd: "N", rightStart: "E", rightEnd: "E", leftMotion: "static", rightMotion: "static" },
    ],
  };

  // Current example indices for each type
  let exampleIndices = $state<Record<number, number>>({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
  });

  function getCurrentExample(type: number): MotionExample {
    return TYPE_EXAMPLES[type]![exampleIndices[type]!]!;
  }

  function cycleExample(type: number) {
    const examples = TYPE_EXAMPLES[type]!;
    exampleIndices[type] = (exampleIndices[type]! + 1) % examples.length;
    hapticService?.trigger("selection");
  }

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

  // Motion type info
  const MOTION_INFO = {
    1: {
      name: "Dual-Shift",
      color: "#22D3EE",
      icon: "fa-arrows-rotate",
      description: "Both hands shift to adjacent points",
      key: "Both hands move 90� around the grid",
    },
    2: {
      name: "Shift",
      color: "#4ADE80",
      icon: "fa-arrow-right",
      description: "One hand shifts, the other stays still",
      key: "Single hand moves to adjacent point",
    },
    3: {
      name: "Cross-Shift",
      color: "#F472B6",
      icon: "fa-shuffle",
      description: "One hand shifts while the other dashes",
      key: "Combination: 90� shift + 180� dash",
    },
    4: {
      name: "Dash",
      color: "#FB923C",
      icon: "fa-bolt",
      description: "One hand dashes, the other stays still",
      key: "Single hand jumps to opposite point",
    },
    5: {
      name: "Dual-Dash",
      color: "#A78BFA",
      icon: "fa-arrows-left-right-to-line",
      description: "Both hands dash to opposite points",
      key: "Both hands jump 180� across the grid",
    },
    6: {
      name: "Static",
      color: "#94A3B8",
      icon: "fa-pause",
      description: "Both hands remain still",
      key: "No movement - a pause in the sequence",
    },
  };
</script>

<div class="motions-experience">
  {#if currentPage === 1}
    <!-- Page 1: Introduction -->
    <div class="page">
      <h2>Hand Motions</h2>

      <div class="intro-section">
        <p class="intro-text">
          In TKA, hands move between grid points using three fundamental motions:
        </p>

        <div class="fundamental-motions">
          <div class="fundamental-card shift">
            <div class="motion-icon"><i class="fa-solid fa-arrow-right"></i></div>
            <h4>Shift</h4>
            <p>Move to an <strong>adjacent</strong> point (90�)</p>
          </div>
          <div class="fundamental-card dash">
            <div class="motion-icon"><i class="fa-solid fa-bolt"></i></div>
            <h4>Dash</h4>
            <p>Jump to the <strong>opposite</strong> point (180�)</p>
          </div>
          <div class="fundamental-card static">
            <div class="motion-icon"><i class="fa-solid fa-pause"></i></div>
            <h4>Static</h4>
            <p><strong>Stay</strong> at the current point</p>
          </div>
        </div>

        <p class="intro-text">
          These combine into <strong>6 Motion Types</strong> that describe what both hands do together.
        </p>
      </div>

      <button class="next-button" onclick={handleNext}>
        Learn Type 1: Dual-Shift
        <i class="fa-solid fa-arrow-right"></i>
      </button>
    </div>

  {:else if currentPage >= 2 && currentPage <= 7}
    <!-- Pages 2-7: Motion Types 1-6 -->
    {@const typeNum = currentPage - 1}
    {@const info = MOTION_INFO[typeNum as keyof typeof MOTION_INFO]}
    {@const example = getCurrentExample(typeNum)}

    <div class="page">
      <h2 style="--type-color: {info.color}">
        Type {typeNum}: {info.name}
      </h2>

      <div class="type-intro" style="--type-color: {info.color}">
        <div class="type-icon">
          <i class="fa-solid {info.icon}"></i>
        </div>
        <p class="type-description">{info.description}</p>
      </div>

      <div class="visualizer-section">
        <MotionVisualizer
          leftStart={example.leftStart}
          leftEnd={example.leftEnd}
          rightStart={example.rightStart}
          rightEnd={example.rightEnd}
          leftMotion={example.leftMotion}
          rightMotion={example.rightMotion}
          motionType={typeNum as 1 | 2 | 3 | 4 | 5 | 6}
          showLabels={true}
          showMotionType={false}
        />
        <button class="cycle-button" onclick={() => cycleExample(typeNum)}>
          <i class="fa-solid fa-shuffle"></i>
          Show Another Example
        </button>
      </div>

      <div class="key-point" style="--type-color: {info.color}">
        <i class="fa-solid fa-lightbulb"></i>
        <span>{info.key}</span>
      </div>

      {#if currentPage === 7}
        <!-- Summary before quiz -->
        <div class="type-summary">
          <h3>Motion Types Summary</h3>
          <div class="summary-grid">
            {#each [1, 2, 3, 4, 5, 6] as t}
              {@const i = MOTION_INFO[t as keyof typeof MOTION_INFO]}
              <div class="summary-item" style="--type-color: {i.color}">
                <span class="summary-num">{t}</span>
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
          Next: Type {typeNum + 1}
          <i class="fa-solid fa-arrow-right"></i>
        {/if}
      </button>
    </div>

  {:else if currentPage === 8}
    <!-- Page 8: Quiz -->
    <div class="page quiz-page">
      <h2>Test Your Knowledge</h2>
      <p>Identify the motion types by watching the animation!</p>

      <MotionIdentificationQuiz onComplete={handleQuizComplete} />
    </div>
  {/if}
</div>

<style>
  .motions-experience {
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
    background: linear-gradient(135deg, var(--type-color, #22D3EE) 0%, color-mix(in srgb, var(--type-color, #22D3EE) 70%, #06B6D4) 100%);
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

  .fundamental-motions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .fundamental-card {
    flex: 1;
    min-width: 140px;
    max-width: 180px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.25rem 1rem;
    border-radius: 12px;
    text-align: center;
  }

  .fundamental-card.shift {
    background: rgba(74, 222, 128, 0.1);
    border: 1px solid rgba(74, 222, 128, 0.25);
  }

  .fundamental-card.dash {
    background: rgba(251, 146, 60, 0.1);
    border: 1px solid rgba(251, 146, 60, 0.25);
  }

  .fundamental-card.static {
    background: rgba(148, 163, 184, 0.1);
    border: 1px solid rgba(148, 163, 184, 0.25);
  }

  .fundamental-card .motion-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 1.25rem;
  }

  .fundamental-card.shift .motion-icon {
    background: rgba(74, 222, 128, 0.2);
    color: #4ADE80;
  }

  .fundamental-card.dash .motion-icon {
    background: rgba(251, 146, 60, 0.2);
    color: #FB923C;
  }

  .fundamental-card.static .motion-icon {
    background: rgba(148, 163, 184, 0.2);
    color: #94A3B8;
  }

  .fundamental-card h4 {
    font-size: 1rem;
    font-weight: 700;
    margin: 0;
  }

  .fundamental-card.shift h4 { color: #4ADE80; }
  .fundamental-card.dash h4 { color: #FB923C; }
  .fundamental-card.static h4 { color: #94A3B8; }

  .fundamental-card p {
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.65);
    margin: 0;
  }

  /* Type intro */
  .type-intro {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem;
    border-radius: 16px;
    background: linear-gradient(135deg, color-mix(in srgb, var(--type-color) 10%, transparent) 0%, transparent 100%);
    border: 1px solid color-mix(in srgb, var(--type-color) 25%, transparent);
  }

  .type-icon {
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

  .type-description {
    font-size: 1.25rem !important;
    font-weight: 500;
    color: var(--type-color);
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

  /* Type summary */
  .type-summary {
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

  .summary-num {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--type-color);
    color: black;
    font-size: 0.75rem;
    font-weight: 700;
    border-radius: 6px;
  }

  .summary-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--type-color);
  }

  /* Next button */
  .next-button {
    align-self: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
    padding: 1rem 2.5rem;
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.3) 0%, rgba(6, 182, 212, 0.3) 100%);
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
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.4) 0%, rgba(6, 182, 212, 0.4) 100%);
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
    .motions-experience {
      padding: 1rem;
    }

    h2 {
      font-size: 1.5rem;
    }

    .fundamental-motions {
      flex-direction: column;
      align-items: center;
    }

    .fundamental-card {
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
