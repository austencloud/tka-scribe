/**
 * TKA Glyph Size and Position Comparison Test
 *
 * Compares TKA glyph sizing and positioning between legacy and modern apps
 * to identify and fix discrepancies.
 */

import { chromium } from 'playwright';

async function compareTKAGlyphs() {
  console.log('🔍 Starting TKA Glyph Size and Position Comparison...\n');

  const browser = await chromium.launch({ headless: false });

  try {
    // Create pages for both apps
    const legacyPage = await browser.newPage();
    const modernPage = await browser.newPage();

    console.log('📱 Loading Legacy App...');
    await legacyPage.goto('http://localhost:5175');
    await legacyPage.waitForLoadState('networkidle');

    console.log('📱 Loading Modern App...');
    await modernPage.goto('http://localhost:5177');
    await modernPage.waitForLoadState('networkidle');

    // Navigate to construct tabs
    console.log('🔄 Navigating to construct tabs...');

    // Legacy construct tab - handle donation overlay first
    try {
      // Check for and dismiss donation overlay if present
      try {
        const donationOverlay = legacyPage.locator('.overlay');
        if (await donationOverlay.isVisible()) {
          console.log('🚫 Dismissing donation overlay...');
          await legacyPage.keyboard.press('Escape'); // Try escape key to dismiss
          await legacyPage.waitForTimeout(1000);
        }
      } catch (overlayError) {
        console.log('ℹ️ No overlay found or already dismissed');
      }

      await legacyPage.click('.construct-tab', { force: true });
      console.log('✅ Legacy construct tab clicked');
    } catch (error) {
      console.log('❌ Failed to click legacy construct tab:', error.message);
      return;
    }

    // Modern construct tab
    try {
      await modernPage.click('.construct-tab');
      console.log('✅ Modern construct tab clicked');
    } catch (error) {
      console.log('❌ Failed to click modern construct tab:', error.message);
      return;
    }

    // Wait for content to load
    await legacyPage.waitForTimeout(2000);
    await modernPage.waitForTimeout(2000);

    console.log('\n🔍 Analyzing TKA Glyphs...\n');

    // Extract TKA glyph data from legacy app
    const legacyGlyphData = await legacyPage.evaluate(() => {
      const glyphs = [];

      // Look for TKA glyph elements - try multiple selectors
      const selectors = [
        '[data-letter]',
        '.tka-glyph',
        '.letter-glyph',
        'text[data-letter]',
        'text.letter',
        'svg text',
        '[class*="glyph"]',
        '[class*="letter"]'
      ];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
          const rect = element.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(element);

          if (rect.width > 0 && rect.height > 0) {
            glyphs.push({
              selector: selector,
              index: index,
              tagName: element.tagName,
              text: element.textContent || element.getAttribute('data-letter') || '',
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              fontSize: computedStyle.fontSize,
              fontFamily: computedStyle.fontFamily,
              transform: computedStyle.transform,
              className: element.className,
              attributes: Array.from(element.attributes).map(attr => `${attr.name}="${attr.value}"`).join(' ')
            });
          }
        });
      }

      return glyphs;
    });

    // Extract TKA glyph data from modern app
    const modernGlyphData = await modernPage.evaluate(() => {
      const glyphs = [];

      // Look for TKA glyph elements - try multiple selectors
      const selectors = [
        '[data-letter]',
        '.tka-glyph',
        '.letter-glyph',
        'text[data-letter]',
        'text.letter',
        'svg text',
        '[class*="glyph"]',
        '[class*="letter"]'
      ];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
          const rect = element.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(element);

          if (rect.width > 0 && rect.height > 0) {
            glyphs.push({
              selector: selector,
              index: index,
              tagName: element.tagName,
              text: element.textContent || element.getAttribute('data-letter') || '',
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              fontSize: computedStyle.fontSize,
              fontFamily: computedStyle.fontFamily,
              transform: computedStyle.transform,
              className: element.className,
              attributes: Array.from(element.attributes).map(attr => `${attr.name}="${attr.value}"`).join(' ')
            });
          }
        });
      }

      return glyphs;
    });

    console.log('📊 LEGACY APP GLYPH DATA:');
    console.log(`   Found ${legacyGlyphData.length} glyph elements`);
    legacyGlyphData.forEach((glyph, i) => {
      console.log(`   ${i + 1}. ${glyph.tagName} "${glyph.text}" - Size: ${glyph.width}×${glyph.height}, Position: (${glyph.x}, ${glyph.y}), Font: ${glyph.fontSize}`);
      console.log(`      Selector: ${glyph.selector}, Class: ${glyph.className}`);
      if (glyph.transform !== 'none') console.log(`      Transform: ${glyph.transform}`);
    });

    console.log('\n📊 MODERN APP GLYPH DATA:');
    console.log(`   Found ${modernGlyphData.length} glyph elements`);
    modernGlyphData.forEach((glyph, i) => {
      console.log(`   ${i + 1}. ${glyph.tagName} "${glyph.text}" - Size: ${glyph.width}×${glyph.height}, Position: (${glyph.x}, ${glyph.y}), Font: ${glyph.fontSize}`);
      console.log(`      Selector: ${glyph.selector}, Class: ${glyph.className}`);
      if (glyph.transform !== 'none') console.log(`      Transform: ${glyph.transform}`);
    });

    // Analyze SVG container sizes first
    console.log('\n📊 SVG CONTAINER ANALYSIS:');

    // Get SVG container sizes
    const legacySvgContainers = await legacyPage.evaluate(() => {
      const svgs = document.querySelectorAll('svg');
      return Array.from(svgs).map(svg => {
        const rect = svg.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          viewBox: svg.getAttribute('viewBox'),
          classes: svg.className.baseVal || svg.getAttribute('class') || ''
        };
      });
    });

    const modernSvgContainers = await modernPage.evaluate(() => {
      const svgs = document.querySelectorAll('svg');
      return Array.from(svgs).map(svg => {
        const rect = svg.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          viewBox: svg.getAttribute('viewBox'),
          classes: svg.className.baseVal || svg.getAttribute('class') || ''
        };
      });
    });

    console.log('🔍 Legacy SVG Containers:');
    legacySvgContainers.forEach((svg, i) => {
      console.log(`   ${i + 1}. ${svg.width}×${svg.height} - viewBox: ${svg.viewBox} - classes: ${svg.classes}`);
    });

    console.log('🔍 Modern SVG Containers:');
    modernSvgContainers.forEach((svg, i) => {
      console.log(`   ${i + 1}. ${svg.width}×${svg.height} - viewBox: ${svg.viewBox} - classes: ${svg.classes}`);
    });

    // Compare TKA glyphs specifically
    console.log('\n🔍 TKA GLYPH COMPARISON:');

    // Find TKA glyphs (look for elements with TKA-related text or attributes)
    const legacyTKAGlyphs = legacyGlyphData.filter(g =>
      g.selector === '.tka-glyph' && g.width > 5 && g.height > 5
    );

    const modernTKAGlyphs = modernGlyphData.filter(g =>
      g.selector === '.tka-glyph' && g.width > 5 && g.height > 5
    );

    if (legacyTKAGlyphs.length === 0) {
      console.log('❌ No TKA glyphs found in legacy app');
    } else {
      console.log(`📋 Legacy TKA Glyphs (${legacyTKAGlyphs.length}):`);
      legacyTKAGlyphs.forEach((glyph, i) => {
        console.log(`   ${i + 1}. "${glyph.text}" - ${glyph.width}×${glyph.height} at (${glyph.x}, ${glyph.y}) - Font: ${glyph.fontSize}`);
      });
    }

    if (modernTKAGlyphs.length === 0) {
      console.log('❌ No TKA glyphs found in modern app');
    } else {
      console.log(`📋 Modern TKA Glyphs (${modernTKAGlyphs.length}):`);
      modernTKAGlyphs.forEach((glyph, i) => {
        console.log(`   ${i + 1}. "${glyph.text}" - ${glyph.width}×${glyph.height} at (${glyph.x}, ${glyph.y}) - Font: ${glyph.fontSize}`);
      });
    }

    // Detailed comparison if we have glyphs in both apps
    if (legacyTKAGlyphs.length > 0 && modernTKAGlyphs.length > 0) {
      console.log('\n⚖️ DETAILED COMPARISON:');

      const legacyMain = legacyTKAGlyphs[0]; // Use first glyph as main comparison
      const modernMain = modernTKAGlyphs[0];

      console.log(`📏 Size Comparison:`);
      console.log(`   Legacy:  ${legacyMain.width}×${legacyMain.height} (Font: ${legacyMain.fontSize})`);
      console.log(`   Modern:  ${modernMain.width}×${modernMain.height} (Font: ${modernMain.fontSize})`);
      console.log(`   Ratio:   Width ${(modernMain.width / legacyMain.width).toFixed(2)}x, Height ${(modernMain.height / legacyMain.height).toFixed(2)}x`);

      console.log(`📍 Position Comparison:`);
      console.log(`   Legacy:  (${legacyMain.x}, ${legacyMain.y})`);
      console.log(`   Modern:  (${modernMain.x}, ${modernMain.y})`);
      console.log(`   Offset:  (${modernMain.x - legacyMain.x}, ${modernMain.y - legacyMain.y})`);

      // Recommendations
      console.log('\n💡 RECOMMENDATIONS:');

      const widthRatio = modernMain.width / legacyMain.width;
      const heightRatio = modernMain.height / legacyMain.height;

      if (widthRatio < 0.8 || heightRatio < 0.8) {
        console.log('   🔍 Modern glyph appears too small - increase font size or scale');
        console.log(`   📈 Suggested scale factor: ${(1 / Math.min(widthRatio, heightRatio)).toFixed(2)}x`);
      } else if (widthRatio > 1.2 || heightRatio > 1.2) {
        console.log('   🔍 Modern glyph appears too large - decrease font size or scale');
        console.log(`   📉 Suggested scale factor: ${(1 / Math.max(widthRatio, heightRatio)).toFixed(2)}x`);
      } else {
        console.log('   ✅ Glyph size appears reasonable');
      }

      const xOffset = Math.abs(modernMain.x - legacyMain.x);
      const yOffset = Math.abs(modernMain.y - legacyMain.y);

      if (xOffset > 50 || yOffset > 50) {
        console.log('   📍 Significant position difference detected');
        console.log(`   🎯 Suggested position adjustment: (${legacyMain.x - modernMain.x}, ${legacyMain.y - modernMain.y})`);
      } else {
        console.log('   ✅ Glyph position appears reasonable');
      }
    }

  } finally {
    console.log('\n🔍 Browser windows left open for manual inspection.');
    console.log('Press Ctrl+C to close when done.');
    // Don't close browser automatically for manual inspection
    // await browser.close();
  }
}

// Run the comparison
compareTKAGlyphs().catch(console.error);
