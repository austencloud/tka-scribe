<!--
QuizPictographCard - Question pictograph display
-->
<script lang="ts">
  import Pictograph from "$lib/shared/pictograph/shared/components/Pictograph.svelte";
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";

  let {
    pictograph,
    showArrow = false,
  }: {
    pictograph: PictographData;
    showArrow?: boolean;
  } = $props();
</script>

<div class="pictograph-section">
  <div class="pictograph-card question-card">
    <Pictograph pictographData={pictograph} />
  </div>
  {#if showArrow}
    <div class="arrow-indicator">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </div>
  {/if}
</div>

<style>
  .pictograph-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    animation: pictographEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes pictographEntrance {
    from {
      opacity: 0;
      transform: scale(0.92) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .pictograph-card {
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border-radius: 14px;
    box-shadow:
      0 6px 24px rgba(0, 0, 0, 0.12),
      0 0 0 1px rgba(255, 255, 255, 0.08),
      0 0 60px -20px color-mix(in srgb, var(--theme-accent) 15%, transparent);
  }

  .question-card {
    border: 2px solid color-mix(in srgb, var(--theme-accent) 30%, transparent);
  }

  .arrow-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.4);
    animation: arrowPulse 2s ease-in-out infinite;
  }

  .arrow-indicator svg {
    width: 20px;
    height: 20px;
  }

  @keyframes arrowPulse {
    0%, 100% {
      opacity: 0.4;
      transform: translateY(0);
    }
    50% {
      opacity: 0.7;
      transform: translateY(3px);
    }
  }

  @media (min-width: 600px) {
    .pictograph-card {
      width: 160px;
      height: 160px;
      border-radius: 18px;
    }

    .arrow-indicator svg {
      width: 24px;
      height: 24px;
    }
  }

  @media (min-width: 900px) {
    .pictograph-card {
      width: 200px;
      height: 200px;
      border-radius: 20px;
      box-shadow:
        0 10px 40px rgba(0, 0, 0, 0.12),
        0 0 0 1px rgba(255, 255, 255, 0.06),
        0 0 100px -30px color-mix(in srgb, var(--theme-accent) 20%, transparent);
    }

    .arrow-indicator svg {
      width: 28px;
      height: 28px;
    }
  }

  @media (min-width: 1200px) {
    .pictograph-card {
      width: 240px;
      height: 240px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pictograph-section,
    .arrow-indicator {
      animation: none;
    }
  }
</style>
