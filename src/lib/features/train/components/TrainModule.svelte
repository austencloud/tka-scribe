<!--
  TrainModule.svelte - Root Train Module Component

  Manages tab navigation between Practice, Challenges, and Progress tabs.
  Syncs with global navigation state and provides smooth transitions.
-->
<script lang="ts">
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import { fade } from "svelte/transition";
  import type { Section } from "$lib/shared/navigation/domain/types";

  import PracticePanel from "./practice/PracticePanel.svelte";
  import ProgressPanel from "./progress/ProgressPanel.svelte";
  import ChallengesPanel from "./challenges/ChallengesPanel.svelte";

  type TrainSection = "practice" | "challenges" | "progress";
  let activeSection = $state<TrainSection>("practice");

  // Sync with navigation state
  $effect(() => {
    const navTab = navigationState.activeTab;
    if (navTab && ["practice", "challenges", "progress"].includes(navTab)) {
      const newSection = navTab as TrainSection;
      if (newSection !== activeSection) {
        // Use View Transitions API if available
        if (document.startViewTransition) {
          document.startViewTransition(() => {
            activeSection = newSection;
          });
        } else {
          activeSection = newSection;
        }
      }
    }
  });
</script>

<div class="train-module">
  {#key activeSection}
    <div class="section-panel" transition:fade={{ duration: 200 }}>
      {#if activeSection === "practice"}
        <PracticePanel />
      {:else if activeSection === "challenges"}
        <ChallengesPanel />
      {:else if activeSection === "progress"}
        <ProgressPanel />
      {/if}
    </div>
  {/key}
</div>

<style>
  .train-module {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: transparent;
  }

  .section-panel {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* Note: view-transition-name removed to avoid duplicates during {#key} transitions.
	   The component uses document.startViewTransition() which handles animations internally. */
</style>
