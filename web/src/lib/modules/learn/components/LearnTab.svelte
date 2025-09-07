<!--
Learn Tab - Master learning interface with sub-tabs

Provides access to both learning modes:
- Codex: Browse and reference all TKA letters
- Quiz: Interactive learning and testing
-->
<script lang="ts">
  import CodexTab from "../codex/components/CodexTab.svelte";
  import QuizTab from "../quiz/components/QuizTab.svelte";

  // Sub-tab state
  let activeSubTab = $state<"codex" | "quiz">("codex");

  // Sub-tab configuration
  const subTabs = [
    { id: "codex", label: "Codex", icon: "📖" },
    { id: "quiz", label: "Quiz", icon: "🧠" },
  ] as const;

  // Handle sub-tab switching
  function switchSubTab(tabId: "codex" | "quiz") {
    console.log(`🔄 Learn: Switching to ${tabId} sub-tab`);
    activeSubTab = tabId;
  }

  // Check if a sub-tab is active
  function isSubTabActive(tabId: "codex" | "quiz"): boolean {
    return activeSubTab === tabId;
  }
</script>

<div class="learn-tab">
  <!-- Sub-tab Navigation -->
  <div class="sub-tab-nav">
    <div class="sub-tab-buttons">
      {#each subTabs as tab}
        <button
          class="sub-tab-button"
          class:active={isSubTabActive(tab.id)}
          onclick={() => switchSubTab(tab.id)}
        >
          <span class="sub-tab-icon">{tab.icon}</span>
          <span class="sub-tab-label">{tab.label}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Sub-tab Content -->
  <div class="sub-tab-content">
    {#if isSubTabActive("codex")}
      <CodexTab />
    {:else if isSubTabActive("quiz")}
      <QuizTab />
    {/if}
  </div>
</div>

<style>
  .learn-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--background, #0a0a0a);
    color: var(--foreground, #ffffff);
  }

  .sub-tab-nav {
    background: rgba(0, 0, 0, 0.4);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0.5rem 1rem;
  }

  .sub-tab-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .sub-tab-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    color: var(--muted-foreground, #a3a3a3);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .sub-tab-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: var(--foreground, #ffffff);
  }

  .sub-tab-button.active {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    color: var(--foreground, #ffffff);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .sub-tab-icon {
    font-size: 1rem;
  }

  .sub-tab-label {
    font-weight: 600;
  }

  .sub-tab-content {
    flex: 1;
    overflow: hidden;
    background: var(--background, #0a0a0a);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .sub-tab-nav {
      padding: 0.5rem;
    }

    .sub-tab-button {
      padding: 0.625rem 1rem;
      font-size: 0.85rem;
    }

    .sub-tab-buttons {
      gap: 0.375rem;
    }
  }

  @media (max-width: 480px) {
    .sub-tab-button {
      padding: 0.5rem 0.75rem;
      font-size: 0.8rem;
    }

    .sub-tab-icon {
      font-size: 0.9rem;
    }
  }
</style>
