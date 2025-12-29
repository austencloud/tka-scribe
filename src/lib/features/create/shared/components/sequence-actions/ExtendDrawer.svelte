<!--
  ExtendDrawer.svelte

  Drawer for selecting a LOOP (Linked Offset Operation Pattern) to extend a sequence.
  LOOP = TKA's algorithmic extension patterns (Mirrored, Rotated, Swapped, etc.)
  Uses the shared LOOPPicker component for consistent selection UI.
-->
<script lang="ts">
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import LOOPPicker from "$lib/shared/components/loop-picker/LOOPPicker.svelte";
  import type { Letter } from "$lib/shared/foundation/domain/models/Letter";
  import type {
    ExtensionAnalysis,
    LOOPType,
    CircularizationOption,
  } from "../../services/contracts/ISequenceExtender";

  interface Props {
    isOpen: boolean;
    analysis: ExtensionAnalysis | null;
    /** Circularization options when sequence isn't directly loopable */
    circularizationOptions?: CircularizationOption[];
    /** Reason why direct LOOPs aren't available */
    directUnavailableReason?: string | null;
    isApplying: boolean;
    /** Measured tool panel width for desktop sizing */
    toolPanelWidth?: number;
    onClose: () => void;
    /** Called when user selects a LOOP (with optional bridge letter) */
    onApply: (bridgeLetter: Letter | null, loopType: LOOPType) => void;
  }

  let {
    isOpen = $bindable(),
    analysis,
    circularizationOptions = [],
    directUnavailableReason = null,
    isApplying,
    toolPanelWidth = 0,
    onClose,
    onApply,
  }: Props = $props();

  // Build inline style for drawer width when we have a valid measurement
  const drawerStyle = $derived(
    toolPanelWidth > 0 ? `--measured-panel-width: ${toolPanelWidth}px` : ""
  );

  // Available LOOP options only
  const availableOptions = $derived(analysis?.availableLOOPOptions ?? []);

  function handleSelect(bridgeLetter: Letter | null, loopType: LOOPType) {
    if (isApplying) return;
    onApply(bridgeLetter, loopType);
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
    class="extend-drawer"
    backdropClass="extend-backdrop"
  >
    <div class="extend-drawer-content">
      <header class="drawer-header">
        <div class="header-info">
          <h2>Extend</h2>
          <span class="subtitle">
            {#if analysis?.extensionType === "half_rotation"}
              180° rotation patterns
            {:else if analysis?.extensionType === "quarter_rotation"}
              90° rotation patterns
            {:else if analysis?.extensionType === "already_complete"}
              Extend with pattern
            {:else}
              Extend your sequence
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

      {#if !analysis || !analysis.canExtend || (availableOptions.length === 0 && circularizationOptions.length === 0)}
        <div class="no-options">
          <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
          <p>No extension patterns available for this sequence.</p>
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

          <!-- Use shared LOOPPicker component -->
          <LOOPPicker
            directOptions={availableOptions}
            {circularizationOptions}
            onSelect={handleSelect}
            {directUnavailableReason}
            {isApplying}
          />
        </div>
      {/if}
    </div>
  </Drawer>
</div>

<style>
  /* Position extend drawer to cover Sequence Actions panel on desktop */
  :global(.extend-drawer.side-by-side-layout) {
    width: var(--measured-panel-width, clamp(360px, 44.44vw, 900px)) !important;
    max-width: 100% !important;
  }

  /* Backdrop transparent - we want to cover sequence actions, not dim everything */
  :global(.extend-backdrop) {
    background: transparent !important;
    backdrop-filter: none !important;
    pointer-events: none !important;
  }

  .extend-drawer-content {
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
    overflow-y: auto;
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
</style>
