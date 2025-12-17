/**
 * Rendering Service Type Identifiers
 *
 * SVG, grid, and pictograph rendering services.
 */

export const RenderingTypes = {
  // SVG Services
  ISvgUtilityService: Symbol.for("ISvgUtilityService"),
  ISvgPreloadService: Symbol.for("ISvgPreloadService"),
  ISvgConfig: Symbol.for("ISvgConfig"),
  IDataTransformer: Symbol.for("IDataTransformer"),

  // Grid Services
  IGridRenderingService: Symbol.for("IGridRenderingService"),
  IGridService: Symbol.for("IGridService"),

  // Arrow Rendering
  IArrowRenderer: Symbol.for("IArrowRenderer"),
  IArrowLifecycleManager: Symbol.for("IArrowLifecycleManager"),
  IArrowPathResolver: Symbol.for("IArrowPathResolver"),
  IArrowSvgLoader: Symbol.for("IArrowSvgLoader"),
  IArrowSvgParser: Symbol.for("IArrowSvgParser"),
  IArrowSvgColorTransformer: Symbol.for("IArrowSvgColorTransformer"),
  IOverlayRenderer: Symbol.for("IOverlayRenderer"),
  IPropSvgLoader: Symbol.for("IPropSvgLoader"),

  // Positioning
  IArrowPositioningOrchestrator: Symbol.for("IArrowPositioningOrchestrator"),
  IArrowAdjustmentCalculator: Symbol.for("IArrowAdjustmentCalculator"),
  IGridPositionDeriver: Symbol.for("IGridPositionDeriver"),
  IPositionCalculatorService: Symbol.for("IPositionCalculatorService"),
  IOrientationCalculator: Symbol.for("IOrientationCalculator"),

  // Movement
  IPositionPatternService: Symbol.for("IPositionPatternService"),
  IPictographValidatorService: Symbol.for("IPictographValidatorService"),
  IGridModeDeriver: Symbol.for("IGridModeDeriver"),

  // Render Services
  ISequenceRenderService: Symbol.for("ISequenceRenderService"),
  ITextRenderingService: Symbol.for("ITextRenderingService"),
  IGlyphCacheService: Symbol.for("IGlyphCacheService"),
  IReversalDetectionService: Symbol.for("IReversalDetectionService"),
  IUltimatePictographRenderingService: Symbol.for("IUltimatePictographRenderingService"),

  // CSV/Data Loading
  ICSVPictographLoader: Symbol.for("ICSVPictographLoader"),
  ICSVPictographParser: Symbol.for("ICSVPictographParser"),
} as const;
