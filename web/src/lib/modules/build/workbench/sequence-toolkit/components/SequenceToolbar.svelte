<!--
SequenceToolbar.svelte - Integrated Sequence Toolbar

Combines ExportTools, TransformTools, and DeleteTools into a unified toolbar.
Pure presentation component that coordinates tool operations.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import ExportTools from "./ExportTools.svelte";
  import TransformTools from "./TransformTools.svelte";
  import DeleteTools from "./DeleteTools.svelte";

  interface Props {
    disabled?: boolean;
    hasSelection?: boolean;
    hasSequence?: boolean;
    onDeleteBeat?: () => void;
    onClearSequence?: () => void;
    onAddToDictionary?: () => void;
    onFullscreen?: () => void;
    onMirror?: () => void;
    onSwapColors?: () => void;
    onRotate?: () => void;
    onCopyJson?: () => void;
    renderExtra?: Snippet;
  }

  let {
    disabled = false,
    hasSelection = false,
    hasSequence = false,
    onDeleteBeat,
    onClearSequence,
    onAddToDictionary,
    onFullscreen,
    onMirror,
    onSwapColors,
    onRotate,
    onCopyJson,
    renderExtra,
  }: Props = $props();
</script>

<div class="sequence-toolbar" aria-label="Sequence Controls">
  <!-- Export Tools -->
  <ExportTools
    {disabled}
    {hasSequence}
    onCopyJson={onCopyJson}
    onAddToDictionary={onAddToDictionary}
    onFullscreen={onFullscreen}
  />

  <!-- Visual Separator -->
  <div class="separator"></div>

  <!-- Transform Tools -->
  <TransformTools
    {disabled}
    {hasSequence}
    onMirror={onMirror}
    onSwapColors={onSwapColors}
    onRotate={onRotate}
  />

  <!-- Visual Separator -->
  <div class="separator"></div>

  <!-- Delete Tools -->
  <DeleteTools
    {disabled}
    {hasSelection}
    {hasSequence}
    onDeleteBeat={onDeleteBeat}
    onClearSequence={onClearSequence}
  />

  {#if renderExtra}
    {@render renderExtra()}
  {/if}
</div>

<style>
  .sequence-toolbar {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center; /* Center tools vertically */
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    min-width: 80px;
    height: 100%; /* Take full height to enable centering */

    /* Glassmorphism panel styling with reduced opacity to avoid visual conflict */
    background: rgba(255, 255, 255, 0.04); /* Reduced from 0.08 */
    border: 1px solid rgba(255, 255, 255, 0.08); /* More subtle border */
    border-radius: 12px;
    box-shadow:
      0 4px 16px rgba(0, 0, 0, 0.08),
      0 2px 8px rgba(0, 0, 0, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.05); /* Reduced shadow intensity */

    /* Position relative for pseudo-element */
    position: relative;
  }

  .sequence-toolbar::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 12px;
    padding: 1px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.02)
    );
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: xor;
    pointer-events: none;
  }

  .separator {
    width: 24px;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    margin: var(--spacing-xs) 0;
  }
</style>
