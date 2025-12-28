<!--
  DependencyWarning.svelte - Motion Dependency Warning

  Displays a warning when both motions are not visible,
  indicating that dependent glyphs cannot be shown.
-->
<script lang="ts">
  interface Props {
    show: boolean;
  }

  let { show }: Props = $props();
</script>

{#if show}
  <div class="dependency-warning">
    ⚠️ Dependent glyphs require both motions to be visible
  </div>
{/if}

<style>
  .dependency-warning {
    background: var(--semantic-warning-dim);
    border: 2px solid
      color-mix(in srgb, var(--semantic-warning, var(--semantic-warning)) 30%, transparent);
    border-radius: 8px;
    padding: 12px;
    color: var(--semantic-warning, var(--semantic-warning));
    font-size: var(--font-size-compact);
    font-weight: 600;
    text-align: center;
  }

  /* Accessibility */
  @media (prefers-contrast: high) {
    .dependency-warning {
      border-width: 3px;
    }
  }
</style>
