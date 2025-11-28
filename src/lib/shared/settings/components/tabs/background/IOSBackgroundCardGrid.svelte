<!--
  IOSBackgroundCardGrid.svelte - iOS-native card grid for background selection

  Maintains your creative grid layout with iOS materials and behaviors.
  Combines visual appeal with authentic iOS design language.
-->
<script lang="ts">
  import { BackgroundType } from "../../../../background/shared/domain/enums/background-enums";
  import { backgroundsConfig } from "./background-config";
  import IOSBackgroundCard from "./IOSBackgroundCard.svelte";

  const {
    selectedBackground,
    onBackgroundSelect,
    orientation = "square",
  } = $props<{
    selectedBackground: BackgroundType;
    onBackgroundSelect: (type: BackgroundType) => void;
    orientation?: "portrait" | "landscape" | "square";
  }>();

  function handleBackgroundSelect(type: BackgroundType) {
    onBackgroundSelect(type);
  }
</script>

<div class="ios-background-card-grid">
  <div class="card-grid" data-orientation={orientation}>
    {#each backgroundsConfig as background}
      <IOSBackgroundCard
        {background}
        isSelected={selectedBackground === background.type}
        onSelect={handleBackgroundSelect}
        {orientation}
      />
    {/each}
  </div>
</div>

<style>
  .ios-background-card-grid {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    container-type: size;
    container-name: background-card-grid;
    overflow: visible;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    flex: 1;
    min-height: 0;
  }

  .card-grid {
    display: grid;
    width: 100%;
    height: 100%;
    overflow: visible;

    /* Smart defaults - start with 2×3 for mobile */
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: clamp(12px, 2.5cqi, 20px);
  }

  /* === ADAPTIVE GRID LAYOUTS BASED ON ASPECT RATIO & SIZE === */

  /* Very narrow: Single column stack */
  @container (max-width: 320px) {
    .card-grid {
      grid-template-columns: 1fr;
      grid-template-rows: repeat(6, 1fr);
      gap: clamp(8px, 2cqi, 14px);
    }
  }

  /* Narrow: 2 columns × 3 rows */
  @container (min-width: 321px) and (max-width: 550px) {
    .card-grid {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: clamp(10px, 2.5cqi, 16px);
    }
  }

  /* === SMART ASPECT RATIO-BASED LAYOUTS (551px+) === */

  /* PORTRAIT orientation (taller than wide): 2 columns × 3 rows */
  @container (min-width: 551px) and (max-aspect-ratio: 1/1) {
    .card-grid {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: clamp(12px, 2.5cqi, 20px);
    }
  }

  /* LANDSCAPE orientation (wider than tall): 3 columns × 2 rows */
  @container (min-width: 551px) and (min-aspect-ratio: 1/1) {
    .card-grid {
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: clamp(12px, 2.5cqi, 20px);
    }
  }

  /* VERY WIDE landscape: 6 columns × 1 row (only when extremely wide) */
  @container (min-width: 1100px) and (min-aspect-ratio: 2.5/1) {
    .card-grid {
      grid-template-columns: repeat(6, 1fr);
      grid-template-rows: 1fr;
      gap: clamp(14px, 2cqi, 24px);
    }
  }

  /* Height-constrained landscape: Compact 3×2 */
  @container (max-height: 400px) and (min-width: 551px) and (min-aspect-ratio: 1/1) {
    .card-grid {
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: clamp(10px, 2cqi, 16px);
    }
  }

  /* Very height-constrained: Force 6×1 if wide enough */
  @container (max-height: 300px) and (min-width: 900px) and (min-aspect-ratio: 2/1) {
    .card-grid {
      grid-template-columns: repeat(6, 1fr);
      grid-template-rows: 1fr;
      gap: clamp(8px, 1.5cqi, 14px);
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .card-grid {
      transition: none;
    }
  }
</style>
