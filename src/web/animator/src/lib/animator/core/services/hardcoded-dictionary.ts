/**
 * Sequence Data Adapter - allows using hardcoded sequence data like the standalone version
 * This bypasses the complex PNG loading system and provides immediate working sequences
 */

import type { SequenceData } from '../../types/core.js';

/**
 * Example sequences that work (from the standalone version)
 */
export const EXAMPLE_SEQUENCES: Record<string, SequenceData> = {
  ALFBBLFA: [
    // Metadata
    {
      word: 'ALFBBLFA',
      author: 'Austen Cloud',
      level: 0,
      prop_type: 'staff',
      grid_mode: 'diamond',
      is_circular: false,
      can_be_CAP: false,
      is_strict_rotated_CAP: false,
      is_strict_mirrored_CAP: false,
      is_strict_swapped_CAP: false,
      is_mirrored_swapped_CAP: false,
      is_rotated_swapped_CAP: false
    },
    // Start position (beat 0)
    {
      beat: 0,
      sequence_start_position: 'alpha',
      letter: 'α',
      end_pos: 'alpha1',
      timing: 'none',
      direction: 'none',
      blue_attributes: {
        start_loc: 's',
        end_loc: 's',
        start_ori: 'in',
        end_ori: 'in',
        prop_rot_dir: 'no_rot',
        turns: 0,
        motion_type: 'static'
      },
      red_attributes: {
        start_loc: 'n',
        end_loc: 'n',
        start_ori: 'in',
        end_ori: 'in',
        prop_rot_dir: 'no_rot',
        turns: 0,
        motion_type: 'static'
      }
    },
    // Animation steps (beats 1-8)
    {
      beat: 1,
      letter: 'A',
      letter_type: 'Type1',
      duration: 1,
      start_pos: 'alpha1',
      end_pos: 'alpha3',
      timing: 'split',
      direction: 'same',
      blue_attributes: {
        motion_type: 'pro',
        start_ori: 'in',
        prop_rot_dir: 'cw',
        start_loc: 's',
        end_loc: 'w',
        turns: 0,
        end_ori: 'in'
      },
      red_attributes: {
        motion_type: 'pro',
        start_ori: 'in',
        prop_rot_dir: 'cw',
        start_loc: 'n',
        end_loc: 'e',
        turns: 0,
        end_ori: 'in'
      }
    },
    {
      beat: 2,
      letter: 'L',
      letter_type: 'Type1',
      duration: 1,
      start_pos: 'alpha3',
      end_pos: 'beta1',
      timing: 'tog',
      direction: 'opp',
      blue_attributes: {
        motion_type: 'pro',
        start_ori: 'in',
        prop_rot_dir: 'cw',
        start_loc: 'w',
        end_loc: 'n',
        turns: 0,
        end_ori: 'in'
      },
      red_attributes: {
        motion_type: 'anti',
        start_ori: 'in',
        prop_rot_dir: 'cw',
        start_loc: 'e',
        end_loc: 'n',
        turns: 0,
        end_ori: 'out'
      }
    },
    {
      beat: 3,
      letter: 'F',
      letter_type: 'Type1',
      duration: 1,
      start_pos: 'beta1',
      end_pos: 'alpha7',
      timing: 'tog',
      direction: 'opp',
      blue_attributes: {
        motion_type: 'pro',
        start_ori: 'in',
        prop_rot_dir: 'cw',
        start_loc: 'n',
        end_loc: 'e',
        turns: 0,
        end_ori: 'in'
      },
      red_attributes: {
        motion_type: 'anti',
        start_ori: 'out',
        prop_rot_dir: 'cw',
        start_loc: 'n',
        end_loc: 'w',
        turns: 0,
        end_ori: 'in'
      }
    },
    {
      beat: 4,
      letter: 'B',
      letter_type: 'Type1',
      duration: 1,
      start_pos: 'alpha7',
      end_pos: 'alpha5',
      timing: 'split',
      direction: 'same',
      blue_attributes: {
        motion_type: 'anti',
        start_ori: 'in',
        prop_rot_dir: 'cw',
        start_loc: 'e',
        end_loc: 'n',
        turns: 0,
        end_ori: 'out'
      },
      red_attributes: {
        motion_type: 'anti',
        start_ori: 'in',
        prop_rot_dir: 'cw',
        start_loc: 'w',
        end_loc: 's',
        turns: 0,
        end_ori: 'out'
      }
    },
    {
      beat: 5,
      letter: 'B',
      letter_type: 'Type1',
      duration: 1,
      start_pos: 'alpha5',
      end_pos: 'alpha3',
      timing: 'split',
      direction: 'same',
      blue_attributes: {
        motion_type: 'anti',
        start_ori: 'out',
        prop_rot_dir: 'cw',
        start_loc: 'n',
        end_loc: 'w',
        turns: 0,
        end_ori: 'in'
      },
      red_attributes: {
        motion_type: 'anti',
        start_ori: 'out',
        prop_rot_dir: 'cw',
        start_loc: 's',
        end_loc: 'e',
        turns: 0,
        end_ori: 'in'
      }
    },
    {
      beat: 6,
      letter: 'L',
      letter_type: 'Type1',
      duration: 1,
      start_pos: 'alpha3',
      end_pos: 'beta5',
      timing: 'tog',
      direction: 'opp',
      blue_attributes: {
        motion_type: 'anti',
        start_ori: 'in',
        prop_rot_dir: 'cw',
        start_loc: 'w',
        end_loc: 's',
        turns: 0,
        end_ori: 'out'
      },
      red_attributes: {
        motion_type: 'pro',
        start_ori: 'in',
        prop_rot_dir: 'cw',
        start_loc: 'e',
        end_loc: 's',
        turns: 0,
        end_ori: 'in'
      }
    },
    {
      beat: 7,
      letter: 'F',
      letter_type: 'Type1',
      duration: 1,
      start_pos: 'beta5',
      end_pos: 'alpha7',
      timing: 'tog',
      direction: 'opp',
      blue_attributes: {
        motion_type: 'anti',
        start_ori: 'out',
        prop_rot_dir: 'cw',
        start_loc: 's',
        end_loc: 'e',
        turns: 0,
        end_ori: 'in'
      },
      red_attributes: {
        motion_type: 'pro',
        start_ori: 'in',
        prop_rot_dir: 'cw',
        start_loc: 's',
        end_loc: 'w',
        turns: 0,
        end_ori: 'in'
      }
    },
    {
      beat: 8,
      letter: 'A',
      letter_type: 'Type1',
      duration: 1,
      start_pos: 'alpha7',
      end_pos: 'alpha1',
      timing: 'split',
      direction: 'same',
      blue_attributes: {
        motion_type: 'pro',
        start_ori: 'in',
        prop_rot_dir: 'cw',
        start_loc: 'e',
        end_loc: 's',
        turns: 0,
        end_ori: 'in'
      },
      red_attributes: {
        motion_type: 'pro',
        start_ori: 'in',
        prop_rot_dir: 'cw',
        start_loc: 'w',
        end_loc: 'n',
        turns: 0,
        end_ori: 'in'
      }
    }
  ],

  // Add more simple test sequences
  ABC: [
    // Metadata
    {
      word: 'ABC',
      author: 'Test',
      level: 0,
      prop_type: 'staff',
      grid_mode: 'diamond',
      is_circular: false
    },
    // Start position
    {
      beat: 0,
      letter: 'α',
      blue_attributes: {
        start_loc: 's',
        end_loc: 's',
        start_ori: 'in',
        end_ori: 'in',
        motion_type: 'static',
        prop_rot_dir: 'cw',
        turns: 0
      },
      red_attributes: {
        start_loc: 'n',
        end_loc: 'n',
        start_ori: 'in',
        end_ori: 'in',
        motion_type: 'static',
        prop_rot_dir: 'cw',
        turns: 0
      }
    },
    // A step
    {
      beat: 1,
      letter: 'A',
      blue_attributes: {
        start_loc: 's',
        end_loc: 'w',
        start_ori: 'in',
        end_ori: 'in',
        motion_type: 'pro',
        prop_rot_dir: 'cw',
        turns: 0
      },
      red_attributes: {
        start_loc: 'n',
        end_loc: 'e',
        start_ori: 'in',
        end_ori: 'in',
        motion_type: 'pro',
        prop_rot_dir: 'cw',
        turns: 0
      }
    },
    // B step
    {
      beat: 2,
      letter: 'B',
      blue_attributes: {
        start_loc: 'w',
        end_loc: 'n',
        start_ori: 'in',
        end_ori: 'out',
        motion_type: 'anti',
        prop_rot_dir: 'cw',
        turns: 0
      },
      red_attributes: {
        start_loc: 'e',
        end_loc: 's',
        start_ori: 'in',
        end_ori: 'out',
        motion_type: 'anti',
        prop_rot_dir: 'cw',
        turns: 0
      }
    },
    // C step
    {
      beat: 3,
      letter: 'C',
      blue_attributes: {
        start_loc: 'n',
        end_loc: 'e',
        start_ori: 'out',
        end_ori: 'in',
        motion_type: 'pro',
        prop_rot_dir: 'cw',
        turns: 0
      },
      red_attributes: {
        start_loc: 's',
        end_loc: 'w',
        start_ori: 'out',
        end_ori: 'in',
        motion_type: 'pro',
        prop_rot_dir: 'cw',
        turns: 0
      }
    }
  ],

  BA: [
    // Metadata
    {
      word: 'BA',
      author: 'Test',
      level: 0,
      prop_type: 'staff',
      grid_mode: 'diamond',
      is_circular: false
    },
    // Start position
    {
      beat: 0,
      letter: 'α',
      blue_attributes: {
        start_loc: 's',
        end_loc: 's',
        start_ori: 'in',
        end_ori: 'in',
        motion_type: 'static',
        prop_rot_dir: 'cw',
        turns: 0
      },
      red_attributes: {
        start_loc: 'n',
        end_loc: 'n',
        start_ori: 'in',
        end_ori: 'in',
        motion_type: 'static',
        prop_rot_dir: 'cw',
        turns: 0
      }
    },
    // B step
    {
      beat: 1,
      letter: 'B',
      blue_attributes: {
        start_loc: 's',
        end_loc: 'n',
        start_ori: 'in',
        end_ori: 'out',
        motion_type: 'anti',
        prop_rot_dir: 'cw',
        turns: 0
      },
      red_attributes: {
        start_loc: 'n',
        end_loc: 's',
        start_ori: 'in',
        end_ori: 'out',
        motion_type: 'anti',
        prop_rot_dir: 'cw',
        turns: 0
      }
    },
    // A step
    {
      beat: 2,
      letter: 'A',
      blue_attributes: {
        start_loc: 'n',
        end_loc: 'e',
        start_ori: 'out',
        end_ori: 'in',
        motion_type: 'pro',
        prop_rot_dir: 'cw',
        turns: 0
      },
      red_attributes: {
        start_loc: 's',
        end_loc: 'w',
        start_ori: 'out',
        end_ori: 'in',
        motion_type: 'pro',
        prop_rot_dir: 'cw',
        turns: 0
      }
    }
  ]
};

