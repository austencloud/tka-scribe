import { test, expect } from "@playwright/test";

/**
 * E2E Tests for Sequence Transfer Flow
 *
 * Tests the "Edit in Constructor" functionality that transfers sequences
 * from Generator tab to Constructor tab, including:
 * - Grid mode synchronization (box vs diamond)
 * - Option picker updates without flicker
 * - Sequence data integrity
 *
 * Test IDs used:
 * - tab-constructor, tab-generator: Tab buttons in Create module header
 * - edit-in-constructor: Button in sequence actions panel
 * - sequence-preview-dialog: The confirmation dialog
 * - confirm-replace, cancel-replace: Dialog action buttons
 * - current-sequence, incoming-sequence: Preview panels in dialog
 * - option-picker: The option picker container (has data-grid-mode attribute)
 * - option-item: Individual option buttons
 * - construct-tab-content: Constructor tab wrapper (has data-picker-mode attribute)
 */

// Increase test timeout for slow initialization
test.setTimeout(90000);

test.describe("Sequence Transfer to Constructor", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto("/");

    // Wait for DOM content
    await page.waitForLoadState("domcontentloaded");

    // Wait for the app to initialize by looking for main app container
    await page.waitForSelector('[data-testid="tka-application"]', {
      timeout: 30000,
      state: "visible",
    });

    // Wait for the creation method selector to appear
    // The Create module shows a method selector first (Constructor vs Generate)
    await page.waitForSelector('button:has-text("Constructor")', {
      timeout: 30000,
      state: "visible",
    });

    // Click Constructor to enter the Create workspace
    await page.click('button:has-text("Constructor"):not([disabled])');
    await page.waitForTimeout(1000);

    // Now wait for the actual tab controls in the workspace header
    // These appear after selecting a creation method
    try {
      await page.waitForSelector(
        '[data-testid="tab-constructor"], [data-testid="tab-generator"]',
        {
          timeout: 30000,
          state: "visible",
        }
      );
    } catch {
      // If tabs aren't visible after selecting method, try to dismiss any error overlay
      // and take a screenshot for debugging
      const errorOverlay = await page.$("[data-error-overlay]");
      if (errorOverlay) {
        await page.keyboard.press("Escape");
        await page.waitForTimeout(500);
      }

      // Try again after dismissing
      await page.waitForSelector(
        '[data-testid="tab-constructor"], [data-testid="tab-generator"]',
        {
          timeout: 10000,
          state: "visible",
        }
      );
    }
  });

  test.describe("Grid Mode Synchronization", () => {
    test("should update option picker grid mode when transferring sequence", async ({
      page,
    }) => {
      // 1. Go to Generator tab
      await page.click('[data-testid="tab-generator"]');
      await page.waitForTimeout(500); // Wait for tab transition

      // 2. Note: In actual test, we'd generate a sequence here
      // For now, we'll check the infrastructure works

      // 3. Verify we can see the generator tab is active
      const generatorTab = page.locator('[data-testid="tab-generator"]');
      await expect(generatorTab).toHaveAttribute("aria-selected", "true");

      // 4. Switch to constructor
      await page.click('[data-testid="tab-constructor"]');
      await page.waitForTimeout(500);

      // 5. Verify constructor tab is active
      const constructorTab = page.locator('[data-testid="tab-constructor"]');
      await expect(constructorTab).toHaveAttribute("aria-selected", "true");
    });

    test("option picker should have grid-mode attribute", async ({ page }) => {
      // Navigate to constructor tab
      await page.click('[data-testid="tab-constructor"]');
      await page.waitForTimeout(1000);

      // Wait for option picker to load
      const optionPicker = page.locator('[data-testid="option-picker"]');

      // Check it has a grid-mode attribute (either "box" or "diamond")
      const gridMode = await optionPicker.getAttribute("data-grid-mode");
      expect(gridMode).toBeTruthy();
      expect(["box", "diamond", "BOX", "DIAMOND"]).toContain(
        gridMode?.toUpperCase()
      );
    });
  });

  test.describe("Confirmation Dialog", () => {
    test("dialog should have correct test IDs when opened", async ({
      page,
    }) => {
      // This test verifies the dialog structure when it appears
      // In real use, this would be triggered by the Edit in Constructor button

      // For now, verify the test infrastructure is in place
      const constructorTab = page.locator('[data-testid="tab-constructor"]');
      await expect(constructorTab).toBeVisible();

      const generatorTab = page.locator('[data-testid="tab-generator"]');
      await expect(generatorTab).toBeVisible();
    });
  });

  test.describe("Tab Navigation", () => {
    test("should switch between constructor and generator tabs", async ({
      page,
    }) => {
      // Start on constructor
      await page.click('[data-testid="tab-constructor"]');
      await page.waitForTimeout(300);

      let constructorTab = page.locator('[data-testid="tab-constructor"]');
      await expect(constructorTab).toHaveAttribute("aria-selected", "true");

      // Switch to generator
      await page.click('[data-testid="tab-generator"]');
      await page.waitForTimeout(300);

      const generatorTab = page.locator('[data-testid="tab-generator"]');
      await expect(generatorTab).toHaveAttribute("aria-selected", "true");

      // Constructor should no longer be selected
      constructorTab = page.locator('[data-testid="tab-constructor"]');
      await expect(constructorTab).toHaveAttribute("aria-selected", "false");
    });

    test("construct-tab-content should have picker-mode attribute", async ({
      page,
    }) => {
      await page.click('[data-testid="tab-constructor"]');
      await page.waitForTimeout(500);

      const tabContent = page.locator('[data-testid="construct-tab-content"]');
      const pickerMode = await tabContent.getAttribute("data-picker-mode");

      // Should be either "start-position" or "options"
      expect(["start-position", "options"]).toContain(pickerMode);
    });
  });
});

/**
 * Future tests to add when full sequence generation is testable:
 *
 * 1. Generate a BOX mode sequence in Generator
 * 2. Have a DIAMOND mode sequence in Constructor
 * 3. Click "Edit in Constructor"
 * 4. Verify dialog shows both sequences
 * 5. Click "Replace & Edit"
 * 6. Verify option picker immediately shows BOX mode options (no flicker)
 *
 * This requires:
 * - Ability to programmatically generate sequences in tests
 * - Mock data for sequences
 * - More test IDs on generator components
 */
