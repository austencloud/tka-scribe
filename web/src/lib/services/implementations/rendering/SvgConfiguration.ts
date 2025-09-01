/**
 * SVG Configuration - Shared Constants
 *
 * Shared configuration values for SVG rendering services.
 * Extracted from PictographRenderingService for reusability.
 */

import { injectable } from "inversify";
import type { ISvgConfiguration } from "../../contracts/pictograph-interfaces";

@injectable()
export class SvgConfiguration implements ISvgConfiguration {
  readonly SVG_SIZE = 950;
  readonly CENTER_X = 475;
  readonly CENTER_Y = 475;
}
