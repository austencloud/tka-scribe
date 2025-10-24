<!--
Sequence Info Component

Displays sequence name and author information.
-->
<script lang="ts">
  // Props
  const { sequenceData = null } = $props<{
    sequenceData?: any;
  }>();
</script>

{#if sequenceData}
  <div class="sequence-info">
    <!-- Sequence info content to be added -->
  </div>
{/if}

<!-- Styles removed - component not yet implemented -->
