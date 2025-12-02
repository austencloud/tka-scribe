<!--
  CollectTab.svelte - Personal Collect Interface

  Sections:
  - Library: User-created and saved sequences
  - Achievements: Progress, stats, and unlocked achievements
  - Challenges: Daily challenges and active quests

  Navigation via bottom tabs (mobile-first UX pattern)
-->
<script lang="ts">
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import AnimationSheetCoordinator from "$lib/shared/coordinators/AnimationSheetCoordinator.svelte";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import LibrarySection from "./components/LibrarySection.svelte";
  import AchievementsSection from "./components/AchievementsSection.svelte";
  import ChallengesSection from "./components/ChallengesSection.svelte";

  type CollectMode = "library" | "achievements" | "challenges";

  // Active mode synced with navigation state
  let activeMode = $state<CollectMode>("library");

  // Animation sheet state
  let showAnimator = $state<boolean>(false);
  let sequenceToAnimate = $state<SequenceData | null>(null);

  // Sync with navigation state
  $effect(() => {
    const section = navigationState.currentSection;
    if (
      section === "library" ||
      section === "achievements" ||
      section === "challenges"
    ) {
      activeMode = section;
    }
  });

  // Initialize on mount
  onMount(() => {
    // Set default mode if none persisted
    const section = navigationState.currentSection;
    if (
      !section ||
      (section !== "library" &&
        section !== "achievements" &&
        section !== "challenges")
    ) {
      navigationState.setCurrentSection("library");
    }
  });

  // Check if mode is active
  function isModeActive(mode: CollectMode): boolean {
    return activeMode === mode;
  }
</script>

<div class="collect-tab">
  <!-- Content area with smooth transitions -->
  <div class="content-container">
    {#key activeMode}
      <div class="mode-panel" transition:fade={{ duration: 200 }}>
        {#if isModeActive("library")}
          <LibrarySection />
        {:else if isModeActive("achievements")}
          <AchievementsSection />
        {:else if isModeActive("challenges")}
          <ChallengesSection />
        {/if}
      </div>
    {/key}
  </div>
</div>

<!-- Animation Sheet Coordinator -->
<AnimationSheetCoordinator
  sequence={sequenceToAnimate}
  bind:isOpen={showAnimator}
/>

<style>
  .collect-tab {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: transparent;
    color: var(--foreground, #ffffff);

    /* Enable container queries for responsive design */
    container-type: size;
    container-name: collection-tab;
  }

  /* Content container */
  .content-container {
    position: relative;
    flex: 1;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* Mode panels */
  .mode-panel {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
</style>
