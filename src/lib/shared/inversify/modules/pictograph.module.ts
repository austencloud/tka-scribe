import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";

// PERFORMANCE FIX: Import services directly to avoid circular dependencies
// Arrow services
import { ArrowAdjustmentProcessor } from "../../pictograph/arrow/orchestration/services/implementations/ArrowAdjustmentProcessor";
import { ArrowCoordinateTransformer } from "../../pictograph/arrow/orchestration/services/implementations/ArrowCoordinateTransformer";
import { ArrowDataProcessor } from "../../pictograph/arrow/orchestration/services/implementations/ArrowDataProcessor";
import { ArrowGridCoordinator } from "../../pictograph/arrow/orchestration/services/implementations/ArrowGridCoordinator";
import { ArrowLifecycleManager } from "../../pictograph/arrow/orchestration/services/implementations/ArrowLifecycleManager";
import { ArrowPositioningOrchestrator } from "../../pictograph/arrow/orchestration/services/implementations/ArrowPositioningOrchestrator";
import { ArrowQuadrantCalculator } from "../../pictograph/arrow/orchestration/services/implementations/ArrowQuadrantCalculator";
import { ArrowAdjustmentCalculator } from "../../pictograph/arrow/positioning/calculation/services/implementations/ArrowAdjustmentCalculator";
import { ArrowLocationCalculator } from "../../pictograph/arrow/positioning/calculation/services/implementations/ArrowLocationCalculator";
import { ArrowLocator } from "../../pictograph/arrow/positioning/calculation/services/implementations/ArrowLocator";
import { ArrowRotationCalculator } from "../../pictograph/arrow/positioning/calculation/services/implementations/ArrowRotationCalculator";
import { DashLocationCalculator } from "../../pictograph/arrow/positioning/calculation/services/implementations/DashLocationCalculator";
import {
  DirectionalTupleCalculator,
  DirectionalTupleProcessor,
  QuadrantIndexCalculator,
} from "../../pictograph/arrow/positioning/calculation/services/implementations/DirectionalTupleProcessor";
import { HandpathDirectionCalculator } from "../../pictograph/arrow/positioning/calculation/services/implementations/HandpathDirectionCalculator";
import { ArrowPlacementKeyGenerator } from "../../pictograph/arrow/positioning/key-generation/services/implementations/ArrowPlacementKeyGenerator";
import { AttributeKeyGenerator } from "../../pictograph/arrow/positioning/key-generation/services/implementations/AttributeKeyGenerator";
import { SpecialPlacementOriKeyGenerator } from "../../pictograph/arrow/positioning/key-generation/services/implementations/SpecialPlacementOriKeyGenerator";
import { RotationAngleOverrideKeyGenerator } from "../../pictograph/arrow/positioning/key-generation/services/implementations/RotationAngleOverrideKeyGenerator";
import { TurnsTupleKeyGenerator } from "../../pictograph/arrow/positioning/key-generation/services/implementations/TurnsTupleKeyGenerator";
import { ArrowPlacer } from "../../pictograph/arrow/positioning/placement/services/implementations/ArrowPlacer";
import { DefaultPlacer } from "../../pictograph/arrow/positioning/placement/services/implementations/DefaultPlacer";
import { SpecialPlacer } from "../../pictograph/arrow/positioning/placement/services/implementations/SpecialPlacer";
import { SpecialPlacementDataProvider } from "../../pictograph/arrow/positioning/placement/services/implementations/SpecialPlacementDataProvider";
import { LetterClassifier } from "../../pictograph/arrow/positioning/placement/services/implementations/LetterClassifier";
import { TurnsTupleGenerator } from "../../pictograph/arrow/positioning/placement/services/implementations/TurnsTupleGenerator";
import { SpecialPlacementLookup } from "../../pictograph/arrow/positioning/placement/services/implementations/SpecialPlacementLookup";
import { RotationOverrideManager } from "../../pictograph/arrow/positioning/placement/services/implementations/RotationOverrideManager";
import { ArrowPathResolver } from "../../pictograph/arrow/rendering/services/implementations/ArrowPathResolver";
import { ArrowRenderer } from "../../pictograph/arrow/rendering/services/implementations/ArrowRenderer";
import { ArrowSvgColorTransformer } from "../../pictograph/arrow/rendering/services/implementations/ArrowSvgColorTransformer";
import { ArrowSvgLoader } from "../../pictograph/arrow/rendering/services/implementations/ArrowSvgLoader";
import { ArrowSvgParser } from "../../pictograph/arrow/rendering/services/implementations/ArrowSvgParser";

// Grid services
import { GridModeDeriver } from "../../pictograph/grid/services/implementations/GridModeDeriver";
import { GridPositionDeriver } from "../../pictograph/grid/services/implementations/GridPositionDeriver";
import { GridRenderer } from "../../pictograph/grid/services/implementations/GridRenderer";

// Prop services
import { BetaDetector } from "../../pictograph/prop/services/implementations/BetaDetector";
import { OrientationCalculator } from "../../pictograph/prop/services/implementations/OrientationCalculator";
import { PropPlacer } from "../../pictograph/prop/services/implementations/PropPlacer";
import { PropSvgLoader } from "../../pictograph/prop/services/implementations/PropSvgLoader";

// Shared services
import { CSVPictographParser } from "../../pictograph/shared/services/implementations/CSVPictographParser";
import { MotionQueryHandler } from "../../pictograph/shared/services/implementations/MotionQueryHandler";
import { PictographCoordinator } from "../../pictograph/shared/services/implementations/PictographCoordinator";
import { SvgPreloader } from "../../pictograph/shared/services/implementations/SvgPreloader";
import { LetterQueryHandler } from "../../pictograph/tka-glyph/services/implementations/LetterQueryHandler";
import { TYPES } from "../types";

