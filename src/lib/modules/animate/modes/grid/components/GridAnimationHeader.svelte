<!--
  GridAnimationHeader.svelte

  Header bar for grid mode showing title and reset button.
-->
<script lang="ts">
  let {
    filledCount,
    onResetAll,
  }: {
    filledCount: number;
    onResetAll: () => void;
  } = $props();
</script>

<div class="view-header">
  <div class="header-info">
    <h2>Grid Animation</h2>
    <span class="filled-count">{filledCount}/4 positions filled</span>
  </div>

  <button class="reset-btn" onclick={onResetAll}>
    <i class="fas fa-redo"></i>
    Reset All
  </button>
</div>

<style>
  .view-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }

  .header-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .header-info h2 {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 700;
  }

  .filled-count {
    padding: 0.25rem 0.75rem;
    background: rgba(251, 146, 60, 0.15);
    border: 1px solid rgba(251, 146, 60, 0.3);
    border-radius: 20px;
    font-size: 0.8rem;
    color: #fb923c;
  }

  .reset-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    color: #f87171;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .reset-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.5);
  }

  @media (max-width: 480px) {
    .view-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .header-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .reset-btn {
      width: 100%;
      justify-content: center;
    }
  }
</style>
