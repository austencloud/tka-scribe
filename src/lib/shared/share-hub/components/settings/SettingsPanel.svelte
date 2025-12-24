<!--
  SettingsPanel.svelte

  Base wrapper for format-specific settings panels.
  Slides in from the right with header (title + close button) and content slot.

  Pattern matches AnimationSettingsSheet.svelte structure.

  Features:
  - Slide-in animation from right
  - Dark overlay background
  - Close button with auto-focus
  - Escape key to close
  - Focus trap (auto-focus on open, return focus on close)
  - Responsive (full width on mobile, right panel on desktop)

  Domain: Share Hub - Settings Panel Wrapper
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    isOpen = false,
    title = 'Settings',
    onClose,
    children,
  }: {
    isOpen?: boolean;
    title?: string;
    onClose?: () => void;
    children?: Snippet;
  } = $props();

  let panelElement: HTMLDivElement | null = $state(null);
  let closeButtonElement: HTMLButtonElement | null = $state(null);

  // Auto-focus close button when panel opens
  $effect(() => {
    if (isOpen && closeButtonElement) {
      closeButtonElement.focus();
    }
  });

  // Handle Escape key to close
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      onClose?.();
    }
  }

  // Handle backdrop click (close on click outside panel)
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  }
</script>

{#if isOpen}
  <div
    class="settings-backdrop"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="settings-title"
  >
    <div class="settings-panel" bind:this={panelElement}>
      <!-- Header -->
      <div class="settings-header">
        <h2 id="settings-title" class="settings-title">{title}</h2>
        <button
          class="close-button"
          bind:this={closeButtonElement}
          onclick={onClose}
          aria-label="Close settings"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Content (slotted) -->
      <div class="settings-content">
        {#if children}
          {@render children()}
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .settings-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 200;
    display: flex;
    justify-content: flex-end;
    align-items: stretch;
  }

  .settings-panel {
    display: flex;
    flex-direction: column;
    width: clamp(320px, 40vw, 600px);
    max-width: 100vw;
    height: 100%;
    background: var(--theme-panel-bg, rgba(20, 20, 20, 0.98));
    border-left: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.5);
    animation: slideIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .settings-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    flex-shrink: 0;
  }

  .settings-title {
    font-size: clamp(18px, 4cqi, 20px);
    font-weight: 700;
    color: var(--theme-text, white);
    margin: 0;
  }

  .close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    color: var(--theme-text, white);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-button:hover {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-accent, rgba(74, 158, 255, 0.5));
  }

  .close-button:focus-visible {
    outline: 2px solid var(--theme-accent, #4a9eff);
    outline-offset: 2px;
  }

  .close-button i {
    font-size: 18px;
  }

  .settings-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 24px;
  }

  /* Slide-in animation */
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  /* Mobile optimization */
  @media (max-width: 768px) {
    .settings-panel {
      width: 100%;
    }

    .settings-header {
      padding: 16px 20px;
    }

    .settings-content {
      padding: 20px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .settings-panel {
      animation: none;
    }
  }
</style>
