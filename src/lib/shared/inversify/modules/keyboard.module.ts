/**
 * Keyboard Shortcuts Inversify Module
 *
 * Configures dependency injection bindings for keyboard shortcut services.
 *
 * Domain: Keyboard Shortcuts - Dependency Injection
 */

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";

import {
  CommandPaletteService,
  KeyboardShortcutService,
  ShortcutRegistryService,
} from "$shared/keyboard/services";
import type {
  ICommandPaletteService,
  IKeyboardShortcutService,
  IShortcutRegistryService,
} from "$shared/keyboard/services/contracts";

import { TYPES } from "../types";

export const keyboardModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
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
