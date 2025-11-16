<!-- Module Group Component -->
<!-- Combines a module button with its expandable sections list -->
<script lang="ts">
  import type { ModuleDefinition, Section } from "../../domain/types";
  import ModuleButton from "./ModuleButton.svelte";
  import SectionsList from "./SectionsList.svelte";

  let {
    module,
    currentModule,
    currentSection,
    isExpanded,
    isCollapsed,
    isTransitioningFromCollapsed,
    onModuleClick,
    onSectionClick,
  } = $props<{
    module: ModuleDefinition;
    currentModule: string;
    currentSection: string;
    isExpanded: boolean;
    isCollapsed: boolean;
    isTransitioningFromCollapsed: boolean;
    onModuleClick: (moduleId: string, isDisabled: boolean) => void;
    onSectionClick: (moduleId: string, section: Section) => void;
  }>();

  const isActive = $derived(currentModule === module.id);
  const isDisabled = $derived(module.disabled ?? false);
</script>

<div class="module-group">
  <!-- Module Button -->
  <ModuleButton
    {module}
    {isActive}
    {isExpanded}
    {isCollapsed}
    onClick={() => onModuleClick(module.id, isDisabled)}
  />

  <!-- Module Sections/Tabs (collapsible) -->
  {#if isExpanded && module.sections.length > 0 && !isCollapsed && !isTransitioningFromCollapsed}
    <SectionsList
      sections={module.sections}
      {currentSection}
      moduleId={module.id}
      {isActive}
      {onSectionClick}
    />
  {/if}
</div>

<style>
  /* ============================================================================
     MODULE GROUP
     ============================================================================ */
  .module-group {
    margin-bottom: 8px;
  }

  .module-group:last-child {
    margin-bottom: 0;
  }
</style>
