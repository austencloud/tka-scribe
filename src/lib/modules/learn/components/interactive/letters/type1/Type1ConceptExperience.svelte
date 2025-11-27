<!--
Type1ConceptExperience - Multi-page lesson introducing Type 1 (Dual-Shift) letters
Page 1: Introduction to Type 1 Letters & Dual-Shift concept
Page 2: Prospin Letters (A, D, G, J, M, P, S)
Page 3: Antispin Letters (B, E, H, K, N, Q, T)
Page 4: Hybrid Letters (C, F, I, L, O, R, U, V)
Page 5: Quiz
-->
<script lang="ts">
  import {
    GridPositionGroup,
    Letter,
    MotionType,
    resolve,
    TYPES,
    type IHapticFeedbackService,
  } from "$shared";
  import Type1LetterVisualizer, { type Type1LetterData } from "./Type1LetterVisualizer.svelte";
  import Type1LetterQuiz from "./Type1LetterQuiz.svelte";

  let { onComplete } = $props<{
    onComplete?: () => void;
  }>();

  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  let currentPage = $state(1);
  const totalPages = 5;

  // Type 1 letter data organized by motion pattern
  // Based on letter-mappings.json and Level 1 PDF
  const PROSPIN_LETTERS: Type1LetterData[] = [
    {
      letter: Letter.A,
      blueMotion: MotionType.PRO,
      redMotion: MotionType.PRO,
      startPositionGroup: GridPositionGroup.ALPHA,
      endPositionGroup: GridPositionGroup.ALPHA,
      description: "Alpha to Alpha, both hands prospin",
    },
    {
      letter: Letter.D,
      blueMotion: MotionType.PRO,
      redMotion: MotionType.PRO,
      startPositionGroup: GridPositionGroup.BETA,
      endPositionGroup: GridPositionGroup.ALPHA,
      description: "Beta to Alpha, both hands prospin",
    },
    {
      letter: Letter.G,
      blueMotion: MotionType.PRO,
      redMotion: MotionType.PRO,
      startPositionGroup: GridPositionGroup.BETA,
      endPositionGroup: GridPositionGroup.BETA,
      description: "Beta to Beta, both hands prospin",
    },
    {
      letter: Letter.J,
      blueMotion: MotionType.PRO,
      redMotion: MotionType.PRO,
      startPositionGroup: GridPositionGroup.ALPHA,
      endPositionGroup: GridPositionGroup.BETA,
      description: "Alpha to Beta, both hands prospin",
    },
    {
      letter: Letter.M,
      blueMotion: MotionType.PRO,
      redMotion: MotionType.PRO,
      startPositionGroup: GridPositionGroup.GAMMA,
      endPositionGroup: GridPositionGroup.GAMMA,
      description: "Gamma to Gamma, both hands prospin",
    },
    {
      letter: Letter.P,
      blueMotion: MotionType.PRO,
      redMotion: MotionType.PRO,
      startPositionGroup: GridPositionGroup.GAMMA,
      endPositionGroup: GridPositionGroup.GAMMA,
      description: "Gamma to Gamma, both hands prospin",
    },
    {
      letter: Letter.S,
      blueMotion: MotionType.PRO,
      redMotion: MotionType.PRO,
      startPositionGroup: GridPositionGroup.GAMMA,
      endPositionGroup: GridPositionGroup.GAMMA,
      description: "Gamma to Gamma, both hands prospin",
    },
  ];

  const ANTISPIN_LETTERS: Type1LetterData[] = [
    {
      letter: Letter.B,
      blueMotion: MotionType.ANTI,
      redMotion: MotionType.ANTI,
      startPositionGroup: GridPositionGroup.ALPHA,
      endPositionGroup: GridPositionGroup.ALPHA,
      description: "Alpha to Alpha, both hands antispin",
    },
    {
      letter: Letter.E,
      blueMotion: MotionType.ANTI,
      redMotion: MotionType.ANTI,
      startPositionGroup: GridPositionGroup.BETA,
      endPositionGroup: GridPositionGroup.ALPHA,
      description: "Beta to Alpha, both hands antispin",
    },
    {
      letter: Letter.H,
      blueMotion: MotionType.ANTI,
      redMotion: MotionType.ANTI,
      startPositionGroup: GridPositionGroup.BETA,
      endPositionGroup: GridPositionGroup.BETA,
      description: "Beta to Beta, both hands antispin",
    },
    {
      letter: Letter.K,
      blueMotion: MotionType.ANTI,
      redMotion: MotionType.ANTI,
      startPositionGroup: GridPositionGroup.ALPHA,
      endPositionGroup: GridPositionGroup.BETA,
      description: "Alpha to Beta, both hands antispin",
    },
    {
      letter: Letter.N,
      blueMotion: MotionType.ANTI,
      redMotion: MotionType.ANTI,
      startPositionGroup: GridPositionGroup.GAMMA,
      endPositionGroup: GridPositionGroup.GAMMA,
      description: "Gamma to Gamma, both hands antispin",
    },
    {
      letter: Letter.Q,
      blueMotion: MotionType.ANTI,
      redMotion: MotionType.ANTI,
      startPositionGroup: GridPositionGroup.GAMMA,
      endPositionGroup: GridPositionGroup.GAMMA,
      description: "Gamma to Gamma, both hands antispin",
    },
    {
      letter: Letter.T,
      blueMotion: MotionType.ANTI,
      redMotion: MotionType.ANTI,
      startPositionGroup: GridPositionGroup.GAMMA,
      endPositionGroup: GridPositionGroup.GAMMA,
      description: "Gamma to Gamma, both hands antispin",
    },
  ];

  const HYBRID_LETTERS: Type1LetterData[] = [
    {
      letter: Letter.C,
      blueMotion: MotionType.ANTI,
      redMotion: MotionType.PRO,
      startPositionGroup: GridPositionGroup.ALPHA,
      endPositionGroup: GridPositionGroup.ALPHA,
      description: "Alpha to Alpha, blue antispin, red prospin",
    },
    {
      letter: Letter.F,
      blueMotion: MotionType.ANTI,
      redMotion: MotionType.PRO,
      startPositionGroup: GridPositionGroup.BETA,
      endPositionGroup: GridPositionGroup.ALPHA,
      description: "Beta to Alpha, blue antispin, red prospin",
    },
    {
      letter: Letter.I,
      blueMotion: MotionType.ANTI,
      redMotion: MotionType.PRO,
      startPositionGroup: GridPositionGroup.BETA,
      endPositionGroup: GridPositionGroup.BETA,
      description: "Beta to Beta, blue antispin, red prospin",
    },
    {
      letter: Letter.L,
      blueMotion: MotionType.ANTI,
      redMotion: MotionType.PRO,
      startPositionGroup: GridPositionGroup.ALPHA,
      endPositionGroup: GridPositionGroup.BETA,
      description: "Alpha to Beta, blue antispin, red prospin",
    },
    {
      letter: Letter.O,
      blueMotion: MotionType.ANTI,
      redMotion: MotionType.PRO,
      startPositionGroup: GridPositionGroup.GAMMA,
      endPositionGroup: GridPositionGroup.GAMMA,
      description: "Gamma to Gamma, blue antispin, red prospin",
    },
    {
      letter: Letter.R,
      blueMotion: MotionType.ANTI,
      redMotion: MotionType.PRO,
      startPositionGroup: GridPositionGroup.GAMMA,
      endPositionGroup: GridPositionGroup.GAMMA,
      description: "Gamma to Gamma, blue antispin, red prospin",
    },
    {
      letter: Letter.U,
      blueMotion: MotionType.ANTI,
      redMotion: MotionType.PRO,
      startPositionGroup: GridPositionGroup.GAMMA,
      endPositionGroup: GridPositionGroup.GAMMA,
      description: "Gamma to Gamma, blue antispin, red prospin",
    },
    {
      letter: Letter.V,
      blueMotion: MotionType.PRO,
      redMotion: MotionType.ANTI,
      startPositionGroup: GridPositionGroup.GAMMA,
      endPositionGroup: GridPositionGroup.GAMMA,
      description: "Gamma to Gamma, blue prospin, red antispin (reverse hybrid)",
    },
  ];

  // Current letter index for each category
  let prospinIndex = $state(0);
  let antispinIndex = $state(0);
  let hybridIndex = $state(0);

  function handleNext() {
    hapticService?.trigger("selection");
    if (currentPage < totalPages) {
      currentPage++;
    } else {
      onComplete?.();
    }
  }

  function handlePrevious() {
    hapticService?.trigger("selection");
    if (currentPage > 1) {
      currentPage--;
    }
  }

  function handleQuizComplete() {
    hapticService?.trigger("success");
    onComplete?.();
  }

  function cycleProspin(direction: 1 | -1) {
    const newIndex = prospinIndex + direction;
    if (newIndex >= 0 && newIndex < PROSPIN_LETTERS.length) {
      prospinIndex = newIndex;
      hapticService?.trigger("selection");
    }
  }

  function cycleAntispin(direction: 1 | -1) {
    const newIndex = antispinIndex + direction;
    if (newIndex >= 0 && newIndex < ANTISPIN_LETTERS.length) {
      antispinIndex = newIndex;
      hapticService?.trigger("selection");
    }
  }

  function cycleHybrid(direction: 1 | -1) {
    const newIndex = hybridIndex + direction;
    if (newIndex >= 0 && newIndex < HYBRID_LETTERS.length) {
      hybridIndex = newIndex;
      hapticService?.trigger("selection");
    }
  }

  // Current displayed letters
  const currentProspin = $derived(PROSPIN_LETTERS[prospinIndex]);
  const currentAntispin = $derived(ANTISPIN_LETTERS[antispinIndex]);
  const currentHybrid = $derived(HYBRID_LETTERS[hybridIndex]);
