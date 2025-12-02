<!-- FeedbackForm - Premium responsive feedback form with golden ratio spacing -->
<script lang="ts">
  import type { FeedbackSubmitState } from "../../state/feedback-submit-state.svelte";
  import { TYPE_CONFIG, PRIORITY_CONFIG } from "../../domain/models/feedback-models";
  import type { FeedbackType, FeedbackPriority } from "../../domain/models/feedback-models";
  import { MODULE_DEFINITIONS } from "$lib/shared/navigation/state/navigation-state.svelte";

  // Props
  const { formState } = $props<{
    formState: FeedbackSubmitState;
  }>();

  // Context picker flow state: 'closed' | 'modules' | 'tabs'
  let contextStep = $state<'closed' | 'modules' | 'tabs'>('closed');
  let selectedModuleId = $state<string>('');

  // Module/tab options for context picker
  const moduleOptions = MODULE_DEFINITIONS.filter((m) => m.id !== "feedback" && m.id !== "admin");

  function getTabsForModule(moduleId: string): Array<{ id: string; label: string }> {
    const module = MODULE_DEFINITIONS.find((m) => m.id === moduleId);
    return module?.sections || [];
  }

  function getModuleIcon(moduleId: string): string {
    const icons: Record<string, string> = {
      create: 'fa-plus-circle',
      discover: 'fa-compass',
      learn: 'fa-graduation-cap',
      animate: 'fa-play-circle',
      train: 'fa-dumbbell',
      library: 'fa-book',
    };
    return icons[moduleId] || 'fa-cube';
  }

  function getModuleLabel(moduleId: string): string {
    const module = MODULE_DEFINITIONS.find((m) => m.id === moduleId);
    return module?.label || moduleId;
  }

  // Context picker handlers
  function openContextPicker() {
    contextStep = 'modules';
  }

  function selectModule(moduleId: string) {
    selectedModuleId = moduleId;
    const tabs = getTabsForModule(moduleId);
    if (tabs.length > 0) {
      contextStep = 'tabs';
    } else {
      // No tabs, just set the module
      formState.updateField("reportedModule", moduleId);
      formState.updateField("reportedTab", "");
      contextStep = 'closed';
    }
  }

  function selectTab(tabId: string) {
    formState.updateField("reportedModule", selectedModuleId);
    formState.updateField("reportedTab", tabId);
    contextStep = 'closed';
  }

  function goBackToModules() {
    contextStep = 'modules';
    selectedModuleId = '';
  }

  function clearContext() {
    formState.updateField("reportedModule", "");
    formState.updateField("reportedTab", "");
    contextStep = 'closed';
    selectedModuleId = '';
  }

  // Derived: current type configuration for dynamic theming
  const currentTypeConfig = $derived(TYPE_CONFIG[formState.formData.type]);

  // Derived: has context been selected?
  const hasContextSelected = $derived(!!formState.formData.reportedModule);
  const contextDisplayText = $derived(() => {
    if (formState.formData.reportedModule) {
      const modLabel = getModuleLabel(formState.formData.reportedModule);
      if (formState.formData.reportedTab) {
        const tabs = getTabsForModule(formState.formData.reportedModule);
        const tab = tabs.find(t => t.id === formState.formData.reportedTab);
        return `${modLabel} › ${tab?.label || formState.formData.reportedTab}`;
      }
      return modLabel;
    }
    return '';
  });

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    await formState.submit();
  }

  function handleReset() {
    formState.reset();
    contextStep = 'closed';
    selectedModuleId = '';
  }
</script>

