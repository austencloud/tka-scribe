<!--
  TransformDescriptionPanel.svelte

  Desktop: Shows all 4 transforms with descriptions
  Mobile: Accordion with one expanded at a time (Mirror by default)
-->
<script lang="ts">
  import { transformHelpContent } from "../../domain/transforms/transform-help-content";
  import TransformDescription from "./TransformDescription.svelte";

  interface Props {
    expandedTransformId: "mirror" | "rotate" | "swap" | "rewind";
    onToggleExpand?: (id: "mirror" | "rotate" | "swap" | "rewind") => void;
    onApplyTransform?: (transformId: string) => void;
    onApplyRotate?: (direction: "cw" | "ccw") => void;
  }

  let {
    expandedTransformId,
    onToggleExpand,
    onApplyTransform,
    onApplyRotate,
  }: Props = $props();

  function isExpanded(id: string): boolean {
    return id === expandedTransformId;
  }

  function handleToggle(id: "mirror" | "rotate" | "swap" | "rewind") {
    onToggleExpand?.(id);
  }
</script>

<div class="transforms-panel">
  {#each transformHelpContent as item (item.id)}
    <TransformDescription
      {item}
      expanded={isExpanded(item.id)}
      onToggle={() => handleToggle(item.id as "mirror" | "rotate" | "swap" | "rewind")}
      onApply={() => {
        if (item.id === "rotate") {
          onApplyRotate?.("cw");
        } else {
          onApplyTransform?.(item.id);
        }
      }}
      onRotate={onApplyRotate}
    />
  {/each}
</div>

<style>
  .transforms-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
  }

  /* Desktop: 2-column grid */
  @media (min-width: 768px) {
    .transforms-panel {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      width: 100%;
      max-width: 900px;
    }
  }
</style>
