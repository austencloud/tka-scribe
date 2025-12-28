<!--
  EarlyAccessBanner - Subtle notice about early access status
-->
<script lang="ts">
  interface Props {
    message: string;
  }

  let { message }: Props = $props();
</script>

<div class="banner">
  <i class="fas fa-flask" aria-hidden="true"></i>
  <p>{message}</p>
</div>

<style>
  .banner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm, 8px);
    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
    background: linear-gradient(
      135deg,
      color-mix(in srgb, #f59e0b 10%, transparent),
      color-mix(in srgb, #f97316 10%, transparent)
    );
    border: 1px solid color-mix(in srgb, #f59e0b 30%, transparent);
    border-radius: 10px;
  }

  .banner i {
    font-size: var(--icon-size-sm, 16px);
    color: #f59e0b;
  }

  .banner p {
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    margin: 0;
  }
</style>
