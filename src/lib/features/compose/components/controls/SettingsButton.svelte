<!--
  SettingsButton.svelte

  Round settings button (gear icon) that opens the settings sheet.
-->
<script lang="ts">
  let {
    onclick = () => {},
    disabled = false,
  }: {
    onclick?: () => void;
    disabled?: boolean;
  } = $props();
</script>

<button
  class="settings-round-btn"
  {onclick}
  {disabled}
  type="button"
  aria-label="Open settings"
>
  <i class="fas fa-cog" aria-hidden="true"></i>
</button>

<style>
  /* Round settings button */
  .settings-round-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 50%;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: 18px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 var(--theme-card-bg, rgba(255, 255, 255, 0.03));
  }

  @media (hover: hover) and (pointer: fine) {
    .settings-round-btn:hover:not(:disabled) {
      background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
      border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.25));
      color: var(--theme-text, rgba(255, 255, 255, 0.9));
      transform: scale(1.05);
      box-shadow:
        0 2px 8px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 var(--theme-card-hover-bg, rgba(255, 255, 255, 0.05));
    }
  }

  .settings-round-btn:active:not(:disabled) {
    transform: scale(0.96);
  }

  .settings-round-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* Responsive adjustments */
  @media (max-width: 480px) {
    .settings-round-btn {
      width: 48px;
      height: 48px;
      font-size: 16px;
    }
  }

  @media (max-width: 375px) and (max-height: 670px) {
    .settings-round-btn {
      width: 44px;
      height: 44px;
      font-size: 15px;
    }
  }
</style>
