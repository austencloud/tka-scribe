/**
 * Sequence Restoration Validation Test
 *
 * This test validates that sequences can be perfectly restored from URLs
 * by comparing the original sequence data with the decoded sequence data.
 *
 * Key validation points:
 * - Motion data (type, locations, orientations, rotations, turns)
 * - Beat data (letter, word, beat number)
 * - Sequence metadata (name, length)
 * - Orientation recalculation accuracy
 */

import type { BeatData, SequenceData, MotionData } from "$shared";
import {
  encodeSequenceWithCompression,
  decodeSequenceWithCompression,
  generateShareURL,
  parseDeepLink
} from "./sequence-url-encoder";

/**
 * Comparison result for a single field
 */
interface FieldComparison {
  field: string;
  original: unknown;
  restored: unknown;
  matches: boolean;
}

/**
 * Detailed comparison result for a beat
 */
interface BeatComparison {
  beatNumber: number;
  matches: boolean;
  differences: FieldComparison[];
  blueMotion: MotionComparison;
  redMotion: MotionComparison;
}

/**
 * Detailed comparison result for a motion
 */
interface MotionComparison {
  color: "blue" | "red";
  matches: boolean;
  differences: FieldComparison[];
}

/**
 * Overall test result for a sequence
 */
export interface SequenceTestResult {
  sequenceName: string;
  url: string;
  urlLength: number;
  compressed: boolean;
  matches: boolean;
  beatResults: BeatComparison[];
  metadataMatches: boolean;
  metadataDifferences: FieldComparison[];
  summary: {
    totalBeats: number;
    matchingBeats: number;
    failedBeats: number;
    totalMotions: number;
    matchingMotions: number;
    failedMotions: number;
  };
}

/**
 * Compare two motion objects in detail
 */
function compareMotions(
  original: MotionData,
  restored: MotionData,
  color: "blue" | "red"
): MotionComparison {
  const differences: FieldComparison[] = [];

  // Fields to compare - these are the critical motion fields
  const fieldsToCompare = [
    "motionType",
    "startLocation",
    "endLocation",
    "startOrientation",
    "endOrientation",
    "rotationDirection",
    "turns",
    "propType",
    "isVisible",
  ] as const;

  for (const field of fieldsToCompare) {
    const originalValue = original[field];
    const restoredValue = restored[field];
    const matches = originalValue === restoredValue;

    if (!matches) {
      differences.push({
        field: `${color}.${field}`,
        original: originalValue,
        restored: restoredValue,
        matches: false,
      });
    }
  }

  return {
    color,
    matches: differences.length === 0,
    differences,
  };
}

/**
 * Compare two beats in detail
 */
function compareBeats(
  original: BeatData,
  restored: BeatData,
  beatNumber: number
): BeatComparison {
  const differences: FieldComparison[] = [];

  // Compare beat-level fields
  if (original.beatNumber !== restored.beatNumber) {
    differences.push({
      field: "beatNumber",
      original: original.beatNumber,
      restored: restored.beatNumber,
      matches: false,
    });
  }

  if (original.letter !== restored.letter) {
    differences.push({
      field: "letter",
      original: original.letter,
      restored: restored.letter,
      matches: false,
    });
  }

  // Compare motions
  const blueComparison = compareMotions(
    original.motions.blue!,
    restored.motions.blue!,
    "blue"
  );
  const redComparison = compareMotions(
    original.motions.red!,
    restored.motions.red!,
    "red"
  );

  return {
    beatNumber,
    matches: differences.length === 0 && blueComparison.matches && redComparison.matches,
    differences,
    blueMotion: blueComparison,
    redMotion: redComparison,
  };
}

/**
 * Compare two sequences in detail
 */
