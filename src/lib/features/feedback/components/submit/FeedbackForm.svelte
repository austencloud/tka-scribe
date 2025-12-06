<!-- FeedbackForm - Streamlined feedback form -->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import type { IDeviceDetector } from "$lib/shared/device/services/contracts/IDeviceDetector";
  import type { FeedbackSubmitState } from "../../state/feedback-submit-state.svelte";
  import { TYPE_CONFIG } from "../../domain/models/feedback-models";
  import type { FeedbackType } from "../../domain/models/feedback-models";
  import VoiceInputButton from "./VoiceInputButton.svelte";
  import ImageUpload from "./ImageUpload.svelte";
  import {
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
  } from "../../utils/draft-persistence";

  // Props
  const { formState } = $props<{
    formState: FeedbackSubmitState;
  }>();

  let hapticService: IHapticFeedbackService | undefined;
  let deviceDetector: IDeviceDetector | undefined;
  let isMobileDevice = $state(false);
  let interimText = $state(""); // Store live streaming text
  let lastVoiceCommit = $state(""); // Track what voice text has been committed (for deduplication)
  let draftSaveStatus = $state<"idle" | "saving" | "saved">("idle");
  let draftSaveTimer: ReturnType<typeof setTimeout> | null = null;
  let draftResetTimer: ReturnType<typeof setTimeout> | null = null;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );

    deviceDetector = resolve<IDeviceDetector>(TYPES.IDeviceDetector);
    isMobileDevice = deviceDetector.isMobile();

    // Restore draft if form is empty and a draft exists
    if (
      !formState.formData.description.trim() &&
      !formState.formData.title.trim()
    ) {
      const draft = loadDraft();
      if (draft) {
        formState.updateField("description", draft.formData.description);
        formState.updateField("title", draft.formData.title);
        formState.setType(draft.formData.type);
      }
    }
  });

  // Auto-save draft with debouncing (500ms after user stops typing)
  $effect(() => {
    const description = formState.formData.description;
    const type = formState.formData.type;
    const title = formState.formData.title;

    // Only auto-save if there's content
    if (description.trim().length > 0 || title.trim().length > 0) {
      // Clear existing timers
      if (draftSaveTimer) {
        clearTimeout(draftSaveTimer);
      }
      if (draftResetTimer) {
        clearTimeout(draftResetTimer);
      }

      // Set status to saving
      draftSaveStatus = "saving";

      // Debounce save (500ms)
      draftSaveTimer = setTimeout(() => {
        saveDraft(formState.formData);
        draftSaveStatus = "saved";

        // Reset to idle after 2 seconds
        draftResetTimer = setTimeout(() => {
          draftSaveStatus = "idle";
        }, 2000);
      }, 500);

      // Cleanup both timers
      return () => {
        if (draftSaveTimer) {
          clearTimeout(draftSaveTimer);
        }
        if (draftResetTimer) {
          clearTimeout(draftResetTimer);
        }
      };
    } else {
      // If form is empty, clear any existing draft
      clearDraft();
      draftSaveStatus = "idle";
    }

    return undefined;
  });

  // Clear draft after successful submission
  $effect(() => {
    if (formState.submitStatus === "success") {
      clearDraft();
      draftSaveStatus = "idle";
    }
    return undefined;
  });

  // Derived: combine committed + interim for display
  const displayText = $derived(
    interimText
      ? `${formState.formData.description} ${interimText}`.trim()
      : formState.formData.description
  );

  function handleVoiceTranscript(transcript: string, isFinal: boolean) {
    if (isFinal) {
      // Mobile browsers re-emit entire transcript including previously finalized segments.
      // Strip any prefix that matches what we've already committed to avoid duplication.
      let newContent = transcript.trim();

      if (lastVoiceCommit && newContent.startsWith(lastVoiceCommit)) {
        // Strip the already-committed prefix
        newContent = newContent.slice(lastVoiceCommit.length).trim();
      }

      // Only append if there's actually new content
      if (newContent) {
        const currentText = formState.formData.description.trim();
        const updatedText = currentText ? `${currentText} ${newContent}` : newContent;
        formState.updateField("description", updatedText);

        // Track the cumulative voice transcript for next deduplication
        lastVoiceCommit = transcript.trim();

        hapticService?.trigger("selection");
      }

      interimText = ""; // Clear interim
    }
  }

  function handleInterimTranscript(transcript: string) {
    // Update interim text for live preview
    interimText = transcript;
  }

  function handleRecordingEnd() {
    // Reset voice tracking when recording session ends
    // Each new recording session starts with a fresh transcript
    lastVoiceCommit = "";
  }

  // When user manually types, clear interim and reset voice tracking
  function handleManualInput(value: string) {
    formState.updateField("description", value);
    interimText = "";
    lastVoiceCommit = ""; // Reset voice deduplication when user types manually
  }

  function handleTypeChange(type: FeedbackType) {
    hapticService?.trigger("selection");
    formState.setType(type);
  }

  // Derived: current type configuration for dynamic theming
  const feedbackType = $derived(formState.formData.type);
  const currentTypeConfig = $derived(
    feedbackType && feedbackType in TYPE_CONFIG
      ? TYPE_CONFIG[feedbackType as keyof typeof TYPE_CONFIG]
      : undefined
  );

  // Encouragement messages by type
  const ENCOURAGEMENT_CONFIG: Record<FeedbackType, string> = {
    bug: "Include steps to reproduce, error messages, and screenshots for faster fixes.",

    feature:
      "Dream big! Describe exactly what you'd love to see in the app and how it would help you.",
    general:
      "Share your thoughts on the app experience - what's working, what's confusing, what could be smoother.",
  };

  const currentEncouragement = $derived(
    feedbackType && feedbackType in ENCOURAGEMENT_CONFIG
      ? ENCOURAGEMENT_CONFIG[feedbackType as keyof typeof ENCOURAGEMENT_CONFIG]
      : ENCOURAGEMENT_CONFIG.general
  );

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    hapticService?.trigger("selection");
    await formState.submit();
  }

  function handleReset() {
    hapticService?.trigger("selection");
    formState.reset();
    lastVoiceCommit = ""; // Reset voice tracking
    interimText = "";
  }

  function handleKeydown(event: KeyboardEvent) {
    // Submit on Shift+Enter
    if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      if (formState.isFormValid && !formState.isSubmitting) {
        formState.submit();
        hapticService?.trigger("selection");
      }
    }
  }
