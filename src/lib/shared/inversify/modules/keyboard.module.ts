/**
 * Keyboard Shortcuts Inversify Module
 *
 * Configures dependency injection bindings for keyboard shortcut services.
 *
 * Domain: Keyboard Shortcuts - Dependency Injection
 */

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { TYPES } from "../types";
import {
  KeyboardShortcutService,
  ShortcutRegistryService,
  CommandPaletteService,
} from "$shared/keyboard/services";
import type {
  IKeyboardShortcutService,
  IShortcutRegistryService,
  ICommandPaletteService,
} from "$shared/keyboard/services/contracts";

export const keyboardModule = new ContainerModule(
  async (options: ContainerModuleLoadOptions) => {
    // Registry (Singleton - shared across the app)
    options
      .bind<IShortcutRegistryService>(TYPES.IShortcutRegistryService)
      .to(ShortcutRegistryService)
      .inSingletonScope();

    // Main shortcut service (Singleton)
    options
      .bind<IKeyboardShortcutService>(TYPES.IKeyboardShortcutService)
      .to(KeyboardShortcutService)
      .inSingletonScope();

    // Command palette service (Singleton)
    options
      .bind<ICommandPaletteService>(TYPES.ICommandPaletteService)
      .to(CommandPaletteService)
      .inSingletonScope();
  }
);
