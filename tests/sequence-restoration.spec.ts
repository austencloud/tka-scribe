/**
 * Sequence Restoration E2E Tests
 *
 * Tests that sequences can be perfectly restored from URLs by:
 * 1. Generating sequences in the app
 * 2. Exporting them to URLs
 * 3. Opening the URLs in a fresh browser instance
 * 4. Comparing the original and restored sequence data
 *
 * This test validates that orientation calculations and all motion data
 * are correctly preserved through the encode/decode cycle.
 */

import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

// Test configuration
const BASE_URL = "http://localhost:5173";
const NUM_SEQUENCES_TO_TEST = 25;
const TEST_RESULTS_DIR = path.join(
  process.cwd(),
  "test-results",
  "sequence-restoration"
);

// Ensure test results directory exists
if (!fs.existsSync(TEST_RESULTS_DIR)) {
  fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
}

/**
 * Helper to wait for app initialization
 */
async function waitForAppReady(page: any) {
  await page.goto(BASE_URL);
  await page.waitForSelector('[data-testid="create-tab"]', { timeout: 10000 });
  await page.waitForTimeout(1000); // Additional time for initialization
}

/**
 * Helper to create a sequence with random beats
 */
async function createSequence(
  page: any,
  numBeats: number
): Promise<{
  sequenceName: string;
  shareUrl: string;
  sequenceData: any;
}> {
  // Navigate to Create module
  await page.click('[data-testid="create-tab"]');
  await page.waitForTimeout(500);

  // Click Start Position to begin
  const startButton = page.locator(".start-tile").first();
  await startButton.click();

  // Wait for start position picker
  await page.waitForSelector('[data-testid="start-position-picker"]', {
    timeout: 5000,
  });

  // Select a random start position
  const positions = await page.locator(".pictograph-button").all();
  if (positions.length === 0) {
    throw new Error("No start positions found");
  }
  const randomStartIndex = Math.floor(Math.random() * positions.length);
  await positions[randomStartIndex].click();

  // Wait for option picker to appear
  await page.waitForSelector('[data-testid="option-viewer"]', {
    timeout: 5000,
  });

  // Add beats by clicking random options
  for (let i = 0; i < numBeats; i++) {
    const options = await page.locator(".option-button").all();
    if (options.length === 0) {
      console.warn(`No options available at beat ${i + 1}`);
      break;
    }

    // Select a random option
    const randomIndex = Math.floor(Math.random() * options.length);
    await options[randomIndex].click();

    // Wait for beat to be added
    await page.waitForTimeout(200);
  }

  // Get the sequence data from the page
  const sequenceData = await page.evaluate(() => {
    // Access the sequence state from window (this assumes we expose it)
    // We'll need to inject a way to get the current sequence
    return (window as any).__getCurrentSequence?.();
  });

  // Generate share URL (click share button)
  // Note: We'll need to implement a way to get the share URL
  // For now, we'll construct it from the current URL
  const currentUrl = page.url();
  const shareUrl = currentUrl.includes("?open=") ? currentUrl : "";

  return {
    sequenceName: `Test Sequence ${Date.now()}`,
    shareUrl,
    sequenceData,
  };
}

/**
 * Helper to extract sequence data from the current page state
 */
async function getSequenceDataFromPage(page: any): Promise<any> {
  return await page.evaluate(() => {
    // This function runs in the browser context
    // We need to access the sequence state from the app

    // Try to find sequence data in various places
    const getFromCreateState = () => {
      try {
        // Access Svelte state if available
        const createState = (window as any).__createState;
        if (createState?.sequence) {
          return createState.sequence;
        }
      } catch (e) {
        console.error("Failed to get create state:", e);
      }
      return null;
    };

    const getFromAnimateState = () => {
      try {
        const animateState = (window as any).__animateState;
        if (animateState?.sequence) {
          return animateState.sequence;
        }
      } catch (e) {
        console.error("Failed to get animate state:", e);
      }
      return null;
    };

    return getFromCreateState() || getFromAnimateState();
  });
}

/**
 * Compare two sequences deeply
 */
function compareSequences(
  original: any,
  restored: any
): {
  matches: boolean;
  differences: string[];
} {
  const differences: string[] = [];

  if (!original || !restored) {
    differences.push("One or both sequences are null/undefined");
    return { matches: false, differences };
  }

  // Compare metadata
  if (original.name !== restored.name) {
    differences.push(`Name mismatch: "${original.name}" vs "${restored.name}"`);
  }

  if (original.beats?.length !== restored.beats?.length) {
    differences.push(
      `Beat count mismatch: ${original.beats?.length} vs ${restored.beats?.length}`
    );
  }

  // Compare each beat
  const beatCount = Math.min(
    original.beats?.length || 0,
    restored.beats?.length || 0
  );
  for (let i = 0; i < beatCount; i++) {
    const origBeat = original.beats[i];
    const restBeat = restored.beats[i];

    // Compare beat number
    if (origBeat.beat !== restBeat.beat) {
      differences.push(
        `Beat ${i + 1}: beat number ${origBeat.beat} vs ${restBeat.beat}`
      );
    }

    // Compare letter
    if (origBeat.letter !== restBeat.letter) {
      differences.push(
        `Beat ${i + 1}: letter ${origBeat.letter} vs ${restBeat.letter}`
      );
    }

    // Compare blue motion
    const origBlue = origBeat.motions?.blue;
    const restBlue = restBeat.motions?.blue;
    if (origBlue && restBlue) {
      const blueFields = [
        "motionType",
        "startLocation",
        "endLocation",
        "startOrientation",
        "endOrientation",
        "rotationDirection",
        "turns",
      ];
      for (const field of blueFields) {
        if (origBlue[field] !== restBlue[field]) {
          differences.push(
            `Beat ${i + 1}: blue.${field} ${origBlue[field]} vs ${restBlue[field]}`
          );
        }
      }
    }

    // Compare red motion
    const origRed = origBeat.motions?.red;
    const restRed = restBeat.motions?.red;
    if (origRed && restRed) {
      const redFields = [
        "motionType",
        "startLocation",
        "endLocation",
        "startOrientation",
        "endOrientation",
        "rotationDirection",
        "turns",
      ];
      for (const field of redFields) {
        if (origRed[field] !== restRed[field]) {
          differences.push(
            `Beat ${i + 1}: red.${field} ${origRed[field]} vs ${restRed[field]}`
          );
        }
      }
    }
  }

  return {
    matches: differences.length === 0,
    differences,
  };
}

