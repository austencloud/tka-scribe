<!--
  ImageShareDrawer.svelte

  Drawer wrapper around ImageSharePanel for static image export.
  Uses CreatePanelDrawer and PanelHeader for consistent panel architecture.
-->
<script module lang="ts">
  // Re-export ViewMode type for consumers
  export type { ViewMode } from "./ImageSharePanel.svelte";
</script>

<script lang="ts">
  import CreatePanelDrawer from "$lib/features/create/shared/components/CreatePanelDrawer.svelte";
  import PanelHeader from "$lib/features/create/shared/components/PanelHeader.svelte";
  import { tryGetCreateModuleContext } from "$lib/features/create/shared/context/create-module-context";
import type { SequenceData } from "../../foundation/domain/models/SequenceData";
  import type { ShareState } from "../state/share-state.svelte";
  import ImageSharePanel, { type ViewMode } from "./ImageSharePanel.svelte";

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

  function handleClose() {
    show = false;
    onClose?.();
  }

  const createModuleContext = tryGetCreateModuleContext();
  const isSideBySideLayout = $derived(
    createModuleContext
      ? createModuleContext.layout.shouldUseSideBySideLayout
      : false
  );

  // On mobile, share panel should always take full screen height
  const shouldBeFullHeight = $derived(!isSideBySideLayout);
</script>

<CreatePanelDrawer
  isOpen={show}
  panelName="share"
  {combinedPanelHeight}
  fullHeightOnMobile={shouldBeFullHeight}
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
      <ImageSharePanel
        currentSequence={sequence}
        {shareState}
        bind:viewMode
        onClose={handleClose}
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
