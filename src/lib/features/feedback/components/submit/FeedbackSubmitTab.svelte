<!-- FeedbackSubmitTab - Fluid container-query based layout -->
<script lang="ts">
  import FeedbackForm from "./FeedbackForm.svelte";
  import { createFeedbackSubmitState } from "../../state/feedback-submit-state.svelte";

  const submitState = createFeedbackSubmitState();
</script>

<div class="submit-tab">
  <div class="submit-container">
    <!-- Centered header -->
    <header class="submit-header">
      <div class="header-icon">
        <i class="fas fa-paper-plane"></i>
      </div>
      <h1 class="header-title">Submit Feedback</h1>
      <p class="header-subtitle">Help us improve TKA Studio with your input</p>
    </header>

    <!-- Form Content -->
    <FeedbackForm formState={submitState} />
  </div>
</div>

<style>
  /* ═══════════════════════════════════════════════════════════════════════════
     CONTAINER-QUERY BASED FLUID LAYOUT
     ═══════════════════════════════════════════════════════════════════════════ */
  .submit-tab {
    /* Establish as container for queries */
    container-type: size;
    container-name: submit-tab;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    overflow: hidden; /* No scrollbars - we fit the content */

    /* Fluid padding that scales with container */
    padding: clamp(12px, 3cqi, 32px);
    padding-bottom: calc(clamp(12px, 3cqi, 32px) + env(safe-area-inset-bottom, 0px));
  }

  .submit-container {
    /* Take up available space intelligently */
    width: min(100%, clamp(400px, 85cqi, 600px));
    max-height: 100%;

    display: flex;
    flex-direction: column;
    /* Fluid gap that responds to container height */
    gap: clamp(8px, 2cqh, 20px);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     HEADER - Centered, fluid sizing
     ═══════════════════════════════════════════════════════════════════════════ */
  .submit-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    /* Fluid gap based on container */
    gap: clamp(4px, 1cqh, 12px);
    /* Reduce header space when container is tight */
    padding-bottom: clamp(4px, 1.5cqh, 16px);
  }

  .header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    /* Fluid icon size */
    width: clamp(36px, 6cqi, 56px);
    height: clamp(36px, 6cqi, 56px);
    background: rgba(16, 185, 129, 0.12);
    border: 1px solid rgba(16, 185, 129, 0.25);
    border-radius: clamp(8px, 1.5cqi, 14px);
    color: #10b981;
    font-size: clamp(14px, 2.5cqi, 24px);
  }

  .header-title {
    margin: 0;
    /* Fluid typography */
    font-size: clamp(1rem, 3cqi, 1.5rem);
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: -0.02em;
  }

  .header-subtitle {
    margin: 0;
    font-size: clamp(0.75rem, 1.8cqi, 0.9375rem);
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.4;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     CONTAINER QUERIES - Adapt to actual available space
     ═══════════════════════════════════════════════════════════════════════════ */

  /* When container is very short - minimize header */
  @container submit-tab (max-height: 500px) {
    .submit-header {
      flex-direction: row;
      text-align: left;
      padding-bottom: 0;
    }

    .header-icon {
      width: 32px;
      height: 32px;
      font-size: 14px;
    }

    .header-title {
      font-size: 1rem;
    }

    .header-subtitle {
      display: none;
    }
  }

  /* When container is comfortably tall - breathe */
  @container submit-tab (min-height: 700px) {
    .submit-header {
      padding-bottom: clamp(12px, 3cqh, 24px);
    }
  }

  /* When container is narrow - tighten horizontal */
  @container submit-tab (max-width: 400px) {
    .submit-container {
      width: 100%;
    }
  }

  /* When container is wide - add intentional space */
  @container submit-tab (min-width: 800px) {
    .submit-container {
      width: min(85%, 580px);
    }
  }

  /* Hide scrollbar but allow if absolutely needed */
  .submit-tab::-webkit-scrollbar {
    width: 4px;
  }

  .submit-tab::-webkit-scrollbar-track {
    background: transparent;
  }

  .submit-tab::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 2px;
  }
</style>
