<!--
  TransformDescriptionPanel.svelte

  Container for transform action cards
  - Mobile: Vertical stack (accordion pattern)
  - Desktop: 2-column grid
  Uses container queries for smart responsive layout
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
    width: 100%;
    container-type: inline-size;
  }

  /* Desktop: 2-column grid when container is wide enough */
  @container (min-width: 600px) {
    .transforms-panel {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      max-width: 900px;
      margin: 0 auto;
    }
  }
</style>
