<!--
  LibrarySection.svelte - Library view for user's saved sequences

  This is a wrapper around the SequencesView component from the library module
-->
<script lang="ts">
  import SequencesView from "../../library/components/SequencesView.svelte";
</script>

<div class="library-section">
  <SequencesView />
</div>

<style>
  .library-section {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
</style>
