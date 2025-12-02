<!-- FeedbackSubmitTab - Premium responsive container for feedback submission -->
<script lang="ts">
  import FeedbackForm from "./FeedbackForm.svelte";
  import { createFeedbackSubmitState } from "../../state/feedback-submit-state.svelte";

  // Create form state
  const submitState = createFeedbackSubmitState();
</script>

<div class="submit-tab">
  <div class="submit-container">
    <!-- Header -->
    <header class="submit-header">
      <div class="header-icon">
        <i class="fas fa-paper-plane"></i>
      </div>
      <h1 class="header-title">Submit Feedback</h1>
      <p class="header-subtitle">
        Help us improve TKA Studio by sharing bugs, feature requests, or general feedback.
      </p>
      <div class="header-divider"></div>
    </header>

    <!-- Form Content -->
    <div class="submit-content">
      <FeedbackForm formState={submitState} />
    </div>

    <!-- Footer hint (visible on desktop) -->
    <footer class="submit-footer">
      <p class="footer-note">
        <i class="fas fa-shield-alt"></i>
        Your feedback helps shape the future of TKA Studio
      </p>
    </footer>
  </div>
</div>

<style>
  /* ═══════════════════════════════════════════════════════════════════════════
     DESIGN TOKENS (Golden Ratio × 8-point grid)
     ═══════════════════════════════════════════════════════════════════════════ */
  .submit-tab {
    /* Spacing (φ = 1.618) */
    --fb-space-3xs: 4px;
    --fb-space-2xs: 6px;
    --fb-space-xs: 8px;
    --fb-space-sm: 13px;
    --fb-space-md: 21px;
    --fb-space-lg: 34px;
    --fb-space-xl: 55px;
    --fb-space-2xl: 89px;

    /* Typography */
    --fb-text-xs: 0.75rem;
    --fb-text-sm: 0.875rem;
    --fb-text-base: 1rem;
    --fb-text-lg: 1.25rem;
    --fb-text-xl: 1.5625rem;
    --fb-text-2xl: 1.9375rem;

    /* Radii */
    --fb-radius-sm: 8px;
    --fb-radius-md: 12px;
    --fb-radius-lg: 16px;
    --fb-radius-xl: 20px;

    /* Colors */
    --fb-primary: #10b981;
    --fb-primary-glow: rgba(16, 185, 129, 0.15);
    --fb-surface: rgba(255, 255, 255, 0.03);
    --fb-border: rgba(255, 255, 255, 0.08);
    --fb-text: rgba(255, 255, 255, 0.95);
    --fb-text-muted: rgba(255, 255, 255, 0.6);
    --fb-text-subtle: rgba(255, 255, 255, 0.35);

    /* Layout */
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    background: var(--background, #0a0a0f);

    /* Mobile padding - compact */
    padding: var(--fb-space-md);
    padding-bottom: calc(var(--fb-space-xl) + env(safe-area-inset-bottom, 0px));
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     CONTAINER - Centered with max-width
     ═══════════════════════════════════════════════════════════════════════════ */
  .submit-container {
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    gap: var(--fb-space-lg);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     HEADER
     ═══════════════════════════════════════════════════════════════════════════ */
  .submit-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding-bottom: var(--fb-space-md);
  }

  .header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    margin-bottom: var(--fb-space-md);
    background: var(--fb-primary-glow);
    border: 1px solid rgba(16, 185, 129, 0.25);
    border-radius: var(--fb-radius-lg);
    color: var(--fb-primary);
    font-size: 24px;
  }

  .header-title {
    margin: 0 0 var(--fb-space-xs) 0;
    font-size: var(--fb-text-xl);
    font-weight: 700;
    color: var(--fb-text);
    letter-spacing: -0.02em;
  }

  .header-subtitle {
    margin: 0;
    max-width: 360px;
    font-size: var(--fb-text-sm);
    color: var(--fb-text-muted);
    line-height: 1.6;
  }

  .header-divider {
    width: 64px;
    height: 3px;
    margin-top: var(--fb-space-lg);
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--fb-primary) 50%,
      transparent 100%
    );
    border-radius: 2px;
    opacity: 0.5;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     CONTENT
     ═══════════════════════════════════════════════════════════════════════════ */
  .submit-content {
    width: 100%;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     FOOTER
     ═══════════════════════════════════════════════════════════════════════════ */
  .submit-footer {
    display: none; /* Hidden on mobile */
    padding-top: var(--fb-space-lg);
    border-top: 1px solid var(--fb-border);
  }

  .footer-note {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--fb-space-xs);
    margin: 0;
    font-size: var(--fb-text-xs);
    color: var(--fb-text-subtle);
    letter-spacing: 0.02em;
  }

  .footer-note i {
    color: var(--fb-primary);
    opacity: 0.6;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     RESPONSIVE BREAKPOINTS
     ═══════════════════════════════════════════════════════════════════════════ */

  /* Tablet (768px+) */
  @media (min-width: 768px) {
    .submit-tab {
      padding: var(--fb-space-xl);
      padding-bottom: var(--fb-space-xl);
    }

    .submit-container {
      gap: var(--fb-space-xl);
    }

    .header-icon {
      width: 64px;
      height: 64px;
      font-size: 28px;
    }

    .header-title {
      font-size: var(--fb-text-2xl);
    }

    .header-subtitle {
      font-size: var(--fb-text-base);
    }
  }

  /* Desktop (1024px+) */
  @media (min-width: 1024px) {
    .submit-tab {
      /* Center vertically with extra padding */
      padding: var(--fb-space-2xl) var(--fb-space-xl);
      justify-content: flex-start;
    }

    .submit-header {
      padding-bottom: var(--fb-space-lg);
    }

    .header-divider {
      width: 80px;
    }

    .submit-footer {
      display: block;
      margin-top: auto;
    }
  }

  /* Wide screens (1440px+) */
  @media (min-width: 1440px) {
    .submit-tab {
      padding-top: var(--fb-space-2xl);
      padding-bottom: var(--fb-space-2xl);
    }

    .submit-container {
      /* Slight increase for very wide screens */
      max-width: 640px;
    }
  }

  /* Small mobile tweaks */
  @media (max-width: 479px) {
    .submit-tab {
      padding: var(--fb-space-sm);
      padding-bottom: calc(var(--fb-space-lg) + env(safe-area-inset-bottom, 0px));
    }

    .header-icon {
      width: 48px;
      height: 48px;
      font-size: 20px;
      margin-bottom: var(--fb-space-sm);
    }

    .header-title {
      font-size: var(--fb-text-lg);
    }

    .header-subtitle {
      font-size: var(--fb-text-xs);
    }

    .header-divider {
      width: 48px;
      margin-top: var(--fb-space-md);
    }

    .submit-container {
      gap: var(--fb-space-md);
    }
  }

  /* Landscape mobile */
  @media (max-height: 500px) and (orientation: landscape) {
    .submit-header {
      flex-direction: row;
      text-align: left;
      gap: var(--fb-space-md);
      padding-bottom: var(--fb-space-sm);
    }

    .header-icon {
      width: 44px;
      height: 44px;
      font-size: 18px;
      margin-bottom: 0;
    }

    .header-title {
      margin-bottom: var(--fb-space-3xs);
    }

    .header-divider {
      display: none;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* Scrollbar styling */
  .submit-tab::-webkit-scrollbar {
    width: 8px;
  }

  .submit-tab::-webkit-scrollbar-track {
    background: transparent;
  }

  .submit-tab::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  .submit-tab::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }
</style>
