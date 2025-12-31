<!--
QuizPictographButton - Answer button containing a pictograph
-->
<script lang="ts">
  import PictographContainer from "$lib/shared/pictograph/shared/components/PictographContainer.svelte";
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";

  let {
    pictograph,
    state,
    disabled,
    onclick,
  }: {
    pictograph: PictographData;
    state: "default" | "correct" | "incorrect" | "dimmed";
    disabled: boolean;
    onclick: () => void;
  } = $props();
</script>

<button
  class="answer-btn"
  class:correct={state === "correct"}
  class:incorrect={state === "incorrect"}
  class:dimmed={state === "dimmed"}
  {onclick}
  {disabled}
>
  <div class="pictograph-wrapper">
    <PictographContainer pictographData={pictograph} />
  </div>
  {#if state === "correct"}
    <span class="result-icon correct-icon">✓</span>
  {:else if state === "incorrect"}
    <span class="result-icon incorrect-icon">✗</span>
  {/if}
</button>

<style>
  .answer-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1;
    padding: 0.375rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1.5px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .answer-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: color-mix(in srgb, var(--theme-accent) 40%, transparent);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px
      color-mix(in srgb, var(--theme-accent) 20%, transparent);
  }

  .answer-btn:active:not(:disabled) {
    transform: translateY(-1px) scale(0.98);
  }

  .pictograph-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }

  .answer-btn.correct {
    background: rgba(34, 197, 94, 0.2);
    border-color: rgba(34, 197, 94, 0.6);
    animation: correctPulse 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes correctPulse {
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
    }
    50% {
      transform: scale(1.04);
      box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
    }
  }

  .answer-btn.incorrect {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.6);
    animation: incorrectShake 0.4s ease-out;
  }

  @keyframes incorrectShake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-5px); }
    40%, 80% { transform: translateX(5px); }
  }

  .answer-btn.dimmed {
    opacity: 0.35;
    cursor: default;
  }

  .answer-btn:disabled {
    cursor: default;
  }

  .result-icon {
    position: absolute;
    top: 6px;
    right: 6px;
    font-size: 0.9rem;
    font-weight: bold;
    animation: iconPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes iconPop {
    from {
      transform: scale(0);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .correct-icon {
    color: rgb(34, 197, 94);
  }

  .incorrect-icon {
    color: rgb(239, 68, 68);
  }

  @media (min-width: 600px) {
    .answer-btn {
      padding: 0.5rem;
      border-radius: 14px;
    }

    .pictograph-wrapper {
      border-radius: 10px;
    }
  }

  @media (min-width: 900px) {
    .answer-btn {
      padding: 0.625rem;
      border-radius: 16px;
    }

    .pictograph-wrapper {
      border-radius: 12px;
    }
  }

  @media (min-width: 1200px) {
    .answer-btn {
      padding: 0.75rem;
    }

    .pictograph-wrapper {
      border-radius: 14px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .answer-btn.correct,
    .answer-btn.incorrect,
    .result-icon {
      animation: none;
    }

    .answer-btn {
      transition:
        background 0.15s ease,
        border-color 0.15s ease;
    }
  }
</style>
