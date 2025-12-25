<!--
  PictographInspectModal.svelte

  Developer debug modal showing full pictograph metadata.
  Designed for widescreen desktop use with easy copy-paste for AI agents.
-->
<script lang="ts">
  import type { BeatData } from "../../domain/models/BeatData";
  import { MotionColor } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
  import type { MotionData } from "$lib/shared/pictograph/shared/domain/models/MotionData";
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
  import type { IArrowPositioningOrchestrator } from "$lib/shared/pictograph/arrow/positioning/services/contracts/IArrowPositioningOrchestrator";
  import type { ISpecialPlacementService } from "$lib/shared/pictograph/arrow/positioning/placement/services/contracts/ISpecialPlacementService";
  import type { IRotationAngleOverrideKeyGenerator } from "$lib/shared/pictograph/arrow/positioning/key-generation/services/implementations/RotationAngleOverrideKeyGenerator";
  import type { ITurnsTupleGeneratorService } from "$lib/shared/pictograph/arrow/positioning/placement/services/contracts/ITurnsTupleGeneratorService";
  import type { IGridModeDeriver } from "$lib/shared/pictograph/grid/services/contracts/IGridModeDeriver";
  import { SpecialPlacementOriKeyGenerator } from "$lib/shared/pictograph/arrow/positioning/key-generation/services/implementations/SpecialPlacementOriKeyGenerator";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";

  interface Props {
    show: boolean;
    beatData: BeatData | null;
    onClose: () => void;
  }

  let { show, beatData, onClose }: Props = $props();

  // Calculated data with arrow positions populated
  let calculatedData = $state<BeatData | null>(null);
  let isCalculating = $state(false);

  // Rotation override status for each color (only applies to STATIC/DASH)
  let blueRotationOverride = $state<{ hasOverride: boolean } | null>(null);
  let redRotationOverride = $state<{ hasOverride: boolean } | null>(null);

  // Lookup keys for debugging - shows exactly what keys are used for special placement lookup
  let lookupKeys = $state<{
    gridMode: string;
    oriKey: string;
    turnsTuple: string;
    blueRotationOverrideKey: string | null;
    redRotationOverrideKey: string | null;
  } | null>(null);

  // Calculate arrow positions when modal opens
  $effect(() => {
    if (show && beatData) {
      calculateArrowPositions();
    } else if (!show) {
      calculatedData = null;
      blueRotationOverride = null;
      redRotationOverride = null;
      lookupKeys = null;
    }
  });

  async function calculateArrowPositions() {
    if (!beatData) return;

    isCalculating = true;
    try {
      const arrowOrchestrator = resolve<IArrowPositioningOrchestrator>(
        TYPES.IArrowPositioningOrchestrator
      );

      // Convert BeatData to PictographData for the orchestrator
      const pictographData: PictographData = {
        id: beatData.id,
        letter: beatData.letter,
        startPosition: beatData.startPosition,
        endPosition: beatData.endPosition,
        motions: beatData.motions,
      };

      const calculated =
        await arrowOrchestrator.calculateAllArrowPoints(pictographData);

      // Merge calculated motions back into beat data
      calculatedData = {
        ...beatData,
        motions: calculated.motions,
      };

      // Check rotation overrides for each motion
      await checkRotationOverrides(pictographData);

      // Calculate lookup keys for debugging
      calculateLookupKeys(pictographData);
    } catch (err) {
      console.error("Failed to calculate arrow positions:", err);
      calculatedData = beatData; // Fallback to raw data
    } finally {
      isCalculating = false;
    }
  }

  function calculateLookupKeys(pictographData: PictographData) {
    try {
      const tupleGenerator = resolve<ITurnsTupleGeneratorService>(
        TYPES.ITurnsTupleGeneratorService
      );
      const gridModeDeriver = resolve<IGridModeDeriver>(TYPES.IGridModeDeriver);
      const rotationKeyGenerator = resolve<IRotationAngleOverrideKeyGenerator>(
        TYPES.IRotationAngleOverrideKeyGenerator
      );
      const oriKeyGenerator = new SpecialPlacementOriKeyGenerator();

      const blueMotion = pictographData.motions?.[MotionColor.BLUE];
      const redMotion = pictographData.motions?.[MotionColor.RED];

      // Calculate grid mode
      let gridMode = "diamond";
      if (blueMotion && redMotion) {
        gridMode = gridModeDeriver.deriveGridMode(blueMotion, redMotion);
      }

      // Calculate orientation key (uses blue motion by default)
      let oriKey = "unknown";
      if (blueMotion) {
        oriKey = oriKeyGenerator.generateOrientationKey(
          blueMotion,
          pictographData
        );
      }

      // Calculate turns tuple
      const turnsTuple = tupleGenerator.generateTurnsTuple(pictographData);

      // Calculate rotation override keys for each motion (only for STATIC/DASH)
      let blueRotationOverrideKey: string | null = null;
      let redRotationOverrideKey: string | null = null;

      if (blueMotion) {
        const motionType = blueMotion.motionType?.toLowerCase();
        if (motionType === "static" || motionType === "dash") {
          blueRotationOverrideKey =
            rotationKeyGenerator.generateRotationAngleOverrideKey(
              blueMotion,
              pictographData
            );
        }
      }

      if (redMotion) {
        const motionType = redMotion.motionType?.toLowerCase();
        if (motionType === "static" || motionType === "dash") {
          redRotationOverrideKey =
            rotationKeyGenerator.generateRotationAngleOverrideKey(
              redMotion,
              pictographData
            );
        }
      }

      lookupKeys = {
        gridMode,
        oriKey,
        turnsTuple,
        blueRotationOverrideKey,
        redRotationOverrideKey,
      };
    } catch (err) {
      console.error("Failed to calculate lookup keys:", err);
      lookupKeys = null;
    }
  }

  async function checkRotationOverrides(pictographData: PictographData) {
    try {
      const specialPlacementService = resolve<ISpecialPlacementService>(
        TYPES.ISpecialPlacementService
      );
      const rotationKeyGenerator = resolve<IRotationAngleOverrideKeyGenerator>(
        TYPES.IRotationAngleOverrideKeyGenerator
      );

      // Check blue motion - only STATIC and DASH can have rotation overrides
      const blueMotionData = pictographData.motions?.[MotionColor.BLUE];
      if (blueMotionData) {
        const motionType = blueMotionData.motionType?.toLowerCase();
        if (motionType === "static" || motionType === "dash") {
          const blueKey = rotationKeyGenerator.generateRotationAngleOverrideKey(
            blueMotionData,
            pictographData
          );
          const blueHasOverride =
            await specialPlacementService.hasRotationAngleOverride(
              blueMotionData,
              pictographData,
              blueKey
            );
          blueRotationOverride = { hasOverride: blueHasOverride };
        } else {
          blueRotationOverride = null; // Pro/Anti/Float don't have overrides
        }
      }

      // Check red motion - only STATIC and DASH can have rotation overrides
      const redMotionData = pictographData.motions?.[MotionColor.RED];
      if (redMotionData) {
        const motionType = redMotionData.motionType?.toLowerCase();
        if (motionType === "static" || motionType === "dash") {
          const redKey = rotationKeyGenerator.generateRotationAngleOverrideKey(
            redMotionData,
            pictographData
          );
          const redHasOverride =
            await specialPlacementService.hasRotationAngleOverride(
              redMotionData,
              pictographData,
              redKey
            );
          redRotationOverride = { hasOverride: redHasOverride };
        } else {
          redRotationOverride = null; // Pro/Anti/Float don't have overrides
        }
      }
    } catch (err) {
      console.error("Failed to check rotation overrides:", err);
    }
  }

  // Use calculated data if available, otherwise raw beatData
  const displayData = $derived(calculatedData ?? beatData);
  const blueMotion = $derived(displayData?.motions?.[MotionColor.BLUE]);
  const redMotion = $derived(displayData?.motions?.[MotionColor.RED]);

  // Copy state for feedback
  let copiedSection = $state<string | null>(null);

  function formatMotionText(
    motion: MotionData | undefined,
    color: string,
    rotationOverride: { hasOverride: boolean } | null
  ): string {
    if (!motion) return `${color.toUpperCase()} MOTION: None`;

    const arrow = motion.arrowPlacementData;
    const lines = [
      `${color.toUpperCase()} MOTION:`,
      `  Type: ${motion.motionType}`,
      `  Turns: ${motion.turns === "fl" ? "float" : motion.turns}`,
      `  Rotation: ${motion.rotationDirection}`,
      `  Start Location: ${motion.startLocation}`,
      `  End Location: ${motion.endLocation}`,
      `  Arrow Location: ${motion.arrowLocation}`,
      `  Start Orientation: ${motion.startOrientation}`,
      `  End Orientation: ${motion.endOrientation}`,
    ];

    // Only add prefloat info if present
    if (motion.prefloatMotionType) {
      lines.push(`  Prefloat Type: ${motion.prefloatMotionType}`);
    }
    if (motion.prefloatRotationDirection) {
      lines.push(`  Prefloat Rotation: ${motion.prefloatRotationDirection}`);
    }

    // Arrow placement section
    lines.push(``, `  ARROW PLACEMENT:`);
    lines.push(
      `    Position: (${arrow?.positionX?.toFixed(2) ?? "N/A"}, ${arrow?.positionY?.toFixed(2) ?? "N/A"})`
    );
    lines.push(`    Rotation: ${arrow?.rotationAngle?.toFixed(1) ?? "N/A"}°`);
    lines.push(`    SVG Mirrored: ${arrow?.svgMirrored ? "Yes" : "No"}`);

    // Rotation override info (only for STATIC/DASH)
    if (rotationOverride) {
      lines.push(
        `    Rotation Override: ${rotationOverride.hasOverride ? "YES" : "No"}`
      );
    }

    if (arrow?.manualAdjustmentX || arrow?.manualAdjustmentY) {
      lines.push(
        `    Manual Adjustment: (${arrow?.manualAdjustmentX?.toFixed(2) ?? 0}, ${arrow?.manualAdjustmentY?.toFixed(2) ?? 0})`
      );
    }

    return lines.join("\n");
  }

  function formatBasicInfo(): string {
    if (!displayData) return "";
    // Determine grid mode from motion data
    const gridMode = blueMotion?.gridMode ?? redMotion?.gridMode ?? "unknown";
    const propType = blueMotion?.propType ?? redMotion?.propType ?? "unknown";

    return `BEAT INFO:
  Beat Number: ${displayData.beatNumber}
  Letter: ${displayData.letter ?? "None"}
  Grid Mode: ${gridMode}
  Prop Type: ${propType}
  Start Position: ${displayData.startPosition ?? "N/A"}
  End Position: ${displayData.endPosition ?? "N/A"}
  Blue Reversal: ${displayData.blueReversal}
  Red Reversal: ${displayData.redReversal}
  ID: ${displayData.id}`;
  }

  function formatAllForAI(): string {
    if (!displayData) return "";
    return `=== PICTOGRAPH DATA ===

${formatBasicInfo()}

${formatMotionText(blueMotion, "blue", blueRotationOverride)}

${formatMotionText(redMotion, "red", redRotationOverride)}`;
  }

  async function copyToClipboard(text: string, section: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedSection = section;
      setTimeout(() => (copiedSection = null), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      onClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if show && beatData}
  <div
    class="modal-backdrop"
    onclick={handleBackdropClick}
    role="dialog"
    aria-modal="true"
    aria-label="Pictograph Inspector"
  >
    <div class="modal-content">
      <header class="modal-header">
        <div class="header-left">
          <i class="fas fa-magnifying-glass"></i>
          <h2>Pictograph Inspector</h2>
          <span class="beat-badge"
            >Beat {displayData?.beatNumber ?? beatData.beatNumber}</span
          >
          {#if displayData?.letter ?? beatData.letter}
            <span class="letter-badge"
              >{displayData?.letter ?? beatData.letter}</span
            >
          {/if}
          {#if isCalculating}
            <span class="calculating-badge">
              <i class="fas fa-spinner fa-spin"></i>
            </span>
          {/if}
        </div>
        <div class="header-actions">
          <button
            class="copy-all-btn"
            onclick={() => copyToClipboard(formatAllForAI(), "all")}
            disabled={isCalculating}
          >
            <i class="fas fa-copy"></i>
            {copiedSection === "all" ? "Copied!" : "Copy All for AI"}
          </button>
          <button
            class="copy-json-btn"
            onclick={() =>
              copyToClipboard(
                JSON.stringify(displayData ?? beatData, null, 2),
                "json"
              )}
            disabled={isCalculating}
          >
            <i class="fas fa-code"></i>
            {copiedSection === "json" ? "Copied!" : "Copy JSON"}
          </button>
          <button class="close-btn" onclick={onClose} aria-label="Close">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </header>

      <div class="modal-body">
        <!-- Three-column layout -->
        <div class="columns">
          <!-- Basic Info Column -->
          <section class="column basic-column">
            <div class="column-header">
              <h3>Basic Info</h3>
              <button
                class="copy-btn"
                onclick={() => copyToClipboard(formatBasicInfo(), "basic")}
                title="Copy Basic Info"
              >
                <i class="fas fa-copy"></i>
                {#if copiedSection === "basic"}<span class="copied-label"
                    >Copied!</span
                  >{/if}
              </button>
            </div>
            <div class="data-block">
              <div class="data-row">
                <span class="key">Beat #</span>
                <span class="val">{displayData?.beatNumber ?? "—"}</span>
              </div>
              <div class="data-row">
                <span class="key">Letter</span>
                <span class="val highlight"
                  >{displayData?.letter ?? "None"}</span
                >
              </div>
              <div class="data-row">
                <span class="key">Grid Mode</span>
                <span class="val"
                  >{blueMotion?.gridMode ?? redMotion?.gridMode ?? "N/A"}</span
                >
              </div>
              <div class="data-row">
                <span class="key">Prop Type</span>
                <span class="val"
                  >{blueMotion?.propType ?? redMotion?.propType ?? "N/A"}</span
                >
              </div>
              <div class="data-row">
                <span class="key">Start Pos</span>
                <span class="val">{displayData?.startPosition ?? "N/A"}</span>
              </div>
              <div class="data-row">
                <span class="key">End Pos</span>
                <span class="val">{displayData?.endPosition ?? "N/A"}</span>
              </div>
              <div class="data-row">
                <span class="key">Blue Rev</span>
                <span class="val">{displayData?.blueReversal ?? "—"}</span>
              </div>
              <div class="data-row">
                <span class="key">Red Rev</span>
                <span class="val">{displayData?.redReversal ?? "—"}</span>
              </div>
              <div class="data-row">
                <span class="key">ID</span>
                <span class="val mono small">{displayData?.id ?? "—"}</span>
              </div>
            </div>

            <!-- Lookup Keys Section -->
            {#if lookupKeys}
              <div class="subsection lookup-keys-section">
                <div class="subsection-header">
                  <h4>
                    <i class="fas fa-key"></i>
                    Lookup Keys
                  </h4>
                  <button
                    class="copy-btn small"
                    onclick={() =>
                      copyToClipboard(
                        `Grid Mode: ${lookupKeys?.gridMode ?? "N/A"}\nOri Key: ${lookupKeys?.oriKey ?? "N/A"}\nTurns Tuple: ${lookupKeys?.turnsTuple ?? "N/A"}\nBlue Rot Key: ${lookupKeys?.blueRotationOverrideKey ?? "N/A"}\nRed Rot Key: ${lookupKeys?.redRotationOverrideKey ?? "N/A"}`,
                        "keys"
                      )}
                    title="Copy Lookup Keys"
                  >
                    <i class="fas fa-copy"></i>
                    {#if copiedSection === "keys"}<span class="copied-label"
                        >!</span
                      >{/if}
                  </button>
                </div>
                <div class="data-block compact">
                  <div class="data-row key-row">
                    <span class="key">Grid Mode</span>
                    <span class="val mono key-val">{lookupKeys.gridMode}</span>
                  </div>
                  <div class="data-row key-row">
                    <span class="key">Ori Key</span>
                    <span class="val mono key-val">{lookupKeys.oriKey}</span>
                  </div>
                  <div class="data-row key-row highlight-key">
                    <span class="key">Turns Tuple</span>
                    <span class="val mono key-val">{lookupKeys.turnsTuple}</span
                    >
                  </div>
                  {#if lookupKeys.blueRotationOverrideKey}
                    <div class="data-row key-row blue-key">
                      <span class="key">Blue Rot Key</span>
                      <span class="val mono key-val"
                        >{lookupKeys.blueRotationOverrideKey}</span
                      >
                    </div>
                  {/if}
                  {#if lookupKeys.redRotationOverrideKey}
                    <div class="data-row key-row red-key">
                      <span class="key">Red Rot Key</span>
                      <span class="val mono key-val"
                        >{lookupKeys.redRotationOverrideKey}</span
                      >
                    </div>
                  {/if}
                </div>
              </div>
            {/if}
          </section>

          <!-- Blue Motion Column -->
          <section class="column blue-column">
            <div class="column-header">
              <h3><span class="dot blue"></span> Blue Motion</h3>
              <button
                class="copy-btn"
                onclick={() =>
                  copyToClipboard(
                    formatMotionText(blueMotion, "blue", blueRotationOverride),
                    "blue"
                  )}
                title="Copy Blue Motion"
              >
                <i class="fas fa-copy"></i>
                {#if copiedSection === "blue"}<span class="copied-label"
                    >Copied!</span
                  >{/if}
              </button>
            </div>
            {#if blueMotion}
              <div class="data-block">
                <div class="data-row">
                  <span class="key">Type</span>
                  <span class="val">{blueMotion.motionType}</span>
                </div>
                <div class="data-row">
                  <span class="key">Turns</span>
                  <span class="val"
                    >{blueMotion.turns === "fl"
                      ? "float"
                      : blueMotion.turns}</span
                  >
                </div>
                <div class="data-row">
                  <span class="key">Rotation</span>
                  <span class="val">{blueMotion.rotationDirection}</span>
                </div>
                <div class="data-row">
                  <span class="key">Start Loc</span>
                  <span class="val">{blueMotion.startLocation}</span>
                </div>
                <div class="data-row">
                  <span class="key">End Loc</span>
                  <span class="val">{blueMotion.endLocation}</span>
                </div>
                <div class="data-row">
                  <span class="key">Arrow Loc</span>
                  <span class="val">{blueMotion.arrowLocation}</span>
                </div>
                <div class="data-row">
                  <span class="key">Start Ori</span>
                  <span class="val">{blueMotion.startOrientation}</span>
                </div>
                <div class="data-row">
                  <span class="key">End Ori</span>
                  <span class="val">{blueMotion.endOrientation}</span>
                </div>
                {#if blueMotion.prefloatMotionType}
                  <div class="data-row warn">
                    <span class="key">Prefloat</span>
                    <span class="val">{blueMotion.prefloatMotionType}</span>
                  </div>
                {/if}
              </div>
              <div class="subsection">
                <h4>Arrow Placement</h4>
                <div class="data-block compact">
                  <div class="data-row">
                    <span class="key">Pos X</span>
                    <span class="val mono"
                      >{blueMotion.arrowPlacementData?.positionX?.toFixed(2) ??
                        "N/A"}</span
                    >
                  </div>
                  <div class="data-row">
                    <span class="key">Pos Y</span>
                    <span class="val mono"
                      >{blueMotion.arrowPlacementData?.positionY?.toFixed(2) ??
                        "N/A"}</span
                    >
                  </div>
                  <div class="data-row">
                    <span class="key">Rotation</span>
                    <span class="val mono"
                      >{blueMotion.arrowPlacementData?.rotationAngle?.toFixed(
                        1
                      ) ?? "N/A"}°</span
                    >
                  </div>
                  <div class="data-row">
                    <span class="key">Mirrored</span>
                    <span class="val"
                      >{blueMotion.arrowPlacementData?.svgMirrored
                        ? "Yes"
                        : "No"}</span
                    >
                  </div>
                  {#if blueRotationOverride}
                    <div
                      class="data-row"
                      class:override-active={blueRotationOverride.hasOverride}
                    >
                      <span class="key">Rot Override</span>
                      <span class="val"
                        >{blueRotationOverride.hasOverride ? "YES" : "No"}</span
                      >
                    </div>
                  {/if}
                  {#if blueMotion.arrowPlacementData?.manualAdjustmentX || blueMotion.arrowPlacementData?.manualAdjustmentY}
                    <div class="data-row warn">
                      <span class="key">Manual</span>
                      <span class="val mono">
                        ({blueMotion.arrowPlacementData?.manualAdjustmentX?.toFixed(
                          2
                        ) ?? 0},
                        {blueMotion.arrowPlacementData?.manualAdjustmentY?.toFixed(
                          2
                        ) ?? 0})
                      </span>
                    </div>
                  {/if}
                </div>
              </div>
            {:else}
              <div class="empty-state">No blue motion</div>
            {/if}
          </section>

          <!-- Red Motion Column -->
          <section class="column red-column">
            <div class="column-header">
              <h3><span class="dot red"></span> Red Motion</h3>
              <button
                class="copy-btn"
                onclick={() =>
                  copyToClipboard(
                    formatMotionText(redMotion, "red", redRotationOverride),
                    "red"
                  )}
                title="Copy Red Motion"
              >
                <i class="fas fa-copy"></i>
                {#if copiedSection === "red"}<span class="copied-label"
                    >Copied!</span
                  >{/if}
              </button>
            </div>
            {#if redMotion}
              <div class="data-block">
                <div class="data-row">
                  <span class="key">Type</span>
                  <span class="val">{redMotion.motionType}</span>
                </div>
                <div class="data-row">
                  <span class="key">Turns</span>
                  <span class="val"
                    >{redMotion.turns === "fl"
                      ? "float"
                      : redMotion.turns}</span
                  >
                </div>
                <div class="data-row">
                  <span class="key">Rotation</span>
                  <span class="val">{redMotion.rotationDirection}</span>
                </div>
                <div class="data-row">
                  <span class="key">Start Loc</span>
                  <span class="val">{redMotion.startLocation}</span>
                </div>
                <div class="data-row">
                  <span class="key">End Loc</span>
                  <span class="val">{redMotion.endLocation}</span>
                </div>
                <div class="data-row">
                  <span class="key">Arrow Loc</span>
                  <span class="val">{redMotion.arrowLocation}</span>
                </div>
                <div class="data-row">
                  <span class="key">Start Ori</span>
                  <span class="val">{redMotion.startOrientation}</span>
                </div>
                <div class="data-row">
                  <span class="key">End Ori</span>
                  <span class="val">{redMotion.endOrientation}</span>
                </div>
                {#if redMotion.prefloatMotionType}
                  <div class="data-row warn">
                    <span class="key">Prefloat</span>
                    <span class="val">{redMotion.prefloatMotionType}</span>
                  </div>
                {/if}
              </div>
              <div class="subsection">
                <h4>Arrow Placement</h4>
                <div class="data-block compact">
                  <div class="data-row">
                    <span class="key">Pos X</span>
                    <span class="val mono"
                      >{redMotion.arrowPlacementData?.positionX?.toFixed(2) ??
                        "N/A"}</span
                    >
                  </div>
                  <div class="data-row">
                    <span class="key">Pos Y</span>
                    <span class="val mono"
                      >{redMotion.arrowPlacementData?.positionY?.toFixed(2) ??
                        "N/A"}</span
                    >
                  </div>
                  <div class="data-row">
                    <span class="key">Rotation</span>
                    <span class="val mono"
                      >{redMotion.arrowPlacementData?.rotationAngle?.toFixed(
                        1
                      ) ?? "N/A"}°</span
                    >
                  </div>
                  <div class="data-row">
                    <span class="key">Mirrored</span>
                    <span class="val"
                      >{redMotion.arrowPlacementData?.svgMirrored
                        ? "Yes"
                        : "No"}</span
                    >
                  </div>
                  {#if redRotationOverride}
                    <div
                      class="data-row"
                      class:override-active={redRotationOverride.hasOverride}
                    >
                      <span class="key">Rot Override</span>
                      <span class="val"
                        >{redRotationOverride.hasOverride ? "YES" : "No"}</span
                      >
                    </div>
                  {/if}
                  {#if redMotion.arrowPlacementData?.manualAdjustmentX || redMotion.arrowPlacementData?.manualAdjustmentY}
                    <div class="data-row warn">
                      <span class="key">Manual</span>
                      <span class="val mono">
                        ({redMotion.arrowPlacementData?.manualAdjustmentX?.toFixed(
                          2
                        ) ?? 0},
                        {redMotion.arrowPlacementData?.manualAdjustmentY?.toFixed(
                          2
                        ) ?? 0})
                      </span>
                    </div>
                  {/if}
                </div>
              </div>
            {:else}
              <div class="empty-state">No red motion</div>
            {/if}
          </section>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    animation: fadeIn 0.15s ease-out;
  }

  .modal-content {
    background: linear-gradient(
      135deg,
      rgba(25, 30, 40, 0.98),
      rgba(15, 20, 30, 0.98)
    );
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    width: 100%;
    max-width: 1200px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
    animation: slideUp 0.2s ease-out;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.3);
    flex-wrap: wrap;
    gap: 12px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-left i {
    color: #06b6d4;
    font-size: 1.2rem;
  }

  .header-left h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
  }

  .beat-badge {
    background: rgba(255, 255, 255, 0.1);
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
  }

  .letter-badge {
    background: linear-gradient(135deg, #06b6d4, #0891b2);
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 700;
    color: white;
  }

  .calculating-badge {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .copy-all-btn,
  .copy-json-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    transition: all 0.15s ease;
  }

  .copy-all-btn {
    background: linear-gradient(135deg, #06b6d4, #0891b2);
    color: white;
  }

  .copy-all-btn:hover {
    background: linear-gradient(135deg, #22d3ee, #06b6d4);
    transform: translateY(-1px);
  }

  .copy-all-btn:disabled,
  .copy-json-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .copy-json-btn {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .copy-json-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }

  .close-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    margin-left: 8px;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }

  .columns {
    display: grid;
    grid-template-columns: 1fr 1.5fr 1.5fr;
    gap: 20px;
    min-height: 0;
  }

  .column {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .blue-column {
    border-left: 3px solid rgba(59, 130, 246, 0.6);
  }

  .red-column {
    border-left: 3px solid rgba(239, 68, 68, 0.6);
  }

  .column-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .column-header h3 {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .dot.blue {
    background: #3b82f6;
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
  }

  .dot.red {
    background: #ef4444;
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
  }

  .copy-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    font-size: 0.75rem;
    transition: all 0.15s ease;
  }

  .copy-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .copied-label {
    color: #22c55e;
    font-weight: 600;
  }

  .data-block {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .data-block.compact {
    gap: 4px;
  }

  .data-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 10px;
    background: rgba(0, 0, 0, 0.25);
    border-radius: 6px;
    gap: 12px;
  }

  .data-row.warn {
    background: rgba(251, 191, 36, 0.15);
    border: 1px solid rgba(251, 191, 36, 0.3);
  }

  .data-row.override-active {
    background: rgba(34, 197, 94, 0.2);
    border: 1px solid rgba(34, 197, 94, 0.4);
  }

  .data-row.override-active .val {
    color: #22c55e;
    font-weight: 700;
  }

  .key {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }

  .val {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
    text-align: right;
    user-select: all;
  }

  .val.highlight {
    color: #06b6d4;
    font-weight: 700;
    font-size: 1rem;
  }

  .val.mono {
    font-family: "SF Mono", Monaco, "Cascadia Code", monospace;
  }

  .val.small {
    font-size: 0.7rem;
    word-break: break-all;
  }

  .subsection {
    margin-top: 8px;
    padding-top: 12px;
    border-top: 1px dashed rgba(255, 255, 255, 0.1);
  }

  .subsection h4 {
    margin: 0 0 8px 0;
    font-size: 0.75rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Lookup Keys Section */
  .lookup-keys-section {
    background: rgba(6, 182, 212, 0.08);
    border: 1px solid rgba(6, 182, 212, 0.2);
    border-radius: 8px;
    padding: 12px;
    margin-top: 12px;
  }

  .subsection-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .subsection-header h4 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    color: #06b6d4;
  }

  .subsection-header h4 i {
    font-size: 0.7rem;
  }

  .copy-btn.small {
    padding: 4px 8px;
    font-size: 0.7rem;
  }

  .data-row.key-row {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .key-val {
    font-size: 0.8rem;
    color: #22d3ee;
    background: rgba(0, 0, 0, 0.3);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .data-row.highlight-key {
    background: rgba(6, 182, 212, 0.15);
    border: 1px solid rgba(6, 182, 212, 0.3);
  }

  .data-row.highlight-key .key-val {
    color: #67e8f9;
    font-weight: 600;
  }

  .data-row.blue-key {
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.2);
  }

  .data-row.blue-key .key-val {
    color: #60a5fa;
  }

  .data-row.red-key {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  .data-row.red-key .key-val {
    color: #f87171;
  }

  .empty-state {
    padding: 24px;
    text-align: center;
    color: rgba(255, 255, 255, 0.3);
    font-style: italic;
    font-size: 0.85rem;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(16px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Responsive: stack columns on narrower screens */
  @media (max-width: 900px) {
    .columns {
      grid-template-columns: 1fr 1fr;
    }

    .basic-column {
      grid-column: span 2;
    }
  }

  @media (max-width: 600px) {
    .columns {
      grid-template-columns: 1fr;
    }

    .basic-column {
      grid-column: span 1;
    }

    .modal-content {
      max-width: 100%;
      border-radius: 12px;
    }

    .header-left h2 {
      display: none;
    }
  }
</style>
