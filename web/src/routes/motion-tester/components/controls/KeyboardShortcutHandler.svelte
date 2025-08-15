<!--
KeyboardShortcutHandler.svelte - Keyboard shortcut handling and display

Single responsibility: Handle keyboard shortcuts for animation controls and show hints.
No visual controls, no animation logic - just keyboard event handling.
-->
<script lang="ts">
  interface Props {
    onPlayToggle: () => void;
    onReset: () => void;
    showHints?: boolean;
  }

  let { onPlayToggle, onReset, showHints = true }: Props = $props();

  function handleKeyDown(event: KeyboardEvent) {
    // Space bar for play/pause
    if (event.code === "Space" && event.target === event.currentTarget) {
      event.preventDefault();
      onPlayToggle();
    }
    // R key for reset
    if (event.key === "r" || event.key === "R") {
      event.preventDefault();
      onReset();
    }
  }
</script>



<style>


  .keyboard-hint {
    display: flex;
    justify-content: center;
    gap: 12px;
    font-size: 10px;
    color: #a5b4fc;
  }

  /* Hide hints on mobile */
  @media (max-width: 768px) {
    .keyboard-hint {
      display: none;
    }
  }
</style>
