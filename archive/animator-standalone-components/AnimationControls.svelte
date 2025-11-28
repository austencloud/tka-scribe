<script lang="ts">
  import { onMount } from "svelte";
  import type { IHapticFeedbackService } from "../../src/lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "../../src/lib/shared/inversify/container";
  import { TYPES } from "../../src/lib/shared/inversify/types";

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
  let hapticService: IHapticFeedbackService | null = null;

  onMount(async () => {
    try {
      hapticService = await resolve<IHapticFeedbackService>(
        TYPES.IHapticFeedbackService
      );
    } catch (error) {
      console.error("Failed to resolve haptic service", error);
      hapticService = null;
    }
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
