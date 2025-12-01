<!--
  AnimationHeader.svelte

  Desktop header bar for single mode showing sequence title, author, and change button.
-->
<script lang="ts">
  import ChangeButton from "../../../components/controls/ChangeButton.svelte";

  // Props
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

<div class="animation-header">
  <div class="sequence-info">
    <div class="sequence-title-row">
      <h2>{sequenceName}</h2>
      {#if author}
        <span class="author-badge">by {author}</span>
      {/if}
    </div>
  </div>

  <div class="header-actions">
    <ChangeButton onclick={onChangeSequence} />
  </div>
</div>

<style>
  .animation-header {
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
    flex-direction: column;
    gap: 0.25rem;
  }

  .sequence-title-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .sequence-title-row h2 {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 700;
  }

  .author-badge {
    padding: 0.25rem 0.6rem;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    font-size: 0.8rem;
    opacity: 0.7;
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  @media (max-width: 480px) {
    .animation-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .header-actions {
      width: 100%;
    }
  }
</style>
