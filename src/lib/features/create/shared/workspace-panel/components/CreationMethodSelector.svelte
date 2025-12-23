<!--
  CreationMethodSelector.svelte

  Onboarding tutorial for first-time Create module users.
  Sequential flow: Welcome → Assemble → Construct → Generate → Choose

  Users must view all methods before making their selection.
  After completing, users navigate freely with tabs.
-->
<script lang="ts">
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { BuildModeId } from "$lib/shared/foundation/ui/UITypes";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { onMount, onDestroy } from "svelte";
  import { fly, fade } from "svelte/transition";
  import type { EmblaCarouselType } from "embla-carousel";
  import emblaCarouselSvelte from "embla-carousel-svelte";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";

  let {
    onMethodSelected,
  }: {
    onMethodSelected: (method: BuildModeId) => void;
  } = $props();

  // Services
  let hapticService: IHapticFeedbackService | null = $state(null);

  // Refs for focus management
  let containerRef: HTMLDivElement | null = $state(null);
  let focusedChoiceIndex = $state(0);

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );

    // Add keyboard event listener
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
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
          // On choice step, navigate up in the list
          if (isOnChoiceStep) {
            event.preventDefault();
            focusedChoiceIndex = Math.max(0, focusedChoiceIndex - 1);
          }
          break;
        case "ArrowDown":
          // On choice step, navigate down in the list
          if (isOnChoiceStep) {
            event.preventDefault();
            focusedChoiceIndex = Math.min(
              methods.length - 1,
              focusedChoiceIndex + 1
            );
          }
          break;
        case "Enter":
        case " ":
          // On choice step, select the focused method
          if (isOnChoiceStep && methods[focusedChoiceIndex]) {
            event.preventDefault();
            selectMethod(methods[focusedChoiceIndex].id);
          }
          break;
        case "1":
        case "2":
        case "3":
          // Quick selection via number keys on choice step
          if (isOnChoiceStep) {
            const index = parseInt(event.key) - 1;
            if (methods[index]) {
              event.preventDefault();
              selectMethod(methods[index].id);
            }
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
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  // Reset choice step state when component unmounts
  onDestroy(() => {
    navigationState.setCreateTutorialOnChoiceStep(false);
  });

  // Tutorial steps: welcome + 3 methods + final choice
  const steps = [
    {
      type: "welcome" as const,
      icon: "fa-wand-sparkles",
      title: "Welcome to Create",
      subtitle: "Let's explore how you can build sequences",
      description:
        "TKA Scribe offers three different ways to create sequences. Each method is designed for different styles and skill levels.",
      color: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
    },
    {
      type: "method" as const,
      id: "assembler" as BuildModeId,
      icon: "fa-puzzle-piece",
      title: "Assemble",
      subtitle: "Build one hand at a time",
      description:
        "Perfect for beginners! Choose from just 6 options per hand to build sequences step by step.",
      features: [
        "6 simple choices per hand",
        "Visual hand path preview",
        "Great for learning",
      ],
      color: "#8b5cf6",
      recommendation: "Best for: New users",
    },
    {
      type: "method" as const,
      id: "constructor" as BuildModeId,
      icon: "fa-hammer",
      title: "Construct",
      subtitle: "Full manual control",
      description:
        "Access every pictograph option available. Filter by position, motion type, rotation, and more.",
      features: [
        "All pictograph options",
        "Advanced filtering",
        "Complete control",
      ],
      color: "#3b82f6",
      recommendation: "Best for: Precision work",
    },
    {
      type: "method" as const,
      id: "generator" as BuildModeId,
      icon: "fa-wand-magic-sparkles",
      title: "Generate",
      subtitle: "Auto-create sequences",
      description:
        "Let the system generate sequences based on your constraints. Set parameters and watch the magic happen.",
      features: [
        "Automatic generation",
        "Customizable constraints",
        "Instant inspiration",
      ],
      color: "#f59e0b",
      recommendation: "Best for: Exploration",
    },
    {
      type: "choice" as const,
      icon: "fa-rocket",
      title: "Ready to Start!",
      subtitle: "Choose your creation method",
      description:
        "You've seen all three methods. Pick the one that feels right for you. You can switch anytime using the tabs.",
      color: "linear-gradient(135deg, #10b981, #3b82f6)",
    },
  ];

  // Methods only (for final choice screen)
  const methods = steps.filter((s) => s.type === "method") as Array<{
    type: "method";
    id: BuildModeId;
    icon: string;
    title: string;
    subtitle: string;
    description: string;
    features: string[];
    color: string;
    recommendation: string;
  }>;

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

  function selectMethod(methodId: BuildModeId) {
    hapticService?.trigger("selection");
    onMethodSelected(methodId);
  }

  function skipTutorial() {
    hapticService?.trigger("light");
    onMethodSelected("assembler");
  }

  // Reactive values
  let step = $derived(steps[currentStep]!);
  let progress = $derived((currentStep / (steps.length - 1)) * 100);
  let isOnChoiceStep = $derived(step.type === "choice");
  let isOnLastMethodStep = $derived(currentStep === steps.length - 2);

  // Notify navigation state when user reaches the choice step
  // This triggers the sidebar tabs to animate in
  $effect(() => {
    navigationState.setCreateTutorialOnChoiceStep(isOnChoiceStep);
  });
</script>

<div
  class="tutorial-container"
  bind:this={containerRef}
  role="region"
  aria-label="Create module onboarding tutorial"
>
  <!-- Screen reader announcement for step changes -->
  <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
    Step {currentStep + 1} of {steps.length}: {step.title}
  </div>

  <!-- Progress bar -->
  <div
    class="progress-bar"
    role="progressbar"
    aria-valuenow={currentStep + 1}
    aria-valuemin={1}
    aria-valuemax={steps.length}
    aria-label="Tutorial progress"
  >
    <div class="progress-fill" style="width: {progress}%"></div>
  </div>

  <!-- Skip button -->
  <button
    class="skip-button"
    onclick={skipTutorial}
    aria-label="Skip tutorial and start with Assemble mode"
  >
    Skip <i class="fas fa-forward" aria-hidden="true"></i>
  </button>

  <!-- Embla carousel - same for mobile and desktop -->
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
                  style="background: {stepItem.color}"
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
                    >Use <kbd>←</kbd><kbd>→</kbd> arrow keys or click Next</span
                  >
                </p>
              </div>
            {:else if stepItem.type === "method"}
              <div class="slide-content method-slide">
                <div
                  class="slide-icon"
                  style="--method-color: {stepItem.color}"
                >
                  <i class="fas {stepItem.icon}" aria-hidden="true"></i>
                </div>
                <h1 class="slide-title">{stepItem.title}</h1>
                <p class="slide-subtitle">{stepItem.subtitle}</p>
                <p class="slide-description">{stepItem.description}</p>

                <ul
                  class="feature-list"
                  aria-label="Features of {stepItem.title}"
                >
                  {#each stepItem.features as feature}
                    <li>
                      <i class="fas fa-check" aria-hidden="true"></i>
                      {feature}
                    </li>
                  {/each}
                </ul>

                <span class="recommendation">{stepItem.recommendation}</span>
              </div>
            {:else if stepItem.type === "choice"}
              <div class="slide-content choice-slide">
                <div
                  class="slide-icon choice-icon"
                  style="background: {stepItem.color}"
                >
                  <i class="fas {stepItem.icon}" aria-hidden="true"></i>
                </div>
                <h1 class="slide-title">{stepItem.title}</h1>
                <p class="slide-subtitle">{stepItem.subtitle}</p>
                <p class="slide-description">{stepItem.description}</p>

                <!-- Method choice buttons -->
                <div
                  class="choice-buttons"
                  role="listbox"
                  aria-label="Choose a creation method"
                  aria-activedescendant="choice-{focusedChoiceIndex}"
                >
                  {#each methods as method, i}
                    <button
                      id="choice-{i}"
                      class="choice-button"
                      class:focused={focusedChoiceIndex === i}
                      style="--method-color: {method.color}; --button-index: {i}"
                      onclick={() => selectMethod(method.id)}
                      onmouseenter={() => (focusedChoiceIndex = i)}
                      in:fly={{ y: 20, delay: 100 + i * 80, duration: 300 }}
                      role="option"
                      aria-selected={focusedChoiceIndex === i}
                      aria-label="{method.title}: {method.subtitle}. Press {i +
                        1} for quick select."
                    >
                      <div class="choice-icon">
                        <i class="fas {method.icon}" aria-hidden="true"></i>
                      </div>
                      <div class="choice-info">
                        <span class="choice-name">{method.title}</span>
                        <span class="choice-hint">{method.subtitle}</span>
                      </div>
                      <i
                        class="fas fa-chevron-right choice-arrow"
                        aria-hidden="true"
                      ></i>
                    </button>
                  {/each}
                </div>
                <p class="keyboard-hint" aria-live="polite">
                  <kbd>↑</kbd><kbd>↓</kbd> to navigate · <kbd>Enter</kbd> to
                  select · <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> for quick pick
                </p>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- Navigation -->
    <nav class="navigation" aria-label="Tutorial navigation">
      <button
        class="nav-button"
        onclick={scrollPrev}
        disabled={!canScrollPrev}
        aria-label="Previous step"
      >
        <i class="fas fa-chevron-left" aria-hidden="true"></i>
      </button>

      <!-- Step dots with icons -->
      <div class="step-dots" role="tablist" aria-label="Tutorial steps">
        {#each steps as stepItem, index}
          <button
            class="dot"
            class:active={index === currentStep}
            class:visited={index < currentStep}
            style="--dot-color: {stepItem.type === 'welcome'
              ? '#6366f1'
              : stepItem.type === 'choice'
                ? '#10b981'
                : stepItem.color}"
            onclick={() => goToStep(index)}
            role="tab"
            aria-selected={index === currentStep}
            aria-label="{stepItem.title}, step {index + 1} of {steps.length}"
          >
            <i class="fas {stepItem.icon}" aria-hidden="true"></i>
          </button>
        {/each}
      </div>

      <!-- Next/Continue button (hidden on choice step) -->
      {#if !isOnChoiceStep}
        <button
          class="nav-button nav-next"
          class:primary={!isOnChoiceStep}
          onclick={scrollNext}
          disabled={!canScrollNext}
          aria-label={isOnLastMethodStep ? "Go to final choice" : "Next step"}
        >
          {#if isOnLastMethodStep}
            <span class="next-label">Choose</span>
          {:else}
            <span class="next-label">Next</span>
          {/if}
          <i class="fas fa-chevron-right" aria-hidden="true"></i>
        </button>
      {:else}
        <!-- Placeholder to keep layout balanced -->
        <div class="nav-button-placeholder" aria-hidden="true"></div>
      {/if}
    </nav>
  </div>
</div>

<style>
  /* Screen reader only - visually hidden but accessible */
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

  .tutorial-container {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
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
    background: linear-gradient(90deg, #8b5cf6, #3b82f6, #f59e0b, #10b981);
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

  /* Carousel Layout */
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
    box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
  }

  .method-slide .slide-icon {
    background: rgba(255, 255, 255, 0.05);
    color: var(--method-color);
    position: relative;
  }

  .method-slide .slide-icon::before {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--method-color);
    opacity: 0.15;
    border-radius: 1.5rem;
  }

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

  /* Show touch hint on touch devices, keyboard hint on others */
  .touch-hint {
    display: none;
  }

  .keyboard-nav-hint {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .keyboard-nav-hint kbd {
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

  /* Touch devices: show touch hint, hide keyboard hint */
  @media (hover: none) and (pointer: coarse) {
    .touch-hint {
      display: inline;
    }

    .keyboard-nav-hint {
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
    border: 2px solid color-mix(in srgb, var(--method-color) 40%, transparent);
    border-radius: 12px;
    cursor: pointer;
    transition: all 200ms ease;
    text-align: left;
    position: relative;
    overflow: hidden;
    animation: buttonPulse 2.5s ease-in-out infinite;
  }

  /* Subtle glow effect behind button */
  .choice-button::before {
    content: "";
    position: absolute;
    inset: -2px;
    background: radial-gradient(
      ellipse at center,
      color-mix(in srgb, var(--method-color) 25%, transparent),
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
      box-shadow: 0 0 0 0
        color-mix(in srgb, var(--method-color) 30%, transparent);
    }
    50% {
      transform: scale(1.02);
      box-shadow: 0 4px 20px
        color-mix(in srgb, var(--method-color) 25%, transparent);
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

  /* Focused state - highlight but keep animating */
  .choice-button.focused {
    background: rgba(255, 255, 255, 0.06);
    border-color: var(--method-color);
    box-shadow: 0 2px 16px
      color-mix(in srgb, var(--method-color) 25%, transparent);
  }

  /* Hover state - stop animation and show full highlight */
  .choice-button:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--method-color);
    transform: translateX(4px) scale(1.02);
    animation: none;
    box-shadow: 0 4px 24px
      color-mix(in srgb, var(--method-color) 35%, transparent);
  }

  .choice-button:hover::before {
    animation: none;
    opacity: 0;
  }

  .choice-button:focus-visible {
    outline: 2px solid var(--method-color);
    outline-offset: 2px;
  }

  .choice-icon {
    width: 3rem;
    height: 3rem;
    display: grid;
    place-items: center;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    font-size: 1.25rem;
    color: var(--method-color);
    flex-shrink: 0;
    position: relative;
  }

  .choice-icon::before {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--method-color);
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
    color: var(--method-color);
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
    color: var(--method-color);
    transform: translateX(8px);
    animation: none;
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

  /* Step dots with icons */
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

  /* Keyboard hint for accessibility */
  .keyboard-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1.25rem;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.35);
  }

  .keyboard-hint kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.5rem;
    padding: 0.125rem 0.375rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 4px;
    font-family: inherit;
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.6);
  }

  /* Hide keyboard hint on touch devices */
  @media (hover: none) and (pointer: coarse) {
    .keyboard-hint {
      display: none;
    }
  }

  /* Responsive adjustments */
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

    .choice-icon {
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

  /* Desktop - larger slide content */
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

    .choice-icon {
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
