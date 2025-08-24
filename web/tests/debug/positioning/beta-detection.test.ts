/**
 * Test Beta Detection System
 *
 * This script tests the new beta detection approach to verify it works correctly.
 */

import { GridPosition } from "$lib/domain/enums";
import { Letter } from "$lib/domain/Letter";
import type { PictographData } from "$lib/domain/PictographData";
import { endsWithBeta, isBetaPosition } from "$lib/utils/betaDetection";

// Test the beta detection utilities
console.log("🧪 Testing Beta Detection System");
console.log("================================");

// Test isBetaPosition function
console.log("\n📍 Testing isBetaPosition:");
console.log("BETA1 is beta:", isBetaPosition(GridPosition.BETA1)); // Should be true
console.log("ALPHA1 is beta:", isBetaPosition(GridPosition.ALPHA1)); // Should be false
console.log("GAMMA1 is beta:", isBetaPosition(GridPosition.GAMMA1)); // Should be false
console.log("'beta3' string is beta:", isBetaPosition("beta3")); // Should be true
console.log("'alpha5' string is beta:", isBetaPosition("alpha5")); // Should be false

// Test endsWithBeta function
console.log("\n🎯 Testing endsWithBeta:");

// Mock pictograph data that ends with beta
const betaPictograph: Partial<PictographData> = {
  letter: Letter.A, // Use Letter enum
  startPosition: GridPosition.ALPHA1,
  endPosition: GridPosition.BETA3, // This is a beta position
};

// Mock pictograph data that doesn't end with beta
const nonBetaPictograph: Partial<PictographData> = {
  letter: Letter.B, // Use Letter enum
  startPosition: GridPosition.ALPHA1,
  endPosition: GridPosition.GAMMA5, // This is NOT a beta position
};

console.log(
  "Beta pictograph ends with beta:",
  endsWithBeta(betaPictograph as PictographData)
); // Should be true
console.log(
  "Non-beta pictograph ends with beta:",
  endsWithBeta(nonBetaPictograph as PictographData)
); // Should be false

console.log("\n✅ Beta detection tests completed!");
console.log(
  "\n💡 Key insight: Beta detection now works by checking if endPosition starts with 'beta'"
);
console.log(
  "   This is much more reliable than checking metadata or motion patterns!"
);
