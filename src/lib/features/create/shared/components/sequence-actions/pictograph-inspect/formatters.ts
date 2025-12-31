/**
 * Pictograph Inspect Formatters
 *
 * Pure functions for formatting pictograph data as text.
 */
import type { BeatData } from "../../../domain/models/BeatData";
import type { MotionData } from "$lib/shared/pictograph/shared/domain/models/MotionData";
import DefaultPropPositioner from "$lib/shared/pictograph/prop/services/implementations/DefaultPropPositioner";
import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
import { resolve } from "$lib/shared/inversify/di";
import { TYPES } from "$lib/shared/inversify/types";
import type { IPropPlacer } from "$lib/shared/pictograph/prop/services/contracts/IPropPlacer";
import { getSettings } from "$lib/shared/application/state/app-state.svelte";
import { MotionColor } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";

export async function formatMotionText(
  motion: MotionData | undefined,
  color: string,
  rotationOverride: { hasOverride: boolean } | null,
  pictographData?: PictographData
): Promise<string> {
  if (!motion) return `${color.toUpperCase()} MOTION: None`;

  const arrow = motion.arrowPlacementData;

  // Calculate actual prop placement using the PropPlacer service
  // Apply settings override for prop type (same as PictographPreparer does)
  let calculatedPlacement: { positionX: number; positionY: number; rotationAngle: number } | null = null;
  if (pictographData) {
    try {
      const propPlacer = resolve<IPropPlacer>(TYPES.IPropPlacer);
      const settings = getSettings();
      const propTypeOverride = color === "blue" ? settings.bluePropType : settings.redPropType;
      const motionWithOverride = propTypeOverride
        ? { ...motion, propType: propTypeOverride }
        : motion;
      const placement = await propPlacer.calculatePlacement(pictographData, motionWithOverride);
      calculatedPlacement = placement;
    } catch (e) {
      console.warn("Failed to calculate prop placement:", e);
    }
  }
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

  // Prop placement section - use calculated placement, not stale MotionData
  lines.push(``, `  PROP PLACEMENT:`);

  if (calculatedPlacement) {
    lines.push(
      `    Position: (${calculatedPlacement.positionX.toFixed(2)}, ${calculatedPlacement.positionY.toFixed(2)})`
    );
    lines.push(`    Rotation: ${calculatedPlacement.rotationAngle.toFixed(1)}°`);

    // Calculate expected default position and beta offset
    try {
      const gridMode = motion.gridMode === GridMode.BOX ? GridMode.BOX : GridMode.DIAMOND;
      const defaultPos = DefaultPropPositioner.calculatePosition(motion.endLocation, gridMode);
      lines.push(`    Default Position: (${defaultPos.x.toFixed(2)}, ${defaultPos.y.toFixed(2)})`);

      const offsetX = calculatedPlacement.positionX - defaultPos.x;
      const offsetY = calculatedPlacement.positionY - defaultPos.y;
      const hasOffset = Math.abs(offsetX) > 0.01 || Math.abs(offsetY) > 0.01;
      lines.push(`    Beta Offset: ${hasOffset ? `(${offsetX.toFixed(2)}, ${offsetY.toFixed(2)})` : "None"}`);
    } catch {
      lines.push(`    Default Position: (calculation error)`);
    }
  } else {
    lines.push(`    Position: (not calculated)`);
  }

  return lines.join("\n");
}

export function formatBasicInfo(
  displayData: BeatData | null,
  blueMotion: MotionData | undefined,
  redMotion: MotionData | undefined
): string {
  if (!displayData) return "";

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

export async function formatAllForAI(
  displayData: BeatData | null,
  blueMotion: MotionData | undefined,
  redMotion: MotionData | undefined,
  blueRotationOverride: { hasOverride: boolean } | null,
  redRotationOverride: { hasOverride: boolean } | null,
  pictographData?: PictographData
): Promise<string> {
  if (!displayData) return "";

  const [blueText, redText] = await Promise.all([
    formatMotionText(blueMotion, "blue", blueRotationOverride, pictographData),
    formatMotionText(redMotion, "red", redRotationOverride, pictographData),
  ]);

  return `=== PICTOGRAPH DATA ===

${formatBasicInfo(displayData, blueMotion, redMotion)}

${blueText}

${redText}`;
}
