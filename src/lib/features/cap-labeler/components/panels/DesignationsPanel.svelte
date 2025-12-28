<script lang="ts">
  /**
   * Designations Panel
   *
   * Unified display for all designation types (whole, section, beat pair).
   * This is the "what you're building" panel - the single source of truth.
   * Supports multiple candidate designations with individual confirm/deny.
   */
  import type {
    CAPDesignation,
    CandidateDesignation,
    BeatPairGroups,
  } from "../../domain/models/label-models";
  import type { SectionDesignation } from "../../domain/models/section-models";
  import type { BeatPairRelationship } from "../../domain/models/beatpair-models";
  import type { PolyrhythmicCAPResult } from "../../services/contracts/IPolyrhythmicDetector";
  import type { CompoundPattern, AxisAlternatingPattern } from "../../services/contracts/ICAPDetector";
  import FontAwesomeIcon from "$lib/shared/foundation/ui/FontAwesomeIcon.svelte";
  import BeatPairAnalysisDisplay from "../shared/BeatPairAnalysisDisplay.svelte";
  import CandidatesSection from "./designations/CandidatesSection.svelte";
  import PolyrhythmicDisplay from "./designations/PolyrhythmicDisplay.svelte";
  import CompoundPatternDisplay from "./designations/CompoundPatternDisplay.svelte";
  import DesignationsList from "./designations/DesignationsList.svelte";
  import ActionButtons from "./designations/ActionButtons.svelte";
  import DeleteConfirmSection from "./designations/DeleteConfirmSection.svelte";

  interface Props {
    wholeDesignations: CAPDesignation[];
    sectionDesignations: SectionDesignation[];
    beatPairDesignations: BeatPairRelationship[];
    isFreeform: boolean;
    isModular?: boolean;
    isPolyrhythmic?: boolean;
    polyrhythmic?: PolyrhythmicCAPResult | null;
    compoundPattern?: CompoundPattern | null;
    isAxisAlternating?: boolean;
    axisAlternatingPattern?: AxisAlternatingPattern | null;
    needsVerification?: boolean;
    autoDetectedDesignations?: CAPDesignation[];
    candidateDesignations?: CandidateDesignation[];
    autoDetectedBeatPairs?: BeatPairRelationship[];
    autoDetectedBeatPairGroups?: BeatPairGroups;
    onRemoveWholeDesignation: (index: number) => void;
    onRemoveSectionDesignation: (index: number) => void;
    onRemoveBeatPairDesignation: (index: number) => void;
    onSetFreeform: () => void;
    onMarkUnknown: () => void;
    onSaveAndNext: () => void;
    onConfirmAutoLabel?: () => void;
    onConfirmCandidate?: (index: number) => void;
    onDenyCandidate?: (index: number) => void;
    onConfirmAllCandidates?: () => void;
    onDeleteSequence?: () => Promise<void>;
    canSave: boolean;
    sequenceWord?: string;
  }

  let {
    wholeDesignations,
    sectionDesignations,
    beatPairDesignations,
    isFreeform,
    isModular = false,
    isPolyrhythmic = false,
    polyrhythmic = null,
    compoundPattern = null,
    isAxisAlternating = false,
    axisAlternatingPattern = null,
    needsVerification = false,
    autoDetectedDesignations = [],
    candidateDesignations = [],
    autoDetectedBeatPairs = [],
    autoDetectedBeatPairGroups = {},
    onRemoveWholeDesignation,
    onRemoveSectionDesignation,
    onRemoveBeatPairDesignation,
    onSetFreeform,
    onMarkUnknown,
    onSaveAndNext,
    onConfirmAutoLabel,
    onConfirmCandidate,
    onDenyCandidate,
    onConfirmAllCandidates,
    onDeleteSequence,
    canSave,
    sequenceWord = "",
  }: Props = $props();

  // Copy detection info to clipboard for debugging
  let copySuccess = $state(false);

  async function copyDetectionInfo() {
    const detectionInfo = {
      candidateDesignations,
      autoDetectedDesignations,
      beatPairs: autoDetectedBeatPairs,
      beatPairGroups: autoDetectedBeatPairGroups,
      isFreeform,
      isModular,
      isPolyrhythmic,
      polyrhythmic,
      compoundPattern,
      wholeDesignations,
      sectionDesignations,
      beatPairDesignations,
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(detectionInfo, null, 2));
      copySuccess = true;
      setTimeout(() => { copySuccess = false; }, 2000);
    } catch (err) {
      console.error("Failed to copy detection info:", err);
    }
  }

  // Check if there are multiple unconfirmed candidates
  const hasMultipleCandidates = $derived(candidateDesignations.length > 1);

  // Filter to show only pending candidates (not yet confirmed or denied)
  const pendingCandidates = $derived(
    candidateDesignations.filter((c) => !c.confirmed && !c.denied)
  );

