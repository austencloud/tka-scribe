<!--
  SimpleBackgroundPicker.svelte - Simple preset background selector

  Clean, simple interface with beautiful preset gradients and solid colors.
  No custom builder - just click and select. Zero scrolling required.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "../../../../application/services/contracts/IHapticFeedbackService";
  import { resolve } from "../../../../inversify/di";
  import { TYPES } from "../../../../inversify/types";
  import { onMount } from "svelte";

  const {
    selectedType,
    backgroundColor,
    gradientColors,
    gradientDirection,
    onUpdate,
  } = $props<{
    selectedType: "solid" | "gradient";
    backgroundColor?: string;
    gradientColors?: string[];
    gradientDirection?: number;
    onUpdate: (settings: {
      type: "solid" | "gradient";
      color?: string;
      colors?: string[];
      direction?: number;
    }) => void;
  }>();

  // Services
  let hapticService: IHapticFeedbackService | null = null;

  onMount(async () => {
    hapticService = await resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Beautiful preset backgrounds (6 gradients + 2 solid colors = 8 total)
  interface PresetBackground {
    id: string;
    name: string;
    type: "solid" | "gradient";
    color?: string;
    colors?: string[];
    direction?: number;
    icon: string;
  }

  const presetBackgrounds: PresetBackground[] = [
    // Gradients - Beautiful, dynamic, accessibility-optimized with automatic glass morphism
    {
      id: "twilight",
      name: "Twilight",
      type: "gradient",
      colors: ["#4c1d95", "#7c3aed", "#c084fc"], // Deep violet → vibrant purple → bright lavender
      direction: 135,
      icon: '<i class="fas fa-cloud-moon"></i>',
    },
    {
      id: "ocean",
      name: "Ocean",
      type: "gradient",
      colors: ["#0c4a6e", "#0891b2", "#22d3ee"], // Deep ocean → teal → bright cyan
      direction: 135,
      icon: '<i class="fas fa-water"></i>',
    },
    {
      id: "sunset",
      name: "Sunset",
      type: "gradient",
      colors: ["#7f1d1d", "#dc2626", "#fb923c"], // Deep crimson → red → warm orange
      direction: 135,
      icon: '<i class="fas fa-sun"></i>',
    },
    {
      id: "forest",
      name: "Forest",
      type: "gradient",
      colors: ["#14532d", "#059669", "#34d399"], // Deep forest → emerald → bright mint
      direction: 135,
      icon: '<i class="fas fa-tree"></i>',
    },
    {
      id: "royal",
      name: "Royal",
      type: "gradient",
      colors: ["#1e3a8a", "#3b82f6", "#818cf8"], // Deep navy → royal blue → bright indigo
      direction: 135,
      icon: '<i class="fas fa-crown"></i>',
    },
    {
      id: "midnight",
      name: "Midnight",
      type: "gradient",
      colors: ["#0f172a", "#1e293b", "#475569"], // Deep night → slate → light stone
      direction: 135,
      icon: '<i class="fas fa-moon"></i>',
    },
    // Solid colors - Perfect for glass morphism
    {
      id: "pure-black",
      name: "Pure Black",
      type: "solid",
      color: "#000000",
      icon: '<i class="fas fa-circle"></i>',
    },
    {
      id: "charcoal",
      name: "Charcoal",
      type: "solid",
      color: "#18181b", // Rich charcoal gray
      icon: '<i class="fas fa-square"></i>',
    },
  ];

  // Determine which preset is currently selected
  const selectedPresetId = $derived(() => {
    const current = presetBackgrounds.find((preset) => {
      if (preset.type === "solid") {
        return selectedType === "solid" && preset.color === backgroundColor;
      } else {
        return (
          selectedType === "gradient" &&
          JSON.stringify(preset.colors) === JSON.stringify(gradientColors) &&
          preset.direction === gradientDirection
        );
      }
    });
    return current?.id || null;
  });

  function handlePresetSelect(preset: PresetBackground) {
    hapticService?.trigger("selection");

    if (preset.type === "solid") {
      onUpdate({ type: "solid", color: preset.color });
    } else {
      onUpdate({
        type: "gradient",
        colors: preset.colors,
        direction: preset.direction,
      });
    }
  }
</script>

<div class="simple-background-selector">
  <div class="background-grid">
    {#each presetBackgrounds as preset}
      <button
        class="background-card"
        class:selected={selectedPresetId() === preset.id}
        onclick={() => handlePresetSelect(preset)}
        onkeydown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handlePresetSelect(preset);
          }
        }}
        aria-label={`Select ${preset.name} background`}
        aria-pressed={selectedPresetId() === preset.id}
      >
        <!-- Background preview (the gradient/color itself) -->
        <div
          class="background-preview"
          style="background: {preset.type === 'solid'
            ? preset.color
            : `linear-gradient(${preset.direction}deg, ${preset.colors?.join(', ')})`}"
        ></div>

        <!-- Overlay with info -->
        <div class="card-overlay">
          <div class="card-icon">{@html preset.icon}</div>
          <div class="card-info">
            <h4 class="card-name">{preset.name}</h4>
          </div>

          <!-- Selection indicator -->
          {#if selectedPresetId() === preset.id}
            <div class="selection-indicator">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="color-mix(in srgb, var(--theme-accent, #6366f1) 20%, transparent)"
                  stroke="var(--theme-accent, #6366f1)"
                  stroke-width="2"
                />
                <path
                  d="M8 12l2 2 4-4"
                  stroke="var(--theme-accent, #6366f1)"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          {/if}
        </div>
      </button>
    {/each}
  </div>
</div>

<style>
  .simple-background-selector {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.5cqi 1.5cqw;
    container-type: size;
    overflow: hidden; /* NO SCROLLING */
    box-sizing: border-box;
  }

  .background-grid {
    display: grid;
    width: 100%;
    height: 100%;
    align-content: center;
    justify-content: center;
    overflow: hidden;
    box-sizing: border-box;

    /* Default: 2×4 grid (2 columns, 4 rows) for narrow containers */
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: 1.5cqi;
    margin: auto;
  }

  /* Medium containers: 4×2 grid (4 columns, 2 rows) */
  @container (min-width: 500px) {
    .background-grid {
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 2cqi;
    }
  }

  /* Wide containers: 4×2 grid with enhanced spacing */
  @container (min-width: 800px) {
    .background-grid {
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 2.5cqi;
    }
  }

  /* Height-constrained containers: Force tighter spacing */
  @container (max-height: 400px) {
    .background-grid {
      gap: 1cqi;
    }
  }

  .background-card {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 1.5cqi;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid rgba(255, 255, 255, 0.15);
    background: transparent;
    container-type: size;
    box-sizing: border-box;
  }

  .background-card:hover {
    transform: scale(1.05);
    border-color: color-mix(in srgb, var(--theme-accent, #6366f1) 60%, transparent);
    box-shadow: 0 0 20px color-mix(in srgb, var(--theme-accent, #6366f1) 40%, transparent);
  }

  .background-card:active {
    transform: scale(1);
  }

  .background-card.selected {
    border-color: var(--theme-accent, #6366f1);
    border-width: 3px;
    box-shadow: 0 0 24px color-mix(in srgb, var(--theme-accent, #6366f1) 60%, transparent);
  }

  .background-preview {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .card-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1cqi;
    padding: 2cqi;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0),
      rgba(0, 0, 0, 0.3)
    );
    z-index: 1;
    transition: background 0.3s ease;
  }

  .background-card:hover .card-overlay {
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.1),
      rgba(0, 0, 0, 0.5)
    );
  }

  .card-icon {
    /* Use clamp for intelligent sizing: min 24px, preferred 12cqi, max 52px */
    font-size: clamp(24px, 12cqi, 52px);
    color: white;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
  }

  /* Responsive icon sizing based on container dimensions */
  @container (min-width: 152px) and (min-height: 100px) {
    .card-icon {
      font-size: clamp(28px, 14cqi, 64px);
    }
  }

  @container (min-width: 200px) and (min-height: 120px) {
    .card-icon {
      font-size: clamp(32px, 16cqi, 72px);
    }
  }

  .card-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5cqi;
  }

  .card-name {
    /* Use clamp for intelligent sizing: min 11px, preferred 5cqi, max 20px */
    font-size: clamp(11px, 5cqi, 20px);
    font-weight: 700;
    color: white;
    margin: 0;
    text-align: center;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
    letter-spacing: 0.5px;
    line-height: 1.2;
  }

  /* Responsive text sizing based on container dimensions */
  @container (min-width: 152px) and (min-height: 100px) {
    .card-name {
      font-size: clamp(12px, 6cqi, 22px);
    }
  }

  @container (min-width: 200px) and (min-height: 120px) {
    .card-name {
      font-size: clamp(14px, 7cqi, 24px);
    }
  }

  .selection-indicator {
    position: absolute;
    top: 2cqi;
    right: 2cqi;
    z-index: 2;
    filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5));
  }

  .selection-indicator svg {
    /* Use clamp for intelligent sizing: min 20px, preferred 9cqi, max 32px */
    width: clamp(20px, 9cqi, 32px);
    height: clamp(20px, 9cqi, 32px);
  }

  /* Responsive selection indicator sizing */
  @container (min-width: 152px) and (min-height: 100px) {
    .selection-indicator svg {
      width: clamp(22px, 10cqi, 36px);
      height: clamp(22px, 10cqi, 36px);
    }
  }

  @container (min-width: 200px) and (min-height: 120px) {
    .selection-indicator svg {
      width: clamp(24px, 11cqi, 40px);
      height: clamp(24px, 11cqi, 40px);
    }
  }

  /* Accessibility: Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .background-card {
      transition: none;
    }

    .background-card:hover {
      transform: none;
    }

    .background-card:active {
      transform: none;
    }
  }
</style>
