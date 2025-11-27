<!--
ProgressHeader - Simplified progress visualization

Shows:
- Circular progress ring (100px)
- Percentage display inside ring
- Stage icon at bottom-right
-->
<script lang="ts">
  import type { LearningProgress } from "../domain";
  import { CONCEPT_CATEGORIES } from "../domain";

  let { progress }: { progress: LearningProgress } = $props();

  const progressPercent = $derived(Math.round(progress.overallProgress));

  // SVG circle calculations for 100px ring
  const circleRadius = 42;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = $derived(
    circumference * (1 - progressPercent / 100)
  );

  // Determine current stage based on progress
  const getCurrentStage = (
    percent: number
  ): { icon: string; color: string } => {
    if (percent < 25) return CONCEPT_CATEGORIES.foundation;
    if (percent < 50) return CONCEPT_CATEGORIES.letters;
    if (percent < 75) return CONCEPT_CATEGORIES.combinations;
    if (percent < 100) return CONCEPT_CATEGORIES.advanced;
    return { icon: "fa-trophy", color: "#FFD700" };
  };

  const currentStage = $derived(getCurrentStage(progressPercent));
</script>

<div class="progress-header">
  <div class="progress-ring-container">
    <svg class="progress-ring" viewBox="0 0 100 100">
      <!-- Gradient definition -->
      <defs>
        <linearGradient
          id="progressGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stop-color="#4A90E2" />
          <stop offset="50%" stop-color="#7B68EE" />
          <stop offset="100%" stop-color="#50C878" />
        </linearGradient>
      </defs>

      <!-- Background track -->
      <circle
        cx="50"
        cy="50"
        r={circleRadius}
        fill="none"
        stroke="rgba(255, 255, 255, 0.1)"
        stroke-width="6"
      />

      <!-- Progress arc -->
      <circle
        class="progress-arc"
        cx="50"
        cy="50"
        r={circleRadius}
        fill="none"
        stroke="url(#progressGradient)"
        stroke-width="6"
        stroke-linecap="round"
        stroke-dasharray={circumference}
        stroke-dashoffset={strokeDashoffset}
        transform="rotate(-90 50 50)"
      />
    </svg>

    <!-- Center content -->
    <div class="ring-center">
      <span class="percentage-value">{progressPercent}</span>
      <span class="percentage-symbol">%</span>
    </div>

    <!-- Stage badge -->
    <div class="stage-badge" style="--stage-color: {currentStage.color}">
      <span class="stage-icon"><i class="fa-solid {currentStage.icon}"></i></span>
    </div>
  </div>
</div>

<style>
  .progress-header {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    display: flex;
    justify-content: center;
  }

  .progress-ring-container {
    position: relative;
    width: 100px;
    height: 100px;
    flex-shrink: 0;
  }

  .progress-ring {
    width: 100%;
    height: 100%;
  }

  .progress-arc {
    transition: stroke-dashoffset 0.5s ease;
  }

  .ring-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: baseline;
    justify-content: center;
  }

  .percentage-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    line-height: 1;
  }

  .percentage-symbol {
    font-size: 0.75rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    margin-left: 1px;
  }

  .stage-badge {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 28px;
    height: 28px;
    background: rgba(0, 0, 0, 0.7);
    border: 2px solid var(--stage-color, #4a90e2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stage-icon {
    font-size: 0.875rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .progress-arc {
      transition: none;
    }
  }
</style>
