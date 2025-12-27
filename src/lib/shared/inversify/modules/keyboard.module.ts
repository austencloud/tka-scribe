/**
 * Keyboard Shortcuts Inversify Module
 *
 * Configures dependency injection bindings for keyboard shortcut services.
 *
 * Domain: Keyboard Shortcuts - Dependency Injection
 */

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { TYPES } from "../types";
import { KeyboardShortcutManager } from "../../keyboard/services/implementations/KeyboardShortcutManager";
import { ShortcutRegistry } from "../../keyboard/services/implementations/ShortcutRegistry";
import { CommandPalette } from "../../keyboard/services/implementations/CommandPalette";
import { ShortcutCustomizer } from "../../keyboard/services/implementations/ShortcutCustomizer";
import type { IKeyboardShortcutManager } from "../../keyboard/services/contracts/IKeyboardShortcutManager";
import type { IShortcutRegistry } from "../../keyboard/services/contracts/IShortcutRegistry";
import type { ICommandPalette } from "../../keyboard/services/contracts/ICommandPalette";
import type { IShortcutCustomizer } from "../../keyboard/services/contracts/IShortcutCustomizer";

export const keyboardModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // Registry (Singleton - shared across the app)
    options
      .bind<IShortcutRegistry>(TYPES.IShortcutRegistry)
      .to(ShortcutRegistry)
      .inSingletonScope();

    // Main shortcut service (Singleton)
    options
      .bind<IKeyboardShortcutManager>(TYPES.IKeyboardShortcutManager)
      .to(KeyboardShortcutManager)
      .inSingletonScope();

    // Command palette service (Singleton)
    options
      .bind<ICommandPalette>(TYPES.ICommandPalette)
      .to(CommandPalette)
      .inSingletonScope();

    // Customization service (Singleton)
    options
      .bind<IShortcutCustomizer>(TYPES.IShortcutCustomizer)
      .to(ShortcutCustomizer)
      .inSingletonScope();
  }
);
