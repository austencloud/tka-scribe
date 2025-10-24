<!--
  Module Selector Component

  Orchestrates between desktop dropdown and mobile modal views.
  This is a lightweight wrapper that delegates to specialized components.
-->
<script lang="ts">
  import ModuleDropdown from "./ModuleDropdown.svelte";
  import ModuleMobileModal from "./ModuleMobileModal.svelte";
  import type { ModuleDefinition, ModuleId } from "../domain/types";

  let {
    modules = [],
    currentModule,
    onModuleSelect,
    onClose,
    isOpen = false,
    onHover,
    onMouseLeave,
    isMobile = false,
  } = $props<{
    modules: ModuleDefinition[];
    currentModule: ModuleId;
    onModuleSelect: (moduleId: ModuleId) => void;
    onClose: () => void;
    isOpen: boolean;
    onHover?: () => void;
    onMouseLeave?: () => void;
    isMobile?: boolean;
  }>();

  // Separate main and developer modules
  const mainModules = $derived(() =>
    modules.filter((m: ModuleDefinition) => m.isMain)
  );
  const devModules = $derived(() =>
    modules.filter((m: ModuleDefinition) => !m.isMain)
  );
</script>

{#if isOpen}
  {#if isMobile}
    <!-- Mobile Modal View -->
    <ModuleMobileModal
      mainModules={mainModules()}
      devModules={devModules()}
      {currentModule}
      {onModuleSelect}
      {onClose}
      {isOpen}
    />
  {:else}
    <!-- Desktop Dropdown View -->
    <ModuleDropdown
      mainModules={mainModules()}
      devModules={devModules()}
      {currentModule}
      {onModuleSelect}
      {onHover}
      {onMouseLeave}
    />
  {/if}
{/if}
