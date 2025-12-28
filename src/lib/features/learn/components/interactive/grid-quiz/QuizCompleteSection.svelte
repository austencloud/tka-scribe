<!--
QuizCompleteSection - Results display and actions
-->
<script lang="ts">
  let {
    score,
    totalQuestions,
    onRestart,
    onComplete,
  }: {
    score: number;
    totalQuestions: number;
    onRestart: () => void;
    onComplete: () => void;
  } = $props();

  const scorePercent = $derived((score / totalQuestions) * 100);

  const scoreEmoji = $derived(() => {
    if (scorePercent === 100) return "🏆";
    if (scorePercent >= 80) return "🌟";
    if (scorePercent >= 60) return "👍";
    return "📚";
  });

  const scoreMessage = $derived(() => {
    if (scorePercent === 100) return "Perfect! You're a Grid Master!";
    if (scorePercent >= 80) return "Excellent! You've got the grid down!";
    if (scorePercent >= 60) return "Good job! Keep practicing!";
    return "Keep learning! Review the lesson and try again.";
  });
</script>

<div class="quiz-section complete">
  <div class="complete-icon">{scoreEmoji()}</div>
  <h3 class="complete-title">Quiz Complete!</h3>
  <div class="score-display">
    <span class="score-value">{score}</span>
    <span class="score-separator">/</span>
    <span class="score-total">{totalQuestions}</span>
  </div>
  <p class="score-message">{scoreMessage()}</p>

  <div class="complete-actions">
    <button class="action-btn secondary" onclick={onRestart}>
      <i class="fa-solid fa-rotate" aria-hidden="true"></i>
      Try Again
    </button>
    <button class="action-btn primary" onclick={onComplete}>
      <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
      Continue
    </button>
  </div>
</div>

<style>
  .quiz-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .complete {
    padding: 2rem 1rem;
  }

  .complete-icon {
    font-size: 4rem;
    line-height: 1;
    margin-bottom: 0.5rem;
  }

  .complete-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--theme-text, #ffffff);
    margin: 0;
  }

  .score-display {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
    margin: 1rem 0;
  }

  .score-value {
    font-size: 3rem;
    font-weight: 800;
    color: var(--theme-accent, #4a9eff);
  }

  .score-separator {
    font-size: 1.5rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
  }

  .score-total {
    font-size: 1.5rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
  }

  .score-message {
    font-size: 1rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
    margin: 0 0 1.5rem;
    text-align: center;
  }

  .complete-actions {
    display: flex;
    gap: 1rem;
    width: 100%;
    max-width: 352px;
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.875rem 1.25rem;
    min-height: var(--min-touch-target);
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn.secondary {
    background: var(--theme-card-bg, rgba(0, 0, 0, 0.45));
    border: 1px solid var(--theme-stroke-strong, rgba(255, 255, 255, 0.15));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .action-btn.secondary:hover {
    background: var(--theme-card-hover-bg, rgba(0, 0, 0, 0.55));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.25));
  }

  .action-btn.primary {
    background: linear-gradient(135deg, rgba(74, 158, 255, 0.3), rgba(168, 85, 247, 0.3));
    border: 1px solid rgba(74, 158, 255, 0.4);
    color: white;
  }

  .action-btn.primary:hover {
    background: linear-gradient(135deg, rgba(74, 158, 255, 0.4), rgba(168, 85, 247, 0.4));
    border-color: rgba(74, 158, 255, 0.6);
    transform: translateY(-2px);
  }

  @media (max-width: 500px) {
    .complete-actions {
      flex-direction: column;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .quiz-section,
    .action-btn {
      animation: none;
      transition: none;
    }
  }
</style>
