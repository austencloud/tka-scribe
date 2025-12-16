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
    background: transparent;
    color: var(--foreground, #ffffff);
  }

  .codex-header {
    padding: 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: transparent;
    text-align: center;
  }

  .codex-header h2 {
    margin: 0 0 0.75rem 0;
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--foreground, #ffffff);
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    background: linear-gradient(135deg, #ffffff, #e0e0e0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .codex-content {
    flex: 1;
    overflow: hidden;
    background: transparent;
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
