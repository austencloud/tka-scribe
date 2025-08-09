/**
 * Comprehensive Beta Positioning Browser Test
 *
 * Tests all beta positioning scenarios by loading the modern app
 * and validating the direction calculator works correctly in every case.
 */

import { chromium } from 'playwright';

// Test scenarios covering all possible beta positioning cases
const TEST_SCENARIOS = [
  // Diamond grid positions (N, S, E, W) - both radial and non-radial
  { name: 'North Diamond - Radial', location: 'n', isRadial: true, expectedRed: 'right', expectedBlue: 'left' },
  { name: 'North Diamond - Non-Radial', location: 'n', isRadial: false, expectedRed: 'up', expectedBlue: 'down' },
  { name: 'South Diamond - Radial', location: 's', isRadial: true, expectedRed: 'left', expectedBlue: 'right' },
  { name: 'South Diamond - Non-Radial', location: 's', isRadial: false, expectedRed: 'down', expectedBlue: 'up' },
  { name: 'East Diamond - Radial', location: 'e', isRadial: true, expectedRed: 'down', expectedBlue: 'up' },
  { name: 'East Diamond - Non-Radial', location: 'e', isRadial: false, expectedRed: 'right', expectedBlue: 'left' },
  { name: 'West Diamond - Radial', location: 'w', isRadial: true, expectedRed: 'up', expectedBlue: 'down' },
  { name: 'West Diamond - Non-Radial', location: 'w', isRadial: false, expectedRed: 'left', expectedBlue: 'right' },

  // Box grid positions (NE, SE, SW, NW) - both radial and non-radial
  { name: 'Northeast Box - Radial', location: 'ne', isRadial: true, expectedRed: 'downright', expectedBlue: 'upleft' },
  { name: 'Northeast Box - Non-Radial', location: 'ne', isRadial: false, expectedRed: 'upleft', expectedBlue: 'downright' },
  { name: 'Southeast Box - Radial', location: 'se', isRadial: true, expectedRed: 'upright', expectedBlue: 'downleft' },
  { name: 'Southeast Box - Non-Radial', location: 'se', isRadial: false, expectedRed: 'upright', expectedBlue: 'downleft' },
  { name: 'Southwest Box - Radial', location: 'sw', isRadial: true, expectedRed: 'downright', expectedBlue: 'upleft' },
  { name: 'Southwest Box - Non-Radial', location: 'sw', isRadial: false, expectedRed: 'upleft', expectedBlue: 'downright' },
  { name: 'Northwest Box - Radial', location: 'nw', isRadial: true, expectedRed: 'upright', expectedBlue: 'downleft' },
  { name: 'Northwest Box - Non-Radial', location: 'nw', isRadial: false, expectedRed: 'downleft', expectedBlue: 'upright' }
];

