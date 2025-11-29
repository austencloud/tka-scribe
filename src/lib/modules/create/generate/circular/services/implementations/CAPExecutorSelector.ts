import { inject, injectable } from "inversify";
import { TYPES } from "$lib/shared/inversify/types";
import { CAPType } from "../../domain/models/circular-models";
import type { ICAPExecutor } from "../contracts/ICAPExecutor";
import type { ICAPExecutorSelector } from "../contracts/ICAPExecutorSelector";

/**
 * Service for selecting the appropriate CAP executor based on CAP type
 *
 * Provides dependency injection-based executor selection, resolving
 * the correct executor instance from the inversify container based
 * on the requested CAP type.
 */
@injectable()
export class CAPExecutorSelector implements ICAPExecutorSelector {
  constructor(
    @inject(TYPES.IStrictRotatedCAPExecutor)
    private readonly strictRotatedExecutor: ICAPExecutor,

    @inject(TYPES.IStrictMirroredCAPExecutor)
    private readonly strictMirroredExecutor: ICAPExecutor,

    @inject(TYPES.IStrictSwappedCAPExecutor)
    private readonly strictSwappedExecutor: ICAPExecutor,

    @inject(TYPES.IStrictInvertedCAPExecutor)
    private readonly strictInvertedExecutor: ICAPExecutor,

    @inject(TYPES.IMirroredSwappedCAPExecutor)
    private readonly mirroredSwappedExecutor: ICAPExecutor,

    @inject(TYPES.ISwappedInvertedCAPExecutor)
    private readonly swappedInvertedExecutor: ICAPExecutor,

    @inject(TYPES.IMirroredInvertedCAPExecutor)
    private readonly mirroredInvertedExecutor: ICAPExecutor,

    @inject(TYPES.IRotatedSwappedCAPExecutor)
    private readonly rotatedSwappedExecutor: ICAPExecutor,

    @inject(TYPES.IRotatedInvertedCAPExecutor)
    private readonly rotatedInvertedExecutor: ICAPExecutor,

    @inject(TYPES.IMirroredRotatedCAPExecutor)
    private readonly mirroredRotatedExecutor: ICAPExecutor,

    @inject(TYPES.IMirroredRotatedInvertedCAPExecutor)
    private readonly mirroredRotatedInvertedExecutor: ICAPExecutor,

    @inject(TYPES.IMirroredSwappedInvertedCAPExecutor)
    private readonly mirroredSwappedInvertedExecutor: ICAPExecutor,

    @inject(TYPES.IMirroredRotatedInvertedSwappedCAPExecutor)
    private readonly mirroredRotatedInvertedSwappedExecutor: ICAPExecutor
  ) {}

  /**
   * Get the appropriate CAP executor for the given CAP type
   */
  getExecutor(capType: CAPType): ICAPExecutor {
    switch (capType) {
      case CAPType.STRICT_ROTATED:
        return this.strictRotatedExecutor;

      case CAPType.STRICT_MIRRORED:
        return this.strictMirroredExecutor;

      case CAPType.STRICT_SWAPPED:
        return this.strictSwappedExecutor;

      case CAPType.STRICT_INVERTED:
        return this.strictInvertedExecutor;

      case CAPType.MIRRORED_SWAPPED:
        return this.mirroredSwappedExecutor;

      case CAPType.SWAPPED_INVERTED:
        return this.swappedInvertedExecutor;

      case CAPType.MIRRORED_INVERTED:
        return this.mirroredInvertedExecutor;

      case CAPType.ROTATED_SWAPPED:
        return this.rotatedSwappedExecutor;

      case CAPType.ROTATED_INVERTED:
        return this.rotatedInvertedExecutor;

      case CAPType.MIRRORED_ROTATED:
        return this.mirroredRotatedExecutor;

      case CAPType.MIRRORED_INVERTED_ROTATED:
        return this.mirroredRotatedInvertedExecutor;

      case CAPType.MIRRORED_ROTATED_INVERTED_SWAPPED:
        return this.mirroredRotatedInvertedSwappedExecutor;

      default:
        throw new Error(
          `CAP type "${capType}" is not yet implemented. ` +
            `Currently supported: STRICT_ROTATED, STRICT_MIRRORED, STRICT_SWAPPED, ` +
            `STRICT_INVERTED, MIRRORED_SWAPPED, SWAPPED_INVERTED, MIRRORED_INVERTED, ` +
            `ROTATED_SWAPPED, ROTATED_INVERTED, MIRRORED_ROTATED, MIRRORED_INVERTED_ROTATED, ` +
            `MIRRORED_ROTATED_INVERTED_SWAPPED`
        );
    }
  }

  /**
   * Check if a CAP type is supported
   */
  isSupported(capType: CAPType): boolean {
    return [
      CAPType.STRICT_ROTATED,
      CAPType.STRICT_MIRRORED,
      CAPType.STRICT_SWAPPED,
      CAPType.STRICT_INVERTED,
      CAPType.MIRRORED_SWAPPED,
      CAPType.SWAPPED_INVERTED,
      CAPType.MIRRORED_INVERTED,
      CAPType.ROTATED_SWAPPED,
      CAPType.ROTATED_INVERTED,
      CAPType.MIRRORED_ROTATED,
      CAPType.MIRRORED_INVERTED_ROTATED,
      CAPType.MIRRORED_ROTATED_INVERTED_SWAPPED,
    ].includes(capType);
  }
}
