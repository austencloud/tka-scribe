<!--
Animation Controls Component

Contains play/pause/stop buttons, speed control, and beat info.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";

  // Props
  const {
    isPlaying = false,
    speed = 1.0,
    currentBeat = 0,
    totalBeats = 0,
    onPlay = () => {},
    onStop = () => {},
    onSpeedChange = (value: number) => {},
  }: {
    isPlaying?: boolean;
    speed?: number;
    currentBeat?: number;
    totalBeats?: number;
    onPlay?: () => void;
    onStop?: () => void;
    onSpeedChange?: (value: number) => void;
  } = $props();

  // Services
  let hapticService: IHapticFeedbackService;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  function handlePlay() {
    // Trigger selection haptic feedback for play/pause
    hapticService?.trigger("selection");
    onPlay();
  }

  function handleStop() {
    // Trigger selection haptic feedback for stop
    hapticService?.trigger("selection");
    onStop();
  }

  function handleSpeedInput(event: Event) {
    const target = event.target as HTMLInputElement;
    // Trigger subtle selection haptic feedback for speed changes
    hapticService?.trigger("selection");
    onSpeedChange(parseFloat(target.value));
  }
</script>

<!-- Template markup to be added when component is implemented -->
