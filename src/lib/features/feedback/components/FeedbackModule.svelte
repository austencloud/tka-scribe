<!-- FeedbackModule - Main container for feedback functionality -->
<script lang="ts">
  import { navigationState } from "../../../shared/navigation/state/navigation-state.svelte";
  import { updateFeedbackContext } from "../state/feedback-context-tracker.svelte";
  import FeedbackSubmitTab from "./submit/FeedbackSubmitTab.svelte";
  import FeedbackManageTab from "./manage/FeedbackManageTab.svelte";

  // Track active tab for this module
  const activeTab = $derived(navigationState.activeTab);

  // Update context tracker whenever navigation changes
  $effect(() => {
    // Access reactive values to establish dependency
    const _module = navigationState.currentModule;
    const _tab = navigationState.activeTab;
    // Update the context tracker
    updateFeedbackContext();
  });
</script>

<div class="feedback-module">
  {#key activeTab}
    <div class="tab-panel">
      {#if activeTab === "submit"}
        <FeedbackSubmitTab />
      {:else if activeTab === "manage"}
        <FeedbackManageTab />
      {:else}
        <div class="placeholder">
          <i class="fas fa-comment-dots"></i>
          <h2>Feedback</h2>
          <p>Select a tab to get started</p>
        </div>
      {/if}
    </div>
  {/key}
</div>

<style>
  .feedback-module {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background: var(--background, #0a0a0f);
    color: var(--text-color, rgba(255, 255, 255, 0.9));
    position: relative;
    overflow: hidden;
  }

  .tab-panel {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 16px;
    opacity: 0.6;
  }

  .placeholder i {
    font-size: 48px;
    color: #10b981;
  }

  .placeholder h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }

  .placeholder p {
    margin: 0;
    font-size: 14px;
    opacity: 0.7;
  }
</style>
