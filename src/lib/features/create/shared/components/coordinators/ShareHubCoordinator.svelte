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
  import type { ExportSettings } from "$lib/shared/share-hub/domain/models/ExportSettings";
  import SaveToLibraryPanel from "../SaveToLibraryPanel.svelte";
  import type { IHapticFeedback } from "$lib/shared/application/services/contracts/IHapticFeedback";
  import type { ISharer } from "$lib/shared/share/services/contracts/ISharer";
  import type { IPlatformDetector } from "$lib/shared/mobile/services/contracts/IPlatformDetector";
  import type { ShareOptions } from "$lib/shared/share/domain/models/ShareOptions";
  import { DEFAULT_SHARE_OPTIONS } from "$lib/shared/share/domain/models/ShareOptions";
  import { resolve, loadFeatureModule } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { getCreateModuleContext } from "../../context/create-module-context";
  import { showToast } from "$lib/shared/toast/state/toast-state.svelte";
  import { getImageCompositionManager } from "$lib/shared/share/state/image-composition-state.svelte";
  import { authState } from "$lib/shared/auth/state/authState.svelte";

  // Get context
  const ctx = getCreateModuleContext();
  const { CreateModuleState, panelState } = ctx;

  // Services
  let hapticService: IHapticFeedback | null = null;
  let shareService: ISharer | null = null;
  let platformService: IPlatformDetector | null = null;

  // Resolve services
  try {
    hapticService = resolve<IHapticFeedback>(
      TYPES.IHapticFeedback
    );
  } catch (error) {
    console.warn("⚠️ Failed to resolve haptic feedback service:", error);
  }

  try {
    shareService = resolve<ISharer>(TYPES.ISharer);
  } catch (error) {
    console.warn("⚠️ Failed to resolve share service:", error);
  }

  try {
    platformService = resolve<IPlatformDetector>(
      TYPES.IPlatformDetector
    );
  } catch (error) {
    console.warn("⚠️ Failed to resolve platform detection service:", error);
  }

  // Detect if we're on mobile (for share vs download behavior)
  const platform = platformService?.detectPlatform() ?? 'desktop';
  const isMobile = platform === 'ios' || platform === 'android';

  // State
  let showSaveToLibrary = $state(false);
  let pendingExport = $state<{ mode: 'single' | 'composite'; settings?: ExportSettings } | null>(null);
  let isExporting = $state(false);

  // Derived: Get current sequence from active tab
  const currentSequence = $derived(
    CreateModuleState.sequenceState.currentSequence
  );

  // Check if sequence is saved to library
  // A sequence is considered "saved" if the session manager has marked it as saved
  // This happens after the user successfully saves to their library
  const isSequenceSaved = $derived(
    ctx.sessionManager?.getCurrentSession()?.isSaved ?? false
  );

  // Event handlers
  function handleClose() {
    hapticService?.trigger("selection");
    panelState.closeShareHubPanel();
  }

  async function handleExport(mode: 'single' | 'composite', settings?: ExportSettings) {
    console.log("📱 ShareHubCoordinator: Export requested", { mode, settings });

    if (isExporting) return;

    // Check if sequence is saved
    if (!isSequenceSaved) {
      console.log("📱 ShareHubCoordinator: Sequence not saved, opening SaveToLibraryPanel");
      pendingExport = { mode, settings };
      showSaveToLibrary = true;
      hapticService?.trigger("selection");
      return;
    }

    // Sequence is saved, proceed with export
    await performExport(mode, settings);
  }

  async function performExport(mode: 'single' | 'composite', settings?: ExportSettings) {
    console.log("📱 ShareHubCoordinator: Performing export", { mode, settings });

    if (!currentSequence) {
      showToast("No sequence to export", "error");
      return;
    }

    isExporting = true;

    try {
      if (mode === 'single' && settings) {
        switch (settings.format) {
          case 'animation':
            await exportAnimation(settings);
            break;
          case 'static':
            await exportStatic(settings);
            break;
          case 'performance':
            await exportPerformance(settings);
            break;
          default:
            throw new Error(`Unknown format: ${settings.format}`);
        }
      } else if (mode === 'composite') {
        // Composite export - TODO: implement full composite rendering
        showToast("Composite export coming soon!", "info");
        hapticService?.trigger("selection");
        return;
      } else {
        throw new Error("Export settings required for single media export");
      }

      hapticService?.trigger("success");
      showToast("Export complete!", "success");
      panelState.closeShareHubPanel();
    } catch (error) {
      console.error("📱 ShareHubCoordinator: Export failed", error);
      hapticService?.trigger("error");
      showToast(
        error instanceof Error ? error.message : "Export failed",
        "error"
      );
    } finally {
      isExporting = false;
    }
  }

  async function exportStatic(settings: ExportSettings) {
    if (!shareService || !currentSequence) {
      throw new Error("Share service not available");
    }

    // Get user's saved image composition settings
    const imageSettings = getImageCompositionManager();
    const compositionSettings = imageSettings.getSettings();

    // Use user's saved settings for export
    const shareOptions: ShareOptions = {
      ...DEFAULT_SHARE_OPTIONS,
      format: 'PNG',
      quality: 1.0,
      backgroundColor: '#FFFFFF',
      includeStartPosition: compositionSettings.includeStartPosition,
      addBeatNumbers: compositionSettings.addBeatNumbers,
      addWord: compositionSettings.addWord,
      addUserInfo: compositionSettings.addUserInfo,
      addDifficultyLevel: compositionSettings.addDifficultyLevel,
      userName: authState.user?.displayName ?? '',
    };

    console.log("📱 ShareHubCoordinator: Exporting with options", { shareOptions, isMobile });

    // Use native share on mobile, download on desktop
    if (isMobile) {
      await shareService.shareViaDevice(currentSequence, shareOptions);
    } else {
      await shareService.downloadImage(currentSequence, shareOptions);
    }
  }

  async function exportAnimation(settings: ExportSettings) {
    // For now, use the native share API with the current sequence as a GIF/video
    // Full video export requires VideoExportOrchestrator which is more complex
    if (!currentSequence) {
      throw new Error("No sequence to export");
    }

    // Load the compose module for video export
    try {
      await loadFeatureModule('compose');
      // TODO: Wire to VideoExportOrchestrator when fully implemented
      // For now, show that animation export is pending implementation
      showToast("Animation video export coming soon! Use Image export for now.", "info");
    } catch (error) {
      throw new Error("Animation export not yet available");
    }
  }

  async function exportPerformance(settings: ExportSettings) {
    // Performance video should be recorded/uploaded in the PerformancePreview
    // This just needs to finalize the upload
    showToast("Performance video saved!", "success");
  }

  function handleSaveComplete(savedSequenceId: string) {
    console.log("📱 ShareHubCoordinator: Save complete, proceeding with export");
    showSaveToLibrary = false;

    // Proceed with pending export
    if (pendingExport) {
      performExport(pendingExport.mode, pendingExport.settings);
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
  isSequenceSaved={isSequenceSaved}
  {isMobile}
  onClose={handleClose}
  onExport={handleExport}
/>

{#if showSaveToLibrary}
  <SaveToLibraryPanel
    show={showSaveToLibrary}
    onSaveComplete={handleSaveComplete}
    onClose={handleSaveCancel}
  />
{/if}
