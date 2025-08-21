/**
 * Core Service Interface Definitions
 * These are the main business logic and infrastructure services
 */

import type {
  IApplicationInitializationService,
  IConstructTabCoordinationService,
  ISettingsService,
  IStartPositionService,
} from "../../interfaces/application-interfaces";
import type {
  ISequenceDomainService,
  ISequenceService,
  IPersistenceService,
  IPrintablePageLayoutService,
  IPageFactoryService,
  ISequenceCardExportIntegrationService,
} from "../../interfaces/sequence-interfaces";
import type {
  IArrowRenderingService,
  IDataTransformationService,
  IGridRenderingService,
  IOverlayRenderingService,
  IPictographRenderingService,
  IPictographService,
  ISvgConfiguration,
  ISvgUtilityService,
} from "../../interfaces/pictograph-interfaces";
import type { IPropRenderingService } from "../../interfaces/positioning-interfaces";

import type { IPropCoordinatorService } from "../../implementations/rendering/PropCoordinatorService";
import type { IArrowPositioningOrchestrator } from "../../positioning/core-services";
import type {
  IMotionGenerationService,
  ISequenceGenerationService,
  IOrientationCalculationService,
} from "../../interfaces/generation-interfaces";
import type { IDeviceDetectionService } from "../../interfaces/device-interfaces";
import type {
  IExportService,
  IPageImageExportService,
} from "../../interfaces/export-interfaces";
import type { IPanelManagementService } from "../../interfaces/panel-interfaces";
import type { ILetterQueryService } from "../../implementations/data/LetterQueryService";
import type { IStartPositionSelectionService } from "../../interfaces/IStartPositionSelectionService";
import { createServiceInterface } from "../types";

// Import service implementations
import { ApplicationInitializationService } from "../../implementations/application/ApplicationInitializationService";
import { ArrowRenderingService } from "../../implementations/rendering/ArrowRenderingService";
import { ConstructTabCoordinationService } from "../../implementations/construct/ConstructTabCoordinationService";
import { DataTransformationService } from "../../implementations/data/DataTransformationService";
import { DeviceDetectionService } from "../../implementations/application/DeviceDetectionService";
import { ExportService } from "../../implementations/export/ExportService";
import { GridRenderingService } from "../../implementations/rendering/GridRenderingService";
import { LocalStoragePersistenceService } from "../../implementations/persistence/LocalStoragePersistenceService";
import { MotionGenerationService } from "../../implementations/generation/MotionGenerationService";

import { OverlayRenderingService } from "../../implementations/rendering/OverlayRenderingService";
import { PanelManagementService } from "../../implementations/navigation/PanelManagementService";
import { PictographRenderingService } from "../../implementations/rendering/PictographRenderingService";
import { PictographService } from "../../implementations/domain/PictographService";
import { PropRenderingService } from "../../implementations/rendering/PropRenderingService";
import { PropCoordinatorService } from "../../implementations/rendering/PropCoordinatorService";
import { SequenceDomainService } from "../../implementations/domain/SequenceDomainService";
import { SequenceGenerationService } from "../../implementations/generation/SequenceGenerationService";
import { SequenceService } from "../../implementations/sequence/SequenceService";
import { SettingsService } from "../../implementations/persistence/SettingsService";
import { StartPositionService } from "../../implementations/domain/StartPositionService";
import { SvgConfiguration } from "../../implementations/rendering/SvgConfiguration";
import { SvgUtilityService } from "../../implementations/rendering/SvgUtilityService";
import { PrintablePageLayoutService } from "../../implementations/sequence/PrintablePageLayoutService";
import { PageFactoryService } from "../../implementations/generation/PageFactoryService";
import { PageImageExportService } from "../../implementations/export/PageImageExportService";
import { SequenceCardExportIntegrationService } from "../../implementations/export/SequenceCardExportIntegrationService";
import { OrientationCalculationService } from "../../implementations/positioning/OrientationCalculationService";
import { StartPositionSelectionService } from "../../implementations/StartPositionSelectionService";

// Core domain services
export const ISequenceServiceInterface =
  createServiceInterface<ISequenceService>(
    "ISequenceService",
    class extends SequenceService {
      constructor(...args: unknown[]) {
        super(
          args[0] as ISequenceDomainService,
          args[1] as IPersistenceService
        );
      }
    }
  );

export const ISequenceDomainServiceInterface =
  createServiceInterface<ISequenceDomainService>(
    "ISequenceDomainService",
    SequenceDomainService
  );

export const IPictographServiceInterface =
  createServiceInterface<IPictographService>(
    "IPictographService",
    class extends PictographService {
      constructor(...args: unknown[]) {
        super(args[0] as IPictographRenderingService);
      }
    }
  );

export const IPictographRenderingServiceInterface =
  createServiceInterface<IPictographRenderingService>(
    "IPictographRenderingService",
    class extends PictographRenderingService {
      constructor(...args: unknown[]) {
        super(
          args[0] as IArrowPositioningOrchestrator,
          args[1] as IPropRenderingService,
          args[2] as ISvgUtilityService,
          args[3] as IGridRenderingService,
          args[4] as IArrowRenderingService,
          args[5] as IOverlayRenderingService,
          args[6] as IDataTransformationService
        );
      }
    }
  );

