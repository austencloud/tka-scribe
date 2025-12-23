<!--
GridConceptExperience - Fluid grid learning experience
Content animates in/out on a single page as user progresses.
Uses CSS animations with staggered delays for smooth, layout-stable animations.
-->
<script lang="ts">
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { onMount } from "svelte";
  import LessonGridDisplay from "./LessonGridDisplay.svelte";

  let { onComplete, onBack } = $props<{
    onComplete?: () => void;
    onBack?: () => void;
  }>();

  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  // Current step in the experience
  let step = $state(0);

  // Animation state - triggers CSS animations
  let animateIn = $state(false);

  // Point types for step 1
  const pointTypes = [
    { name: "Center Point", description: "The origin of all movement" },
    { name: "Hand Points", description: "Where your hands can be positioned" },
    { name: "Outer Points", description: "The four cardinal directions" },
    {
      name: "Layer 2 Points",
      description: "Diagonal positions between outer points",
    },
  ];

  onMount(() => {
    // Trigger entrance animations after mount
    requestAnimationFrame(() => {
      animateIn = true;
    });
  });

  function handleNext() {
    hapticService?.trigger("selection");
    // Reset animation state, change step, then re-animate
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
    } else {
      onBack?.();
    }
  }

  // Expose handleBack for parent to call
  export { handleBack };
</script>

