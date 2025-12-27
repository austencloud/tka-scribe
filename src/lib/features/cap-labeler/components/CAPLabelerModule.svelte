<!--
  CAP Labeler Module

  Main orchestrator component that replaces the monolithic +page.svelte.
  Manages state, coordinates mode-specific behavior, and composes all panels.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import {
    ensureContainerInitialized,
    loadFeatureModule,
    tryResolve,
  } from "$lib/shared/inversify/di";
  import { CAPLabelerTypes } from "$lib/shared/inversify/types/cap-labeler.types";
  import type { IBeatDataConverter } from "../services/contracts/IBeatDataConverter";
  import type { ICAPDetector, CAPDetectionResult } from "../services/contracts/ICAPDetector";
  import { capLabelerState } from "../state/cap-labeler-state.svelte";
  import { createSectionModeState } from "../state/section-mode-state.svelte";
  import { createBeatPairModeState } from "../state/beatpair-mode-state.svelte";
  import { createWholeModeState } from "../state/whole-mode-state.svelte";
  import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
  import type { StartPositionData } from "$lib/features/create/shared/domain/models/StartPositionData";
  import type { FilterMode } from "../domain/models/label-models";

  // Import all panel components
  import CAPLabelerHeader from "./shared/CAPLabelerHeader.svelte";
  import SequencePreviewPanel from "./panels/SequencePreviewPanel.svelte";
  import DesignationsPanel from "./panels/DesignationsPanel.svelte";
  import ComponentSelectionPanel from "./panels/ComponentSelectionPanel.svelte";
  import SectionModePanel from "./panels/SectionModePanel.svelte";
  import BeatPairModePanel from "./panels/BeatPairModePanel.svelte";
  import WholeModePanel from "./panels/WholeModePanel.svelte";
  import NotesInput from "./shared/NotesInput.svelte";
  import SequenceBrowserDrawer from "./shared/SequenceBrowserDrawer.svelte";
  import SequenceBrowserSidebar from "./shared/SequenceBrowserSidebar.svelte";

  // Lifecycle
  let isReady = $state(false);
  let copiedToast = $state(false);
  let showBrowserDrawer = $state(false);
  let showManualBuilder = $state(false); // Hide manual designation tools behind toggle

  // Store service references after loading (to avoid resolving in $derived)
  let detectionService = $state<ICAPDetector | null>(null);
  let conversionService = $state<IBeatDataConverter | null>(null);

  // Create mode-specific state managers (after module loads)
  let sectionState = $state<ReturnType<typeof createSectionModeState>>();
  let beatPairState = $state<ReturnType<typeof createBeatPairModeState>>();
  let wholeState = $state<ReturnType<typeof createWholeModeState>>();

  onMount(() => {
    // Load CAP labeler DI module and initialize
    (async () => {
      // Check if state already has data (from HMR or previous session)
      const hasExistingData = capLabelerState.hasData;

      await ensureContainerInitialized();
      await loadFeatureModule("cap-labeler");

      // Store reference to detection service AFTER module is loaded
      let resolvedService: ICAPDetector | null = null;
      try {
        resolvedService = tryResolve<ICAPDetector>(
          CAPLabelerTypes.ICAPLabelerDetectionService
        );
      } catch (err) {
        // Silent - will try direct import
      }

      // If tryResolve failed, log error - CAPDetector has too many dependencies for manual instantiation
      if (!resolvedService) {
        console.error("[CAPLabelerModule] Failed to resolve CAPDetector from DI container. Detection features will be unavailable.");
      }

      detectionService = resolvedService;

      // Also cache the conversion service for beat parsing
      conversionService = tryResolve<IBeatDataConverter>(
        CAPLabelerTypes.IBeatDataConverter
      );

      // Pre-cache all services to ensure they're available for subsequent operations
      capLabelerState.cacheServices();

      // Create mode states AFTER services are registered
      sectionState = createSectionModeState();
      beatPairState = createBeatPairModeState();
      wholeState = createWholeModeState();

      // Only run full initialization if we don't have existing data
      // This prevents re-loading when HMR preserves state
      if (!hasExistingData) {
        await capLabelerState.initialize();
      } else {
        // Just ensure loading is false since we have data
        capLabelerState.setLoading(false);
      }

      isReady = true;
    })();

    // Return cleanup function
    return () => {
      capLabelerState.dispose();
    };
  });

  // Derived state from main state
  // Guard service-dependent getters with isReady to prevent early access
  const filteredSequences = $derived(isReady ? capLabelerState.filteredSequences : []);
  const currentSequence = $derived(isReady ? capLabelerState.currentSequence : null);
  const currentLabel = $derived(isReady ? capLabelerState.currentLabel : null);

  // Detection cache - use a plain object to avoid reactivity issues
  // We use WeakMap-like pattern with sequence ID as key
  const detectionCacheRef: { current: Map<string, CAPDetectionResult> } = { current: new Map() };

  // Compute detection using stored service reference
  const currentComputedDetection = $derived.by(() => {
    const seq = currentSequence;

    if (!isReady || !seq || !detectionService) {
      return null;
    }

    // Check cache first (using ref to avoid state mutation in derived)
    const cacheKey = seq.id;
    const cached = detectionCacheRef.current.get(cacheKey);
    if (cached) {
      return cached;
    }

    const detection = detectionService.detectCAP(seq);

    // Cache the result (mutating ref, not reactive state)
    detectionCacheRef.current.set(cacheKey, detection);

    return detection;
  });
  const stats = $derived(isReady ? capLabelerState.stats : { total: 0, needsVerification: 0, verified: 0 });
  const filterMode = $derived(capLabelerState.filterMode);
  const labelingMode = $derived(capLabelerState.labelingMode);
  const showExport = $derived(capLabelerState.showExport);
  const syncStatus = $derived(capLabelerState.syncStatus);
  const notes = $derived(capLabelerState.notes);
  const showStartPosition = $derived(capLabelerState.showStartPosition);
  const manualColumnCount = $derived(capLabelerState.manualColumnCount);
  const loading = $derived(capLabelerState.loading);

  // Computed: whether current sequence is verified (from Firebase metadata)
  const isVerified = $derived(!currentLabel?.needsVerification && currentLabel !== null);

  // Edit mode - defaults to false for verified sequences, true for unverified
  let isEditMode = $state(false);

  // Reset edit mode when sequence changes
  $effect(() => {
    // When sequence changes, exit edit mode (will show view-only for verified)
    if (currentSequence) {
      isEditMode = false;
    }
  });

  // Parse beats for current sequence (uses cached conversionService)
  const parsedData = $derived.by(() => {
    if (!currentSequence?.fullMetadata?.sequence) {
      return { beats: [], startPosition: null };
    }

    // Use the cached conversion service instead of resolving each time
    if (!conversionService) {
      console.warn(
        "[CAPLabelerModule] BeatDataConverter not available (not cached)"
      );
      return { beats: [], startPosition: null };
    }

    const gridMode =
      conversionService.getAuthoritativeGridMode(currentSequence);
    return conversionService.convertRawToBeats(
      currentSequence.word,
      currentSequence.fullMetadata.sequence,
      gridMode
    );
  });

  const parsedBeats = $derived(parsedData.beats);
  const startPosition = $derived(parsedData.startPosition);

  // Load saved sections/beatpairs when sequence changes AND clear current selection
  $effect(() => {
    if (!sectionState || !beatPairState || !wholeState) return;

    // Clear all mode selections when sequence changes
    sectionState.actions.clearSelection();
    beatPairState.actions.clearSelection();
    wholeState.actions.clearSelection();

    // Load saved data for this sequence
    if (currentLabel) {
      sectionState.actions.loadSavedSections(currentLabel);
      beatPairState.actions.loadSavedBeatPairs(currentLabel);
    } else {
      sectionState.actions.loadSavedSections(null);
      beatPairState.actions.loadSavedBeatPairs(null);
    }
  });

  // Highlighted beats for BeatGrid visualization (section + beatpair modes)
  const highlightedBeats = $derived.by(() => {
    if (!sectionState || !beatPairState) return undefined;

    const map = new Map<number, { bg: string; border: string }>();

    if (labelingMode === "section") {
      // Show saved sections with unique colors
      const SECTION_COLORS = [
        { bg: "rgba(59, 130, 246, 0.35)", border: "rgba(59, 130, 246, 0.8)" },
        { bg: "rgba(168, 85, 247, 0.35)", border: "rgba(168, 85, 247, 0.8)" },
        { bg: "rgba(34, 197, 94, 0.35)", border: "rgba(34, 197, 94, 0.8)" },
        { bg: "rgba(249, 115, 22, 0.35)", border: "rgba(249, 115, 22, 0.8)" },
        { bg: "rgba(236, 72, 153, 0.35)", border: "rgba(236, 72, 153, 0.8)" },
        { bg: "rgba(20, 184, 166, 0.35)", border: "rgba(20, 184, 166, 0.8)" },
      ];

      sectionState.savedSections.forEach((section, idx) => {
        const color = SECTION_COLORS[idx % SECTION_COLORS.length]!;
        section.beats.forEach((beatNum) => {
          map.set(beatNum, { bg: color.bg, border: color.border });
        });
      });

      // Currently selected beats (bright yellow/gold)
      const selectionColor = {
        bg: "rgba(251, 191, 36, 0.35)",
        border: "rgba(251, 191, 36, 0.9)",
      };
      sectionState.selectedBeats.forEach((beatNum) => {
        map.set(beatNum, selectionColor);
      });
    }

    if (labelingMode === "beatpair") {
      // First beat (green)
      if (beatPairState.firstBeat !== null) {
        map.set(beatPairState.firstBeat, {
          bg: "rgba(34, 197, 94, 0.35)",
          border: "rgba(34, 197, 94, 0.9)",
        });
      }
      // Second beat (purple)
      if (beatPairState.secondBeat !== null) {
        map.set(beatPairState.secondBeat, {
          bg: "rgba(168, 85, 247, 0.35)",
          border: "rgba(168, 85, 247, 0.9)",
        });
      }
    }

    return map.size > 0 ? map : undefined;
  });

  // Derived CAP type from selected components (for whole/section modes)
  const derivedCapType = $derived.by(() => {
    if (!sectionState || !wholeState) return null;

    const components =
      labelingMode === "section"
        ? sectionState.selectedComponents
        : labelingMode === "whole"
          ? wholeState.selectedComponents
          : new Set();

    if (components.size === 0) return null;

    const sorted = Array.from(components).sort().join("_");

    // Component mapping (simplified - real mapping in CAPDesignator)
    const mapping: Record<string, string> = {
      rotated: "STRICT_ROTATED",
      mirrored: "STRICT_MIRRORED",
      flipped: "strict_flipped",
      swapped: "STRICT_SWAPPED",
      inverted: "STRICT_INVERTED",
      inverted_swapped: "SWAPPED_INVERTED",
      inverted_rotated: "ROTATED_INVERTED",
      mirrored_swapped: "MIRRORED_SWAPPED",
      flipped_swapped: "flipped_swapped",
      inverted_mirrored: "MIRRORED_INVERTED",
      flipped_inverted: "flipped_inverted",
      rotated_swapped: "ROTATED_SWAPPED",
      mirrored_rotated: "MIRRORED_ROTATED",
      flipped_rotated: "flipped_rotated",
    };

    return mapping[sorted] ?? `custom_${sorted}`;
  });

  // ============================================================
  // EVENT HANDLERS
  // ============================================================

  function handleFilterChange(mode: FilterMode) {
    capLabelerState.setFilterMode(mode);
  }

  function handleBeatClick(beatNumber: number) {
    if (labelingMode === "section" && sectionState) {
      sectionState.actions.selectBeat(beatNumber, sectionState.isShiftHeld);
    } else if (labelingMode === "beatpair" && beatPairState) {
      beatPairState.actions.selectBeat(beatNumber);
    }
  }

  async function handleAddSection() {
    if (!currentSequence || !sectionState) return;
    await sectionState.actions.addSection(
      currentSequence.word,
      notes,
      derivedCapType
    );
  }

  async function handleRemoveSection(index: number) {
    if (!currentSequence || !sectionState) return;
    await sectionState.actions.removeSection(
      currentSequence.word,
      index,
      notes
    );
  }

  function handleRemoveBeatPair(index: number) {
    if (!beatPairState) return;
    beatPairState.actions.removeBeatPair(index);
  }

  async function handleAddDesignation() {
    if (!wholeState) return;
    wholeState.actions.addDesignation(derivedCapType);
  }

  function handleRemoveDesignation(index: number) {
    if (!wholeState) return;
    wholeState.actions.removeDesignation(index);
  }

  async function handleSaveAndNext() {
    if (!currentSequence) return;

    // If detection found a modular pattern, save it directly
    if (currentComputedDetection?.isModular) {
      const updatedLabel = {
        word: currentSequence.word,
        designations: [],
        isFreeform: false,
        isModular: true,
        needsVerification: false,
        labeledAt: new Date().toISOString(),
        notes: notes || "",
        sections: currentLabel?.sections || [],
        beatPairs: currentLabel?.beatPairs || [],
        beatPairGroups: currentComputedDetection.beatPairGroups,
      };
      await capLabelerState.saveLabel(updatedLabel);
      capLabelerState.nextSequence();
      return;
    }

    // Otherwise use the whole state labeling flow
    if (!wholeState) return;
    await wholeState.actions.labelSequence(
      currentSequence.word,
      notes,
      derivedCapType
    );
    capLabelerState.nextSequence();
  }

  async function handleMarkUnknown() {
    if (!currentSequence) return;

    // Mark sequence as unknown (needs more investigation)
    const updatedLabel = {
      word: currentSequence.word,
      designations: [],
      isFreeform: false,
      isModular: false,
      isUnknown: true,
      needsVerification: true, // Keep in review queue
      labeledAt: new Date().toISOString(),
      notes: notes || "Marked as unknown - needs further investigation",
      sections: currentLabel?.sections || [],
      beatPairs: currentLabel?.beatPairs || [],
    };

    await capLabelerState.saveLabel(updatedLabel);
    capLabelerState.nextSequence();
  }

  function handleCopyJson() {
    if (!currentSequence) return;

    // Include detection results with sequence data
    const exportData = {
      ...currentSequence,
      _detection: currentComputedDetection ? {
        capType: currentComputedDetection.capType,
        isCircular: currentComputedDetection.isCircular,
        isFreeform: currentComputedDetection.isFreeform,
        isModular: currentComputedDetection.isModular,
        candidateDesignations: currentComputedDetection.candidateDesignations,
        beatPairs: currentComputedDetection.beatPairs,
        beatPairGroups: currentComputedDetection.beatPairGroups,
      } : null,
    };

    const json = JSON.stringify(exportData, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      copiedToast = true;
      setTimeout(() => {
        copiedToast = false;
      }, 2000);
    });
  }

  async function handleDeleteLabel() {
    if (!currentSequence) return;
    await capLabelerState.deleteLabel(currentSequence.word);
  }

  async function handleDeleteSequence() {
    if (!currentSequence) return;
    const result = await capLabelerState.deleteSequenceFromDatabase(
      currentSequence.id,
      currentSequence.word
    );
    if (!result.success) {
      console.error("Failed to delete sequence:", result.error);
    }
  }

  /**
   * Verify the computed designations for this sequence
   * With on-the-fly detection, this just marks as "verified" - no need to store designations
   */
  async function handleVerify() {
    if (!currentSequence) return;

    // Create or update the label with verified status
    const updatedLabel = {
      word: currentSequence.word,
      // Don't store designations - they're computed on-the-fly
      designations: [],
      isFreeform: currentComputedDetection?.isFreeform ?? false,
      isModular: currentComputedDetection?.isModular ?? false,
      needsVerification: false, // Mark as verified
      labeledAt: new Date().toISOString(),
      notes: currentLabel?.notes || "",
      // Preserve any manual section/beatpair annotations
      sections: currentLabel?.sections || [],
      beatPairs: currentLabel?.beatPairs || [],
    };

    await capLabelerState.saveLabel(updatedLabel);
    // NOTE: Do NOT call nextSequence() here!
    // When in "Needs Review" filter, the verified item is removed from the list,
    // so the selection naturally moves to the next item.
  }

  /**
   * Legacy handler for backward compatibility
   * @deprecated Use handleVerify instead
   */
  async function handleConfirmAutoLabel() {
    await handleVerify();
  }

  /**
   * Legacy handler - now just verifies the sequence
   * @deprecated Use handleVerify instead
   */
  async function handleConfirmAllCandidates() {
    await handleVerify();
  }

  /**
   * Individual candidate confirmation is no longer needed with on-the-fly detection
   * Kept for interface compatibility but just verifies the whole thing
   */
  function handleConfirmCandidate(_index: number) {
    // No-op - individual confirmations not needed with computed designations
    console.log("[CAPLabeler] Individual candidate confirmation deprecated - use Verify button");
  }

  /**
   * Deny a candidate designation - marks the sequence as freeform
   */
  async function handleDenyCandidate(_index: number) {
    // Denying a candidate means "this detection is wrong" - mark as freeform
    await handleSetFreeform();
  }

  /**
   * Mark sequence as freeform (no recognizable pattern)
   */
  async function handleSetFreeform() {
    if (!currentSequence) return;

    const updatedLabel = {
      word: currentSequence.word,
      designations: [],
      isFreeform: true,
      isModular: false,
      needsVerification: false,
      labeledAt: new Date().toISOString(),
      notes: notes || "",
      sections: currentLabel?.sections || [],
      beatPairs: currentLabel?.beatPairs || [],
    };

    await capLabelerState.saveLabel(updatedLabel);
  }

  // Keyboard event handling (shift key for section selection)
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Shift" && labelingMode === "section" && sectionState) {
      sectionState.actions.setShiftHeld(true);
    }
  }

  function handleKeyUp(event: KeyboardEvent) {
    if (event.key === "Shift" && labelingMode === "section" && sectionState) {
      sectionState.actions.setShiftHeld(false);
    }
  }
