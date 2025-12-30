/**
 * Gallery Renderer
 *
 * Renders sequences to image blobs with standardized gallery visibility settings.
 * Supports prop type overrides for generating prop-specific gallery images.
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { ISequenceRenderer } from "$lib/shared/render/services/contracts/ISequenceRenderer";
import type { IDiscoverLoader } from "$lib/features/discover/gallery/display/services/contracts/IDiscoverLoader";
import type { SequenceExportOptions } from "$lib/shared/render/domain/models/SequenceExportOptions";
import { Orientation } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
import type { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";
import type { IGalleryRenderer } from "../contracts/IGalleryRenderer";
import type { BatchRenderResult } from "../../domain/gallery-models";

export interface RenderOptions {
  lightMode: boolean;
  propType?: PropType;
}

export class GalleryRenderer implements IGalleryRenderer {
  constructor(
    private renderService: ISequenceRenderer,
    private loaderService: IDiscoverLoader
  ) {}

  async renderSequence(
    sequence: SequenceData,
    lightMode: boolean,
    propType?: PropType
  ): Promise<Blob> {
    const name = sequence.word || sequence.name;
    console.log(`[GalleryRenderer] renderSequence called for: ${name}, beats=${sequence.beats?.length ?? 0}`);

    // Load full sequence data if not already loaded
    if (!sequence.beats || sequence.beats.length === 0) {
      console.log(`[GalleryRenderer] Loading full sequence data for: ${name}`);
      const fullSequence = await this.loaderService.loadFullSequenceData(
        sequence.word || sequence.name
      );
      if (fullSequence) {
        Object.assign(sequence, fullSequence);
        console.log(`[GalleryRenderer] Loaded ${fullSequence.beats?.length ?? 0} beats for: ${name}`);
      } else {
        console.warn(`[GalleryRenderer] Failed to load full sequence for: ${name}`);
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
      // Override prop type if specified
      propTypeOverride: propType,
      visibilityOverrides: {
        showTKA: true,
        showVTG: false,
        showElemental: false,
        showPositions: false,
        showReversals: true,
        showNonRadialPoints: showNonRadial,
        showTurnNumbers: true,
        // Lights Off inverts glyph colors for dark backgrounds
        lightsOff: !lightMode,
        propGlow: !lightMode, // Enable prop glow when in dark mode
      },
    };

    console.log(`[GalleryRenderer] Calling renderSequenceToBlob for: ${name}`);
    const blob = await this.renderService.renderSequenceToBlob(sequence, options);
    console.log(`[GalleryRenderer] Got blob for: ${name}, size=${blob.size}`);
    return blob;
  }

  async renderBatch(
    sequences: SequenceData[],
    lightMode: boolean,
    propType?: PropType
  ): Promise<BatchRenderResult[]> {
    return Promise.all(
      sequences.map(async (sequence) => {
        const name = sequence.word || sequence.name;
        try {
          const blob = await this.renderSequence(sequence, lightMode, propType);
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
