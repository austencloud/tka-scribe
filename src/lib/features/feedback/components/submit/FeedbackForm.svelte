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

<form class="feedback-form" onsubmit={handleSubmit}>
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
    {#if formState.formErrors.title}
      <p class="field-error" role="alert">{formState.formErrors.title}</p>
    {/if}
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
      rows="5"
    ></textarea>
    {#if formState.formErrors.description}
      <p class="field-error" role="alert">{formState.formErrors.description}</p>
    {/if}
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

  <!-- Success/Error States -->
  {#if formState.submitStatus === "success"}
    <div class="toast success" role="status">
      <div class="toast-icon">
        <i class="fas fa-check"></i>
      </div>
      <div class="toast-content">
        <p class="toast-title">Feedback submitted!</p>
        <p class="toast-message">Thank you for helping improve TKA Studio.</p>
      </div>
      <button type="button" class="toast-action" onclick={handleReset}>
        Submit Another
      </button>
    </div>
  {:else if formState.submitStatus === "error"}
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

<style>
  /* ═══════════════════════════════════════════════════════════════════════════
     DESIGN TOKENS (Golden Ratio × 8-point grid)
     ═══════════════════════════════════════════════════════════════════════════ */
  .feedback-form {
    /* Spacing (φ = 1.618) */
    --fb-space-3xs: 4px;
    --fb-space-2xs: 6px;
    --fb-space-xs: 8px;
    --fb-space-sm: 13px;
    --fb-space-md: 21px;
    --fb-space-lg: 34px;
    --fb-space-xl: 55px;

    /* Typography */
    --fb-text-xs: 0.75rem;
    --fb-text-sm: 0.875rem;
    --fb-text-base: 1rem;
    --fb-text-lg: 1.25rem;

    /* Radii */
    --fb-radius-sm: 8px;
    --fb-radius-md: 12px;
    --fb-radius-lg: 16px;

    /* Colors */
    --fb-primary: #10b981;
    --fb-primary-glow: rgba(16, 185, 129, 0.25);
    --fb-error: #ef4444;
    --fb-surface: rgba(255, 255, 255, 0.05);
    --fb-surface-hover: rgba(255, 255, 255, 0.08);
    --fb-border: rgba(255, 255, 255, 0.1);
    --fb-border-focus: rgba(255, 255, 255, 0.25);
    --fb-text: rgba(255, 255, 255, 0.95);
    --fb-text-muted: rgba(255, 255, 255, 0.6);
    --fb-text-subtle: rgba(255, 255, 255, 0.4);

    /* Transitions */
    --fb-transition-fast: 150ms ease;
    --fb-transition-base: 200ms ease;
    --fb-transition-spring: 300ms cubic-bezier(0.34, 1.56, 0.64, 1);

    /* Layout */
    display: flex;
    flex-direction: column;
    gap: var(--fb-space-lg);
    width: 100%;
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
     TYPE SELECTOR (Segmented Control)
     ═══════════════════════════════════════════════════════════════════════════ */
  .type-selector {
    border: none;
    padding: 0;
    margin: 0;
  }

  .segment-control {
    display: flex;
    gap: var(--fb-space-xs);
    padding: var(--fb-space-3xs);
    background: var(--fb-surface);
    border-radius: var(--fb-radius-md);
    border: 1px solid var(--fb-border);
  }

  .segment {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--fb-space-xs);
    min-height: 48px;
    padding: var(--fb-space-sm) var(--fb-space-md);
    background: transparent;
    border: none;
    border-radius: var(--fb-radius-sm);
    color: var(--fb-text-muted);
    font-size: var(--fb-text-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--fb-transition-base);
    position: relative;
  }

  .segment i {
    font-size: 1.1em;
    transition: transform var(--fb-transition-fast);
  }

  .segment:hover:not(.selected) {
    background: var(--fb-surface-hover);
    color: var(--fb-text);
  }

  .segment.selected {
    background: color-mix(in srgb, var(--type-color) 20%, transparent);
    color: var(--fb-text);
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--type-color) 40%, transparent),
      0 2px 8px color-mix(in srgb, var(--type-color) 15%, transparent);
  }

  .segment.selected i {
    color: var(--type-color);
    transform: scale(1.1);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     FORM FIELDS
     ═══════════════════════════════════════════════════════════════════════════ */
  .field {
    display: flex;
    flex-direction: column;
    gap: var(--fb-space-xs);
  }

  .field-label {
    font-size: var(--fb-text-sm);
    font-weight: 500;
    color: var(--fb-text-muted);
    letter-spacing: -0.01em;
  }

  .required {
    color: var(--fb-error);
    margin-left: 2px;
  }

  .field-input,
  .field-textarea {
    width: 100%;
    padding: var(--fb-space-sm) var(--fb-space-md);
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-md);
    color: var(--fb-text);
    font-size: var(--fb-text-base); /* 16px prevents iOS zoom */
    font-family: inherit;
    transition: all var(--fb-transition-base);
  }

  .field-input::placeholder,
  .field-textarea::placeholder {
    color: var(--fb-text-subtle);
  }

  .field-input:hover,
  .field-textarea:hover {
    border-color: var(--fb-border-focus);
  }

  .field-input:focus,
  .field-textarea:focus {
    outline: none;
    border-color: var(--fb-primary);
    background: var(--fb-surface-hover);
    box-shadow: 0 0 0 3px var(--fb-primary-glow);
  }

  .field-input.has-error,
  .field-textarea.has-error {
    border-color: var(--fb-error);
  }

  .field-input.has-error:focus,
  .field-textarea.has-error:focus {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
  }

  .field-textarea {
    min-height: 140px;
    resize: vertical;
    line-height: 1.6;
  }

  .field-error {
    margin: 0;
    font-size: var(--fb-text-xs);
    color: var(--fb-error);
    animation: shake 0.3s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     OPTIONS ROW (Priority + Context)
     ═══════════════════════════════════════════════════════════════════════════ */
  .options-row {
    display: flex;
    flex-direction: column;
    gap: var(--fb-space-md);
  }

  .section-label {
    display: block;
    margin-bottom: var(--fb-space-xs);
    font-size: var(--fb-text-sm);
    font-weight: 500;
    color: var(--fb-text-muted);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     PRIORITY SELECTOR - Single row, 48px touch targets
     ═══════════════════════════════════════════════════════════════════════════ */
  .priority-section {
    flex-shrink: 0;
  }

  .priority-row {
    display: flex;
    gap: var(--fb-space-2xs);
    /* Never wrap - compress equally */
  }

  .priority-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--fb-space-2xs);
    min-height: 48px;
    min-width: 48px;
    padding: 0 var(--fb-space-sm);
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-md);
    color: var(--fb-text-muted);
    font-size: var(--fb-text-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--fb-transition-base);
  }

  .priority-btn i {
    font-size: 1em;
    flex-shrink: 0;
  }

  .priority-btn:hover {
    background: var(--fb-surface-hover);
    border-color: var(--fb-border-focus);
    color: var(--fb-text);
  }

  .priority-btn.selected {
    background: color-mix(in srgb, var(--priority-color) 15%, transparent);
    border-color: var(--priority-color);
    color: var(--fb-text);
  }

  .priority-btn.selected i {
    color: var(--priority-color);
  }

  /* On small screens, hide label but keep 48px touch target */
  @media (max-width: 400px) {
    .priority-label {
      display: none;
    }
    .priority-btn {
      padding: 0;
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     CONTEXT PICKER - Click flow with micro-interactions
     ═══════════════════════════════════════════════════════════════════════════ */
  .context-section {
    position: relative;
  }

  .context-display {
    display: flex;
    align-items: center;
    gap: var(--fb-space-xs);
  }

  .context-chip {
    display: flex;
    align-items: center;
    gap: var(--fb-space-xs);
    height: 48px;
    padding: 0 var(--fb-space-md);
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-md);
    color: var(--fb-text-muted);
    font-size: var(--fb-text-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--fb-transition-base);
  }

  .context-chip i {
    color: var(--fb-primary);
    transition: transform var(--fb-transition-spring);
  }

  .context-chip:hover {
    background: var(--fb-surface-hover);
    border-color: var(--fb-border-focus);
    color: var(--fb-text);
  }

  .context-chip:hover i {
    transform: scale(1.15);
  }

  .context-chip.selected {
    background: color-mix(in srgb, var(--fb-primary) 12%, transparent);
    border-color: color-mix(in srgb, var(--fb-primary) 40%, transparent);
    color: var(--fb-text);
  }

  .context-clear {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: none;
    border: none;
    border-radius: 50%;
    color: var(--fb-text-subtle);
    cursor: pointer;
    transition: all var(--fb-transition-fast);
  }

  .context-clear:hover {
    background: rgba(239, 68, 68, 0.15);
    color: var(--fb-error);
  }

  /* Context Picker Panel */
  .context-picker {
    margin-top: var(--fb-space-xs);
    padding: var(--fb-space-sm);
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-md);
    animation: pickerEnter 0.25s var(--fb-transition-spring);
  }

  @keyframes pickerEnter {
    from {
      opacity: 0;
      transform: translateY(-8px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .picker-header {
    display: flex;
    align-items: center;
    gap: var(--fb-space-xs);
    margin-bottom: var(--fb-space-sm);
    padding-bottom: var(--fb-space-xs);
    border-bottom: 1px solid var(--fb-border);
  }

  .picker-title {
    flex: 1;
    font-size: var(--fb-text-sm);
    font-weight: 600;
    color: var(--fb-text);
    text-align: center;
  }

  .picker-back,
  .picker-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: none;
    border: none;
    border-radius: 50%;
    color: var(--fb-text-muted);
    cursor: pointer;
    transition: all var(--fb-transition-fast);
  }

  .picker-back:hover,
  .picker-close:hover {
    background: var(--fb-surface-hover);
    color: var(--fb-text);
  }

  .picker-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--fb-space-xs);
  }

  .picker-grid.tabs {
    grid-template-columns: repeat(2, 1fr);
  }

  .picker-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--fb-space-2xs);
    min-height: 64px;
    padding: var(--fb-space-sm);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid transparent;
    border-radius: var(--fb-radius-sm);
    color: var(--fb-text-muted);
    font-size: var(--fb-text-xs);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--fb-transition-base);
  }

  .picker-item i {
    font-size: 1.25rem;
    color: var(--fb-text-subtle);
    transition: all var(--fb-transition-fast);
  }

  .picker-item:hover {
    background: var(--fb-surface-hover);
    border-color: var(--fb-border);
    color: var(--fb-text);
  }

  .picker-item:hover i {
    color: var(--fb-primary);
    transform: scale(1.1);
  }

  .picker-item:active {
    transform: scale(0.96);
  }

  .picker-item.tab {
    flex-direction: row;
    min-height: 48px;
    font-size: var(--fb-text-sm);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     SUBMIT BUTTON
     ═══════════════════════════════════════════════════════════════════════════ */
  .form-footer {
    padding-top: var(--fb-space-sm);
  }

  .submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--fb-space-sm);
    width: 100%;
    min-height: 52px;
    padding: var(--fb-space-md) var(--fb-space-lg);
    background: linear-gradient(135deg, #34d399 0%, var(--fb-primary) 100%);
    border: none;
    border-radius: var(--fb-radius-md);
    color: white;
    font-size: var(--fb-text-base);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--fb-transition-base);
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
  }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
  }

  .submit-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .submit-btn i {
    font-size: 1.1em;
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
     RESPONSIVE BREAKPOINTS
     ═══════════════════════════════════════════════════════════════════════════ */

  /* Tablet+ (768px) */
  @media (min-width: 768px) {
    .options-row {
      flex-direction: row;
      align-items: flex-start;
    }

    .priority-section {
      flex: 1;
    }

    .context-section {
      flex: 1;
    }

    .submit-btn {
      width: auto;
      min-width: 200px;
    }

    .form-footer {
      display: flex;
      justify-content: flex-end;
    }

    .toast {
      flex-wrap: nowrap;
    }

    .picker-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  /* Desktop (1024px) */
  @media (min-width: 1024px) {
    .segment {
      min-height: 44px;
    }

    .submit-btn {
      min-height: 48px;
    }
  }

  /* Mobile-specific adjustments */
  @media (max-width: 479px) {
    .segment-label {
      font-size: var(--fb-text-xs);
    }

    .toast {
      flex-wrap: wrap;
    }

    .toast-action {
      width: 100%;
      margin-top: var(--fb-space-sm);
      text-align: center;
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
