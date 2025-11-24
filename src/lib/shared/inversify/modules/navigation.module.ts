import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";

// Import service implementations
import { KeyboardNavigationService } from "../../navigation/services/KeyboardNavigationService";
import { ModuleSelectionService } from "../../navigation/services/ModuleSelectionService";
import { SheetRouterService } from "../../navigation/services/implementations/SheetRouterService";

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
  }
);
