<!--
CardHeader.svelte - Re-exports from shared for backwards compatibility
-->
<script lang="ts">
  import { CardHeader as SharedCardHeader } from "$lib/shared/components/stepper-card";

  let { title, headerFontSize } = $props<{
    title: string;
    headerFontSize?: string;
  }>();
</script>

<SharedCardHeader {title} {headerFontSize} />
