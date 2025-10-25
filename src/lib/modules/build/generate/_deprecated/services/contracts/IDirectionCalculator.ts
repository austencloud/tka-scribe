import { GridLocation, GridPosition } from "$shared";

export interface IDirectionCalculator {
  getCardinalDirections(
    startPosition: GridPosition,
    endPosition: GridPosition,
    motionType: string
  ): [GridLocation, GridLocation];
}

