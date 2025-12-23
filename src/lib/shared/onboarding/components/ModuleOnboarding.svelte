<!--
  ModuleOnboarding.svelte - Reusable per-module onboarding carousel

  Extracted from CreationMethodSelector pattern.
  Shows welcome + tab explanations + final choice step.

  Usage:
  <ModuleOnboarding
    moduleId="discover"
    moduleName="Discover"
    moduleIcon="fa-compass"
    moduleColor="#a855f7"
    welcomeTitle="Welcome to Discover"
    welcomeSubtitle="Explore the TKA community"
    welcomeDescription="Browse sequences from flow artists worldwide..."
    tabs={discoverTabs}
    onTabSelected={(tabId) => handleTabSelected(tabId)}
    onSkip={() => handleSkip()}
  />
-->
<script lang="ts">
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { onMount, onDestroy } from "svelte";
  import { fly } from "svelte/transition";
  import type { EmblaCarouselType } from "embla-carousel";
  import emblaCarouselSvelte from "embla-carousel-svelte";
  import type { TabInfo } from "../domain/types";

  interface Props {
    moduleId: string;
    moduleName: string;
    moduleIcon: string;
    moduleColor: string;
    welcomeTitle: string;
    welcomeSubtitle: string;
    welcomeDescription: string;
    tabs: TabInfo[];
    onTabSelected: (tabId: string) => void;
    onSkip?: () => void;
    onChoiceStepReached?: () => void;
  }

  const {
    moduleId,
    moduleName,
    moduleIcon,
    moduleColor,
    welcomeTitle,
    welcomeSubtitle,
    welcomeDescription,
    tabs,
    onTabSelected,
    onSkip,
    onChoiceStepReached,
  } = $props<Props>();

  // Services
  let hapticService: IHapticFeedbackService | null = $state(null);

  // Focus management for choice step
  let focusedChoiceIndex = $state(0);

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          scrollPrev();
          break;
        case "ArrowRight":
          event.preventDefault();
          scrollNext();
          break;
        case "ArrowUp":
          if (isOnChoiceStep) {
            event.preventDefault();
            focusedChoiceIndex = Math.max(0, focusedChoiceIndex - 1);
          }
          break;
        case "ArrowDown":
          if (isOnChoiceStep) {
            event.preventDefault();
            focusedChoiceIndex = Math.min(
              tabs.length - 1,
              focusedChoiceIndex + 1
            );
          }
          break;
        case "Enter":
        case " ":
          if (isOnChoiceStep && tabs[focusedChoiceIndex]) {
            event.preventDefault();
            selectTab(tabs[focusedChoiceIndex].id);
          }
          break;
        case "Home":
          event.preventDefault();
          goToStep(0);
          break;
        case "End":
          event.preventDefault();
          goToStep(steps.length - 1);
          break;
        default:
          // Number keys for quick selection
          const num = parseInt(event.key);
          if (isOnChoiceStep && num >= 1 && num <= tabs.length) {
            event.preventDefault();
            selectTab(tabs[num - 1].id);
          }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Build steps array: welcome + tabs + choice
  const steps = $derived([
    {
      type: "welcome" as const,
      icon: moduleIcon,
      title: welcomeTitle,
      subtitle: welcomeSubtitle,
      description: welcomeDescription,
      color: moduleColor,
    },
    ...tabs.map((tab) => ({
      type: "tab" as const,
      id: tab.id,
      icon: tab.icon,
      title: tab.title,
      subtitle: tab.subtitle,
      description: tab.description,
      features: tab.features,
      color: tab.color,
      recommendation: tab.recommendation,
    })),
    {
      type: "choice" as const,
      icon: "fa-rocket",
      title: "Ready to Start!",
      subtitle: `Choose where to begin in ${moduleName}`,
      description: "You can switch between tabs anytime using the navigation.",
      color: moduleColor,
    },
  ]);

  // Embla carousel state
  let emblaApi: EmblaCarouselType | undefined = $state();
  let currentStep = $state(0);
  let canScrollPrev = $state(false);
  let canScrollNext = $state(false);

  function onEmblaInit(event: CustomEvent<EmblaCarouselType>) {
    emblaApi = event.detail;
    emblaApi.on("select", onSelect);
    onSelect();
  }

  function onSelect() {
    if (!emblaApi) return;
    currentStep = emblaApi.selectedScrollSnap();
    canScrollPrev = emblaApi.canScrollPrev();
    canScrollNext = emblaApi.canScrollNext();
  }

  function scrollPrev() {
    hapticService?.trigger("light");
    emblaApi?.scrollPrev();
  }

  function scrollNext() {
    hapticService?.trigger("light");
    emblaApi?.scrollNext();
  }

  function goToStep(index: number) {
    hapticService?.trigger("light");
    emblaApi?.scrollTo(index);
  }

  function selectTab(tabId: string) {
    hapticService?.trigger("selection");
    onTabSelected(tabId);
  }

  function handleSkip() {
    hapticService?.trigger("light");
    // Skip defaults to first tab
    onSkip?.() ?? onTabSelected(tabs[0]?.id ?? "");
  }

  // Derived state
  const step = $derived(steps[currentStep]);
  const progress = $derived((currentStep / (steps.length - 1)) * 100);
  const isOnChoiceStep = $derived(step?.type === "choice");
  const isOnLastTabStep = $derived(currentStep === steps.length - 2);

  // Notify parent when choice step is reached (for tab visibility)
  let hasNotifiedChoiceStep = $state(false);
  $effect(() => {
    if (isOnChoiceStep && !hasNotifiedChoiceStep) {
      hasNotifiedChoiceStep = true;
      onChoiceStepReached?.();
    }
  });
