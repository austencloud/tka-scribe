<!-- Sections List Component -->
<!-- Container for section buttons that can slide in/out -->
<script lang="ts">
  import { slide } from "svelte/transition";
  import type { Section } from "../../domain/types";
  import SectionButton from "./SectionButton.svelte";

  let { sections, currentSection, moduleId, isActive, onSectionClick } =
    $props<{
      sections: Section[];
      currentSection: string;
      moduleId: string;
      isActive: boolean;
      onSectionClick: (moduleId: string, section: Section) => void;
    }>();
</script>

<div class="sections-list" transition:slide={{ duration: 200 }}>
  {#each sections as section}
    {@const isSectionActive = currentSection === section.id && isActive}

    <SectionButton
      {section}
      isActive={isSectionActive}
      onClick={() => onSectionClick(moduleId, section)}
    />
  {/each}
</div>

<style>
  /* ============================================================================
     SECTIONS LIST
     ============================================================================ */
  .sections-list {
    margin-top: 6px;
    padding-left: 8px;
  }

  /* ============================================================================
     ANIMATIONS & TRANSITIONS
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
      animation: none !important;
    }
  }
</style>
