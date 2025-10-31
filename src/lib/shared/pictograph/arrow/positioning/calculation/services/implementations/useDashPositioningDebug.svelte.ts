/**
 * Svelte 5 composable for debugging dash arrow positioning
 *
 * Usage in any Svelte component:
 *
 * import { useDashPositioningDebug } from '$shared/pictograph/arrow/positioning/calculation/services/implementations/useDashPositioningDebug.svelte';
 *
 * const { debugPictograph } = useDashPositioningDebug();
 *
 * // Call when you want to debug:
 * debugPictograph(yourPictographData, true); // true for blue arrow, false for red
 */

import type { PictographData } from "$shared";
import { DirectionalTupleDebugger } from "./DirectionalTupleDebugger";

export function useDashPositioningDebug() {
  const debugger = new DirectionalTupleDebugger();

  /**
   * Debug the arrow positioning for a pictograph
   * Opens a detailed console trace of the entire positioning pipeline
   */
  async function debugPictograph(
    pictographData: PictographData,
    isBlueArrow = true
  ): Promise<void> {
    console.log("🚀 Starting dash positioning diagnostic...");
    console.log("Pictograph:", pictographData.letter);
    console.log("Arrow color:", isBlueArrow ? "BLUE" : "RED");

    await debugger.runDashPositioningDiagnostic(pictographData, isBlueArrow);
  }

  /**
   * Debug both arrows for a pictograph
   */
  async function debugBothArrows(pictographData: PictographData): Promise<void> {
    console.log("🚀 Starting diagnostic for BOTH arrows...");

    console.log("\n" + "=".repeat(80));
    console.log("BLUE ARROW DIAGNOSTIC");
    console.log("=".repeat(80));
    await debugger.runDashPositioningDiagnostic(pictographData, true);

    console.log("\n" + "=".repeat(80));
    console.log("RED ARROW DIAGNOSTIC");
    console.log("=".repeat(80));
    await debugger.runDashPositioningDiagnostic(pictographData, false);
  }

  return {
    debugPictograph,
    debugBothArrows
  };
}

/**
 * Global window function for easy console debugging
 * Call from browser console: window.debugDashArrow(pictographData, true)
 */
if (typeof window !== 'undefined') {
  (window as any).debugDashArrow = async (pictographData: PictographData, isBlueArrow = true) => {
    const { debugPictograph } = useDashPositioningDebug();
    await debugPictograph(pictographData, isBlueArrow);
  };

  console.log("💡 Dash positioning debugger loaded!");
  console.log("   Call window.debugDashArrow(pictographData, true) to debug blue arrow");
  console.log("   Call window.debugDashArrow(pictographData, false) to debug red arrow");
}
