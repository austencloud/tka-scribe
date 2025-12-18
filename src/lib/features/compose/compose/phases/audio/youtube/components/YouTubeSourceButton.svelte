<script lang="ts">
  /**
   * YouTubeSourceButton
   *
   * Button to open YouTube import panel. Used in AudioPhase drop zone.
   */

  interface Props {
    onclick: () => void;
    disabled?: boolean;
  }

  let { onclick, disabled = false }: Props = $props();
</script>

<button class="youtube-btn" {onclick} {disabled}>
  <span class="icon-wrapper">
    <svg viewBox="0 0 24 24" class="youtube-icon" aria-hidden="true">
      <path
        d="M23.5 6.2c-.3-1-1-1.8-2-2.1C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.5.6c-1 .3-1.7 1.1-2 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8c.3 1 1 1.8 2 2.1 1.9.6 9.5.6 9.5.6s7.6 0 9.5-.6c1-.3 1.7-1.1 2-2.1.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.4 3.6-6.4 3.6z"
        fill="currentColor"
      />
    </svg>
  </span>
  <span class="label">Import from YouTube</span>
</button>

<style>
  .youtube-btn {
    display: flex;
    align-items: center;
    gap: var(--settings-spacing-sm, 8px);
    padding: var(--settings-spacing-sm, 10px) var(--settings-spacing-md, 16px);
    background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
    border: none;
    border-radius: var(--settings-radius-md, 8px);
    color: #ffffff;
    font-size: var(--font-size-sm, 14px);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .youtube-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #ff1a1a 0%, #e60000 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 0, 0, 0.3);
  }

  .youtube-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .youtube-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .youtube-icon {
    width: 20px;
    height: 20px;
  }

  .label {
    white-space: nowrap;
  }
</style>
