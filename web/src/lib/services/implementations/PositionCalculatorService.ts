/**
 * Position Calculator Service - Grid position calculations and sequences
 *
 * Handles calculation of position sequences, transformations, and cardinal directions
 * for movement generation. Maps position systems to cyclic sequences.
 */

import type { IPositionCalculatorService } from "../interfaces/generation-interfaces";
import { GridPosition, Location, MotionType } from "$lib/domain/enums";

export class PositionCalculatorService implements IPositionCalculatorService {
  private readonly alphaSequence = [
    GridPosition.ALPHA3,
    GridPosition.ALPHA5,
    GridPosition.ALPHA7,
    GridPosition.ALPHA1,
  ];

  private readonly betaSequence = [
    GridPosition.BETA3,
    GridPosition.BETA5,
    GridPosition.BETA7,
    GridPosition.BETA1,
  ];

  private readonly gammaSequence = [
    GridPosition.GAMMA3,
    GridPosition.GAMMA5,
    GridPosition.GAMMA7,
    GridPosition.GAMMA1,
    GridPosition.GAMMA11,
    GridPosition.GAMMA13,
    GridPosition.GAMMA15,
    GridPosition.GAMMA9,
  ];

  // Cardinal direction mappings for each position
  private readonly positionCardinals: Record<GridPosition, Location> = {
    // Alpha positions
    [GridPosition.ALPHA1]: Location.SOUTH,
    [GridPosition.ALPHA2]: Location.SOUTHWEST,
    [GridPosition.ALPHA3]: Location.WEST,
    [GridPosition.ALPHA4]: Location.NORTHWEST,
    [GridPosition.ALPHA5]: Location.NORTH,
    [GridPosition.ALPHA6]: Location.NORTHEAST,
    [GridPosition.ALPHA7]: Location.EAST,
    [GridPosition.ALPHA8]: Location.SOUTHEAST,

    // Beta positions
    [GridPosition.BETA1]: Location.NORTH,
    [GridPosition.BETA2]: Location.NORTHEAST,
    [GridPosition.BETA3]: Location.EAST,
    [GridPosition.BETA4]: Location.SOUTHEAST,
    [GridPosition.BETA5]: Location.SOUTH,
    [GridPosition.BETA6]: Location.SOUTHWEST,
    [GridPosition.BETA7]: Location.WEST,
    [GridPosition.BETA8]: Location.NORTHWEST,

    // Gamma positions (extended mapping)
    [GridPosition.GAMMA1]: Location.WEST,
    [GridPosition.GAMMA2]: Location.NORTHWEST,
    [GridPosition.GAMMA3]: Location.NORTH,
    [GridPosition.GAMMA4]: Location.NORTHEAST,
    [GridPosition.GAMMA5]: Location.EAST,
    [GridPosition.GAMMA6]: Location.SOUTHEAST,
    [GridPosition.GAMMA7]: Location.SOUTH,
    [GridPosition.GAMMA8]: Location.SOUTHWEST,
    [GridPosition.GAMMA9]: Location.EAST,
    [GridPosition.GAMMA10]: Location.SOUTHEAST,
    [GridPosition.GAMMA11]: Location.SOUTH,
    [GridPosition.GAMMA12]: Location.SOUTHWEST,
    [GridPosition.GAMMA13]: Location.WEST,
    [GridPosition.GAMMA14]: Location.NORTHWEST,
    [GridPosition.GAMMA15]: Location.NORTH,
    [GridPosition.GAMMA16]: Location.NORTHEAST,
  } as const;

  getPositionSequence(
    system: "alpha" | "beta" | "gamma",
    count: number
  ): GridPosition[] {
    const baseSequence = this.getSequenceBySystem(system);
    const result: GridPosition[] = [];

    for (let i = 0; i < count; i++) {
      result.push(baseSequence[i % baseSequence.length]);
    }

    return result;
  }

