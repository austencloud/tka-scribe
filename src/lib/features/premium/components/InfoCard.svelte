<!--
  InfoCard - Simple card for displaying information sections
-->
<script lang="ts">
  interface Props {
    title?: string;
  }

  let { title, children }: Props = $props();
</script>

<div class="card">
  {#if title}
    <h2>{title}</h2>
  {/if}
  <div class="content">
    {@render children()}
  </div>
</div>

<style>
  .card {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border: var(--glass-border, 1px solid rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    padding: var(--spacing-lg, 24px);
  }

  h2 {
    font-size: clamp(18px, 2.5vw, 22px);
    font-weight: 600;
    margin: 0 0 var(--spacing-md, 16px);
    color: var(--theme-text, #ffffff);
  }

  .content {
    font-size: var(--font-size-min, 14px);
    line-height: 1.7;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.8));
  }

  .content :global(p) {
    margin: 0 0 var(--spacing-sm, 8px);
  }

  .content :global(p:last-child) {
    margin-bottom: 0;
  }
</style>
