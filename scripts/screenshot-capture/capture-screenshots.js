/**
 * Automated Screenshot Capture for TKA Scribe
 *
 * Captures app screenshots for store listings without using Claude tokens.
 * Run with: node scripts/screenshot-capture/capture-screenshots.js
 *
 * Options:
 *   --screen <id>   Capture only a specific screen
 *   --headless      Run in headless mode (default: true)
 *   --watch         Watch mode - keep browser open for debugging
 *
 * Prerequisites:
 * - App running locally (npm run dev)
 * - Playwright installed (npx playwright install chromium)
 */

import { chromium } from "playwright";
import { readFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load configuration (with local override for credentials)
let config = JSON.parse(
  readFileSync(join(__dirname, "screenshot-config.json"), "utf-8")
);

// Merge local config if it exists (for credentials that shouldn't be committed)
const localConfigPath = join(__dirname, "screenshot-config.local.json");
if (existsSync(localConfigPath)) {
  const localConfig = JSON.parse(readFileSync(localConfigPath, "utf-8"));
  config = {
    ...config,
    ...localConfig,
    auth: { ...config.auth, ...localConfig.auth },
  };
}

// Parse CLI arguments
const args = process.argv.slice(2);
const screenFilter = args.includes("--screen")
  ? args[args.indexOf("--screen") + 1]
  : null;
const headless = !args.includes("--watch");

// ANSI colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * LocalStorage keys used by TKA Scribe navigation
 * MUST match src/lib/shared/navigation/config/storage-keys.ts
 */
const STORAGE_KEYS = {
  CURRENT_MODULE: "tka-current-module",
  ACTIVE_TAB: "tka-active-tab", // Note: "active-tab" not "current-tab"
  MODULE_LAST_TABS: "tka-module-last-tabs",
  THEME: "tka-background-key",
  PROP_TYPE: "tka-selected-prop-type",
};

async function setupBrowser() {
  log("\n📱 Launching browser...", "blue");

  const browser = await chromium.launch({
    headless,
  });

  const context = await browser.newContext({
    viewport: config.viewport,
    deviceScaleFactor: config.deviceScaleFactor,
    hasTouch: true,
    isMobile: true,
    colorScheme: "dark",
  });

  const page = await context.newPage();

  return { browser, context, page };
}

/**
 * Dismiss any open drawers/modals
 */
async function dismissOpenDrawers(page) {
  // Press Escape to close any open drawers
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  // Click outside any drawer (top-left corner, usually safe)
  await page.mouse.click(10, 10);
  await page.waitForTimeout(300);

  // Press Escape again for good measure
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
}

/**
 * Navigate to a specific module/tab by clicking UI elements
 * More reliable than localStorage approach
 */
async function navigateToScreen(page, screen) {
  const { moduleId, tabId } = screen;

  log(`   Navigating to: ${moduleId}${tabId ? ":" + tabId : ""}`, "dim");

  // First, dismiss any open drawers from previous navigation
  await dismissOpenDrawers(page);

  // Modules in bottom nav: discover, create, compose, library, dashboard
  // Modules NOT in bottom nav: settings, learn, train (accessed via module switcher)
  const bottomNavModules = [
    "discover",
    "create",
    "compose",
    "library",
    "dashboard",
  ];
  const isBottomNavModule = bottomNavModules.includes(moduleId.toLowerCase());

  if (isBottomNavModule) {
    // Try clicking the bottom nav module button directly
    const moduleButton = await page.$(
      `button[aria-label*="${moduleId}" i], button[aria-label*="Navigate to ${moduleId}" i]`
    );

    if (moduleButton) {
      await moduleButton.click();
      await page.waitForTimeout(1500);
    }
  } else {
    // For modules not in bottom nav, use the module switcher
    // Find and click the module switcher button (usually has a grid icon)
    const moduleSwitcher = await page.$(
      'button[aria-label*="module" i], button[aria-label*="switcher" i], button[aria-label*="More" i]'
    );

    if (moduleSwitcher) {
      await moduleSwitcher.click();
      await page.waitForTimeout(800);

      // Look for the module in the drawer that opens
      // Use more specific selectors for the module grid buttons
      const moduleInDrawer = await page.$(
        `[role="dialog"] button:has-text("${moduleId}"), .module-grid button:has-text("${moduleId}"), .module-switcher-drawer button:has-text("${moduleId}")`
      );

      if (moduleInDrawer) {
        await moduleInDrawer.click();
        await page.waitForTimeout(1500);

        // Drawer should auto-close, but dismiss just in case
        await dismissOpenDrawers(page);
      } else {
        log(`   ⚠️  Could not find ${moduleId} in module switcher`, "yellow");
      }
    } else {
      log(`   ⚠️  Could not find module switcher button`, "yellow");
    }
  }

  // If we need a specific tab, click on it
  if (tabId) {
    // Wait for content to settle
    await page.waitForTimeout(800);

    // Dismiss any drawers that might have opened
    await dismissOpenDrawers(page);

    // Try clicking the tab directly by label - look in tab bars specifically
    const tabButton = await page.$(
      `[role="tablist"] button:has-text("${tabId}"), .tab-bar button:has-text("${tabId}"), button[data-tab-id="${tabId}"], [aria-label*="${tabId}" i]:not([role="dialog"] *)`
    );
    if (tabButton) {
      await tabButton.click();
      await page.waitForTimeout(1000);
    } else {
      log(`   ⚠️  Could not find tab: ${tabId}`, "yellow");
    }
  }

  // Give content time to load
  await page.waitForTimeout(2000);

  return true;
}

/**
 * Wait for content to stabilize before taking screenshot
 */
async function waitForStableContent(page, screen, timeout = 15000) {
  const { waitFor } = screen;

  try {
    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Wait for specific selector if provided
    if (waitFor) {
      const selectors = waitFor.split(", ").map((s) => s.trim());

      // Try each selector, succeed if any matches
      let found = false;
      for (const selector of selectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          found = true;
          log(`   ✓ Found: ${selector}`, "dim");
          break;
        } catch {
          // Try next selector
        }
      }

      if (!found) {
        log(`   ⚠️  Could not find any of: ${waitFor}`, "yellow");
      }
    }

    // Wait for network idle
    await page
      .waitForLoadState("networkidle", { timeout: 5000 })
      .catch(() => {});

    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    });

    // Wait for "Loading..." to disappear
    try {
      await page.waitForSelector("text=Loading", {
        state: "hidden",
        timeout: 10000,
      });
    } catch {
      // Loading might not be present, that's fine
    }

    // Small delay for final renders
    await page.waitForTimeout(1500);

    return true;
  } catch (error) {
    log(`   ⚠️  Timeout waiting for content: ${error.message}`, "yellow");
    return false;
  }
}

