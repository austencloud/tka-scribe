/**
 * Comprehensive Beta Positioning Test
 * 
 * Tests all beta positioning scenarios to ensure the direction calculator
 * works correctly in every case, matching legacy behavior.
 */

import { BetaPropDirectionCalculator } from '../modern_web/src/lib/services/implementations/BetaPropDirectionCalculator.js';
import { BetaOffsetCalculator } from '../modern_web/src/lib/services/implementations/BetaOffsetCalculator.js';

// Test data for all possible scenarios
const TEST_SCENARIOS = [
  // Diamond grid positions (N, S, E, W)
  {
    name: 'North Diamond - Radial',
    location: 'n',
    gridMode: 'diamond',
    isRadial: true,
    expectedDirections: { red: 'right', blue: 'left' },
    expectedOffsets: { red: { x: 25, y: 0 }, blue: { x: -25, y: 0 } }
  },
  {
    name: 'North Diamond - Non-Radial',
    location: 'n',
    gridMode: 'diamond',
    isRadial: false,
    expectedDirections: { red: 'up', blue: 'down' },
    expectedOffsets: { red: { x: 0, y: -25 }, blue: { x: 0, y: 25 } }
  },
  {
    name: 'South Diamond - Radial',
    location: 's',
    gridMode: 'diamond',
    isRadial: true,
    expectedDirections: { red: 'left', blue: 'right' },
    expectedOffsets: { red: { x: -25, y: 0 }, blue: { x: 25, y: 0 } }
  },
  {
    name: 'South Diamond - Non-Radial',
    location: 's',
    gridMode: 'diamond',
    isRadial: false,
    expectedDirections: { red: 'down', blue: 'up' },
    expectedOffsets: { red: { x: 0, y: 25 }, blue: { x: 0, y: -25 } }
  },
  {
    name: 'East Diamond - Radial',
    location: 'e',
    gridMode: 'diamond',
    isRadial: true,
    expectedDirections: { red: 'down', blue: 'up' },
    expectedOffsets: { red: { x: 0, y: 25 }, blue: { x: 0, y: -25 } }
  },
  {
    name: 'East Diamond - Non-Radial',
    location: 'e',
    gridMode: 'diamond',
    isRadial: false,
    expectedDirections: { red: 'right', blue: 'left' },
    expectedOffsets: { red: { x: 25, y: 0 }, blue: { x: -25, y: 0 } }
  },
  {
    name: 'West Diamond - Radial',
    location: 'w',
    gridMode: 'diamond',
    isRadial: true,
    expectedDirections: { red: 'up', blue: 'down' },
    expectedOffsets: { red: { x: 0, y: -25 }, blue: { x: 0, y: 25 } }
  },
  {
    name: 'West Diamond - Non-Radial',
    location: 'w',
    gridMode: 'diamond',
    isRadial: false,
    expectedDirections: { red: 'left', blue: 'right' },
    expectedOffsets: { red: { x: -25, y: 0 }, blue: { x: 25, y: 0 } }
  },

  // Box grid positions (NE, SE, SW, NW)
  {
    name: 'Northeast Box - Radial',
    location: 'ne',
    gridMode: 'box',
    isRadial: true,
    expectedDirections: { red: 'downright', blue: 'upleft' },
    expectedOffsets: { red: { x: 25, y: 25 }, blue: { x: -25, y: -25 } }
  },
  {
    name: 'Northeast Box - Non-Radial',
    location: 'ne',
    gridMode: 'box',
    isRadial: false,
    expectedDirections: { red: 'upleft', blue: 'downright' },
    expectedOffsets: { red: { x: -25, y: -25 }, blue: { x: 25, y: 25 } }
  },
  {
    name: 'Southeast Box - Radial',
    location: 'se',
    gridMode: 'box',
    isRadial: true,
    expectedDirections: { red: 'upright', blue: 'downleft' },
    expectedOffsets: { red: { x: 25, y: -25 }, blue: { x: -25, y: 25 } }
  },
  {
    name: 'Southeast Box - Non-Radial',
    location: 'se',
    gridMode: 'box',
    isRadial: false,
    expectedDirections: { red: 'upright', blue: 'downleft' },
    expectedOffsets: { red: { x: 25, y: -25 }, blue: { x: -25, y: 25 } }
  },
  {
    name: 'Southwest Box - Radial',
    location: 'sw',
    gridMode: 'box',
    isRadial: true,
    expectedDirections: { red: 'downright', blue: 'upleft' },
    expectedOffsets: { red: { x: 25, y: 25 }, blue: { x: -25, y: -25 } }
  },
  {
    name: 'Southwest Box - Non-Radial',
    location: 'sw',
    gridMode: 'box',
    isRadial: false,
    expectedDirections: { red: 'upleft', blue: 'downright' },
    expectedOffsets: { red: { x: -25, y: -25 }, blue: { x: 25, y: 25 } }
  },
  {
    name: 'Northwest Box - Radial',
    location: 'nw',
    gridMode: 'box',
    isRadial: true,
    expectedDirections: { red: 'upright', blue: 'downleft' },
    expectedOffsets: { red: { x: 25, y: -25 }, blue: { x: -25, y: 25 } }
  },
  {
    name: 'Northwest Box - Non-Radial',
    location: 'nw',
    gridMode: 'box',
    isRadial: false,
    expectedDirections: { red: 'downleft', blue: 'upright' },
    expectedOffsets: { red: { x: -25, y: 25 }, blue: { x: 25, y: -25 } }
  }
];

