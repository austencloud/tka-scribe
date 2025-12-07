<!--
  IOSBackgroundCardGrid.svelte - iOS-native card grid for background selection

  Simplified responsive grid using auto-fit columns and intrinsic row heights
  so cards don't overflow their sections.
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
    display: block;
    overflow: visible;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  .card-grid {
    display: grid;
    width: 100%;
    overflow: visible;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    grid-auto-rows: minmax(140px, 1fr);
    gap: 16px;
    align-items: start;
  }

  @media (max-width: 640px) {
    .card-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-auto-rows: minmax(120px, 1fr);
      gap: 12px;
    }
  }

  @media (min-width: 1280px) {
    .card-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .card-grid {
      transition: none;
    }
  }
</style>
