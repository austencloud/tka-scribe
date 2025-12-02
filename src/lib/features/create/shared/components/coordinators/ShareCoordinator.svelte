<script lang="ts">
  /**
   * Share Coordinator Component
   *
   * Manages share panel state and background preview generation.
   * Extracts share panel logic from CreateModule.svelte for better separation of concerns.
   *
   * Domain: Create module - Share Panel Coordination
   */

import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { createComponentLogger } from "$lib/shared/utils/debug-logger";
  import ShareDrawer, { type ViewMode } from "$lib/shared/share/components/ShareDrawer.svelte";
  import { createShareState } from "$lib/shared/share/state/share-state.svelte";
  import { getCreateModuleContext } from "../../context/create-module-context";
  import type { IURLSyncService } from "$lib/shared/navigation/services/contracts/IURLSyncService";
  import type { ILetterDeriverService } from "$lib/shared/navigation/services/contracts/ILetterDeriverService";
  import type { IDeepLinkService } from "$lib/shared/navigation/services/contracts/IDeepLinkService";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  const logger = createComponentLogger("ShareCoordinator");

  // Get context
  const ctx = getCreateModuleContext();
  const { CreateModuleState, panelState, services } = ctx;
  const shareService = services.shareService;

  // Services
  let urlSyncService: IURLSyncService | null = $state(null);
  let letterDeriverService: ILetterDeriverService | null = $state(null);
  let deepLinkService: IDeepLinkService | null = $state(null);

  // Track if deep link has been processed
  let deepLinkProcessed = $state(false);

  // Track view mode state
  let viewMode = $state<ViewMode>("main");

  // Debounce timer for preview generation (prevent rapid HMR-triggered regenerations)
  let previewDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  // Share state for background preview pre-rendering
  let backgroundShareState = $state<ReturnType<typeof createShareState> | null>(
    null
  );

  // Initialize background share state
  $effect(() => {
    if (shareService && !backgroundShareState) {
      backgroundShareState = createShareState(shareService);
    }
  });

  // Effect: Render share preview when sequence or options change
  // Renders both when panel is closed (pre-render) AND when panel is open (live updates)
  // Cache hits are INSTANT, only cache misses are debounced
  $effect(() => {
    if (!backgroundShareState) return;
    if (!CreateModuleState.sequenceState.currentSequence) return;

    const sequence = CreateModuleState.sequenceState.currentSequence;
    // Track options as dependency so effect re-runs when user changes share settings
    const options = backgroundShareState.options;
    // Track panel open state for logging purposes
    const isPanelOpen = panelState.isSharePanelOpen;

    // Clear any pending debounce timer
    if (previewDebounceTimer) {
      clearTimeout(previewDebounceTimer);
      previewDebounceTimer = null;
    }

    // Skip if sequence has no beats
    if (!sequence.beats || sequence.beats.length === 0) {
      return;
    }

    // INSTANT: Try cache first - if hit, preview updates immediately with no delay
    if (backgroundShareState.tryLoadFromCache(sequence)) {
      logger.log("⚡ Instant cache hit for share preview");
      return; // Cache hit - no need to generate
    }

    // DEBOUNCED: Cache miss - generate new preview with debounce
    // This prevents rapid HMR-triggered regenerations that can cause arrow positioning issues
    const debounceMs = isPanelOpen ? 300 : 1000; // Shorter debounce when panel is open

    previewDebounceTimer = setTimeout(() => {
      logger.log(
        isPanelOpen
          ? "🎨 Generating preview for open share panel"
          : "🎨 Pre-rendering preview in background"
      );

      // Non-blocking generation - don't await
      // renderPictographToSVG now properly waits for async arrow/prop calculations
      backgroundShareState?.generatePreview(sequence).catch((error) => {
        // Silent failure - preview will generate when user opens share panel
        logger.log(
          isPanelOpen
            ? "Live preview update failed:"
            : "Background preview pre-rendering skipped:",
          error
        );
      });

      previewDebounceTimer = null;
    }, debounceMs);
  });

  // Effect: Sync URL when share panel is open for easy HMR and sharing
  $effect(() => {
    // Only sync URL if we're in the create module, share panel is open, and service is available
    if (!urlSyncService) return;
    const currentModule = navigationState.currentModule;
    if (currentModule !== "create") return;

    const isPanelOpen = panelState.isSharePanelOpen;
    const currentSequence = CreateModuleState.sequenceState.currentSequence;

    // When panel is open, sync the sequence to URL with "share" module identifier
    if (isPanelOpen && currentSequence) {
      urlSyncService.syncURLWithSequence(currentSequence, "share", {
        debounce: 500,
        allowClear: deepLinkProcessed,
      });
    } else if (!isPanelOpen && deepLinkProcessed) {
      // Clear URL when panel closes (only after deep link is processed)
      urlSyncService.syncURLWithSequence(null, "share", {
        allowClear: true,
      });
    }
  });

  // Effect: Sync view mode to URL
  $effect(() => {
    if (!browser) return;

    const isPanelOpen = panelState.isSharePanelOpen;
    const currentViewMode = viewMode;

    // Only sync view mode when panel is open
    if (isPanelOpen && deepLinkProcessed) {
      const url = new URL(window.location.href);

      if (currentViewMode === "preview") {
        url.searchParams.set("view", "preview");
      } else {
        url.searchParams.delete("view");
      }

      // Only update if URL changed
      if (window.location.href !== url.toString()) {
        window.history.replaceState({}, "", url.toString());
      }
    }
  });

  // Event handler
  function handleClose() {
    panelState.closeSharePanel();
    // Reset view mode when closing
    viewMode = "main";
  }

  // Handle sequence update (for Instagram link)
  function handleSequenceUpdate(updatedSequence: any) {
    CreateModuleState.sequenceState.setCurrentSequence(updatedSequence);
  }

  // Initialize and check for deep link on mount
  onMount(() => {
    logger.log("✅ ShareCoordinator: Mounted");

    // Resolve services
    try {
      urlSyncService = resolve<IURLSyncService>(TYPES.IURLSyncService);
      letterDeriverService = resolve<ILetterDeriverService>(TYPES.ILetterDeriverService);
      deepLinkService = resolve<IDeepLinkService>(TYPES.IDeepLinkService);
    } catch (error) {
      logger.log("⚠️ Failed to resolve navigation services:", error);
    }

    // Step 1: Check for view mode in URL FIRST
    let restoredViewMode: ViewMode = "main";
    if (browser) {
      const params = new URLSearchParams(window.location.search);
      const urlViewMode = params.get("view");
      if (urlViewMode === "preview") {
        restoredViewMode = "preview";
        logger.log("🔗 Will restore view mode from URL: preview");
      }
    }

    // Step 2: Check for deep link sequence (shareable URL with ?open=share:...)
    const deepLinkData = deepLinkService?.consumeData("share");
    if (deepLinkData) {
      try {
        logger.log("🔗 Loading sequence from share deep link");
        logger.log("📊 Sequence data:", {
          hasStartingPositionBeat: !!deepLinkData.sequence.startingPositionBeat,
          hasStartPosition: !!deepLinkData.sequence.startPosition,
          beatsLength: deepLinkData.sequence.beats?.length,
        });

        // Load the sequence immediately (letters will be filled in later)
        CreateModuleState.sequenceState.setCurrentSequence(deepLinkData.sequence);

        // Derive letters from motion data (async but non-blocking)
        // This happens in the background after the pictograph module loads
        if (letterDeriverService) {
          letterDeriverService.deriveLettersForSequence(deepLinkData.sequence)
            .then((sequenceWithLetters) => {
              // Create a fresh sequence object with a new timestamp to ensure reactivity
              const updatedSequence = {
                ...sequenceWithLetters,
                // Add a timestamp to ensure this is seen as a new object
                _updatedAt: Date.now(),
              };
              CreateModuleState?.sequenceState.setCurrentSequence(updatedSequence);
              logger.log("✅ Letters derived and sequence updated");
            })
            .catch((err) => {
              logger.log("⚠️ Letter derivation failed:", err);
              // Still load the sequence even if letter derivation fails
            });
        } else {
          logger.log("⚠️ LetterDeriverService not available");
        }

        // IMPORTANT: Set view mode BEFORE opening the panel
        // This ensures SharePanel mounts with the correct view mode already set
        viewMode = restoredViewMode;
        logger.log(`📱 View mode set to: ${viewMode}`);

        // Open the share panel automatically
        panelState.openSharePanel();

        logger.log(
          "✅ Loaded sequence from share deep link and opened share panel:",
          deepLinkData.sequence.word || deepLinkData.sequence.id
        );
      } catch (err) {
        logger.error("❌ Failed to load share deep link sequence:", err);
      }
    }

    // Mark deep link as processed (allow URL syncing/clearing now)
    deepLinkProcessed = true;

    // Cleanup function - clear debounce timer on unmount
    return () => {
      if (previewDebounceTimer) {
        clearTimeout(previewDebounceTimer);
        previewDebounceTimer = null;
      }
    };
  });
</script>

<ShareDrawer
  show={panelState.isSharePanelOpen}
  sequence={CreateModuleState.sequenceState.currentSequence}
  shareState={backgroundShareState}
  bind:viewMode
  combinedPanelHeight={panelState.combinedPanelHeight}
  onClose={handleClose}
  onSequenceUpdate={handleSequenceUpdate}
/>
