<!--
  FeatureComparisonTable - Side-by-side Premium vs Free comparison
-->
<script lang="ts">
  interface Feature {
    name: string;
    free: string;
    premium: string;
    icon?: string;
  }

  interface Props {
    features: Feature[];
  }

  let { features }: Props = $props();
</script>

<div class="comparison">
  <div class="header">
    <div class="feature-col">
      <h3>Feature</h3>
    </div>
    <div class="free-col">
      <h3>Free</h3>
    </div>
    <div class="premium-col">
      <h3>Premium</h3>
    </div>
  </div>

  {#each features as feature}
    <div class="row">
      <div class="feature-col">
        {#if feature.icon}
          <i class="fas {feature.icon}" aria-hidden="true"></i>
        {/if}
        <span>{feature.name}</span>
      </div>
      <div class="free-col" data-label="Free">
        <span>{feature.free}</span>
      </div>
      <div class="premium-col" data-label="Premium">
        <span>{feature.premium}</span>
      </div>
    </div>
  {/each}
</div>

<style>
  .comparison {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border: var(--glass-border, 1px solid rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    overflow: hidden;
  }

  .header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: var(--spacing-sm, 8px);
    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
    background: var(--theme-panel-bg, rgba(255, 255, 255, 0.05));
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .header h3 {
    font-size: var(--font-size-min, 14px);
    font-weight: 600;
    margin: 0;
    color: var(--theme-text, #ffffff);
  }

  .row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: var(--spacing-sm, 8px);
    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.06));
  }

  .row:last-child {
    border-bottom: none;
  }

  .row:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.02));
  }

  .feature-col {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm, 8px);
  }

  .feature-col i {
    font-size: var(--icon-size-sm, 16px);
    color: var(--theme-accent, #6366f1);
    width: var(--icon-size-md, 20px);
  }

  .feature-col span {
    font-size: var(--font-size-min, 14px);
    color: var(--theme-text, #ffffff);
  }

  .free-col,
  .premium-col {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .free-col span {
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .premium-col span {
    font-size: var(--font-size-min, 14px);
    color: var(--theme-accent, #6366f1);
    font-weight: 500;
  }

  @media (max-width: 640px) {
    .header {
      display: none;
    }

    .row {
      grid-template-columns: 1fr;
      gap: var(--spacing-sm, 8px);
      padding: var(--spacing-lg, 24px) var(--spacing-md, 16px);
    }

    .feature-col {
      font-weight: 600;
      padding-bottom: var(--spacing-sm, 8px);
      border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    }

    .free-col,
    .premium-col {
      justify-content: space-between;
      padding: 0;
    }

    .free-col::before,
    .premium-col::before {
      content: attr(data-label);
      font-size: var(--font-size-min, 14px);
      font-weight: 600;
      color: var(--theme-text, #ffffff);
    }
  }
</style>
