<!--
SettingsContainer.svelte - Container for all settings sections
Handles the responsive layout and scrolling behavior
-->
<script lang="ts">
  import SequenceSettingsSection from "./SequenceSettingsSection.svelte";
  import ModeLayoutSection from "./ModeLayoutSection.svelte";
  import ModeSpecificSection from "./ModeSpecificSection.svelte";
  import type { GenerationConfig } from "../generateConfigState.svelte";

  interface Props {
    config: GenerationConfig;
    isFreeformMode: boolean;
  }

  let { config, isFreeformMode }: Props = $props();
</script>

<div class="settings-container">
  <SequenceSettingsSection {config} />
  <ModeLayoutSection {config} />
  <ModeSpecificSection {config} {isFreeformMode} />
</div>

<style>
  .settings-container {
    flex: 1;
    overflow-y: auto;
    display: grid;
    grid-template-rows: auto auto auto;
    gap: calc(var(--element-spacing) * 1.25);
    margin-bottom: var(--element-spacing);
    min-height: 0; /* Allow proper overflow handling */
    align-content: start; /* Align to top instead of distributing */
  }

  /* Responsive layouts */
  :global(.generate-panel[data-layout="spacious"]) .settings-container {
    gap: calc(var(--element-spacing) * 1.5);
  }

  :global(.generate-panel[data-layout="compact"]) .settings-container {
    gap: calc(var(--element-spacing) * 0.75);
  }

  /* Ensure no scrolling is forced when not appropriate */
  :global(.generate-panel[data-allow-scroll="false"]) .settings-container {
    overflow: hidden;
    flex: 1;
    min-height: 0;
    /* Ensure grid doesn't expand beyond container */
    max-height: 100%;
  }
</style>
