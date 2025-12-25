<!--
QuizFeedbackBanner - Feedback banner after answer
-->
<script lang="ts">
  let {
    isCorrect,
    correctMessage,
    incorrectMessage,
  }: {
    isCorrect: boolean;
    correctMessage: string;
    incorrectMessage: string;
  } = $props();
</script>

<div class="feedback-banner" class:correct={isCorrect}>
  <span class="feedback-text">
    {isCorrect ? correctMessage : incorrectMessage}
  </span>
</div>

<style>
  .feedback-banner {
    position: fixed;
    bottom: calc(var(--primary-nav-height, 64px) + 1rem);
    left: 50%;
    transform: translateX(-50%);
    padding: 0.75rem 1.25rem;
    background: rgba(239, 68, 68, 0.9);
    border-radius: 12px;
    text-align: center;
    animation: bannerFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    backdrop-filter: blur(8px);
    white-space: nowrap;
    z-index: 150;
  }

  .feedback-banner.correct {
    background: rgba(34, 197, 94, 0.9);
  }

  @keyframes bannerFadeIn {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  .feedback-text {
    color: white;
    font-size: 0.9375rem;
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  @media (min-width: 900px) {
    .feedback-banner {
      padding: 0.875rem 1.5rem;
    }

    .feedback-text {
      font-size: 1rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .feedback-banner {
      animation: none;
    }
  }
</style>
