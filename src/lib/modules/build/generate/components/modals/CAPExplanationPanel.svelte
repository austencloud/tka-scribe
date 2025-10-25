<!--
CAPExplanationPanel.svelte - Displays explanation of selected CAP transformations
Shows contextual information based on current selection
-->
<script lang="ts">
  let {
    explanationText
  } = $props<{
    explanationText: string;
  }>();
</script>

<div class="explanation-panel">
  <h3>What this does:</h3>
  <p>{explanationText}</p>
</div>

<style>
  .explanation-panel {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    padding: clamp(16px, 3vh, 24px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    flex-shrink: 0;
  }

  .explanation-panel h3 {
    color: white;
    font-size: clamp(14px, 2.5vw, 18px);
    font-weight: 600;
    margin: 0 0 clamp(8px, 1.5vh, 12px) 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .explanation-panel p {
    color: rgba(255, 255, 255, 0.9);
    font-size: clamp(12px, 2vw, 16px);
    line-height: 1.5;
    margin: 0;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  /* 🌅 LANDSCAPE MODE: Compact explanation for wide, short viewports */
  @media (orientation: landscape) and (max-height: 600px) {
    .explanation-panel {
      padding: 8px 12px;
    }

    .explanation-panel h3 {
      font-size: 11px;
      margin-bottom: 4px;
    }

    .explanation-panel p {
      font-size: 10px;
      line-height: 1.3;
    }
  }

  /* 📱 LANDSCAPE + VERY NARROW: Ultra-compact for 344px height */
  @media (orientation: landscape) and (max-height: 400px) {
    .explanation-panel {
      padding: 6px 10px;
    }

    .explanation-panel h3 {
      font-size: 10px;
      margin-bottom: 3px;
    }

    .explanation-panel p {
      font-size: 9px;
      line-height: 1.2;
    }
  }
</style>
