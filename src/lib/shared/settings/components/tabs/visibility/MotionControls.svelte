<!--
  MotionControls.svelte - Motion Visibility Controls

  Controls for toggling Red and Blue motion visibility.
  Enforces the constraint that at least one motion must remain visible.
-->
<script lang="ts">
  import ToggleRow from "./ToggleRow.svelte";

  interface Props {
    redMotionVisible: boolean;
    blueMotionVisible: boolean;
    onToggleRed: () => void;
    onToggleBlue: () => void;
  }

  let {
    redMotionVisible,
    blueMotionVisible,
    onToggleRed,
    onToggleBlue,
  }: Props = $props();
</script>

<div class="motion-controls">
  <h4 class="group-title">Motion Visibility</h4>
  <p class="group-note">At least one motion must remain visible</p>

  <ToggleRow
    label="Red Motion"
    checked={redMotionVisible}
    onChange={onToggleRed}
    ariaLabel="Toggle red motion visibility"
  />

  <ToggleRow
    label="Blue Motion"
    checked={blueMotionVisible}
    onChange={onToggleBlue}
    ariaLabel="Toggle blue motion visibility"
  />
</div>

<style>
  .motion-controls {
    background: color-mix(
      in srgb,
      var(--semantic-info, var(--semantic-info)) 8%,
      transparent
    );
    border: 1px solid
      color-mix(
        in srgb,
        var(--semantic-info, var(--semantic-info)) 20%,
        transparent
      );
    border-radius: 10px;
    padding: 16px;
  }

  .group-title {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--theme-text);
    margin: 0 0 8px 0;
  }

  .group-note {
    font-size: var(--font-size-compact);
    color: var(--theme-text-dim, var(--theme-text-dim));
    font-style: italic;
    margin: 0 0 12px 0;
  }

  /* Accessibility */
  @media (prefers-contrast: high) {
    .motion-controls {
      border-width: 2px;
      border-color: color-mix(
        in srgb,
        var(--semantic-info, var(--semantic-info)) 40%,
        transparent
      );
    }
  }
</style>