export const pictographModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === ARROW SERVICES ===
    options.bind(TYPES.IArrowPlacer).to(ArrowPlacer);
    options.bind(TYPES.IArrowLocator).to(ArrowLocator);
    options.bind(TYPES.IArrowPlacementKeyGenerator).to(ArrowPlacementKeyGenerator);
    options.bind(TYPES.IArrowRenderer).to(ArrowRenderer);
    options.bind(TYPES.IArrowLifecycleManager).to(ArrowLifecycleManager);
    options.bind(TYPES.IArrowPathResolutionService).to(ArrowPathResolver);
    options
      .bind(TYPES.IArrowGridCoordinator)
      .to(ArrowGridCoordinator);

    // === ARROW RENDERING SERVICES ===
    options.bind(TYPES.IArrowPathResolver).to(ArrowPathResolver);
    options.bind(TYPES.IArrowSvgLoader).to(ArrowSvgLoader).inSingletonScope(); // PERF: Cache persists across all uses
    options.bind(TYPES.IArrowSvgParser).to(ArrowSvgParser);
    options.bind(TYPES.IArrowSvgColorTransformer).to(ArrowSvgColorTransformer);

    // === ARROW ORCHESTRATION SERVICES ===
    options.bind(TYPES.IArrowAdjustmentProcessor).to(ArrowAdjustmentProcessor);
    options
      .bind(TYPES.IArrowCoordinateTransformer)
      .to(ArrowCoordinateTransformer);
    options.bind(TYPES.IArrowDataProcessor).to(ArrowDataProcessor);
    options.bind(TYPES.IArrowQuadrantCalculator).to(ArrowQuadrantCalculator);

    // === ARROW POSITIONING SERVICES ===
    options
      .bind(TYPES.IArrowPositioningOrchestrator)
      .to(ArrowPositioningOrchestrator);
    options
      .bind(TYPES.IArrowAdjustmentCalculator)
      .to(ArrowAdjustmentCalculator);
    options.bind(TYPES.IArrowLocationCalculator).to(ArrowLocationCalculator);
    options.bind(TYPES.IArrowRotationCalculator).to(ArrowRotationCalculator);
    options.bind(TYPES.IDashLocationCalculator).to(DashLocationCalculator);
    options.bind(TYPES.ISpecialPlacer).to(SpecialPlacer);
    options
      .bind(TYPES.ISpecialPlacementDataProvider)
      .to(SpecialPlacementDataProvider);
    options
      .bind(TYPES.ILetterClassifier)
      .to(LetterClassifier);
    options
      .bind(TYPES.ITurnsTupleGenerator)
      .to(TurnsTupleGenerator);
    options
      .bind(TYPES.ISpecialPlacementLookup)
      .to(SpecialPlacementLookup);
    options.bind(TYPES.IDefaultPlacer).to(DefaultPlacer);

    // === KEY GENERATORS AND PROCESSORS ===
    options
      .bind(TYPES.ISpecialPlacementOriKeyGenerator)
      .to(SpecialPlacementOriKeyGenerator);
    options.bind(TYPES.ITurnsTupleKeyGenerator).to(TurnsTupleKeyGenerator);
    options.bind(TYPES.IAttributeKeyGenerator).to(AttributeKeyGenerator);
    options
      .bind(TYPES.IRotationAngleOverrideKeyGenerator)
      .to(RotationAngleOverrideKeyGenerator);
    options
      .bind(TYPES.IHandpathDirectionCalculator)
      .to(HandpathDirectionCalculator);
    options
      .bind(TYPES.IRotationOverrideManager)
      .to(RotationOverrideManager)
      .inSingletonScope();
    options
      .bind(TYPES.IDirectionalTupleProcessor)
      .to(DirectionalTupleProcessor);
    options
      .bind(TYPES.IDirectionalTupleCalculator)
      .to(DirectionalTupleCalculator);
    options.bind(TYPES.IQuadrantIndexCalculator).to(QuadrantIndexCalculator);

    // === GRID SERVICES ===
    options.bind(TYPES.IGridModeDeriver).to(GridModeDeriver);
    options.bind(TYPES.IGridPositionDeriver).to(GridPositionDeriver);
    options.bind(TYPES.IGridRenderer).to(GridRenderer);

    // === PROP SERVICES ===
    options.bind(TYPES.IBetaDetector).to(BetaDetector);
    options.bind(TYPES.IPropPlacer).to(PropPlacer);
    options.bind(TYPES.IPropSvgLoader).to(PropSvgLoader).inSingletonScope(); // PERF: Cache persists across all uses
    options.bind(TYPES.IOrientationCalculator).to(OrientationCalculator);

    // === COORDINATION SERVICES ===
    options.bind(TYPES.IPictographCoordinator).to(PictographCoordinator);

    // === SVG SERVICES ===
    options
      .bind(TYPES.ISvgPreloader)
      .to(SvgPreloader)
      .inSingletonScope();

    // === QUERY HANDLERS ===
    options.bind(TYPES.IMotionQueryHandler).to(MotionQueryHandler);
    options.bind(TYPES.ILetterQueryHandler).to(LetterQueryHandler);

    // === DATA PARSERS ===
    options.bind(TYPES.ICSVPictographParser).to(CSVPictographParser);
  }
);
