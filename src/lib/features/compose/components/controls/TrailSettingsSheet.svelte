<!--
  TrailSettingsSheet.svelte

  Sheet containing trail customization options.
  Uses SimpleTrailControls for the core presets.
-->
<script lang="ts">
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import SimpleTrailControls from "../trail/SimpleTrailControls.svelte";
  import type { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";

  let {
    isOpen = $bindable(false),
    currentPropType = null,
    bluePropType = null,
    redPropType = null,
  }: {
    isOpen: boolean;
    currentPropType?: PropType | string | null;
    bluePropType?: PropType | string | null;
    redPropType?: PropType | string | null;
  } = $props();
</script>

<Drawer
  bind:isOpen
  placement="right"
  respectLayoutMode={true}
  closeOnBackdrop={true}
  closeOnEscape={true}
  ariaLabel="Trail Settings"
  showHandle={true}
  class="trail-settings-sheet"
>
  <div class="sheet-content">
    <header class="sheet-header">
      <h3 class="sheet-title">Trail Settings</h3>
      <button
        class="sheet-close-btn"
        onclick={() => (isOpen = false)}
        aria-label="Close"
        type="button"
      >
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    </header>
    <div class="sheet-body">
      <SimpleTrailControls
        propType={currentPropType}
        {bluePropType}
        {redPropType}
      />

      <p class="hint-text">
        Trails visualize the path each prop takes through space.
        <strong>Subtle</strong> shows a fading trail, while <strong>Vivid</strong> adds glow effects.
      </p>
    </div>
  </div>
</Drawer>

<style>
  :global(.trail-settings-sheet) {
    --sheet-width: min(320px, 85vw);
  }

  :global(.drawer-content.trail-settings-sheet) {
    bottom: 0 !important;
    max-height: 100dvh !important;
    border-radius: 16px 0 0 16px !important;
  }

  .sheet-content {
    display: flex;
    flex-direction: column;
    padding: 20px;
    min-width: 280px;
    height: 100%;
    background: var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.65));
  }

  .sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    margin-bottom: 20px;
    flex-shrink: 0;
  }

  .sheet-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    margin: 0;
  }

  .sheet-close-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .sheet-close-btn:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .sheet-body {
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
  }

  .hint-text {
    font-size: var(--font-size-sm, 14px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    line-height: 1.5;
    margin: 0;
  }

  .hint-text strong {
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
  }
</style>
