/**
 * Keyboard Shortcuts Inversify Module
 *
 * Configures dependency injection bindings for keyboard shortcut services.
 *
 * Domain: Keyboard Shortcuts - Dependency Injection
 */

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { TYPES } from "../types";
import { KeyboardShortcutService } from '../../keyboard/services/implementations/KeyboardShortcutService';
import { ShortcutRegistryService } from '../../keyboard/services/implementations/ShortcutRegistryService';
import { CommandPaletteService } from '../../keyboard/services/implementations/CommandPaletteService';
import type { IKeyboardShortcutService } from '../../keyboard/services/contracts/IKeyboardShortcutService';
import type { IShortcutRegistryService } from '../../keyboard/services/contracts/IShortcutRegistryService';
import type { ICommandPaletteService } from '../../keyboard/services/contracts/ICommandPaletteService';

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
