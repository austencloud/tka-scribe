<!-- ActionToast - Toast with optional undo/redo button -->
<script lang="ts">
  let {
    message,
    showUndo = false,
    showRedo = false,
    onUndo,
    onRedo,
  }: {
    message: string;
    showUndo?: boolean;
    showRedo?: boolean;
    onUndo?: () => void;
    onRedo?: () => void;
  } = $props();
</script>

<div class="toast">
  <span>{message}</span>
  {#if showUndo && onUndo}
    <button type="button" class="toast-btn" onclick={onUndo}>Undo</button>
  {:else if showRedo && onRedo}
    <button type="button" class="toast-btn" onclick={onRedo}>Redo</button>
  {/if}
</div>

<style>
  .toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(30, 30, 35, 0.95);
    backdrop-filter: blur(12px);
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.15));
    border-radius: 10px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    font-size: 13px;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    z-index: 1000;
    animation: slideUp 0.2s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  .toast-btn {
    padding: 6px 12px;
    background: color-mix(
      in srgb,
      var(--theme-accent, #8b5cf6) 20%,
      transparent
    );
    border: 1px solid
      color-mix(in srgb, var(--theme-accent, #8b5cf6) 40%, transparent);
    border-radius: 6px;
    color: var(--theme-accent, #c4b5fd);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }

  .toast-btn:hover {
    background: color-mix(
      in srgb,
      var(--theme-accent, #8b5cf6) 30%,
      transparent
    );
    color: var(--theme-accent-strong, #ddd6fe);
  }
</style>
