import type { PictographData, ArrowPosition } from "../../../../shared";

export interface IOverlayRenderer {
  renderOverlays(svg: SVGElement, data: PictographData): Promise<void>;
  renderIdLabel(svg: SVGElement, data: PictographData): void;
  renderDebugInfo(
    svg: SVGElement,
    data: PictographData,
    positions: Map<string, ArrowPosition>
  ): void;
}
