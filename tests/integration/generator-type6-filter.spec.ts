/**
 * Test: Type 6 Pictograph Filtering in Generator
 *
 * Validates that the generator correctly filters Type 6 (static) pictographs:
 * - Level 1: No Type 6 pictographs should appear at all
 * - Level 2+: Type 6 pictographs should only appear if they have turns > 0
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { container } from '$lib/shared/inversify/container';
import { TYPES } from '$lib/shared/inversify/types';
import type { ISequenceGenerationService } from '$lib/features/create/generate/shared/services/contracts/ISequenceGenerationService';
import { getLetterType } from '$lib/shared/foundation/domain/models/Letter';
import { LetterType } from '$lib/shared/foundation/domain/models/LetterType';
import { GridMode } from '$lib/shared/pictograph/grid/domain/enums/grid-enums';

describe('Generator Type 6 Filtering', () => {
  let sequenceGenerationService: ISequenceGenerationService;

  beforeAll(() => {
    sequenceGenerationService = container.get<ISequenceGenerationService>(
      TYPES.ISequenceGenerationService
    );
  });

  describe('Level 1 (Beginner - No Turns)', () => {
    it('should exclude ALL Type 6 pictographs from generated sequences', async () => {
      const testCount = 20;
      const violations: any[] = [];

      for (let i = 0; i < testCount; i++) {
        const sequence = await sequenceGenerationService.generateSequence({
          difficulty: 'Beginner',
          length: 16,
          gridMode: GridMode.DIAMOND,
          turnIntensity: 1,
          propContinuity: 'continuous'
        });

        // Check each beat
        for (let beatIndex = 0; beatIndex < sequence.beats.length; beatIndex++) {
          const beat = sequence.beats[beatIndex];

          if (beat.letter) {
            const letterType = getLetterType(beat.letter);

            if (letterType === LetterType.TYPE6) {
              violations.push({
                sequence: i + 1,
                beat: beatIndex,
                letter: beat.letter,
                blueTurns: beat.blueMotion?.turns ?? 0,
                redTurns: beat.redMotion?.turns ?? 0
              });
            }
          }
        }
      }

      if (violations.length > 0) {
        console.error('❌ Level 1 violations found:');
        violations.forEach(v => {
          console.error(
            `  Sequence ${v.sequence}, Beat ${v.beat}: ${v.letter} ` +
            `(blue: ${v.blueTurns}, red: ${v.redTurns})`
          );
        });
      }

      expect(violations).toHaveLength(0);
    }, 60000);
  });

  describe('Level 2 (Intermediate - With Turns)', () => {
    it('should allow Type 6 pictographs ONLY if they have turns > 0', async () => {
      const testCount = 20;
      const violations: any[] = [];
      let type6WithTurnsFound = false;

      for (let i = 0; i < testCount; i++) {
        const sequence = await sequenceGenerationService.generateSequence({
          difficulty: 'Intermediate',
          length: 16,
          gridMode: GridMode.DIAMOND,
          turnIntensity: 1,
          propContinuity: 'continuous'
        });

        // Check each beat
        for (let beatIndex = 0; beatIndex < sequence.beats.length; beatIndex++) {
          const beat = sequence.beats[beatIndex];

          if (beat.letter) {
            const letterType = getLetterType(beat.letter);

            if (letterType === LetterType.TYPE6) {
              const blueTurns = beat.blueMotion?.turns ?? 0;
              const redTurns = beat.redMotion?.turns ?? 0;

              const blueHasTurns = blueTurns === 'fl' || blueTurns > 0;
              const redHasTurns = redTurns === 'fl' || redTurns > 0;

              if (blueHasTurns || redHasTurns) {
                type6WithTurnsFound = true;
              } else {
                // Type 6 without any turns - violation!
                violations.push({
                  sequence: i + 1,
                  beat: beatIndex,
                  letter: beat.letter,
                  blueTurns,
                  redTurns
                });
              }
            }
          }
        }
      }

      if (violations.length > 0) {
        console.error('❌ Level 2 violations found:');
        violations.forEach(v => {
          console.error(
            `  Sequence ${v.sequence}, Beat ${v.beat}: ${v.letter} ` +
            `(blue: ${v.blueTurns}, red: ${v.redTurns}) - NO TURNS!`
          );
        });
      }

      expect(violations).toHaveLength(0);

      // Optional: Log if we found Type 6 with turns (validates filter allows them)
      if (type6WithTurnsFound) {
        console.log('✅ Type 6 pictographs with turns were found (as expected)');
      }
    }, 60000);
  });

  describe('Level 3 (Advanced - With Turns)', () => {
    it('should allow Type 6 pictographs ONLY if they have turns > 0', async () => {
      const testCount = 10;
      const violations: any[] = [];

      for (let i = 0; i < testCount; i++) {
        const sequence = await sequenceGenerationService.generateSequence({
          difficulty: 'Advanced',
          length: 16,
          gridMode: GridMode.DIAMOND,
          turnIntensity: 1,
          propContinuity: 'continuous'
        });

        // Check each beat
        for (let beatIndex = 0; beatIndex < sequence.beats.length; beatIndex++) {
          const beat = sequence.beats[beatIndex];

          if (beat.letter) {
            const letterType = getLetterType(beat.letter);

            if (letterType === LetterType.TYPE6) {
              const blueTurns = beat.blueMotion?.turns ?? 0;
              const redTurns = beat.redMotion?.turns ?? 0;

              const blueHasTurns = blueTurns === 'fl' || blueTurns > 0;
              const redHasTurns = redTurns === 'fl' || redTurns > 0;

              if (!blueHasTurns && !redHasTurns) {
                violations.push({
                  sequence: i + 1,
                  beat: beatIndex,
                  letter: beat.letter,
                  blueTurns,
                  redTurns
                });
              }
            }
          }
        }
      }

      if (violations.length > 0) {
        console.error('❌ Level 3 violations found:');
        violations.forEach(v => {
          console.error(
            `  Sequence ${v.sequence}, Beat ${v.beat}: ${v.letter} ` +
            `(blue: ${v.blueTurns}, red: ${v.redTurns}) - NO TURNS!`
          );
        });
      }

      expect(violations).toHaveLength(0);
    }, 30000);
  });
});
