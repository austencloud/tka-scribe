import { GridPosition } from "$shared";

export interface IPositionSequenceService {
  getPositionSequence(
    system: "alpha" | "beta" | "gamma",
    count: number
  ): GridPosition[];
  getNextPosition(current: GridPosition, forward: boolean): GridPosition;
  calculatePositionPairs(
    sequence: GridPosition[]
  ): Array<[GridPosition, GridPosition]>;
}

