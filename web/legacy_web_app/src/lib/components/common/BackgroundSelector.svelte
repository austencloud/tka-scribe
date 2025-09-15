<script lang="ts">
  import { BackgroundFactory } from "$legacyLib/components/Backgrounds/core/BackgroundFactory";
  import type { BackgroundType } from "$legacyLib/components/Backgrounds/types/types";
  import { getService } from "$legacyLib/core/di/serviceContext";
  import { SERVICE_TOKENS } from "$legacyLib/core/di/ServiceTokens";
  import type { BackgroundSystemFactory } from "$legacyLib/core/services/BackgroundSystem";
  import { createEventDispatcher, onMount } from "svelte";

  // Props
  export let activeBackground: BackgroundType = "snowfall";

  // Event dispatcher
  const dispatch = createEventDispatcher<{ change: BackgroundType }>();

  // Services
  let backgroundFactory: BackgroundSystemFactory;
  let backgroundService: any; // Using any for simplicity

  // Background options
  let availableBackgrounds: BackgroundType[] = [];
  let supportedBackgrounds: BackgroundType[] = [];

  onMount(() => {
    backgroundFactory = getService<BackgroundSystemFactory>(
      SERVICE_TOKENS.BACKGROUND_FACTORY
    );
    backgroundService = getService(SERVICE_TOKENS.BACKGROUND_SERVICE);

    // Available backgrounds (static list in legacy app)
    availableBackgrounds = ["snowfall", "nightSky"] as BackgroundType[];

    // Filter to only supported backgrounds using factory static method
    supportedBackgrounds = availableBackgrounds.filter((type) =>
      BackgroundFactory.isBackgroundSupported(type)
    );

    // Ensure active background is supported
    if (!supportedBackgrounds.includes(activeBackground)) {
      setBackground(supportedBackgrounds[0] || "snowfall");
    }
  });

  function setBackground(type: BackgroundType) {
    if (activeBackground !== type) {
      activeBackground = type;
      dispatch("change", type);
    }
  }

  // Function to get a user-friendly display name for each background
  function getDisplayName(type: BackgroundType): string {
    switch (type) {
      case "snowfall":
        return "Snowfall";
      case "nightSky":
        return "Night Sky";

      default:
        return type;
    }
  }
</script>

<div class="background-selector">
  <h3>Background</h3>
  <div class="options">
    {#each supportedBackgrounds as background}
      <button
        class:active={activeBackground === background}
        on:click={() => setBackground(background)}
      >
        {getDisplayName(background)}
      </button>
    {/each}
  </div>
</div>

<style>
  .background-selector {
    padding: 10px;
  }

  .options {
    display: flex;
    gap: 8px;
  }

  button {
    padding: 5px 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #f5f5f5;
    cursor: pointer;
  }

  button.active {
    background: #0056b3;
    color: white;
    border-color: #0056b3;
  }
</style>
