<!--
  LoopButton.svelte

  Loop toggle button component for playback controls.
  Toggles loop/repeat mode for animations.
-->
<script lang="ts">
  import ControlButton from "./ControlButton.svelte";

  let {
    isLooping = $bindable(false),
    onToggle,
    activeColor = "orange",
    size = "default",
  }: {
    isLooping: boolean;
    onToggle?: (looping: boolean) => void;
    activeColor?: "orange" | "cyan" | "purple";
    size?: "default" | "small";
  } = $props();

  function handleClick() {
    isLooping = !isLooping;
    onToggle?.(isLooping);
  }
</script>

<ControlButton
  icon="fa-repeat"
  ariaLabel={isLooping ? "Disable loop" : "Enable loop"}
  active={isLooping}
  onclick={handleClick}
  {activeColor}
  {size}
/>
