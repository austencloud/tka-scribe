<!--
  QuickFeedbackPanel - Desktop hotkey-triggered feedback drawer

  Opens via 'f' hotkey on desktop, slides in from the right as a side panel.
  Uses container queries for intelligent responsive sizing.
-->
<script lang="ts">
  import { quickFeedbackState } from "../../state/quick-feedback-state.svelte";
  import { createFeedbackSubmitState } from "../../state/feedback-submit-state.svelte";
  import FeedbackForm from "../submit/FeedbackForm.svelte";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";

  // Create form state when panel opens, reset when it closes
  let formState = $state(createFeedbackSubmitState());

  function handleClose() {
    console.log("🔴 QuickFeedbackPanel handleClose called, current isOpen:", quickFeedbackState.isOpen);
    quickFeedbackState.close();
    console.log("🔴 After close(), isOpen:", quickFeedbackState.isOpen);
    // Reset form state for next time
    formState = createFeedbackSubmitState();
  }

  // Watch for successful submission to auto-close after delay
  $effect(() => {
    if (formState.submitStatus === "success") {
      const timeout = setTimeout(() => {
        handleClose();
      }, 1500);
      return () => clearTimeout(timeout);
    }
    return undefined;
  });
</script>

<Drawer
  isOpen={quickFeedbackState.isOpen}
  placement="right"
  onclose={handleClose}
  onbackdropclick={(e) => {
    console.log("🟡 Backdrop clicked!", e);
    handleClose();
    return true;
  }}
  closeOnBackdrop={true}
  closeOnEscape={true}
  ariaLabel="Quick Feedback"
  showHandle={false}
  dismissible={true}
  class="quick-feedback-drawer"
>
  <div class="quick-feedback-panel">
    <!-- Left edge drag handle for swipe-to-dismiss -->
    <div class="swipe-edge" aria-hidden="true">
      <div class="swipe-indicator"></div>
    </div>

    <!-- Main content column -->
    <div class="panel-content">
      <header class="panel-header">
        <div class="header-title">
          <i class="fas fa-comment-dots" aria-hidden="true"></i>
          <h2>Quick Feedback</h2>
        </div>
        <button
          class="close-btn"
          onclick={handleClose}
          aria-label="Close panel"
          type="button"
        >
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </header>

      <div class="keyboard-hint" aria-hidden="true">
        <kbd>f</kbd>
        <span>or</span>
        <kbd>Esc</kbd>
        <span>to close</span>
      </div>

      <main class="panel-body">
        <FeedbackForm {formState} />
      </main>
    </div>
  </div>
</Drawer>

