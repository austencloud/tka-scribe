<!--
WordsConceptExperience - Multi-page lesson on TKA word formation
Page 1: Introduction to words (letters as sequences)
Page 2: Alpha/Beta words (AABB pattern)
Page 3: How letters connect (start/end positions)
Page 4: Word variations (thumb orientation, direction)
Page 5: Interactive quiz
-->
<script lang="ts">
  import { resolve, TYPES, type IHapticFeedbackService } from "$shared";
  import WordVisualizer from "./WordVisualizer.svelte";
  import WordBuildingQuiz from "./WordBuildingQuiz.svelte";

  let { onComplete } = $props<{
    onComplete?: () => void;
  }>();

  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  type HandPosition = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";
  type MotionType = "pro" | "anti" | "hybrid";

  interface LetterDefinition {
    letter: string;
    startLeft: HandPosition;
    startRight: HandPosition;
    endLeft: HandPosition;
    endRight: HandPosition;
    leftMotion: MotionType;
    rightMotion: MotionType;
    description?: string;
  }

  let currentPage = $state(1);
  const totalPages = 5;

  // Demo word data for visualizations

  // Single letter A demo (Split-Same, Pro)
  const singleA: LetterDefinition[] = [
    {
      letter: "A",
      startLeft: "N",
      startRight: "S",
      endLeft: "E",
      endRight: "W",
      leftMotion: "pro",
      rightMotion: "pro",
      description: "Split-Same, Prospin",
    },
  ];

  // Single letter B demo (Split-Same, Anti)
  const singleB: LetterDefinition[] = [
    {
      letter: "B",
      startLeft: "N",
      startRight: "S",
      endLeft: "W",
      endRight: "E",
      leftMotion: "anti",
      rightMotion: "anti",
      description: "Split-Same, Antispin",
    },
  ];

  // AABB word (4 beats)
  const wordAABB: LetterDefinition[] = [
    {
      letter: "A",
      startLeft: "N",
      startRight: "S",
      endLeft: "E",
      endRight: "W",
      leftMotion: "pro",
      rightMotion: "pro",
      description: "Beat 1",
    },
    {
      letter: "A",
      startLeft: "E",
      startRight: "W",
      endLeft: "S",
      endRight: "N",
      leftMotion: "pro",
      rightMotion: "pro",
      description: "Beat 2",
    },
    {
      letter: "B",
      startLeft: "S",
      startRight: "N",
      endLeft: "E",
      endRight: "W",
      leftMotion: "anti",
      rightMotion: "anti",
      description: "Beat 3",
    },
    {
      letter: "B",
      startLeft: "E",
      startRight: "W",
      endLeft: "N",
      endRight: "S",
      leftMotion: "anti",
      rightMotion: "anti",
      description: "Beat 4",
    },
  ];

  // GGGG word (Tog-Same, 4 beats)
  const wordGGGG: LetterDefinition[] = [
    {
      letter: "G",
      startLeft: "S",
      startRight: "S",
      endLeft: "W",
      endRight: "W",
      leftMotion: "pro",
      rightMotion: "pro",
      description: "Beta to Beta",
    },
    {
      letter: "G",
      startLeft: "W",
      startRight: "W",
      endLeft: "N",
      endRight: "N",
      leftMotion: "pro",
      rightMotion: "pro",
      description: "Beta to Beta",
    },
    {
      letter: "G",
      startLeft: "N",
      startRight: "N",
      endLeft: "E",
      endRight: "E",
      leftMotion: "pro",
      rightMotion: "pro",
      description: "Beta to Beta",
    },
    {
      letter: "G",
      startLeft: "E",
      startRight: "E",
      endLeft: "S",
      endRight: "S",
      leftMotion: "pro",
      rightMotion: "pro",
      description: "Returns home!",
    },
  ];

  // CCCC word (Hybrid)
  const wordCCCC: LetterDefinition[] = [
    {
      letter: "C",
      startLeft: "N",
      startRight: "S",
      endLeft: "E",
      endRight: "W",
      leftMotion: "pro",
      rightMotion: "anti",
      description: "Hybrid motion",
    },
    {
      letter: "C",
      startLeft: "E",
      startRight: "W",
      endLeft: "S",
      endRight: "N",
      leftMotion: "pro",
      rightMotion: "anti",
      description: "Hybrid motion",
    },
    {
      letter: "C",
      startLeft: "S",
      startRight: "N",
      endLeft: "W",
      endRight: "E",
      leftMotion: "pro",
      rightMotion: "anti",
      description: "Hybrid motion",
    },
    {
      letter: "C",
      startLeft: "W",
      startRight: "E",
      endLeft: "N",
      endRight: "S",
      leftMotion: "pro",
      rightMotion: "anti",
      description: "Returns home!",
    },
  ];

  // State for animated demos
  let aabbBeatIndex = $state(0);
  let ggggBeatIndex = $state(0);
  let ccccBeatIndex = $state(0);
  let isAnimating = $state(false);

  function handleNext() {
    hapticService?.trigger("selection");
    if (currentPage < totalPages) {
      currentPage++;
      // Reset animation states when changing pages
      isAnimating = false;
      aabbBeatIndex = 0;
      ggggBeatIndex = 0;
      ccccBeatIndex = 0;
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

  function toggleAnimation() {
    isAnimating = !isAnimating;
    hapticService?.trigger("selection");
  }
</script>

<div class="words-experience">
  {#if currentPage === 1}
    <!-- Page 1: Introduction to Words -->
    <div class="page">
      <h2>What is a Word?</h2>

      <div class="intro-section">
        <div class="concept-icon">
          <i class="fa-solid fa-spell-check"></i>
        </div>
        <p class="intro-text">
          In TKA, a <strong>word</strong> is a sequence of letters that connect
          smoothly together, beat by beat.
        </p>
      </div>

      <div class="key-points">
        <div class="key-point">
          <div class="point-icon">
            <i class="fa-solid fa-link"></i>
          </div>
          <div class="point-content">
            <h4>Letters Connect</h4>
            <p>Each letter's <em>end position</em> becomes the next letter's <em>start position</em></p>
          </div>
        </div>

        <div class="key-point">
          <div class="point-icon">
            <i class="fa-solid fa-music"></i>
          </div>
          <div class="point-content">
            <h4>Beat by Beat</h4>
            <p>One letter = one beat of music. Words create rhythmic flow!</p>
          </div>
        </div>

        <div class="key-point">
          <div class="point-icon">
            <i class="fa-solid fa-rotate"></i>
          </div>
          <div class="point-content">
            <h4>Return Home</h4>
            <p>Many words loop back to their starting position</p>
          </div>
        </div>
      </div>

      <div class="example-preview">
        <p class="preview-label">Example: The word <strong>AABB</strong></p>
        <div class="letter-sequence">
          <span class="seq-letter">A</span>
          <span class="seq-arrow">→</span>
          <span class="seq-letter">A</span>
          <span class="seq-arrow">→</span>
          <span class="seq-letter">B</span>
          <span class="seq-arrow">→</span>
          <span class="seq-letter">B</span>
        </div>
      </div>

      <button class="next-button" onclick={handleNext}>
        <span>Learn About Letter Types</span>
        <i class="fa-solid fa-arrow-right"></i>
      </button>
    </div>

  {:else if currentPage === 2}
    <!-- Page 2: Alpha/Beta Words -->
    <div class="page">
      <h2>Alpha & Beta Words</h2>

      <p class="page-intro">
        The simplest words use letters that stay within Alpha (α→α) or Beta (β→β) positions.
      </p>

      <div class="comparison-section">
        <div class="letter-card alpha">
          <h3>Letter A - Prospin</h3>
          <WordVisualizer
            letters={singleA}
            showLetterLabel={true}
            showBeatNumber={false}
            compact={true}
          />
          <p class="letter-info">Both hands curve in the <em>same direction</em> as movement</p>
        </div>

        <div class="letter-card beta">
          <h3>Letter B - Antispin</h3>
          <WordVisualizer
            letters={singleB}
            showLetterLabel={true}
            showBeatNumber={false}
            compact={true}
          />
          <p class="letter-info">Both hands curve <em>opposite</em> to movement direction</p>
        </div>
      </div>

      <div class="pattern-highlight">
        <h3>The Pro - Anti - Hybrid Pattern</h3>
        <div class="pattern-grid">
          <div class="pattern-item">
            <span class="pattern-letter">A, G, D</span>
            <span class="pattern-type pro">Prospin</span>
          </div>
          <div class="pattern-item">
            <span class="pattern-letter">B, H, E</span>
            <span class="pattern-type anti">Antispin</span>
          </div>
          <div class="pattern-item">
            <span class="pattern-letter">C, I, F</span>
            <span class="pattern-type hybrid">Hybrid</span>
          </div>
        </div>
        <p class="pattern-note">
          This pattern repeats throughout the alphabet. Memorize one letter in each group,
          and you know them all!
        </p>
      </div>

      <div class="nav-buttons">
        <button class="back-btn" onclick={handlePrevious}>
          <i class="fa-solid fa-arrow-left"></i>
          Back
        </button>
        <button class="next-button" onclick={handleNext}>
          <span>See Words in Motion</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>

  {:else if currentPage === 3}
    <!-- Page 3: Words in Motion (AABB demo) -->
    <div class="page">
      <h2>Words in Motion: AABB</h2>

      <p class="page-intro">
        Watch how the word <strong>AABB</strong> flows through 4 beats,
        returning to its starting position!
      </p>

      <div class="word-demo">
        <WordVisualizer
          letters={wordAABB}
          currentBeatIndex={aabbBeatIndex}
          {isAnimating}
          animationSpeed={1200}
          showLetterLabel={true}
          showBeatNumber={true}
          onBeatChange={(i) => aabbBeatIndex = i}
        />

        <div class="demo-controls">
          <button
            class="control-btn"
            class:playing={isAnimating}
            onclick={toggleAnimation}
          >
            {#if isAnimating}
              <i class="fa-solid fa-pause"></i>
              <span>Pause</span>
            {:else}
              <i class="fa-solid fa-play"></i>
              <span>Animate</span>
            {/if}
          </button>
        </div>
      </div>

      <div class="beat-breakdown">
        <h4>Beat Breakdown</h4>
        <div class="beats-grid">
          <div class="beat-item" class:active={aabbBeatIndex === 0}>
            <span class="beat-num">1</span>
            <span class="beat-letter">A</span>
            <span class="beat-desc">Pro, α→α</span>
          </div>
          <div class="beat-item" class:active={aabbBeatIndex === 1}>
            <span class="beat-num">2</span>
            <span class="beat-letter">A</span>
            <span class="beat-desc">Pro, α→α</span>
          </div>
          <div class="beat-item" class:active={aabbBeatIndex === 2}>
            <span class="beat-num">3</span>
            <span class="beat-letter">B</span>
            <span class="beat-desc">Anti, α→α</span>
          </div>
          <div class="beat-item" class:active={aabbBeatIndex === 3}>
            <span class="beat-num">4</span>
            <span class="beat-letter">B</span>
            <span class="beat-desc">Anti, α→α</span>
          </div>
        </div>
      </div>

      <div class="nav-buttons">
        <button class="back-btn" onclick={handlePrevious}>
          <i class="fa-solid fa-arrow-left"></i>
          Back
        </button>
        <button class="next-button" onclick={handleNext}>
          <span>More Word Examples</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>

  {:else if currentPage === 4}
    <!-- Page 4: More Word Examples -->
    <div class="page">
      <h2>More Word Patterns</h2>

      <p class="page-intro">
        Different letters create different visual patterns. Here are two more examples:
      </p>

      <div class="word-examples-grid">
        <div class="word-example">
          <h3>GGGG - Beta Circle</h3>
          <WordVisualizer
            letters={wordGGGG}
            currentBeatIndex={ggggBeatIndex}
            showLetterLabel={true}
            showBeatNumber={true}
            compact={true}
            onBeatChange={(i) => ggggBeatIndex = i}
          />
          <p class="example-note">
            G uses <strong>Tog-Same</strong> (β→β) motion.
            Both hands stay together as they circle the grid!
          </p>
        </div>

        <div class="word-example">
          <h3>CCCC - Hybrid Flow</h3>
          <WordVisualizer
            letters={wordCCCC}
            currentBeatIndex={ccccBeatIndex}
            showLetterLabel={true}
            showBeatNumber={true}
            compact={true}
            onBeatChange={(i) => ccccBeatIndex = i}
          />
          <p class="example-note">
            C is a <strong>hybrid</strong> - one hand pro, one anti.
            Creates a unique asymmetric look!
          </p>
        </div>
      </div>

      <div class="summary-box">
        <h4>Key Takeaways</h4>
        <ul>
          <li>Words are sequences of letters connected beat-by-beat</li>
          <li>End position of one letter = start position of the next</li>
          <li>Many words return to their starting position (CAPs)</li>
          <li>Same word can look different based on rotation direction and thumb orientation</li>
        </ul>
      </div>

      <div class="nav-buttons">
        <button class="back-btn" onclick={handlePrevious}>
          <i class="fa-solid fa-arrow-left"></i>
          Back
        </button>
        <button class="next-button" onclick={handleNext}>
          <i class="fa-solid fa-graduation-cap"></i>
          <span>Take the Quiz</span>
        </button>
      </div>
    </div>

  {:else if currentPage === 5}
    <!-- Page 5: Quiz -->
    <div class="page quiz-page">
      <h2>Test Your Knowledge</h2>
      <p class="page-intro">Let's see what you've learned about TKA words!</p>

      <WordBuildingQuiz onComplete={handleQuizComplete} />
    </div>
  {/if}

  <!-- Progress indicator -->
  <div class="progress-indicator">
    {#each Array(totalPages) as _, i}
      <div
        class="progress-dot"
        class:active={i + 1 === currentPage}
        class:completed={i + 1 < currentPage}
      ></div>
    {/each}
  </div>
</div>

<style>
  .words-experience {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 2rem;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
  }

  .page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
    animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    padding-bottom: 3rem;
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
    background: linear-gradient(135deg, #50C878 0%, #3CB371 100%);
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

  h4 {
    font-size: 1rem;
    font-weight: 600;
    color: white;
    margin: 0;
  }

  p {
    font-size: 1rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.85);
    margin: 0;
  }

  .page-intro {
    text-align: center;
    font-size: 1.0625rem;
  }

  /* Intro section */
  .intro-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(80, 200, 120, 0.1) 0%, rgba(80, 200, 120, 0.02) 100%);
    border: 1px solid rgba(80, 200, 120, 0.2);
    border-radius: 16px;
  }

  .concept-icon {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(80, 200, 120, 0.2);
    border-radius: 50%;
    font-size: 1.75rem;
    color: #50C878;
  }

  .intro-text {
    font-size: 1.125rem;
    text-align: center;
  }

  /* Key points */
  .key-points {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .key-point {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
  }

  .point-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(34, 211, 238, 0.15);
    border-radius: 10px;
    color: #22D3EE;
    flex-shrink: 0;
  }

  .point-content h4 {
    margin-bottom: 0.25rem;
  }

  .point-content p {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.7);
  }

  /* Example preview */
  .example-preview {
    text-align: center;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
  }

  .preview-label {
    margin-bottom: 0.75rem;
  }

  .letter-sequence {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 1.5rem;
  }

  .seq-letter {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(80, 200, 120, 0.2);
    border: 2px solid rgba(80, 200, 120, 0.4);
    border-radius: 10px;
    font-weight: 700;
    color: #50C878;
  }

  .seq-arrow {
    color: rgba(255, 255, 255, 0.4);
  }

  /* Letter comparison cards */
  .comparison-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .letter-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.25rem;
    border-radius: 16px;
  }

  .letter-card.alpha {
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 107, 107, 0.02) 100%);
    border: 1px solid rgba(255, 107, 107, 0.2);
  }

  .letter-card.beta {
    background: linear-gradient(135deg, rgba(78, 205, 196, 0.1) 0%, rgba(78, 205, 196, 0.02) 100%);
    border: 1px solid rgba(78, 205, 196, 0.2);
  }

  .letter-info {
    font-size: 0.875rem;
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
  }

  /* Pattern highlight */
  .pattern-highlight {
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    text-align: center;
  }

  .pattern-grid {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin: 1rem 0;
    flex-wrap: wrap;
  }

  .pattern-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
    padding: 0.75rem 1.25rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }

  .pattern-letter {
    font-weight: 700;
    font-size: 1.125rem;
    color: white;
  }

  .pattern-type {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }

  .pattern-type.pro {
    background: rgba(74, 158, 255, 0.2);
    color: #4A9EFF;
  }

  .pattern-type.anti {
    background: rgba(255, 74, 158, 0.2);
    color: #FF4A9E;
  }

  .pattern-type.hybrid {
    background: rgba(255, 230, 109, 0.2);
    color: #FFE66D;
  }

  .pattern-note {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
  }

  /* Word demo */
  .word-demo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .demo-controls {
    display: flex;
    gap: 0.75rem;
  }

  .control-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .control-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .control-btn.playing {
    background: rgba(34, 211, 238, 0.2);
    border-color: rgba(34, 211, 238, 0.4);
    color: #22D3EE;
  }

  /* Beat breakdown */
  .beat-breakdown {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
  }

  .beats-grid {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 0.75rem;
    flex-wrap: wrap;
  }

  .beat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.625rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid transparent;
    border-radius: 10px;
    transition: all 0.2s ease;
    min-width: 80px;
  }

  .beat-item.active {
    background: rgba(80, 200, 120, 0.15);
    border-color: rgba(80, 200, 120, 0.5);
  }

  .beat-num {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .beat-letter {
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
  }

  .beat-desc {
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.6);
  }

  /* Word examples grid */
  .word-examples-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .word-example {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
  }

  .example-note {
    font-size: 0.875rem;
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
  }

  /* Summary box */
  .summary-box {
    padding: 1.25rem;
    background: linear-gradient(135deg, rgba(80, 200, 120, 0.08) 0%, rgba(80, 200, 120, 0.02) 100%);
    border: 1px solid rgba(80, 200, 120, 0.2);
    border-radius: 12px;
  }

  .summary-box ul {
    margin: 0.75rem 0 0;
    padding-left: 1.25rem;
  }

  .summary-box li {
    font-size: 0.9375rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
    margin-bottom: 0.375rem;
  }

  /* Navigation */
  .nav-buttons {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .next-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
    padding: 1rem 2rem;
    background: linear-gradient(135deg, rgba(80, 200, 120, 0.3) 0%, rgba(60, 179, 113, 0.3) 100%);
    backdrop-filter: blur(20px);
    border: 2px solid rgba(80, 200, 120, 0.5);
    border-radius: 12px;
    color: white;
    font-size: 1.0625rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    min-height: 52px;
    margin-left: auto;
  }

  .next-button:hover {
    background: linear-gradient(135deg, rgba(80, 200, 120, 0.4) 0%, rgba(60, 179, 113, 0.4) 100%);
    border-color: rgba(80, 200, 120, 0.8);
    transform: translateY(-2px);
  }

  /* Progress indicator */
  .progress-indicator {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(12px);
    border-radius: 20px;
    z-index: 100;
  }

  .progress-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
  }

  .progress-dot.active {
    background: #50C878;
    transform: scale(1.25);
  }

  .progress-dot.completed {
    background: rgba(80, 200, 120, 0.5);
  }

  /* Quiz page */
  .quiz-page {
    max-width: 700px;
  }

  /* Responsive */
  @media (max-width: 600px) {
    .words-experience {
      padding: 1rem;
    }

    h2 {
      font-size: 1.5rem;
    }

    .nav-buttons {
      flex-direction: column;
    }

    .back-btn,
    .next-button {
      width: 100%;
      justify-content: center;
    }

    .comparison-section,
    .word-examples-grid {
      grid-template-columns: 1fr;
    }

    .letter-sequence {
      font-size: 1.25rem;
    }

    .seq-letter {
      width: 40px;
      height: 40px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .page {
      animation: none;
    }
  }
</style>
