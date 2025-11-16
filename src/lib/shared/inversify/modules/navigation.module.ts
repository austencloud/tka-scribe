import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";

// Import service implementations
import { KeyboardNavigationService } from "../../navigation/services/KeyboardNavigationService";
import { ModuleSelectionService } from "../../navigation/services/ModuleSelectionService";
import { NavigationLabelService } from "../../navigation/services/implementations/NavigationLabelService";

import { TYPES } from "../types";

export const navigationModule = new ContainerModule(
  async (options: ContainerModuleLoadOptions) => {
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
      .bind(TYPES.INavigationLabelService)
      .to(NavigationLabelService)
      .inSingletonScope();
  }
);
