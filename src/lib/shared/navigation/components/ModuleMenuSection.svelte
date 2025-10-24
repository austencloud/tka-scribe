<!--
  Module Menu Section Component

  Displays the hamburger menu button and module selector dropdown/modal.
  Handles all hover interactions via HoverController.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import { HamburgerMenuButton, ModuleSelector } from ".";
  import type {
    ModuleDefinition,
    ModuleId,
    ModuleSelectorState,
  } from "../domain/types";
  import { HoverController } from "../services/implementations";

  let {
    modules = [],
    currentModule,
    currentModuleName,
    isMobile = false,
    onModuleChange,
  } = $props<{
    modules: ModuleDefinition[];
    currentModule: ModuleId;
    currentModuleName: string;
    isMobile: boolean;
    onModuleChange?: (moduleId: ModuleId) => void;
  }>();

  // Services
  let hapticService: IHapticFeedbackService;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Module selector state
  let moduleSelectorState = $state<ModuleSelectorState>({
    isOpen: false,
    showDiscoveryHint: false,
  });

  // Hover controller for module selector - handles all timeout logic
  const hoverController = new HoverController({
    onOpen: () => {
      moduleSelectorState.isOpen = true;
    },
    onClose: () => {
      moduleSelectorState.isOpen = false;
    },
  });

  // Update hover controller when mobile state changes
  $effect(() => {
    if (isMobile) {
      hoverController.disable();
    } else {
      hoverController.enable();
    }
  });

  // Module selector functions
  function toggleModuleSelector() {
    hapticService?.trigger("navigation");
    hoverController.toggle();
  }

  function closeModuleSelector() {
    moduleSelectorState.isOpen = false;
  }

  function handleHamburgerMouseEnter() {
    hoverController.onMouseEnter();
  }

  function handleHamburgerMouseLeave() {
    hoverController.onMouseLeave();
  }

  // Handle module selection
  function handleModuleSelect(moduleId: ModuleId) {
    hapticService?.trigger("navigation");
    onModuleChange?.(moduleId);
    closeModuleSelector();
  }

  // Handle module selector hover (for desktop dropdown)
  function handleModuleSelectorHover() {
    hoverController.keepOpen();
  }

  function handleModuleSelectorMouseLeave() {
    hoverController.onMouseLeave();
  }
</script>

<div
  class="hamburger-container"
  class:has-selector={moduleSelectorState.isOpen}
>
  <HamburgerMenuButton
    {currentModule}
    {currentModuleName}
    isOpen={moduleSelectorState.isOpen}
    onHover={handleHamburgerMouseEnter}
    onMouseLeave={handleHamburgerMouseLeave}
    onClick={toggleModuleSelector}
  />

  <!-- Module Selector (Desktop Dropdown / Mobile Modal) -->
  <ModuleSelector
    {modules}
    {currentModule}
    onModuleSelect={handleModuleSelect}
    onClose={closeModuleSelector}
    isOpen={moduleSelectorState.isOpen}
    onHover={handleModuleSelectorHover}
    onMouseLeave={handleModuleSelectorMouseLeave}
    {isMobile}
  />
</div>

<style>
  .hamburger-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .hamburger-container.has-selector {
    z-index: 1001;
  }
</style>
