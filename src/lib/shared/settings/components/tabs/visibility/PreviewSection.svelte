<!--
  PreviewSection.svelte - Interactive Pictograph Preview

  Displays an interactive pictograph that reflects current visibility settings.
  Users can click elements in the preview to toggle their visibility.

  Uses container queries for responsive sizing without JavaScript.
-->
<script lang="ts">
  import Pictograph from "$lib/shared/pictograph/shared/components/Pictograph.svelte";
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";

  interface Props {
    pictographData: PictographData;
  }

  let { pictographData }: Props = $props();
</script>

<div class="preview-section">
  <h4 class="preview-title">Interactive Preview</h4>
  <p class="preview-note">
    Click elements in the preview to toggle their visibility
  </p>

  <div class="preview-container">
    <div class="pictograph-wrapper">
      <Pictograph {pictographData} />
    </div>
  </div>
</div>

<style>
  .preview-section {
    display: flex;
    flex-direction: column;
    gap: clamp(6px, 1.5cqi, 12px); /* Tighter gap to maximize preview space */
    flex: 1; /* Fill available space in parent */
    min-height: 0; /* Allow proper flex shrinking */
    container-type: inline-size; /* Make this a container for child queries */
  }

  .preview-title {
    font-size: clamp(15px, 3cqi, 18px); /* iOS body to title3 */
    font-weight: 600; /* iOS semibold */
    letter-spacing: -0.41px; /* iOS body tracking */
    line-height: 1.29; /* iOS body ratio */
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
    text-align: center;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    flex-shrink: 0; /* Don't let header shrink */
  }

  .preview-note {
    font-size: clamp(12px, 2.5cqi, 15px); /* iOS caption to footnote */
    font-weight: 400;
    letter-spacing: -0.06px; /* iOS caption tracking */
    line-height: 1.3; /* iOS caption ratio */
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
    margin: 0;
    text-align: center;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    flex-shrink: 0; /* Don't let note shrink */
  }

  /* iOS Glass Morphism Preview Container */
  .preview-container {
    flex: 1; /* Fill remaining space after header/note */
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.2);
    border: 0.33px solid rgba(255, 255, 255, 0.12); /* iOS hairline border */
    border-radius: 12px; /* iOS medium corner radius */
    padding: clamp(4px, 0.8cqi, 8px); /* Minimal padding to maximize pictograph space */
    min-height: 0; /* Allow flex shrinking */
    container-type: size; /* Make this a size container for pictograph wrapper */
    box-shadow:
      inset 0 2px 8px rgba(0, 0, 0, 0.1),
      0 1px 3px rgba(0, 0, 0, 0.08); /* iOS inset shadow for depth */
  }

  /* Pictograph wrapper - uses container query units to size based on preview-container */
  .pictograph-wrapper {
    /* Use the minimum of container width/height to maintain square aspect ratio */
    /* Subtract a bit for any internal padding/margins */
    width: min(98cqw, 98cqh); /* 98% of container's smaller dimension */
    height: min(98cqw, 98cqh); /* Maintains 1:1 aspect ratio */
    max-width: 800px; /* Maximum size cap for very large screens */
    max-height: 800px;
    min-width: 150px; /* Minimum usable size */
    min-height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
