/**
 * Test script to validate Type 6 filtering in generator
 *
 * Generates sequences at different difficulty levels and verifies:
 * - Level 1: No Type 6 pictographs appear
 * - Level 2+: Type 6 pictographs only appear with turns > 0
 */

import { container } from '../src/lib/shared/inversify/container.js';
import { TYPES } from '../src/lib/shared/inversify/types.js';
import { Letter, getLetterType } from '../src/lib/shared/foundation/domain/models/Letter.js';
import { LetterType } from '../src/lib/shared/foundation/domain/models/LetterType.js';
import { GridMode } from '../src/lib/shared/pictograph/grid/domain/enums/grid-enums.js';

// Type 6 letters for reference
const TYPE6_LETTERS = [
  Letter.ALPHA,
  Letter.BETA,
  Letter.GAMMA,
  Letter.ZETA,
  Letter.ETA,
  Letter.TAU,
  Letter.TERRA
];

async function testGeneratorFiltering() {
  console.log('🧪 Testing Type 6 Filtering in Generator\n');
  console.log('=' .repeat(70));

  // Get the sequence generation service
  const sequenceGenerationService = container.get(TYPES.ISequenceGenerationService);

  const results = {
    level1: { total: 0, violations: [], passed: 0, failed: 0 },
    level2: { total: 0, violations: [], passed: 0, failed: 0 },
    level3: { total: 0, violations: [], passed: 0, failed: 0 }
  };

  // Test configurations
  const tests = [
    { level: 1, difficulty: 'Beginner', count: 20 },
    { level: 2, difficulty: 'Intermediate', count: 20 },
    { level: 3, difficulty: 'Advanced', count: 10 }
  ];

  for (const test of tests) {
    console.log(`\n📊 Testing Level ${test.level} (${test.difficulty})`);
    console.log('-'.repeat(70));

    for (let i = 0; i < test.count; i++) {
      try {
        // Generate a sequence
        const options = {
          difficulty: test.difficulty,
          length: 16,
          gridMode: GridMode.DIAMOND,
          turnIntensity: 1,
          propContinuity: 'continuous'
        };

        const sequence = await sequenceGenerationService.generateSequence(options);
        results[`level${test.level}`].total++;

        // Check each beat in the sequence
        let hasViolation = false;
        const violations = [];

        for (let beatIndex = 0; beatIndex < sequence.beats.length; beatIndex++) {
          const beat = sequence.beats[beatIndex];

          if (!beat.letter) continue;

          const letterType = getLetterType(beat.letter);

          if (letterType === LetterType.TYPE6) {
            // Found a Type 6 pictograph
            const blueTurns = beat.blueMotion?.turns ?? 0;
            const redTurns = beat.redMotion?.turns ?? 0;

            if (test.level === 1) {
              // Level 1: ANY Type 6 is a violation
              hasViolation = true;
              violations.push({
                beat: beatIndex,
                letter: beat.letter,
                blueTurns,
                redTurns,
                reason: 'Type 6 found in Level 1 (should have NO Type 6)'
              });
            } else {
              // Level 2+: Type 6 without turns is a violation
              const blueHasTurns = blueTurns === 'fl' || blueTurns > 0;
              const redHasTurns = redTurns === 'fl' || redTurns > 0;

              if (!blueHasTurns && !redHasTurns) {
                hasViolation = true;
                violations.push({
                  beat: beatIndex,
                  letter: beat.letter,
                  blueTurns,
                  redTurns,
                  reason: 'Type 6 found without turns (should have turns > 0)'
                });
              }
            }
          }
        }

        if (hasViolation) {
          results[`level${test.level}`].failed++;
          results[`level${test.level}`].violations.push({
            sequenceNum: i + 1,
            violations
          });
          process.stdout.write('❌');
        } else {
          results[`level${test.level}`].passed++;
          process.stdout.write('✅');
        }

        if ((i + 1) % 10 === 0) {
          process.stdout.write(` (${i + 1}/${test.count})\n`);
        }

      } catch (error) {
        console.error(`\n⚠️  Error generating sequence ${i + 1}:`, error.message);
        results[`level${test.level}`].failed++;
      }
    }

    console.log('\n');
  }

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('📈 RESULTS SUMMARY');
  console.log('='.repeat(70));

  let allPassed = true;

  for (const [levelKey, result] of Object.entries(results)) {
    const level = levelKey.replace('level', '');
    console.log(`\nLevel ${level}:`);
    console.log(`  Total sequences: ${result.total}`);
    console.log(`  Passed: ${result.passed} ✅`);
    console.log(`  Failed: ${result.failed} ❌`);

    if (result.failed > 0) {
      allPassed = false;
      console.log(`\n  Violations:`);

      for (const seq of result.violations) {
        console.log(`    Sequence ${seq.sequenceNum}:`);
        for (const violation of seq.violations) {
          console.log(`      - Beat ${violation.beat}: ${violation.letter}`);
          console.log(`        Blue turns: ${violation.blueTurns}, Red turns: ${violation.redTurns}`);
          console.log(`        Reason: ${violation.reason}`);
        }
      }
    }
  }

  console.log('\n' + '='.repeat(70));
  if (allPassed) {
    console.log('✅ ALL TESTS PASSED! Type 6 filtering is working correctly.');
  } else {
    console.log('❌ SOME TESTS FAILED! Type 6 filtering has issues.');
  }
  console.log('='.repeat(70) + '\n');

  return allPassed;
}

// Run the test
testGeneratorFiltering()
  .then(passed => {
    process.exit(passed ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
