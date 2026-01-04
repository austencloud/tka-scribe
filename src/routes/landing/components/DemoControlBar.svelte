<!--
  DemoControlBar.svelte

  Control buttons for the landing page animation demo.
  Includes: dark mode toggle, change prop, and randomize sequence buttons.
-->
<script lang="ts">
  interface Props {
    servicesReady: boolean;
    isLoading: boolean;
    darkMode: boolean;
    onToggleDarkMode: () => void;
    onChangeProp: () => void;
    onRandomize: () => void;
  }

  let {
    servicesReady,
    isLoading,
    darkMode,
    onToggleDarkMode,
    onChangeProp,
    onRandomize,
  }: Props = $props();

  const isDisabled = $derived(!servicesReady || isLoading);
</script>

<div class="demo-controls">
  <button
    class="light-toggle-btn"
    class:dark-mode={darkMode}
    onclick={onToggleDarkMode}
    disabled={isDisabled}
    aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path
        d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V18h8v-3.3A7 7 0 0 0 12 2z"
        fill={darkMode ? "none" : "currentColor"}
      />
    </svg>
  </button>

  <button class="change-prop-btn" onclick={onChangeProp} disabled={isDisabled}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path
        d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
        stroke-linecap="round"
      />
    </svg>
    <span>Change Prop</span>
  </button>

  <button class="randomize-btn" onclick={onRandomize} disabled={isDisabled}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
    </svg>
    <span>Try Another</span>
  </button>
</div>

<style>
  .demo-controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  /* Light/Dark Mode Toggle Button */
  .light-toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: var(--bg-card, rgba(255, 255, 255, 0.03));
    border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
    border-radius: 50%;
    color: var(--text-muted, rgba(255, 255, 255, 0.6));
    cursor: pointer;
    transition: all 0.25s ease;
  }

  .light-toggle-btn svg {
    width: 24px;
    height: 24px;
  }

  .light-toggle-btn:hover:not(:disabled) {
    background: var(--bg-card-hover, rgba(255, 255, 255, 0.06));
    border-color: var(--border-strong, rgba(255, 255, 255, 0.2));
    color: var(--text, #ffffff);
    transform: scale(1.05);
  }

  .light-toggle-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .light-toggle-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .light-toggle-btn.dark-mode {
    background: rgba(99, 102, 241, 0.15);
    border-color: rgba(99, 102, 241, 0.4);
    color: var(--primary-light, #818cf8);
    box-shadow:
      0 0 20px rgba(99, 102, 241, 0.3),
      inset 0 0 15px rgba(99, 102, 241, 0.1);
  }

  .light-toggle-btn.dark-mode:hover:not(:disabled) {
    background: rgba(99, 102, 241, 0.25);
    box-shadow:
      0 0 30px rgba(99, 102, 241, 0.5),
      inset 0 0 20px rgba(99, 102, 241, 0.15);
  }

  /* Change Prop Button */
  .change-prop-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 28px;
    background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
    border: none;
    border-radius: 100px;
    color: white;
    font-size: var(--font-size-base, 1rem);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 20px rgba(13, 148, 136, 0.3);
  }

  .change-prop-btn:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 30px rgba(13, 148, 136, 0.4);
  }

  .change-prop-btn:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  .change-prop-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .change-prop-btn svg {
    width: 20px;
    height: 20px;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* Randomize Button */
  .randomize-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 28px;
    background: linear-gradient(
      135deg,
      var(--primary, #6366f1) 0%,
      #818cf8 100%
    );
    border: none;
    border-radius: 100px;
    color: white;
    font-size: var(--font-size-base, 1rem);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
  }

  .randomize-btn:hover:not(:disabled) {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
  }

  .randomize-btn:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  .randomize-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .randomize-btn svg {
    width: 20px;
    height: 20px;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* Mobile */
  @media (max-width: 600px) {
    .demo-controls {
      gap: 10px;
    }

    .light-toggle-btn {
      width: 44px;
      height: 44px;
    }

    .light-toggle-btn svg {
      width: 22px;
      height: 22px;
    }

    .randomize-btn,
    .change-prop-btn {
      padding: 12px 20px;
      font-size: var(--font-size-sm, 0.875rem);
    }

    .randomize-btn svg,
    .change-prop-btn svg {
      width: 18px;
      height: 18px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .randomize-btn,
    .change-prop-btn,
    .light-toggle-btn {
      transition: none;
    }

    .randomize-btn:hover:not(:disabled),
    .randomize-btn:active:not(:disabled),
    .change-prop-btn:hover:not(:disabled),
    .change-prop-btn:active:not(:disabled),
    .light-toggle-btn:hover:not(:disabled),
    .light-toggle-btn:active:not(:disabled) {
      transform: none;
    }
  }
</style>
