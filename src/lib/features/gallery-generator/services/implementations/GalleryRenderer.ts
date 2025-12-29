/**
 * Gallery Renderer
 *
 * Renders sequences to image blobs with standardized gallery visibility settings.
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { ISequenceRenderer } from "$lib/shared/render/services/contracts/ISequenceRenderer";
import type { IDiscoverLoader } from "$lib/features/discover/gallery/display/services/contracts/IDiscoverLoader";
import type { SequenceExportOptions } from "$lib/shared/render/domain/models/SequenceExportOptions";
import { Orientation } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
import type { IGalleryRenderer } from "../contracts/IGalleryRenderer";
import type { BatchRenderResult } from "../../domain/gallery-models";

export class GalleryRenderer implements IGalleryRenderer {
  constructor(
    private renderService: ISequenceRenderer,
    private loaderService: IDiscoverLoader
  ) {}

  async renderSequence(
    sequence: SequenceData,
    lightMode: boolean
  ): Promise<Blob> {
    // Load full sequence data if not already loaded
    if (!sequence.beats || sequence.beats.length === 0) {
      const fullSequence = await this.loaderService.loadFullSequenceData(
        sequence.word || sequence.name
      );
      if (fullSequence) {
        Object.assign(sequence, fullSequence);
      }
    }

    const showNonRadial = this.requiresNonRadialPoints(sequence);

    const options: Partial<SequenceExportOptions> = {
      beatSize: 240,
      format: "WebP",
      quality: 0.95,
      includeStartPosition: true,
      addBeatNumbers: true,
      addWord: true,
      addDifficultyLevel: true,
      addUserInfo: false,
      addReversalSymbols: true,
      combinedGrids: false,
      beatScale: 1.0,
      margin: 0,
      redVisible: true,
      blueVisible: true,
      scale: 1.0,
      backgroundColor: lightMode ? "#ffffff" : "#1a1a2e",
      visibilityOverrides: {
        showTKA: true,
        showVTG: false,
        showElemental: false,
        showPositions: false,
        showReversals: true,
        showNonRadialPoints: showNonRadial,
        showTurnNumbers: true,
        // LED mode inverts glyph colors for dark backgrounds
        ledMode: !lightMode,
      },
    };

    return await this.renderService.renderSequenceToBlob(sequence, options);
  }

  async renderBatch(
    sequences: SequenceData[],
    lightMode: boolean
  ): Promise<BatchRenderResult[]> {
    return Promise.all(
      sequences.map(async (sequence) => {
        const name = sequence.word || sequence.name;
        try {
          const blob = await this.renderSequence(sequence, lightMode);
          const imageUrl = URL.createObjectURL(blob);
          return { name, imageUrl, blob, success: true as const };
        } catch (err) {
          return {
            name,
            error: err instanceof Error ? err.message : "Unknown error",
            success: false as const,
          };
        }
      })
    );
  }

  requiresNonRadialPoints(sequence: SequenceData): boolean {
    if (sequence.level && sequence.level >= 3) return true;

    const checkOrientations = (motions: {
      blue?: { startOrientation?: string; endOrientation?: string };
      red?: { startOrientation?: string; endOrientation?: string };
    }) => {
      const { blue, red } = motions;
      return (
        blue?.startOrientation === Orientation.CLOCK ||
        blue?.startOrientation === Orientation.COUNTER ||
        blue?.endOrientation === Orientation.CLOCK ||
        blue?.endOrientation === Orientation.COUNTER ||
        red?.startOrientation === Orientation.CLOCK ||
        red?.startOrientation === Orientation.COUNTER ||
        red?.endOrientation === Orientation.CLOCK ||
        red?.endOrientation === Orientation.COUNTER
      );
    };

    if (
      sequence.startPosition?.motions &&
      checkOrientations(sequence.startPosition.motions)
    ) {
      return true;
    }

    for (const beat of sequence.beats || []) {
      if (checkOrientations(beat.motions)) return true;
    }

    return false;
  }
}