</script>

<div class="designations-panel">
  <div class="panel-header">
    <h3 class="panel-title">Designations</h3>
    <button
      class="copy-btn"
      class:success={copySuccess}
      onclick={copyDetectionInfo}
      title="Copy detection info to clipboard"
    >
      <FontAwesomeIcon icon={copySuccess ? "check" : "copy"} size="0.85em" />
    </button>
  </div>

  <!-- Candidate verification section -->
  <CandidatesSection
    {needsVerification}
    {candidateDesignations}
    {pendingCandidates}
    {hasMultipleCandidates}
    {autoDetectedDesignations}
    {onConfirmAutoLabel}
    {onConfirmCandidate}
    {onDenyCandidate}
    {onConfirmAllCandidates}
  />

  <!-- Auto-detected beat-pair analysis (hide for polyrhythmic - spatial transforms don't apply) -->
  {#if autoDetectedBeatPairs.length > 0 && !isPolyrhythmic}
    <BeatPairAnalysisDisplay
      beatPairs={autoDetectedBeatPairs}
      beatPairGroups={autoDetectedBeatPairGroups}
      collapsed={false}
      {isAxisAlternating}
      {axisAlternatingPattern}
    />
  {/if}

  <!-- Compound pattern display -->
  {#if compoundPattern}
    <CompoundPatternDisplay {compoundPattern} />
  {/if}

  <!-- Polyrhythmic detection results -->
  {#if isPolyrhythmic && polyrhythmic}
    <PolyrhythmicDisplay {polyrhythmic} />
  {/if}

  <!-- Confirmed designations list -->
  <DesignationsList
    {wholeDesignations}
    {sectionDesignations}
    {beatPairDesignations}
    {isFreeform}
    {isModular}
    {isAxisAlternating}
    {axisAlternatingPattern}
    {onRemoveWholeDesignation}
    {onRemoveSectionDesignation}
    {onRemoveBeatPairDesignation}
  />

  <!-- Action buttons -->
  <ActionButtons
    {isFreeform}
    {canSave}
    {onSetFreeform}
    {onMarkUnknown}
    {onSaveAndNext}
  />

  <!-- Delete sequence section -->
  {#if onDeleteSequence}
    <DeleteConfirmSection
      {sequenceWord}
      {onDeleteSequence}
    />
  {/if}
</div>

<style>
  .designations-panel {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: var(--surface-glass);
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 12px;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-sm);
  }

  .panel-title {
    margin: 0;
    font-size: var(--font-size-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted-foreground);
  }

  .copy-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: transparent;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 6px;
    color: var(--muted-foreground);
    cursor: pointer;
    transition: var(--transition-micro);
  }

  .copy-btn:hover {
    background: rgba(255, 255, 255, 0.06);
    color: var(--foreground);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .copy-btn.success {
    background: rgba(34, 197, 94, 0.15);
    border-color: rgba(34, 197, 94, 0.4);
    color: #22c55e;
  }
</style>
