<!-- CancelAnytime - Prominent cancellation policy display -->
<script lang="ts">
  interface Props {
    variant?: "inline" | "badge";
    showSteps?: boolean;
  }

  let { variant = "inline", showSteps = false }: Props = $props();
</script>

{#if variant === "inline"}
  <div class="cancel-inline">
    <i class="fas fa-check-circle" aria-hidden="true"></i>
    <span>Cancel anytime, no questions asked</span>
  </div>
{:else}
  <div class="cancel-badge">
    <div class="badge-header">
      <i class="fas fa-door-open" aria-hidden="true"></i>
      <h4>No Long-Term Commitment</h4>
    </div>
    <p>
      Cancel your subscription anytime from your account settings. You'll keep access until the
      end of your billing period.
    </p>
    {#if showSteps}
      <div class="cancel-steps">
        <div class="step">
          <span class="step-number">1</span>
          <span>Go to Account Settings</span>
        </div>
        <div class="step">
          <span class="step-number">2</span>
          <span>Click "Manage Subscription"</span>
        </div>
        <div class="step">
          <span class="step-number">3</span>
          <span>Select "Cancel Subscription"</span>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  /* Inline variant (near CTA) */
  .cancel-inline {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs, 4px);
    font-size: var(--font-size-min, 14px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.8));
    margin-top: var(--spacing-sm, 8px);
  }

  .cancel-inline i {
    color: var(--semantic-success, #10b981);
  }

  /* Badge variant (standalone section) */
  .cancel-badge {
    padding: var(--spacing-md, 16px);
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    margin: var(--spacing-md, 16px) 0;
  }

  .badge-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm, 8px);
    margin-bottom: var(--spacing-sm, 8px);
  }

  .badge-header i {
    font-size: var(--font-size-lg, 18px);
    color: var(--theme-accent, #6366f1);
  }

  .badge-header h4 {
    margin: 0;
    font-size: var(--font-size-base, 16px);
    font-weight: 600;
    color: var(--theme-text, #ffffff);
  }

  .cancel-badge p {
    margin: 0;
    font-size: var(--font-size-min, 14px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.8));
    line-height: 1.6;
  }

  .cancel-steps {
    margin-top: var(--spacing-md, 16px);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm, 8px);
  }

  .step {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm, 8px);
    font-size: var(--font-size-min, 14px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.8));
  }

  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: var(--theme-accent, #6366f1);
    color: white;
    border-radius: 50%;
    font-size: var(--font-size-compact, 12px);
    font-weight: 600;
    flex-shrink: 0;
  }
</style>
