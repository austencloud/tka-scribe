<!--
  IOSSimpleBackgroundCardGrid.svelte - iOS-native cards for simple backgrounds

  Maintains the creative card UI with iOS materials for solid colors and gradients.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
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

  let hapticService: IHapticFeedbackService | null = null;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Beautiful preset backgrounds
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
    {
      id: "twilight",
      name: "Twilight",
      type: "gradient",
      colors: ["#4c1d95", "#7c3aed", "#c084fc"],
      direction: 135,
      icon: '<i class="fas fa-cloud-moon"></i>',
    },
    {
      id: "ocean",
      name: "Ocean",
      type: "gradient",
      colors: ["#0c4a6e", "#0891b2", "#22d3ee"],
      direction: 135,
      icon: '<i class="fas fa-water"></i>',
    },
    {
      id: "sunset",
      name: "Sunset",
      type: "gradient",
      colors: ["#7f1d1d", "#dc2626", "#fb923c"],
      direction: 135,
      icon: '<i class="fas fa-sun"></i>',
    },
    {
      id: "forest",
      name: "Forest",
      type: "gradient",
      colors: ["#14532d", "#059669", "#34d399"],
      direction: 135,
      icon: '<i class="fas fa-tree"></i>',
    },
    {
      id: "royal",
      name: "Royal",
      type: "gradient",
      colors: ["#1e3a8a", "#3b82f6", "#818cf8"],
      direction: 135,
      icon: '<i class="fas fa-crown"></i>',
    },
    {
      id: "midnight",
      name: "Midnight",
      type: "gradient",
      colors: ["#0f172a", "#1e293b", "#475569"],
      direction: 135,
      icon: '<i class="fas fa-moon"></i>',
    },
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
      color: "#18181b",
      icon: '<i class="fas fa-square"></i>',
    },
  ];

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

