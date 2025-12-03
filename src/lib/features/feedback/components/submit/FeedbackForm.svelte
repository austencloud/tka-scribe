<!-- FeedbackForm - Premium responsive feedback form with golden ratio spacing -->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import type { FeedbackSubmitState } from "../../state/feedback-submit-state.svelte";
  import { TYPE_CONFIG, PRIORITY_CONFIG } from "../../domain/models/feedback-models";
  import type { FeedbackType, FeedbackPriority } from "../../domain/models/feedback-models";
  import { MODULE_DEFINITIONS } from "$lib/shared/navigation/state/navigation-state.svelte";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";

  // Props
  const { formState } = $props<{
    formState: FeedbackSubmitState;
  }>();

  // Context picker flow state: 'closed' | 'modules' | 'tabs'
  let contextStep = $state<'closed' | 'modules' | 'tabs'>('closed');
  let selectedModuleId = $state<string>('');
  let hapticService: IHapticFeedbackService | undefined;

  // Mobile detection for context picker drawer
  let formElement: HTMLFormElement | undefined = $state();
  let useMobileDrawer = $state(false);

  // Options drawer state (Priority + Context)
  let isOptionsDrawerOpen = $state(false);

  // Derived: is context drawer open (for mobile) - but not when options drawer is open
  const isContextDrawerOpen = $derived(useMobileDrawer && contextStep !== 'closed' && !isOptionsDrawerOpen);

  // Derived: summary of selected options for the trigger button
  const optionsSummary = $derived(() => {
    const parts: string[] = [];
    if (formState.formData.priority) {
      const priorityConfig = PRIORITY_CONFIG[formState.formData.priority];
      parts.push(priorityConfig?.label || formState.formData.priority);
    }
    if (formState.formData.reportedModule) {
      parts.push(contextDisplayText());
    }
    return parts.length > 0 ? parts.join(' · ') : null;
  });

  function openOptionsDrawer() {
    hapticService?.trigger("selection");
    isOptionsDrawerOpen = true;
  }

  function closeOptionsDrawer() {
    hapticService?.trigger("selection");
    isOptionsDrawerOpen = false;
  }

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);

    // Detect mobile via ResizeObserver on form container
    if (formElement) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          useMobileDrawer = entry.contentRect.width < 420;
        }
      });
      observer.observe(formElement);
      return () => observer.disconnect();
    }
  });

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
    hapticService?.trigger("selection");
    contextStep = 'modules';
  }

  function selectModule(moduleId: string) {
    hapticService?.trigger("selection");
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
    hapticService?.trigger("selection");
    formState.updateField("reportedModule", selectedModuleId);
    formState.updateField("reportedTab", tabId);
    contextStep = 'closed';
  }

  function goBackToModules() {
    hapticService?.trigger("selection");
    contextStep = 'modules';
    selectedModuleId = '';
  }

  function clearContext() {
    hapticService?.trigger("selection");
    formState.updateField("reportedModule", "");
    formState.updateField("reportedTab", "");
    contextStep = 'closed';
    selectedModuleId = '';
  }

  function handleTypeChange(type: FeedbackType) {
    hapticService?.trigger("selection");
    formState.setType(type);
  }

  function handlePriorityChange(priority: FeedbackPriority | "") {
    hapticService?.trigger("selection");
    formState.setPriority(priority);
  }

  function closeContextPicker() {
    hapticService?.trigger("selection");
    contextStep = 'closed';
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
    hapticService?.trigger("selection");
    await formState.submit();
  }

  function handleReset() {
    hapticService?.trigger("selection");
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
    bind:this={formElement}
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
          onclick={() => handleTypeChange(type as FeedbackType)}
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
        {#if formState.formData.title.trim().length < 3}
          {3 - formState.formData.title.trim().length} more needed
        {:else}
          <i class="fas fa-check"></i>
        {/if}
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
        {#if formState.formData.description.trim().length < 10}
          {10 - formState.formData.description.trim().length} more needed
        {:else}
          <i class="fas fa-check"></i>
        {/if}
      </span>
      {#if formState.formErrors.description}
        <span class="field-error" role="alert">{formState.formErrors.description}</span>
      {/if}
    </div>
  </div>

  <!-- More Options - Opens bottom sheet -->
  <button type="button" class="options-trigger" onclick={openOptionsDrawer}>
    <i class="fas fa-sliders"></i>
    {#if optionsSummary()}
      <span class="options-summary">{optionsSummary()}</span>
    {:else}
      <span>More options</span>
    {/if}
    <i class="fas fa-chevron-right options-chevron"></i>
  </button>

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

<!-- Mobile: Context picker in bottom drawer -->
{#if useMobileDrawer}
  <Drawer
    isOpen={isContextDrawerOpen}
    placement="bottom"
    snapPoints={["50%", "75%"]}
    onclose={closeContextPicker}
    ariaLabel="Select context"
    class="context-drawer"
  >
    <div class="drawer-picker-content" style="--active-type-color: {currentTypeConfig.color}">
      {#if contextStep === 'modules'}
        <div class="picker-header">
          <span class="picker-title">Select Module</span>
          <button type="button" class="picker-close" onclick={closeContextPicker}>
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
      {:else if contextStep === 'tabs'}
        <div class="picker-header">
          <button type="button" class="picker-back" onclick={goBackToModules}>
            <i class="fas fa-arrow-left"></i>
          </button>
          <span class="picker-title">{getModuleLabel(selectedModuleId)}</span>
          <button type="button" class="picker-close" onclick={closeContextPicker}>
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
      {/if}
    </div>
  </Drawer>
{/if}

<!-- Options Drawer (Priority + Context) -->
<Drawer
  bind:isOpen={isOptionsDrawerOpen}
  placement="bottom"
  onclose={closeOptionsDrawer}
  ariaLabel="More options"
>
  <div class="options-drawer-content" style="--active-type-color: {currentTypeConfig.color}">
    <div class="drawer-header">
      <span class="drawer-title">More Options</span>
      <button type="button" class="drawer-close" onclick={closeOptionsDrawer}>
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Priority Section -->
    <div class="drawer-section">
      <span class="drawer-section-label">Priority</span>
      <div class="priority-grid">
        {#each Object.entries(PRIORITY_CONFIG) as [priority, config]}
          <button
            type="button"
            class="priority-option"
            class:selected={formState.formData.priority === priority}
            onclick={() => handlePriorityChange(formState.formData.priority === priority ? "" : priority as FeedbackPriority)}
            style="--priority-color: {config.color}"
          >
            <i class="fas {config.icon}"></i>
            <span>{config.label}</span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Context Section -->
    <div class="drawer-section">
      <span class="drawer-section-label">Context</span>
      <p class="drawer-section-hint">Where did you encounter this?</p>

      {#if contextStep === 'closed'}
        {#if hasContextSelected}
          <div class="context-selected">
            <div class="context-selected-value">
              <i class="fas fa-map-marker-alt"></i>
              <span>{contextDisplayText()}</span>
            </div>
            <button type="button" class="context-change" onclick={openContextPicker}>Change</button>
            <button type="button" class="context-remove" onclick={clearContext}>
              <i class="fas fa-times"></i>
            </button>
          </div>
        {:else}
          <button type="button" class="context-select-btn" onclick={openContextPicker}>
            <i class="fas fa-crosshairs"></i>
            <span>Select location</span>
          </button>
        {/if}
      {:else if contextStep === 'modules'}
        <div class="context-picker-inline">
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
        <div class="context-picker-inline">
          <button type="button" class="picker-back-btn" onclick={goBackToModules}>
            <i class="fas fa-arrow-left"></i>
            <span>Back to modules</span>
          </button>
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

    <button type="button" class="drawer-done-btn" onclick={closeOptionsDrawer}>
      Done
    </button>
  </div>
</Drawer>
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
    /* Tighter gaps for mobile */
    gap: clamp(8px, 2.5cqi, 16px);
    width: 100%;
    /* Tighter padding for mobile */
    padding: clamp(12px, 3cqi, 24px);
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
    /* Tighter height for mobile - 3 lines minimum */
    min-height: clamp(72px, 15cqi, 100px);
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

  /* Modern :has() enhancement for active field styling */
  .field:has(.field-input:not(:placeholder-shown)) .field-label,
  .field:has(.field-textarea:not(:placeholder-shown)) .field-label {
    color: var(--fb-primary);
  }

  .field-error {
    margin: 0;
    font-size: clamp(0.7rem, 1.8cqi, 0.8rem);
    font-weight: 500;
    color: var(--fb-error);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     OPTIONS TRIGGER - Opens bottom sheet
     ═══════════════════════════════════════════════════════════════════════════ */
  .options-trigger {
    display: flex;
    align-items: center;
    gap: clamp(8px, 2cqi, 12px);
    width: 100%;
    min-height: 48px; /* Required 48px touch target */
    padding: 0 clamp(12px, 3cqi, 16px);
    background: rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: clamp(8px, 2cqi, 10px);
    color: var(--fb-text-muted);
    font-size: clamp(0.8rem, 2.2cqi, 0.875rem);
    font-weight: 600;
    cursor: pointer;
    transition: all 150ms ease;
  }

  .options-trigger:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.12);
    color: var(--fb-text);
  }

  .options-trigger i:first-child {
    color: var(--fb-primary);
    font-size: 0.9em;
  }

  .options-summary {
    flex: 1;
    text-align: left;
    color: var(--fb-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .options-chevron {
    margin-left: auto;
    font-size: 0.7em;
    opacity: 0.5;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     OPTIONS DRAWER CONTENT
     ═══════════════════════════════════════════════════════════════════════════ */
  .options-drawer-content {
    --fb-primary: var(--active-type-color, #3b82f6);
    --fb-text: rgba(255, 255, 255, 0.95);
    --fb-text-muted: rgba(255, 255, 255, 0.7);
    --fb-text-subtle: rgba(255, 255, 255, 0.5);

    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .drawer-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--fb-text);
  }

  .drawer-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: none;
    border: none;
    border-radius: 50%;
    color: var(--fb-text-muted);
    cursor: pointer;
    transition: all 150ms ease;
  }

  .drawer-close:hover {
    background: rgba(255, 255, 255, 0.08);
    color: var(--fb-text);
  }

  .drawer-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .drawer-section-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--fb-text);
  }

  .drawer-section-hint {
    margin: -6px 0 0 0;
    font-size: 0.8125rem;
    color: var(--fb-text-subtle);
  }

  .priority-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .priority-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-height: 56px;
    padding: 10px 6px;
    background: rgba(0, 0, 0, 0.2);
    border: 1.5px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    color: var(--fb-text-subtle);
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 200ms ease;
  }

  .priority-option i {
    font-size: 1rem;
  }

  .priority-option:hover {
    background: color-mix(in srgb, var(--priority-color) 15%, rgba(0, 0, 0, 0.25));
    border-color: color-mix(in srgb, var(--priority-color) 50%, transparent);
    color: var(--fb-text-muted);
  }

  .priority-option:hover i {
    color: var(--priority-color);
  }

  .priority-option.selected {
    background: color-mix(in srgb, var(--priority-color) 20%, rgba(0, 0, 0, 0.25));
    border-color: var(--priority-color);
    color: var(--fb-text);
  }

  .priority-option.selected i {
    color: var(--priority-color);
  }

  .context-selected {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }

  .context-selected-value {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--fb-text);
    font-size: 0.875rem;
    font-weight: 500;
  }

  .context-selected-value i {
    color: var(--fb-primary);
  }

  .context-change {
    min-height: 48px;
    padding: 0 12px;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    border-radius: 6px;
    color: var(--fb-text-muted);
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 150ms ease;
  }

  .context-change:hover {
    background: rgba(255, 255, 255, 0.12);
    color: var(--fb-text);
  }

  .context-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: none;
    border: none;
    border-radius: 50%;
    color: var(--fb-text-subtle);
    cursor: pointer;
    transition: all 150ms ease;
  }

  .context-remove:hover {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }

  .context-select-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 48px;
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.2);
    border: 1.5px dashed rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    color: var(--fb-text-muted);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 200ms ease;
  }

  .context-select-btn i {
    color: var(--fb-primary);
  }

  .context-select-btn:hover {
    background: color-mix(in srgb, var(--fb-primary) 10%, rgba(0, 0, 0, 0.25));
    border-color: color-mix(in srgb, var(--fb-primary) 50%, transparent);
    border-style: solid;
    color: var(--fb-text);
  }

  .context-picker-inline {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .picker-back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 48px;
    padding: 0 12px;
    background: none;
    border: none;
    color: var(--fb-primary);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 150ms ease;
  }

  .picker-back-btn:hover {
    opacity: 0.8;
  }

  .drawer-done-btn {
    min-height: 48px;
    padding: 14px 24px;
    background: var(--fb-primary);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 200ms ease;
  }

  .drawer-done-btn:hover {
    filter: brightness(1.1);
  }

  .drawer-done-btn:active {
    transform: scale(0.98);
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
     DRAWER PICKER CONTENT - Mobile context picker in bottom drawer
     ═══════════════════════════════════════════════════════════════════════════ */
  .drawer-picker-content {
    --fb-primary: var(--active-type-color, #3b82f6);
    --fb-text: rgba(255, 255, 255, 0.95);
    --fb-text-muted: rgba(255, 255, 255, 0.7);
    --fb-text-subtle: rgba(255, 255, 255, 0.5);

    padding: 16px;
  }

  .drawer-picker-content .picker-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .drawer-picker-content .picker-title {
    flex: 1;
    font-size: 1rem;
    font-weight: 600;
    color: var(--fb-text);
    text-align: center;
  }

  .drawer-picker-content .picker-back,
  .drawer-picker-content .picker-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: none;
    border: none;
    border-radius: 50%;
    color: var(--fb-text-muted);
    cursor: pointer;
    transition: all 150ms ease;
  }

  .drawer-picker-content .picker-back:hover,
  .drawer-picker-content .picker-close:hover {
    background: rgba(255, 255, 255, 0.08);
    color: var(--fb-text);
  }

  .drawer-picker-content .picker-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .drawer-picker-content .picker-grid.tabs {
    grid-template-columns: repeat(2, 1fr);
  }

  .drawer-picker-content .picker-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 64px;
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    color: var(--fb-text-muted);
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 200ms ease;
  }

  .drawer-picker-content .picker-item i {
    font-size: 1.25rem;
    color: var(--fb-text-subtle);
  }

  .drawer-picker-content .picker-item:hover {
    background: color-mix(in srgb, var(--fb-primary) 15%, rgba(0, 0, 0, 0.25));
    border-color: color-mix(in srgb, var(--fb-primary) 50%, transparent);
    color: var(--fb-text);
  }

  .drawer-picker-content .picker-item:hover i {
    color: var(--fb-primary);
  }

  .drawer-picker-content .picker-item:active {
    transform: scale(0.97);
  }

  .drawer-picker-content .picker-item.tab {
    flex-direction: row;
    min-height: 52px;
    font-size: 0.9375rem;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     SUBMIT BUTTON - Fluid
     ═══════════════════════════════════════════════════════════════════════════ */
  .form-footer {
    /* Sticky footer - always visible on mobile */
    position: sticky;
    bottom: calc(-1 * clamp(12px, 3cqi, 24px));
    z-index: 10;

    /* Extend to edges of form */
    margin-inline: calc(-1 * clamp(12px, 3cqi, 24px));
    padding-inline: clamp(12px, 3cqi, 24px);
    margin-bottom: calc(-1 * clamp(12px, 3cqi, 24px));
    padding-bottom: calc(clamp(12px, 3cqi, 24px) + env(safe-area-inset-bottom, 0px));
    padding-top: clamp(10px, 2.5cqi, 14px);

    /* Gradient fade for content scrolling behind */
    background: linear-gradient(
      to top,
      color-mix(in srgb, var(--active-type-color, #3b82f6) 4%, rgba(18, 18, 28, 1)) 0%,
      color-mix(in srgb, var(--active-type-color, #3b82f6) 4%, rgba(18, 18, 28, 1)) 70%,
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
