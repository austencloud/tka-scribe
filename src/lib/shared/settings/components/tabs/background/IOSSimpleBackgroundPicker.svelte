<!--
  IOSSimpleBackgroundPicker.svelte - iOS-native simple background selector

  Replaces the card grid with an iOS Settings-style list for selecting solid colors and gradients.
  Uses native iOS patterns: list items, color previews, and checkmarks.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import IOSList from "../../IOSList.svelte";

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
    // Gradients
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
    // Solid colors
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

<div class="ios-simple-background-picker">
  <IOSList title="BACKGROUND PRESETS">
    {#each presetBackgrounds as preset}
      <button
        class="ios-background-item"
        class:selected={selectedPresetId() === preset.id}
        onclick={() => handlePresetSelect(preset)}
        type="button"
      >
        <!-- Color/Gradient Preview -->
        <div
          class="background-preview-swatch"
          style="background: {preset.type === 'solid'
            ? preset.color
            : `linear-gradient(${preset.direction}deg, ${preset.colors?.join(', ')})`}"
          aria-hidden="true"
        ></div>

        <!-- Icon -->
        <div class="item-icon" aria-hidden="true">
          {@html preset.icon}
        </div>

        <!-- Text Content -->
        <div class="item-content">
          <span class="item-title">{preset.name}</span>
          <span class="item-subtitle"
            >{preset.type === "solid" ? "Solid Color" : "Gradient"}</span
          >
        </div>

        <!-- Checkmark -->
        <div class="item-accessory" aria-hidden="true">
          {#if selectedPresetId() === preset.id}
            <i class="fas fa-check checkmark"></i>
          {/if}
        </div>
      </button>
    {/each}
  </IOSList>
</div>

<style>
  .ios-simple-background-picker {
    width: 100%;
    padding: 0;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  /* iOS List Item - Custom for background picker */
  .ios-background-item {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 60px; /* Slightly taller for color preview */
    padding: 11px 16px;
    background: transparent;
    border: none;
    border-bottom: 0.33px solid rgba(60, 60, 67, 0.36);
    width: 100%;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.15s ease;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    position: relative;
  }

  .ios-background-item:last-child {
    border-bottom: none;
  }

  .ios-background-item:hover {
    background: rgba(120, 120, 128, 0.08);
  }

  .ios-background-item:active {
    background: rgba(120, 120, 128, 0.16);
    transition: background-color 0s;
  }

  .ios-background-item.selected {
    background: rgba(0, 122, 255, 0.06);
  }

  .ios-background-item.selected:hover {
    background: rgba(0, 122, 255, 0.1);
  }

  /* Focus State */
  .ios-background-item:focus-visible {
    outline: none;
    background: rgba(0, 122, 255, 0.1);
  }

  .ios-background-item:focus-visible::before {
    content: "";
    position: absolute;
    inset: 2px;
    border-radius: 6px;
    border: 2px solid #007aff;
    pointer-events: none;
  }

  /* Background Preview Swatch */
  .background-preview-swatch {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  /* Icon */
  .item-icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: rgba(235, 235, 245, 0.6);
  }

  /* Text Content */
  .item-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .item-title {
    font-size: 17px;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: -0.41px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-subtitle {
    font-size: 15px;
    font-weight: 400;
    color: rgba(235, 235, 245, 0.6);
    letter-spacing: -0.24px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Accessory (Checkmark) */
  .item-accessory {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
  }

  .checkmark {
    font-size: 17px;
    color: #007aff;
    font-weight: 600;
  }

  /* Light Mode */
  @media (prefers-color-scheme: light) {
    .ios-background-item {
      border-bottom: 0.33px solid rgba(60, 60, 67, 0.36);
    }

    .ios-background-item:hover {
      background: rgba(120, 120, 128, 0.08);
    }

    .ios-background-item:active {
      background: rgba(120, 120, 128, 0.16);
    }

    .ios-background-item.selected {
      background: rgba(0, 122, 255, 0.06);
    }

    .ios-background-item.selected:hover {
      background: rgba(0, 122, 255, 0.1);
    }

    .item-icon {
      color: rgba(60, 60, 67, 0.6);
    }

    .item-title {
      color: rgba(0, 0, 0, 0.95);
    }

    .item-subtitle {
      color: rgba(60, 60, 67, 0.6);
    }

    .background-preview-swatch {
      border: 2px solid rgba(0, 0, 0, 0.2);
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .ios-background-item {
      transition: none;
    }
  }

  /* High Contrast */
  @media (prefers-contrast: high) {
    .ios-background-item {
      border-bottom: 0.5px solid rgba(255, 255, 255, 0.4);
    }

    .item-icon,
    .item-title {
      color: rgba(255, 255, 255, 0.95);
    }

    .item-subtitle {
      color: rgba(255, 255, 255, 0.7);
    }

    .checkmark {
      color: #0a84ff;
    }

    .background-preview-swatch {
      border: 2px solid rgba(255, 255, 255, 0.4);
    }
  }

  @media (prefers-contrast: high) and (prefers-color-scheme: light) {
    .ios-background-item {
      border-bottom: 0.5px solid rgba(0, 0, 0, 0.4);
    }

    .item-icon,
    .item-title {
      color: rgba(0, 0, 0, 0.95);
    }

    .item-subtitle {
      color: rgba(0, 0, 0, 0.7);
    }

    .background-preview-swatch {
      border: 2px solid rgba(0, 0, 0, 0.4);
    }
  }
</style>
