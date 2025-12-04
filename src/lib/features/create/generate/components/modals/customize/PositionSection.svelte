<!--
PositionSection.svelte - Re-exports from shared for backwards compatibility
-->
<script lang="ts">
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
  import { PositionSection as SharedPositionSection } from "$lib/shared/components/position-picker";

  let {
    title,
    description,
    currentPosition,
    onPositionChange
  } = $props<{
    title: string;
    description: string;
    currentPosition: PictographData | null;
    onPositionChange: (position: PictographData | null) => void;
  }>();
</script>

<SharedPositionSection
  {title}
  {description}
  {currentPosition}
  {onPositionChange}
/>
