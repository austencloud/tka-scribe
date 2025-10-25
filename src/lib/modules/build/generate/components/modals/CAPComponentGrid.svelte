<!--
CAPComponentGrid.svelte - Grid layout for CAP component selection buttons
Displays all available CAP transformations in a responsive 2x2 grid
-->
<script lang="ts">
  import { CAPComponent } from "$shared";
  import { CAP_COMPONENTS } from "./cap-components";
  import CAPComponentButton from "./CAPComponentButton.svelte";

  let {
    selectedComponents,
    onToggleComponent
  } = $props<{
    selectedComponents: Set<CAPComponent>;
    onToggleComponent: (component: CAPComponent) => void;
  }>();
</script>

<div class="component-grid">
  {#each CAP_COMPONENTS as componentInfo}
    <CAPComponentButton
      {componentInfo}
      isSelected={selectedComponents.has(componentInfo.component)}
      onClick={() => onToggleComponent(componentInfo.component)}
    />
  {/each}
</div>

<style>
  .component-grid {
    display: grid;
    /* 🎯 Single row for wide viewports, 2x2 for narrow */
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: clamp(12px, 2vmin, 20px);
    width: 100%;
    flex-shrink: 0;
  }

  /* 📱 PORTRAIT MODE: 2x2 grid for narrow viewports */
  @media (orientation: portrait) {
    .component-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* 📱 SMALL SCREENS: Tighter spacing */
  @media (max-width: 400px) {
    .component-grid {
      gap: clamp(8px, 2vw, 12px);
    }
  }

  /* 🌅 LANDSCAPE MODE: Single row for wide viewports */
  @media (orientation: landscape) and (max-height: 600px) {
    .component-grid {
      gap: clamp(12px, 2vw, 20px);
    }
  }

  /* 📱 LANDSCAPE + VERY NARROW: Compact spacing */
  @media (orientation: landscape) and (max-height: 400px) {
    .component-grid {
      gap: clamp(8px, 1.5vw, 12px);
    }
  }
</style>
