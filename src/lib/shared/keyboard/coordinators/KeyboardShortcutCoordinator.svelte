<script lang="ts">
  /**
   * Keyboard Shortcut Coordinator
   *
   * Initializes and coordinates the keyboard shortcut system.
   * Registers global shortcuts and manages the command palette.
   *
   * Domain: Keyboard Shortcuts - Coordination
   */

  import { onMount } from "svelte";
  import { resolve, TYPES } from "../../inversify/di";

  import type { IKeyboardShortcutService } from "../services/contracts/IKeyboardShortcutService";
  import type { ICommandPaletteService } from "../services/contracts/ICommandPaletteService";
  import { keyboardShortcutState } from "../state/keyboard-shortcut-state.svelte";
  import { getActiveModule } from "../../application/state/ui/ui-state.svelte";
  import { registerGlobalShortcuts } from "../utils/register-global-shortcuts";
  import { registerCommandPaletteCommands } from "../utils/register-commands";
  import { registerCreateShortcuts } from "../utils/register-create-shortcuts";

  // Services
  let shortcutService: IKeyboardShortcutService | null = null;
  let commandPaletteService: ICommandPaletteService | null = null;

  onMount(() => {
    console.log(`[KeyboardShortcutCoordinator] onMount called`);
    // Initialize services asynchronously
    (async () => {
      try {
        // Resolve services
        shortcutService = resolve<IKeyboardShortcutService>(
          TYPES.IKeyboardShortcutService
        );
        commandPaletteService = resolve<ICommandPaletteService>(
          TYPES.ICommandPaletteService
        );
        console.log(`[KeyboardShortcutCoordinator] Services resolved`);

        // Initialize the shortcut service
        shortcutService.initialize();
        console.log(`[KeyboardShortcutCoordinator] Service initialized`);

        // Register global shortcuts
        registerGlobalShortcuts(shortcutService, keyboardShortcutState);
        console.log(`[KeyboardShortcutCoordinator] Global shortcuts registered, total:`, shortcutService.getAllShortcuts().length);

        // Register command palette commands
        registerCommandPaletteCommands(
          commandPaletteService,
          keyboardShortcutState
        );

        // Register CREATE module shortcuts
        registerCreateShortcuts(shortcutService, keyboardShortcutState);
        console.log(`[KeyboardShortcutCoordinator] All shortcuts registered, total:`, shortcutService.getAllShortcuts().length);
      } catch (error) {
        console.error("❌ Failed to initialize keyboard shortcuts:", error);
      }
    })();

    // Cleanup on unmount
    return () => {
      if (shortcutService) {
        shortcutService.dispose();
      }
    };
  });

  // Sync context with active module
  $effect(() => {
    const module = getActiveModule();

    // Only set context if service is initialized and module is available
    if (shortcutService && module) {
      shortcutService.setContext(module as any);
    }
  });
</script>

<!-- This coordinator has no UI -->
