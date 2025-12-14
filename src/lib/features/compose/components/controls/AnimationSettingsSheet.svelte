<!--
  AnimationSettingsSheet.svelte

  Settings drawer/sheet wrapper with header and close button.
  Contains the AnimationSettingsContent component.
-->
<script lang="ts">
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import AnimationSettingsContent from "./AnimationSettingsContent.svelte";
  import type { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";

  let {
    isOpen = $bindable(false),
    bpm = $bindable(60),
    blueMotionVisible = true,
    redMotionVisible = true,
    isCircular = false,
    loopCount = 1,
    currentPropType = null,
    onBpmChange = () => {},
    onToggleBlue = () => {},
    onToggleRed = () => {},
    onLoopCountChange = () => {},
  }: {
    isOpen: boolean;
    bpm: number;
    blueMotionVisible?: boolean;
    redMotionVisible?: boolean;
    isCircular?: boolean;
    loopCount?: number;
    currentPropType?: PropType | string | null;
    onBpmChange?: (bpm: number) => void;
    onToggleBlue?: () => void;
    onToggleRed?: () => void;
    onLoopCountChange?: (count: number) => void;
  } = $props();
</script>

<Drawer
  bind:isOpen
  placement="right"
  respectLayoutMode={true}
  closeOnBackdrop={true}
  closeOnEscape={true}
  ariaLabel="Animation Settings"
  showHandle={true}
  class="settings-sheet"
>
  <div class="sheet-content">
    <header class="sheet-header">
      <h3 class="sheet-title">Animation Settings</h3>
      <button
        class="sheet-close-btn"
        onclick={() => (isOpen = false)}
        aria-label="Close"
        type="button"
      >
        <i class="fas fa-times"></i>
      </button>
    </header>
    <div class="sheet-body">
      <AnimationSettingsContent
        bind:bpm
        {blueMotionVisible}
        {redMotionVisible}
        {isCircular}
        {loopCount}
        {currentPropType}
        {onBpmChange}
        {onToggleBlue}
        {onToggleRed}
        {onLoopCountChange}
      />
    </div>
  </div>
</Drawer>

<style>
  /* Sheet Styles */
  :global(.settings-sheet) {
    --sheet-width: min(320px, 85vw);
  }

  /* Position settings sheet to not overlap bottom navigation */
  :global(.drawer-content.settings-sheet) {
    /* Leave space for bottom navigation (64px + safe area) */
    bottom: calc(64px + env(safe-area-inset-bottom, 0px)) !important;
    /* Limit height to available space */
    max-height: calc(
      100dvh - 64px - env(safe-area-inset-bottom, 0px)
    ) !important;
    /* Rounded bottom corners since it's not touching bottom of screen */
    border-radius: 16px 0 0 16px !important;
  }

  .sheet-content {
    display: flex;
    flex-direction: column;
    padding: 20px;
    padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
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
    gap: 24px;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
  }
</style>
