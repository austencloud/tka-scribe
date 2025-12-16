<!--
  Test page for MigrationModal preview
  Navigate to /test/migration-modal to view
-->
<script lang="ts">
  import MigrationModal from "$lib/shared/migration/components/MigrationModal.svelte";
  import { migrationState } from "$lib/shared/migration/state/migration-state.svelte";
  import { onMount } from "svelte";

  let showModal = $state(true);

  onMount(() => {
    migrationState.initialize();
    // Reset state so we can see first-time experience
    migrationState.resetState();
  });

  function handleDismiss() {
    showModal = false;
  }

  function handleReopen() {
    migrationState.resetState();
    showModal = true;
  }
</script>

<div class="test-page">
  <div class="controls">
    <h1>Migration Modal Preview</h1>
    <button onclick={handleReopen}>Reset & Show Modal</button>
  </div>

  {#if showModal}
    <MigrationModal onDismiss={handleDismiss} />
  {/if}
</div>

<style>
  .test-page {
    min-height: 100vh;
    background: #1a1a2e;
    padding: 20px;
  }

  .controls {
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 10002;
    background: rgba(0, 0, 0, 0.8);
    padding: 16px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .controls h1 {
    color: white;
    font-size: 14px;
    margin: 0;
  }

  .controls button {
    padding: 8px 16px;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
  }

  .controls button:hover {
    background: #5558e3;
  }
</style>
