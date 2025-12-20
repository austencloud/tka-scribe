<script lang="ts">
  import { BASE_COMPONENTS, type ComponentId } from "../../domain/constants/cap-components";
  import FontAwesomeIcon from "$lib/shared/foundation/ui/FontAwesomeIcon.svelte";

  interface Props {
    labelingMode: "whole" | "section" | "beatpair";
    onLabelingModeChange: (mode: "whole" | "section" | "beatpair") => void;
  }

  let {
    labelingMode,
    onLabelingModeChange,
  }: Props = $props();
</script>

<div class="component-selection-panel">
  <!-- Mode Toggle: Whole Sequence vs Section Mode vs Beat Pair -->
  <div class="mode-toggle-container">
    <button
      class="mode-toggle-btn"
      class:active={labelingMode === "whole"}
      onclick={() => onLabelingModeChange("whole")}
    >
      <FontAwesomeIcon icon="layer-group" size="1em" />
      Whole Sequence
    </button>
    <button
      class="mode-toggle-btn"
      class:active={labelingMode === "section"}
      onclick={() => onLabelingModeChange("section")}
    >
      <FontAwesomeIcon icon="grip" size="1em" />
      Section Mode
    </button>
    <button
      class="mode-toggle-btn"
      class:active={labelingMode === "beatpair"}
      onclick={() => onLabelingModeChange("beatpair")}
    >
      <FontAwesomeIcon icon="link" size="1em" />
      Beat Pair
    </button>
  </div>
</div>

<style>
  .component-selection-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-md, 12px);
  }

  .mode-toggle-container {
    display: flex;
    gap: var(--space-xs, 4px);
    padding: var(--space-xs, 4px);
    background: var(--surface-inset, rgba(0, 0, 0, 0.3));
    border-radius: var(--radius-md, 8px);
  }

  .mode-toggle-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm, 8px);
    padding: var(--space-sm, 8px) var(--space-md, 12px);
    background: transparent;
    border: none;
    border-radius: var(--radius-sm, 6px);
    color: var(--text-muted, rgba(255, 255, 255, 0.5));
    font-size: var(--text-md, 13px);
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition-default, 0.15s ease);
  }

  .mode-toggle-btn:hover {
    color: var(--text-secondary, rgba(255, 255, 255, 0.7));
    background: var(--surface-overlay, rgba(255, 255, 255, 0.08));
  }

  .mode-toggle-btn.active {
    background: var(--accent-primary, #6366f1);
    color: var(--text-primary, #fff);
    font-weight: 600;
  }
</style>
