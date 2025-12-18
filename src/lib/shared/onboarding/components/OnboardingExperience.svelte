<!--
  OnboardingExperience - First-time user welcome walkthrough (simplified)

  3-step lightweight intro:
  1. Welcome to TKA Scribe (logo + tagline)
  2. Module overview grid (all 5 modules with icons)
  3. "Pick a module to start" - tap any to begin

  Detailed module explanations are now handled by per-module onboarding.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";

  interface Props {
    onComplete: (selectedModule?: string) => void;
    onSkip?: () => void;
  }

  const { onComplete, onSkip } = $props<Props>();

  let hapticService: IHapticFeedbackService | null = null;

  // Current step
  let step = $state(0);
  let animateIn = $state(false);

  // Total steps (simplified from 7 to 3)
  const TOTAL_STEPS = 3;

  // Module info for the grid
  const modules = [
    {
      id: "create",
      icon: "fa-wand-magic-sparkles",
      name: "Create",
      tagline: "Build sequences",
      color: "#8b5cf6",
    },
    {
      id: "discover",
      icon: "fa-compass",
      name: "Discover",
      tagline: "Explore community",
      color: "#06b6d4",
    },
    {
      id: "learn",
      icon: "fa-graduation-cap",
      name: "Learn",
      tagline: "Master notation",
      color: "#f59e0b",
    },
    {
      id: "compose",
      icon: "fa-play",
      name: "Compose",
      tagline: "Animate your flow",
      color: "#22c55e",
    },
    {
      id: "train",
      icon: "fa-bullseye",
      name: "Train",
      tagline: "Practice & track",
      color: "#ef4444",
    },
  ];

  onMount(() => {
    try {
      hapticService = resolve<IHapticFeedbackService>(
        TYPES.IHapticFeedbackService
      );
    } catch {
      // Haptics optional
    }

    // Trigger entrance animation
    requestAnimationFrame(() => {
      animateIn = true;
    });
  });

  function handleNext() {
    hapticService?.trigger("selection");

    if (step >= TOTAL_STEPS - 1) {
      // Last step - complete without module selection (user chose skip/next)
      onComplete();
      return;
    }

    // Animate out, change step, animate in
    animateIn = false;
    requestAnimationFrame(() => {
      step++;
      requestAnimationFrame(() => {
        animateIn = true;
      });
    });
  }

  function handleBack() {
    hapticService?.trigger("selection");

    if (step > 0) {
      animateIn = false;
      requestAnimationFrame(() => {
        step--;
        requestAnimationFrame(() => {
          animateIn = true;
        });
      });
    }
  }

  function handleSkip() {
    hapticService?.trigger("selection");
    onSkip?.() ?? onComplete();
  }

  function handleModuleSelect(moduleId: string) {
    hapticService?.trigger("selection");
    onComplete(moduleId);
  }

  // Progress percentage
  const progress = $derived(((step + 1) / TOTAL_STEPS) * 100);
</script>

