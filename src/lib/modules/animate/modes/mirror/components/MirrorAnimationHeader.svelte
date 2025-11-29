<!--
  MirrorAnimationHeader.svelte

  Header bar for mirror mode showing sequence info and change button.
-->
<script lang="ts">
  let {
    sequenceName,
    author,
    onChangeSequence,
  }: {
    sequenceName: string;
    author?: string;
    onChangeSequence: () => void;
  } = $props();
</script>

<div class="view-header">
  <div class="sequence-info">
    <h2>{sequenceName}</h2>
    {#if author}
      <span class="author-tag">by {author}</span>
    {/if}
  </div>

  <div class="header-actions">
    <button class="change-btn" onclick={onChangeSequence}>
      <i class="fas fa-exchange-alt"></i>
      Change
    </button>
  </div>
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

  .sequence-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .sequence-info h2 {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 700;
  }

  .author-tag {
    padding: 0.25rem 0.6rem;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    font-size: 0.8rem;
    opacity: 0.7;
  }

  .change-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    color: white;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .change-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 480px) {
    .view-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }
  }
</style>
