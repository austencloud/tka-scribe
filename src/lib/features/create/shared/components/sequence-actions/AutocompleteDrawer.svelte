<!--
  AutocompleteDrawer.svelte

  Drawer for selecting a CAP (Continuous Assembly Pattern) to complete a sequence.
  Shows available CAP options and allows user to select one to apply.
-->
<script lang="ts">
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import type {
    CAPOption,
    AutocompleteAnalysis,
  } from "../../services/contracts/IAutocompleter";
  import { CAPType } from "$lib/features/create/generate/circular/domain/models/circular-models";

  interface Props {
    isOpen: boolean;
    analysis: AutocompleteAnalysis | null;
    isApplying: boolean;
    onClose: () => void;
    onApply: (capType: CAPType) => void;
  }

  let {
    isOpen = $bindable(),
    analysis,
    isApplying,
    onClose,
    onApply,
  }: Props = $props();

  // Group available CAP options by category
  const availableStrictOptions = $derived(
    analysis?.availableCAPOptions.filter((opt) =>
      opt.capType.startsWith("strict_")
    ) ?? []
  );

  const availableCombinedOptions = $derived(
    analysis?.availableCAPOptions.filter(
      (opt) => !opt.capType.startsWith("strict_")
    ) ?? []
  );

  // Get unavailable options (grayed out)
  const unavailableOptions = $derived(analysis?.unavailableCAPOptions ?? []);

  // Check if we have any unavailable options to show
  const hasUnavailableOptions = $derived(unavailableOptions.length > 0);

  function handleSelect(capType: CAPType) {
    if (isApplying) return;
    onApply(capType);
  }

  function handleClose() {
    if (isApplying) return;
    onClose();
  }

  // Get icon class, handling missing icons gracefully
  function getIconClass(icon: string): string {
    // Most icons in the config use fa- prefix
    if (icon.startsWith("fa-")) {
      return `fas ${icon}`;
    }
    return icon;
  }
</script>

<Drawer
  bind:isOpen
  placement="right"
  onclose={handleClose}
  class="autocomplete-drawer"
