<!-- Empty State Component -->
<script lang="ts">
  interface Props {
    title?: string;
    message?: string;
  }

  let {
    title = "🎯 Select a Sequence",
    message = 'Click on a thumbnail to extract and analyze its metadata, or use "Batch Analyze" to analyze all sequences',
  }: Props = $props();
</script>

<div class="empty-state">
  <h3>{title}</h3>
  <p>{message}</p>
</div>

<style>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    text-align: center;
  }

  .empty-state h3 {
    margin: 0 0 15px 0;
    color: #22c55e;
    font-size: 1.25rem;
  }

  .empty-state p {
    margin: 8px 0 0 0;
    color: #9ca3af;
  }
</style>
