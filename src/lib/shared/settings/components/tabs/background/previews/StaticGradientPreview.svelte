<!--
  StaticGradientPreview.svelte

  Simple static gradient background preview for non-animated backgrounds.
  Uses inline style from background metadata for the gradient.
-->
<script lang="ts">
  interface Props {
    color?: string;
    colors?: string[];
    direction?: number;
  }

  let { color, colors, direction = 135 }: Props = $props();

  const backgroundStyle = $derived(
    color
      ? `background: ${color};`
      : colors
        ? `background: linear-gradient(${direction}deg, ${colors.join(", ")});`
        : ""
  );
</script>

<div class="background-preview static-gradient" style={backgroundStyle}></div>

<style>
  .background-preview {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    overflow: hidden;
  }

  .static-gradient {
    /* Fallback gradient if no style provided */
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  }
</style>
