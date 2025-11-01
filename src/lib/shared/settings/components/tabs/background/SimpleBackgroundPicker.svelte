<!--
  SimpleBackgroundPicker.svelte - Simple preset background selector

  Clean, simple interface with beautiful preset gradients and solid colors.
  No custom builder - just click and select. Zero scrolling required.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";

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
  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

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
    // Gradients
    {
      id: "twilight",
      name: "Twilight",
      type: "gradient",
      colors: ["#667eea", "#764ba2"],
      direction: 135,
      icon: '<i class="fas fa-cloud-moon"></i>',
    },
    {
      id: "ocean",
      name: "Ocean",
      type: "gradient",
      colors: ["#4facfe", "#00f2fe"],
      direction: 135,
      icon: '<i class="fas fa-water"></i>',
    },
    {
      id: "sunset",
      name: "Sunset",
      type: "gradient",
      colors: ["#f5576c", "#f093fb"],
      direction: 135,
      icon: '<i class="fas fa-sun"></i>',
    },
    {
      id: "forest",
      name: "Forest",
      type: "gradient",
      colors: ["#11998e", "#38ef7d"],
      direction: 135,
      icon: '<i class="fas fa-tree"></i>',
    },
    {
      id: "rose",
      name: "Rose",
      type: "gradient",
      colors: ["#eb3349", "#f45c43"],
      direction: 135,
      icon: '<i class="fas fa-heart"></i>',
    },
    {
      id: "midnight",
      name: "Midnight",
      type: "gradient",
      colors: ["#2c3e50", "#3498db"],
      direction: 135,
      icon: '<i class="fas fa-moon"></i>',
    },
    // Solid colors
    {
      id: "pure-black",
      name: "Pure Black",
      type: "solid",
      color: "#000000",
      icon: '<i class="fas fa-circle"></i>',
    },
    {
      id: "dark-slate",
      name: "Dark Slate",
      type: "solid",
      color: "#1a1a2e",
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
        style="background: {preset.type === 'solid'
          ? preset.color
          : `linear-gradient(${preset.direction}deg, ${preset.colors?.join(', ')})`}"
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
        <div class="background-preview"></div>

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
                  fill="rgba(99, 102, 241, 0.2)"
                  stroke="#6366f1"
                  stroke-width="2"
                />
                <path
                  d="M8 12l2 2 4-4"
                  stroke="#6366f1"
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
    padding: clamp(12px, 2cqi, 20px);
    container-type: size;
    overflow: hidden; /* NO SCROLLING */
  }

  .background-grid {
    display: grid;
    width: 100%;
    height: 100%;
    align-content: center;
    justify-content: center;
    overflow: hidden;

    /* Default: 2×4 grid (2 columns, 4 rows) for narrow containers */
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: clamp(8px, 1.5cqi, 14px);
    max-width: min(900px, 95cqw);
    max-height: min(700px, 95cqh);
    margin: auto;
  }

  /* Medium containers: 4×2 grid (4 columns, 2 rows) */
  @container (min-width: 500px) {
    .background-grid {
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: clamp(12px, 2.5cqi, 18px);
    }
  }

  /* Wide containers: 4×2 grid with enhanced spacing */
  @container (min-width: 800px) {
    .background-grid {
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: clamp(14px, 2.8cqi, 24px);
    }
  }

  /* Height-constrained containers: Force horizontal layout */
  @container (max-height: 400px) and (min-width: 600px) {
    .background-grid {
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: clamp(10px, 2cqi, 16px);
    }
  }

  .background-card {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: clamp(8px, 1.5cqi, 14px);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid rgba(255, 255, 255, 0.15);
    background: rgba(0, 0, 0, 0.2);
    container-type: size;

    /* Ensure reasonable aspect ratio and touch targets */
    aspect-ratio: 16 / 9;
    min-height: 70px;
    min-width: 70px;
  }

  .background-card:hover {
    transform: scale(1.05);
    border-color: rgba(99, 102, 241, 0.6);
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
  }

  .background-card:active {
    transform: scale(1);
  }

  .background-card.selected {
    border-color: #6366f1;
    border-width: 3px;
    box-shadow: 0 0 24px rgba(99, 102, 241, 0.6);
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
    gap: clamp(4px, 1cqi, 8px);
    padding: clamp(8px, 2cqi, 16px);
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.1),
      rgba(0, 0, 0, 0.4)
    );
    z-index: 1;
    transition: background 0.3s ease;
  }

  .background-card:hover .card-overlay {
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.2),
      rgba(0, 0, 0, 0.6)
    );
  }

  .card-icon {
    font-size: clamp(20px, 6cqi, 40px);
    color: white;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
  }

  .card-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(2px, 0.5cqi, 4px);
  }

  .card-name {
    font-size: clamp(12px, 3.5cqi, 20px);
    font-weight: 700;
    color: white;
    margin: 0;
    text-align: center;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
    letter-spacing: 0.5px;
  }

  .selection-indicator {
    position: absolute;
    top: clamp(6px, 2cqi, 12px);
    right: clamp(6px, 2cqi, 12px);
    z-index: 2;
    filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5));
  }

  .selection-indicator svg {
    width: clamp(20px, 6cqi, 32px);
    height: clamp(20px, 6cqi, 32px);
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
