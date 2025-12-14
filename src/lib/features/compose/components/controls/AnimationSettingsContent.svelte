<!--
  AnimationSettingsContent.svelte

  Content for the animation settings sheet/drawer.
  Consolidates all animation configuration options:
  - Motion visibility toggles
  - Speed (BPM) controls
  - Trail presets
  - Loop count (when applicable)
-->
<script lang="ts">
  import BpmChips from "./BpmChips.svelte";
  import SimpleTrailControls from "../trail/SimpleTrailControls.svelte";
  import LoopCountControls from "./LoopCountControls.svelte";
  import type { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";

  let {
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

<div class="settings-content">
  <!-- Motion Visibility -->
  <section class="settings-section">
    <h4 class="settings-section-title">Motion Visibility</h4>
    <div class="visibility-toggles">
      <button
        class="visibility-toggle blue"
        class:active={blueMotionVisible}
        onclick={onToggleBlue}
        type="button"
      >
        <i
          class="fas {blueMotionVisible ? 'fa-eye' : 'fa-eye-slash'}"
          aria-hidden="true"
        ></i>
        <span>Blue</span>
      </button>
      <button
        class="visibility-toggle red"
        class:active={redMotionVisible}
        onclick={onToggleRed}
        type="button"
      >
        <i
          class="fas {redMotionVisible ? 'fa-eye' : 'fa-eye-slash'}"
          aria-hidden="true"
        ></i>
        <span>Red</span>
      </button>
    </div>
  </section>

  <!-- Speed -->
  <section class="settings-section">
    <h4 class="settings-section-title">Speed</h4>
    <BpmChips bind:bpm min={15} max={180} step={1} {onBpmChange} />
  </section>

  <!-- Trails -->
  <section class="settings-section">
    <h4 class="settings-section-title">Trails</h4>
    <SimpleTrailControls propType={currentPropType} />
  </section>

  <!-- Export Settings - Loop Count -->
  <LoopCountControls {isCircular} {loopCount} {onLoopCountChange} />
</div>

<style>
  .settings-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* Settings sections */
  .settings-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .settings-section-title {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0;
  }

  /* Visibility toggles */
  .visibility-toggles {
    display: flex;
    gap: 8px;
  }

  .visibility-toggle {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 48px;
    padding: 10px 14px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .visibility-toggle.blue.active {
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.2) 0%,
      rgba(37, 99, 235, 0.15) 100%
    );
    border-color: rgba(59, 130, 246, 0.4);
    color: rgba(191, 219, 254, 1);
  }

  .visibility-toggle.red.active {
    background: linear-gradient(
      135deg,
      rgba(239, 68, 68, 0.2) 0%,
      rgba(220, 38, 38, 0.15) 100%
    );
    border-color: rgba(239, 68, 68, 0.4);
    color: rgba(254, 202, 202, 1);
  }

  .visibility-toggle:active {
    transform: scale(0.97);
  }
</style>
