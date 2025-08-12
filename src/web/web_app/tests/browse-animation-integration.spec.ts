import { test, expect } from '@playwright/test';

test.describe('Browse Tab Animation Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the web app
    await page.goto('http://localhost:5174');
    
    // Wait for the app to load
    await page.waitForSelector('[data-testid="main-interface"]', { timeout: 10000 });
    
    // Switch to browse tab
    await page.click('[data-testid="tab-browse"]');
    await page.waitForSelector('[data-testid="browse-tab"]', { timeout: 5000 });
    
    // Wait for sequences to load
    await page.waitForSelector('.sequence-thumbnail', { timeout: 10000 });
  });

  test('should debug sequence loading error when clicking animate button', async ({ page }) => {
    console.log('🧪 Testing current animate button functionality...');
    
    // Find the first sequence card
    const firstSequence = page.locator('.sequence-thumbnail').first();
    await expect(firstSequence).toBeVisible();
    
    // Get sequence info for debugging
    const sequenceId = await firstSequence.getAttribute('data-sequence-id');
    console.log('📝 Sequence ID:', sequenceId);
    
    // Look for animate button
    const animateButton = firstSequence.locator('.animate-button');
    
    if (await animateButton.count() > 0) {
      console.log('🎬 Found animate button, testing click...');
      
      // Listen for console errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
          console.log('❌ Console Error:', msg.text());
        }
      });
      
      // Listen for network requests
      const networkRequests: string[] = [];
      page.on('request', request => {
        if (request.url().includes('sequence')) {
          networkRequests.push(request.url());
          console.log('🌐 Network Request:', request.url());
        }
      });
      
      // Click animate button
      await animateButton.click();
      
      // Wait a bit for any async operations
      await page.waitForTimeout(2000);
      
      // Check if animation panel appeared
      const animationPanel = page.locator('.animation-panel');
      const isPanelVisible = await animationPanel.isVisible();
      console.log('📱 Animation panel visible:', isPanelVisible);
      
      // Check for errors
      if (consoleErrors.length > 0) {
        console.log('❌ Found console errors:', consoleErrors);
      }
      
      // Check network requests
      if (networkRequests.length > 0) {
        console.log('🌐 Network requests made:', networkRequests);
      }
      
      // Check panel content
      if (isPanelVisible) {
        const panelContent = await animationPanel.textContent();
        console.log('📄 Panel content:', panelContent?.substring(0, 200));
      }
      
    } else {
      console.log('❌ No animate button found on sequence card');
      
      // Check what buttons are available
      const buttons = await firstSequence.locator('button').all();
      console.log('🔘 Available buttons:', buttons.length);
      
      for (let i = 0; i < buttons.length; i++) {
        const buttonText = await buttons[i].textContent();
        const buttonClass = await buttons[i].getAttribute('class');
        console.log(`  Button ${i}: "${buttonText}" (${buttonClass})`);
      }
    }
  });

  test('should test sequence card click behavior', async ({ page }) => {
    console.log('🧪 Testing sequence card click behavior...');
    
    // Find the first sequence card
    const firstSequence = page.locator('.sequence-thumbnail').first();
    await expect(firstSequence).toBeVisible();
    
    // Listen for console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('🎬')) {
        consoleLogs.push(msg.text());
        console.log('📝 Animation Log:', msg.text());
      }
    });
    
    // Click on the sequence card itself (not buttons)
    await firstSequence.click();
    
    // Wait for any async operations
    await page.waitForTimeout(2000);
    
    // Check what happened
    console.log('📝 Console logs captured:', consoleLogs);
    
    // Check if fullscreen viewer opened instead
    const fullscreenViewer = page.locator('[data-testid="fullscreen-viewer"]');
    const isFullscreenVisible = await fullscreenViewer.isVisible();
    console.log('🖼️ Fullscreen viewer visible:', isFullscreenVisible);
    
    // Check if animation panel opened
    const animationPanel = page.locator('.animation-panel');
    const isPanelVisible = await animationPanel.isVisible();
    console.log('📱 Animation panel visible:', isPanelVisible);
  });

  test('should inspect sequence data structure', async ({ page }) => {
    console.log('🧪 Inspecting sequence data structure...');
    
    // Get sequence data from the page
    const sequenceData = await page.evaluate(() => {
      // Try to access sequence data from the browse state
      const sequenceCards = document.querySelectorAll('.sequence-thumbnail');
      const firstCard = sequenceCards[0];
      
      if (firstCard) {
        // Look for data attributes
        const dataAttrs: Record<string, string> = {};
        for (const attr of firstCard.attributes) {
          if (attr.name.startsWith('data-')) {
            dataAttrs[attr.name] = attr.value;
          }
        }
        
        return {
          cardCount: sequenceCards.length,
          firstCardData: dataAttrs,
          firstCardText: firstCard.textContent?.substring(0, 100)
        };
      }
      
      return { cardCount: 0 };
    });
    
    console.log('📊 Sequence data:', JSON.stringify(sequenceData, null, 2));
  });

  test('should test animation panel state management', async ({ page }) => {
    console.log('🧪 Testing animation panel state management...');
    
    // Check initial state
    const animationPanel = page.locator('.animation-panel');
    const initialVisibility = await animationPanel.isVisible();
    console.log('📱 Initial panel visibility:', initialVisibility);
    
    // Try to find panel toggle or close button
    const closeButton = animationPanel.locator('.close-button');
    const hasCloseButton = await closeButton.count() > 0;
    console.log('❌ Has close button:', hasCloseButton);
    
    if (hasCloseButton && initialVisibility) {
      // Test closing the panel
      await closeButton.click();
      await page.waitForTimeout(500);
      
      const afterCloseVisibility = await animationPanel.isVisible();
      console.log('📱 Panel visibility after close:', afterCloseVisibility);
    }
  });
});
