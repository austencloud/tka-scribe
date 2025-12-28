<!--
  Test page for OnboardingExperience preview
  Navigate to /test/onboarding to view

  Controls:
  - Reset: Start from beginning
  - Current step display
-->
<script lang="ts">
  import OnboardingExperience from "$lib/shared/onboarding/components/OnboardingExperience.svelte";
  import { ONBOARDING_COMPLETED_KEY } from "$lib/shared/onboarding/config/storage-keys";

  let showOnboarding = $state(true);
  let completionCount = $state(0);

  function handleComplete() {
    completionCount++;
    showOnboarding = false;
  }

  function handleSkip() {
    showOnboarding = false;
  }

  function handleRestart() {
    showOnboarding = true;
  }

  function clearStorageAndRestart() {
    localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    showOnboarding = true;
  }
</script>

<svelte:head>
  <title>Onboarding Test | TKA Scribe</title>
</svelte:head>

<div class="test-page">
  <!-- Control panel -->
  <div class="controls">
    <h1>Onboarding Test</h1>

    <div class="status">
      <span class="label">Status:</span>
      <span class="value" class:active={showOnboarding}>
        {showOnboarding ? "Showing" : "Hidden"}
      </span>
    </div>

    <div class="status">
      <span class="label">Completions:</span>
      <span class="value">{completionCount}</span>
    </div>

    <div class="buttons">
      <button onclick={handleRestart} disabled={showOnboarding}>
        <i class="fas fa-redo"></i> Restart
      </button>

      <button onclick={clearStorageAndRestart} class="danger">
        <i class="fas fa-trash"></i> Clear Storage & Restart
      </button>
    </div>

    <p class="hint">
      This test page lets you preview and iterate on the onboarding experience
      without triggering the real login flow.
    </p>
  </div>

  <!-- Background simulation -->
  <div class="background-sim"></div>

  <!-- Onboarding overlay -->
  {#if showOnboarding}
    <OnboardingExperience onComplete={handleComplete} onSkip={handleSkip} />
  {:else}
    <div class="completion-message">
      <div class="completion-card">
        <i class="fas fa-check-circle"></i>
        <h2>Onboarding Complete!</h2>
        <p>
          In the real app, you'd now see the Dashboard.
          <br />
          Click "Restart" to preview again.
        </p>
      </div>
    </div>
  {/if}
</div>

<style>
  .test-page {
    min-height: 100vh;
    position: relative;
  }

  /* Simulated background */
  .background-sim {
    position: fixed;
    inset: 0;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    z-index: 0;
  }

  /* Control panel */
  .controls {
    position: fixed;
    top: 16px;
    left: 16px;
    z-index: 10001;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(10px);
    padding: 16px;
    border-radius: 12px;
    border: 1px solid var(--theme-stroke);
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 280px;
  }

  .controls h1 {
    color: white;
    font-size: 14px;
    font-weight: 600;
    margin: 0;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--theme-stroke);
  }

  .status {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
  }

  .status .label {
    color: rgba(255, 255, 255, 0.75);
  }

  .status .value {
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
  }

  .status .value.active {
    color: var(--semantic-success);
  }

  .buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 4px;
  }

  .controls button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    background: var(--theme-accent);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .controls button:hover:not(:disabled) {
    background: #5558e3;
  }

  .controls button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .controls button.danger {
    background: transparent;
    border: 1px solid rgba(239, 68, 68, 0.5);
    color: var(--semantic-error);
  }

  .controls button.danger:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: var(--semantic-error);
  }

  .hint {
    font-size: var(--font-size-compact, 12px);
    color: rgba(255, 255, 255, 0.75);
    margin: 4px 0 0 0;
    line-height: 1.4;
  }

  /* Completion message */
  .completion-message {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }

  .completion-card {
    text-align: center;
    padding: 48px;
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke);
    border-radius: 20px;
    max-width: 400px;
  }

  .completion-card i {
    font-size: 64px;
    color: var(--semantic-success);
    margin-bottom: 16px;
  }

  .completion-card h2 {
    color: white;
    font-size: 1.5rem;
    margin: 0 0 12px 0;
  }

  .completion-card p {
    color: var(--theme-text-dim);
    font-size: 1rem;
    margin: 0;
    line-height: 1.6;
  }

  /* Mobile responsive */
  @media (max-width: 480px) {
    .controls {
      top: auto;
      bottom: 16px;
      left: 16px;
      right: 16px;
      max-width: none;
    }
  }
</style>
