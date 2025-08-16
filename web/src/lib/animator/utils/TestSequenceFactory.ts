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
      beat_number: 1,
      duration: 1,
      pictograph_data: createPictographData({
        id: "test-pictograph-1",
        letter: word[0] || "T",
        motions: {
          blue: {
            start_loc: Location.SOUTH,
            end_loc: Location.EAST,
            start_ori: OrientationEnum.IN,
            end_ori: OrientationEnum.IN,
            motion_type: MotionTypeEnum.PRO,
            prop_rot_dir: RotationDirection.CLOCKWISE,
            turns: 1,
            is_visible: true,
          },
          red: {
            start_loc: Location.NORTH,
            end_loc: Location.NORTH,
            start_ori: OrientationEnum.IN,
            end_ori: OrientationEnum.IN,
            motion_type: MotionTypeEnum.STATIC,
            prop_rot_dir: RotationDirection.NO_ROTATION,
            turns: 0,
            is_visible: true,
          },
        },
      }),
    }),

    // Beat 2: Blue moves from e to n, Red moves from n to w
    createBeatData({
      id: "test-beat-2",
      beat_number: 2,
      duration: 1,
      pictograph_data: createPictographData({
        id: "test-pictograph-2",
        letter: word[1] || "E",
        motions: {
          blue: {
            start_loc: Location.EAST,
            end_loc: Location.NORTH,
            start_ori: OrientationEnum.IN,
            end_ori: OrientationEnum.IN,
            motion_type: MotionTypeEnum.PRO,
            prop_rot_dir: RotationDirection.CLOCKWISE,
            turns: 1,
            is_visible: true,
          },
          red: {
            start_loc: Location.NORTH,
            end_loc: Location.WEST,
            start_ori: OrientationEnum.IN,
            end_ori: OrientationEnum.IN,
            motion_type: MotionTypeEnum.ANTI,
            prop_rot_dir: RotationDirection.COUNTER_CLOCKWISE,
            turns: 1,
            is_visible: true,
          },
        },
      }),
    }),

    // Beat 3: Blue moves from n to w, Red moves from w to s
    createBeatData({
      id: "test-beat-3",
      beat_number: 3,
      duration: 1,
      pictograph_data: createPictographData({
        id: "test-pictograph-3",
        letter: word[2] || "S",
        motions: {
          blue: {
            start_loc: Location.NORTH,
            end_loc: Location.WEST,
            start_ori: OrientationEnum.IN,
            end_ori: OrientationEnum.IN,
            motion_type: MotionTypeEnum.PRO,
            prop_rot_dir: RotationDirection.CLOCKWISE,
            turns: 1,
            is_visible: true,
          },
          red: {
            start_loc: Location.WEST,
            end_loc: Location.SOUTH,
            start_ori: OrientationEnum.IN,
            end_ori: OrientationEnum.IN,
            motion_type: MotionTypeEnum.ANTI,
            prop_rot_dir: RotationDirection.COUNTER_CLOCKWISE,
            turns: 1,
            is_visible: true,
          },
        },
      }),
    }),

    // Beat 4: Both return to start positions
    createBeatData({
      id: "test-beat-4",
      beat_number: 4,
      duration: 1,
      pictograph_data: createPictographData({
        id: "test-pictograph-4",
        letter: word[3] || "T",
        motions: {
          blue: {
            start_loc: Location.WEST,
            end_loc: Location.SOUTH,
            start_ori: OrientationEnum.IN,
            end_ori: OrientationEnum.IN,
            motion_type: MotionTypeEnum.PRO,
            prop_rot_dir: RotationDirection.CLOCKWISE,
            turns: 1,
            is_visible: true,
          },
          red: {
            start_loc: Location.SOUTH,
            end_loc: Location.NORTH,
            start_ori: OrientationEnum.IN,
            end_ori: OrientationEnum.IN,
            motion_type: MotionTypeEnum.ANTI,
            prop_rot_dir: RotationDirection.COUNTER_CLOCKWISE,
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
    beat_number: 1,
    duration: 1,
    pictograph_data: createPictographData({
      id: "single-test-pictograph",
      letter: "T",
      motions: {
        blue: {
          start_loc: Location.SOUTH,
          end_loc: Location.EAST,
          start_ori: OrientationEnum.IN,
          end_ori: OrientationEnum.IN,
          motion_type: motionType,
          prop_rot_dir: RotationDirection.CLOCKWISE,
          turns: motionType === MotionTypeEnum.STATIC ? 0 : 1,
          is_visible: true,
        },
        red: {
          start_loc: Location.NORTH,
          end_loc: Location.WEST,
          start_ori: OrientationEnum.IN,
          end_ori: OrientationEnum.IN,
          motion_type: motionType,
          prop_rot_dir: RotationDirection.COUNTER_CLOCKWISE,
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
