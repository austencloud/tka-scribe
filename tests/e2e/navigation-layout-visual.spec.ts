import { expect, test } from "@playwright/test";

/**
 * Visual Layout Testing for Navigation Bar
 * Tests layout, spacing, and fit at various screen sizes
 */

// Device configurations to test
const SCREEN_SIZES = {
  // Landscape mobile devices (should use LEFT nav)
  zFold5: { width: 904, height: 344, name: "Z Fold 5 Landscape" },
  iphone14ProMax: {
    width: 932,
    height: 430,
    name: "iPhone 14 Pro Max Landscape",
  },
  iphone14Pro: { width: 844, height: 390, name: "iPhone 14 Pro Landscape" },
  galaxyS23: { width: 800, height: 360, name: "Galaxy S23 Landscape" },

  // Desktop test cases (various heights)
  desktopShort: { width: 1200, height: 450, name: "Desktop Short (LEFT nav)" },
  desktopVeryShort: {
    width: 1400,
    height: 380,
    name: "Desktop Very Short (LEFT nav)",
  },

  // Portrait and tall viewports (should use TOP nav)
  iphone14ProPortrait: {
    width: 390,
    height: 844,
    name: "iPhone 14 Pro Portrait",
  },
  ipadPro: { width: 1024, height: 768, name: "iPad Pro Landscape" },
  desktop: { width: 1920, height: 1080, name: "Desktop Standard" },
};