async function runBetaPositioningTests() {
  console.log('🧪 Starting Comprehensive Beta Positioning Browser Tests...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  let passedTests = 0;
  let failedTests = 0;
  const failures = [];

  try {
    // Navigate to modern app
    await page.goto('http://localhost:5177');
    await page.waitForLoadState('networkidle');

    for (const scenario of TEST_SCENARIOS) {
      console.log(`📋 Testing: ${scenario.name}`);

      try {
        // Test the direction calculator logic in the browser
        const result = await page.evaluate(async (testScenario) => {
          // Import the classes dynamically in the browser
          const { BetaPropDirectionCalculator } = await import('/src/lib/services/implementations/BetaPropDirectionCalculator.js');
          const { BetaOffsetCalculator } = await import('/src/lib/services/implementations/BetaOffsetCalculator.js');

          // Create motion data for the test scenario
          const orientation = testScenario.isRadial ? 'in' : 'out';
          const motionData = {
            red: {
              motion_type: 'static',
              start_loc: testScenario.location,
              end_loc: testScenario.location,
              start_ori: orientation,
              end_ori: orientation,
              color: 'red'
            },
            blue: {
              motion_type: 'static',
              start_loc: testScenario.location,
              end_loc: testScenario.location,
              start_ori: orientation,
              end_ori: orientation,
              color: 'blue'
            }
          };

          // Create prop data
          const redProp = {
            id: 'red-prop',
            color: 'red',
            location: testScenario.location,
            prop_type: 'staff'
          };

          const blueProp = {
            id: 'blue-prop',
            color: 'blue',
            location: testScenario.location,
            prop_type: 'staff'
          };

          // Create direction calculator
          const directionCalculator = new BetaPropDirectionCalculator(motionData);

          // Get directions
          const redDirection = directionCalculator.getDirection(redProp);
          const blueDirection = directionCalculator.getDirection(blueProp);

          // Create offset calculator
          const offsetCalculator = new BetaOffsetCalculator();

          // Calculate offsets
          const redOffset = offsetCalculator.calculateNewPositionWithOffset({ x: 0, y: 0 }, redDirection);
          const blueOffset = offsetCalculator.calculateNewPositionWithOffset({ x: 0, y: 0 }, blueDirection);

          return {
            redDirection,
            blueDirection,
            redOffset,
            blueOffset
          };
        }, scenario);

        // Validate results
        const redDirectionCorrect = result.redDirection === scenario.expectedRed;
        const blueDirectionCorrect = result.blueDirection === scenario.expectedBlue;

        // Calculate expected offsets based on directions
        const expectedRedOffset = getExpectedOffset(scenario.expectedRed);
        const expectedBlueOffset = getExpectedOffset(scenario.expectedBlue);

        const redOffsetCorrect = result.redOffset.x === expectedRedOffset.x &&
                                result.redOffset.y === expectedRedOffset.y;
        const blueOffsetCorrect = result.blueOffset.x === expectedBlueOffset.x &&
                                 result.blueOffset.y === expectedBlueOffset.y;

        if (redDirectionCorrect && blueDirectionCorrect && redOffsetCorrect && blueOffsetCorrect) {
          console.log(`   ✅ PASS - Red: ${result.redDirection} (${result.redOffset.x}, ${result.redOffset.y}), Blue: ${result.blueDirection} (${result.blueOffset.x}, ${result.blueOffset.y})`);
          passedTests++;
        } else {
          console.log(`   ❌ FAIL`);
          console.log(`      Expected - Red: ${scenario.expectedRed} (${expectedRedOffset.x}, ${expectedRedOffset.y}), Blue: ${scenario.expectedBlue} (${expectedBlueOffset.x}, ${expectedBlueOffset.y})`);
          console.log(`      Actual   - Red: ${result.redDirection} (${result.redOffset.x}, ${result.redOffset.y}), Blue: ${result.blueDirection} (${result.blueOffset.x}, ${result.blueOffset.y})`);
          failedTests++;
          failures.push({
            scenario: scenario.name,
            expected: { red: scenario.expectedRed, blue: scenario.expectedBlue, redOffset: expectedRedOffset, blueOffset: expectedBlueOffset },
            actual: result
          });
        }

      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        failedTests++;
        failures.push({
          scenario: scenario.name,
          error: error.message
        });
      }

      console.log('');
    }

  } finally {
    await browser.close();
  }

  // Summary
  console.log('📊 TEST SUMMARY:');
  console.log(`   ✅ Passed: ${passedTests}`);
  console.log(`   ❌ Failed: ${failedTests}`);
  console.log(`   📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);

  if (failures.length > 0) {
    console.log('\n🔍 FAILURE DETAILS:');
    failures.forEach(failure => {
      console.log(`   - ${failure.scenario}: ${failure.error || 'Direction/offset mismatch'}`);
    });
  }

  return { passedTests, failedTests, failures };
}

/**
 * Get expected pixel offset for a direction
 */
function getExpectedOffset(direction) {
  const distance = 25;

  switch (direction) {
    case 'up': return { x: 0, y: -distance };
    case 'down': return { x: 0, y: distance };
    case 'left': return { x: -distance, y: 0 };
    case 'right': return { x: distance, y: 0 };
    case 'upright': return { x: distance, y: -distance };
    case 'downright': return { x: distance, y: distance };
    case 'upleft': return { x: -distance, y: -distance };
    case 'downleft': return { x: -distance, y: distance };
    default: return { x: 0, y: 0 };
  }
}

// Run the tests
runBetaPositioningTests().catch(console.error);