function compareSequences(
  original: SequenceData,
  restored: SequenceData
): SequenceTestResult {
  const metadataDifferences: FieldComparison[] = [];

  // Compare metadata
  if (original.name !== restored.name) {
    metadataDifferences.push({
      field: "name",
      original: original.name,
      restored: restored.name,
      matches: false,
    });
  }

  if (original.beats.length !== restored.beats.length) {
    metadataDifferences.push({
      field: "beats.length",
      original: original.beats.length,
      restored: restored.beats.length,
      matches: false,
    });
  }

  // Compare each beat
  const beatResults: BeatComparison[] = [];
  const maxBeats = Math.max(original.beats.length, restored.beats.length);

  for (let i = 0; i < maxBeats; i++) {
    if (i >= original.beats.length) {
      beatResults.push({
        beatNumber: i + 1,
        matches: false,
        differences: [
          {
            field: `beat[${i}]`,
            original: undefined,
            restored: restored.beats[i],
            matches: false,
          },
        ],
        blueMotion: { color: "blue", matches: false, differences: [] },
        redMotion: { color: "red", matches: false, differences: [] },
      });
    } else if (i >= restored.beats.length) {
      beatResults.push({
        beatNumber: i + 1,
        matches: false,
        differences: [
          {
            field: `beat[${i}]`,
            original: original.beats[i],
            restored: undefined,
            matches: false,
          },
        ],
        blueMotion: { color: "blue", matches: false, differences: [] },
        redMotion: { color: "red", matches: false, differences: [] },
      });
    } else {
      beatResults.push(compareBeats(original.beats[i]!, restored.beats[i]!, i + 1));
    }
  }

  // Calculate summary statistics
  const matchingBeats = beatResults.filter((r) => r.matches).length;
  const failedBeats = beatResults.filter((r) => !r.matches).length;
  const matchingMotions = beatResults.reduce(
    (sum, r) => sum + (r.blueMotion.matches ? 1 : 0) + (r.redMotion.matches ? 1 : 0),
    0
  );
  const totalMotions = beatResults.length * 2;
  const failedMotions = totalMotions - matchingMotions;

  // Generate URL for reference
  const urlResult = generateShareURL(original, "animate");
  const url = urlResult.url;

  return {
    sequenceName: original.name,
    url,
    urlLength: urlResult.length,
    compressed: urlResult.compressed,
    matches: metadataDifferences.length === 0 && failedBeats === 0,
    beatResults,
    metadataMatches: metadataDifferences.length === 0,
    metadataDifferences,
    summary: {
      totalBeats: beatResults.length,
      matchingBeats,
      failedBeats,
      totalMotions,
      matchingMotions,
      failedMotions,
    },
  };
}

/**
 * Test a single sequence for restoration accuracy
 */
export function testSequenceRestoration(sequence: SequenceData): SequenceTestResult {
  // Encode the sequence
  const { encoded: encodedString } = encodeSequenceWithCompression(sequence);

  // Decode it back
  const restoredSequence = decodeSequenceWithCompression(encodedString);

  // Compare the original and restored sequences
  return compareSequences(sequence, restoredSequence);
}

/**
 * Test URL parsing and restoration
 */
export function testURLRestoration(url: string, originalSequence: SequenceData): SequenceTestResult {
  // Parse the deep link
  const deepLink = parseDeepLink(url);

  if (!deepLink || !deepLink.sequence) {
    throw new Error(`Failed to parse URL: ${url}`);
  }

  // Compare the original and restored sequences
  return compareSequences(originalSequence, deepLink.sequence);
}

/**
 * Format test result as a readable report
 */
