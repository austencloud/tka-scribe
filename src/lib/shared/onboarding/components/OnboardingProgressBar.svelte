<!-- OnboardingProgressBar - Progress indicator for onboarding carousel -->
<script lang="ts">
  const { currentStep, totalSteps, progress } = $props<{
    currentStep: number;
    totalSteps: number;
    progress: number;
  }>();
</script>

<div
  class="progress-bar"
  role="progressbar"
  aria-valuenow={currentStep + 1}
  aria-valuemin={1}
  aria-valuemax={totalSteps}
>
  <div class="progress-fill" style="width: {progress}%"></div>
</div>

<style>
  .progress-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(255, 255, 255, 0.1);
    z-index: 10;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--theme-accent-strong), var(--semantic-info), var(--semantic-success));
    transition: width 300ms ease-out;
  }
</style>
