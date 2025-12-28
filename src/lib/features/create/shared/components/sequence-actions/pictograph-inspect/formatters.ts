/**
 * Pictograph Inspect Formatters
 *
 * Pure functions for formatting pictograph data as text.
 */
import type { BeatData } from "../../../domain/models/BeatData";
import type { MotionData } from "$lib/shared/pictograph/shared/domain/models/MotionData";

export function formatMotionText(
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

export function formatAllForAI(
  displayData: BeatData | null,
  blueMotion: MotionData | undefined,
  redMotion: MotionData | undefined,
  blueRotationOverride: { hasOverride: boolean } | null,
  redRotationOverride: { hasOverride: boolean } | null
): string {
  if (!displayData) return "";

  return `=== PICTOGRAPH DATA ===

${formatBasicInfo(displayData, blueMotion, redMotion)}

${formatMotionText(blueMotion, "blue", blueRotationOverride)}

${formatMotionText(redMotion, "red", redRotationOverride)}`;
}