<div class="onboarding" class:animate-in={animateIn}>
  <!-- Progress bar -->
  <div class="progress-bar">
    <div class="progress-fill" style="width: {progress}%"></div>
  </div>

  <!-- Skip button -->
  <button class="skip-button" onclick={handleSkip}>
    Skip intro
  </button>

  {#if step === 0}
    <!-- Step 0: Welcome -->
    <div class="step-content step-welcome">
      <div class="logo-container anim-item" style="--anim-order: 0">
        <i class="fas fa-infinity"></i>
      </div>

      <h1 class="title anim-item" style="--anim-order: 1">
        Welcome to TKA Scribe
      </h1>

      <p class="subtitle anim-item" style="--anim-order: 2">
        The visual language for flow arts
      </p>

      <p class="description anim-item" style="--anim-order: 3">
        TKA Scribe helps you <strong>create</strong>, <strong>learn</strong>,
        and <strong>share</strong> flow arts choreography using the Kinetic
        Alphabet notation system.
      </p>

      <button
        class="next-button anim-item"
        style="--anim-order: 4"
        onclick={handleNext}
      >
        Let's go <i class="fas fa-arrow-right"></i>
      </button>
    </div>
  {:else if step === 1}
    <!-- Step 1: Module overview -->
    <div class="step-content step-overview">
      <h1 class="title anim-item" style="--anim-order: 0">
        Five modules to explore
      </h1>

      <p class="subtitle anim-item" style="--anim-order: 1">
        Each module has its own purpose
      </p>

      <div class="modules-grid anim-item" style="--anim-order: 2">
        {#each modules as mod, i}
          <div class="module-card" style="--module-color: {mod.color}">
            <i class="fas {mod.icon}"></i>
            <span class="module-name">{mod.name}</span>
            <span class="module-tagline">{mod.tagline}</span>
          </div>
        {/each}
      </div>

      <div class="nav-buttons anim-item" style="--anim-order: 3">
        <button class="back-button" onclick={handleBack}>
          <i class="fas fa-arrow-left"></i>
        </button>
        <button class="next-button" onclick={handleNext}>
          Next <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  {:else if step === 2}
    <!-- Step 2: Pick a module to start -->
    <div class="step-content step-choice">
      <h1 class="title anim-item" style="--anim-order: 0">
        Where do you want to start?
      </h1>

      <p class="subtitle anim-item" style="--anim-order: 1">
        Tap a module to dive in
      </p>

      <div class="modules-choice anim-item" style="--anim-order: 2">
        {#each modules as mod, i}
          <button
            class="module-choice-btn"
            style="--module-color: {mod.color}; --anim-delay: {i * 50}ms"
            onclick={() => handleModuleSelect(mod.id)}
          >
            <div class="choice-icon">
              <i class="fas {mod.icon}"></i>
            </div>
            <div class="choice-text">
              <span class="choice-name">{mod.name}</span>
              <span class="choice-tagline">{mod.tagline}</span>
            </div>
          </button>
        {/each}
      </div>

      <button class="back-link anim-item" style="--anim-order: 3" onclick={handleBack}>
        <i class="fas fa-arrow-left"></i> Back
      </button>
    </div>
  {/if}

  <!-- Step indicator dots -->
  <div class="step-dots">
    {#each Array(TOTAL_STEPS) as _, i}
      <button
        class="dot"
        class:active={i === step}
        class:completed={i < step}
        onclick={() => {
          if (i !== step) {
            animateIn = false;
            requestAnimationFrame(() => {
              step = i;
              requestAnimationFrame(() => {
                animateIn = true;
              });
            });
          }
        }}
        aria-label="Go to step {i + 1}"
      ></button>
    {/each}
  </div>
</div>

<style>
  .onboarding {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    z-index: 10000;
    overflow-y: auto;
  }

  /* ============================================
     Progress Bar
     ============================================ */
  .progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(255, 255, 255, 0.1);
  }

  .progress-fill {
    height: 100%;
    background: var(--theme-accent-strong, #8b5cf6);
    transition: width 0.3s ease;
  }

  /* ============================================
     Skip Button
     ============================================ */
  .skip-button {
    position: fixed;
    top: 16px;
    right: 16px;
    padding: 8px 16px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .skip-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
    border-color: rgba(255, 255, 255, 0.3);
  }

  /* ============================================
     Animation System
     ============================================ */
  .anim-item {
    opacity: 0;
    transform: translateY(20px);
  }

  .animate-in .anim-item {
    animation: fadeSlideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: calc(var(--anim-order, 0) * 100ms);
  }

  @keyframes fadeSlideUp {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ============================================
     Step Content
     ============================================ */
  .step-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    max-width: 520px;
    width: 100%;
    text-align: center;
  }

  /* Logo */
  .logo-container {
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(
      in srgb,
      var(--theme-accent-strong, #8b5cf6) 15%,
      transparent
    );
    border-radius: 24px;
    font-size: 48px;
    color: var(--theme-accent-strong, #8b5cf6);
  }

  /* Title */
  .title {
    font-size: 1.75rem;
    font-weight: 800;
    color: white;
    margin: 0;
    letter-spacing: -0.02em;
  }

  /* Subtitle */
  .subtitle {
    font-size: 1.1rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }

  /* Description */
  .description {
    font-size: 1rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }

  .description strong {
    color: white;
    font-weight: 600;
  }

  /* ============================================
     Modules Grid (Overview Step)
     ============================================ */
  .modules-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    width: 100%;
    max-width: 400px;
  }

  /* First row: 3 items, second row: 2 items centered */
  .modules-grid .module-card:nth-child(4),
  .modules-grid .module-card:nth-child(5) {
    grid-column: span 1;
  }

  .module-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 16px 12px;
    background: color-mix(in srgb, var(--module-color) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--module-color) 25%, transparent);
    border-radius: 14px;
  }

  .module-card i {
    font-size: 24px;
    color: var(--module-color);
  }

  .module-name {
    font-size: 0.9rem;
    font-weight: 700;
    color: white;
  }

  .module-tagline {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
  }

  /* ============================================
     Module Choice Buttons (Final Step)
     ============================================ */
  .modules-choice {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    max-width: 360px;
  }

  .module-choice-btn {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px;
    background: color-mix(in srgb, var(--module-color) 10%, transparent);
    border: 2px solid color-mix(in srgb, var(--module-color) 30%, transparent);
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .module-choice-btn:hover {
    background: color-mix(in srgb, var(--module-color) 20%, transparent);
    border-color: color-mix(in srgb, var(--module-color) 50%, transparent);
    transform: translateX(4px);
  }

  .module-choice-btn:active {
    transform: scale(0.98) translateX(4px);
  }

  .choice-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--module-color) 20%, transparent);
    border-radius: 10px;
    font-size: 20px;
    color: var(--module-color);
    flex-shrink: 0;
  }

  .choice-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .choice-name {
    font-size: 1rem;
    font-weight: 700;
    color: white;
  }

  .choice-tagline {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .back-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.9rem;
    cursor: pointer;
    transition: color 0.2s ease;
    margin-top: 8px;
  }

  .back-link:hover {
    color: rgba(255, 255, 255, 0.8);
  }

  /* ============================================
     Navigation Buttons
     ============================================ */
  .nav-buttons {
    display: flex;
    gap: 12px;
    margin-top: 12px;
  }

  .next-button {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 28px;
    background: color-mix(
      in srgb,
      var(--btn-color, var(--theme-accent-strong, #8b5cf6)) 40%,
      transparent
    );
    border: 2px solid
      color-mix(
        in srgb,
        var(--btn-color, var(--theme-accent-strong, #8b5cf6)) 60%,
        transparent
      );
    border-radius: 12px;
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .next-button:hover {
    background: color-mix(
      in srgb,
      var(--btn-color, var(--theme-accent-strong, #8b5cf6)) 50%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--btn-color, var(--theme-accent-strong, #8b5cf6)) 80%,
      transparent
    );
    box-shadow: 0 8px 24px
      color-mix(
        in srgb,
        var(--btn-color, var(--theme-accent-strong, #8b5cf6)) 30%,
        transparent
      );
  }

  .next-button:active {
    transform: scale(0.98);
  }

  .back-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.12);
    color: white;
  }

  /* ============================================
     Step Dots
     ============================================ */
  .step-dots {
    position: fixed;
    bottom: 32px;
    display: flex;
    gap: 8px;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
  }

  .dot:hover {
    background: rgba(255, 255, 255, 0.4);
  }

  .dot.active {
    background: var(--theme-accent-strong, #8b5cf6);
    transform: scale(1.2);
  }

  .dot.completed {
    background: rgba(255, 255, 255, 0.5);
  }

  /* ============================================
     Responsive
     ============================================ */
  @media (max-width: 480px) {
    .onboarding {
      padding: 16px;
    }

    .logo-container {
      width: 80px;
      height: 80px;
      font-size: 36px;
    }

    .title {
      font-size: 1.5rem;
    }

    .subtitle {
      font-size: 1rem;
    }

    .description {
      font-size: 0.9rem;
    }

    .modules-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .module-card {
      padding: 14px 10px;
    }

    .module-card i {
      font-size: 20px;
    }

    .module-name {
      font-size: 0.8rem;
    }

    .module-tagline {
      font-size: 0.7rem;
    }

    .module-choice-btn {
      padding: 12px 14px;
    }

    .choice-icon {
      width: 40px;
      height: 40px;
      font-size: 18px;
    }

    .choice-name {
      font-size: 0.95rem;
    }

    .choice-tagline {
      font-size: 0.8rem;
    }

    .next-button {
      padding: 12px 24px;
      font-size: 1rem;
    }

    .skip-button {
      top: 12px;
      right: 12px;
      padding: 6px 12px;
      font-size: 0.8125rem;
    }
  }

  /* ============================================
     Reduced Motion
     ============================================ */
  @media (prefers-reduced-motion: reduce) {
    .anim-item {
      opacity: 1;
      transform: none;
    }

    .animate-in .anim-item {
      animation: none;
      opacity: 1;
      transform: none;
    }

    .progress-fill {
      transition: none;
    }
  }
</style>
