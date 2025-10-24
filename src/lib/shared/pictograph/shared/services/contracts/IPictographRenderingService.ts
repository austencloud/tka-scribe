/**
 * Pictograph Rendering Service Interface
 *
 * Main interface for rendering complete pictographs.
 * Orchestrates the rendering of all pictograph elements.
 */

import type { PictographData } from "$shared";

export interface IPictographRenderingService {
  renderPictograph(data: PictographData): Promise<SVGElement>;
}