</script>

<svelte:window onkeydown={handleKeyDown} onkeyup={handleKeyUp} />

{#if !isReady || loading}
  <div class="loading">
    <div class="spinner"></div>
    <p>Loading CAP Labeler...</p>
  </div>
{:else if filteredSequences.length === 0}
  <div class="empty-state">
    <p>No sequences to label with current filters.</p>
    <button onclick={() => handleFilterChange("all")}>
      Show All Sequences
    </button>
  </div>
{:else}
  <div class="cap-labeler-module">
    <div class="layout-container">
      <!-- Left sidebar - visible on wide screens only -->
      <SequenceBrowserSidebar
        sequences={capLabelerState.circularSequences}
        labels={capLabelerState.labels}
        currentSequenceId={currentSequence?.id ?? null}
        {filterMode}
        onSelectSequence={(id) => capLabelerState.jumpToSequence(id)}
        onFilterChange={handleFilterChange}
      />

      <!-- Main content area -->
      <div class="main-area">
        <CAPLabelerHeader
          {stats}
          {filterMode}
          onFilterChange={handleFilterChange}
          onExportToggle={() => capLabelerState.setShowExport(!showExport)}
          onExportLabels={() => capLabelerState.exportLabels()}
          onImportFile={(file) => capLabelerState.importLabels(file)}
          onSyncLocalStorage={() => capLabelerState.syncLocalStorageToFirebase()}
          {showExport}
          {syncStatus}
          sequences={capLabelerState.circularSequences}
          onJumpToSequence={(id) => capLabelerState.jumpToSequence(id)}
          onOpenBrowser={() => (showBrowserDrawer = true)}
        />

        <SequenceBrowserDrawer
          isOpen={showBrowserDrawer}
          sequences={capLabelerState.circularSequences}
          labels={capLabelerState.labels}
          currentSequenceId={currentSequence?.id ?? null}
          onClose={() => (showBrowserDrawer = false)}
          onSelectSequence={(id) => capLabelerState.jumpToSequence(id)}
        />

        <div class="main-content">
      <!-- Left panel: Sequence preview and beat grid -->
      <SequencePreviewPanel
        sequence={currentSequence}
        {parsedBeats}
        {startPosition}
        currentLabel={currentLabel}
        computedDetection={currentComputedDetection}
        {showStartPosition}
        {manualColumnCount}
        onShowStartPositionChange={(val) =>
          capLabelerState.setShowStartPosition(val)}
        onColumnCountChange={(val) => capLabelerState.setManualColumnCount(val)}
        onBeatClick={handleBeatClick}
        {highlightedBeats}
        {labelingMode}
        onCopyJson={handleCopyJson}
        {copiedToast}
        onDeleteLabel={handleDeleteLabel}
      />

      <!-- Right panel: Controls and labeling UI -->
      <div class="labeling-panel">
        <!-- Unified Designations Panel (above mode tabs) -->
        <DesignationsPanel
          wholeDesignations={wholeState?.pendingDesignations ?? []}
          sectionDesignations={sectionState?.savedSections ?? []}
          beatPairDesignations={beatPairState?.savedBeatPairs ?? []}
          isFreeform={
            // Freeform should be false if polyrhythmic is detected - polyrhythmic IS a pattern
            (currentComputedDetection?.isPolyrhythmic ?? false)
              ? false
              : (currentComputedDetection?.isFreeform ?? false)
          }
          isModular={currentComputedDetection?.isModular ?? false}
          isPolyrhythmic={currentComputedDetection?.isPolyrhythmic ?? false}
          polyrhythmic={currentComputedDetection?.polyrhythmic ?? null}
          compoundPattern={currentComputedDetection?.compoundPattern ?? null}
          isAxisAlternating={currentComputedDetection?.isAxisAlternating ?? false}
          axisAlternatingPattern={currentComputedDetection?.axisAlternatingPattern ?? null}
          needsVerification={!isVerified}
          autoDetectedDesignations={[]}
          candidateDesignations={currentComputedDetection?.candidateDesignations ?? []}
          autoDetectedBeatPairs={currentComputedDetection?.beatPairs ?? []}
          autoDetectedBeatPairGroups={currentComputedDetection?.beatPairGroups ?? {}}
          onRemoveWholeDesignation={handleRemoveDesignation}
          onRemoveSectionDesignation={handleRemoveSection}
          onRemoveBeatPairDesignation={handleRemoveBeatPair}
          onSetFreeform={handleSetFreeform}
          onMarkUnknown={handleMarkUnknown}
          onSaveAndNext={handleSaveAndNext}
          onConfirmAutoLabel={handleVerify}
          onConfirmCandidate={handleConfirmCandidate}
          onDenyCandidate={handleDenyCandidate}
          onConfirmAllCandidates={handleVerify}
          onDeleteSequence={handleDeleteSequence}
          canSave={(wholeState?.pendingDesignations.length ?? 0) > 0 ||
            (sectionState?.savedSections.length ?? 0) > 0 ||
            (beatPairState?.savedBeatPairs.length ?? 0) > 0 ||
            (wholeState?.isFreeform ?? false) ||
            (currentComputedDetection?.isModular ?? false) ||
            (currentComputedDetection?.isPolyrhythmic ?? false)}
          sequenceWord={currentSequence?.word ?? ""}
        />

        <!-- Manual designation builder - hidden behind toggle -->
        {#if !isVerified || isEditMode}
          {#if showManualBuilder}
            <div class="manual-builder-section">
              <button
                class="collapse-builder-btn"
                onclick={() => (showManualBuilder = false)}
              >
                <span>Hide Manual Builder</span>
                <span class="chevron">▲</span>
              </button>

              <!-- Mode Toggle -->
              <ComponentSelectionPanel
                {labelingMode}
                onLabelingModeChange={(mode) => capLabelerState.setLabelingMode(mode)}
              />

              <!-- Mode-specific builder panels -->
              {#if labelingMode === "section" && sectionState}
                <SectionModePanel
                  selectedBeats={sectionState.selectedBeats}
                  selectedComponents={sectionState.selectedComponents}
                  savedSections={sectionState.savedSections}
                  selectedBaseWord={sectionState.selectedBaseWord}
                  onBaseWordChange={(bw) => sectionState!.actions.setBaseWord(bw)}
                  onAddSection={handleAddSection}
                  onRemoveSection={handleRemoveSection}
                  onMarkUnknown={handleMarkUnknown}
                  onNext={() => capLabelerState.nextSequence()}
                  canProceed={sectionState.selectedBeats.size === 0 &&
                    sectionState.selectedComponents.size === 0}
                />
              {:else if labelingMode === "beatpair" && beatPairState}
                <BeatPairModePanel
                  firstBeat={beatPairState.firstBeat}
                  secondBeat={beatPairState.secondBeat}
                  selectedComponents={beatPairState.selectedComponents}
                  transformationIntervals={beatPairState.transformationIntervals}
                  onClearSelection={() => beatPairState!.actions.clearSelection()}
                  onToggleComponent={(c) => beatPairState!.actions.toggleComponent(c)}
                  onSetInterval={(key, val) =>
                    beatPairState!.actions.setTransformationInterval(key, val)}
                  onAddBeatPair={() => beatPairState!.actions.addBeatPair()}
                />
              {:else if labelingMode === "whole" && wholeState}
                <WholeModePanel
                  selectedComponents={wholeState.selectedComponents}
                  transformationIntervals={wholeState.transformationIntervals}
                  onToggleComponent={(c) => wholeState!.actions.toggleComponent(c)}
                  onSetInterval={(key, val) =>
                    wholeState!.actions.setTransformationInterval(key, val)}
                  onAddDesignation={handleAddDesignation}
                />
              {/if}
            </div>
          {:else}
            <button
              class="show-builder-btn"
              onclick={() => (showManualBuilder = true)}
            >
              <span>+ Add Manual Designation</span>
              <span class="chevron">▼</span>
            </button>
          {/if}
        {:else}
          <!-- View-only mode for verified sequences -->
          <div class="view-only-notice">
            <span class="verified-badge">Verified</span>
            <button class="edit-button" onclick={() => (isEditMode = true)}>
              Edit Label
            </button>
          </div>
        {/if}

        <NotesInput
          value={notes}
          onInput={(val) => capLabelerState.setNotes(val)}
          placeholder="Optional notes about this sequence..."
        />
      </div>
    </div>

        <!-- Navigation -->
        <div class="navigation">
          <button
            onclick={() => capLabelerState.previousSequence()}
            disabled={capLabelerState.currentIndex === 0}
          >
            Previous
          </button>
          <button onclick={() => capLabelerState.skipSequence()}> Skip </button>
          <span class="position">
            {capLabelerState.currentIndex + 1} / {filteredSequences.length}
          </span>
        </div>
      </div>
      <!-- End main-area -->
    </div>
    <!-- End layout-container -->
  </div>
  <!-- End cap-labeler-module -->
{/if}

<style>
  .cap-labeler-module {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--background);
    color: var(--foreground);
    overflow: hidden;
  }

  .layout-container {
    display: grid;
    grid-template-columns: 1fr 3fr;
    flex: 1;
    overflow: hidden;
    width: 100%;
  }

  /* Hide sidebar on narrow screens */
  @media (max-width: 1200px) {
    .layout-container {
      grid-template-columns: 1fr;
    }

    .layout-container > :first-child {
      display: none;
    }
  }

  .main-area {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: 100%;
  }

  .loading,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-lg);
    height: 100vh;
    font-size: var(--font-size-lg);
    color: var(--muted);
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .empty-state button {
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--gradient-primary);
    color: var(--foreground);
    border: none;
    border-radius: 8px;
    font-size: var(--font-size-sm);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-fast);
    min-height: var(--min-touch-target);
  }

  .empty-state button:hover {
    transform: translateY(var(--hover-lift-sm));
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }

  .main-content {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: var(--spacing-lg);
    padding: 0 var(--spacing-lg) var(--spacing-lg) var(--spacing-lg);
    flex: 1;
    overflow: hidden;
  }

  .labeling-panel {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    overflow-y: auto;
    padding-right: var(--spacing-xs);
  }

  .labeling-panel::-webkit-scrollbar {
    width: 6px;
  }

  .labeling-panel::-webkit-scrollbar-track {
    background: transparent;
  }

  .labeling-panel::-webkit-scrollbar-thumb {
    background: var(--theme-stroke, rgba(255, 255, 255, 0.15));
    border-radius: 3px;
  }

  .labeling-panel::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  .navigation {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
    border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    background: var(--surface-glass);
  }

  .navigation button {
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--surface-color);
    color: var(--foreground);
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 8px;
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: var(--transition-fast);
    min-height: var(--min-touch-target);
  }

  .navigation button:hover:not(:disabled) {
    background: var(--surface-hover);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .navigation button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .position {
    margin-left: auto;
    font-size: var(--font-size-sm);
    color: var(--muted);
  }

  @media (max-width: 1024px) {
    .main-content {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
    }

    .labeling-panel {
      max-height: 400px;
    }
  }

  /* View-only mode for verified sequences */
  .view-only-notice {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md);
    background: var(--surface-dark, rgba(0, 0, 0, 0.3));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
  }

  .verified-badge {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: rgba(34, 197, 94, 0.15);
    border: 1px solid rgba(34, 197, 94, 0.4);
    border-radius: 8px;
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: #22c55e;
  }

  .edit-button {
    padding: var(--spacing-xs) var(--spacing-md);
    background: transparent;
    color: var(--muted-foreground);
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.15));
    border-radius: 8px;
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: var(--transition-fast);
  }

  .edit-button:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.25);
    color: var(--foreground);
  }

  /* Manual builder toggle */
  .show-builder-btn,
  .collapse-builder-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    background: rgba(255, 255, 255, 0.03);
    border: 1px dashed var(--theme-stroke, rgba(255, 255, 255, 0.15));
    border-radius: 10px;
    color: var(--muted-foreground);
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: var(--transition-fast);
  }

  .show-builder-btn:hover,
  .collapse-builder-btn:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.25);
    color: var(--foreground);
  }

  .collapse-builder-btn {
    background: rgba(99, 102, 241, 0.08);
    border-style: solid;
    border-color: rgba(99, 102, 241, 0.3);
    color: var(--foreground);
  }

  .chevron {
    font-size: 0.75em;
    opacity: 0.6;
  }

  .manual-builder-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 12px;
  }
</style>
