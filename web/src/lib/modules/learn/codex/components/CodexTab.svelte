<!--
Codex Tab - Letter reference and pictograph browser

Provides access to the complete TKA letter codex:
- Browse all available letters and pictographs
- Filter by categories and motion types
- Reference for learning and building sequences
-->
<script lang="ts">
  import type { PictographData } from "$shared";
  import CodexComponent from "./CodexComponent.svelte";

  // Handle pictograph selection
  function handlePictographSelected(pictograph: PictographData) {
    console.log("📖 CodexTab: Pictograph selected:", pictograph);
    // Could emit events or handle selection logic here
  }
</script>

<div class="codex-tab">
  <div class="codex-header">
    <h2>Letter Codex</h2>
    <p>Browse and reference all TKA letters and pictographs</p>
  </div>

  <div class="codex-content">
    <CodexComponent
      isVisible={true}
      onPictographSelected={handlePictographSelected}
    />
  </div>
</div>

<style>
  .codex-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--background, #0a0a0a);
    color: var(--foreground, #ffffff);
  }

  .codex-header {
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.3);
  }

  .codex-header h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--foreground, #ffffff);
  }

  .codex-header p {
    margin: 0;
    color: var(--muted-foreground, #a3a3a3);
    font-size: 0.9rem;
  }

  .codex-content {
    flex: 1;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.2);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .codex-header {
      padding: 1rem;
    }

    .codex-header h2 {
      font-size: 1.25rem;
    }
  }

  @media (max-width: 480px) {
    .codex-header {
      padding: 0.75rem;
    }

    .codex-header h2 {
      font-size: 1.125rem;
    }
  }
</style>
