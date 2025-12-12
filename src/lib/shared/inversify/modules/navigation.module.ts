import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";

// Import service implementations
import { KeyboardNavigationService } from "../../navigation/services/KeyboardNavigationService";
import { ModuleSelectionService } from "../../navigation/services/ModuleSelectionService";
import { SheetRouterService } from "../../navigation/services/implementations/SheetRouterService";
import { SequenceEncoderService } from "../../navigation/services/implementations/SequenceEncoderService";
import { URLSyncService } from "../../navigation/services/implementations/URLSyncService";
import { DeepLinkService } from "../../navigation/services/implementations/DeepLinkService";
import { LetterDeriverService } from "../../navigation/services/implementations/LetterDeriverService";
import { PositionDeriverService } from "../../navigation/services/implementations/PositionDeriverService";
import { SequenceViewerService } from "../../sequence-viewer/services/implementations/SequenceViewerService";
import { NavigationPersistenceService } from "../../navigation/services/implementations/NavigationPersistenceService";
import { NavigationValidationService } from "../../navigation/services/implementations/NavigationValidationService";

import { TYPES } from "../types";

export const navigationModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === NAVIGATION UI SERVICES ===
    // Note: IViewportService is bound in core.module.ts
    options
      .bind(TYPES.IModuleSelectionService)
      .to(ModuleSelectionService)
      .inSingletonScope();
    options
      .bind(TYPES.IKeyboardNavigationService)
      .to(KeyboardNavigationService)
      .inSingletonScope();
    options
      .bind(TYPES.ISheetRouterService)
      .to(SheetRouterService)
      .inSingletonScope();
    options
      .bind(TYPES.ISequenceEncoderService)
      .to(SequenceEncoderService)
      .inSingletonScope();
    options
      .bind(TYPES.IURLSyncService)
      .to(URLSyncService)
      .inSingletonScope();
    options
      .bind(TYPES.IDeepLinkService)
      .to(DeepLinkService)
      .inSingletonScope();
    options
      .bind(TYPES.ILetterDeriverService)
      .to(LetterDeriverService)
      .inSingletonScope();
    options
      .bind(TYPES.IPositionDeriverService)
      .to(PositionDeriverService)
      .inSingletonScope();
    options
      .bind(TYPES.ISequenceViewerService)
      .to(SequenceViewerService)
      .inSingletonScope();
    options
      .bind(TYPES.INavigationPersistenceService)
      .to(NavigationPersistenceService)
      .inSingletonScope();
    options
      .bind(TYPES.INavigationValidationService)
      .to(NavigationValidationService)
      .inSingletonScope();
  }
);
