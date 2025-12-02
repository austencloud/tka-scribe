import type { GridMode } from '../../domain/enums/grid-enums';

export interface IGridRenderingService {
  renderGrid(svg: SVGElement, gridMode?: GridMode): Promise<void>;
}