export const IPropRenderingServiceInterface =
  createServiceInterface<IPropRenderingService>(
    "IPropRenderingService",
    PropRenderingService
  );

export const IPropCoordinatorServiceInterface =
  createServiceInterface<IPropCoordinatorService>(
    "IPropCoordinatorService",
    PropCoordinatorService
  );

// Rendering microservices
export const ISvgConfigurationInterface =
  createServiceInterface<ISvgConfiguration>(
    "ISvgConfiguration",
    SvgConfiguration
  );

export const ISvgUtilityServiceInterface =
  createServiceInterface<ISvgUtilityService>(
    "ISvgUtilityService",
    class extends SvgUtilityService {
      constructor(...args: unknown[]) {
        super(args[0] as ISvgConfiguration);
      }
    }
  );

export const IDataTransformationServiceInterface =
  createServiceInterface<IDataTransformationService>(
    "IDataTransformationService",
    DataTransformationService
  );

export const IGridRenderingServiceInterface =
  createServiceInterface<IGridRenderingService>(
    "IGridRenderingService",
    class extends GridRenderingService {
      constructor(...args: unknown[]) {
        super(args[0] as ISvgConfiguration);
      }
    }
  );

export const IArrowRenderingServiceInterface =
  createServiceInterface<IArrowRenderingService>(
    "IArrowRenderingService",
    class extends ArrowRenderingService {
      constructor(...args: unknown[]) {
        super(args[0] as ISvgConfiguration);
      }
    }
  );

export const IOverlayRenderingServiceInterface =
  createServiceInterface<IOverlayRenderingService>(
    "IOverlayRenderingService",
    class extends OverlayRenderingService {
      constructor(...args: unknown[]) {
        super(args[0] as ISvgConfiguration);
      }
    }
  );

// Infrastructure services
export const IPersistenceServiceInterface =
  createServiceInterface<IPersistenceService>(
    "IPersistenceService",
    LocalStoragePersistenceService
  );

export const ISettingsServiceInterface =
  createServiceInterface<ISettingsService>("ISettingsService", SettingsService);

export const IDeviceDetectionServiceInterface =
  createServiceInterface<IDeviceDetectionService>(
    "IDeviceDetectionService",
    DeviceDetectionService
  );

export const IPanelManagementServiceInterface =
  createServiceInterface<IPanelManagementService>(
    "IPanelManagementService",
    PanelManagementService
  );

// Application services
export const IApplicationInitializationServiceInterface =
  createServiceInterface<IApplicationInitializationService>(
    "IApplicationInitializationService",
    class extends ApplicationInitializationService {
      constructor(...args: unknown[]) {
        super(args[0] as ISettingsService, args[1] as IPersistenceService);
      }
    }
  );

export const IExportServiceInterface = createServiceInterface<IExportService>(
  "IExportService",
  class extends ExportService {
    constructor(...args: unknown[]) {
      super(args[0] as IPictographService);
    }
  }
);

// Generation services
export const IMotionGenerationServiceInterface =
  createServiceInterface<IMotionGenerationService>(
    "IMotionGenerationService",
    MotionGenerationService
  );

export const ISequenceGenerationServiceInterface =
  createServiceInterface<ISequenceGenerationService>(
    "ISequenceGenerationService",
    class extends SequenceGenerationService {
      constructor(...args: unknown[]) {
        super(
          args[0] as ILetterQueryService,
          args[1] as IOrientationCalculationService
        );
      }
    }
  );

// Construct tab services
export const IConstructTabCoordinationServiceInterface =
  createServiceInterface<IConstructTabCoordinationService>(
    "IConstructTabCoordinationService",
    class extends ConstructTabCoordinationService {
      constructor(...args: unknown[]) {
        super(args[0] as ISequenceService, args[1] as IStartPositionService);
      }
    }
  );

export const IStartPositionServiceInterface =
  createServiceInterface<IStartPositionService>(
    "IStartPositionService",
    StartPositionService
  );

// Page layout services
export const IPrintablePageLayoutServiceInterface =
  createServiceInterface<IPrintablePageLayoutService>(
    "IPrintablePageLayoutService",
    PrintablePageLayoutService
  );

export const IPageFactoryServiceInterface =
  createServiceInterface<IPageFactoryService>(
    "IPageFactoryService",
    class extends PageFactoryService {
      constructor(...args: unknown[]) {
        super(args[0] as IPrintablePageLayoutService);
      }
    }
  );

// Export services
export const IPageImageExportServiceInterface =
  createServiceInterface<IPageImageExportService>(
    "IPageImageExportService",
    PageImageExportService
  );

export const ISequenceCardExportIntegrationServiceInterface =
  createServiceInterface<ISequenceCardExportIntegrationService>(
    "ISequenceCardExportIntegrationService",
    class extends SequenceCardExportIntegrationService {
      constructor(...args: unknown[]) {
        super(args[0] as IPageImageExportService);
      }
    }
  );

export const IOrientationCalculationServiceInterface =
  createServiceInterface<IOrientationCalculationService>(
    "IOrientationCalculationService",
    OrientationCalculationService
  );

export const IStartPositionSelectionServiceInterface =
  createServiceInterface<IStartPositionSelectionService>(
    "IStartPositionSelectionService",
    StartPositionSelectionService
  );