export function formatTestResult(result: SequenceTestResult): string {
  const lines: string[] = [];

  lines.push("=".repeat(80));
  lines.push(`Sequence: ${result.sequenceName}`);
  lines.push(`URL: ${result.url}`);
  lines.push(`URL Length: ${result.urlLength} chars (${result.compressed ? "compressed" : "uncompressed"})`);
  lines.push(`Overall Result: ${result.matches ? "✅ PASS" : "❌ FAIL"}`);
  lines.push("=".repeat(80));

  // Metadata section
  lines.push("\nMetadata:");
  lines.push(`  ${result.metadataMatches ? "✅" : "❌"} Metadata matches`);
  if (result.metadataDifferences.length > 0) {
    for (const diff of result.metadataDifferences) {
      lines.push(`    ❌ ${diff.field}: ${diff.original} → ${diff.restored}`);
    }
  }

  // Summary statistics
  lines.push("\nSummary:");
  lines.push(`  Total Beats: ${result.summary.totalBeats}`);
  lines.push(`  ✅ Matching Beats: ${result.summary.matchingBeats}`);
  lines.push(`  ❌ Failed Beats: ${result.summary.failedBeats}`);
  lines.push(`  Total Motions: ${result.summary.totalMotions}`);
  lines.push(`  ✅ Matching Motions: ${result.summary.matchingMotions}`);
  lines.push(`  ❌ Failed Motions: ${result.summary.failedMotions}`);

  // Beat-by-beat breakdown (only show failures for brevity)
  const failedBeats = result.beatResults.filter((r) => !r.matches);
  if (failedBeats.length > 0) {
    lines.push("\nFailed Beats:");
    for (const beat of failedBeats) {
      lines.push(`\n  Beat ${beat.beatNumber}:`);

      // Beat-level differences
      if (beat.differences.length > 0) {
        for (const diff of beat.differences) {
          lines.push(`    ❌ ${diff.field}: ${diff.original} → ${diff.restored}`);
        }
      }

      // Blue motion differences
      if (!beat.blueMotion.matches) {
        lines.push(`    Blue Motion:`);
        for (const diff of beat.blueMotion.differences) {
          lines.push(`      ❌ ${diff.field}: ${diff.original} → ${diff.restored}`);
        }
      }

      // Red motion differences
      if (!beat.redMotion.matches) {
        lines.push(`    Red Motion:`);
        for (const diff of beat.redMotion.differences) {
          lines.push(`      ❌ ${diff.field}: ${diff.original} → ${diff.restored}`);
        }
      }
    }
  }

  lines.push("\n" + "=".repeat(80));

  return lines.join("\n");
}

/**
 * Run tests on multiple sequences and generate a summary report
 */
export function testMultipleSequences(sequences: SequenceData[]): {
  results: SequenceTestResult[];
  passCount: number;
  failCount: number;
  totalTests: number;
  successRate: number;
} {
  const results = sequences.map((seq) => testSequenceRestoration(seq));

  const passCount = results.filter((r) => r.matches).length;
  const failCount = results.filter((r) => !r.matches).length;
  const totalTests = results.length;
  const successRate = totalTests > 0 ? (passCount / totalTests) * 100 : 0;

  return {
    results,
    passCount,
    failCount,
    totalTests,
    successRate,
  };
}

/**
 * Format multiple test results as a summary report
 */
export function formatMultipleTestResults(testResults: {
  results: SequenceTestResult[];
  passCount: number;
  failCount: number;
  totalTests: number;
  successRate: number;
}): string {
  const lines: string[] = [];

  lines.push("╔" + "═".repeat(78) + "╗");
  lines.push("║" + " ".repeat(20) + "SEQUENCE RESTORATION TEST SUITE" + " ".repeat(26) + "║");
  lines.push("╚" + "═".repeat(78) + "╝");
  lines.push("");

  lines.push("Summary:");
  lines.push(`  Total Tests: ${testResults.totalTests}`);
  lines.push(`  ✅ Passed: ${testResults.passCount}`);
  lines.push(`  ❌ Failed: ${testResults.failCount}`);
  lines.push(`  Success Rate: ${testResults.successRate.toFixed(2)}%`);
  lines.push("");

  // Show each test result
  for (let i = 0; i < testResults.results.length; i++) {
    const result = testResults.results[i]!;
    lines.push(`Test ${i + 1}/${testResults.totalTests}: ${result.sequenceName}`);
    lines.push(`  Result: ${result.matches ? "✅ PASS" : "❌ FAIL"}`);
    lines.push(`  URL Length: ${result.urlLength} chars (${result.compressed ? "compressed" : "uncompressed"})`);

    if (!result.matches) {
      lines.push(`  Failed Beats: ${result.summary.failedBeats}/${result.summary.totalBeats}`);
      lines.push(`  Failed Motions: ${result.summary.failedMotions}/${result.summary.totalMotions}`);
    }

    lines.push("");
  }

  // Show detailed breakdown for failures
  const failures = testResults.results.filter((r) => !r.matches);
  if (failures.length > 0) {
    lines.push("═".repeat(80));
    lines.push("DETAILED FAILURE REPORTS:");
    lines.push("═".repeat(80));
    lines.push("");

    for (const failure of failures) {
      lines.push(formatTestResult(failure));
      lines.push("");
    }
  }

  return lines.join("\n");
}
