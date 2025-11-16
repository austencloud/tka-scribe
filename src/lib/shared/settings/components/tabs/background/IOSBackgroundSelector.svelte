<!--
  IOSBackgroundSelector.svelte - iOS-native background selection list

  Replaces the card grid with an iOS Settings-style list for selecting backgrounds.
  Uses native iOS patterns: list items, checkmarks, and subtle selection states.
-->
<script lang="ts">
  import type { BackgroundType } from "$shared";
  import { backgroundsConfig } from "./background-config";
  import IOSList from "../../IOSList.svelte";
  import IOSListItem from "../../IOSListItem.svelte";

  const { selectedBackground, onBackgroundSelect } = $props<{
    selectedBackground: BackgroundType;
    onBackgroundSelect: (type: BackgroundType) => void;
  }>();

  function handleBackgroundSelect(type: BackgroundType) {
    onBackgroundSelect(type);
  }
</script>

<div class="ios-background-selector">
  <IOSList title="ANIMATED BACKGROUNDS">
    {#each backgroundsConfig as background}
      <IOSListItem
        title={background.name}
        subtitle={background.description}
        icon={background.icon}
        accessory="checkmark"
        isSelected={selectedBackground === background.type}
        onSelect={() => handleBackgroundSelect(background.type)}
      />
    {/each}
  </IOSList>
</div>

<style>
  .ios-background-selector {
    width: 100%;
    padding: 0;
    /* iOS standard font */
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }
</style>