</script>

<div class="type1-experience">
  {#if currentPage === 1}
    <!-- Page 1: Introduction -->
    <div class="page">
      <h2>Type 1: Dual-Shift Letters</h2>

      <div class="intro-section">
        <div class="intro-icon">
          <i class="fa-solid fa-arrows-rotate"></i>
        </div>
        <p class="intro-text">
          Type 1 letters are called <strong>"Dual-Shift"</strong> because
          <strong>both hands move</strong> from one grid position to an adjacent position.
        </p>
      </div>

      <div class="key-concept">
        <h3>The Key Pattern</h3>
        <p>Every Type 1 letter follows a simple pattern:</p>

        <div class="pattern-grid">
          <div class="pattern-item pro">
            <span class="pattern-label">Pro-Pro</span>
            <span class="pattern-letters">A, D, G, J, M, P, S</span>
            <span class="pattern-desc">Both hands spin the same direction as motion</span>
          </div>
          <div class="pattern-item anti">
            <span class="pattern-label">Anti-Anti</span>
            <span class="pattern-letters">B, E, H, K, N, Q, T</span>
            <span class="pattern-desc">Both hands spin opposite to motion</span>
          </div>
          <div class="pattern-item hybrid">
            <span class="pattern-label">Hybrid</span>
            <span class="pattern-letters">C, F, I, L, O, R, U, V</span>
            <span class="pattern-desc">Hands spin in different directions</span>
          </div>
        </div>
      </div>

      <div class="alphabet-preview">
        <h3>The Type 1 Alphabet (A-V)</h3>
        <div class="letter-row">
          {#each "ABCDEFGHIJKLMNOPQRSTUV".split("") as letter}
            <span class="preview-letter">{letter}</span>
          {/each}
        </div>
        <p class="note">22 letters total - the foundation of TKA!</p>
      </div>

      <button class="next-button" onclick={handleNext}>
        Learn Prospin Letters
        <i class="fa-solid fa-arrow-right"></i>
      </button>
    </div>

  {:else if currentPage === 2}
    <!-- Page 2: Prospin Letters -->
    <div class="page">
      <h2>Prospin Letters</h2>

      <div class="motion-intro pro">
        <div class="motion-icon">
          <i class="fa-solid fa-rotate-right"></i>
        </div>
        <p class="motion-summary">
          Both hands perform <strong>prospin</strong> motion
        </p>
        <span class="motion-badge">Pro-Pro Pattern</span>
      </div>

      <div class="explanation">
        <h3>What is Prospin?</h3>
        <ul>
          <li>The prop spins <strong>in the same direction</strong> as the hand's movement</li>
          <li>Think: spinning <strong>with</strong> the flow of motion</li>
          <li>Creates smooth, continuous visual patterns</li>
        </ul>
      </div>

      <div class="visualizer-section">
        {#if currentProspin}
          <Type1LetterVisualizer letterData={currentProspin} size="large" />
        {/if}

        <div class="nav-controls">
          <button
            class="nav-button"
            onclick={() => cycleProspin(-1)}
            disabled={prospinIndex === 0}
            aria-label="Previous prospin letter"
          >
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <span class="nav-indicator">
            {prospinIndex + 1} / {PROSPIN_LETTERS.length}
          </span>
          <button
            class="nav-button"
            onclick={() => cycleProspin(1)}
            disabled={prospinIndex === PROSPIN_LETTERS.length - 1}
            aria-label="Next prospin letter"
          >
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div class="letter-summary">
        <h3>Prospin Letters</h3>
        <div class="summary-letters">
          {#each PROSPIN_LETTERS as letterData, i}
            <button
              class="letter-chip"
              class:active={i === prospinIndex}
              onclick={() => { prospinIndex = i; hapticService?.trigger("selection"); }}
            >
              {letterData.letter}
            </button>
          {/each}
        </div>
      </div>

      <div class="button-row">
        <button class="prev-button" onclick={handlePrevious}>
          <i class="fa-solid fa-arrow-left"></i>
          Back
        </button>
        <button class="next-button" onclick={handleNext}>
          Learn Antispin Letters
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>

  {:else if currentPage === 3}
    <!-- Page 3: Antispin Letters -->
    <div class="page">
      <h2>Antispin Letters</h2>

      <div class="motion-intro anti">
        <div class="motion-icon">
          <i class="fa-solid fa-rotate-left"></i>
        </div>
        <p class="motion-summary">
          Both hands perform <strong>antispin</strong> motion
        </p>
        <span class="motion-badge">Anti-Anti Pattern</span>
      </div>

      <div class="explanation">
        <h3>What is Antispin?</h3>
        <ul>
          <li>The prop spins <strong>opposite</strong> to the hand's movement</li>
          <li>Think: spinning <strong>against</strong> the flow of motion</li>
          <li>Creates the distinctive "flower" patterns</li>
        </ul>
      </div>

      <div class="visualizer-section">
        {#if currentAntispin}
          <Type1LetterVisualizer letterData={currentAntispin} size="large" />
        {/if}

        <div class="nav-controls">
          <button
            class="nav-button"
            onclick={() => cycleAntispin(-1)}
            disabled={antispinIndex === 0}
            aria-label="Previous antispin letter"
          >
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <span class="nav-indicator">
            {antispinIndex + 1} / {ANTISPIN_LETTERS.length}
          </span>
          <button
            class="nav-button"
            onclick={() => cycleAntispin(1)}
            disabled={antispinIndex === ANTISPIN_LETTERS.length - 1}
            aria-label="Next antispin letter"
          >
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div class="letter-summary">
        <h3>Antispin Letters</h3>
        <div class="summary-letters">
          {#each ANTISPIN_LETTERS as letterData, i}
            <button
              class="letter-chip"
              class:active={i === antispinIndex}
              onclick={() => { antispinIndex = i; hapticService?.trigger("selection"); }}
            >
              {letterData.letter}
            </button>
          {/each}
        </div>
      </div>

      <div class="button-row">
        <button class="prev-button" onclick={handlePrevious}>
          <i class="fa-solid fa-arrow-left"></i>
          Back
        </button>
        <button class="next-button" onclick={handleNext}>
          Learn Hybrid Letters
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>

  {:else if currentPage === 4}
    <!-- Page 4: Hybrid Letters -->
    <div class="page">
      <h2>Hybrid Letters</h2>

      <div class="motion-intro hybrid">
        <div class="motion-icon">
          <i class="fa-solid fa-shuffle"></i>
        </div>
        <p class="motion-summary">
          Hands perform <strong>different</strong> motions (one pro, one anti)
        </p>
        <span class="motion-badge">Hybrid Pattern</span>
      </div>

      <div class="explanation">
        <h3>What Makes Hybrids Special?</h3>
        <ul>
          <li>One hand does <strong>prospin</strong>, the other does <strong>antispin</strong></li>
          <li>Creates more complex, asymmetrical patterns</li>
          <li>Most hybrids: blue antispin + red prospin</li>
          <li><strong>V</strong> is special: blue prospin + red antispin (reverse hybrid)</li>
        </ul>
      </div>

      <div class="visualizer-section">
        {#if currentHybrid}
          <Type1LetterVisualizer letterData={currentHybrid} size="large" />
        {/if}

        <div class="nav-controls">
          <button
            class="nav-button"
            onclick={() => cycleHybrid(-1)}
            disabled={hybridIndex === 0}
            aria-label="Previous hybrid letter"
          >
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <span class="nav-indicator">
            {hybridIndex + 1} / {HYBRID_LETTERS.length}
          </span>
          <button
            class="nav-button"
            onclick={() => cycleHybrid(1)}
            disabled={hybridIndex === HYBRID_LETTERS.length - 1}
            aria-label="Next hybrid letter"
          >
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div class="letter-summary">
        <h3>Hybrid Letters</h3>
        <div class="summary-letters">
          {#each HYBRID_LETTERS as letterData, i}
            <button
              class="letter-chip"
              class:active={i === hybridIndex}
              onclick={() => { hybridIndex = i; hapticService?.trigger("selection"); }}
            >
              {letterData.letter}
            </button>
          {/each}
        </div>
      </div>

      <div class="final-summary">
        <h3>Type 1 Letter Summary</h3>
        <div class="summary-grid">
          <div class="summary-card pro">
            <i class="fa-solid fa-rotate-right"></i>
            <span class="card-label">Pro-Pro</span>
            <span class="card-letters">A D G J M P S</span>
          </div>
          <div class="summary-card anti">
            <i class="fa-solid fa-rotate-left"></i>
            <span class="card-label">Anti-Anti</span>
            <span class="card-letters">B E H K N Q T</span>
          </div>
          <div class="summary-card hybrid">
            <i class="fa-solid fa-shuffle"></i>
            <span class="card-label">Hybrid</span>
            <span class="card-letters">C F I L O R U V</span>
          </div>
        </div>
      </div>

      <div class="button-row">
        <button class="prev-button" onclick={handlePrevious}>
          <i class="fa-solid fa-arrow-left"></i>
          Back
        </button>
        <button class="next-button" onclick={handleNext}>
          <i class="fa-solid fa-graduation-cap"></i>
          Take the Quiz
        </button>
      </div>
    </div>

  {:else if currentPage === 5}
    <!-- Page 5: Quiz -->
    <div class="page quiz-page">
      <h2>Test Your Knowledge</h2>
      <p class="quiz-intro">Identify the motion types for Type 1 letters!</p>

      <Type1LetterQuiz onComplete={handleQuizComplete} />
    </div>
  {/if}
</div>

<style>
  .type1-experience {
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

  /* Intro section */
  .intro-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: linear-gradient(
      135deg,
      rgba(34, 211, 238, 0.1) 0%,
      rgba(34, 211, 238, 0.02) 100%
    );
    border: 1px solid rgba(34, 211, 238, 0.2);
    border-radius: 16px;
  }

  .intro-icon {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(34, 211, 238, 0.2);
    border-radius: 50%;
    color: #22d3ee;
    font-size: 1.75rem;
  }

  .intro-text {
    font-size: 1.125rem;
    text-align: center;
  }

  /* Key concept */
  .key-concept {
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
  }

  .pattern-grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .pattern-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1rem;
    border-radius: 10px;
  }

  .pattern-item.pro {
    background: rgba(34, 211, 238, 0.1);
    border: 1px solid rgba(34, 211, 238, 0.25);
  }

  .pattern-item.anti {
    background: rgba(168, 85, 247, 0.1);
    border: 1px solid rgba(168, 85, 247, 0.25);
  }

  .pattern-item.hybrid {
    background: linear-gradient(
      135deg,
      rgba(34, 211, 238, 0.1),
      rgba(168, 85, 247, 0.1)
    );
    border: 1px solid rgba(168, 85, 247, 0.25);
  }

  .pattern-label {
    font-weight: 700;
    font-size: 0.9375rem;
  }

  .pattern-item.pro .pattern-label {
    color: #22d3ee;
  }
  .pattern-item.anti .pattern-label {
    color: #a855f7;
  }
  .pattern-item.hybrid .pattern-label {
    color: #a855f7;
  }

  .pattern-letters {
    font-size: 1.25rem;
    font-weight: 600;
    color: white;
    letter-spacing: 2px;
  }

  .pattern-desc {
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.6);
  }

  /* Alphabet preview */
  .alphabet-preview {
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    text-align: center;
  }

  .letter-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .preview-letter {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    font-weight: 700;
    font-size: 1rem;
    color: white;
  }

  .note {
    font-size: 0.875rem !important;
    color: rgba(255, 255, 255, 0.6) !important;
    margin-top: 0.75rem !important;
  }

  /* Motion intro */
  .motion-intro {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem;
    border-radius: 16px;
  }

  .motion-intro.pro {
    background: linear-gradient(
      135deg,
      rgba(34, 211, 238, 0.1) 0%,
      rgba(34, 211, 238, 0.02) 100%
    );
    border: 1px solid rgba(34, 211, 238, 0.2);
  }

  .motion-intro.anti {
    background: linear-gradient(
      135deg,
      rgba(168, 85, 247, 0.1) 0%,
      rgba(168, 85, 247, 0.02) 100%
    );
    border: 1px solid rgba(168, 85, 247, 0.2);
  }

  .motion-intro.hybrid {
    background: linear-gradient(
      135deg,
      rgba(34, 211, 238, 0.1) 0%,
      rgba(168, 85, 247, 0.1) 100%
    );
    border: 1px solid rgba(168, 85, 247, 0.2);
  }

  .motion-icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 1.5rem;
  }

  .motion-intro.pro .motion-icon {
    background: rgba(34, 211, 238, 0.2);
    color: #22d3ee;
  }

  .motion-intro.anti .motion-icon {
    background: rgba(168, 85, 247, 0.2);
    color: #a855f7;
  }

  .motion-intro.hybrid .motion-icon {
    background: linear-gradient(
      135deg,
      rgba(34, 211, 238, 0.2),
      rgba(168, 85, 247, 0.2)
    );
    color: #a855f7;
  }

  .motion-summary {
    font-size: 1.25rem !important;
    font-weight: 500;
  }

  .motion-badge {
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .motion-intro.pro .motion-badge {
    background: rgba(34, 211, 238, 0.2);
    color: #22d3ee;
  }

  .motion-intro.anti .motion-badge {
    background: rgba(168, 85, 247, 0.2);
    color: #a855f7;
  }

  .motion-intro.hybrid .motion-badge {
    background: linear-gradient(
      135deg,
      rgba(34, 211, 238, 0.2),
      rgba(168, 85, 247, 0.2)
    );
    color: #a855f7;
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

  /* Visualizer section */
  .visualizer-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .nav-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .nav-button {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .nav-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .nav-button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .nav-indicator {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
    min-width: 60px;
    text-align: center;
  }

  /* Letter summary */
  .letter-summary {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
  }

  .summary-letters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.75rem;
    justify-content: center;
  }

  .letter-chip {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.08);
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    font-weight: 700;
    font-size: 1.125rem;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .letter-chip:hover {
    background: rgba(255, 255, 255, 0.12);
    color: white;
  }

  .letter-chip.active {
    background: rgba(34, 211, 238, 0.2);
    border-color: rgba(34, 211, 238, 0.5);
    color: #22d3ee;
  }

  /* Final summary */
  .final-summary {
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .summary-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
    padding: 1rem;
    border-radius: 10px;
  }

  .summary-card.pro {
    background: rgba(34, 211, 238, 0.1);
    border: 1px solid rgba(34, 211, 238, 0.25);
    color: #22d3ee;
  }

  .summary-card.anti {
    background: rgba(168, 85, 247, 0.1);
    border: 1px solid rgba(168, 85, 247, 0.25);
    color: #a855f7;
  }

  .summary-card.hybrid {
    background: linear-gradient(
      135deg,
      rgba(34, 211, 238, 0.1),
      rgba(168, 85, 247, 0.1)
    );
    border: 1px solid rgba(168, 85, 247, 0.25);
    color: #a855f7;
  }

  .summary-card i {
    font-size: 1.25rem;
  }

  .card-label {
    font-weight: 600;
    font-size: 0.8125rem;
  }

  .card-letters {
    font-size: 0.75rem;
    opacity: 0.8;
    letter-spacing: 1px;
  }

  /* Buttons */
  .button-row {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1rem;
  }

  .next-button,
  .prev-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
    padding: 1rem 2rem;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    min-height: 52px;
  }

  .next-button {
    background: linear-gradient(
      135deg,
      rgba(34, 211, 238, 0.3) 0%,
      rgba(6, 182, 212, 0.3) 100%
    );
    backdrop-filter: blur(20px);
    border: 2px solid rgba(34, 211, 238, 0.5);
    color: white;
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

  .prev-button {
    background: rgba(255, 255, 255, 0.06);
    border: 2px solid rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.8);
  }

  .prev-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.25);
  }

  /* Quiz page */
  .quiz-page {
    max-width: 700px;
  }

  .quiz-intro {
    margin-bottom: 1rem !important;
  }

  /* Responsive */
  @media (max-width: 600px) {
    .type1-experience {
      padding: 1rem;
    }

    h2 {
      font-size: 1.5rem;
    }

    .summary-grid {
      grid-template-columns: 1fr;
    }

    .button-row {
      flex-direction: column;
    }

    .next-button,
    .prev-button {
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .page {
      animation: none;
    }
  }
</style>
