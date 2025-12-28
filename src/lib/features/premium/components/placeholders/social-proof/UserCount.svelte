<!-- UserCount - Display active user count for social proof -->
<script lang="ts">
  interface Props {
    totalUsers?: number;
    premiumUsers?: number;
    showGrowth?: boolean;
  }

  let { totalUsers = 0, premiumUsers = 0, showGrowth = false }: Props = $props();

  function formatCount(count: number): string {
    if (count >= 1000) {
      return `${Math.floor(count / 1000)},${(count % 1000).toString().padStart(3, "0")}+`;
    }
    return `${count}+`;
  }
</script>

<div class="user-count">
  <div class="count-badge">
    <i class="fas fa-users" aria-hidden="true"></i>
    <span class="count">{formatCount(totalUsers)}</span>
  </div>
  <p class="tagline">flow artists creating with TKA</p>
  {#if showGrowth && premiumUsers > 0}
    <p class="growth">{formatCount(premiumUsers)} premium members</p>
  {/if}
</div>

<style>
  .user-count {
    text-align: center;
    padding: var(--spacing-md, 16px);
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    margin: var(--spacing-md, 16px) 0;
  }

  .count-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm, 8px);
    margin-bottom: var(--spacing-sm, 8px);
  }

  .count-badge i {
    font-size: var(--font-size-xl, 20px);
    color: var(--theme-accent, #6366f1);
  }

  .count {
    font-size: clamp(24px, 5vw, 32px);
    font-weight: 700;
    color: var(--theme-text, #ffffff);
  }

  .tagline {
    font-size: var(--font-size-min, 14px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    margin: 0;
  }

  .growth {
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-accent, #6366f1);
    margin: var(--spacing-xs, 4px) 0 0;
    font-weight: 600;
  }
</style>
