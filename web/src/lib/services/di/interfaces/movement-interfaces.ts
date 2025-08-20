/**
 * Movement Generation Service Interface Definitions
 * Service interfaces for the movement pattern generation system
 */

import type {
  IMovementGeneratorService,
  IMovementPatternService,
  IPositionCalculatorService,
  IMovementValidatorService,
} from "../../interfaces/generation-interfaces";
import { createServiceInterface } from "../types";
import { Location, GridPosition } from "$lib/domain/enums";

// Import service implementations
import { MovementGeneratorService } from "../../implementations/generation/MovementGeneratorService";
import { MovementPatternService } from "../../implementations/domain/MovementPatternService";
// import { PositionCalculatorService } from "../../implementations/positioning/PositionCalculatorService";
import { MovementValidatorService } from "../../implementations/domain/MovementValidatorService";

// Movement Pattern Services
export const IMovementPatternServiceInterface =
  createServiceInterface<IMovementPatternService>(
    "IMovementPatternService",
    MovementPatternService
  );

export const IPositionCalculatorServiceInterface =
  createServiceInterface<IPositionCalculatorService>(
    "IPositionCalculatorService",
    class {
      getPositionSequence(
        system: "alpha" | "beta" | "gamma",
        count: number
      ): GridPosition[] {
        // Placeholder implementation
        return [];
      }
      getNextPosition(current: GridPosition, forward: boolean): GridPosition {
        return current;
      }
      getCardinalDirections(
        startPosition: GridPosition,
        endPosition: GridPosition,
        motionType: string
      ): [Location, Location] {
        // Placeholder implementation
        return [Location.NORTH, Location.SOUTH];
      }
      calculatePositionPairs(
        sequence: GridPosition[]
      ): Array<[GridPosition, GridPosition]> {
        return [];
      }
    }
  );

export const IMovementValidatorServiceInterface =
  createServiceInterface<IMovementValidatorService>(
    "IMovementValidatorService",
    MovementValidatorService
  );

export const IMovementGeneratorServiceInterface =
  createServiceInterface<IMovementGeneratorService>(
    "IMovementGeneratorService",
    class extends MovementGeneratorService {
      constructor(...args: unknown[]) {
        super(
          args[0] as IMovementPatternService,
          args[1] as IPositionCalculatorService,
          args[2] as IMovementValidatorService
        );
      }
    }
  );
