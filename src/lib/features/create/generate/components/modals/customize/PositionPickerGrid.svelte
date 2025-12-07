<!--
PositionPickerGrid.svelte - Re-exports from shared for backwards compatibility
-->
<script lang="ts">
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
  import { PositionPickerGrid as SharedPositionPickerGrid } from "$lib/shared/components/position-picker";

  let {
    currentPosition = null,
    onPositionChange,
  } = $props<{
    currentPosition: PictographData | null;
    onPositionChange: (position: PictographData | null) => void;
  }>();
</script>

<SharedPositionPickerGrid
  {currentPosition}
  {onPositionChange}
/>
