import type { MotionType, Loc, PropRotDir, Orientation } from './Types.js';

/**
 * Motion data interface for TKA constructor
 */
export interface MotionData {
  motion_type: MotionType;
  prop_rot_dir: PropRotDir;
  start_loc: Loc;
  end_loc: Loc;
  turns: number;
  start_ori: Orientation;
  end_ori: Orientation;
}

/**
 * Create a default motion data object
 */
export function createDefaultMotionData(): MotionData {
  return {
    motion_type: 'pro',
    prop_rot_dir: 'cw',
    start_loc: 'n',
    end_loc: 'e',
    turns: 0,
    start_ori: 'in',
    end_ori: 'in'
  };
}