/**
 * Simple Dictionary Service that uses hardcoded sequences
 */
export class HardcodedDictionaryService {
  private static instance: HardcodedDictionaryService;

  private constructor() {}

  static getInstance(): HardcodedDictionaryService {
    if (!HardcodedDictionaryService.instance) {
      HardcodedDictionaryService.instance = new HardcodedDictionaryService();
    }
    return HardcodedDictionaryService.instance;
  }

  /**
   * Get available sequences as dictionary items
   */
  async getIndex() {
    const items = Object.entries(EXAMPLE_SEQUENCES).map(([name, sequenceData]) => ({
      id: name,
      name: name,
      filePath: '', // Not needed for hardcoded
      metadata: sequenceData[0],
      sequenceData: sequenceData,
      thumbnailUrl: '', // Could generate simple thumbnails
      versions: ['v1']
    }));

    return {
      items,
      categories: ['Examples', 'Staff', 'Test', 'Short (≤5 steps)'],
      totalCount: items.length,
      lastUpdated: new Date()
    };
  }

  /**
   * Search sequences
   */
  async searchItems(query: string, category?: string) {
    const index = await this.getIndex();
    let filteredItems = index.items;

    if (query) {
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (category && category !== 'All') {
      // Simple category filtering
      filteredItems = filteredItems.filter(item => {
        if (category === 'Examples') return true;
        if (category === 'Staff') return item.metadata.prop_type === 'staff';
        if (category === 'Test') return item.name.length <= 3;
        if (category === 'Short (≤5 steps)') return item.sequenceData.length <= 5;
        return true;
      });
    }

    return filteredItems;
  }

  /**
   * Get a specific sequence
   */
  getSequence(name: string): SequenceData | null {
    return EXAMPLE_SEQUENCES[name] || null;
  }

  /**
   * Add a new sequence
   */
  addSequence(name: string, data: SequenceData): void {
    EXAMPLE_SEQUENCES[name] = data;
  }
}