{#if formState.submitStatus === "success"}
  <!-- Success State - Replaces entire form -->
  <div class="success-state">
    <div class="success-icon">
      <i class="fas fa-check"></i>
    </div>
    <h2 class="success-title">Feedback Submitted!</h2>
    <p class="success-message">Thank you for helping improve TKA Studio. Your feedback has been received and will be reviewed.</p>
    <button type="button" class="success-action" onclick={handleReset}>
      <i class="fas fa-plus"></i>
      Submit Another
    </button>
  </div>
{:else}
  <form
    class="feedback-form"
    onsubmit={handleSubmit}
    style="--active-type-color: {currentTypeConfig.color}"
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
          onclick={() => formState.setType(type as FeedbackType)}
          style="--type-color: {config.color}"
          aria-pressed={formState.formData.type === type}
        >
          <i class="fas {config.icon}"></i>
          <span class="segment-label">{config.label.replace(" Report", "").replace(" Request", "").replace(" Feedback", "")}</span>
        </button>
      {/each}
    </div>
  </fieldset>

  <!-- Title Field -->
  <div class="field">
    <label for="fb-title" class="field-label">
      Title
      <span class="required">*</span>
    </label>
    <input
      type="text"
      id="fb-title"
      class="field-input"
      class:has-error={formState.formErrors.title}
      value={formState.formData.title}
      oninput={(e) => formState.updateField("title", e.currentTarget.value)}
      placeholder="Brief summary of your feedback"
      autocomplete="off"
    />
    <div class="field-hint">
      <span class="char-count" class:met={formState.formData.title.trim().length >= 3}>
        {formState.formData.title.trim().length}/3 characters
      </span>
      {#if formState.formErrors.title}
        <span class="field-error" role="alert">{formState.formErrors.title}</span>
      {/if}
    </div>
  </div>

  <!-- Description Field -->
  <div class="field">
    <label for="fb-description" class="field-label">
      Description
      <span class="required">*</span>
    </label>
    <textarea
      id="fb-description"
      class="field-textarea"
      class:has-error={formState.formErrors.description}
      value={formState.formData.description}
      oninput={(e) => formState.updateField("description", e.currentTarget.value)}
      placeholder="Describe the issue, suggestion, or feedback in detail..."
      rows="4"
    ></textarea>
    <div class="field-hint">
      <span class="char-count" class:met={formState.formData.description.trim().length >= 10}>
        {formState.formData.description.trim().length}/10 characters
      </span>
      {#if formState.formErrors.description}
        <span class="field-error" role="alert">{formState.formErrors.description}</span>
      {/if}
    </div>
  </div>

  <!-- Priority & Context Row -->
  <div class="options-row">
    <!-- Priority Selector - Single row, no wrap -->
    <div class="priority-section">
      <span class="section-label">Priority</span>
      <div class="priority-row">
        {#each Object.entries(PRIORITY_CONFIG) as [priority, config]}
          <button
            type="button"
            class="priority-btn"
            class:selected={formState.formData.priority === priority}
            onclick={() => formState.setPriority(formState.formData.priority === priority ? "" : priority as FeedbackPriority)}
            style="--priority-color: {config.color}"
            aria-pressed={formState.formData.priority === priority}
            title={config.label}
          >
            <i class="fas {config.icon}"></i>
            <span class="priority-label">{config.label}</span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Context Picker - Click flow -->
    <div class="context-section">
      <span class="section-label">Context</span>

      {#if contextStep === 'closed'}
        <!-- Initial/Selected state -->
        <div class="context-display">
          {#if hasContextSelected}
            <button type="button" class="context-chip selected" onclick={openContextPicker}>
              <i class="fas fa-map-marker-alt"></i>
              <span>{contextDisplayText()}</span>
            </button>
            <button type="button" class="context-clear" onclick={clearContext} title="Clear context">
              <i class="fas fa-times"></i>
            </button>
          {:else}
            <button type="button" class="context-chip" onclick={openContextPicker}>
              <i class="fas fa-crosshairs"></i>
              <span>Pick Context</span>
            </button>
          {/if}
        </div>
      {:else if contextStep === 'modules'}
        <!-- Module selection -->
        <div class="context-picker" class:entering={true}>
          <div class="picker-header">
            <span class="picker-title">Select Module</span>
            <button type="button" class="picker-close" onclick={() => contextStep = 'closed'}>
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="picker-grid">
            {#each moduleOptions as module}
              <button
                type="button"
                class="picker-item"
                onclick={() => selectModule(module.id)}
              >
                <i class="fas {getModuleIcon(module.id)}"></i>
                <span>{module.label}</span>
              </button>
            {/each}
          </div>
        </div>
      {:else if contextStep === 'tabs'}
        <!-- Tab selection -->
        <div class="context-picker" class:entering={true}>
          <div class="picker-header">
            <button type="button" class="picker-back" onclick={goBackToModules}>
              <i class="fas fa-arrow-left"></i>
            </button>
            <span class="picker-title">{getModuleLabel(selectedModuleId)}</span>
            <button type="button" class="picker-close" onclick={() => contextStep = 'closed'}>
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="picker-grid tabs">
            {#each getTabsForModule(selectedModuleId) as tab}
              <button
                type="button"
                class="picker-item tab"
                onclick={() => selectTab(tab.id)}
              >
                <span>{tab.label}</span>
              </button>
            {/each}
          </div>
        </div>
      {/if}
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
        <p class="toast-message">Please check your connection and try again.</p>
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
    --fb-border: color-mix(in srgb, var(--active-type-color, #3b82f6) 25%, rgba(255, 255, 255, 0.1));
    --fb-text: rgba(255, 255, 255, 0.95);
    --fb-text-muted: rgba(255, 255, 255, 0.7);
    --fb-text-subtle: rgba(255, 255, 255, 0.5);

    /* Layout - Fluid */
    position: relative;
    display: flex;
    flex-direction: column;
    /* Fluid gap based on container width */
    gap: clamp(10px, 3cqi, 20px);
    width: 100%;
    /* Fluid padding */
    padding: clamp(14px, 4cqi, 28px);
    background: linear-gradient(
      145deg,
      color-mix(in srgb, var(--active-type-color, #3b82f6) 6%, rgba(22, 22, 32, 0.95)) 0%,
      color-mix(in srgb, var(--active-type-color, #3b82f6) 3%, rgba(18, 18, 28, 0.98)) 100%
    );
    border: 1.5px solid var(--fb-border);
    border-radius: clamp(10px, 2cqi, 14px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    transition: border-color 200ms ease;
  }

  .feedback-form:hover {
    border-color: color-mix(in srgb, var(--active-type-color) 45%, rgba(255, 255, 255, 0.12));
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
    min-height: 48px; /* Fixed 48px touch target */
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
    min-height: 48px; /* Fixed 48px touch target */
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
    content: '';
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

  /* Hide label on narrow containers */
  @container feedback-form (max-width: 380px) {
    .segment-label {
      display: none;
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     FORM FIELDS - Fluid sizing
     ═══════════════════════════════════════════════════════════════════════════ */
  .field {
    display: flex;
    flex-direction: column;
    gap: clamp(4px, 1cqi, 8px);
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

  .required {
    color: var(--fb-primary);
    margin-left: 2px;
  }

  .field-input,
  .field-textarea {
    width: 100%;
    padding: clamp(8px, 2cqi, 12px) clamp(10px, 2.5cqi, 16px);
    background: rgba(0, 0, 0, 0.2);
    border: 1.5px solid color-mix(in srgb, var(--active-type-color) 20%, rgba(255, 255, 255, 0.1));
    border-radius: clamp(8px, 1.8cqi, 12px);
    color: var(--fb-text);
    font-size: 1rem; /* Keep 16px to prevent iOS zoom */
    font-family: inherit;
    transition: border-color 200ms ease, background 200ms ease;
  }

  .field-input::placeholder,
  .field-textarea::placeholder {
    color: var(--fb-text-subtle);
  }

  .field-input:hover,
  .field-textarea:hover {
    border-color: color-mix(in srgb, var(--active-type-color) 45%, rgba(255, 255, 255, 0.15));
  }

  .field-input:focus,
  .field-textarea:focus {
    outline: none;
    border-color: var(--fb-primary);
    background: color-mix(in srgb, var(--active-type-color) 5%, rgba(0, 0, 0, 0.25));
  }

  .field-input.has-error,
  .field-textarea.has-error {
    border-color: var(--fb-error);
  }

  .field-textarea {
    /* Fluid height based on container */
    min-height: clamp(80px, 18cqi, 120px);
    resize: none; /* Prevent manual resize to maintain layout */
    line-height: 1.5;
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

  .field-error {
    margin: 0;
    font-size: clamp(0.7rem, 1.8cqi, 0.8rem);
    font-weight: 500;
    color: var(--fb-error);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     OPTIONS ROW - Fluid layout
     ═══════════════════════════════════════════════════════════════════════════ */
  .options-row {
    display: flex;
    flex-direction: row;
    gap: clamp(12px, 3cqi, 20px);
  }

  .section-label {
    display: block;
    margin-bottom: clamp(4px, 1cqi, 8px);
    font-size: clamp(0.8rem, 2.2cqi, 0.9375rem);
    font-weight: 600;
    color: var(--fb-text-muted);
  }

  /* Stack on narrow containers */
  @container feedback-form (max-width: 420px) {
    .options-row {
      flex-direction: column;
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     PRIORITY SELECTOR - Fluid
     ═══════════════════════════════════════════════════════════════════════════ */
  .priority-section {
    flex: 1;
    min-width: 0;
  }

  .priority-row {
    display: flex;
    gap: clamp(4px, 1cqi, 8px);
  }

  .priority-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(3px, 0.8cqi, 6px);
    min-height: 48px; /* Fixed 48px touch target */
    min-width: 48px;
    padding: 0 clamp(6px, 1.5cqi, 12px);
    background: rgba(0, 0, 0, 0.2);
    border: 1.5px solid rgba(255, 255, 255, 0.08);
    border-radius: clamp(6px, 1.5cqi, 10px);
    color: var(--fb-text-subtle);
    font-size: clamp(0.75rem, 2cqi, 0.875rem);
    font-weight: 600;
    cursor: pointer;
    transition: all 200ms ease;
  }

  .priority-btn i {
    font-size: 0.95em;
    flex-shrink: 0;
  }

  .priority-btn:hover {
    background: color-mix(in srgb, var(--priority-color) 12%, rgba(0, 0, 0, 0.25));
    border-color: color-mix(in srgb, var(--priority-color) 50%, transparent);
    color: var(--fb-text-muted);
  }

  .priority-btn:hover i {
    color: var(--priority-color);
  }

  .priority-btn.selected {
    background: color-mix(in srgb, var(--priority-color) 18%, rgba(0, 0, 0, 0.25));
    border-color: var(--priority-color);
    color: var(--fb-text);
  }

  .priority-btn.selected i {
    color: var(--priority-color);
  }

  /* Hide priority labels on narrow containers */
  @container feedback-form (max-width: 500px) {
    .priority-label {
      display: none;
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     CONTEXT PICKER - Fluid
     ═══════════════════════════════════════════════════════════════════════════ */
  .context-section {
    position: relative;
    flex: 0 0 auto;
  }

  .context-display {
    display: flex;
    align-items: center;
    gap: clamp(6px, 1.5cqi, 10px);
  }

  .context-chip {
    display: flex;
    align-items: center;
    gap: clamp(6px, 1.5cqi, 10px);
    min-height: 48px; /* Fixed 48px touch target */
    padding: 0 clamp(10px, 2.5cqi, 16px);
    background: rgba(0, 0, 0, 0.2);
    border: 1.5px solid color-mix(in srgb, var(--active-type-color) 25%, rgba(255, 255, 255, 0.1));
    border-radius: clamp(6px, 1.5cqi, 10px);
    color: var(--fb-text-muted);
    font-size: clamp(0.75rem, 2cqi, 0.875rem);
    font-weight: 600;
    cursor: pointer;
    transition: all 200ms ease;
  }

  .context-chip i {
    color: var(--fb-primary);
  }

  .context-chip:hover {
    background: color-mix(in srgb, var(--active-type-color) 10%, rgba(0, 0, 0, 0.25));
    border-color: color-mix(in srgb, var(--active-type-color) 55%, transparent);
    color: var(--fb-text);
  }

  .context-chip.selected {
    background: color-mix(in srgb, var(--fb-primary) 12%, rgba(0, 0, 0, 0.25));
    border-color: var(--fb-primary);
    color: var(--fb-text);
  }

  .context-clear {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px; /* Fixed 48px touch target */
    height: 48px;
    background: none;
    border: none;
    border-radius: 50%;
    color: var(--fb-text-subtle);
    cursor: pointer;
    transition: all 150ms ease;
  }

  .context-clear:hover {
    background: rgba(239, 68, 68, 0.15);
    color: var(--fb-error);
  }

  /* Context Picker Panel */
  .context-picker {
    margin-top: clamp(6px, 1.5cqi, 10px);
    padding: clamp(10px, 2.5cqi, 14px);
    background: rgba(20, 20, 30, 0.95);
    border: 1px solid color-mix(in srgb, var(--active-type-color) 30%, rgba(255, 255, 255, 0.12));
    border-radius: clamp(8px, 2cqi, 12px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    animation: pickerEnter 0.2s ease-out;
  }

  @keyframes pickerEnter {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .picker-header {
    display: flex;
    align-items: center;
    gap: clamp(6px, 1.5cqi, 10px);
    margin-bottom: clamp(8px, 2cqi, 12px);
    padding-bottom: clamp(6px, 1.5cqi, 10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .picker-title {
    flex: 1;
    font-size: clamp(0.8rem, 2.2cqi, 0.9375rem);
    font-weight: 600;
    color: var(--fb-text);
    text-align: center;
  }

  .picker-back,
  .picker-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px; /* Fixed 48px touch target */
    height: 48px;
    margin: -10px; /* Negative margin to not affect layout but expand hit area */
    background: none;
    border: none;
    border-radius: 50%;
    color: var(--fb-text-muted);
    cursor: pointer;
    transition: all 150ms ease;
  }

  .picker-back:hover,
  .picker-close:hover {
    background: rgba(255, 255, 255, 0.08);
    color: var(--fb-text);
  }

  .picker-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: clamp(4px, 1cqi, 8px);
  }

  .picker-grid.tabs {
    grid-template-columns: repeat(2, 1fr);
  }

  .picker-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(3px, 0.8cqi, 6px);
    min-height: 48px; /* Fixed 48px touch target */
    padding: clamp(8px, 2cqi, 12px);
    background: rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: clamp(6px, 1.5cqi, 10px);
    color: var(--fb-text-muted);
    font-size: clamp(0.7rem, 1.8cqi, 0.8rem);
    font-weight: 600;
    cursor: pointer;
    transition: all 200ms ease;
  }

  .picker-item i {
    font-size: clamp(0.95rem, 2.5cqi, 1.15rem);
    color: var(--fb-text-subtle);
  }

  .picker-item:hover {
    background: color-mix(in srgb, var(--active-type-color) 12%, rgba(0, 0, 0, 0.2));
    border-color: color-mix(in srgb, var(--active-type-color) 40%, transparent);
    color: var(--fb-text);
  }

  .picker-item:hover i {
    color: var(--fb-primary);
  }

  .picker-item:active {
    transform: scale(0.97);
  }

  .picker-item.tab {
    flex-direction: row;
    min-height: 48px; /* Fixed 48px touch target */
    font-size: clamp(0.75rem, 2cqi, 0.875rem);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     SUBMIT BUTTON - Fluid
     ═══════════════════════════════════════════════════════════════════════════ */
  .form-footer {
    padding-top: clamp(4px, 1cqi, 8px);
    display: flex;
    justify-content: flex-end;
  }

  .submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(8px, 2cqi, 12px);
    min-height: 48px; /* Fixed 48px touch target */
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
    box-shadow: 0 3px 12px color-mix(in srgb, var(--active-type-color) 30%, rgba(0, 0, 0, 0.2));
  }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px color-mix(in srgb, var(--active-type-color) 35%, rgba(0, 0, 0, 0.25));
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

  /* Full width button on narrow containers */
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
    gap: var(--fb-space-md);
    padding: var(--fb-space-md);
    border-radius: var(--fb-radius-lg);
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

  .toast.success {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%);
    border: 1px solid rgba(16, 185, 129, 0.25);
  }

  .toast.error {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%);
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

  .toast.success .toast-icon {
    background: var(--fb-primary);
    color: white;
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
    font-size: var(--fb-text-sm);
    font-weight: 600;
    color: var(--fb-text);
  }

  .toast-message {
    margin: var(--fb-space-3xs) 0 0 0;
    font-size: var(--fb-text-sm);
    color: var(--fb-text-muted);
  }

  .toast-action {
    align-self: center;
    padding: var(--fb-space-xs) var(--fb-space-md);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: var(--fb-radius-sm);
    color: var(--fb-text);
    font-size: var(--fb-text-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--fb-transition-fast);
    white-space: nowrap;
  }

  .toast-action:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.25);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     ADDITIONAL CONTAINER QUERIES
     ═══════════════════════════════════════════════════════════════════════════ */

  /* Wide container - more columns in picker grid */
  @container feedback-form (min-width: 480px) {
    .picker-grid {
      grid-template-columns: repeat(4, 1fr);
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
</style>
