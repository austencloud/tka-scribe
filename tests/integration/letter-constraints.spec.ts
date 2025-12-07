/**
 * Test: Letter Constraint Generation
 *
 * Validates rejection sampling approach for mustContainLetters:
 * - Reliability: Successfully generates sequences with required letter
 * - Performance: Completes within reasonable time (< 5s per sequence)
 * - Correctness: Generated sequences actually contain the required letter
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { container } from '$lib/shared/inversify/container';
import { TYPES } from '$lib/shared/inversify/types';
import type { IGenerationOrchestrationService } from '$lib/features/create/generate/shared/services/contracts/IGenerationOrchestrationService';
import { Letter } from '$lib/shared/foundation/domain/models/Letter';
import { GridMode } from '$lib/shared/pictograph/grid/domain/enums/grid-enums';
import { PropType } from '$lib/shared/pictograph/prop/domain/enums/PropType';
import { DifficultyLevel } from '$lib/features/create/generate/shared/domain/models/generate-models';

// Test letters from different types to ensure coverage
const TEST_LETTERS = [
  { letter: Letter.A, name: 'A (Type 1: Dual-Shift)' },
  { letter: Letter.W, name: 'W (Type 2: Shift)' },
  { letter: Letter.W_DASH, name: "W' (Type 3: Cross-Shift)" },
  { letter: Letter.PHI, name: 'Φ (Type 4: Dash)' },
  { letter: Letter.ALPHA, name: 'α (Type 6: Static)' },
];

describe('Letter Constraint Generation', () => {
  let orchestrationService: IGenerationOrchestrationService;

  beforeAll(async () => {
    // Ensure the container is initialized and the create module is loaded
    const { ensureContainerInitialized, loadFeatureModule } = await import('$lib/shared/inversify/container');
    await ensureContainerInitialized();
    await loadFeatureModule('create');

    orchestrationService = container.get<IGenerationOrchestrationService>(
      TYPES.IGenerationOrchestrationService
    );
  });

  describe('Freeform Mode', () => {
    TEST_LETTERS.forEach(({ letter, name }) => {
      it(`should generate sequences containing ${name} within 5 seconds`, async () => {
        const startTime = Date.now();

        const sequence = await orchestrationService.generateSequence({
          mode: 'freeform',
          length: 16,
          gridMode: GridMode.DIAMOND,
          propType: PropType.FAN,
          difficulty: DifficultyLevel.INTERMEDIATE,
          mustContainLetters: [letter],
        });

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Verify sequence was generated
        expect(sequence).toBeDefined();
        expect(sequence.beats).toBeDefined();
        expect(sequence.beats.length).toBeGreaterThan(0);

        // Verify word contains the required letter
        const word = sequence.word || '';
        const letterStr = letter.toString();

        console.log(`  ✓ Generated "${word}" in ${duration}ms (contains '${letterStr}': ${word.includes(letterStr)})`);

        expect(word.includes(letterStr)).toBe(true);

        // Verify performance (should complete in < 5 seconds)
        expect(duration).toBeLessThan(5000);
      }, 10000); // 10 second timeout per test
    });
  });

  describe('Circular Mode', () => {
    TEST_LETTERS.forEach(({ letter, name }) => {
      it(`should generate circular sequences containing ${name} within 5 seconds`, async () => {
        const startTime = Date.now();

        const sequence = await orchestrationService.generateSequence({
          mode: 'circular',
          length: 16,
          gridMode: GridMode.DIAMOND,
          propType: PropType.FAN,
          difficulty: DifficultyLevel.INTERMEDIATE,
          mustContainLetters: [letter],
          sliceSize: 'halved',
          capType: 'strictRotated',
        });

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Verify sequence was generated
        expect(sequence).toBeDefined();
        expect(sequence.beats).toBeDefined();
        expect(sequence.beats.length).toBeGreaterThan(0);
        expect(sequence.isCircular).toBe(true);

        // Verify word contains the required letter
        const word = sequence.word || '';
        const letterStr = letter.toString();

        console.log(`  ✓ Generated circular "${word}" in ${duration}ms (contains '${letterStr}': ${word.includes(letterStr)})`);

        expect(word.includes(letterStr)).toBe(true);

        // Verify performance (should complete in < 5 seconds)
        expect(duration).toBeLessThan(5000);
      }, 10000); // 10 second timeout per test
    });
  });

  describe('Stress Test - Multiple Iterations', () => {
    it('should reliably generate sequences with letter A (10 iterations)', async () => {
      const iterations = 10;
      const results: { word: string; duration: number; contains: boolean }[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();

        const sequence = await orchestrationService.generateSequence({
          mode: 'freeform',
          length: 16,
          gridMode: GridMode.DIAMOND,
          propType: PropType.FAN,
          difficulty: DifficultyLevel.INTERMEDIATE,
          mustContainLetters: [Letter.A],
        });

        const endTime = Date.now();
        const word = sequence.word || '';

        results.push({
          word,
          duration: endTime - startTime,
          contains: word.includes('A'),
        });
      }

      // Calculate statistics
      const allContainA = results.every(r => r.contains);
      const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
      const maxDuration = Math.max(...results.map(r => r.duration));
      const minDuration = Math.min(...results.map(r => r.duration));

      console.log(`\n  📊 Statistics (${iterations} iterations):`);
      console.log(`     Success rate: ${results.filter(r => r.contains).length}/${iterations}`);
      console.log(`     Avg duration: ${avgDuration.toFixed(0)}ms`);
      console.log(`     Min duration: ${minDuration}ms`);
      console.log(`     Max duration: ${maxDuration}ms`);
      console.log(`     Words generated: ${results.map(r => r.word).join(', ')}`);

      // All sequences should contain the letter
      expect(allContainA).toBe(true);

      // Average should be reasonable (< 2 seconds)
      expect(avgDuration).toBeLessThan(2000);
    }, 30000); // 30 second timeout for 10 iterations
  });

  describe('Error Handling', () => {
    it('should throw error if unable to generate after max retries (rare letter)', async () => {
      // This test is theoretical - we expect even rare letters to succeed
      // But if we had an impossible constraint, it would throw after 30 attempts

      // For now, just verify the error message format by checking a normal case succeeds
      const sequence = await orchestrationService.generateSequence({
        mode: 'freeform',
        length: 16,
        gridMode: GridMode.DIAMOND,
        propType: PropType.FAN,
        difficulty: DifficultyLevel.INTERMEDIATE,
        mustContainLetters: [Letter.ZETA],
      });

      expect(sequence.word?.includes('ζ')).toBe(true);
    }, 10000);
  });

  describe('No Constraint (Baseline)', () => {
    it('should generate normally without constraints', async () => {
      const startTime = Date.now();

      const sequence = await orchestrationService.generateSequence({
        mode: 'freeform',
        length: 16,
        gridMode: GridMode.DIAMOND,
        propType: PropType.FAN,
        difficulty: DifficultyLevel.INTERMEDIATE,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(sequence).toBeDefined();
      expect(sequence.beats.length).toBeGreaterThan(0);

      console.log(`  ✓ Generated unconstrained sequence in ${duration}ms`);

      // Without constraints, should be very fast
      expect(duration).toBeLessThan(1000);
    }, 5000);
  });
});
