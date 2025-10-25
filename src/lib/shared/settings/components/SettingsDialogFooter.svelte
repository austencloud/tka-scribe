<script lang="ts">
  import { quintOut } from "svelte/easing";
  import { fade } from "svelte/transition";

  interface Props {
    /** Whether there are unsaved changes */
    hasUnsavedChanges?: boolean;
    /** Callback when cancel button is clicked */
    onCancel: () => void;
    /** Callback when apply button is clicked */
    onApply: () => void;
    /** Text for the cancel button */
    cancelText?: string;
    /** Text for the apply button */
    applyText?: string;
  }

  let {
    hasUnsavedChanges = false,
    onCancel,
    onApply,
    cancelText = "Cancel",
    applyText = "Apply Settings",
  }: Props = $props();
</script>

<div
  class="dialog-footer"
  in:fade={{ duration: 200, delay: 300, easing: quintOut }}
  out:fade={{ duration: 150, easing: quintOut }}
>
  <button class="cancel-button" onclick={onCancel}>{cancelText}</button>
  <button
    class="apply-button"
    class:has-changes={hasUnsavedChanges}
    onclick={onApply}
  >
    {#if hasUnsavedChanges}
      <span class="changes-indicator">●</span>
    {/if}
    {applyText}
  </button>
</div>

<style>
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: clamp(12px, 1.5vw, 24px);
    padding: clamp(16px, 2vw, 32px);
    border-top: var(--glass-border);
    background: rgba(255, 255, 255, 0.03);
    flex-wrap: wrap;
  }

  .cancel-button,
  .apply-button {
    padding: clamp(8px, 1vw, 12px) clamp(16px, 2vw, 32px);
    border-radius: 6px;
    font-size: clamp(12px, 1.2vw, 16px);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
    min-width: clamp(80px, 10vw, 120px);
  }

  .cancel-button {
    background: transparent;
    border: var(--glass-border);
    color: var(--text-secondary);
  }

  .cancel-button:hover {
    background: rgba(255, 255, 255, 0.06);
    color: white;
  }

  .apply-button {
    background: var(--primary-color);
    border: 1px solid var(--primary-color);
    color: white;
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
  }

  .apply-button:hover {
    background: var(--primary-light);
    border-color: var(--primary-light);
  }

  /* Unsaved changes indicator */
  .apply-button.has-changes {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    border-color: #f59e0b;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
    animation: pulse-warning 2s ease-in-out infinite;
  }

  .apply-button.has-changes:hover {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    box-shadow: 0 6px 16px rgba(245, 158, 11, 0.5);
  }

  .changes-indicator {
    font-size: 12px;
    animation: blink 1.5s ease-in-out infinite;
  }

  @keyframes pulse-warning {
    0%,
    100% {
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
    }
    50% {
      box-shadow: 0 4px 16px rgba(245, 158, 11, 0.6);
    }
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .dialog-footer {
      padding: 16px 20px;
      flex-shrink: 0;
    }
  }

  @media (max-width: 480px) {
    .dialog-footer {
      padding: 16px;
      gap: 12px;
      min-height: 68px;
    }

    .cancel-button,
    .apply-button {
      flex: 1;
      min-height: 44px;
      font-size: 15px;
    }
  }

  @media (max-width: 390px) {
    .dialog-footer {
      padding: 12px;
    }
  }

  /* Height-constrained devices */
  @media (max-height: 600px) {
    .dialog-footer {
      padding: clamp(8px, 1.5vw, 12px);
      flex-shrink: 0;
    }
  }
</style>
