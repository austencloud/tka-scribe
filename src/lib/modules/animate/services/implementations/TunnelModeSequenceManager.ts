/**
 * Tunnel Mode Sequence Manager
 *
 * Coordinates sequence loading and transformations for Tunnel Mode.
 */

import { inject, injectable } from "inversify";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import { TYPES } from "$lib/shared/inversify/types";
import type { ISequenceService } from "$create/shared";
import type { ISequenceTransformationService } from "$create/shared";
import type {
  ITunnelModeSequenceManager,
  SequenceType,
  TransformOperation,
} from "../contracts/ITunnelModeSequenceManager";
import { loadSequenceForAnimation } from "../../utils/sequence-loader";

@injectable()
export class TunnelModeSequenceManager implements ITunnelModeSequenceManager {
  constructor(
    @inject(TYPES.ISequenceService)
    private readonly sequenceService: ISequenceService,
    @inject(TYPES.ISequenceTransformationService)
    private readonly transformationService: ISequenceTransformationService
  ) {}

  /**
   * Load a sequence for animation
   */
  async loadSequence(
    sequence: SequenceData,
    type: SequenceType
  ): Promise<SequenceData | null> {
    try {
      console.log(`🎬 TunnelModeSequenceManager: Loading ${type} sequence:`, sequence.id);

      const result = await loadSequenceForAnimation(
        sequence,
        this.sequenceService
      );

      if (result.success && result.sequence) {
        console.log(
          `✅ TunnelModeSequenceManager: ${type} sequence loaded with ${result.sequence.beats.length} beats`
        );
        return result.sequence;
      } else {
        console.error(
          `❌ TunnelModeSequenceManager: Failed to load ${type} sequence:`,
          result.error
        );
        return null;
      }
    } catch (err) {
      console.error(
        `❌ TunnelModeSequenceManager: Exception loading ${type} sequence:`,
        err
      );
      return null;
    }
  }

  /**
   * Transform a sequence and invoke callback with result
   */
  async transformAndUpdate(
    sequence: SequenceData,
    type: SequenceType,
    operation: TransformOperation,
    onUpdate: (transformed: SequenceData) => void
  ): Promise<void> {
    try {
      console.log(`🔄 Transforming ${type} sequence: ${operation}`);

      let transformed: SequenceData;

      switch (operation) {
        case "mirror":
          transformed = this.transformationService.mirrorSequence(sequence);
          break;

        case "rotate":
          transformed = this.transformationService.rotateSequence(sequence, 1);
          break;

        case "colorSwap":
          transformed = this.transformationService.swapColors(sequence);
          break;

        case "reverse":
          transformed = await this.transformationService.reverseSequence(
            sequence
          );
          break;

        default:
          console.error(`❌ Unknown transformation operation: ${operation}`);
          return;
      }

      console.log(`✅ ${type} sequence transformed successfully: ${operation}`);
      onUpdate(transformed);
    } catch (err) {
      console.error(
        `❌ Failed to transform ${type} sequence (${operation}):`,
        err
      );
    }
  }
}