</script>

{#if formState.submitStatus === "success"}
  <!-- Success State - Replaces entire form -->
  <div class="success-state">
    <div class="success-icon">
      <i class="fas fa-check"></i>
    </div>
    <h2 class="success-title">Feedback Submitted!</h2>
    <p class="success-message">
      Thank you for helping improve TKA Studio. Your feedback has been received
      and will be reviewed.
    </p>
    <button type="button" class="success-action" onclick={handleReset}>
      <i class="fas fa-plus"></i>
      Submit Another
    </button>
  </div>
{:else}
  <form
    class="feedback-form"
    onsubmit={handleSubmit}
    style="--active-type-color: {currentTypeConfig?.color ?? '#6366f1'}"
  >
    <!-- Type Selector - Segmented Control -->
    <fieldset class="type-selector">
      <legend class="visually-hidden">Feedback Type</legend>
      <div class="segment-control">
        {#each Object.entries(TYPE_CONFIG) as [type, config]}
          <button
            type="button"
            class="segment"
            class:selected={formState.formData.type === type}
            onclick={() => handleTypeChange(type as FeedbackType)}
            style="--type-color: {config.color}"
            aria-pressed={formState.formData.type === type}
          >
            <i class="fas {config.icon}"></i>
            <span class="segment-label"
              >{config.label
                .replace(" Report", "")
                .replace(" Request", "")
                .replace(" Feedback", "")}</span
            >
          </button>
        {/each}
      </div>
    </fieldset>

    <!-- Encouragement message -->
    <div class="encouragement-hint">
      <i class="fas fa-robot"></i>
      <span>{currentEncouragement}</span>
    </div>
    <!-- Description Field -->
    <div class="field">
      <div class="textarea-wrapper">
        <textarea
          id="fb-description"
          class="field-textarea"
          class:has-error={formState.formErrors.description}
          class:streaming={interimText.length > 0}
          value={displayText}
          oninput={(e) => handleManualInput(e.currentTarget.value)}
          onkeydown={handleKeydown}
          placeholder={`${currentTypeConfig?.placeholder ?? "Describe the issue, suggestion, or idea..."}${isMobileDevice ? "" : " (Shift+Enter to submit)"}`}
          rows="6"
        ></textarea>
        <div class="voice-input-wrapper">
          <VoiceInputButton
            onTranscript={handleVoiceTranscript}
            onInterimTranscript={handleInterimTranscript}
            onRecordingEnd={handleRecordingEnd}
            disabled={formState.isSubmitting}
          />
        </div>
      </div>
      <div class="field-footer">
        <div class="field-hint">
          <span
            class="char-count"
            class:met={formState.formData.description.trim().length >= 10}
          >
            {#if formState.formData.description.trim().length < 10}
              {10 - formState.formData.description.trim().length} more needed
            {:else}
              <i class="fas fa-check"></i>
            {/if}
          </span>
          {#if draftSaveStatus === "saved"}
            <span class="draft-saved" aria-live="polite">
              <i class="fas fa-cloud-upload-alt"></i>
              Draft saved
            </span>
          {/if}
          {#if formState.formErrors.description}
            <span class="field-error" role="alert"
              >{formState.formErrors.description}</span
            >
          {/if}
        </div>
        <div class="field-actions">
          <ImageUpload
            bind:images={formState.images}
            disabled={formState.isSubmitting}
          />
        </div>
      </div>
    </div>

    <!-- Submit Button -->
    <div class="form-footer">
      <button
        type="submit"
        class="submit-btn"
        disabled={formState.isSubmitting || !formState.isFormValid}
      >
        {#if formState.isSubmitting}
          <i class="fas fa-circle-notch fa-spin"></i>
          <span>Submitting...</span>
        {:else}
          <i class="fas fa-paper-plane"></i>
          <span>Submit Feedback</span>
        {/if}
      </button>
    </div>

    <!-- Error State (shown inline in form) -->
    {#if formState.submitStatus === "error"}
      <div class="toast error" role="alert">
        <div class="toast-icon">
          <i class="fas fa-exclamation"></i>
        </div>
        <div class="toast-content">
          <p class="toast-title">Submission failed</p>
          <p class="toast-message">
            Please check your connection and try again.
          </p>
        </div>
      </div>
    {/if}
  </form>
{/if}

<style>
  /* ═══════════════════════════════════════════════════════════════════════════
     CONTAINER-QUERY BASED FLUID FORM
     ═══════════════════════════════════════════════════════════════════════════ */
  .feedback-form {
    /* Establish as container */
    container-type: inline-size;
    container-name: feedback-form;

    /* Colors - Type-reactive */
    --fb-primary: var(--active-type-color, #3b82f6);
    --fb-error: #ef4444;
    --fb-border: color-mix(
      in srgb,
      var(--active-type-color, #3b82f6) 25%,
      rgba(255, 255, 255, 0.1)
    );
    --fb-text: rgba(255, 255, 255, 0.95);
    --fb-text-muted: rgba(255, 255, 255, 0.7);
    --fb-text-subtle: rgba(255, 255, 255, 0.5);

    /* Layout - Fluid */
    position: relative;
    display: flex;
    flex-direction: column;
    /* Tighter gaps for mobile */
    gap: clamp(8px, 2.5cqi, 16px);
    width: 100%;
    /* Tighter padding for mobile */
    padding: clamp(12px, 3cqi, 24px);
    background: linear-gradient(
      145deg,
      color-mix(
          in srgb,
          var(--active-type-color, #3b82f6) 6%,
          rgba(22, 22, 32, 0.95)
        )
        0%,
      color-mix(
          in srgb,
          var(--active-type-color, #3b82f6) 3%,
          rgba(18, 18, 28, 0.98)
        )
        100%
    );
    border: 1.5px solid var(--fb-border);
    border-radius: clamp(10px, 2cqi, 14px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    transition: border-color 200ms ease;
  }

  .feedback-form:hover {
    border-color: color-mix(
      in srgb,
      var(--active-type-color) 45%,
      rgba(255, 255, 255, 0.12)
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     SUCCESS STATE - Compact, colorful, no pulsing glow
     ═══════════════════════════════════════════════════════════════════════════ */
  .success-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px 20px;
    min-height: 300px;
    animation: successEnter 0.3s ease-out;
  }

  @keyframes successEnter {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .success-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
    border-radius: 50%;
    margin-bottom: 16px;
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.25);
  }

  .success-icon i {
    font-size: 28px;
    color: white;
  }

  .success-title {
    margin: 0 0 8px 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: -0.02em;
  }

  .success-message {
    margin: 0 0 24px 0;
    font-size: 0.9375rem;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.5;
    max-width: 320px;
  }

  .success-action {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 52px;
    padding: 0 20px;
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 10px;
    color: #34d399;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 150ms ease;
  }

  .success-action:hover {
    background: rgba(16, 185, 129, 0.25);
    border-color: rgba(16, 185, 129, 0.5);
  }

  .success-action:active {
    transform: scale(0.98);
  }

  .success-action i {
    font-size: 0.875rem;
  }

  /* Accessibility helper */
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     TYPE SELECTOR - Fluid, colorful
     ═══════════════════════════════════════════════════════════════════════════ */
  .type-selector {
    border: none;
    padding: 0;
    margin: 0;
  }

  .segment-control {
    display: flex;
    gap: clamp(4px, 1cqi, 8px);
    padding: clamp(3px, 0.8cqi, 5px);
    background: rgba(0, 0, 0, 0.25);
    border-radius: clamp(8px, 2cqi, 12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .segment {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(4px, 1cqi, 8px);
    min-height: 52px;
    padding: clamp(6px, 1.5cqi, 10px) clamp(8px, 2cqi, 14px);
    background: transparent;
    border: 1.5px solid transparent;
    border-radius: clamp(6px, 1.5cqi, 10px);
    color: var(--fb-text-subtle);
    font-size: clamp(0.8rem, 2.5cqi, 0.9375rem);
    font-weight: 600;
    cursor: pointer;
    transition: all 200ms ease;
    position: relative;
    overflow: hidden;
  }

  .segment::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--type-color) 20%, transparent) 0%,
      color-mix(in srgb, var(--type-color) 8%, transparent) 100%
    );
    opacity: 0;
    transition: opacity 200ms ease;
  }

  .segment i {
    position: relative;
    z-index: 1;
    font-size: clamp(0.9em, 2cqi, 1.15em);
    transition: color 200ms ease;
  }

  .segment-label {
    position: relative;
    z-index: 1;
  }

  .segment:hover:not(.selected) {
    color: var(--fb-text-muted);
    border-color: color-mix(in srgb, var(--type-color) 35%, transparent);
  }

  .segment:hover:not(.selected)::before {
    opacity: 0.4;
  }

  .segment:hover:not(.selected) i {
    color: var(--type-color);
  }

  .segment.selected {
    color: var(--fb-text);
    border-color: var(--type-color);
    background: color-mix(in srgb, var(--type-color) 12%, transparent);
  }

  .segment.selected::before {
    opacity: 1;
  }

  .segment.selected i {
    color: var(--type-color);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     FORM FIELDS - Fluid sizing
     ═══════════════════════════════════════════════════════════════════════════ */
  .field {
    display: flex;
    flex-direction: column;
    gap: clamp(4px, 1cqi, 8px);
  }

  .field-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: clamp(8px, 2cqi, 12px);
  }

  .field-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .field-label {
    font-size: clamp(0.8rem, 2.2cqi, 0.9375rem);
    font-weight: 600;
    color: var(--fb-text-muted);
    letter-spacing: -0.01em;
    transition: color 150ms ease;
  }

  .field:focus-within .field-label {
    color: var(--fb-primary);
  }

  .textarea-wrapper {
    position: relative;
    background: rgba(0, 0, 0, 0.2);
    border: 1.5px solid
      color-mix(in srgb, var(--active-type-color) 20%, rgba(255, 255, 255, 0.1));
    border-radius: clamp(8px, 1.8cqi, 12px);
    transition:
      border-color 200ms ease,
      background 200ms ease;
  }

  .textarea-wrapper:hover {
    border-color: color-mix(
      in srgb,
      var(--active-type-color) 45%,
      rgba(255, 255, 255, 0.15)
    );
  }

  .textarea-wrapper:focus-within {
    border-color: var(--fb-primary);
    background: color-mix(
      in srgb,
      var(--active-type-color) 5%,
      rgba(0, 0, 0, 0.25)
    );
  }

  .textarea-wrapper:has(.field-textarea.has-error) {
    border-color: var(--fb-error);
  }

  .textarea-wrapper:has(.field-textarea.streaming) {
    border-color: #8b5cf6;
    background: color-mix(in srgb, #8b5cf6 8%, rgba(0, 0, 0, 0.25));
    box-shadow: 0 0 0 2px color-mix(in srgb, #8b5cf6 15%, transparent);
  }

  .field-textarea {
    width: 100%;
    padding: clamp(8px, 2cqi, 12px) clamp(10px, 2.5cqi, 16px);
    padding-right: clamp(52px, 10cqi, 60px); /* Make room for voice button */
    background: transparent;
    border: none;
    color: var(--fb-text);
    font-size: 1rem;
    font-family: inherit;
    min-height: clamp(72px, 15cqi, 100px);
    resize: none;
    line-height: 1.5;
  }

  .field-textarea:focus {
    outline: none;
  }

  .field-textarea::placeholder {
    color: var(--fb-text-subtle);
  }

  .voice-input-wrapper {
    position: absolute;
    bottom: clamp(10px, 2.5cqi, 16px);
    right: clamp(10px, 2.5cqi, 16px);
    z-index: 1;
  }

  .field-hint {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: clamp(14px, 3cqi, 18px);
  }

  .char-count {
    font-size: clamp(0.7rem, 1.8cqi, 0.8rem);
    font-weight: 500;
    color: var(--fb-text-subtle);
    transition: color 150ms ease;
  }

  .char-count.met {
    color: #10b981;
  }

  .field:has(.field-textarea:not(:placeholder-shown)) .field-label {
    color: var(--fb-primary);
  }

  .field-error {
    margin: 0;
    font-size: clamp(0.7rem, 1.8cqi, 0.8rem);
    font-weight: 500;
    color: var(--fb-error);
  }

  .draft-saved {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: clamp(0.7rem, 1.8cqi, 0.8rem);
    font-weight: 500;
    color: #6366f1;
    animation: fadeInOut 2s ease-in-out;
  }

  .draft-saved i {
    font-size: 0.9em;
    opacity: 0.8;
  }

  @keyframes fadeInOut {
    0% {
      opacity: 0;
      transform: translateY(-4px);
    }
    20% {
      opacity: 1;
      transform: translateY(0);
    }
    80% {
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateY(-4px);
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     ENCOURAGEMENT HINT
     ═══════════════════════════════════════════════════════════════════════════ */
  .encouragement-hint {
    display: flex;
    align-items: flex-start;
    gap: clamp(8px, 2cqi, 12px);
    padding: clamp(10px, 2.5cqi, 14px) clamp(12px, 3cqi, 16px);
    background: linear-gradient(
      135deg,
      color-mix(
          in srgb,
          var(--active-type-color, #3b82f6) 8%,
          rgba(255, 255, 255, 0.03)
        )
        0%,
      color-mix(
          in srgb,
          var(--active-type-color, #3b82f6) 4%,
          rgba(255, 255, 255, 0.01)
        )
        100%
    );
    border: 1px solid
      color-mix(
        in srgb,
        var(--active-type-color, #3b82f6) 15%,
        rgba(255, 255, 255, 0.06)
      );
    border-radius: clamp(8px, 1.8cqi, 10px);
    margin-top: clamp(4px, 1cqi, 8px);
  }

  .encouragement-hint i {
    flex-shrink: 0;
    font-size: clamp(0.8rem, 2cqi, 0.9rem);
    color: color-mix(
      in srgb,
      var(--active-type-color, #3b82f6) 70%,
      rgba(255, 255, 255, 0.6)
    );
    margin-top: 2px;
  }

  .encouragement-hint span {
    font-size: clamp(0.75rem, 2cqi, 0.8125rem);
    font-style: italic;
    color: var(--fb-text-subtle);
    line-height: 1.5;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     SUBMIT BUTTON - Fluid
     ═══════════════════════════════════════════════════════════════════════════ */
  .form-footer {
    position: sticky;
    bottom: calc(-1 * clamp(12px, 3cqi, 24px));
    z-index: 10;
    margin-inline: calc(-1 * clamp(12px, 3cqi, 24px));
    padding-inline: clamp(12px, 3cqi, 24px);
    margin-bottom: calc(-1 * clamp(12px, 3cqi, 24px));
    padding-bottom: calc(
      clamp(12px, 3cqi, 24px) + env(safe-area-inset-bottom, 0px)
    );
    padding-top: clamp(10px, 2.5cqi, 14px);
    background: linear-gradient(
      to top,
      color-mix(
          in srgb,
          var(--active-type-color, #3b82f6) 4%,
          rgba(18, 18, 28, 1)
        )
        0%,
      color-mix(
          in srgb,
          var(--active-type-color, #3b82f6) 4%,
          rgba(18, 18, 28, 1)
        )
        70%,
      transparent 100%
    );
    display: flex;
    justify-content: flex-end;
  }

  .submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(8px, 2cqi, 12px);
    min-height: 52px;
    padding: clamp(10px, 2.5cqi, 14px) clamp(18px, 4cqi, 28px);
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--active-type-color) 100%, white 15%) 0%,
      var(--active-type-color) 50%,
      color-mix(in srgb, var(--active-type-color) 100%, black 10%) 100%
    );
    border: none;
    border-radius: clamp(8px, 2cqi, 12px);
    color: white;
    font-size: clamp(0.875rem, 2.5cqi, 1rem);
    font-weight: 700;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: all 200ms ease;
    box-shadow: 0 3px 12px
      color-mix(in srgb, var(--active-type-color) 30%, rgba(0, 0, 0, 0.2));
  }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px
      color-mix(in srgb, var(--active-type-color) 35%, rgba(0, 0, 0, 0.25));
  }

  .submit-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .submit-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    filter: grayscale(20%);
  }

  .submit-btn i {
    font-size: clamp(0.9em, 2cqi, 1.1em);
  }

  @container feedback-form (max-width: 420px) {
    .form-footer {
      justify-content: stretch;
    }
    .submit-btn {
      width: 100%;
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     TOAST MESSAGES
     ═══════════════════════════════════════════════════════════════════════════ */
  .toast {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    border-radius: 10px;
    animation: toastIn 0.3s ease;
  }

  @keyframes toastIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .toast.error {
    background: linear-gradient(
      135deg,
      rgba(239, 68, 68, 0.15) 0%,
      rgba(239, 68, 68, 0.08) 100%
    );
    border: 1px solid rgba(239, 68, 68, 0.25);
  }

  .toast-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .toast.error .toast-icon {
    background: var(--fb-error);
    color: white;
  }

  .toast-content {
    flex: 1;
    min-width: 0;
  }

  .toast-title {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--fb-text);
  }

  .toast-message {
    margin: 4px 0 0 0;
    font-size: 0.875rem;
    color: var(--fb-text-muted);
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
</style>
