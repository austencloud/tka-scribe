<!--
  StopButton.svelte

  Stop button component for playback controls.
  Stops the current animation/playback.
-->
<script lang="ts">
  import ControlButton from "./ControlButton.svelte";

  let {
    onclick,
    size = "default",
  }: {
    onclick?: () => void;
    size?: "default" | "small";
  } = $props();
</script>

<ControlButton icon="fa-stop" ariaLabel="Stop" {onclick} {size} />
