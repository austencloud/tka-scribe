<!--
  ExpandToggleButton.svelte

  Simple button to toggle expanded state in animation controls
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
  class:expanded={isExpanded}
  onclick={onToggle}
  aria-label={isExpanded ? "Collapse controls" : "Expand controls"}
  type="button"
>
  <i class="fas {isExpanded ? 'fa-chevron-down' : 'fa-chevron-up'}"></i>
</button>

<style>
  .expand-toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.05);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
  }

  .expand-toggle-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.18);
    color: rgba(255, 255, 255, 0.9);
  }

  .expand-toggle-btn:active {
    transform: scale(0.96);
  }

  .expand-toggle-btn.expanded {
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.4);
    color: rgba(167, 139, 250, 1);
  }
</style>
