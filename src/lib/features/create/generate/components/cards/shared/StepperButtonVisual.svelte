<!--
StepperButtonVisual.svelte - Re-exports from shared for backwards compatibility
-->
<script lang="ts">
  import { StepperButtonVisual as SharedStepperButtonVisual } from "$lib/shared/components/stepper-card";

  let { type } = $props<{
    type: "increment" | "decrement";
  }>();
</script>

<SharedStepperButtonVisual {type} />
