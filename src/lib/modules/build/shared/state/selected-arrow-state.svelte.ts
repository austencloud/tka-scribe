/**
 * Selected Arrow State
 *
 * TEMPORARY STUB for Session B development
 * Session A will replace this with the real implementation
 *
 * Manages the currently selected arrow in the pictograph adjustment editor
 */

import type { MotionData, PictographData } from "$shared";

interface SelectedArrow {
  motionData: MotionData;
  color: string;
  pictographData: PictographData;
}

// Svelte 5 runes pattern: use $state directly with object methods
const _selectedArrow = $state<{ value: SelectedArrow | null }>({ value: null });

export const selectedArrowState = {
  get selectedArrow() {
    return _selectedArrow.value;
  },

  selectArrow(motionData: MotionData, color: string, pictographData: PictographData) {
    _selectedArrow.value = { motionData, color, pictographData };
    console.log('[SelectedArrowState STUB] Arrow selected:', color, motionData.motionType);
  },

  clearSelection() {
    _selectedArrow.value = null;
    console.log('[SelectedArrowState STUB] Selection cleared');
  },

  isSelected(motionData: MotionData, color: string): boolean {
    if (!_selectedArrow.value) return false;
    return (
      _selectedArrow.value.color === color &&
      _selectedArrow.value.motionData.motionType === motionData.motionType &&
      _selectedArrow.value.motionData.startLocation === motionData.startLocation &&
      _selectedArrow.value.motionData.endLocation === motionData.endLocation
    );
  }
};
