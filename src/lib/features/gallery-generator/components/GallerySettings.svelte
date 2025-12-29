<!--
  Gallery Settings

  Dark/light mode toggle for pictograph rendering.
-->
<script lang="ts">
  import { galleryGeneratorState } from "../state/gallery-generator-state.svelte";

  const state = galleryGeneratorState;
</script>

<div class="settings-panel">
  <div class="setting-row">
    <span class="setting-label">Pictograph Style</span>
    <div class="chip-group">
      <button
        class="chip"
        class:active={!state.lightMode}
        onclick={() => state.setLightMode(false)}
        disabled={state.isRendering}
      >
        Dark
      </button>
      <button
        class="chip"
        class:active={state.lightMode}
        onclick={() => state.setLightMode(true)}
        disabled={state.isRendering}
      >
        Light
      </button>
    </div>
  </div>

  <div class="output-info">
    <span>240px/beat</span>
    <span>WebP 95%</span>
    <span>Batch: 4</span>
  </div>
</div>

<style>
  .settings-panel {
    background: #18181b;
    border-radius: 12px;
    padding: 1rem 1.25rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .setting-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .setting-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: #71717a;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .chip-group {
    display: flex;
    gap: 0.25rem;
  }

  .chip {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
    font-weight: 500;
    background: #27272a;
    border: none;
    border-radius: 6px;
    color: #a1a1aa;
    cursor: pointer;
    transition: all 0.1s ease;
  }

  .chip:hover:not(:disabled) {
    background: #3f3f46;
    color: #e4e4e7;
  }

  .chip.active {
    background: #f43f5e;
    color: white;
  }

  .chip:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .output-info {
    margin-left: auto;
    display: flex;
    gap: 1rem;
    font-size: 0.75rem;
    color: #52525b;
  }
</style>