>
  <div class="autocomplete-drawer-content">
    <header class="drawer-header">
      <div class="header-info">
        <h2>Autocomplete</h2>
        <span class="subtitle">
          {#if analysis?.completionType === "half_rotation"}
            180° rotation patterns
          {:else if analysis?.completionType === "quarter_rotation"}
            90° rotation patterns
          {:else if analysis?.completionType === "already_complete"}
            Extend with pattern
          {:else}
            Select a completion pattern
          {/if}
        </span>
      </div>
      <button class="close-btn" onclick={handleClose} disabled={isApplying} aria-label="Close">
        <i class="fas fa-times"></i>
      </button>
    </header>

    {#if !analysis || !analysis.canComplete}
      <div class="no-options">
        <i class="fas fa-exclamation-circle"></i>
        <p>No completion patterns available for this sequence.</p>
      </div>
    {:else}
      <div class="options-container">
        <!-- Position Info -->
        <div class="position-info">
          <div class="position-row">
            <span class="label">Start:</span>
            <span class="position">{analysis.startPosition}</span>
          </div>
          <div class="position-row">
            <span class="label">Current End:</span>
            <span class="position">{analysis.currentEndPosition}</span>
          </div>
        </div>

        <!-- Available Basic Patterns -->
        {#if availableStrictOptions.length > 0}
          <section class="options-section">
            <h3>Basic Patterns</h3>
            <div class="options-grid">
              {#each availableStrictOptions as option}
                <button
                  class="cap-option"
                  class:applying={isApplying}
                  onclick={() => handleSelect(option.capType)}
                  disabled={isApplying}
                >
                  <div class="option-icon">
                    <i class={getIconClass(option.icon)}></i>
                  </div>
                  <div class="option-info">
                    <span class="option-name">{option.name}</span>
                    <span class="option-desc">{option.description}</span>
                  </div>
                </button>
              {/each}
            </div>
          </section>
        {/if}

        <!-- Available Combined Patterns -->
        {#if availableCombinedOptions.length > 0}
          <section class="options-section">
            <h3>Combined Patterns</h3>
            <div class="options-grid">
              {#each availableCombinedOptions as option}
                <button
                  class="cap-option combined"
                  class:applying={isApplying}
                  onclick={() => handleSelect(option.capType)}
                  disabled={isApplying}
                >
                  <div class="option-icon">
                    <i class={getIconClass(option.icon)}></i>
                  </div>
                  <div class="option-info">
                    <span class="option-name">{option.name}</span>
                    <span class="option-desc">{option.description}</span>
                  </div>
                </button>
              {/each}
            </div>
          </section>
        {/if}

        <!-- Unavailable Patterns (grayed out) -->
        {#if hasUnavailableOptions}
          <section class="options-section unavailable-section">
            <h3>
              <i class="fas fa-lock"></i>
              Other Patterns
              <span class="unavailable-hint"
                >(requires different position)</span
              >
            </h3>
            <div class="options-grid">
              {#each unavailableOptions as option}
                <div class="cap-option unavailable">
                  <div class="option-icon">
                    <i class={getIconClass(option.icon)}></i>
                  </div>
                  <div class="option-info">
                    <span class="option-name">{option.name}</span>
                    <span class="option-desc">{option.description}</span>
                  </div>
                </div>
              {/each}
            </div>
          </section>
        {/if}

        {#if isApplying}
          <div class="applying-overlay">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Applying pattern...</span>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</Drawer>

<style>
  .autocomplete-drawer-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background: var(--theme-panel-bg, rgba(20, 20, 25, 0.95));
    color: var(--theme-text, #fff);
  }

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .header-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .drawer-header h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .subtitle {
    font-size: 0.8rem;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
  }

  .close-btn {
    background: transparent;
    border: none;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
    font-size: 1.1rem;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .close-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
  }

  .close-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .no-options {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 48px 24px;
    text-align: center;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
  }

  .no-options i {
    font-size: 2rem;
    opacity: 0.6;
  }

  .options-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    position: relative;
  }

  .position-info {
    display: flex;
    justify-content: space-between;
    padding: 12px;
    margin-bottom: 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    font-size: 0.85rem;
  }

  .position-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .label {
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
  }

  .position {
    font-family: monospace;
    font-weight: 500;
    color: #14b8a6;
  }

  .options-section {
    margin-bottom: 20px;
  }

  .options-section h3 {
    font-size: 0.8rem;
    font-weight: 500;
    margin: 0 0 10px;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .options-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .cap-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
    width: 100%;
  }

  .cap-option:hover:not(:disabled) {
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.4);
  }

  .cap-option:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .cap-option.applying {
    pointer-events: none;
  }

  .cap-option.combined {
    background: rgba(255, 255, 255, 0.03);
  }

  .cap-option.combined:hover:not(:disabled) {
    background: rgba(99, 102, 241, 0.1);
    border-color: rgba(99, 102, 241, 0.4);
  }

  .option-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(16, 185, 129, 0.15);
    border-radius: 8px;
    color: #10b981;
    font-size: 1rem;
    flex-shrink: 0;
  }

  .cap-option.combined .option-icon {
    background: rgba(99, 102, 241, 0.15);
    color: #6366f1;
  }

  .option-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .option-name {
    font-weight: 500;
    font-size: 0.9rem;
    color: var(--theme-text, #fff);
  }

  .option-desc {
    font-size: 0.75rem;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .applying-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: rgba(20, 20, 25, 0.9);
    color: #14b8a6;
    font-size: 0.9rem;
  }

  .applying-overlay i {
    font-size: 1.5rem;
  }

  /* Unavailable section styles */
  .unavailable-section {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .unavailable-section h3 {
    display: flex;
    align-items: center;
    gap: 6px;
    color: rgba(255, 255, 255, 0.35);
  }

  .unavailable-section h3 i {
    font-size: 0.7rem;
    opacity: 0.7;
  }

  .unavailable-hint {
    font-weight: 400;
    font-size: 0.65rem;
    text-transform: none;
    letter-spacing: normal;
    opacity: 0.7;
  }

  .cap-option.unavailable {
    cursor: not-allowed;
    opacity: 0.4;
    background: rgba(255, 255, 255, 0.02);
    border-color: rgba(255, 255, 255, 0.05);
  }

  .cap-option.unavailable .option-icon {
    background: rgba(100, 100, 100, 0.2);
    color: rgba(255, 255, 255, 0.35);
  }

  .cap-option.unavailable .option-name {
    color: rgba(255, 255, 255, 0.4);
  }

  .cap-option.unavailable .option-desc {
    color: rgba(255, 255, 255, 0.25);
  }
</style>