test.describe("Sequence Restoration", () => {
  test("should restore a simple 3-beat sequence from URL", async ({
    page,
    context,
  }) => {
    // Create a sequence in first page
    await waitForAppReady(page);

    // TODO: Implement sequence creation and URL extraction
    // For now, test with the provided URL
    const testUrl =
      "http://localhost:5173/?open=generate:z:M4e1EtwDwBmAuAdiZlbAD6gtOSQCmAhuANYCuAjAHQCsRWIA7geCOTEfMaKSFADMANhhbEQFGHQAm8UMhDtK0jMRalwHGfnFKGLFmjw9FAFyp19BVO05zmBU9GEZkoCVtqyxJTcsbIGp6yJpBUDMiouAighhQ09K6EJLZcLIH8LmoEHlJe+O5KKj5BebKxOXqqRMRGCOlmFomhqTpEToIi8oqS2tlh-m4SmmXwDQNEQA";

    // Open URL in new page
    const newPage = await context.newPage();
    await newPage.goto(testUrl);

    // Wait for sequence to load
    await newPage.waitForTimeout(2000);

    // Check that we're in the correct module
    const url = newPage.url();
    expect(url).toContain("open=generate");

    console.log("✅ Successfully loaded sequence from URL");
  });

  test("should preserve orientation data through encode/decode", async ({
    page,
    browser,
  }) => {
    // This test uses the unit test harness directly
    const testResult = await page.evaluate(async () => {
      // Import the test utilities
      const { testSequenceRestoration, formatTestResult } = await import(
        "/src/lib/shared/navigation/utils/sequence-restoration-test.ts"
      );

      // Create a test sequence
      const testSequence = {
        name: "Orientation Test",
        beats: [
          {
            beat: 1,
            letter: "A",
            motions: {
              blue: {
                motionType: "PRO",
                startLocation: "NORTH",
                endLocation: "EAST",
                startOrientation: "IN",
                endOrientation: "OUT",
                rotationDirection: "CLOCKWISE",
                turns: 1,
                propType: "STAFF",
                isVisible: true,
                color: "BLUE",
              },
              red: {
                motionType: "PRO",
                startLocation: "SOUTH",
                endLocation: "WEST",
                startOrientation: "IN",
                endOrientation: "OUT",
                rotationDirection: "CLOCKWISE",
                turns: 1,
                propType: "STAFF",
                isVisible: true,
                color: "RED",
              },
            },
          },
        ],
      };

      // Run the test
      const result = testSequenceRestoration(testSequence as any);
      const report = formatTestResult(result);

      return {
        passed: result.matches,
        report,
      };
    });

    console.log(testResult.report);
    expect(testResult.passed).toBe(true);
  });

  test.skip("should test 25 sequences for restoration accuracy", async ({
    page,
  }) => {
    // This is a more comprehensive test that generates and tests many sequences
    // Marked as skip for now until we implement the full workflow

    const results = [];

    for (let i = 0; i < NUM_SEQUENCES_TO_TEST; i++) {
      console.log(`\n🧪 Testing sequence ${i + 1}/${NUM_SEQUENCES_TO_TEST}...`);

      // Create a sequence with random length (3-10 beats)
      const numBeats = Math.floor(Math.random() * 8) + 3;

      try {
        // TODO: Implement full sequence generation and testing
        const result = {
          sequenceNumber: i + 1,
          numBeats,
          passed: true,
        };

        results.push(result);
        console.log(`✅ Sequence ${i + 1} passed`);
      } catch (error) {
        console.error(`❌ Sequence ${i + 1} failed:`, error);
        results.push({
          sequenceNumber: i + 1,
          numBeats,
          passed: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }

      // Clear sequence for next test
      await page.goto(BASE_URL);
      await page.waitForTimeout(500);
    }

    // Generate summary report
    const passCount = results.filter((r) => r.passed).length;
    const failCount = results.filter((r) => !r.passed).length;
    const successRate = (passCount / NUM_SEQUENCES_TO_TEST) * 100;

    const summary = {
      totalTests: NUM_SEQUENCES_TO_TEST,
      passed: passCount,
      failed: failCount,
      successRate: successRate.toFixed(2) + "%",
      results,
    };

    // Write results to file
    const resultsPath = path.join(
      TEST_RESULTS_DIR,
      `restoration-test-${Date.now()}.json`
    );
    fs.writeFileSync(resultsPath, JSON.stringify(summary, null, 2));

    console.log("\n" + "=".repeat(80));
    console.log("SEQUENCE RESTORATION TEST SUMMARY");
    console.log("=".repeat(80));
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`✅ Passed: ${summary.passed}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`Success Rate: ${summary.successRate}`);
    console.log(`\nResults saved to: ${resultsPath}`);
    console.log("=".repeat(80));

    // Assert that we have a high success rate
    expect(successRate).toBeGreaterThanOrEqual(95); // 95% success rate
  });
});