async function captureScreen(page, screen, outputDir) {
  log(`\n📸 ${screen.name}`, "cyan");
  log(`   ${screen.description}`, "dim");

  // Navigate to the screen
  await navigateToScreen(page, screen);

  // Wait for content to stabilize
  await waitForStableContent(page, screen);

  // Take the screenshot
  const filename = `${screen.id}.png`;
  const filepath = join(outputDir, filename);

  await page.screenshot({
    path: filepath,
    type: "png",
  });

  log(`   ✅ Saved: ${filename}`, "green");
  return true;
}

async function main() {
  log("\n🎬 TKA Scribe Screenshot Capture", "green");
  log("================================", "green");

  // Ensure output directory exists
  const outputDir = join(process.cwd(), config.outputDir);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
    log(`📁 Created output directory: ${config.outputDir}`, "dim");
  }

  // Filter screens if --screen flag provided
  let screens = config.screens;
  if (screenFilter) {
    screens = screens.filter((s) => s.id === screenFilter);
    if (screens.length === 0) {
      log(`❌ Screen "${screenFilter}" not found in config`, "red");
      log(
        `   Available screens: ${config.screens.map((s) => s.id).join(", ")}`,
        "dim"
      );
      process.exit(1);
    }
  }

  log(`\n🔗 Connecting to ${config.baseUrl}...`, "dim");

  const { browser, context, page } = await setupBrowser();

  try {
    // Test connection and do initial load
    // Use 'load' first, then wait for network to settle - more reliable than networkidle
    await page.goto(config.baseUrl, { timeout: 30000, waitUntil: "load" });
    await page.waitForTimeout(2000); // Give app time to hydrate
    log("✅ Connected to dev server", "green");

    // Handle landing page -> login -> app flow
    async function bypassLandingAndLogin() {
      // Check for landing page buttons
      const launchApp = await page.$("text=Launch App");
      const continueLink = await page.$("text=continue in browser");

      if (launchApp) {
        log("📱 Clicking Launch App...", "dim");
        await launchApp.click();
        await page.waitForTimeout(2000);
      } else if (continueLink) {
        log("📱 Bypassing landing page...", "dim");
        await continueLink.click();
        await page.waitForTimeout(2000);
      }

      // Check if we hit a login page
      const loginPage = await page.$("text=Sign in to continue");
      const welcomeBack = await page.$("text=Welcome back");

      if (
        (loginPage || welcomeBack) &&
        config.auth?.email &&
        config.auth?.password
      ) {
        log("🔐 Logging in with email/password...", "dim");

        // Look for email input directly (the form shows email/password fields)
        let emailInput = await page.$('input[type="email"]');

        // If no email input visible, might need to click "Continue with email" first
        if (!emailInput) {
          const emailButton = await page.$("text=Continue with email");
          if (emailButton) {
            await emailButton.click();
            await page.waitForTimeout(1000);
            emailInput = await page.$('input[type="email"]');
          }
        }

        // Fill in email
        if (emailInput) {
          await emailInput.fill(config.auth.email);
        }

        // Fill in password
        const passwordInput = await page.$('input[type="password"]');
        if (passwordInput) {
          await passwordInput.fill(config.auth.password);
        }

        // Click sign in button
        await page.waitForTimeout(500);
        const signInBtn = await page.$(
          'button:has-text("Sign In"), button:has-text("Sign in"), button:has-text("Log in")'
        );
        if (signInBtn) {
          await signInBtn.click();
          log("   Waiting for authentication...", "dim");
          await page.waitForTimeout(4000); // Wait for auth to complete
        }

        // Check if we're still on login page (auth failed)
        const stillOnLogin = await page.$("text=Sign in to continue");
        if (stillOnLogin) {
          log("⚠️  Login may have failed - check credentials", "yellow");
        } else {
          log("✅ Logged in", "green");
        }
      } else if (loginPage || welcomeBack) {
        log("⚠️  Login required but no credentials in config.auth", "yellow");
        log("   Add email/password to screenshot-config.local.json", "dim");
      }

      // Set localStorage IMMEDIATELY to prevent modals on any reload
      // This must happen before any modal interaction
      await page.evaluate(() => {
        // Mark current version as seen (use high number to cover any version)
        localStorage.setItem("tka-last-seen-version", "99.99.99");

        // Also set all onboarding flags
        localStorage.setItem("tka-landing-dismissed", "true");
        localStorage.setItem("tka-sidebar-tour-completed", "true");

        // Pre-dismiss ALL tab intros
        const tabIntros = [
          "tabIntroSeen:create:constructor",
          "tabIntroSeen:create:generator",
          "tabIntroSeen:create:assembler",
          "tabIntroSeen:create:spell",
          "tabIntroSeen:learn:concepts",
          "tabIntroSeen:learn:codex",
          "tabIntroSeen:discover:gallery",
          "tabIntroSeen:discover:sequences",
          "tabIntroSeen:discover:creators",
          "tabIntroSeen:library:sequences",
          "tabIntroSeen:library:favorites",
          "tabIntroSeen:compose:playback",
          "tabIntroSeen:compose:arrange",
          "tabIntroSeen:compose:timeline",
          "tabIntroSeen:train:practice",
          "tabIntroSeen:settings:theme",
          "tabIntroSeen:settings:visibility",
        ];
        tabIntros.forEach((key) => localStorage.setItem(key, "true"));
      });
      log("   Set localStorage flags", "dim");

      // Now dismiss any modals that appear
      await page.waitForTimeout(1500);

      // Check for "What's New" modal
      const gotItBtn = await page.$('button:has-text("Got it")');
      if (gotItBtn) {
        log("📋 Dismissing What's New modal...", "dim");
        await gotItBtn.click();
        await page.waitForTimeout(1000);
      }

      // Check for any other dismiss buttons
      const dismissBtn = await page.$(
        'button:has-text("Dismiss"), button:has-text("Close"), button:has-text("Skip")'
      );
      if (dismissBtn) {
        await dismissBtn.click();
        await page.waitForTimeout(500);
      }
    }

    await bypassLandingAndLogin();

    // Set app preferences (theme, prop type)
    await page.evaluate((settings) => {
      if (settings.theme) {
        localStorage.setItem("tka-background-key", settings.theme);
      }
      if (settings.propType) {
        localStorage.setItem("tka-selected-prop-type", settings.propType);
      }
    }, config.settings);

    // Small delay after settings
    await page.waitForTimeout(500);
  } catch (error) {
    log("❌ Could not connect to dev server!", "red");
    log(`   Error: ${error.message}`, "dim");
    log("   Make sure the app is running: npm run dev", "yellow");
    await browser.close();
    process.exit(1);
  }

  // Sort by priority (lower = higher priority)
  screens = screens.sort((a, b) => (a.priority || 99) - (b.priority || 99));

  // Capture each screen
  let successCount = 0;
  let failCount = 0;

  for (const screen of screens) {
    try {
      await captureScreen(page, screen, outputDir);
      successCount++;
    } catch (error) {
      log(`   ❌ Failed: ${error.message}`, "red");
      failCount++;
    }
  }

  if (!headless) {
    log(
      "\n👀 Watch mode - browser will stay open. Press Ctrl+C to exit.",
      "yellow"
    );
    await new Promise(() => {}); // Keep alive
  }

  await browser.close();

  // Summary
  log("\n================================", "green");
  log(`✅ Captured: ${successCount}/${screens.length} screenshots`, "green");
  if (failCount > 0) {
    log(`⚠️  Failed: ${failCount} screenshots`, "yellow");
  }
  log(`📁 Output: ${config.outputDir}`, "dim");
  log("", "reset");
}

// Run
main().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, "red");
  console.error(error);
  process.exit(1);
});
