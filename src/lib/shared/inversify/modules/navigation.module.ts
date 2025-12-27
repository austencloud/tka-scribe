import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";

// Import service implementations
import { KeyboardNavigator } from "../../navigation/services/KeyboardNavigator";
import { ModuleSelector } from "../../navigation/services/ModuleSelector";
import { SheetRouter } from "../../navigation/services/implementations/SheetRouter";
import { SequenceEncoder } from "../../navigation/services/implementations/SequenceEncoder";
import { URLSyncer } from "../../navigation/services/implementations/URLSyncer";
import { DeepLinker } from "../../navigation/services/implementations/DeepLinker";
import { LetterDeriver } from "../../navigation/services/implementations/LetterDeriver";
import { PositionDeriver } from "../../navigation/services/implementations/PositionDeriver";
import { SequenceViewer } from "../../sequence-viewer/services/implementations/SequenceViewer";
import { NavigationPersister } from "../../navigation/services/implementations/NavigationPersister";
import { NavigationValidator } from "../../navigation/services/implementations/NavigationValidator";

import { TYPES } from "../types";

export const navigationModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === NAVIGATION UI SERVICES ===
    // Note: IViewportManager is bound in core.module.ts
    options
      .bind(TYPES.IModuleSelector)
      .to(ModuleSelector)
      .inSingletonScope();
    options
      .bind(TYPES.IKeyboardNavigator)
      .to(KeyboardNavigator)
      .inSingletonScope();
    options
      .bind(TYPES.ISheetRouter)
      .to(SheetRouter)
      .inSingletonScope();
    options
      .bind(TYPES.ISequenceEncoder)
      .to(SequenceEncoder)
      .inSingletonScope();
    options.bind(TYPES.IURLSyncer).to(URLSyncer).inSingletonScope();
    options.bind(TYPES.IDeepLinker).to(DeepLinker).inSingletonScope();
    options
      .bind(TYPES.ILetterDeriver)
      .to(LetterDeriver)
      .inSingletonScope();
    options
      .bind(TYPES.IPositionDeriver)
      .to(PositionDeriver)
      .inSingletonScope();
    options
      .bind(TYPES.ISequenceViewer)
      .to(SequenceViewer)
      .inSingletonScope();
    options
      .bind(TYPES.INavigationPersister)
      .to(NavigationPersister)
      .inSingletonScope();
    options
      .bind(TYPES.INavigationValidator)
      .to(NavigationValidator)
      .inSingletonScope();
  }
);
