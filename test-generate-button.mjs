import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[BROWSER-${type.toUpperCase()}]`, text);
  });

  // Capture errors
  page.on('pageerror', error => {
    console.error('[PAGE-ERROR]', error.message);
    console.error('[STACK]', error.stack);
  });

  try {
    console.log('🌐 Navigating to localhost:4173 (production preview)...');
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

    console.log('⏳ Waiting for app to initialize...');
    await page.waitForTimeout(3000);

    console.log('🔍 Looking for Create tab and Generate sub-tab...');

    // Take a screenshot to see what's on screen
    await page.screenshot({ path: 'before-generate.png', fullPage: true });
    console.log('📸 Screenshot saved: before-generate.png');

    // Find and click the Generate tab/button
    // Let me first check what's visible
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons on page`);

    // Try to find Generate-related text
    const generateButtons = await page.locator('button:has-text("Generate")').all();
    console.log(`Found ${generateButtons.length} buttons with "Generate" text`);

    if (generateButtons.length > 0) {
      console.log('🖱️ Clicking Generate button...');
      await generateButtons[0].click();

      // Wait for any errors
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'after-generate-click.png', fullPage: true });
      console.log('📸 Screenshot saved: after-generate-click.png');
    } else {
      // Look for tabs/navigation
      console.log('🔍 Looking for navigation tabs...');
      const tabs = await page.locator('[role="tab"], button[class*="tab"]').all();
      console.log(`Found ${tabs.length} tab elements`);

      for (let i = 0; i < Math.min(tabs.length, 10); i++) {
        const text = await tabs[i].textContent();
        console.log(`  Tab ${i}: "${text}"`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }

  console.log('\n⏸️ Keeping browser open for 30 seconds for manual inspection...');
  await page.waitForTimeout(30000);

  await browser.close();
  console.log('✅ Test complete');
  process.exit(0);
})();