<div class="ios-simple-card-grid">
  <div class="card-grid">
    {#each presetBackgrounds as preset}
      <button
        class="ios-simple-card"
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
        <!-- Background preview -->
        <div
          class="card-preview"
          style="background: {preset.type === 'solid'
            ? preset.color
            : `linear-gradient(${preset.direction}deg, ${preset.colors?.join(', ')})`}"
        ></div>

        <!-- iOS glass morphism overlay -->
        <div class="card-overlay">
          <!-- svelte-ignore svelte/no-at-html-tags -->
          <div class="card-icon">{@html preset.icon}</div>
          <div class="card-name">{preset.name}</div>

          <!-- iOS checkmark -->
          {#if selectedPresetId() === preset.id}
            <div class="ios-checkmark">
              <i class="fas fa-check"></i>
            </div>
          {/if}
        </div>
      </button>
    {/each}
  </div>
</div>

<style>
  .ios-simple-card-grid {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: clamp(8px, 2cqi, 16px);
    container-type: size;
    overflow: visible;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  .card-grid {
    display: grid;
    width: 100%;
    height: 100%;
    align-content: center;
    justify-content: center;
    overflow: visible;

    /* Default: 2×4 grid - iOS spacing */
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: 12px; /* iOS standard spacing */
    margin: auto;
  }

  /* Medium: 4×2 grid - iOS spacing */
  @container (min-width: 500px) {
    .card-grid {
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 16px; /* iOS standard spacing for wider layouts */
    }
  }

  /* Wide: 4×2 grid - iOS enhanced spacing */
  @container (min-width: 800px) {
    .card-grid {
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 20px; /* iOS larger spacing for very wide layouts */
    }
  }

  /* Height-constrained: compact iOS spacing */
  @container (max-height: 400px) {
    .card-grid {
      gap: 12px; /* iOS compact spacing */
    }
  }

  /* iOS-native card - Pixel Perfect */
  .ios-simple-card {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 72px; /* iOS comfortable touch target */
    border-radius: 12px; /* iOS exact medium corner radius */
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.36, 0.66, 0.04, 1); /* iOS spring */
    /* iOS hairline border */
    border: 0.33px solid rgba(255, 255, 255, 0.16);
    background: transparent;
    container-type: size;
    /* iOS precise shadow */
    box-shadow:
      0 3px 12px rgba(0, 0, 0, 0.12),
      0 1px 3px rgba(0, 0, 0, 0.08);
    padding: 0;
  }

  .ios-simple-card:hover {
    transform: translateY(-1px) scale(1.01); /* iOS subtle lift */
    border-color: rgba(255, 255, 255, 0.22);
    box-shadow:
      0 6px 18px rgba(0, 0, 0, 0.14),
      0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .ios-simple-card:active {
    transform: scale(0.98);
    transition-duration: 0.1s; /* iOS immediate feedback */
  }

  /* Selected - iOS subtle tint - Pixel Perfect */
  .ios-simple-card.selected {
    background: rgba(0, 122, 255, 0.06); /* Exact iOS selection tint */
    border-color: rgba(0, 122, 255, 0.28);
    box-shadow:
      0 4px 14px rgba(0, 122, 255, 0.12),
      0 1px 3px rgba(0, 122, 255, 0.08),
      inset 0 0 0 0.5px rgba(0, 122, 255, 0.1);
  }

  .ios-simple-card.selected:hover {
    background: rgba(0, 122, 255, 0.1);
    transform: translateY(-1px) scale(1.01);
  }

  /* Focus */
  .ios-simple-card:focus-visible {
    outline: 2px solid #007aff;
    outline-offset: 2px;
  }

  .card-preview {
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
    gap: clamp(4px, 1.5cqi, 8px);
    padding: clamp(8px, 2.5cqi, 14px);
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0),
      rgba(0, 0, 0, 0.3)
    );
    backdrop-filter: blur(4px) saturate(120%);
    -webkit-backdrop-filter: blur(4px) saturate(120%);
    z-index: 1;
    transition: background 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);
  }

  .ios-simple-card:hover .card-overlay {
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.1),
      rgba(0, 0, 0, 0.45)
    );
  }

  .card-icon {
    font-size: clamp(28px, 14cqi, 52px);
    color: white;
    text-shadow:
      0 2px 6px rgba(0, 0, 0, 0.6),
      0 0 4px rgba(0, 0, 0, 0.8);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
    transition: transform 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);
  }

  .ios-simple-card:hover .card-icon {
    transform: scale(1.05);
  }

  .card-name {
    font-size: clamp(14px, 5cqi, 17px); /* iOS body text */
    font-weight: 600; /* iOS semibold */
    letter-spacing: -0.41px; /* iOS tight tracking - exact spec */
    line-height: 22px; /* iOS line-height: 1.29411 ratio */
    color: white;
    text-align: center;
    text-shadow:
      0 2px 6px rgba(0, 0, 0, 0.8),
      0 0 3px rgba(0, 0, 0, 0.9);
  }

  /* iOS checkmark - Exact Size */
  .ios-checkmark {
    position: absolute;
    top: 8px; /* iOS standard inset */
    right: 8px; /* iOS standard inset */
    width: 24px; /* iOS exact checkmark badge size */
    height: 24px; /* iOS exact checkmark badge size */
    border-radius: 50%;
    background: #007aff; /* iOS system blue - exact hex */
    backdrop-filter: blur(10px) saturate(180%);
    -webkit-backdrop-filter: blur(10px) saturate(180%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px; /* iOS checkmark icon size */
    box-shadow:
      0 2px 6px rgba(0, 122, 255, 0.3),
      0 1px 2px rgba(0, 0, 0, 0.2);
    animation: ios-checkmark-pop 0.4s cubic-bezier(0.36, 0.66, 0.04, 1);
  }

  @keyframes ios-checkmark-pop {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* Light Mode */
  @media (prefers-color-scheme: light) {
    .ios-simple-card {
      border-color: rgba(0, 0, 0, 0.12);
    }

    .ios-simple-card:hover {
      border-color: rgba(0, 0, 0, 0.18);
    }

    .ios-simple-card.selected {
      background: rgba(0, 122, 255, 0.06);
      border-color: rgba(0, 122, 255, 0.3);
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .ios-simple-card,
    .card-icon,
    .card-overlay {
      transition: none;
    }

    .ios-simple-card:hover,
    .ios-simple-card:active {
      transform: none;
    }

    .ios-simple-card:hover .card-icon {
      transform: none;
    }

    .ios-checkmark {
      animation: none;
    }
  }

  /* High Contrast */
  @media (prefers-contrast: high) {
    .ios-simple-card {
      border: 2px solid rgba(255, 255, 255, 0.4);
    }

    .ios-simple-card.selected {
      border: 2px solid #0a84ff;
      background: rgba(10, 132, 255, 0.15);
    }
  }

  @media (prefers-contrast: high) and (prefers-color-scheme: light) {
    .ios-simple-card {
      border: 2px solid rgba(0, 0, 0, 0.4);
    }
  }
</style>
