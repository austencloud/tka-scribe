<script lang="ts">
  /**
   * ModeGrid - Responsive Bento grid for animation mode cards
   *
   * Displays all available animation modes in a responsive grid with staggered animations
   */

  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import ModeCard from "./ModeCard.svelte";
  import type { AnimateMode } from "$lib/features/animate/shared/state/animate-module-state.svelte";

  interface Props {
    onModeSelect: (mode: AnimateMode) => void;
  }

  let { onModeSelect }: Props = $props();

  // Animation visibility state
  let isVisible = $state(false);

  // Transition constants
  const DURATION = { normal: 200, emphasis: 280 };
  const STAGGER = { normal: 50 };
  const SLIDE = { sm: 8, md: 12 };

  // Mode definitions with metadata
  const modes = [
    {
      id: "single" as AnimateMode,
      icon: "fa-play",
      title: "Single",
      description: "Full-screen single sequence",
      slotCount: 1,
      gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", // Pink
    },
    {
      id: "mirror" as AnimateMode,
      icon: "fa-arrows-left-right",
      title: "Mirror",
      description: "Side-by-side mirrored copy",
      slotCount: 1,
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", // Purple
    },
    {
      id: "tunnel" as AnimateMode,
      icon: "fa-layer-group",
      title: "Tunnel",
      description: "Two sequences overlaid",
      slotCount: 2,
      gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", // Blue
    },
    {
      id: "grid" as AnimateMode,
      icon: "fa-grip",
      title: "Grid",
      description: "Multiple in grid layout",
      slotCount: 4,
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", // Orange
    },
  ];

  onMount(() => {
    setTimeout(() => {
      isVisible = true;
    }, 30);
  });
</script>

<div class="mode-grid-container">
  {#if isVisible}
    <h2 class="section-title" transition:fly={{ y: -SLIDE.sm, duration: DURATION.normal, easing: cubicOut }}>
      Choose Animation Mode
    </h2>

    <div class="mode-grid">
      {#each modes as mode, i (mode.id)}
        <div transition:fly={{ y: SLIDE.md, duration: DURATION.normal, delay: i * STAGGER.normal, easing: cubicOut }}>
          <ModeCard
            mode={mode.id}
            icon={mode.icon}
            title={mode.title}
            description={mode.description}
            slotCount={mode.slotCount}
            gradient={mode.gradient}
            onclick={() => onModeSelect(mode.id)}
          />
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .mode-grid-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
  }

  .section-title {
    margin: 0 0 24px;
    font-size: 1.75rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: -0.02em;
    text-align: center;
  }

  .mode-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    width: 100%;
  }

  /* Medium screens: 3 columns */
  @media (min-width: 640px) {
    .mode-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 18px;
    }
  }

  /* Large screens: 4 columns (single row for 4 modes) */
  @media (min-width: 900px) {
    .mode-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
  }

  /* Tablet: prefer 2 columns */
  @media (min-width: 640px) and (max-width: 899px) {
    .mode-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .mode-grid-container {
      padding: 16px;
    }

    .section-title {
      font-size: 1.5rem;
      margin-bottom: 20px;
    }
  }

  @media (max-width: 480px) {
    .mode-grid-container {
      padding: 12px;
    }

    .section-title {
      font-size: 1.25rem;
      margin-bottom: 16px;
    }

    .mode-grid {
      gap: 12px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .mode-grid-container {
      transition: none;
    }
  }
</style>
