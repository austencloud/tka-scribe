/**
 * Register Command Palette Commands
 *
 * Registers all commands available in the command palette.
 *
 * Domain: Keyboard Shortcuts - Command Registration
 */

import type { ICommandPaletteService } from "../services/contracts";
import type { createKeyboardShortcutState } from "../state/keyboard-shortcut-state.svelte";
import { showSettingsDialog } from "../../application/state/ui/ui-state.svelte";
import {
  handleModuleChange,
  getModuleDefinitions,
} from "../../navigation-coordinator/navigation-coordinator.svelte";
import { authStore } from "../../auth";

export function registerCommandPaletteCommands(
  service: ICommandPaletteService,
  state: ReturnType<typeof createKeyboardShortcutState>
) {
  // Get accessible modules
  const moduleDefinitions = getModuleDefinitions();
  const isAdmin = authStore.isAdmin;

  // Filter modules to only show accessible ones
  const accessibleModules = moduleDefinitions.filter((module) => {
    // Filter out admin module for non-admin users
    if (module.id === "admin" && !isAdmin) {
      return false;
    }
    // Filter out modules that aren't implemented yet
    const notImplemented = ["write", "word-card"];
    if (notImplemented.includes(module.id)) {
      return false;
    }
    return true;
  });

  // ==================== Navigation Commands ====================

  // Dynamically register commands for accessible modules
  accessibleModules.forEach((module, index) => {
    const shortcutNumber = index + 1;
    const shortcutKey = shortcutNumber <= 5 ? `${shortcutNumber}` : undefined;

    service.registerCommand({
      id: `navigate.${module.id}`,
      label: `Go to ${module.label.toUpperCase()}`,
      description:
        module.description || `Navigate to the ${module.label} module`,
      icon: module.icon || "fa-circle",
      category: "Navigation",
      ...(shortcutKey !== undefined && { shortcut: shortcutKey }),
      keywords: [module.label.toLowerCase(), module.id],
      available: true,
      action: async () => {
        await handleModuleChange(module.id as any);
        state.closeCommandPalette();
      },
    });
  });

  // ==================== Settings Commands ====================

  service.registerCommand({
    id: "settings.open",
    label: "Open Settings",
    description: "Configure application settings",
    icon: "fa-cog",
    category: "Settings",
    shortcut: state.isMac ? "⌘," : "Ctrl+Shift+,",
    keywords: ["settings", "preferences", "config", "options"],
    available: true,
    action: () => {
      // Determine mode based on viewport: desktop (769px+) uses side panel, mobile uses bottom sheet
      const mode =
        typeof window !== "undefined" && window.innerWidth >= 769
          ? "desktop"
          : "mobile";
      showSettingsDialog(mode);
      state.closeCommandPalette();
    },
  });

  // ==================== Help Commands ====================

  service.registerCommand({
    id: "help.shortcuts",
    label: "Show Keyboard Shortcuts",
    description: "View all available shortcuts",
    icon: "fa-keyboard",
    category: "Help",
    shortcut: state.isMac ? "⌘/" : "Ctrl+/",
    keywords: ["help", "shortcuts", "keyboard", "hotkeys"],
    available: true,
    action: () => {
      state.openHelp();
      state.closeCommandPalette();
    },
  });
}
