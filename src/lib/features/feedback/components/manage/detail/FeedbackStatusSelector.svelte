<script lang="ts">
  import type { FeedbackStatus } from "../../../domain/models/feedback-models";
  import { STATUS_CONFIG } from "../../../domain/models/feedback-models";
  import type { FeedbackDetailState } from "../../../state/feedback-detail-state.svelte";

  interface Props {
    detailState: FeedbackDetailState;
    readOnly?: boolean;
  }

  const { detailState, readOnly = false }: Props = $props();

  const statusConfig = $derived(STATUS_CONFIG[detailState.item.status as FeedbackStatus]);
  const statuses = Object.entries(STATUS_CONFIG) as [FeedbackStatus, typeof statusConfig][];
</script>

<section class="section">
  <h3 class="section-title">
    <i class="fas fa-tasks"></i>
    Status
  </h3>
  <div class="status-row">
    {#each statuses as [status, config]}
      <button
        type="button"
        class="status-chip"
        class:active={detailState.item.status === status}
        style="--status-color: {config.color}"
        onclick={() => {
          if (!readOnly) {
            detailState.handleStatusChange(status);
          }
        }}
        disabled={readOnly}
      >
        <i class="fas {config.icon}"></i>
        <span class="status-label">{config.label}</span>
      </button>
    {/each}
  </div>
</section>

<style>
  .section {
    display: flex;
    flex-direction: column;
    gap: var(--fb-space-sm);
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: var(--fb-space-xs);
    margin: 0;
    font-size: var(--fb-text-xs);
    font-weight: 600;
    color: var(--fb-text-subtle);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .status-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--fb-space-xs);
  }

  .status-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: 999px;
    color: var(--fb-text-muted);
    cursor: pointer;
    transition: all 0.15s ease;
    font-size: var(--fb-text-xs);
    font-weight: 500;
  }

  .status-chip:hover:not(:disabled) {
    background: color-mix(in srgb, var(--status-color) 10%, transparent);
    border-color: var(--status-color);
    color: var(--status-color);
  }

  .status-chip.active {
    background: color-mix(in srgb, var(--status-color) 15%, transparent);
    border-color: var(--status-color);
    color: var(--status-color);
    font-weight: 600;
  }

  .status-chip:disabled {
    cursor: default;
    opacity: 0.7;
  }

  .status-label {
    white-space: nowrap;
  }

  /* On very small screens, wrap labels */
  @media (max-width: 400px) {
    .status-chip {
      padding: 5px 8px;
      font-size: 0.7rem;
    }
  }
</style>
