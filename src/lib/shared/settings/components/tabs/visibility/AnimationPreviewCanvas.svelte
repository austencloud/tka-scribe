<!--
  AnimationPreviewCanvas.svelte

  Pure rendering component for animation preview.
  No observer pattern - just renders based on props.
  This separation prevents infinite reactive loops.
-->
<script lang="ts">
  import AnimatorCanvas from "$lib/shared/animation-engine/components/AnimatorCanvas.svelte";
  import type { AnimationPanelState } from "$lib/features/compose/state/animation-panel-state.svelte";
  import { animationSettings } from "$lib/shared/animation-engine/state/animation-settings-state.svelte";

  interface Props {
    animationState: AnimationPanelState;
    gridVisible: boolean;
  }

  let { animationState, gridVisible }: Props = $props();

  // Derived: Current beat data for AnimatorCanvas
  let currentBeatData = $derived.by(() => {
    if (!animationState.sequenceData) return null;
    const currentBeat = animationState.currentBeat;
    if (
      currentBeat === 0 &&
      !animationState.isPlaying &&
      animationState.sequenceData.startPosition
    ) {
      return animationState.sequenceData.startPosition;
    }
    if (
      animationState.sequenceData.beats &&
      animationState.sequenceData.beats.length > 0
    ) {
      // currentBeat is 1-based: currentBeat 1.0-2.0 = beat 1's motion (uses beats[0])
      const beatIndex = Math.max(0, Math.floor(currentBeat) - 1);
      const clampedIndex = Math.min(
        beatIndex,
        animationState.sequenceData.beats.length - 1
      );
      return animationState.sequenceData.beats[clampedIndex] || null;
    }
    return null;
  });

  // Derived: Current letter
  let currentLetter = $derived(currentBeatData?.letter || null);
</script>

<AnimatorCanvas
  blueProp={animationState.bluePropState}
  redProp={animationState.redPropState}
  {gridVisible}
  gridMode={animationState.sequenceData?.gridMode ?? null}
  letter={currentLetter}
  beatData={currentBeatData}
  currentBeat={animationState.currentBeat}
  sequenceData={animationState.sequenceData}
  isPlaying={animationState.isPlaying}
  trailSettings={animationSettings.trail}
/>
