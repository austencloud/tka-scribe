/**
 * Manual Start Position Comparison Script
 *
 * This script performs a direct comparison of start position prop locations
 * between the legacy and modern web apps by extracting positioning data
 * from both applications.
 */

import { chromium } from 'playwright';

async function dismissOverlays(page) {
  try {
    // Try to dismiss donation overlay
    const donationClose = page.locator('.overlay .close-button, .donation-section .close, [aria-label="Close"]');
    if (await donationClose.isVisible({ timeout: 2000 })) {
      await donationClose.click();
      await page.waitForTimeout(1000);
    }
  } catch (e) {
    // Overlay might not be present
  }

  try {
    // Try to click outside overlay area
    await page.click('body', { position: { x: 50, y: 50 } });
    await page.waitForTimeout(500);
  } catch (e) {
    // Ignore
  }
}

async function navigateToConstructTab(page, appName) {
  console.log(`🔍 Navigating to construct tab in ${appName}...`);

  // Wait for page to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Dismiss any overlays
  await dismissOverlays(page);

  // Try multiple selectors for construct tab
  const constructSelectors = [
    '.construct-tab',
    '[data-testid="construct-tab"]',
    '.tab-construct',
    'text=Construct',
    '.tab-button:has-text("Construct")'
  ];

  let clicked = false;
  for (const selector of constructSelectors) {
    try {
      const element = page.locator(selector);
      if (await element.isVisible({ timeout: 3000 })) {
        await element.click({ force: true });
        clicked = true;
        console.log(`✅ Clicked construct tab using selector: ${selector}`);
        break;
      }
    } catch (e) {
      continue;
    }
  }

  if (!clicked) {
    console.log(`⚠️ Could not find construct tab in ${appName}`);
    return false;
  }

  // Wait for construct tab content to load
  await page.waitForTimeout(2000);
  return true;
}