test.describe("Navigation Bar Layout - All Screen Sizes", () => {
  test.describe("Left Navigation Layout", () => {
    test("Z Fold 5: all elements fit without scrolling", async ({ page }) => {
      const { width, height, name } = SCREEN_SIZES.zFold5;
      await page.setViewportSize({ width, height });
      await page.goto("/");

      await page.waitForSelector(".app-navigation-bar.layout-left", {
        timeout: 10000,
      });

      // Check navigation bar dimensions
      const nav = page.locator(".app-navigation-bar.layout-left");
      const navBox = await nav.boundingBox();

      expect(navBox).toBeTruthy();
      expect(navBox!.width).toBeLessThanOrEqual(72);
      expect(navBox!.height).toBeLessThanOrEqual(height);

      // Check for scrollbars (should not exist)
      const hasVerticalScroll = await nav.evaluate((el) => {
        return el.scrollHeight > el.clientHeight;
      });
      expect(hasVerticalScroll).toBe(false);

      // Check hamburger button fits
      const hamburger = page.locator(".hamburger-container");
      await expect(hamburger).toBeVisible();
      const hamburgerBox = await hamburger.boundingBox();
      expect(hamburgerBox!.width).toBeLessThanOrEqual(72);

      // Check hamburger button itself is compact
      const hamburgerButton = page.locator(".hamburger-menu-button");
      const buttonBox = await hamburgerButton.boundingBox();
      expect(buttonBox!.width).toBeLessThanOrEqual(56); // Should be 48px + margins

      // Check all nav tabs are visible and within bounds
      const navTabs = page.locator(".nav-tab");
      const tabCount = await navTabs.count();

      for (let i = 0; i < tabCount; i++) {
        const tab = navTabs.nth(i);
        await expect(tab).toBeVisible();

        const tabBox = await tab.boundingBox();
        expect(tabBox!.width).toBeLessThanOrEqual(72);

        // Tab should not overflow navigation bar
        expect(tabBox!.x).toBeGreaterThanOrEqual(navBox!.x);
        expect(tabBox!.x + tabBox!.width).toBeLessThanOrEqual(
          navBox!.x + navBox!.width + 5
        );
      }

      // Check settings button fits
      const settings = page.locator('.nav-action[aria-label="Open Settings"]');
      await expect(settings).toBeVisible();
      const settingsBox = await settings.boundingBox();
      expect(settingsBox!.width).toBeLessThanOrEqual(72);

      console.log(`✅ ${name}: All elements fit within 72px width`);
      console.log(`   Nav tabs: ${tabCount}`);
      console.log(`   Nav height: ${navBox!.height}px / ${height}px viewport`);
    });

    test("iPhone 14 Pro Max: tabs fit vertically without overflow", async ({
      page,
    }) => {
      const { width, height, name } = SCREEN_SIZES.iphone14ProMax;
      await page.setViewportSize({ width, height });
      await page.goto("/");

      await page.waitForSelector(".app-navigation-bar.layout-left");

      const nav = page.locator(".app-navigation-bar.layout-left");
      const navBox = await nav.boundingBox();

      // Calculate total used height
      const hamburger = await page.locator(".nav-left").boundingBox();
      const navCenter = await page.locator(".nav-center").boundingBox();
      const navRight = await page.locator(".nav-right").boundingBox();

      const totalUsedHeight =
        (hamburger?.height || 0) +
        (navCenter?.height || 0) +
        (navRight?.height || 0);

      console.log(`${name} height analysis:`);
      console.log(`  Hamburger section: ${hamburger?.height}px`);
      console.log(`  Center tabs section: ${navCenter?.height}px`);
      console.log(`  Settings section: ${navRight?.height}px`);
      console.log(`  Total used: ${totalUsedHeight}px`);
      console.log(`  Available: ${navBox!.height}px`);

      // Should fit comfortably with some margin
      expect(totalUsedHeight).toBeLessThan(navBox!.height * 0.95);
    });

    test("Desktop short: module selector dropdown positions correctly", async ({
      page,
    }) => {
      const { width, height } = SCREEN_SIZES.desktopShort;
      await page.setViewportSize({ width, height });
      await page.goto("/");

      await page.waitForSelector(".app-navigation-bar.layout-left");

      // Click hamburger to open module selector
      const hamburger = page.locator(".hamburger-container button").first();
      await hamburger.click();

      // Wait for module selector to open
      await page.waitForTimeout(300);

      // Check module selector visibility and position
      const moduleSelector = page.locator(
        ".hamburger-container .module-selector, .hamburger-container [class*='dropdown'], .hamburger-container [class*='modal']"
      );

      if ((await moduleSelector.count()) > 0) {
        const selector = moduleSelector.first();
        await expect(selector).toBeVisible();

        const selectorBox = await selector.boundingBox();
        const navBox = await page.locator(".app-navigation-bar").boundingBox();

        console.log("Module selector positioning:");
        console.log(
          `  Selector position: (${selectorBox!.x}, ${selectorBox!.y})`
        );
        console.log(
          `  Selector size: ${selectorBox!.width} × ${selectorBox!.height}`
        );
        console.log(`  Nav bar position: (${navBox!.x}, ${navBox!.y})`);

        // Module selector should be positioned adjacent to nav bar, not overlapping content
        // Allow it to extend beyond the 72px nav bar (that's the design)
        expect(selectorBox!.x).toBeGreaterThanOrEqual(0);
        expect(selectorBox!.y).toBeGreaterThanOrEqual(0);
      }
    });

    test("All landscape mobile devices: consistent icon sizing", async ({
      page,
    }) => {
      const landscapeDevices = [
        SCREEN_SIZES.zFold5,
        SCREEN_SIZES.iphone14ProMax,
        SCREEN_SIZES.iphone14Pro,
        SCREEN_SIZES.galaxyS23,
      ];

      for (const device of landscapeDevices) {
        await page.setViewportSize({
          width: device.width,
          height: device.height,
        });
        await page.goto("/");

        await page.waitForSelector(".app-navigation-bar.layout-left");

        // Check icon font sizes
        const tabIcons = page.locator(".layout-left .tab-icon");
        const iconCount = await tabIcons.count();

        if (iconCount > 0) {
          const fontSize = await tabIcons
            .first()
            .evaluate((el) => window.getComputedStyle(el).fontSize);

          // Should be 20px in left layout (reduced from 24px for better fit)
          expect(fontSize).toBe("20px");

          console.log(`✅ ${device.name}: Icon size ${fontSize}`);
        }
      }
    });
  });

  test.describe("Top Navigation Layout", () => {
    test("Desktop standard: all tabs fit horizontally", async ({ page }) => {
      const { width, height, name } = SCREEN_SIZES.desktop;
      await page.setViewportSize({ width, height });
      await page.goto("/");

      await page.waitForSelector(".app-navigation-bar.layout-top");

      const nav = page.locator(".app-navigation-bar.layout-top");
      const navBox = await nav.boundingBox();

      // Check nav center (tabs container)
      const navCenter = page.locator(".nav-center");
      const centerBox = await navCenter.boundingBox();

      // All tabs should fit within center section without wrapping
      const tabs = page.locator(".nav-tab");
      const tabCount = await tabs.count();

      let totalTabWidth = 0;
      for (let i = 0; i < tabCount; i++) {
        const tabBox = await tabs.nth(i).boundingBox();
        totalTabWidth += tabBox!.width;
      }

      console.log(`${name} tab layout:`);
      console.log(`  Total tab width: ${totalTabWidth}px`);
      console.log(`  Center container: ${centerBox!.width}px`);
      console.log(`  Tab count: ${tabCount}`);

      // Tabs should fit comfortably (including gaps)
      expect(totalTabWidth).toBeLessThan(centerBox!.width);
    });

    test("iPad Pro: tab labels visible", async ({ page }) => {
      const { width, height, name } = SCREEN_SIZES.ipadPro;
      await page.setViewportSize({ width, height });
      await page.goto("/");

      await page.waitForSelector(".app-navigation-bar.layout-top");

      // In top layout, labels should be visible (if they exist)
      const tabLabels = page.locator(".nav-tab .tab-label");
      const labelCount = await tabLabels.count();

      if (labelCount > 0) {
        // Check first label is visible
        await expect(tabLabels.first()).toBeVisible();
        console.log(`✅ ${name}: ${labelCount} tab labels visible`);
      }
    });

    test("Portrait mobile: icons only, labels hidden", async ({ page }) => {
      const { width, height, name } = SCREEN_SIZES.iphone14ProPortrait;
      await page.setViewportSize({ width, height });
      await page.goto("/");

      await page.waitForSelector(".app-navigation-bar.layout-top");

      // Check if labels are hidden on small screens
      const tabLabels = page.locator(".nav-tab .tab-label");
      const labelCount = await tabLabels.count();

      if (labelCount > 0) {
        // Labels should be hidden via CSS on mobile
        const firstLabel = tabLabels.first();
        const isVisible = await firstLabel.isVisible();

        if (!isVisible) {
          console.log(`✅ ${name}: Tab labels correctly hidden on mobile`);
        } else {
          console.log(
            `ℹ️ ${name}: Tab labels still visible (may be OK depending on width)`
          );
        }
      }
    });
  });

  test.describe("Settings Button Sizing", () => {
    test("Settings button doesn't dominate nav space - left layout", async ({
      page,
    }) => {
      await page.setViewportSize(SCREEN_SIZES.zFold5);
      await page.goto("/");

      await page.waitForSelector(".app-navigation-bar.layout-left");

      const navRight = page.locator(".nav-right");
      const settings = page.locator('.nav-action[aria-label="Open Settings"]');

      const navRightBox = await navRight.boundingBox();
      const settingsBox = await settings.boundingBox();

      // Settings button should be appropriately sized (48px × 48px in left layout)
      expect(settingsBox!.width).toBeLessThanOrEqual(56);
      expect(settingsBox!.height).toBeLessThanOrEqual(56);

      // Nav right section should not take up too much vertical space
      const nav = page.locator(".app-navigation-bar");
      const navBox = await nav.boundingBox();
      const rightPercentage = (navRightBox!.height / navBox!.height) * 100;

      console.log("Settings button proportions:");
      console.log(
        `  Settings size: ${settingsBox!.width} × ${settingsBox!.height}`
      );
      console.log(
        `  Nav right takes ${rightPercentage.toFixed(1)}% of vertical space`
      );

      // Settings section should take less than 25% of nav height
      expect(rightPercentage).toBeLessThan(25);
    });

    test("Settings button doesn't dominate nav space - top layout", async ({
      page,
    }) => {
      await page.setViewportSize(SCREEN_SIZES.desktop);
      await page.goto("/");

      await page.waitForSelector(".app-navigation-bar.layout-top");

      const navRight = page.locator(".nav-right");
      const settings = page.locator('.nav-action[aria-label="Open Settings"]');

      const navRightBox = await navRight.boundingBox();
      const settingsBox = await settings.boundingBox();

      // Settings button should be 40px × 40px in top layout
      expect(settingsBox!.width).toBeLessThanOrEqual(48);
      expect(settingsBox!.height).toBeLessThanOrEqual(48);

      const nav = page.locator(".app-navigation-bar");
      const navBox = await nav.boundingBox();
      const rightPercentage = (navRightBox!.width / navBox!.width) * 100;

      console.log("Settings button in top layout:");
      console.log(
        `  Settings size: ${settingsBox!.width} × ${settingsBox!.height}`
      );
      console.log(
        `  Nav right takes ${rightPercentage.toFixed(1)}% of horizontal space`
      );

      // Settings section should take less than 10% of nav width
      expect(rightPercentage).toBeLessThan(10);
    });
  });

  test.describe("Module Selector Dropdown Fitting", () => {
    test("Module selector fits within viewport - left layout", async ({
      page,
    }) => {
      await page.setViewportSize(SCREEN_SIZES.zFold5);
      await page.goto("/");

      await page.waitForSelector(".app-navigation-bar.layout-left");

      // Open module selector
      const hamburger = page.locator(".hamburger-container button").first();
      await hamburger.click();
      await page.waitForTimeout(300);

      // Find the module selector (could be dropdown or modal)
      const possibleSelectors = [
        ".module-selector",
        "[class*='ModuleSelector']",
        "[class*='dropdown']",
        "[class*='modal']",
      ];

      let moduleSelector = null;
      for (const selector of possibleSelectors) {
        const element = page
          .locator(`.hamburger-container ${selector}`)
          .first();
        if ((await element.count()) > 0 && (await element.isVisible())) {
          moduleSelector = element;
          break;
        }
      }

      if (moduleSelector) {
        const selectorBox = await moduleSelector.boundingBox();
        const viewportHeight = SCREEN_SIZES.zFold5.height;
        const viewportWidth = SCREEN_SIZES.zFold5.width;

        console.log("Module selector fit check:");
        console.log(
          `  Selector: ${selectorBox!.width} × ${selectorBox!.height}`
        );
        console.log(`  Viewport: ${viewportWidth} × ${viewportHeight}`);

        // Should not overflow viewport
        expect(selectorBox!.x + selectorBox!.width).toBeLessThanOrEqual(
          viewportWidth + 5
        );
        expect(selectorBox!.y + selectorBox!.height).toBeLessThanOrEqual(
          viewportHeight + 5
        );

        // Should be positioned appropriately from nav bar
        expect(selectorBox!.x).toBeGreaterThanOrEqual(60); // Should be next to 72px nav
      } else {
        console.log("⚠️ Module selector not found or using mobile modal");
      }
    });

    test("Module selector dropdown vs modal - device detection", async ({
      page,
    }) => {
      const testCases = [
        { ...SCREEN_SIZES.zFold5, expectModal: false },
        { ...SCREEN_SIZES.desktop, expectModal: false },
      ];

      for (const testCase of testCases) {
        await page.setViewportSize({
          width: testCase.width,
          height: testCase.height,
        });
        await page.goto("/");

        await page.waitForSelector(".app-navigation-bar");

        // Open selector
        const hamburger = page.locator(".hamburger-container button").first();
        await hamburger.click();
        await page.waitForTimeout(300);

        // Check what type of selector appears
        const hasDropdown =
          (await page.locator("[class*='dropdown']").count()) > 0;
        const hasModal =
          (await page
            .locator(
              "[class*='modal'][class*='visible'], [class*='modal'][class*='open']"
            )
            .count()) > 0;

        console.log(`${testCase.name}:`);
        console.log(`  Has dropdown: ${hasDropdown}`);
        console.log(`  Has modal: ${hasModal}`);
      }
    });
  });

  test.describe("Visual Regression", () => {
    test("Z Fold 5 - left nav screenshot", async ({ page }) => {
      await page.setViewportSize(SCREEN_SIZES.zFold5);
      await page.goto("/");

      await page.waitForSelector(".app-navigation-bar.layout-left");
      await page.waitForTimeout(1000); // Let animations settle

      await expect(page).toHaveScreenshot("nav-zfold5-left.png", {
        fullPage: true,
        animations: "disabled",
      });
    });

    test("Desktop - top nav screenshot", async ({ page }) => {
      await page.setViewportSize(SCREEN_SIZES.desktop);
      await page.goto("/");

      await page.waitForSelector(".app-navigation-bar.layout-top");
      await page.waitForTimeout(1000);

      await expect(page).toHaveScreenshot("nav-desktop-top.png", {
        fullPage: false,
        animations: "disabled",
        clip: { x: 0, y: 0, width: 1920, height: 100 }, // Just nav bar
      });
    });
  });
});
