import { GridPosition } from "$shared";

export interface IPositionPatternService {
  getAlphaSequence(): GridPosition[];
  getBetaSequence(): GridPosition[];
  getGammaSequence(): GridPosition[];
  getCustomSequence(positions: GridPosition[]): GridPosition[];

  generatePositionSequence(
    positionSystem: string,
    length?: number
  ): GridPosition[];
}

