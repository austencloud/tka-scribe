<script lang="ts">
  import type { FeedbackStatus } from "../../../domain/models/feedback-models";
  import { STATUS_CONFIG } from "../../../domain/models/feedback-models";
  import type { FeedbackDetailState } from "../../../state/feedback-detail-state.svelte";

  const {
    detailState,
    readOnly = false,
  } = $props<{
    detailState: FeedbackDetailState;
    readOnly?: boolean;
  }>();
</script>

<section class="section">
  <h3 class="section-title">
    <i class="fas fa-tasks"></i>
    Status
  </h3>
  {#if readOnly}
    {@const statusConfig = STATUS_CONFIG[detailState.item.status]}
    <div
      class="status-display"
      style="--status-color: {statusConfig.color}"
    >
      <i class="fas {statusConfig.icon}"></i>
      <span>{statusConfig.label}</span>
    </div>
  {:else}
    <div class="status-grid">
      {#each Object.entries(STATUS_CONFIG) as [status, config]}
        <button
          type="button"
          class="status-btn"
          class:active={detailState.item.status === status}
          class:just-selected={detailState.lastUpdatedStatus === status}
          style="--status-color: {config.color}"
          onclick={() =>
            detailState.handleStatusChange(status as FeedbackStatus)}
          disabled={detailState.isUpdatingStatus}
        >
          <span class="status-icon">
            <i class="fas {config.icon}"></i>
          </span>
          <span class="status-label">{config.label}</span>
          {#if detailState.item.status === status}
            <span class="status-check">
              <i class="fas fa-check"></i>
            </span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
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

  .status-display {
    display: flex;
    align-items: center;
    gap: var(--fb-space-xs);
    padding: var(--fb-space-sm) var(--fb-space-md);
    background: color-mix(in srgb, var(--status-color) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--status-color) 30%, transparent);
    border-radius: var(--fb-radius-md);
    color: var(--status-color);
    font-weight: 600;
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: var(--fb-space-sm);
  }

  .status-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: var(--fb-space-sm);
    background: var(--fb-surface);
    border: 2px solid transparent;
    border-radius: var(--fb-radius-md);
    color: var(--fb-text-muted);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: var(--fb-text-xs);
    font-weight: 500;
    text-align: center;
  }

  .status-btn:hover:not(:disabled) {
    background: var(--fb-surface-hover);
    border-color: var(--status-color);
    color: var(--status-color);
  }

  .status-btn.active {
    background: color-mix(in srgb, var(--status-color) 15%, transparent);
    border-color: var(--status-color);
    color: var(--status-color);
    font-weight: 600;
  }

  .status-btn.just-selected {
    animation: spring-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes spring-pop {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }

  .status-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .status-icon {
    font-size: 1.2em;
  }

  .status-label {
    display: block;
    font-size: var(--fb-text-xs);
  }

  .status-check {
    position: absolute;
    top: -4px;
    right: -4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: var(--status-color);
    border-radius: 50%;
    color: white;
    font-size: 0.75em;
  }

  .status-btn {
    position: relative;
  }
</style>
