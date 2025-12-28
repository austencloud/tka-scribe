<!-- OnboardingNavigation - Bottom navigation for onboarding carousel -->
<script lang="ts">
  interface StepInfo {
    icon: string;
    title: string;
    color: string;
  }

  const {
    moduleId,
    steps,
    currentStep,
    canScrollPrev,
    canScrollNext,
    isOnChoiceStep,
    isOnLastTabStep,
    onPrev,
    onNext,
    onGoToStep,
  } = $props<{
    moduleId: string;
    steps: StepInfo[];
    currentStep: number;
    canScrollPrev: boolean;
    canScrollNext: boolean;
    isOnChoiceStep: boolean;
    isOnLastTabStep: boolean;
    onPrev: () => void;
    onNext: () => void;
    onGoToStep: (index: number) => void;
  }>();
</script>

<nav class="navigation" aria-label="Onboarding navigation">
  <button
    class="nav-button"
    onclick={onPrev}
    disabled={!canScrollPrev}
    aria-label="Previous step"
  >
    <i class="fas fa-chevron-left" aria-hidden="true"></i>
  </button>

  <!-- Step dots -->
  <div class="step-dots" role="tablist" aria-label="Onboarding steps">
    {#each steps as stepItem, index}
      <button
        id="step-dot-{moduleId}-{index}"
        class="dot"
        class:active={index === currentStep}
        class:visited={index < currentStep}
        style="--dot-color: {stepItem.color}"
        onclick={() => onGoToStep(index)}
        role="tab"
        aria-selected={index === currentStep}
        aria-controls="step-panel-{moduleId}-{index}"
        tabindex={index === currentStep ? 0 : -1}
        aria-label="{stepItem.title}, step {index + 1} of {steps.length}"
      >
        <i class="fas {stepItem.icon}" aria-hidden="true"></i>
      </button>
    {/each}
  </div>

  {#if !isOnChoiceStep}
    <button
      class="nav-button nav-next primary"
      onclick={onNext}
      disabled={!canScrollNext}
    >
      <span class="next-label">{isOnLastTabStep ? "Choose" : "Next"}</span>
      <i class="fas fa-chevron-right" aria-hidden="true"></i>
    </button>
  {:else}
    <div class="nav-button-placeholder"></div>
  {/if}
</nav>

<style>
  .navigation {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1rem 0 1.5rem;
  }

  .nav-button {
    min-width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0 0.75rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--theme-stroke);
    border-radius: 999px;
    color: var(--theme-text-dim);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 180ms ease;
  }

  .nav-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    color: white;
  }

  .nav-button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .nav-button.primary {
    background: linear-gradient(135deg, var(--theme-accent), #4f46e5);
    border-color: transparent;
    color: white;
    padding: 0 1rem;
  }

  .nav-button.primary:hover:not(:disabled) {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  .next-label {
    font-weight: 500;
    font-size: 0.8125rem;
  }

  .nav-button-placeholder {
    width: 2.5rem;
    height: 2.5rem;
  }

  .step-dots {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .dot {
    width: 2.25rem;
    height: 2.25rem;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    border: 2px solid var(--theme-stroke);
    color: rgba(255, 255, 255, 0.75); /* WCAG AAA */
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 200ms ease;
  }

  .dot:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: var(--theme-text-dim);
  }

  .dot.visited {
    border-color: var(--dot-color);
    color: var(--dot-color);
    background: color-mix(in srgb, var(--dot-color) 15%, transparent);
  }

  .dot.active {
    background: var(--dot-color);
    border-color: var(--dot-color);
    color: white;
    transform: scale(1.1);
  }

  @media (min-width: 900px) {
    .dot {
      width: 2.5rem;
      height: 2.5rem;
      font-size: 0.875rem;
    }

    .nav-button {
      min-width: 3rem;
      height: 3rem;
    }

    .nav-button.primary {
      padding: 0 1.25rem;
    }

    .next-label {
      font-size: 0.875rem;
    }
  }
</style>
