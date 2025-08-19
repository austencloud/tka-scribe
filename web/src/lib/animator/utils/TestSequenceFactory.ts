/**
 * Test Sequence Factory
 *
 * Creates test sequences for animation testing and development.
 * Extracted from deprecated data-converter.ts
 */

import {
  MotionType as MotionTypeEnum,
  Orientation as OrientationEnum,
  RotationDirection,
  Location,
} from "$lib/domain/enums";
import type { SequenceData } from "$lib/domain";
import {
  createBeatData,
  createPictographData,
  createSequenceData,
} from "$lib/domain";

/**
 * Create a simple test sequence for animation demonstration
 */
export function createTestSequence(
  word: string = "TEST",
  author: string = "Test Factory"
): SequenceData {
  // Create 4 test beats with simple motions
  const testBeats = [
    // Beat 1: Blue moves from s to e, Red stays at n
    createBeatData({
      id: "test-beat-1",
      beatNumber: 1,
      duration: 1,
      pictographData: createPictographData({
        id: "test-pictograph-1",
        letter: word[0] || "T",
        motions: {
          blue: {
            start_loc: Location.SOUTH,
            end_loc: Location.EAST,
            startOrientation: OrientationEnum.IN,
            endOrientation: OrientationEnum.IN,
            motionType: MotionTypeEnum.PRO,
            rotationDirection: RotationDirection.CLOCKWISE,
            turns: 1,
            is_visible: true,
          },
          red: {
            start_loc: Location.NORTH,
            end_loc: Location.NORTH,
            startOrientation: OrientationEnum.IN,
            endOrientation: OrientationEnum.IN,
            motionType: MotionTypeEnum.STATIC,
            rotationDirection: RotationDirection.NO_ROTATION,
            turns: 0,
            is_visible: true,
          },
        },
      }),
    }),

    // Beat 2: Blue moves from e to n, Red moves from n to w
    createBeatData({
      id: "test-beat-2",
      beatNumber: 2,
      duration: 1,
      pictographData: createPictographData({
        id: "test-pictograph-2",
        letter: word[1] || "E",
        motions: {
          blue: {
            start_loc: Location.EAST,
            end_loc: Location.NORTH,
            startOrientation: OrientationEnum.IN,
            endOrientation: OrientationEnum.IN,
            motionType: MotionTypeEnum.PRO,
            rotationDirection: RotationDirection.CLOCKWISE,
            turns: 1,
            is_visible: true,
          },
          red: {
            start_loc: Location.NORTH,
            end_loc: Location.WEST,
            startOrientation: OrientationEnum.IN,
            endOrientation: OrientationEnum.IN,
            motionType: MotionTypeEnum.ANTI,
            rotationDirection: RotationDirection.COUNTER_CLOCKWISE,
            turns: 1,
            is_visible: true,
          },
        },
      }),
    }),

    // Beat 3: Blue moves from n to w, Red moves from w to s
    createBeatData({
      id: "test-beat-3",
      beatNumber: 3,
      duration: 1,
      pictographData: createPictographData({
        id: "test-pictograph-3",
        letter: word[2] || "S",
        motions: {
          blue: {
            start_loc: Location.NORTH,
            end_loc: Location.WEST,
            startOrientation: OrientationEnum.IN,
            endOrientation: OrientationEnum.IN,
            motionType: MotionTypeEnum.PRO,
            rotationDirection: RotationDirection.CLOCKWISE,
            turns: 1,
            is_visible: true,
          },
          red: {
            start_loc: Location.WEST,
            end_loc: Location.SOUTH,
            startOrientation: OrientationEnum.IN,
            endOrientation: OrientationEnum.IN,
            motionType: MotionTypeEnum.ANTI,
            rotationDirection: RotationDirection.COUNTER_CLOCKWISE,
            turns: 1,
            is_visible: true,
          },
        },
      }),
    }),

    // Beat 4: Both return to start positions
    createBeatData({
      id: "test-beat-4",
      beatNumber: 4,
      duration: 1,
      pictographData: createPictographData({
        id: "test-pictograph-4",
        letter: word[3] || "T",
        motions: {
          blue: {
            start_loc: Location.WEST,
            end_loc: Location.SOUTH,
            startOrientation: OrientationEnum.IN,
            endOrientation: OrientationEnum.IN,
            motionType: MotionTypeEnum.PRO,
            rotationDirection: RotationDirection.CLOCKWISE,
            turns: 1,
            is_visible: true,
          },
          red: {
            start_loc: Location.SOUTH,
            end_loc: Location.NORTH,
            startOrientation: OrientationEnum.IN,
            endOrientation: OrientationEnum.IN,
            motionType: MotionTypeEnum.ANTI,
            rotationDirection: RotationDirection.COUNTER_CLOCKWISE,
            turns: 1,
            is_visible: true,
          },
        },
      }),
    }),
  ];

  // Create the sequence
  return createSequenceData({
    id: `test-sequence-${Date.now()}`,
    name: `Test Sequence: ${word}`,
    word: word,
    beats: testBeats,
    metadata: {
      author: author,
      level: 1,
      description: "Test sequence created for animation demonstration",
    },
  });
}

/**
 * Create a simple single-beat test sequence
 */
export function createSingleBeatTestSequence(
  motionType: MotionTypeEnum = MotionTypeEnum.PRO
): SequenceData {
  const testBeat = createBeatData({
    id: "single-test-beat",
    beatNumber: 1,
    duration: 1,
    pictographData: createPictographData({
      id: "single-test-pictograph",
      letter: "T",
      motions: {
        blue: {
          start_loc: Location.SOUTH,
          end_loc: Location.EAST,
          startOrientation: OrientationEnum.IN,
          endOrientation: OrientationEnum.IN,
          motionType: motionType,
          rotationDirection: RotationDirection.CLOCKWISE,
          turns: motionType === MotionTypeEnum.STATIC ? 0 : 1,
          is_visible: true,
        },
        red: {
          start_loc: Location.NORTH,
          end_loc: Location.WEST,
          startOrientation: OrientationEnum.IN,
          endOrientation: OrientationEnum.IN,
          motionType: motionType,
          rotationDirection: RotationDirection.COUNTER_CLOCKWISE,
          turns: motionType === MotionTypeEnum.STATIC ? 0 : 1,
          is_visible: true,
        },
      },
    }),
  });

  return createSequenceData({
    id: `single-beat-test-${Date.now()}`,
    name: `Single Beat Test: ${motionType}`,
    word: "T",
    beats: [testBeat],
    metadata: {
      author: "Test Factory",
      level: 1,
      description: `Single beat test sequence with ${motionType} motion`,
    },
  });
}
