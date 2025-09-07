/**
 * Spotlight Types
 * 
 * Type definitions for the spotlight module.
 */

export type SpotlightVariationIndex = number;
export type SpotlightTimestamp = number;
export type SpotlightAction = 'edit' | 'save' | 'delete';
export type SpotlightCloseCallback = () => void;
export type SpotlightActionCallback = (action: string, sequence: SequenceData) => void;
export type SpotlightImageLoadCallback = () => void;

import type { SequenceData } from "$shared";
