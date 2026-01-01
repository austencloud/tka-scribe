import { inject, injectable } from "inversify";
import { TYPES } from "$lib/shared/inversify/types";
import { LOOPType } from "../../domain/models/circular-models";
import type { ILOOPExecutor } from "../contracts/ILOOPExecutor";
import type { ILOOPExecutorSelector } from "../contracts/ILOOPExecutorSelector";

/**
 * Service for selecting the appropriate LOOP executor based on LOOP type
 *
 * Provides dependency injection-based executor selection, resolving
 * the correct executor instance from the inversify container based
 * on the requested LOOP type.
 */
@injectable()
export class LOOPExecutorSelector implements ILOOPExecutorSelector {
  constructor(
    @inject(TYPES.IStrictRotatedLOOPExecutor)
    private readonly strictRotatedExecutor: ILOOPExecutor,

    @inject(TYPES.IStrictMirroredLOOPExecutor)
    private readonly strictMirroredExecutor: ILOOPExecutor,

    @inject(TYPES.IStrictSwappedLOOPExecutor)
    private readonly strictSwappedExecutor: ILOOPExecutor,

    @inject(TYPES.IStrictInvertedLOOPExecutor)
    private readonly strictInvertedExecutor: ILOOPExecutor,

    @inject(TYPES.IMirroredSwappedLOOPExecutor)
    private readonly mirroredSwappedExecutor: ILOOPExecutor,

    @inject(TYPES.ISwappedInvertedLOOPExecutor)
    private readonly swappedInvertedExecutor: ILOOPExecutor,

    @inject(TYPES.IMirroredInvertedLOOPExecutor)
    private readonly mirroredInvertedExecutor: ILOOPExecutor,

    @inject(TYPES.IRotatedSwappedLOOPExecutor)
    private readonly rotatedSwappedExecutor: ILOOPExecutor,

    @inject(TYPES.IRotatedInvertedLOOPExecutor)
    private readonly rotatedInvertedExecutor: ILOOPExecutor,

    @inject(TYPES.IMirroredRotatedLOOPExecutor)
    private readonly mirroredRotatedExecutor: ILOOPExecutor,

    @inject(TYPES.IMirroredRotatedInvertedLOOPExecutor)
    private readonly mirroredRotatedInvertedExecutor: ILOOPExecutor,

    @inject(TYPES.IMirroredSwappedInvertedLOOPExecutor)
    private readonly mirroredSwappedInvertedExecutor: ILOOPExecutor,

    @inject(TYPES.IMirroredRotatedInvertedSwappedLOOPExecutor)
    private readonly mirroredRotatedInvertedSwappedExecutor: ILOOPExecutor,

    @inject(TYPES.IRewoundLOOPExecutor)
    private readonly rewoundLOOPExecutor: ILOOPExecutor
  ) {}

  /**
   * Get the appropriate LOOP executor for the given LOOP type
   */
  getExecutor(loopType: LOOPType): ILOOPExecutor {
    switch (loopType) {
      case LOOPType.STRICT_ROTATED:
        return this.strictRotatedExecutor;

      case LOOPType.STRICT_MIRRORED:
        return this.strictMirroredExecutor;

      case LOOPType.STRICT_SWAPPED:
        return this.strictSwappedExecutor;

      case LOOPType.STRICT_INVERTED:
        return this.strictInvertedExecutor;

      case LOOPType.MIRRORED_SWAPPED:
        return this.mirroredSwappedExecutor;

      case LOOPType.SWAPPED_INVERTED:
        return this.swappedInvertedExecutor;

      case LOOPType.MIRRORED_INVERTED:
        return this.mirroredInvertedExecutor;

      case LOOPType.ROTATED_SWAPPED:
        return this.rotatedSwappedExecutor;

      case LOOPType.ROTATED_INVERTED:
        return this.rotatedInvertedExecutor;

      case LOOPType.MIRRORED_ROTATED:
        return this.mirroredRotatedExecutor;

      case LOOPType.MIRRORED_INVERTED_ROTATED:
        return this.mirroredRotatedInvertedExecutor;

      case LOOPType.MIRRORED_ROTATED_INVERTED_SWAPPED:
        return this.mirroredRotatedInvertedSwappedExecutor;

      case LOOPType.REWOUND:
        return this.rewoundLOOPExecutor;

      default:
        throw new Error(
          `LOOP type "${loopType}" is not yet implemented. ` +
            `Currently supported: STRICT_ROTATED, STRICT_MIRRORED, STRICT_SWAPPED, ` +
            `STRICT_INVERTED, MIRRORED_SWAPPED, SWAPPED_INVERTED, MIRRORED_INVERTED, ` +
            `ROTATED_SWAPPED, ROTATED_INVERTED, MIRRORED_ROTATED, MIRRORED_INVERTED_ROTATED, ` +
            `MIRRORED_ROTATED_INVERTED_SWAPPED, REWOUND`
        );
    }
  }

  /**
   * Check if a LOOP type is supported
   */
  isSupported(loopType: LOOPType): boolean {
    return [
      LOOPType.STRICT_ROTATED,
      LOOPType.STRICT_MIRRORED,
      LOOPType.STRICT_SWAPPED,
      LOOPType.STRICT_INVERTED,
      LOOPType.MIRRORED_SWAPPED,
      LOOPType.SWAPPED_INVERTED,
      LOOPType.MIRRORED_INVERTED,
      LOOPType.ROTATED_SWAPPED,
      LOOPType.ROTATED_INVERTED,
      LOOPType.MIRRORED_ROTATED,
      LOOPType.MIRRORED_INVERTED_ROTATED,
      LOOPType.MIRRORED_ROTATED_INVERTED_SWAPPED,
      LOOPType.REWOUND,
    ].includes(loopType);
  }
}