<style>
  /* ═══════════════════════════════════════════════════════════════════════════
     QUICK FEEDBACK PANEL - Container Query Based Layout
     ═══════════════════════════════════════════════════════════════════════════ */
  .quick-feedback-panel {
    /* Establish container for queries */
    container-type: inline-size;
    container-name: quick-feedback;

    /* Layout - row to accommodate swipe edge */
    display: flex;
    flex-direction: row;
    height: 100%;
    overflow: hidden;
    position: relative;

    /* Fluid spacing based on container width */
    --panel-padding: clamp(16px, 5cqi, 24px);
    --panel-gap: clamp(12px, 4cqi, 20px);

    /* Colors */
    --accent: #6366f1;
    --text-primary: rgba(255, 255, 255, 0.95);
    --text-secondary: rgba(255, 255, 255, 0.7);
    --text-muted: rgba(255, 255, 255, 0.5);
    --border-subtle: rgba(255, 255, 255, 0.1);
    --bg-subtle: rgba(255, 255, 255, 0.05);
    --bg-hover: rgba(255, 255, 255, 0.1);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     SWIPE EDGE - Left edge for drag-to-dismiss
     ═══════════════════════════════════════════════════════════════════════════ */
  .swipe-edge {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: ew-resize;
    z-index: 10;
    touch-action: pan-x;
  }

  .swipe-edge:hover .swipe-indicator {
    opacity: 0.6;
    height: 60px;
  }

  .swipe-indicator {
    width: 4px;
    height: 40px;
    background: var(--accent);
    border-radius: 2px;
    opacity: 0.3;
    transition: all 200ms ease;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     PANEL CONTENT - Main content wrapper
     ═══════════════════════════════════════════════════════════════════════════ */
  .panel-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    margin-left: 20px; /* Space for swipe edge */
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     HEADER - Fixed at top
     ═══════════════════════════════════════════════════════════════════════════ */
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--panel-gap);
    padding: var(--panel-padding);
    padding-bottom: clamp(12px, 3cqi, 16px);
    border-bottom: 1px solid var(--border-subtle);
    flex-shrink: 0;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: clamp(8px, 2.5cqi, 12px);
  }

  .header-title i {
    font-size: clamp(1rem, 5cqi, 1.25rem);
    color: var(--accent);
  }

  .header-title h2 {
    margin: 0;
    /* Minimum 16px for accessibility, scales with container */
    font-size: clamp(1rem, 5cqi, 1.25rem);
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.02em;
  }

  /* Close button - 48px minimum touch target */
  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 48px;
    min-height: 48px;
    width: clamp(48px, 12cqi, 52px);
    height: clamp(48px, 12cqi, 52px);
    background: var(--bg-subtle);
    border: 1px solid var(--border-subtle);
    border-radius: clamp(8px, 2cqi, 12px);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 150ms ease;
    flex-shrink: 0;
  }

  .close-btn:hover {
    background: var(--bg-hover);
    border-color: rgba(255, 255, 255, 0.15);
    color: var(--text-primary);
  }

  .close-btn:active {
    transform: scale(0.96);
  }

  .close-btn i {
    font-size: clamp(0.875rem, 4cqi, 1rem);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     KEYBOARD HINT
     ═══════════════════════════════════════════════════════════════════════════ */
  .keyboard-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(4px, 1.5cqi, 8px);
    padding: clamp(8px, 2cqi, 12px) var(--panel-padding);
    /* Minimum 14px for readability */
    font-size: clamp(0.875rem, 3.5cqi, 0.9375rem);
    color: var(--text-muted);
    background: linear-gradient(
      180deg,
      rgba(99, 102, 241, 0.08) 0%,
      transparent 100%
    );
    flex-shrink: 0;
  }

  .keyboard-hint kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: clamp(24px, 6cqi, 28px);
    min-height: clamp(24px, 6cqi, 28px);
    padding: clamp(2px, 0.5cqi, 4px) clamp(6px, 2cqi, 10px);
    background: rgba(99, 102, 241, 0.15);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: clamp(4px, 1cqi, 6px);
    font-family: inherit;
    /* Minimum 12px */
    font-size: clamp(0.75rem, 3cqi, 0.8125rem);
    font-weight: 600;
    color: rgba(99, 102, 241, 0.9);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     PANEL BODY - Scrollable content area, vertically centered
     ═══════════════════════════════════════════════════════════════════════════ */
  .panel-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow-y: auto;
    overflow-x: hidden;
    padding: var(--panel-padding);

    /* Smooth scrolling */
    scroll-behavior: smooth;
    overscroll-behavior: contain;

    /* Custom scrollbar */
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  }

  .panel-body::-webkit-scrollbar {
    width: 6px;
  }

  .panel-body::-webkit-scrollbar-track {
    background: transparent;
  }

  .panel-body::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  .panel-body::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     CONTAINER QUERIES - Responsive adjustments
     ═══════════════════════════════════════════════════════════════════════════ */

  /* Narrow panel (< 320px) - tighter spacing */
  @container quick-feedback (max-width: 320px) {
    .panel-header {
      flex-wrap: wrap;
    }

    .keyboard-hint {
      flex-wrap: wrap;
    }
  }

  /* Wide panel (> 400px) - more breathing room */
  @container quick-feedback (min-width: 400px) {
    .panel-header {
      padding: clamp(20px, 6cqi, 28px);
      padding-bottom: clamp(16px, 4cqi, 20px);
    }

    .panel-body {
      padding: clamp(20px, 6cqi, 28px);
      padding-top: clamp(16px, 4cqi, 20px);
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     GLOBAL DRAWER OVERRIDES
     ═══════════════════════════════════════════════════════════════════════════ */
  :global(.quick-feedback-drawer) {
    /* Responsive width with min/max bounds */
    width: clamp(320px, 30vw, 420px);
    max-width: 90vw;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .close-btn {
      transition: none;
    }

    .panel-body {
      scroll-behavior: auto;
    }
  }
</style>
