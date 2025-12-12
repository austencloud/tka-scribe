/**
 * Register Global Shortcuts
 *
 * Registers all global keyboard shortcuts that are available app-wide.
 *
 * Domain: Keyboard Shortcuts - Registration
 */

import type { IKeyboardShortcutService } from "../services/contracts/IKeyboardShortcutService";
import type { createKeyboardShortcutState } from "../state/keyboard-shortcut-state.svelte";
import {
  handleModuleChange,
  getModuleDefinitions,
} from "../../navigation-coordinator/navigation-coordinator.svelte";
import { authState } from "../../auth/state/authState.svelte";
import { quickFeedbackState } from "$lib/features/feedback/state/quick-feedback-state.svelte";
import { saveActiveTab } from "../../settings/utils/tab-persistence.svelte";
import { roleSwitcherState } from "../../debug/state/role-switcher-state.svelte";

export function registerGlobalShortcuts(
  service: IKeyboardShortcutService,
  state: ReturnType<typeof createKeyboardShortcutState>
) {
  // Get accessible modules
  const moduleDefinitions = getModuleDefinitions();
  const isAdmin = authState.isAdmin;

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
  // ==================== TIER 1: Essential Global Shortcuts ====================
  // Using single-key shortcuts (Gmail/Notion style) since Chrome blocks most Ctrl combinations

  // ? - Show keyboard shortcuts settings (Gmail standard, opens Settings → Keyboard)
  service.register({
    id: "global.shortcuts-help",
    label: "Keyboard shortcuts",
    description: "Open keyboard shortcuts settings (press ? key)",
    key: "?",
    modifiers: [],
    context: "global",
    scope: "help",
    priority: "critical",
    condition: () => {
      // Only enable if settings allow single-key shortcuts
      return state.settings.enableSingleKeyShortcuts;
    },
    action: async () => {
      // Set the active tab to Keyboard before navigating to settings
      saveActiveTab("Keyboard");
      await handleModuleChange("settings");
    },
  });

  // Escape - Close current modal/panel
  service.register({
    id: "global.escape",
    label: "Close modal",
    description: "Close the current modal, panel, or dialog",
    key: "Escape",
    modifiers: [],
    context: "global",
    scope: "navigation",
    priority: "critical",
    action: () => {
      // Close command palette if open
      if (state.showCommandPalette) {
        state.closeCommandPalette();
        return;
      }

      // Other escape handlers will be context-specific
    },
  });

  // ==================== Module Switching (Single Keys) ====================
  // Using single-key shortcuts (numbers 1-5) like Gmail/Notion
  // These work reliably in Chrome unlike Ctrl+1-9 or Alt+1-5

  // Map modules to number keys
  const moduleKeyMap = ["1", "2", "3", "4", "5"];

  accessibleModules.slice(0, 5).forEach((module, index) => {
    const key = moduleKeyMap[index];
    if (!key) return;

    service.register({
      id: `global.switch-to-${module.id}`,
      label: module.label,
      description: `Navigate to ${module.label}`,
      key: key,
      modifiers: [],
      context: "global",
      scope: "navigation",
      priority: "high",
      condition: () => {
        // Only enable if settings allow single-key shortcuts
        return state.settings.enableSingleKeyShortcuts;
      },
      action: async () => {
        await handleModuleChange(module.id);
      },
    });
  });

  // ==================== Quick Actions ====================

  // f - Quick Feedback (opens feedback drawer)
  service.register({
    id: "global.quick-feedback",
    label: "Quick Feedback",
    description: "Open the quick feedback panel (press f)",
    key: "f",
    modifiers: [],
    context: "global",
    scope: "action",
    priority: "high",
    condition: () => {
      // Only enable if settings allow single-key shortcuts
      return state.settings.enableSingleKeyShortcuts;
    },
    action: () => {
      quickFeedbackState.toggle();
    },
  });

  // ==================== Admin Shortcuts ====================
  // Only registered for admin users

  // F9 - Role Switcher (admin-only debug tool)
  service.register({
    id: "admin.role-switcher",
    label: "Role Switcher",
    description: "Toggle the role switcher debug panel (admin only)",
    key: "F9",
    modifiers: [],
    context: "global",
    scope: "admin",
    priority: "high",
    // No condition needed - the RoleSwitcherDebugPanel already checks {#if isAdmin}
    // This allows F9 to work even during auth initialization race conditions
    action: () => {
      roleSwitcherState.toggle();
    },
  });
}
