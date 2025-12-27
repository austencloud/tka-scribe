/**
 * Rendering Service Type Identifiers
 *
 * SVG, grid, and pictograph rendering services.
 */

export const RenderingTypes = {
  // SVG Services
  ISvgUtilityService: Symbol.for("ISvgUtilityService"),
  ISvgPreloader: Symbol.for("ISvgPreloader"),
  ISvgConfig: Symbol.for("ISvgConfig"),
  IDataTransformer: Symbol.for("IDataTransformer"),

  // Grid Services
  IGridRenderer: Symbol.for("IGridRenderer"),
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
  ISequenceRenderer: Symbol.for("ISequenceRenderer"),
  ICanvasManager: Symbol.for("ICanvasManager"),
  IImageComposer: Symbol.for("IImageComposer"),
  ILayoutCalculator: Symbol.for("ILayoutCalculator"),
  IDimensionCalculator: Symbol.for("IDimensionCalculator"),
  IImageFormatConverter: Symbol.for("IImageFormatConverter"),
  ISVGToCanvasConverter: Symbol.for("ISVGToCanvasConverter"),
  ITextRenderer: Symbol.for("ITextRenderer"),
  IGlyphCache: Symbol.for("IGlyphCache"),
  IFilenameGenerator: Symbol.for("IFilenameGenerator"),
  IReversalDetector: Symbol.for("IReversalDetector"),
  IUltimatePictographRenderer: Symbol.for(
    "IUltimatePictographRenderer"
  ),

  // CSV/Data Loading
  ICSVPictographLoader: Symbol.for("ICSVPictographLoader"),
  ICSVPictographParser: Symbol.for("ICSVPictographParser"),
} as const;