async function extractPositionData(page, appName) {
  console.log(`📊 Extracting position data from ${appName}...`);

  // Wait for pictographs to render
  await page.waitForTimeout(3000);

  const positionData = await page.evaluate(() => {
    const results = [];

    // Look for SVG elements with positioning data
    const svgElements = document.querySelectorAll('svg');
    console.log(`Found ${svgElements.length} SVG elements total`);

    svgElements.forEach((svg, index) => {
      const svgRect = svg.getBoundingClientRect();
      console.log(`SVG ${index}: ${svgRect.width}x${svgRect.height} at (${svgRect.x}, ${svgRect.y})`);

      // Look for ALL possible prop elements with much broader selectors
      const allElements = svg.querySelectorAll('*');
      console.log(`SVG ${index} has ${allElements.length} child elements`);

      allElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const tagName = element.tagName.toLowerCase();
        const transform = element.getAttribute('transform') || '';
        const style = window.getComputedStyle(element);
        const fill = element.getAttribute('fill') || style.fill || '';
        const stroke = element.getAttribute('stroke') || style.stroke || '';
        const className = element.className.baseVal || element.className || '';
        const href = element.getAttribute('href') || '';

        // Only include elements that have some visual presence
        if (rect.width > 0 && rect.height > 0) {
          // Enhanced prop detection logic
          let elementType = 'unknown';
          let color = 'unknown';

          // MODERN APP DETECTION: Look for groups with prop classes (check first)
          if (tagName === 'g' && className.toString().includes('prop')) {
            elementType = 'MODERN_PROP_GROUP';
            const classStr = className.toString();
            if (classStr.includes('blue-prop')) {
              color = 'blue';
            } else if (classStr.includes('red-prop')) {
              color = 'red';
            }
          }

          // MODERN APP DETECTION: Look for image elements inside prop groups (check before legacy)
          else if (tagName === 'image' && element.parentElement) {
            const parentClass = (element.parentElement.className?.baseVal || element.parentElement.className || '').toString();
            if (parentClass.includes('prop')) {
              elementType = 'MODERN_PROP_IMAGE';
              if (parentClass.includes('blue-prop')) {
                color = 'blue';
              } else if (parentClass.includes('red-prop')) {
                color = 'red';
              }
            }
          }

          // LEGACY APP DETECTION: Look for image elements with data:image/svg+xml href (props)
          // Only classify as legacy if not already detected as modern
          else if (tagName === 'image' && href.includes('data:image/svg+xml')) {
            elementType = 'LEGACY_PROP';

            // Try to determine color from parent group or transform context
            let parent = element.parentElement;
            while (parent && parent !== svg) {
              const parentClass = (parent.className?.baseVal || parent.className || '').toString();
              const parentTransform = parent.getAttribute('transform') || '';

              // Look for color indicators in parent context
              if (parentClass.includes('red') || parentTransform.includes('red')) {
                color = 'red';
                break;
              } else if (parentClass.includes('blue') || parentTransform.includes('blue')) {
                color = 'blue';
                break;
              }
              parent = parent.parentElement;
            }

            // If no color found in parents, try to analyze the href content
            if (color === 'unknown') {
              try {
                const base64Content = href.split(',')[1];
                const svgContent = atob(base64Content);
                if (svgContent.includes('#2E3192') || svgContent.includes('blue')) {
                  color = 'blue';
                } else if (svgContent.includes('#ED1C24') || svgContent.includes('red')) {
                  color = 'red';
                }
              } catch (e) {
                // Ignore base64 decode errors
              }
            }
          }

          // ARROW DETECTION: Look for path elements with arrow characteristics
          else if (tagName === 'path' && (
            element.getAttribute('d') ||
            className.toString().includes('arrow') ||
            element.getAttribute('marker-end')
          )) {
            elementType = 'ARROW';
            color = 'arrow';
          }

          // CIRCLE DETECTION: Look for circles that might be props
          else if (tagName === 'circle') {
            const dataColor = element.getAttribute('data-color') || element.getAttribute('data-prop-color');
            if (dataColor) {
              elementType = 'CIRCLE_PROP';
              color = dataColor;
            } else if (fill.includes('blue') || fill.includes('#2E3192')) {
              elementType = 'CIRCLE_PROP';
              color = 'blue';
            } else if (fill.includes('red') || fill.includes('#ED1C24')) {
              elementType = 'CIRCLE_PROP';
              color = 'red';
            }
          }

          // Only include elements that are likely props or arrows
          if (elementType !== 'unknown') {
            results.push({
              svgIndex: index,
              element: tagName,
              elementType: elementType,
              x: rect.x + rect.width / 2,
              y: rect.y + rect.height / 2,
              width: rect.width,
              height: rect.height,
              color: color,
              transform: transform,
              fill: fill,
              stroke: stroke,
              className: className.toString(),
              href: href.substring(0, 50) + (href.length > 50 ? '...' : ''), // Truncate long hrefs
              id: element.id || '',
              dataAttributes: Array.from(element.attributes)
                .filter(attr => attr.name.startsWith('data-'))
                .map(attr => `${attr.name}="${attr.value}"`)
                .join(' ')
            });
          }
        }
      });
    });

    return results;
  });

  console.log(`📍 Found ${positionData.length} positioning elements in ${appName}`);

  // Log detailed breakdown for debugging
  const breakdown = positionData.reduce((acc, item) => {
    const key = `${item.elementType}-${item.color}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  console.log(`   Breakdown:`, breakdown);

  return positionData;
}

async function comparePositions(legacyData, modernData) {
  console.log('\n📊 COMPARISON ANALYSIS:');
  console.log(`Legacy elements: ${legacyData.length}`);
  console.log(`Modern elements: ${modernData.length}`);

  if (legacyData.length === 0 && modernData.length === 0) {
    console.log('⚠️ No positioning elements found in either app');
    return;
  }

  // Group by element type first
  const legacyByType = groupByElementType(legacyData);
  const modernByType = groupByElementType(modernData);

  console.log('\n🔍 Element Type Analysis:');
  console.log('Legacy types:', Object.keys(legacyByType));
  console.log('Modern types:', Object.keys(modernByType));

  // Group by color for prop comparison
  const legacyByColor = groupByColor(legacyData);
  const modernByColor = groupByColor(modernData);

  console.log('\n🎨 Color-based comparison:');
  const allColors = new Set([...Object.keys(legacyByColor), ...Object.keys(modernByColor)]);

  for (const color of allColors) {
    const legacyItems = legacyByColor[color] || [];
    const modernItems = modernByColor[color] || [];

    console.log(`\n   ${color.toUpperCase()}:`);
    console.log(`     Legacy: ${legacyItems.length} elements (${legacyItems.map(i => i.elementType).join(', ')})`);
    console.log(`     Modern: ${modernItems.length} elements (${modernItems.map(i => i.elementType).join(', ')})`);

    if (legacyItems.length > 0 && modernItems.length > 0) {
      const legacyAvg = calculateAverage(legacyItems);
      const modernAvg = calculateAverage(modernItems);

      const diffX = Math.abs(legacyAvg.x - modernAvg.x);
      const diffY = Math.abs(legacyAvg.y - modernAvg.y);

      console.log(`     Legacy avg position: (${legacyAvg.x.toFixed(1)}, ${legacyAvg.y.toFixed(1)})`);
      console.log(`     Modern avg position: (${modernAvg.x.toFixed(1)}, ${modernAvg.y.toFixed(1)})`);
      console.log(`     Position difference: (${diffX.toFixed(1)}, ${diffY.toFixed(1)}) pixels`);

      if (diffX > 5 || diffY > 5) {
        console.log(`     ⚠️ SIGNIFICANT DIFFERENCE DETECTED!`);
      } else {
        console.log(`     ✅ Positions are similar`);
      }

      // Show individual positions for props
      if (color === 'blue' || color === 'red') {
        console.log(`     Legacy ${color} positions:`, legacyItems.map(i => `(${i.x.toFixed(1)}, ${i.y.toFixed(1)})`));
        console.log(`     Modern ${color} positions:`, modernItems.map(i => `(${i.x.toFixed(1)}, ${i.y.toFixed(1)})`));
      }
    } else if (legacyItems.length !== modernItems.length) {
      console.log(`     ⚠️ ELEMENT COUNT MISMATCH!`);
    }
  }
}

function groupByColor(data) {
  return data.reduce((acc, item) => {
    if (!acc[item.color]) acc[item.color] = [];
    acc[item.color].push(item);
    return acc;
  }, {});
}

function groupByElementType(data) {
  return data.reduce((acc, item) => {
    if (!acc[item.elementType]) acc[item.elementType] = [];
    acc[item.elementType].push(item);
    return acc;
  }, {});
}

function calculateAverage(items) {
  const sum = items.reduce((acc, item) => ({
    x: acc.x + item.x,
    y: acc.y + item.y
  }), { x: 0, y: 0 });

  return {
    x: sum.x / items.length,
    y: sum.y / items.length
  };
}

async function main() {
  console.log('🚀 Starting Start Position Comparison...\n');

  const browser = await chromium.launch({ headless: false });

  try {
    // Create contexts for both apps
    const legacyContext = await browser.newContext();
    const modernContext = await browser.newContext();

    const legacyPage = await legacyContext.newPage();
    const modernPage = await modernContext.newPage();

    // Navigate to both apps
    console.log('🔍 Loading Legacy App...');
    await legacyPage.goto('http://localhost:5175');
    await legacyPage.waitForLoadState('networkidle');

    console.log('🔍 Loading Modern App...');
    await modernPage.goto('http://localhost:5177');
    await modernPage.waitForLoadState('networkidle');

    // Navigate to construct tabs
    const legacySuccess = await navigateToConstructTab(legacyPage, 'Legacy');
    const modernSuccess = await navigateToConstructTab(modernPage, 'Modern');

    if (!legacySuccess || !modernSuccess) {
      console.log('❌ Failed to navigate to construct tabs');
      return;
    }

    // Extract positioning data
    const legacyData = await extractPositionData(legacyPage, 'Legacy');
    const modernData = await extractPositionData(modernPage, 'Modern');

    // Compare the data
    await comparePositions(legacyData, modernData);

    console.log('\n✅ Comparison complete!');
    console.log('\nBrowser windows left open for manual inspection.');
    console.log('Press Ctrl+C to close when done.');

    // Keep browsers open for manual inspection
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Error during comparison:', error);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
