<script lang="ts">
  /**
   * Share Hub Coordinator Component
   *
   * Simplified coordinator for unified Share Hub panel (no disabled states).
   * Handles export orchestration for all formats.
   *
   * Flow:
   * 1. User selects mode (Single Media | Composite) and format
   * 2. Clicks Export button
   * 3. If sequence not saved, show SaveToLibraryPanel
   * 4. After save (or if already saved), proceed with export
   *
   * Domain: Create module - Share Hub Coordination
   */

  import ShareHubDrawer from "$lib/shared/share-hub/components/ShareHubDrawer.svelte";
  import SaveToLibraryPanel from "../SaveToLibraryPanel.svelte";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { getCreateModuleContext } from "../../context/create-module-context";

  // Get context
  const ctx = getCreateModuleContext();
  const { CreateModuleState, panelState } = ctx;

  // Services
  let hapticService: IHapticFeedbackService | null = null;

  // Resolve haptic service
  try {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  } catch (error) {
    console.warn("⚠️ Failed to resolve haptic feedback service:", error);
  }

  // State
  let showSaveToLibrary = $state(false);
  let pendingExport = $state<{ mode: 'single' | 'composite'; format?: string } | null>(null);

  // Derived: Get current sequence from active tab
  const currentSequence = $derived(
    CreateModuleState.sequenceState.currentSequence
  );

  // Check if sequence is saved
  const isSequenceSaved = $derived(!!currentSequence?.id);

  // Event handlers
  function handleClose() {
    hapticService?.trigger("selection");
    panelState.closeShareHubPanel();
  }

  async function handleExport(mode: 'single' | 'composite', format?: string) {
    console.log("📱 ShareHubCoordinator: Export requested", { mode, format });

    // Check if sequence is saved
    if (!isSequenceSaved) {
      console.log("📱 ShareHubCoordinator: Sequence not saved, opening SaveToLibraryPanel");
      pendingExport = { mode, format };
      showSaveToLibrary = true;
      hapticService?.trigger("selection");
      return;
    }

    // Sequence is saved, proceed with export
    await performExport(mode, format);
  }

  async function performExport(mode: 'single' | 'composite', format?: string) {
    console.log("📱 ShareHubCoordinator: Performing export", { mode, format });
    // TODO: Wire to actual export services
    // - VideoExportOrchestrator for animation/composite
    // - ImageCompositionService for static
    // - Firebase upload service for performance video
    hapticService?.trigger("success");
  }

  function handleSaveComplete(savedSequenceId: string) {
    console.log("📱 ShareHubCoordinator: Save complete, proceeding with export");
    showSaveToLibrary = false;

    // Proceed with pending export
    if (pendingExport) {
      performExport(pendingExport.mode, pendingExport.format);
      pendingExport = null;
    }

    hapticService?.trigger("success");
  }

  function handleSaveCancel() {
    console.log("📱 ShareHubCoordinator: Save cancelled");
    showSaveToLibrary = false;
    pendingExport = null;
  }
</script>

<ShareHubDrawer
  isOpen={panelState.isShareHubPanelOpen}
  sequence={currentSequence}
  onClose={handleClose}
  onExport={handleExport}
/>

{#if showSaveToLibrary}
  <SaveToLibraryPanel
    onSaveComplete={handleSaveComplete}
    onCancel={handleSaveCancel}
  />
{/if}
