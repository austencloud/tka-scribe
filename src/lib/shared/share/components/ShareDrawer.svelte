<!--
  ShareDrawer.svelte

  Drawer wrapper around SharePanel with matching layout to AnimationPanel.
  Uses CreatePanelDrawer and PanelHeader for consistent panel architecture.
-->
<script module lang="ts">
  // Re-export ViewMode type for consumers
  export type { ViewMode } from "./SharePanel.svelte";
</script>

<script lang="ts">
  import { CreatePanelDrawer } from "$lib/modules/create/shared/components";
  import PanelHeader from "$lib/modules/create/shared/components/PanelHeader.svelte";
  import { tryGetCreateModuleContext } from "$lib/modules/create/shared/context";
import type { SequenceData } from "../../foundation/domain/models/SequenceData";
  import type { ShareState } from "../state";
  import SharePanel, { type ViewMode } from "./SharePanel.svelte";

  let {
    show = $bindable(false),
    sequence = null,
    shareState = null,
    viewMode = $bindable("main"),
    onClose,
    onSequenceUpdate,
    heading = "Share Sequence",
    combinedPanelHeight = 0,
  }: {
    show?: boolean;
    sequence?: SequenceData | null;
    shareState?: ShareState | null;
    viewMode?: ViewMode;
    onClose?: () => void;
    onSequenceUpdate?: (sequence: SequenceData) => void;
    heading?: string;
    combinedPanelHeight?: number;
  } = $props();

  // Track expansion state from SharePanel
  let isExpanded = $state(false);

  function handleClose() {
    show = false;
    onClose?.();
  }

  function handleExpandedChange(expanded: boolean) {
    isExpanded = expanded;
  }

  const createModuleContext = tryGetCreateModuleContext();
  const isSideBySideLayout = $derived(
    createModuleContext
      ? createModuleContext.layout.shouldUseSideBySideLayout
      : false
  );
</script>

<CreatePanelDrawer
  isOpen={show}
  panelName="share"
  {combinedPanelHeight}
  fullHeightOnMobile={isExpanded && !isSideBySideLayout}
  showHandle={true}
  closeOnBackdrop={true}
  focusTrap={false}
  lockScroll={false}
  labelledBy="share-panel-title"
  onClose={handleClose}
>
  <div class="share-panel" role="dialog" aria-labelledby="share-panel-title">
    <PanelHeader
      title={heading}
      isMobile={!isSideBySideLayout}
      onClose={handleClose}
    />

    <h2 id="share-panel-title" class="sr-only">{heading}</h2>

    <div class="share-panel__content">
      <SharePanel
        currentSequence={sequence}
        {shareState}
        bind:viewMode
        onClose={handleClose}
        onExpandedChange={handleExpandedChange}
        {...onSequenceUpdate ? { onSequenceUpdate } : {}}
      />
    </div>
  </div>
</CreatePanelDrawer>

<style>
  /* Screen reader only class */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* Share panel container - full height, flex layout */
  .share-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* Content area - scrollable */
  .share-panel__content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
