<!--
  AutocompleteDrawer.svelte

  Drawer for selecting a CAP (Continuous Assembly Pattern) to complete a sequence.
  Shows only the available completion options as simple, prominent buttons.
-->
<script lang="ts">
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import type { AutocompleteAnalysis } from "../../services/contracts/IAutocompleter";
  import { CAPType } from "$lib/features/create/generate/circular/domain/models/circular-models";

  interface Props {
    isOpen: boolean;
    analysis: AutocompleteAnalysis | null;
    isApplying: boolean;
    /** Measured tool panel width for desktop sizing */
    toolPanelWidth?: number;
    onClose: () => void;
    onApply: (capType: CAPType) => void;
  }

  let {
    isOpen = $bindable(),
    analysis,
    isApplying,
    toolPanelWidth = 0,
    onClose,
    onApply,
  }: Props = $props();

  // Build inline style for drawer width when we have a valid measurement
  const drawerStyle = $derived(
    toolPanelWidth > 0 ? `--measured-panel-width: ${toolPanelWidth}px` : ""
  );

  // Available options only
  const availableOptions = $derived(analysis?.availableCAPOptions ?? []);

  function handleSelect(capType: CAPType) {
    if (isApplying) return;
    onApply(capType);
  }

  function handleClose() {
    if (isApplying) return;
    onClose();
  }
</script>

<div style={drawerStyle}>
  <Drawer
    bind:isOpen
    placement="right"
    onclose={handleClose}
    showHandle={false}
    respectLayoutMode={true}
    class="autocomplete-drawer"
    backdropClass="autocomplete-backdrop"
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
              Complete your sequence
            {/if}
          </span>
        </div>
        <button
          class="close-btn"
          onclick={handleClose}
          disabled={isApplying}
          aria-label="Close"
        >
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </header>

      {#if !analysis || !analysis.canComplete || availableOptions.length === 0}
        <div class="no-options">
          <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
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
              <span class="label">End:</span>
              <span class="position">{analysis.currentEndPosition}</span>
            </div>
          </div>

          <!-- Available Options - fill remaining space -->
          <div class="options-grid">
            {#each availableOptions as option}
              <button
                class="cap-option"
                class:applying={isApplying}
                onclick={() => handleSelect(option.capType)}
                disabled={isApplying}
              >
                {option.name}
              </button>
            {/each}
          </div>

          {#if isApplying}
            <div class="applying-overlay">
              <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
              <span>Applying pattern...</span>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </Drawer>
</div>

<style>
  /* Position autocomplete drawer to cover Sequence Actions panel on desktop */
  :global(.autocomplete-drawer.side-by-side-layout) {
    width: var(--measured-panel-width, clamp(360px, 44.44vw, 900px)) !important;
    max-width: 100% !important;
  }

  /* Backdrop transparent - we want to cover sequence actions, not dim everything */
  :global(.autocomplete-backdrop) {
    background: transparent !important;
    backdrop-filter: none !important;
    pointer-events: none !important;
  }

  .autocomplete-drawer-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background: var(--theme-panel-bg);
    color: var(--theme-text);
  }

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px;
    border-bottom: 1px solid var(--theme-stroke);
    flex-shrink: 0;
  }

  .header-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .drawer-header h2 {
    margin: 0;
    font-size: var(--font-size-lg, 1.1rem);
    font-weight: 600;
  }

  .subtitle {
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text-dim);
  }

  .close-btn {
    background: transparent;
    border: none;
    color: var(--theme-text-dim);
    font-size: var(--font-size-lg, 1.1rem);
    cursor: pointer;
    padding: 4px 8px;
    border-radius: var(--radius-sm, 4px);
  }

  .close-btn:hover:not(:disabled) {
    background: var(--theme-hover-bg);
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
    color: var(--theme-text-dim);
    flex: 1;
  }

  .no-options i {
    font-size: var(--font-size-2xl, 2rem);
    opacity: 0.6;
  }

  .options-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 16px;
    gap: 16px;
    position: relative;
  }

  .position-info {
    display: flex;
    justify-content: space-between;
    padding: 12px;
    background: var(--theme-card-bg);
    border-radius: var(--radius-md, 8px);
    font-size: var(--font-size-sm, 14px);
    flex-shrink: 0;
  }

  .position-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .label {
    color: var(--theme-text-dim);
  }

  .position {
    font-family: monospace;
    font-weight: 500;
    color: var(--theme-accent);
  }

  .options-grid {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    justify-content: center;
  }

  .cap-option {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-height: 60px;
    padding: 16px 20px;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-accent) 20%, transparent) 0%,
      color-mix(in srgb, var(--theme-accent) 8%, transparent) 100%
    );
    border: 2px solid
      color-mix(in srgb, var(--theme-accent) 40%, transparent);
    border-radius: var(--radius-lg, 12px);
    cursor: pointer;
    color: var(--theme-text);
    font-size: var(--font-size-lg, 1.1rem);
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .cap-option:hover:not(:disabled) {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-accent) 30%, transparent) 0%,
      color-mix(in srgb, var(--theme-accent) 15%, transparent) 100%
    );
    border-color: var(--theme-accent);
    transform: translateY(-2px);
    box-shadow: 0 4px 20px
      color-mix(in srgb, var(--theme-accent) 30%, transparent);
  }

  .cap-option:active:not(:disabled) {
    transform: translateY(0);
  }

  .cap-option:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .cap-option.applying {
    pointer-events: none;
  }

  .applying-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: var(--theme-panel-bg);
    color: var(--theme-accent);
    font-size: var(--font-size-sm, 14px);
    border-radius: var(--radius-md, 8px);
  }

  .applying-overlay i {
    font-size: var(--font-size-xl, 1.5rem);
  }
</style>
