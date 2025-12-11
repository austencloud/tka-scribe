<!--
  ConflictWarning.svelte

  Displays a warning when a key combo conflicts with an existing shortcut.
  Shows severity level and conflicting shortcut information.
-->
<script lang="ts">
  import type { ShortcutConflict } from "../../domain/types/keyboard-types";

  let {
    conflict,
    onReplace = undefined,
    onSwap = undefined,
  }: {
    conflict: ShortcutConflict;
    onReplace?: () => void;
    onSwap?: () => void;
  } = $props();

  const isError = $derived(conflict.severity === "error");
</script>

<div class="conflict-warning" class:error={isError} class:warning={!isError}>
  <div class="conflict-icon">
    <i class="fas fa-exclamation-triangle"></i>
  </div>
  <div class="conflict-info">
    <span class="conflict-title">
      {isError ? "Shortcut Conflict" : "Potential Conflict"}
    </span>
    <span class="conflict-detail">
      Already assigned to "{conflict.existingShortcutLabel}"
      {#if !isError}
        <span class="context-note">(in different context)</span>
      {/if}
    </span>
  </div>
  {#if onReplace || onSwap}
    <div class="conflict-actions">
      {#if onSwap}
        <button class="conflict-btn swap" onclick={onSwap} type="button">
          Swap
        </button>
      {/if}
      {#if onReplace && isError}
        <button class="conflict-btn replace" onclick={onReplace} type="button">
          Replace
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .conflict-warning {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 10px;
    margin-top: 8px;
  }

  .conflict-warning.error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .conflict-warning.warning {
    background: rgba(234, 179, 8, 0.1);
    border: 1px solid rgba(234, 179, 8, 0.3);
  }

  .conflict-icon {
    flex-shrink: 0;
    font-size: 16px;
  }

  .error .conflict-icon {
    color: #ef4444;
  }

  .warning .conflict-icon {
    color: #eab308;
  }

  .conflict-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .conflict-title {
    font-weight: 600;
    font-size: 13px;
  }

  .error .conflict-title {
    color: #ef4444;
  }

  .warning .conflict-title {
    color: #eab308;
  }

  .conflict-detail {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
  }

  .context-note {
    color: rgba(255, 255, 255, 0.4);
    font-style: italic;
  }

  .conflict-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .conflict-btn {
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 150ms ease;
  }

  .conflict-btn.replace {
    background: #ef4444;
    border: none;
    color: white;
  }

  .conflict-btn.replace:hover {
    background: #dc2626;
  }

  .conflict-btn.swap {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
  }

  .conflict-btn.swap:hover {
    background: rgba(255, 255, 255, 0.15);
  }
</style>
