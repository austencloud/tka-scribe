<!--
  AnalysisStatusBadge.svelte - Status indicator for analysis state
-->
<script lang="ts">
  import type { AnalysisStatus } from "../../domain/models/analysis-models";
  import { STATUS_DISPLAY } from "../../domain/models/analysis-models";

  interface Props {
    status: AnalysisStatus;
  }

  let { status }: Props = $props();

  const displayInfo = $derived(STATUS_DISPLAY[status] || STATUS_DISPLAY.pending);
</script>

<span
  class="status-badge"
  style="--badge-color: {displayInfo.color}; --badge-bg: {displayInfo.bgColor}"
>
  <i class="fas {displayInfo.icon}"></i>
  <span>{displayInfo.label}</span>
</span>

<style>
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    background: var(--badge-bg);
    border: 1px solid var(--badge-color);
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
    color: var(--badge-color);
  }

  .status-badge i {
    font-size: 10px;
  }

  /* Animation for analyzing state */
  .status-badge i.fa-spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .status-badge i.fa-spinner {
      animation: none;
    }
  }
</style>
