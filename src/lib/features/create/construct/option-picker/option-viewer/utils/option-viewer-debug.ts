import type { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
import type { createOptionPickerState } from "../state/option-picker-state.svelte";

type OptionPickerState = ReturnType<typeof createOptionPickerState>;
type OptionPickerDebugInfo = ReturnType<OptionPickerState["getDebugInfo"]>;

type MotionDebugData = NonNullable<OptionPickerDebugInfo["lastBeatMotionData"]>;

export interface OptionViewerDebugContext {
  currentSequence: PictographData[];
  currentGridMode: GridMode;
  isUndoingOption: boolean;
  isFadingOut: boolean;
  servicesReady: boolean;
  containerDimensions: {
    width: number;
    height: number;
    isReady: boolean;
  };
  organizedPictographsCount: number;
}

export function getMotionDebugData(p: PictographData): MotionDebugData {
  return {
    hasBlueMotion: !!p.motions?.blue,
    hasRedMotion: !!p.motions?.red,
    blueMotion: p.motions?.blue
      ? {
          startLocation: p.motions.blue.startLocation,
          endLocation: p.motions.blue.endLocation,
          startOrientation: p.motions.blue.startOrientation,
          endOrientation: p.motions.blue.endOrientation,
          motionType: p.motions.blue.motionType,
        }
      : null,
    redMotion: p.motions?.red
      ? {
          startLocation: p.motions.red.startLocation,
          endLocation: p.motions.red.endLocation,
          startOrientation: p.motions.red.startOrientation,
          endOrientation: p.motions.red.endOrientation,
          motionType: p.motions.red.motionType,
        }
      : null,
  };
}

export function buildOptionViewerDebugText(
  debugInfo: OptionPickerDebugInfo,
  context: OptionViewerDebugContext
) {
  // Get last beat from prop for comparison
  const lastPropBeat =
    context.currentSequence.length > 0
      ? context.currentSequence[context.currentSequence.length - 1]
      : null;
  const lastPropBeatMotionData = lastPropBeat
    ? getMotionDebugData(lastPropBeat)
    : null;

  const fullDebugInfo = {
    ...debugInfo,
    // Additional context from component
    componentContext: {
      currentSequenceProp: context.currentSequence.map((p, i) => ({
        index: i,
        id: p.id,
        letter: p.letter,
        startPosition: p.startPosition,
        endPosition: p.endPosition,
        ...getMotionDebugData(p),
      })),
      currentSequencePropLength: context.currentSequence.length,
      lastPropBeatHasMotions: lastPropBeatMotionData
        ? lastPropBeatMotionData.hasBlueMotion &&
          lastPropBeatMotionData.hasRedMotion
        : false,
      lastPropBeatMotionData,
      currentGridMode: context.currentGridMode,
      isUndoingOption: context.isUndoingOption,
      isFadingOut: context.isFadingOut,
      servicesReady: context.servicesReady,
      containerDimensions: {
        width: context.containerDimensions.width,
        height: context.containerDimensions.height,
        isReady: context.containerDimensions.isReady,
      },
      organizedPictographsCount: context.organizedPictographsCount,
    },
  };

  // Format motion data for readable output
  const formatMotion = (motion: typeof debugInfo.lastBeatMotionData) => {
    if (!motion) return "  No motion data";
    return `  Has Blue: ${motion.hasBlueMotion}, Has Red: ${motion.hasRedMotion}
  Blue: ${motion.blueMotion ? `${motion.blueMotion.startLocation}  ${motion.blueMotion.endLocation} (${motion.blueMotion.motionType})` : "MISSING"}
  Red: ${motion.redMotion ? `${motion.redMotion.startLocation}  ${motion.redMotion.endLocation} (${motion.redMotion.motionType})` : "MISSING"}`;
  };

  return `=== OPTION VIEWER DEBUG INFO ===
Timestamp: ${fullDebugInfo.timestamp}
Issue: "No options available" shown when sequence should have options

--- State ---
State: ${fullDebugInfo.state}
Options loaded: ${fullDebugInfo.optionsCount}
Filtered options: ${fullDebugInfo.filteredOptionsCount}
Last sequence ID: ${fullDebugInfo.lastSequenceId}
Error: ${fullDebugInfo.error || "none"}

--- CRITICAL: Last Beat Motion Data (STATE - used for option loading) ---
Last beat has valid motions: ${fullDebugInfo.lastBeatHasMotions ? "YES û" : "NO ? (This is likely the problem!)"}
${formatMotion(fullDebugInfo.lastBeatMotionData)}

--- Last Beat Motion Data (PROP - from component) ---
Last prop beat has valid motions: ${fullDebugInfo.componentContext.lastPropBeatHasMotions ? "YES û" : "NO ?"}
${formatMotion(fullDebugInfo.componentContext.lastPropBeatMotionData)}

--- Sequence Info ---
Current sequence length (state): ${fullDebugInfo.currentSequenceLength}
Current sequence length (prop): ${fullDebugInfo.componentContext.currentSequencePropLength}
Grid mode: ${fullDebugInfo.componentContext.currentGridMode}

--- Sequence Details (state) - with motion data ---
${JSON.stringify(fullDebugInfo.currentSequence, null, 2)}

--- Sequence Details (prop) - with motion data ---
${JSON.stringify(fullDebugInfo.componentContext.currentSequenceProp, null, 2)}

--- Filter Settings ---
Continuous only: ${fullDebugInfo.isContinuousOnly}
Sort method: ${fullDebugInfo.sortMethod}

--- Component Context ---
Services ready: ${fullDebugInfo.componentContext.servicesReady}
Is undoing: ${fullDebugInfo.componentContext.isUndoingOption}
Is fading out: ${fullDebugInfo.componentContext.isFadingOut}
Container dimensions: ${fullDebugInfo.componentContext.containerDimensions.width}x${fullDebugInfo.componentContext.containerDimensions.height}
Container ready: ${fullDebugInfo.componentContext.containerDimensions.isReady}
Organized sections: ${fullDebugInfo.componentContext.organizedPictographsCount}

--- Full JSON ---
${JSON.stringify(fullDebugInfo, null, 2)}
`;
}
