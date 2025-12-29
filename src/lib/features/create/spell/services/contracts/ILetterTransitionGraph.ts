/**
 * Letter Transition Graph Service Interface
 *
 * Manages the graph of valid letter transitions based on position groups.
 * A letter X can follow letter Y only if X.startPositionGroup === Y.endPositionGroup
 */

import type { Letter } from "$lib/shared/foundation/domain/models/Letter";
import type { GridPositionGroup } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import type { LetterPositionInfo } from "../../domain/models/spell-models";

export interface ILetterTransitionGraph {
  /**
   * Initialize the graph by loading letter mapping data
   */
  initialize(): Promise<void>;

  /**
   * Check if letterB can directly follow letterA
   * (letterB.startPositionGroup === letterA.endPositionGroup)
   */
  canFollow(letterA: Letter, letterB: Letter): boolean;

  /**
   * Get all letters that can directly follow the given letter
   */
  getValidSuccessors(letter: Letter): Letter[];

  /**
   * Get all letters that start at the given position group
   */
  getLettersStartingAt(positionGroup: GridPositionGroup): Letter[];

  /**
   * Get all letters that end at the given position group
   */
  getLettersEndingAt(positionGroup: GridPositionGroup): Letter[];

  /**
   * Get the position info for a letter (start/end position groups)
   */
  getLetterPositionInfo(letter: Letter): LetterPositionInfo | null;

  /**
   * Find bridge letters to connect letterA to letterB when they can't directly follow
   * Returns an array of bridge letters (may be empty if direct transition, or multiple for longer paths)
   */
  findBridgeLetters(letterA: Letter, letterB: Letter): Letter[];

  /**
   * Get the start position group for a letter
   */
  getStartPositionGroup(letter: Letter): GridPositionGroup | null;

  /**
   * Get the end position group for a letter
   */
  getEndPositionGroup(letter: Letter): GridPositionGroup | null;

  /**
   * Check if the graph has been initialized
   */
  isInitialized(): boolean;
}
