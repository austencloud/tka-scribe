<script lang="ts">
  /**
   * ModuleRenderer
   * Domain: Module Content Rendering
   *
   * Responsibilities:
   * - Render active module content
   * - Handle module transitions with simple, clean fade
   * - Coordinate with child module components via callbacks
   * - Provide loading states
   */
  import { isModuleActive } from "../application/state/ui/ui-state.svelte";
  import { fade } from "svelte/transition";
  import AccountModule from "../../features/account/AccountModule.svelte";
  import AdminDashboard from "../../features/admin/components/AdminDashboard.svelte";
  import AnimateModule from "../../features/animate/AnimateModule.svelte";
  import TrainModule from "../../features/train/components/TrainModule.svelte";
  import CreateModule from "../../features/create/shared/components/CreateModule.svelte";
  import EditModule from "../../features/edit/EditModule.svelte";
  import LearnTab from "../../features/learn/LearnTab.svelte";
  import WordCardTab from "../../features/word-card/components/WordCardTab.svelte";
  import WriteTab from "../../features/write/components/WriteTab.svelte";
  import DiscoverModule from "../../features/discover/shared/components/DiscoverModule.svelte";
  import CommunityModule from "../../features/community/CommunityModule.svelte";

  interface Props {
    activeModule: string | null;
    isModuleLoading: boolean;
    onTabAccessibilityChange: (canAccess: boolean) => void;
    onCurrentWordChange: (word: string) => void;
    onLearnHeaderChange: (header: string) => void;
  }

  let {
    activeModule,
    isModuleLoading,
    onTabAccessibilityChange,
    onCurrentWordChange,
    onLearnHeaderChange,
  }: Props = $props();
</script>

{#if isModuleLoading}
  <!-- Loading state while module is being restored -->
  <div class="module-loading">
    <div class="loading-spinner"></div>
    <p>Loading...</p>
  </div>
{:else}
  <!-- Transition container for overlaying content -->
  <div class="transition-container">
    {#key activeModule}
      <div class="module-content" transition:fade={{ duration: 200 }}>
        {#if isModuleActive("create")}
          <CreateModule {onTabAccessibilityChange} {onCurrentWordChange} />
        {:else if isModuleActive("discover")}
          <DiscoverModule />
        {:else if isModuleActive("community")}
          <CommunityModule />
        {:else if isModuleActive("learn")}
          <LearnTab onHeaderChange={onLearnHeaderChange} />
        {:else if isModuleActive("animate")}
          <AnimateModule />
        {:else if isModuleActive("train")}
          <TrainModule />
        {:else if isModuleActive("edit")}
          <EditModule />
        {:else if isModuleActive("word_card")}
          <WordCardTab />
        {:else if isModuleActive("write")}
          <WriteTab />
        {:else if isModuleActive("account")}
          <AccountModule />
        {:else if isModuleActive("admin")}
          <AdminDashboard />
        {/if}
      </div>
    {/key}
  </div>
{/if}

<style>
  /* Container for overlaying transitions */
  .transition-container {
    position: relative;
    width: 100%;
    height: 100%;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .module-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: 100%;
    height: 100%;
  }

  .module-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 200px;
    color: var(--text-color, #333);
  }

  .loading-spinner {
    width: 48px;
    height: 48px;
    border: 3px solid var(--border-color, #e0e0e0);
    border-top: 3px solid var(--primary-color, #007bff);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .module-loading p {
    margin: 0;
    font-size: 14px;
    opacity: 0.7;
  }

  @media (prefers-reduced-motion: reduce) {
    .loading-spinner {
      animation-duration: 3s;
    }
  }
</style>