/**
 * Create motion data for testing
 */
function createMotionData(location, isRadial) {
  const orientation = isRadial ? 'in' : 'out'; // Radial uses 'in', non-radial uses 'out'
  
  return {
    red: {
      motion_type: 'static',
      start_loc: location,
      end_loc: location,
      start_ori: orientation,
      end_ori: orientation,
      color: 'red'
    },
    blue: {
      motion_type: 'static',
      start_loc: location,
      end_loc: location,
      start_ori: orientation,
      end_ori: orientation,
      color: 'blue'
    }
  };
}

/**
 * Create prop data for testing
 */
function createPropData(color, location) {
  return {
    id: `${color}-prop`,
    color: color,
    location: location,
    prop_type: 'staff'
  };
}

/**
 * Run comprehensive beta positioning tests
 */
function runBetaPositioningTests() {
  console.log('🧪 Starting Comprehensive Beta Positioning Tests...\n');
  
  let passedTests = 0;
  let failedTests = 0;
  const failures = [];

  for (const scenario of TEST_SCENARIOS) {
    console.log(`📋 Testing: ${scenario.name}`);
    
    try {
      // Create motion data
      const motionData = createMotionData(scenario.location, scenario.isRadial);
      
      // Create direction calculator
      const directionCalculator = new BetaPropDirectionCalculator(motionData);
      
      // Create prop data
      const redProp = createPropData('red', scenario.location);
      const blueProp = createPropData('blue', scenario.location);
      
      // Test red prop direction
      const redDirection = directionCalculator.getDirection(redProp);
      const blueDirection = directionCalculator.getDirection(blueProp);
      
      // Create offset calculator
      const offsetCalculator = new BetaOffsetCalculator();
      
      // Calculate offsets
      const redOffset = offsetCalculator.calculateNewPositionWithOffset({ x: 0, y: 0 }, redDirection);
      const blueOffset = offsetCalculator.calculateNewPositionWithOffset({ x: 0, y: 0 }, blueDirection);
      
      // Validate directions
      const redDirectionCorrect = redDirection === scenario.expectedDirections.red;
      const blueDirectionCorrect = blueDirection === scenario.expectedDirections.blue;
      
      // Validate offsets
      const redOffsetCorrect = redOffset.x === scenario.expectedOffsets.red.x && 
                              redOffset.y === scenario.expectedOffsets.red.y;
      const blueOffsetCorrect = blueOffset.x === scenario.expectedOffsets.blue.x && 
                               blueOffset.y === scenario.expectedOffsets.blue.y;
      
      if (redDirectionCorrect && blueDirectionCorrect && redOffsetCorrect && blueOffsetCorrect) {
        console.log(`   ✅ PASS - Red: ${redDirection} (${redOffset.x}, ${redOffset.y}), Blue: ${blueDirection} (${blueOffset.x}, ${blueOffset.y})`);
        passedTests++;
      } else {
        console.log(`   ❌ FAIL`);
        console.log(`      Expected - Red: ${scenario.expectedDirections.red} (${scenario.expectedOffsets.red.x}, ${scenario.expectedOffsets.red.y}), Blue: ${scenario.expectedDirections.blue} (${scenario.expectedOffsets.blue.x}, ${scenario.expectedOffsets.blue.y})`);
        console.log(`      Actual   - Red: ${redDirection} (${redOffset.x}, ${redOffset.y}), Blue: ${blueDirection} (${blueOffset.x}, ${blueOffset.y})`);
        failedTests++;
        failures.push({
          scenario: scenario.name,
          expected: scenario,
          actual: { redDirection, blueDirection, redOffset, blueOffset }
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

// Run the tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runBetaPositioningTests, TEST_SCENARIOS };
} else {
  runBetaPositioningTests();
}