</script>

<div
  class="module-onboarding"
  role="region"
  aria-label="{moduleName} module onboarding"
>
  <!-- Screen reader announcement -->
  <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
    Step {currentStep + 1} of {steps.length}: {step?.title}
  </div>

  <!-- Progress bar -->
  <div
    class="progress-bar"
    role="progressbar"
    aria-valuenow={currentStep + 1}
    aria-valuemin={1}
    aria-valuemax={steps.length}
  >
    <div class="progress-fill" style="width: {progress}%"></div>
  </div>

  <!-- Skip button -->
  <button class="skip-button" onclick={handleSkip}>
    Skip <i class="fas fa-forward" aria-hidden="true"></i>
  </button>

  <!-- Carousel -->
  <div class="carousel-layout">
    <div
      class="embla"
      use:emblaCarouselSvelte={{ options: { loop: false } }}
      onemblaInit={onEmblaInit}
    >
      <div class="embla__container">
        {#each steps as stepItem, index}
          <div class="embla__slide">
            {#if stepItem.type === "welcome"}
              <div class="slide-content welcome-slide">
                <div
                  class="slide-icon welcome-icon"
                  style="--icon-color: {stepItem.color}"
                >
                  <i class="fas {stepItem.icon}" aria-hidden="true"></i>
                </div>
                <h1 class="slide-title">{stepItem.title}</h1>
                <p class="slide-subtitle">{stepItem.subtitle}</p>
                <p class="slide-description">{stepItem.description}</p>
                <p class="swipe-hint">
                  <i class="fas fa-hand-pointer" aria-hidden="true"></i>
                  <span class="touch-hint">Swipe or tap Next to explore</span>
                  <span class="keyboard-nav-hint"
                    >Use <kbd>←</kbd><kbd>→</kbd> or click Next</span
                  >
                </p>
              </div>
            {:else if stepItem.type === "tab"}
              <div class="slide-content tab-slide">
                <div class="slide-icon" style="--tab-color: {stepItem.color}">
                  <i class="fas {stepItem.icon}" aria-hidden="true"></i>
                </div>
                <h1 class="slide-title">{stepItem.title}</h1>
                <p class="slide-subtitle">{stepItem.subtitle}</p>
                <p class="slide-description">{stepItem.description}</p>

                {#if stepItem.features?.length}
                  <ul class="feature-list">
                    {#each stepItem.features as feature}
                      <li>
                        <i class="fas fa-check" aria-hidden="true"></i>
                        {feature}
                      </li>
                    {/each}
                  </ul>
                {/if}

                {#if stepItem.recommendation}
                  <span class="recommendation">{stepItem.recommendation}</span>
                {/if}
              </div>
            {:else if stepItem.type === "choice"}
              <div class="slide-content choice-slide">
                <div
                  class="slide-icon choice-icon"
                  style="--icon-color: {stepItem.color}"
                >
                  <i class="fas {stepItem.icon}" aria-hidden="true"></i>
                </div>
                <h1 class="slide-title">{stepItem.title}</h1>
                <p class="slide-subtitle">{stepItem.subtitle}</p>
                <p class="slide-description">{stepItem.description}</p>

                <div
                  class="choice-buttons"
                  role="listbox"
                  aria-label="Choose a tab"
                >
                  {#each tabs as tab, i}
                    <button
                      id="choice-{i}"
                      class="choice-button"
                      class:focused={focusedChoiceIndex === i}
                      style="--tab-color: {tab.color}; --button-index: {i}"
                      onclick={() => selectTab(tab.id)}
                      onmouseenter={() => (focusedChoiceIndex = i)}
                      in:fly={{ y: 20, delay: 100 + i * 80, duration: 300 }}
                      role="option"
                      aria-selected={focusedChoiceIndex === i}
                    >
                      <div class="choice-icon">
                        <i class="fas {tab.icon}" aria-hidden="true"></i>
                      </div>
                      <div class="choice-info">
                        <span class="choice-name">{tab.title}</span>
                        <span class="choice-hint">{tab.subtitle}</span>
                      </div>
                      <i
                        class="fas fa-chevron-right choice-arrow"
                        aria-hidden="true"
                      ></i>
                    </button>
                  {/each}
                </div>

                {#if tabs.length <= 5}
                  <p class="keyboard-hint">
                    <kbd>↑</kbd><kbd>↓</kbd> to navigate · <kbd>Enter</kbd> to
                    select · {#each tabs as _, i}<kbd>{i + 1}</kbd>{/each} for quick
                    pick
                  </p>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- Navigation -->
    <nav class="navigation" aria-label="Onboarding navigation">
      <button
        class="nav-button"
        onclick={scrollPrev}
        disabled={!canScrollPrev}
        aria-label="Previous step"
      >
        <i class="fas fa-chevron-left" aria-hidden="true"></i>
      </button>

      <!-- Step dots -->
      <div class="step-dots" role="tablist">
        {#each steps as stepItem, index}
          <button
            class="dot"
            class:active={index === currentStep}
            class:visited={index < currentStep}
            style="--dot-color: {stepItem.color}"
            onclick={() => goToStep(index)}
            role="tab"
            aria-selected={index === currentStep}
            aria-label="{stepItem.title}, step {index + 1} of {steps.length}"
          >
            <i class="fas {stepItem.icon}" aria-hidden="true"></i>
          </button>
        {/each}
      </div>

      {#if !isOnChoiceStep}
        <button
          class="nav-button nav-next"
          class:primary={true}
          onclick={scrollNext}
          disabled={!canScrollNext}
        >
          <span class="next-label">{isOnLastTabStep ? "Choose" : "Next"}</span>
          <i class="fas fa-chevron-right" aria-hidden="true"></i>
        </button>
      {:else}
        <div class="nav-button-placeholder"></div>
      {/if}
    </nav>
  </div>
</div>

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .module-onboarding {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  /* Progress bar */
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
    background: linear-gradient(90deg, #8b5cf6, #3b82f6, #10b981);
    transition: width 300ms ease-out;
  }

  /* Skip button */
  .skip-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 10;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 180ms ease;
  }

  .skip-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
  }

  .skip-button i {
    font-size: 0.75rem;
  }

  /* Carousel */
  .carousel-layout {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding-top: 1rem;
  }

  .embla {
    flex: 1;
    overflow: hidden;
  }

  .embla__container {
    display: flex;
    height: 100%;
  }

  .embla__slide {
    flex: 0 0 100%;
    min-width: 0;
    padding: 0 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .slide-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 500px;
    width: 100%;
  }

  /* Icons */
  .slide-icon {
    width: 5rem;
    height: 5rem;
    display: grid;
    place-items: center;
    border-radius: 1.5rem;
    font-size: 2.5rem;
    color: white;
    margin-bottom: 1.25rem;
  }

  .welcome-icon,
  .choice-icon {
    background: var(--icon-color);
    box-shadow: 0 8px 32px
      color-mix(in srgb, var(--icon-color) 40%, transparent);
  }

  .tab-slide .slide-icon {
    background: rgba(255, 255, 255, 0.05);
    color: var(--tab-color);
    position: relative;
  }

  .tab-slide .slide-icon::before {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--tab-color);
    opacity: 0.15;
    border-radius: 1.5rem;
  }

  /* Text */
  .slide-title {
    font-size: clamp(1.5rem, 5vw, 2rem);
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    margin: 0 0 0.25rem;
  }

  .slide-subtitle {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.5);
    margin: 0 0 0.75rem;
  }

  .slide-description {
    font-size: 0.9375rem;
    color: rgba(255, 255, 255, 0.45);
    margin: 0 0 1rem;
    line-height: 1.5;
  }

  /* Swipe hint */
  .swipe-hint {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.3);
    margin-top: 1.5rem;
  }

  .swipe-hint i {
    animation: swipeHint 2s ease-in-out infinite;
  }

  .touch-hint {
    display: none;
  }

  .keyboard-nav-hint {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .keyboard-nav-hint kbd,
  .keyboard-hint kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25rem;
    padding: 0.125rem 0.25rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 3px;
    font-family: inherit;
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.5);
  }

  @media (hover: none) and (pointer: coarse) {
    .touch-hint {
      display: inline;
    }
    .keyboard-nav-hint,
    .keyboard-hint {
      display: none;
    }
  }

  @keyframes swipeHint {
    0%,
    100% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(8px);
    }
  }

  /* Feature list */
  .feature-list {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .feature-list li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9375rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .feature-list i {
    color: #10b981;
    font-size: 0.75rem;
  }

  .recommendation {
    font-size: 0.8125rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.4);
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 6px;
  }

  /* Choice slide */
  .choice-slide {
    max-width: 400px;
  }

  .choice-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    margin-top: 1rem;
  }

  .choice-button {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
    padding: 1rem 1.25rem;
    background: rgba(255, 255, 255, 0.04);
    border: 2px solid color-mix(in srgb, var(--tab-color) 40%, transparent);
    border-radius: 12px;
    cursor: pointer;
    transition: all 200ms ease;
    text-align: left;
    position: relative;
    overflow: hidden;
    animation: buttonPulse 2.5s ease-in-out infinite;
  }

  .choice-button::before {
    content: "";
    position: absolute;
    inset: -2px;
    background: radial-gradient(
      ellipse at center,
      color-mix(in srgb, var(--tab-color) 25%, transparent),
      transparent 70%
    );
    border-radius: 14px;
    opacity: 0;
    animation: glowPulse 2.5s ease-in-out infinite;
    z-index: -1;
  }

  @keyframes buttonPulse {
    0%,
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--tab-color) 30%, transparent);
    }
    50% {
      transform: scale(1.02);
      box-shadow: 0 4px 20px
        color-mix(in srgb, var(--tab-color) 25%, transparent);
    }
  }

  @keyframes glowPulse {
    0%,
    100% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
  }

  .choice-button.focused {
    background: rgba(255, 255, 255, 0.06);
    border-color: var(--tab-color);
    box-shadow: 0 2px 16px color-mix(in srgb, var(--tab-color) 25%, transparent);
  }

  .choice-button:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--tab-color);
    transform: translateX(4px) scale(1.02);
    animation: none;
    box-shadow: 0 4px 24px color-mix(in srgb, var(--tab-color) 35%, transparent);
  }

  .choice-button:hover::before {
    animation: none;
    opacity: 0;
  }

  .choice-button .choice-icon {
    width: 3rem;
    height: 3rem;
    display: grid;
    place-items: center;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    font-size: 1.25rem;
    color: var(--tab-color);
    flex-shrink: 0;
    position: relative;
  }

  .choice-button .choice-icon::before {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--tab-color);
    opacity: 0.12;
    border-radius: 10px;
  }

  .choice-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .choice-name {
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .choice-hint {
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.45);
  }

  .choice-arrow {
    color: var(--tab-color);
    font-size: 1rem;
    transition: all 200ms ease;
    animation: arrowBounce 1.25s ease-in-out infinite;
  }

  @keyframes arrowBounce {
    0%,
    100% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(6px);
    }
  }

  .choice-button:hover .choice-arrow {
    transform: translateX(8px);
    animation: none;
  }

  .keyboard-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1.25rem;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.35);
  }

  /* Navigation */
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
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 999px;
    color: rgba(255, 255, 255, 0.7);
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
    background: linear-gradient(135deg, #6366f1, #4f46e5);
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

  /* Step dots */
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
    border: 2px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 200ms ease;
  }

  .dot:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.7);
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

  /* Responsive */
  @media (max-width: 500px) {
    .skip-button {
      top: 0.75rem;
      right: 0.75rem;
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }

    .slide-icon {
      width: 4rem;
      height: 4rem;
      font-size: 2rem;
    }

    .feature-list li {
      font-size: 0.875rem;
    }

    .choice-button {
      padding: 0.875rem 1rem;
    }

    .choice-button .choice-icon {
      width: 2.5rem;
      height: 2.5rem;
      font-size: 1rem;
    }

    .choice-name {
      font-size: 0.9375rem;
    }

    .choice-hint {
      font-size: 0.75rem;
    }
  }

  @media (min-width: 900px) {
    .slide-content {
      max-width: 600px;
    }

    .slide-icon {
      width: 6rem;
      height: 6rem;
      font-size: 3rem;
      border-radius: 1.75rem;
    }

    .slide-title {
      font-size: 2.25rem;
    }

    .slide-description {
      font-size: 1.0625rem;
    }

    .feature-list li {
      font-size: 1rem;
    }

    .choice-slide {
      max-width: 450px;
    }

    .choice-button {
      padding: 1.125rem 1.5rem;
    }

    .choice-button .choice-icon {
      width: 3.5rem;
      height: 3.5rem;
      font-size: 1.5rem;
    }

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
