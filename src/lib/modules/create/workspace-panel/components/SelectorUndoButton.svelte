<!--
  SelectorUndoButton.svelte

  Undo button displayed in the top-left corner of the creation method selector.
  Shows when there are actions available to undo in the CreateModule state.
-->
<script lang="ts">
  let {
    onUndo,
    undoDescription = "Undo last action",
  }: {
    onUndo: () => void;
    undoDescription?: string;
  } = $props();
</script>

<button
  class="selector-undo-button"
  onclick={onUndo}
  title={undoDescription}
>
  <i class="fas fa-rotate-left" aria-hidden="true"></i>
  <span>Undo</span>
</button>

<style>
  .selector-undo-button {
    position: absolute;
    top: clamp(1rem, 2vh, 1.5rem);
    left: clamp(1rem, 2vh, 1.5rem);
    z-index: 10;

    padding: 0.625rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;

    transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(12px);
  }

  .selector-undo-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.95);
    transform: translateY(-1px);
  }

  .selector-undo-button:active {
    transform: translateY(0);
    background: rgba(255, 255, 255, 0.08);
  }

  .selector-undo-button i {
    flex-shrink: 0;
    opacity: 0.9;
    font-size: 1rem;
  }

  .selector-undo-button span {
    white-space: nowrap;
  }

  @media (max-width: 640px) {
    .selector-undo-button {
      top: 0.75rem;
      left: 0.75rem;
      padding: 0.5rem 0.875rem;
      font-size: 0.75rem;
    }

    .selector-undo-button i {
      font-size: 0.875rem;
    }
  }
</style>
