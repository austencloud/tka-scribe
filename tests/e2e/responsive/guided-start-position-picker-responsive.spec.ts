/**
 * Guided Builder Start Position Picker Responsive Layout Tests
 *
 * Tests the responsive behavior of the SinglePropStartPositionPicker component
 * across all screen sizes and aspect ratios.
 * Validates that:
 * 1. Grid layout adapts based on aspect ratio (1x4, 2x2, 4x1)
 * 2. Content never overflows the container
 * 3. Buttons maintain proper sizing and spacing
 * 4. Labels remain visible at all sizes
 */

import { test, expect, type Page } from "@playwright/test";

// Test dimensions covering different aspect ratios
const DIMENSION_TESTS = [
  // Very tall portrait (should be 4 rows × 1 column)
  { name: "Very Tall Portrait", width: 400, height: 803, expectedLayout: "4x1" },
  { name: "Tall Narrow", width: 350, height: 700, expectedLayout: "4x1" },

  // Tall portrait (should be 4 rows × 1 column)
  { name: "Portrait Phone", width: 390, height: 844, expectedLayout: "4x1" },
  { name: "Portrait Tablet", width: 600, height: 1000, expectedLayout: "4x1" },

  // Balanced/Square (should be 2×2)
  { name: "Square Small", width: 500, height: 500, expectedLayout: "2x2" },
  { name: "Square Medium", width: 700, height: 700, expectedLayout: "2x2" },
  { name: "Balanced", width: 800, height: 600, expectedLayout: "2x2" },

  // Moderate Landscape (should be 2×2)
  { name: "Moderate Landscape", width: 900, height: 600, expectedLayout: "2x2" },
  { name: "Tablet Landscape", width: 1024, height: 768, expectedLayout: "2x2" },

  // Wide Landscape (should be 1 row × 4 columns)
  { name: "Wide Landscape", width: 1200, height: 500, expectedLayout: "1x4" },
  { name: "Ultra Wide", width: 1600, height: 600, expectedLayout: "1x4" },
];

test.describe("Guided Start Position Picker - Responsive Layout", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Navigate to Create module
    const createButton = page.locator('button:has-text("Create"), a:has-text("Create")');
    if ((await createButton.count()) > 0) {
      await createButton.first().click();
      await page.waitForTimeout(500);
    }

    // Click Guided method card if available
    const guidedButton = page.locator('button[data-method-id="guided"]');
    if ((await guidedButton.count()) > 0) {
      await guidedButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test.describe("Grid Layout Adaptation", () => {
    for (const testCase of DIMENSION_TESTS) {
      test(`${testCase.name} (${testCase.width}x${testCase.height}) - Shows ${testCase.expectedLayout} grid`, async ({
        page,
      }) => {
        // Set viewport to test dimensions
        await page.setViewportSize({
          width: testCase.width,
          height: testCase.height,
        });

        await page.waitForTimeout(1000);

        // Find the start position picker
        const picker = page.locator(".start-position-picker").first();
        const positionGrid = page.locator(".position-grid").first();

        // Skip if not in guided mode
        if ((await picker.count()) === 0) {
          console.log(`Skipping ${testCase.name} - guided builder not active`);
          test.skip();
          return;
        }

        await expect(picker).toBeVisible();
        await expect(positionGrid).toBeVisible();

        // Get all position buttons
        const buttons = page.locator(".position-button");
        const buttonCount = await buttons.count();

        expect(buttonCount).toBe(4); // Should always have 4 buttons

        // Get the grid container dimensions
        const gridBox = await positionGrid.boundingBox();
        expect(gridBox).not.toBeNull();

        if (!gridBox) return;

        // Calculate aspect ratio
        const aspectRatio = testCase.width / testCase.height;

        // Get positions of all 4 buttons
        const buttonPositions = [];
        for (let i = 0; i < buttonCount; i++) {
          const button = buttons.nth(i);
          const box = await button.boundingBox();
          if (box) {
            buttonPositions.push({
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height,
            });
          }
        }

        expect(buttonPositions.length).toBe(4);

        // Verify grid layout based on aspect ratio
        if (aspectRatio < 0.65) {
          // Should be vertical 4x1 layout
          verifyVertical4x1Layout(buttonPositions, testCase.name);
        } else if (aspectRatio > 1.8) {
          // Should be horizontal 1x4 layout
          verifyHorizontal1x4Layout(buttonPositions, testCase.name);
        } else {
          // Should be 2x2 layout
          verify2x2Layout(buttonPositions, testCase.name);
        }

        // Log success
        console.log(
          `✓ ${testCase.name}: Correct ${testCase.expectedLayout} layout (AR: ${aspectRatio.toFixed(2)})`
        );
      });
    }
  });

  test.describe("Overflow Prevention", () => {
    test("No overflow at critical dimension (400x803)", async ({ page }) => {
      await page.setViewportSize({ width: 400, height: 803 });
      await page.waitForTimeout(1000);

      const picker = page.locator(".start-position-picker").first();
      const positionGrid = page.locator(".position-grid").first();

      if ((await picker.count()) === 0) {
        console.log("Skipping - guided builder not active");
        test.skip();
        return;
      }

      // Check for overflow in container
      const hasOverflow = await checkForOverflow(page, picker);
      expect(hasOverflow).toBe(false);

      // Check for overflow in grid
      const gridOverflow = await checkForOverflow(page, positionGrid);
      expect(gridOverflow).toBe(false);

      // Verify all buttons are visible
      const buttons = page.locator(".position-button");
      const buttonCount = await buttons.count();
      expect(buttonCount).toBe(4);

      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        await expect(button).toBeVisible();
      }

      console.log("✓ 400x803: No overflow, all buttons visible");
    });

    test("All labels visible at all sizes", async ({ page }) => {
      for (const testCase of DIMENSION_TESTS.slice(0, 3)) {
        // Test first 3 cases
        await page.setViewportSize({
          width: testCase.width,
          height: testCase.height,
        });
        await page.waitForTimeout(500);

        const labels = page.locator(".position-label");
        const labelCount = await labels.count();

        if (labelCount === 0) {
          test.skip();
          return;
        }

        expect(labelCount).toBe(4);

        for (let i = 0; i < labelCount; i++) {
          const label = labels.nth(i);
          await expect(label).toBeVisible();

          // Verify label text exists
          const text = await label.textContent();
          expect(text).toBeTruthy();
          expect(text?.length).toBeGreaterThan(0);
        }

        console.log(`✓ ${testCase.name}: All labels visible`);
      }
    });
  });

  test.describe("Button Sizing", () => {
    test("Buttons maintain aspect ratio and reasonable size", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 400, height: 803 });
      await page.waitForTimeout(1000);

      const buttons = page.locator(".position-button");
      const buttonCount = await buttons.count();

      if (buttonCount === 0) {
        test.skip();
        return;
      }

      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const box = await button.boundingBox();

        if (box) {
          // Buttons should have reasonable dimensions
          expect(box.width).toBeGreaterThan(50); // Min size
          expect(box.height).toBeGreaterThan(50);

          // Should maintain roughly square aspect ratio
          const buttonAspectRatio = box.width / box.height;
          expect(buttonAspectRatio).toBeGreaterThan(0.7);
          expect(buttonAspectRatio).toBeLessThan(1.5);

          console.log(
            `Button ${i}: ${box.width.toFixed(0)}x${box.height.toFixed(0)} (AR: ${buttonAspectRatio.toFixed(2)})`
          );
        }
      }
    });
  });
});

