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
    selectedBackground: BackgroundType,
    onBackgroundSelect: (type: BackgroundType) => void,
    orientation?: "portrait" | "landscape" | "square"
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
  }

  .card-grid {
    display: grid;
    width: 100%;
    height: 100%;
    align-content: center;
    justify-content: center;
    overflow: visible;

    /* Default: 2×2 grid for balanced layout */
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 16px; /* iOS standard spacing (matches Settings.app list item spacing) */
    max-width: min(900px, 92cqw);
    max-height: min(600px, 88cqh);
    margin: auto;
    padding: 12px; /* iOS standard container padding */
  }

  /* Ultra-narrow: 1 column - iOS exact spacing */
  @container (max-width: 280px) {
    .card-grid {
      grid-template-columns: 1fr;
      grid-template-rows: repeat(4, minmax(80px, 1fr));
      gap: 12px; /* iOS standard spacing */
      max-width: 100%;
      max-height: 100%;
      padding: 8px;
    }
  }

  /* Very narrow: 1 column × 4 rows - iOS spacing */
  @container (min-width: 281px) and (max-width: 400px) {
    .card-grid {
      grid-template-columns: 1fr;
      grid-template-rows: repeat(4, 1fr);
      gap: 12px;
      max-width: min(400px, 90cqw);
      max-height: 100%;
      padding: 12px;
    }
  }

  /* Small-medium: 2×2 grid - iOS spacing */
  @container (min-width: 401px) and (max-width: 500px) {
    .card-grid {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 12px;
      max-width: min(480px, 92cqw);
      max-height: min(480px, 90cqh);
      padding: 12px;
    }
  }

  /* Medium: 2×2 grid - iOS standard spacing (optimal for most cases) */
  @container (min-width: 501px) and (max-width: 800px) {
    .card-grid {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 16px;
      max-width: min(680px, 92cqw);
      max-height: min(560px, 88cqh);
      padding: 12px;
    }
  }

  /* Wide: 4 columns × 1 row - iOS spacing */
  @container (min-width: 801px) {
    .card-grid {
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: 1fr;
      gap: 20px; /* iOS larger spacing for wide layouts */
      max-width: 100%;
      max-height: min(280px, 82cqh);
      padding: 12px;
    }
  }

  /* Height-constrained: Force horizontal layout - iOS spacing */
  @container (max-height: 400px) and (min-width: 600px) {
    .card-grid {
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: 1fr;
      gap: 16px;
      max-height: min(240px, 88cqh);
      max-width: 100%;
      padding: 12px;
    }
  }

  /* Very height-constrained: 2×2 with compact spacing */
  @container (max-height: 350px) and (max-width: 599px) {
    .card-grid {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 12px;
      max-height: 92cqh;
      max-width: 92cqw;
      padding: 8px;
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .card-grid {
      transition: none;
    }
  }
</style>
