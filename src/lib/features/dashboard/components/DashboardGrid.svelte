<script lang="ts">
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { ANIMATION_CONSTANTS } from "../domain/models/dashboard-config";
  import DashboardModuleCard from "./DashboardModuleCard.svelte";
  import type { ModuleId } from "$lib/shared/navigation/domain/types";

  interface ModuleCard {
    id: ModuleId;
    label: string;
    description?: string;
    icon: string;
    gradient?: string;
    isLocked: boolean;
  }

  interface Props {
    moduleCards: ModuleCard[];
    isVisible: boolean;
    onModuleClick: (moduleId: string, event: MouseEvent) => void;
  }

  const { moduleCards, isVisible, onModuleClick }: Props = $props();
</script>

{#if isVisible}
  <section
    class="modules-section"
    transition:fly={{
      y: ANIMATION_CONSTANTS.SLIDE.md,
      duration: ANIMATION_CONSTANTS.DURATION.normal,
      delay: ANIMATION_CONSTANTS.STAGGER.normal,
      easing: cubicOut,
    }}
  >
    <div class="modules-grid">
      {#each moduleCards as module, i (module.id)}
        <DashboardModuleCard
          id={module.id}
          label={module.label}
          description={module.description ?? ""}
          icon={module.icon}
          gradient={module.gradient ?? ""}
          isLocked={module.isLocked}
          index={i}
          onClick={(e) => onModuleClick(module.id, e)}
        />
      {/each}
    </div>
  </section>
{/if}

<style>
  .modules-section {
    width: 100%;
  }

  .modules-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    width: 100%;
  }

  @media (min-width: 640px) {
    .modules-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 18px;
    }
  }

  @media (min-width: 900px) {
    .modules-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
  }

  @media (max-width: 480px) {
    .modules-grid {
      gap: 12px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .modules-section {
      transition: none;
    }
  }
</style>