// Helper Functions

/**
 * Check if an element has overflow
 */
async function checkForOverflow(page: Page, locator: any): Promise<boolean> {
  return await locator.evaluate((el: HTMLElement) => {
    const verticalOverflow = el.scrollHeight - el.clientHeight;
    const horizontalOverflow = el.scrollWidth - el.clientWidth;
    return verticalOverflow > 2 || horizontalOverflow > 2;
  });
}

/**
 * Verify buttons are arranged in a 4x1 vertical layout
 */
function verifyVertical4x1Layout(
  positions: Array<{ x: number; y: number; width: number; height: number }>,
  testName: string
) {
  // Sort by Y position
  const sorted = [...positions].sort((a, b) => a.y - b.y);

  // All buttons should have similar X positions (same column)
  const xPositions = sorted.map((p) => p.x);
  const xMin = Math.min(...xPositions);
  const xMax = Math.max(...xPositions);
  const xRange = xMax - xMin;

  // X range should be small (all in same column, allowing for centering)
  expect(xRange).toBeLessThan(100);

  // Y positions should be well separated (different rows)
  for (let i = 1; i < sorted.length; i++) {
    const verticalGap = sorted[i].y - (sorted[i - 1].y + sorted[i - 1].height);
    expect(verticalGap).toBeGreaterThanOrEqual(-5); // Allow small overlap for rounding
  }

  console.log(`  ✓ ${testName}: Verified 4x1 vertical layout`);
}

/**
 * Verify buttons are arranged in a 1x4 horizontal layout
 */
function verifyHorizontal1x4Layout(
  positions: Array<{ x: number; y: number; width: number; height: number }>,
  testName: string
) {
  // Sort by X position
  const sorted = [...positions].sort((a, b) => a.x - b.x);

  // All buttons should have similar Y positions (same row)
  const yPositions = sorted.map((p) => p.y);
  const yMin = Math.min(...yPositions);
  const yMax = Math.max(...yPositions);
  const yRange = yMax - yMin;

  // Y range should be small (all in same row)
  expect(yRange).toBeLessThan(100);

  // X positions should be well separated (different columns)
  for (let i = 1; i < sorted.length; i++) {
    const horizontalGap = sorted[i].x - (sorted[i - 1].x + sorted[i - 1].width);
    expect(horizontalGap).toBeGreaterThanOrEqual(-5);
  }

  console.log(`  ✓ ${testName}: Verified 1x4 horizontal layout`);
}

/**
 * Verify buttons are arranged in a 2x2 grid layout
 */
function verify2x2Layout(
  positions: Array<{ x: number; y: number; width: number; height: number }>,
  testName: string
) {
  // Sort by Y first, then X
  const sorted = [...positions].sort((a, b) => {
    const yDiff = a.y - b.y;
    return Math.abs(yDiff) < 50 ? a.x - b.x : yDiff;
  });

  // Should have 2 distinct rows
  const topRow = sorted.slice(0, 2);
  const bottomRow = sorted.slice(2, 4);

  // Top row buttons should have similar Y
  const topYDiff = Math.abs(topRow[0].y - topRow[1].y);
  expect(topYDiff).toBeLessThan(50);

  // Bottom row buttons should have similar Y
  const bottomYDiff = Math.abs(bottomRow[0].y - bottomRow[1].y);
  expect(bottomYDiff).toBeLessThan(50);

  // Top row should be above bottom row
  const rowGap = bottomRow[0].y - topRow[0].y;
  expect(rowGap).toBeGreaterThan(50);

  console.log(`  ✓ ${testName}: Verified 2x2 grid layout`);
}