<div class="grid-experience" class:animate-in={animateIn}>
  {#if step === 0}
    <!-- Step 0: Introduction - Centered layout -->
    <div class="step-content step-intro">
      <h1 class="title anim-item" style="--anim-order: 0">The Grid</h1>

      <p class="description anim-item" style="--anim-order: 1">
        The Kinetic Alphabet is based on a <strong>4-point grid</strong>.
      </p>

      <div class="grid-container anim-item" style="--anim-order: 2">
        <LessonGridDisplay type="diamond" size="large" />
      </div>

      <button
        class="next-button anim-item"
        style="--anim-order: 3"
        onclick={handleNext}
      >
        Next
      </button>
    </div>
  {:else if step === 1}
    <!-- Step 1: Point Types - Side-by-side layout -->
    <div class="step-content step-points">
      <h1 class="title anim-item" style="--anim-order: 0">The Grid</h1>

      <div class="split-layout">
        <!-- Left side: Text content -->
        <div class="points-explanation">
          <p class="description anim-item" style="--anim-order: 1">
            The grid is composed of <strong
              >four different types of points</strong
            >:
          </p>

          <ul class="point-types-list">
            {#each pointTypes as point, i}
              <li
                class="point-type-item anim-item"
                style="--anim-order: {2 + i}"
              >
                <span class="point-name">{point.name}</span>
                <span class="point-desc">{point.description}</span>
              </li>
            {/each}
          </ul>

          <button
            class="next-button anim-item"
            style="--anim-order: 6"
            onclick={handleNext}
          >
            Next
          </button>
        </div>

        <!-- Right side: Grid (larger) -->
        <div
          class="grid-container grid-side anim-item anim-slide-right"
          style="--anim-order: 0"
        >
          <LessonGridDisplay type="diamond" size="large" />
        </div>
      </div>
    </div>
  {:else}
    <!-- Future steps placeholder -->
    <div class="step-content">
      <h1 class="title anim-item" style="--anim-order: 0">The Grid</h1>
      <p class="description anim-item" style="--anim-order: 1">
        More content coming...
      </p>
      <button
        class="next-button anim-item"
        style="--anim-order: 2"
        onclick={handleNext}>Next</button
      >
    </div>
  {/if}
</div>

<style>
  .grid-experience {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    height: 100%;
    padding: var(--spacing-xl, 2rem);
    padding-top: var(--spacing-2xl, 3rem);
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* ============================================
     CSS Animation System
     Uses --anim-order custom property for staggered delays
     ============================================ */

  /* Animation items - start invisible */
  .anim-item {
    opacity: 0;
    transform: translateY(20px);
  }

  /* Slide from right variant */
  .anim-slide-right {
    transform: translateX(30px);
  }

  /* When animate-in class is on parent, animate children */
  .animate-in .anim-item {
    animation: fadeSlideUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: calc(var(--anim-order, 0) * 120ms);
  }

  .animate-in .anim-slide-right {
    animation: fadeSlideLeft 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: calc(var(--anim-order, 0) * 120ms);
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

  @keyframes fadeSlideLeft {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* ============================================
     Layout
     ============================================ */

  /* Title */
  .title {
    font-size: 2.5rem;
    font-weight: 800;
    color: white;
    margin: 0 0 var(--spacing-lg, 1.5rem) 0;
    text-align: center;
    letter-spacing: -0.02em;
    flex-shrink: 0;
  }

  /* Step content containers */
  .step-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xl, 2rem);
    width: 100%;
    flex: 1;
  }

  /* Step 0: Centered intro layout */
  .step-intro {
    max-width: 500px;
    justify-content: center;
  }

  /* Step 1: Has title + split layout below */
  .step-points {
    max-width: 900px;
    width: 100%;
  }

  /* Split layout for side-by-side content */
  .split-layout {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    gap: var(--spacing-2xl, 3rem);
    width: 100%;
  }

  /* Left side explanation panel */
  .points-explanation {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg, 1.5rem);
    flex: 1;
    max-width: 400px;
  }

  .points-explanation .description {
    text-align: left;
  }

  /* Point types list */
  .point-types-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md, 1rem);
  }

  .point-type-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: var(--spacing-md, 1rem);
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .point-name {
    font-size: 1.1rem;
    font-weight: 700;
    color: white;
  }

  .point-desc {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
  }

  /* Description text */
  .description {
    font-size: 1.25rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.85);
    margin: 0;
    text-align: center;
  }

  .description strong {
    color: white;
    font-weight: 700;
  }

  /* Grid container - base */
  .grid-container {
    width: 100%;
    max-width: 320px;
    flex-shrink: 0;
  }

  /* Grid on side (step 1) - larger */
  .grid-side {
    max-width: 340px;
    flex: 0 0 auto;
  }

  /* Next button */
  .next-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem 3rem;
    background: color-mix(in srgb, var(--theme-accent) 40%, transparent);
    backdrop-filter: blur(20px);
    border: 2px solid color-mix(in srgb, var(--theme-accent) 60%, transparent);
    border-radius: 12px;
    color: white;
    font-size: 1.125rem;
    font-weight: 700;
    cursor: pointer;
    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease;
    min-width: 160px;
  }

  .next-button:hover {
    background: color-mix(in srgb, var(--theme-accent) 50%, transparent);
    border-color: color-mix(in srgb, var(--theme-accent) 80%, transparent);
    box-shadow: 0 8px 24px
      color-mix(in srgb, var(--theme-accent) 30%, transparent);
  }

  .next-button:active {
    transform: scale(0.98);
  }

  /* ============================================
     Responsive
     ============================================ */
  @media (max-width: 768px) {
    .grid-experience {
      padding: var(--spacing-lg, 1.5rem);
      padding-top: var(--spacing-xl, 2rem);
    }

    .title {
      font-size: 2rem;
    }

    .description {
      font-size: 1.1rem;
    }

    .split-layout {
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-lg, 1.5rem);
    }

    .points-explanation {
      max-width: 100%;
      order: 2;
    }

    .points-explanation .description {
      text-align: center;
    }

    .grid-side {
      max-width: 260px;
      order: 1;
    }

    .grid-container {
      max-width: 280px;
    }

    .next-button {
      padding: 0.875rem 2.5rem;
      font-size: 1rem;
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

    .animate-in .anim-item,
    .animate-in .anim-slide-right {
      animation: none;
      opacity: 1;
      transform: none;
    }

    .next-button {
      transition: none;
    }
  }
</style>
