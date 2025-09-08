/**
 * Pictograph Service Contracts - Consolidated Re-exports
 *
 * This file re-exports all pictograph service interfaces from their proper domain locations.
 * Interfaces have been moved to their appropriate domains for better organization.
 *
 * @deprecated This file exists for backward compatibility.
 * Import interfaces directly from their domain locations instead:
 * - ISvgColorTransformer, ISvgLoader, ISvgParser, IPictographRenderingService → "./ISvgColorTransformer" etc.
 * - IFallbackArrowService → "../../arrow/services/contracts/IFallbackArrowService"
 */

// Re-export from proper domain locations
export type { IFallbackArrowRenderer as IFallbackArrowService } from "../../../arrow/services/contracts/IFallbackArrowRenderer";
export type { IPictographRenderingService } from "./IPictographRenderingService";
export type { ISvgColorTransformer } from "./ISvgColorTransformer";
export type { ISvgLoader } from "./ISvgLoader";
export type { ISvgParser } from "./ISvgParser";

