<!--
  IOSBackgroundCardGrid.svelte - iOS-native card grid for background selection

  Maintains your creative grid layout with iOS materials and behaviors.
  Combines visual appeal with authentic iOS design language.
-->
<script lang="ts">
  import type { BackgroundType } from "$shared";
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
    display: flex;
    flex-direction: column;
    container-type: inline-size; /* Use inline-size on mobile */
    container-name: background-card-grid;
    overflow: visible;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    flex: 1; /* Grow to fill available space */
    min-height: 0; /* Allow shrinking */
  }

  .card-grid {
    display: grid;
    width: 100%;
    align-content: center;
    justify-content: center;
    overflow: visible;
    margin: auto;

    /* Smart defaults - start with 2×3 for mobile */
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: clamp(12px, 2cqi, 16px);
    padding: clamp(8px, 1.5cqi, 16px);
    max-width: 95cqw;
    max-height: 95cqh;
  }

  /* Desktop: Enable size-based container queries */
  @media (min-width: 769px) {
    .ios-background-card-grid {
      height: 100%;
      container-type: size;
    }
  }

  /* === ADAPTIVE GRID LAYOUTS BASED ON ASPECT RATIO & SIZE === */

  /* Very narrow: Single column stack */
  @container (max-width: 320px) {
    .card-grid {
      grid-template-columns: 1fr;
      grid-template-rows: repeat(6, minmax(90px, 1fr));
      gap: 10px;
      padding: 8px;
    }
  }

  /* Narrow: 2 columns × 3 rows */
  @container (min-width: 321px) and (max-width: 550px) {
    .card-grid {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 12px;
      padding: 12px;
    }
  }

  /* === SMART ASPECT RATIO-BASED LAYOUTS (551px+) === */

  /* PORTRAIT orientation (taller than wide): 2 columns × 3 rows */
  @container (min-width: 551px) and (max-aspect-ratio: 1/1) {
    .card-grid {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: clamp(12px, 2.5cqi, 18px);
      padding: clamp(12px, 2cqi, 16px);
    }
  }

  /* LANDSCAPE orientation (wider than tall): 3 columns × 2 rows */
  @container (min-width: 551px) and (min-aspect-ratio: 1/1) {
    .card-grid {
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: clamp(14px, 2.5cqi, 20px);
      padding: clamp(12px, 2cqi, 16px);
    }
  }

  /* VERY WIDE landscape: 6 columns × 1 row (only when extremely wide) */
  @container (min-width: 1100px) and (min-aspect-ratio: 2.5/1) {
    .card-grid {
      grid-template-columns: repeat(6, 1fr);
      grid-template-rows: 1fr;
      gap: clamp(12px, 1.8cqi, 16px);
      padding: 12px;
      max-height: min(240px, 90cqh);
    }
  }

  /* Height-constrained landscape: Compact 3×2 */
  @container (max-height: 400px) and (min-width: 551px) and (min-aspect-ratio: 1/1) {
    .card-grid {
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 10px;
      padding: 10px;
      max-height: 92cqh;
    }
  }

  /* Very height-constrained: Force 6×1 if wide enough */
  @container (max-height: 300px) and (min-width: 900px) and (min-aspect-ratio: 2/1) {
    .card-grid {
      grid-template-columns: repeat(6, 1fr);
      grid-template-rows: 1fr;
      gap: 8px;
      padding: 8px;
      max-height: 95cqh;
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .card-grid {
      transition: none;
    }
  }
</style>
