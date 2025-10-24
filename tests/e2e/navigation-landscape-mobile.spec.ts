import { expect, test } from "@playwright/test";

/**
 * Test suite for landscape mobile navigation layout
 * Tests the navigation bar switching from top to left based on viewport height
 *
 * Key insight: Landscape mobile is detected by LIMITED VERTICAL SPACE, not width
 * - When a phone is rotated sideways, height becomes < 500px
 * - Desktop windows can replicate this by being resized to short height
 */

// Z Fold 5 front screen dimensions when closed and held sideways
const Z_FOLD_LANDSCAPE = {
  width: 904, // Wide
  height: 344, // SHORT - triggers left nav
};

// iPhone 14 Pro Max landscape dimensions
const IPHONE_14_PRO_MAX_LANDSCAPE = {
  width: 932, // Wide
  height: 430, // SHORT - triggers left nav
};

// Standard phone landscape (smaller)
const STANDARD_PHONE_LANDSCAPE = {
  width: 844, // Wide
  height: 390, // SHORT - triggers left nav
};

// Tablet landscape (should NOT trigger left nav due to height)
const TABLET_LANDSCAPE = {
  width: 1024,
  height: 768, // TALL - keeps top nav
};

// Desktop window with short height (for testing)
const DESKTOP_SHORT_LANDSCAPE = {
  width: 1200, // Desktop width
  height: 450, // SHORT - triggers left nav for testing
};

