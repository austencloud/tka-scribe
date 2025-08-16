/**
 * Pictograph and Rendering Service Interfaces
 *
 * Interfaces for pictograph rendering, SVG generation, and visual representation
 * of sequences and beats.
 */

import type { ArrowData, BeatData, PictographData } from "./domain-types";

// ============================================================================
// PICTOGRAPH SERVICE INTERFACES
// ============================================================================

/**
 * Core pictograph service for managing pictograph data and updates
 */
export interface IPictographService {
  renderPictograph(data: PictographData): Promise<SVGElement>;
  updateArrow(
    pictographId: string,
    arrowData: ArrowData
  ): Promise<PictographData>;
}

/**
 * Specialized rendering service for pictographs and beats
 */
export interface IPictographRenderingService {
  renderPictograph(data: PictographData): Promise<SVGElement>;
  renderBeat(beat: BeatData): Promise<SVGElement>;
}
