<!--
  ExpandToggleButton.svelte

  Mobile expand/collapse toggle button for animation controls.
  Shows chevron icon to indicate expand/collapse state.
-->
<script lang="ts">
  let {
    isExpanded = false,
    onToggle = () => {},
  }: {
    isExpanded?: boolean;
    onToggle?: () => void;
  } = $props();
</script>

<button
  class="expand-toggle-btn"
  onclick={onToggle}
  type="button"
  title={isExpanded ? "Show less controls" : "Show more controls"}
  aria-label={isExpanded ? "Collapse controls" : "Expand controls"}
>
  <i class="fas {isExpanded ? 'fa-chevron-down' : 'fa-chevron-up'}"></i>
</button>

<style>
  .expand-toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: clamp(44px, 8.8vw, 48px);
    padding: clamp(8px, 1.6vw, 10px);
    background: linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.3) 0%,
      rgba(124, 58, 237, 0.3) 100%
    );
    border: 2px solid rgba(139, 92, 246, 0.5);
    border-radius: clamp(8px, 1.6vw, 10px);
    color: rgba(221, 214, 254, 1);
    font-size: clamp(16px, 3.2vw, 18px);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    flex: 1 1 calc(50% - 4px);
    min-width: 0;
  }

  @media (hover: hover) and (pointer: fine) {
    .expand-toggle-btn:hover {
      background: linear-gradient(
        135deg,
        rgba(139, 92, 246, 0.4) 0%,
        rgba(124, 58, 237, 0.4) 100%
      );
      border-color: rgba(139, 92, 246, 0.7);
      transform: translateY(-1px);
      box-shadow: 0 2px 12px rgba(139, 92, 246, 0.3);
    }
  }

  .expand-toggle-btn:active {
    transform: scale(0.98);
  }
</style>
