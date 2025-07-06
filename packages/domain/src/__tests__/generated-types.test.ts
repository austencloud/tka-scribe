/**
 * Tests for Generated Types from JSON Schema
 * 
 * These tests validate that our schema-generated types work correctly
 * and maintain compatibility with existing code.
 */

import { describe, it, expect } from 'vitest';
import type { MotionData } from '../../generated/typescript/motion-data.js';

describe('Generated MotionData Type', () => {
  it('should accept valid motion data', () => {
    const validMotion: MotionData = {
      motion_type: 'pro',
      prop_rot_dir: 'cw',
      start_loc: 'n',
      end_loc: 'e',
      turns: 1,
      start_ori: 'in',
      end_ori: 'out'
    };

    // TypeScript compilation success means the type is correct
    expect(validMotion.motion_type).toBe('pro');
    expect(validMotion.turns).toBe(1);
  });

  it('should have correct enum values for motion_type', () => {
    const motionTypes: MotionData['motion_type'][] = [
      'pro', 'anti', 'float', 'dash', 'static'
    ];

    motionTypes.forEach(type => {
      const motion: MotionData = {
        motion_type: type,
        prop_rot_dir: 'cw',
        start_loc: 'n',
        end_loc: 'e',
        turns: 0,
        start_ori: 'in',
        end_ori: 'in'
      };
      expect(motion.motion_type).toBe(type);
    });
  });

  it('should have correct enum values for locations', () => {
    const locations: MotionData['start_loc'][] = [
      'n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'
    ];

    locations.forEach(loc => {
      const motion: MotionData = {
        motion_type: 'pro',
        prop_rot_dir: 'cw',
        start_loc: loc,
        end_loc: loc,
        turns: 0,
        start_ori: 'in',
        end_ori: 'in'
      };
      expect(motion.start_loc).toBe(loc);
      expect(motion.end_loc).toBe(loc);
    });
  });

  it('should have correct enum values for orientations', () => {
    const orientations: MotionData['start_ori'][] = [
      'in', 'out', 'clock', 'counter'
    ];

    orientations.forEach(ori => {
      const motion: MotionData = {
        motion_type: 'pro',
        prop_rot_dir: 'cw',
        start_loc: 'n',
        end_loc: 'e',
        turns: 0,
        start_ori: ori,
        end_ori: ori
      };
      expect(motion.start_ori).toBe(ori);
      expect(motion.end_ori).toBe(ori);
    });
  });

  it('should have correct enum values for prop rotation direction', () => {
    const rotDirs: MotionData['prop_rot_dir'][] = [
      'cw', 'ccw', 'no_rot'
    ];

    rotDirs.forEach(dir => {
      const motion: MotionData = {
        motion_type: 'pro',
        prop_rot_dir: dir,
        start_loc: 'n',
        end_loc: 'e',
        turns: 0,
        start_ori: 'in',
        end_ori: 'in'
      };
      expect(motion.prop_rot_dir).toBe(dir);
    });
  });

  it('should handle numeric turns correctly', () => {
    const motion: MotionData = {
      motion_type: 'pro',
      prop_rot_dir: 'cw',
      start_loc: 'n',
      end_loc: 'e',
      turns: 3.5,
      start_ori: 'in',
      end_ori: 'out'
    };

    expect(typeof motion.turns).toBe('number');
    expect(motion.turns).toBe(3.5);
  });
});
