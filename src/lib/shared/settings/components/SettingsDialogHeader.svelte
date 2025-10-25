<script lang="ts">
  import { quintOut } from "svelte/easing";
  import { fade } from "svelte/transition";

  interface Props {
    /** Title of the dialog */
    title?: string;
    /** Callback when close button is clicked */
    onClose: () => void;
  }

  let { title = "Settings", onClose }: Props = $props();
</script>

<div
  class="dialog-header"
  in:fade={{ duration: 200, delay: 100, easing: quintOut }}
  out:fade={{ duration: 150, easing: quintOut }}
>
  <h2 id="settings-title">{title}</h2>
  <button class="close-button" onclick={onClose} aria-label="Close settings">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
  </button>
</div>

<style>
  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: clamp(16px, 2vw, 32px);
    border-bottom: var(--glass-border);
    background: rgba(255, 255, 255, 0.03);
  }

  .dialog-header h2 {
    margin: 0;
    font-size: clamp(20px, 2.5vw, 28px);
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.02em;
  }

  .close-button {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: clamp(8px, 1vw, 12px);
    border-radius: var(--border-radius-sm);
    transition: all var(--transition-fast);
    min-width: clamp(32px, 4vw, 44px);
    min-height: clamp(32px, 4vw, 44px);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.08);
    color: white;
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .dialog-header {
      padding: 16px 20px;
      flex-shrink: 0;
    }
  }

  @media (max-width: 480px) {
    .dialog-header {
      padding: 14px 16px;
      min-height: 56px;
    }

    .dialog-header h2 {
      font-size: 18px;
    }
  }

  @media (max-width: 390px) {
    .dialog-header {
      padding: 12px;
    }

    .dialog-header h2 {
      font-size: 17px;
    }
  }

  /* Height-constrained devices */
  @media (max-height: 600px) {
    .dialog-header {
      padding: clamp(8px, 1.5vw, 12px);
      flex-shrink: 0;
    }
  }
</style>
