<!--
CodexPanel - Modern slide-in reference panel for pictograph lookup

A beautifully styled slide-in drawer that provides quick access to
the TKA letter codex while working through concepts or flash card drills.

Features:
- Smooth slide-in animation from right
- Glass morphism styling consistent with app design
- Backdrop overlay that closes panel when clicked
- Properly sized content area
- Keyboard shortcut: Escape to close
- Mobile: Full-screen overlay
- Desktop: Side panel (480px width)
-->
<script lang="ts">
  import type { PictographData } from "$shared";
  import { onMount } from "svelte";
  import CodexComponent from "../codex/components/CodexComponent.svelte";

  interface Props {
    /** Whether the panel is currently open */
    isOpen?: boolean;
    /** Callback when panel should close */
    onClose?: () => void;
    /** Whether to filter codex by unlocked concepts */
    filterByProgress?: boolean;
    /** Optional title override */
    title?: string;
  }

  let {
    isOpen = $bindable(false),
    onClose,
    filterByProgress = false,
    title = "Letters Reference",
  }: Props = $props();

  // Panel animation state
  let panelElement: HTMLElement | undefined = $state();
  let isAnimating = $state(false);

  // Handle Escape key to close panel
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape" && isOpen) {
      closePanel();
    }
  }

  // Close panel with animation
  function closePanel() {
    if (isAnimating) return;
    isOpen = false;
    onClose?.();
  }

  // Handle backdrop click (close panel)
  function handleBackdropClick(event: MouseEvent) {
    // Only close if clicking the backdrop, not the panel itself
    if (event.target === event.currentTarget) {
      closePanel();
    }
  }

  // Handle pictograph selection
  function handlePictographSelected(pictograph: PictographData) {
    console.log("📖 CodexPanel: Pictograph selected:", pictograph);
    // Keep panel open for reference - user can close manually
  }

  // Add/remove keyboard listener
  onMount(() => {
    return () => {
      // Cleanup if needed
    };
  });

  // Prevent body scroll when panel is open
  $effect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  });
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if isOpen}
  <!-- Backdrop overlay -->
  <div
    class="codex-backdrop"
    onclick={handleBackdropClick}
    onkeydown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        closePanel();
      }
    }}
    role="button"
    tabindex="0"
    aria-label="Close codex panel"
  >
    <!-- Slide-in panel -->
    <aside
      bind:this={panelElement}
      class="codex-panel"
      class:open={isOpen}
      aria-label="Pictograph reference panel"
    >
      <!-- Panel header -->
      <header class="panel-header">
        <div class="header-content">
          <div class="header-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
            </svg>
          </div>
          <h2 class="panel-title">{title}</h2>
        </div>
        <button
          class="close-button"
          onclick={closePanel}
          aria-label="Close panel"
          type="button"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </header>

      <!-- Panel content -->
      <div class="panel-content">
        <CodexComponent
          isVisible={isOpen}
          onPictographSelected={handlePictographSelected}
        />
      </div>

      <!-- Quick tip -->
      <footer class="panel-footer">
        <div class="tip">
          <span class="tip-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </span>
          <span class="tip-text">Tap any pictograph to view details</span>
        </div>
      </footer>
    </aside>
  </div>
{/if}

<style>
  /* Backdrop overlay */
  .codex-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    z-index: 1000;
    animation: fadeIn 250ms ease-out;
    cursor: pointer;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Slide-in panel */
  .codex-panel {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 420px;
    max-width: 92vw;
    background: linear-gradient(
      180deg,
      rgba(30, 30, 35, 0.98) 0%,
      rgba(22, 22, 28, 0.99) 100%
    );
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow:
      -8px 0 40px rgba(0, 0, 0, 0.4),
      -2px 0 8px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    animation: slideIn 300ms cubic-bezier(0.16, 1, 0.3, 1);
    cursor: default;
    overflow: hidden;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0.8;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  /* Panel header */
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(12px);
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15));
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(99, 102, 241, 0.25);
  }

  .panel-title {
    font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: 1.125rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
    letter-spacing: -0.01em;
  }

  .close-button {
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    border-radius: 10px;
    transition: all 200ms ease;
    padding: 0;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.95);
  }

  .close-button:active {
    transform: scale(0.94);
  }

  .close-button:focus-visible {
    outline: 2px solid rgba(99, 102, 241, 0.8);
    outline-offset: 2px;
  }

  /* Panel content */
  .panel-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 16px;
    min-height: 0; /* Important for flex scroll */
  }

  /* Custom scrollbar */
  .panel-content::-webkit-scrollbar {
    width: 6px;
  }

  .panel-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .panel-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
  }

  .panel-content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  /* Panel footer */
  .panel-footer {
    padding: 12px 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);
  }

  .tip {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tip-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(99, 102, 241, 0.7);
    flex-shrink: 0;
  }

  .tip-text {
    font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.4;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .codex-panel {
      width: 100vw;
      max-width: 100vw;
      border-left: none;
    }

    .panel-header {
      padding: 14px 16px;
    }

    .header-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
    }

    .header-icon svg {
      width: 18px;
      height: 18px;
    }

    .panel-title {
      font-size: 1rem;
    }

    .close-button {
      width: 36px;
      height: 36px;
      min-width: 36px;
      min-height: 36px;
      border-radius: 8px;
    }

    .close-button svg {
      width: 18px;
      height: 18px;
    }

    .panel-content {
      padding: 12px;
    }

    .panel-footer {
      padding: 10px 16px;
    }

    .tip-text {
      font-size: 0.75rem;
    }
  }

  /* Accessibility - reduce motion */
  @media (prefers-reduced-motion: reduce) {
    .codex-backdrop,
    .codex-panel {
      animation: none;
    }

    .close-button {
      transition: none;
    }
  }
</style>