  getNextPosition(
    current: GridPosition,
    forward: boolean = true
  ): GridPosition {
    const system = this.determinePositionSystem(current);
    const sequence = this.getSequenceBySystem(system);
    const currentIndex = sequence.indexOf(current);

    if (currentIndex === -1) {
      throw new Error(`Position ${current} not found in ${system} sequence`);
    }

    const step = forward ? 1 : -1;
    const nextIndex = (currentIndex + step + sequence.length) % sequence.length;
    return sequence[nextIndex];
  }

  getCardinalDirections(
    startPos: GridPosition,
    endPos: GridPosition,
    motionType: string
  ): [Location, Location] {
    const startCardinal = this.positionCardinals[startPos];
    const endCardinal = this.positionCardinals[endPos];

    if (!startCardinal || !endCardinal) {
      throw new Error(
        `Cardinal directions not mapped for positions: ${startPos} -> ${endPos}`
      );
    }

    // For static motion, both directions are the same
    if (motionType === MotionType.STATIC) {
      return [startCardinal, startCardinal];
    }

    // For dash motion, determine direction of movement
    if (motionType === MotionType.DASH) {
      return this.calculateDashDirections(startPos, endPos);
    }

    return [startCardinal, endCardinal];
  }

  calculatePositionPairs(
    sequence: GridPosition[]
  ): Array<[GridPosition, GridPosition]> {
    const pairs: Array<[GridPosition, GridPosition]> = [];

    for (let i = 0; i < sequence.length - 1; i++) {
      pairs.push([sequence[i], sequence[i + 1]]);
    }

    return pairs;
  }

  private getSequenceBySystem(
    system: "alpha" | "beta" | "gamma"
  ): GridPosition[] {
    switch (system) {
      case "alpha":
        return this.alphaSequence;
      case "beta":
        return this.betaSequence;
      case "gamma":
        return this.gammaSequence;
      default:
        throw new Error(`Unknown position system: ${system}`);
    }
  }

  private determinePositionSystem(
    position: GridPosition
  ): "alpha" | "beta" | "gamma" {
    if (position.toString().startsWith("alpha")) return "alpha";
    if (position.toString().startsWith("beta")) return "beta";
    if (position.toString().startsWith("gamma")) return "gamma";
    throw new Error(`Unknown position system for position: ${position}`);
  }

  private calculateDashDirections(
    startPos: GridPosition,
    endPos: GridPosition
  ): [Location, Location] {
    // For dash motions, calculate the direction of movement
    const startCardinal = this.positionCardinals[startPos];
    const endCardinal = this.positionCardinals[endPos];

    // Determine the movement direction
    const system = this.determinePositionSystem(startPos);
    const sequence = this.getSequenceBySystem(system);
    const startIndex = sequence.indexOf(startPos);
    const endIndex = sequence.indexOf(endPos);

    if (startIndex === -1 || endIndex === -1) {
      // Fallback to position cardinals
      return [startCardinal, endCardinal];
    }

    // Calculate direction based on sequence movement
    const clockwiseDistance =
      (endIndex - startIndex + sequence.length) % sequence.length;
    const counterClockwiseDistance =
      (startIndex - endIndex + sequence.length) % sequence.length;

    if (clockwiseDistance <= counterClockwiseDistance) {
      // Moving clockwise - use movement direction
      return [startCardinal, endCardinal];
    } else {
      // Moving counterclockwise - reverse direction
      return [endCardinal, startCardinal];
    }
  }

  /**
   * Get all positions in a system for complete sequences
   */
  getAllAlphaPositions(): GridPosition[] {
    return [...this.alphaSequence];
  }

  getAllBetaPositions(): GridPosition[] {
    return [...this.betaSequence];
  }

  getAllGammaPositions(): GridPosition[] {
    return [...this.gammaSequence];
  }

  /**
   * Get the cardinal direction for a specific position
   */
  getPositionCardinal(position: GridPosition): Location {
    const cardinal = this.positionCardinals[position];
    if (!cardinal) {
      throw new Error(`No cardinal direction mapped for position: ${position}`);
    }
    return cardinal;
  }
}