test.describe("Navigation Layout - Landscape Mobile Detection", () => {
  test("should show left navigation on Z Fold 5 landscape", async ({
    page,
  }) => {
    // Set viewport to Z Fold 5 front screen landscape dimensions
    await page.setViewportSize(Z_FOLD_LANDSCAPE);

    // Navigate to the app
    await page.goto("/");

    // Wait for navigation bar to load
    await page.waitForSelector(".app-navigation-bar", { timeout: 5000 });

    // Check that navigation has left layout class
    const nav = page.locator(".app-navigation-bar");
    await expect(nav).toHaveClass(/layout-left/);

    // Verify navigation is positioned on the left
    const navBox = await nav.boundingBox();
    expect(navBox?.x).toBe(0); // Should be at left edge
    expect(navBox?.width).toBeLessThanOrEqual(72); // Should be narrow

    // Check that main interface has left layout adjustment
    const mainInterface = page.locator(".main-interface");
    await expect(mainInterface).toHaveClass(/layout-left/);

    // Verify tabs show only icons (no labels in left layout)
    const tabLabels = page.locator(".nav-tab .tab-label");
    const labelCount = await tabLabels.count();

    if (labelCount > 0) {
      // Check that labels are hidden (not visible)
      const firstLabel = tabLabels.first();
      await expect(firstLabel).not.toBeVisible();
    }

    console.log("✅ Z Fold 5 landscape: Left navigation working correctly");
  });

  test("should show left navigation on iPhone 14 Pro Max landscape", async ({
    page,
  }) => {
    await page.setViewportSize(IPHONE_14_PRO_MAX_LANDSCAPE);
    await page.goto("/");

    await page.waitForSelector(".app-navigation-bar");

    const nav = page.locator(".app-navigation-bar");
    await expect(nav).toHaveClass(/layout-left/);

    console.log("✅ iPhone 14 Pro Max landscape: Left navigation detected");
  });

  test("should show left navigation on standard phone landscape", async ({
    page,
  }) => {
    await page.setViewportSize(STANDARD_PHONE_LANDSCAPE);
    await page.goto("/");

    await page.waitForSelector(".app-navigation-bar");

    const nav = page.locator(".app-navigation-bar");
    await expect(nav).toHaveClass(/layout-left/);

    console.log("✅ Standard phone landscape: Left navigation detected");
  });

  test("should show TOP navigation on tablet landscape", async ({ page }) => {
    await page.setViewportSize(TABLET_LANDSCAPE);
    await page.goto("/");

    await page.waitForSelector(".app-navigation-bar");

    const nav = page.locator(".app-navigation-bar");
    await expect(nav).toHaveClass(/layout-top/);
    await expect(nav).not.toHaveClass(/layout-left/);

    console.log("✅ Tablet landscape: Top navigation (sufficient height)");
  });

  test("should show LEFT navigation on desktop with short height", async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP_SHORT_LANDSCAPE);
    await page.goto("/");

    await page.waitForSelector(".app-navigation-bar");

    const nav = page.locator(".app-navigation-bar");
    await expect(nav).toHaveClass(/layout-left/);

    console.log(
      "✅ Desktop short landscape: Left navigation (height < 500px triggers layout)"
    );
  });

  test("should toggle between layouts on viewport resize", async ({ page }) => {
    // Start with portrait
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.waitForSelector(".app-navigation-bar");

    // Should be top layout in portrait
    const nav = page.locator(".app-navigation-bar");
    await expect(nav).toHaveClass(/layout-top/);

    console.log("✅ Portrait mode: Top navigation");

    // Rotate to landscape (simulate phone rotation)
    await page.setViewportSize(STANDARD_PHONE_LANDSCAPE);

    // Wait a bit for resize detection
    await page.waitForTimeout(500);

    // Should switch to left layout
    await expect(nav).toHaveClass(/layout-left/);

    console.log("✅ Rotated to landscape: Switched to left navigation");

    // Rotate back to portrait
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);

    // Should switch back to top layout
    await expect(nav).toHaveClass(/layout-top/);

    console.log("✅ Rotated to portrait: Switched back to top navigation");
  });

  test("navigation should be functional in left layout", async ({ page }) => {
    await page.setViewportSize(Z_FOLD_LANDSCAPE);
    await page.goto("/");

    await page.waitForSelector(".app-navigation-bar");

    // Verify navigation tabs are clickable
    const navTabs = page.locator(".nav-tab:not(.disabled)");
    const tabCount = await navTabs.count();
    expect(tabCount).toBeGreaterThan(0);

    // Try clicking a tab
    if (tabCount > 0) {
      const firstTab = navTabs.first();
      await firstTab.click();

      // Tab should become active
      await expect(firstTab).toHaveClass(/active/);

      console.log("✅ Navigation tabs functional in left layout");
    }

    // Verify settings button is accessible
    const settingsButton = page.locator(
      '.nav-action[aria-label="Open Settings"]'
    );
    await expect(settingsButton).toBeVisible();

    console.log("✅ Settings button accessible in left layout");
  });

  test("should maintain proper z-index and not cover content", async ({
    page,
  }) => {
    await page.setViewportSize(Z_FOLD_LANDSCAPE);
    await page.goto("/");

    await page.waitForSelector(".app-navigation-bar");

    // Get navigation position and dimensions
    const nav = page.locator(".app-navigation-bar.layout-left");
    const navBox = await nav.boundingBox();

    // Get main content position
    const mainContent = page.locator(".content-area");
    const contentBox = await mainContent.boundingBox();

    // Navigation should not overlap content
    if (navBox && contentBox) {
      expect(navBox.x + navBox.width).toBeLessThanOrEqual(contentBox.x + 5); // Allow 5px margin
      console.log("✅ Navigation does not overlap content");
      console.log(`   Nav ends at: ${navBox.x + navBox.width}px`);
      console.log(`   Content starts at: ${contentBox.x}px`);
    }
  });

  test("navigation icons should be properly sized in left layout", async ({
    page,
  }) => {
    await page.setViewportSize(Z_FOLD_LANDSCAPE);
    await page.goto("/");

    await page.waitForSelector(".app-navigation-bar");

    // Check icon sizes
    const tabIcons = page.locator(".layout-left .tab-icon");
    const iconCount = await tabIcons.count();

    if (iconCount > 0) {
      const firstIcon = tabIcons.first();
      const fontSize = await firstIcon.evaluate(
        (el) => window.getComputedStyle(el).fontSize
      );

      // Should be 24px (as defined in CSS)
      expect(fontSize).toBe("24px");
      console.log(`✅ Icon size correct: ${fontSize}`);
    }
  });
});

test.describe("Visual Regression - Landscape Mobile Navigation", () => {
  test("should match Z Fold 5 landscape screenshot", async ({ page }) => {
    await page.setViewportSize(Z_FOLD_LANDSCAPE);
    await page.goto("/");

    await page.waitForSelector(".app-navigation-bar");

    // Wait for animations to settle
    await page.waitForTimeout(1000);

    // Take screenshot
    await expect(page).toHaveScreenshot("zfold5-landscape-nav.png", {
      fullPage: false,
      animations: "disabled",
    });

    console.log("✅ Z Fold 5 landscape screenshot captured");
  });
});
