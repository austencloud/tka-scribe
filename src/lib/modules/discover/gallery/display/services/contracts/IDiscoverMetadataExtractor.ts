/**
 * Service for extracting metadata from sequence files
 */

import type { BeatData } from "../../../../../create/shared/domain/models/BeatData";
import { GridMode } from "$shared/pictograph/grid/domain/enums/grid-enums";
import { PropType } from "$shared/pictograph/prop/domain/enums/PropType";

export interface SequenceMetadata {
  beats: BeatData[];
  author: string;
  difficultyLevel: string;
  dateAdded: Date;
  gridMode: GridMode;
  isCircular: boolean;
  propType: PropType;
  sequenceLength: number;
  startingPosition: string;
}

export interface IDiscoverMetadataExtractor {
  /**
   * Extract metadata from a sequence file (PNG, WebP, or JSON sidecar)
   */
  extractMetadata(
    sequenceName: string,
    thumbnailPath?: string
  ): Promise<SequenceMetadata>;
}
