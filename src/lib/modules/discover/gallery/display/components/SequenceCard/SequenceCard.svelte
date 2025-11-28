<!--
SequenceCard.svelte

Ultra-minimal card component for the Explore grid.
Clicking the card opens the sequence detail viewer.

Composed from smaller sub-components:
- SequenceCardMedia: Clean image/placeholder display
- SequenceCardFooter: Centered title with difficulty-based styling

All actions (favorite, edit, animate, delete) are in the detail panel.
Enhanced with Svelte 5 runes for reactive state management.
-->
<script lang="ts">
  import type { SequenceData } from "$shared";
  import SequenceCardMedia from "./SequenceCardMedia.svelte";
  import SequenceCardFooter from "./SequenceCardFooter.svelte";

  const {
    sequence,
    coverUrl = undefined,
    onPrimaryAction = () => {},
    selected = false,
  }: {
    sequence: SequenceData;
    coverUrl?: string;
    onPrimaryAction?: (sequence: SequenceData) => void;
    selected?: boolean;
  } = $props();

  // Extract image dimensions from metadata for layout shift prevention
  const imageDimensions = $derived({
    width: (sequence.metadata as any)?.width,
    height: (sequence.metadata as any)?.height,
  });

  function handlePrimaryAction() {
    onPrimaryAction(sequence);
  }

  const levelStyles: Record<number, { background: string; textColor: string }> =
    {
      1: {
        // White - Beginner (Clean, simple)
        background: `linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.98) 0%,
        rgba(250, 250, 250, 0.95) 30%,
        rgba(245, 245, 245, 0.92) 60%,
        rgba(235, 235, 235, 0.9) 100%
      )`,
        textColor: "#1f2937",
      },
      2: {
        // Silver - Intermediate
        background: `linear-gradient(
        135deg,
        rgba(220, 220, 225, 0.98) 0%,
        rgba(192, 192, 200, 0.95) 30%,
        rgba(169, 169, 180, 0.92) 60%,
        rgba(140, 140, 155, 0.9) 100%
      )`,
        textColor: "#1f2937",
      },
      3: {
        // Gold - Advanced
        background: `linear-gradient(
        135deg,
        rgba(255, 215, 0, 0.98) 0%,
        rgba(238, 201, 0, 0.95) 30%,
        rgba(218, 165, 32, 0.92) 60%,
        rgba(184, 134, 11, 0.9) 100%
      )`,
        textColor: "#1f2937",
      },
      4: {
        // Red - Expert
        background: `linear-gradient(
        135deg,
        rgba(255, 120, 120, 0.98) 0%,
        rgba(239, 68, 68, 0.95) 30%,
        rgba(220, 38, 38, 0.92) 60%,
        rgba(185, 28, 28, 0.9) 100%
      )`,
        textColor: "#ffffff",
      },
      5: {
        // Purple - Legendary
        background: `linear-gradient(
        135deg,
        rgba(216, 180, 254, 0.98) 0%,
        rgba(168, 85, 247, 0.95) 30%,
        rgba(147, 51, 234, 0.92) 60%,
        rgba(126, 34, 206, 0.9) 100%
      )`,
        textColor: "#ffffff",
      },
    };

  const difficultyToLevel: Record<string, number> = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    mythic: 4,
    legendary: 5,
  };

  const defaultStyle = {
    background: "linear-gradient(135deg, #1f2937, #111827)",
    textColor: "#f8fafc",
  };

  // Derived reactive values using $derived
  const sequenceLevel = $derived(
    sequence?.level ??
      difficultyToLevel[sequence?.difficultyLevel?.toLowerCase?.() ?? ""] ??
      0
  );

  const levelStyle = $derived(levelStyles[sequenceLevel] ?? defaultStyle);

  // Truncate title to 16 characters (excluding dashes)
  const displayTitle = $derived(() => {
    const word = sequence?.word ?? "";
    const withoutDashes = word.replace(/-/g, "");

    if (withoutDashes.length <= 16) {
      return word; // Return original including dashes
    }

    // Truncate to 16 non-dash characters
    let charCount = 0;
    let result = "";

    for (const char of word) {
      if (char === "-") {
        result += char;
      } else {
        if (charCount < 16) {
          result += char;
          charCount++;
        } else {
          break;
        }
      }
    }

    return result + "…";
  });
</script>

<button class="sequence-card" class:selected onclick={handlePrimaryAction}>
  <SequenceCardMedia
    {coverUrl}
    word={sequence.word}
    width={imageDimensions.width}
    height={imageDimensions.height}
  />

  <SequenceCardFooter title={displayTitle()} {levelStyle} />
</button>

<style>
  .sequence-card {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    background: rgba(8, 8, 12, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #fff;
    display: flex;
    flex-direction: column;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
    width: 100%; /* Fill grid cell width */
    height: 100%; /* Fill grid cell height */
    padding: 0; /* Remove default button padding */
    margin: 0; /* Remove default button margin */

    /* Enable container queries */
    container-type: inline-size;
    container-name: sequence-card;

    /* Make card clickable */
    cursor: pointer;
    /* Target only specific properties for smoother, faster animations */
    transition:
      transform 0.15s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1),
      border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .sequence-card:hover {
    /* Subtle scale instead of lift - more modern, less aggressive */
    transform: scale(1.02);
    /* Slightly enhanced shadow - much more subtle */
    box-shadow: 0 14px 44px rgba(0, 0, 0, 0.38);
    border-color: rgba(255, 255, 255, 0.12);
  }

  /* Active state - brief feedback on touch/mobile only */
  @media (hover: none) and (pointer: coarse) {
    .sequence-card:active {
      transform: scale(0.98);
      transition-duration: 0.1s;
    }
  }

  .sequence-card:focus {
    outline: 2px solid rgba(255, 255, 255, 0.4);
    outline-offset: 2px;
  }

  .sequence-card.selected {
    border-color: rgba(102, 126, 234, 0.8);
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.4);
  }
</style>
